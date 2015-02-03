import json
import re
import datetime

import dateutil.parser

import ambrosia
from ambrosia.plugins import PluginInfoTop
from ambrosia.util import get_logger, join_command
from ambrosia import model, Correlator
from ambrosia.context import AmbrosiaContext
from ambrosia.model.entities import Task, File
from ambrosia_plugins.events import ANANASEvent
from ambrosia_plugins.lkm.events import SyscallEvent, CommandExecuteEvent, FileDescriptorEvent, FileEvent, \
    SocketEvent, SocketAccept, MemoryMapEvent, StartTaskEvent, SuperUserRequest, CreateDir, SendSignal, \
    DeleteFileEvent, ExecEvent, ANANASAdbShellExec, AnonymousFileEvent, UnknownFdEvent, LibraryLoad

__author__ = 'Wolfgang Ettlinger'


class PluginInfo(PluginInfoTop):
    @staticmethod
    def correlators():
        return [
            (SyscallCorrelator, 10),  # basic correlation
            (FileEventCorrelator, 20),  # classifies file events
            (CommandExecuteCorrelator, 30),  # finds command executions
            (AdbCommandCorrelator, 40)  # correlates command executions with adb commands
        ]

    @staticmethod
    def parsers():
        return [LkmPluginParser]


class LkmPluginParser(ambrosia.ResultParser):
    """Parses the *process* and *syscalltrace* elements of the result set.
    """
    def __init__(self):
        super(LkmPluginParser, self).__init__()
        self.processes = {}
        self.log = get_logger(self)

    def parse(self, name, el, context):
        """Does the acutual parsing.

        * *process* elment: All processes reported by the LKM/ANANAS are parsed and
          :class:`ambrosia_web.model.entities.Task` entities are created. Moreover, the attributes
          * *ananas_id* (id in the ANANAS db)
          * *parent_id* (the ANANAS db id of the parent task)
          * *comm* (description of the process in thekernel)
          * *path* (of the executable)
          * *type* (the type of the task ANANAS figured out)
          * *fds* (a dict of all file descriptors and the path during LKM load)
          * *tdgid* (the PID of the task group leader)
          * *tg_leader_id* (The ANANAS db id of the thread group leader)
        * *syscalltrace* element: A :class:`ambrosia_plugins.lkm.events.SyscallEvent` event is create for each syscall
          using all the information ANANAS provides. Moreover the :class:`ambrosia_web.clocks.ClockSyncer`.translate_table
          attribute is filled. ANANAS records two timestamps for each syscall. There is a *normal* timestamp (which is
          the system time when the syscall returned) and the *monotonic* timestamp (which is the time that passed since
          the system booted). When the system clock is not changed, the *monotonic* and the *normal* clock are in sync
          (e.g. if 10 seconds pass on one clock 10 seconds pass on the other clock). Therefore the *normal* clock is
          ahead of the *monotonic* clock (a constant offset = the time the emulator booted). By calculating the
          *normal* clock minus the *monotonic* clock we always get this offset. When this offset changes, the system
          clock has been altered.

          This algorithm is implemented using the following variables:
           * boot_time: the actual time the emulator is booted (calculated *normal* - *monotonic* time on the first
             syscall = when emulator time and host time are still in sync)
           * error: how much the expected offset (boot_time) is off from the acutal offset (*normal* - *monotonic*).
             This is also the error of the emulator clock (compared to the host clock)
           * adjtime: the adjusted time (the captured *normal* time - error).
           * lasterror: the error of the last syscall. If the error of two consecutive syscall changes, we know that
             the system clock has been altered (and we need to make an entry in
             :class:`ambrosia_web.clocks.ClockSyncer`.translate_table). The comparison sees two errors that are at a maximum
             of 1 second apart as a clock change. This is because the error is not absolutely precise (the *monotonic*
             and *normal* timestamps are not captured at exactly the same time, even a context switch may happen in
             between).

        """
        assert isinstance(context, AmbrosiaContext)
        analysis = context.analysis
        if name == 'processes':
            self.log.info('Parsing process-tag')
            for p in el:
                props = p.attrib.copy().items()
                props += p.find('info').attrib.items()
                props = dict(props)

                start = end = None

                if 'start' in props:
                    start = dateutil.parser.parse(props['start'])

                if 'end' in props:
                    end = dateutil.parser.parse(props['end'])

                props['fds'] = {}
                for fdel in p.findall('fds/fd'):
                    props['fds'][int(fdel.attrib['number'])] = fdel.attrib['path']

                proc = analysis.get_entity(context,
                                           Task,
                                           int(props['pid']),
                                           start,
                                           end)

                proc.ananas_id = int(props['id'])
                proc.parent_id = int(props['parentId'])
                proc.comm = json.loads(props['comm'])
                # TODO fix double-json in ANANAS
                proc.path = json.loads(json.loads(props['path']))
                proc.type = props['type']
                proc.fds = props['fds']
                proc.tgid = int(props['tgid'])

                try:
                    proc.tg_leader_id = int(props['threadgroup-leader'])
                except ValueError:
                    # tg-leader is None
                    pass

                try:
                    proc.uid = int(props['uid'])
                except ValueError:
                    # uid is 'None'
                    pass

                self.processes[proc.ananas_id] = proc

        elif name == 'syscalltrace':
            self.log.info('Parsing syscalltrace-tag')
            boot_time = None
            lasterror = None

            idx = 1
            for sc in el:
                props = sc.attrib.copy().items()
                props += sc.find('info').attrib.items()
                props = dict(props)
                
                props['returnval'] = int(sc.find('return').text)
                props['processid'] = int(props['processid'])

                params = []
                for param in sc.findall('param'):
                    params.append(param.text)
                
                time = dateutil.parser.parse(props['time'])
                
                props['params'] = params

                infos = sc.findall('addinfo')

                props['add_info'] = {}

                for info in infos:
                    info_name = info.attrib['name']

                    if info_name not in props['add_info']:
                        props['add_info'][info_name] = []

                    props['add_info'][info_name].append(info.text)

                spawned_child = None
                if 'child_id' in props:
                    spawned_child = self.processes[int(props['child_id'])]

                mt = float(props['monotonic_time'])

                # calculate boot_time on first syscall
                if boot_time is None:
                    boot_time = time - datetime.timedelta(0, mt)

                error = time - datetime.timedelta(0, mt) - boot_time
                adjtime = time - error

                if lasterror is None or _timedelta_diff(lasterror, error) > datetime.timedelta(0, 1):
                    # add 1 for safety to definitely get all events
                    offset = datetime.timedelta(0, 1)
                    context.clock_syncer.translate_table.append((time - offset, error))

                lasterror = error

                syscall_event = SyscallEvent(context,
                                             props,
                                             adjtime,
                                             mt,
                                             self.processes[props['processid']],
                                             idx,
                                             spawned_child)

                idx += 1

                analysis.add_event(syscall_event)

    def finish(self, context):
        """Calculate additional information for each process.

        This method is executed after all processes have been parsed. This allows to reliably reference other processes
        (E.g. when the first process is being parsed no other proccess is known, therefore no other process can be
        referenced). The method sets the tg_leader and the parent. Moreover, it copies the reference to *fds* from the
        parent for all threads (in linux a thread *normally* shares FDs with its thread group leader).
        """
        for ananas_id, proc in self.processes.iteritems():
            assert isinstance(proc, Task)

            if proc.parent_id != -1:
                proc.parent = self.processes[proc.parent_id]
                proc.tg_leader = self.processes[proc.tg_leader_id]

                if not proc.is_process:
                    # threads do not heave any files
                    assert len(proc.fds) == 0
                    proc.fds = proc.tg_leader.fds
                else:
                    if len(proc.fds) == 0 and proc.type != 'KERNEL' and not proc.start_captured:
                        # non-kernel processes with no FDs but that existed
                        # during fd-listing are strange
                        self.log.warn("Process {} does not have any FDs".format(proc))

        for ananas_id, proc in self.processes.iteritems():
            assert proc.tg_leader is None or proc.tg_leader.is_process


def _timedelta_diff(td1, td2):
    assert isinstance(td1, datetime.timedelta)
    assert isinstance(td2, datetime.timedelta)

    if td1 < td2:
        return td2 - td1
    else:
        return td1 - td2


class SyscallCorrelator(ambrosia.Correlator):
    """Wraps primitive events into higher-level events
    """
    def __init__(self, context):
        assert isinstance(context, AmbrosiaContext)
        super(SyscallCorrelator, self).__init__(context)
        self.fd_directory = {}
        self._generate_start_fd_directory()

    def _generate_start_fd_directory(self):
        """Generates the initial fd directory.

        Before the correlation is started the fd directory is filed with file descriptor events of processes that
        existed before the LKM was loaded.
        """
        for proc in self.context.analysis.iter_entities(self.context, Task):
            assert isinstance(proc, Task)

            if proc.start_captured:
                # process did not exist on lkm load -> no fd listing available
                continue

            fds = {}
            for fd, path in proc.fds.iteritems():
                if path.startswith('socket:'):
                    new_event = SocketEvent(proc, True)
                elif path.startswith('anon_inode:') or path.startswith('pipe:'):
                    new_event = AnonymousFileEvent(path, proc, self.context)
                elif path.startswith('/'):
                    if path.endswith(' (deleted)'):
                        # kernel appends ' (deleted)' for deleted files
                        path = path[0:-10]

                    new_event = FileEvent(
                        self.context.analysis.get_entity(
                            self.context,
                            File,
                            path),
                        None,
                        None,
                        proc,
                        True)
                else:
                    self.log.warn('Unknown path: "{}"'.format(path))
                    continue

                fds[fd] = new_event

            self.fd_directory[proc] = fds

    def _get_fd_event(self, fd, process, success, clazz=None, default_start_ts=None):
        """Get an fd event from the a fd directory entry.

        The fd directory (`fd_directory`) is a dict in the form of

        .. code-block:: python

            {
                pid: {
                    fd_number: fd_event,
                    ...
                },
                ...
            }

        The fd directory represents all file descriptors of the emulator **at a specific point in time**. This means
        that the fd directory is constantly changed as syscalls are being processed (e.g. open() creates an entry, close
        removes an entry).

        If (for some reason) the fd is not found, this method returns an
        :class:`ambrosia_plugins.lkm.events.UnknownFdEvent`.

        Note:
            One value of the fd dictionary dict may be stored under multiple pid keys since tasks (especially threads)
            may share file descriptors.

        Args:
            fd (int): the file descriptor number we are searching for
            process (ambrosia_web.model.entities.Task): the task the fd belongs to
            clazz (class): (optional) only return an event of this type
            default_start_ts (datetime.datetime): if this fd is unknown, return an event with this start timestamp

        """
        assert isinstance(process, Task)

        proc_fds = self.fd_directory[process]

        if fd not in proc_fds:
            if success:
                self.log.warn("operation on unknown fd, process {}, fd".format(process, fd))

            fdevt = UnknownFdEvent(process, fd)
            if default_start_ts is not None:
                fdevt.start_ts = default_start_ts
            proc_fds[fd] = fdevt
            self.to_add.add(fdevt)

        res = proc_fds[fd]

        if clazz is not None:
            if not isinstance(res, clazz):
                return

        return res

    def _get_del_fd_event(self, fd, process, success, clazz=None):
        """Gets an fd event from the fd directory and deletes it.

        Args:
            fd (int): the file descriptor number we are searching for
            process (ambrosia_web.model.entities.Task): the task the fd belongs to
            clazz (class): (optional) only return an event of this type
            process (ambrosia_web.model.entities.Task): the task the fd belongs to
        """
        proc_fds = self.fd_directory[process]
        evt = self._get_fd_event(fd, process, success, clazz)

        if evt is None:
            return

        del proc_fds[fd]

        return evt

    def _get_dup(self, evt, oldfd, newfd, process):
        """Duplicate an fd (dup and dup2 syscalls)

        Args:
            evt (ambrosia_web.model.Event): the dup syscall event
            oldfd (int): the old file descriptor number
            newfd (int): the new file descriptor number

        """
        assert isinstance(evt, model.Event)

        proc_fds = self.fd_directory[process]

        success = evt.returnval >= 0

        if oldfd not in proc_fds:
            if success:
                self.log.warn("dup on an unknown fd, process {}, fd".format(process, oldfd))

            fdevt = UnknownFdEvent(process, oldfd)
            proc_fds[oldfd] = fdevt
            self.to_add.add(fdevt)

        fevt = proc_fds[oldfd]

        if success:
            proc_fds[newfd] = fevt

        return fevt

    def correlate(self):
        self.log.info('Generating events from syscalls')
        for evt in self.context.analysis.iter_events(self.context, cls=SyscallEvent, key='index'):
            self._check_syscall(evt)

        self.update_tree()

    def _check_syscall(self, evt):
        """Wraps a single syscall event into a higher-level event

        Args:
            evt (ambrosia_plugins.lkm.events.SyscallEvent): the syscall event
        """
        assert isinstance(evt, SyscallEvent)

        proc = evt.process
        parent_evt = None

        assert isinstance(proc, Task)

        if proc not in self.fd_directory:
            assert proc.start_captured

            if proc.tg_leader in self.fd_directory:
                # threadgroup is known -> fds are inherited
                self.fd_directory[proc] = self.fd_directory[proc.tg_leader]
            elif proc.is_process and proc.parent in self.fd_directory:
                # its a new process and parent is known -> copy fd table
                self.fd_directory[proc] = self.fd_directory[proc.parent].copy()
            else:
                self.log.warn("task without known threadgroup or parent: {}".format(proc))
                self.fd_directory[proc] = {}

        proc_fds = self.fd_directory[proc]

        if evt.name == "open" or evt.name == "creat":
            if evt.name == "creat":
                flags = 0
                mode = int(evt.params[1])
            else:
                flags = int(evt.params[1])
                mode = int(evt.params[2])

            parent_evt = FileEvent(
                self.context.analysis.get_entity(
                    self.context,
                    File,
                    evt.params[0]),
                flags,
                mode,
                proc,
                evt.returnval >= 0)

            if parent_evt.successful:
                proc_fds[evt.returnval] = parent_evt

            self.to_add.add(parent_evt)
        elif evt.name == "epoll_create" or evt.name == "epoll_create1":
            parent_evt = AnonymousFileEvent("epoll", proc, self.context, evt.returnval >= 0)

            if parent_evt.successful:
                proc_fds[evt.returnval] = parent_evt

            self.to_add.add(parent_evt)
        elif evt.name == "socket":
            parent_evt = SocketEvent(
                proc,
                evt.returnval >= 0)

            if parent_evt.successful:
                proc_fds[evt.returnval] = parent_evt

            self.to_add.add(parent_evt)
        elif evt.name == "pipe" or evt.name == "pipe2":
            fd1 = int(evt.params[0])
            fd2 = int(evt.params[1])

            parent_evt = AnonymousFileEvent('pipe', proc, self.context, evt.returnval >= 0 and fd1 >= 0 and fd2 >= 0)

            if parent_evt.successful:
                proc_fds[fd1] = parent_evt
                proc_fds[fd2] = parent_evt

            self.to_add.add(parent_evt)
        elif evt.name == "accept":

            parent_evt = SocketAccept(
                proc,
                evt.returnval >= 0)

            mainsocket = self._get_fd_event(int(evt.params[0]), proc, parent_evt.successful)

            if parent_evt.successful:
                proc_fds[evt.returnval] = parent_evt

            mainsocket.add_child(parent_evt)
            self.to_add.add(mainsocket)
        elif evt.name == "connect":
            parent_evt = self._get_fd_event(int(evt.params[0]), proc, evt.returnval >= 0)
        elif evt.name == "read" or \
                evt.name == "write" or \
                evt.name == "sendto" or \
                evt.name == "sendmsg" or \
                evt.name == "recvfrom" or \
                evt.name == "recvmsg":

            parent_evt = self._get_fd_event(int(evt.params[0]), proc, evt.returnval >= 0)

        elif evt.name == "close":
            parent_evt = self._get_del_fd_event(int(evt.params[0]), proc, evt.returnval >= 0)
        elif evt.name == "dup":
            parent_evt = self._get_dup(evt, int(evt.params[0]), evt.returnval, proc)
        elif evt.name == "dup2":
            parent_evt = self._get_dup(evt, int(evt.params[0]), int(evt.params[1]), proc)
        elif evt.name == "mmap2":
            fd = int(evt.params[4])
            flags = int(evt.params[3])
            address = int(evt.returnval)

            parent_evt = MemoryMapEvent(flags, fd, address, proc, evt.returnval, evt.end_ts, evt.end_ts)

            if 'MAP_ANONYMOUS' not in parent_evt.flags:
                fdevt = self._get_fd_event(fd, proc, parent_evt.successful, FileDescriptorEvent, evt.start_ts)
                fdevt.add_child(parent_evt)
            else:
                self.to_add.add(parent_evt)

        elif evt.name == "clone" or evt.name == "fork" or evt.name == "vfork":
            if evt.returnval < 0:
                return

            pid = evt.returnval
            if pid < 0:
                pid = None

            assert evt.spawned_child.start_captured

            parent_evt = StartTaskEvent(evt.end_ts, evt.end_ts, proc, pid, evt.spawned_child)
            self.to_add.add(parent_evt)
        elif evt.name == "execve":
            parent_evt = ExecEvent(evt.start_ts, evt.end_ts, evt.params[0], evt.argv, evt.env, proc)
            self.to_add.add(parent_evt)
        elif evt.name == "unlink":
            parent_evt = DeleteFileEvent(evt.start_ts,
                                         evt.end_ts,
                                         evt.returnval >= 0,
                                         self.context.analysis.get_entity(
                                             self.context,
                                             File,
                                             evt.params[0]),
                                         proc)
            self.to_add.add(parent_evt)
        elif evt.name == "mkdir":
            parent_evt = CreateDir(evt.start_ts,
                                   evt.end_ts,
                                   proc,
                                   self.context.analysis.get_entity(
                                       self.context,
                                       File,
                                       evt.params[0]))
            self.to_add.add(parent_evt)
        elif evt.name == "kill":
            parent_evt = SendSignal(evt.start_ts,
                                    evt.end_ts,
                                    int(evt.params[1]),
                                    proc,
                                    self.context.analysis.get_entity(
                                        self.context,
                                        Task,
                                        int(evt.params[0]),
                                        evt.start_ts,
                                        evt.end_ts))
            self.to_add.add(parent_evt)

        if parent_evt is not None:
            assert isinstance(parent_evt, model.Event)
            parent_evt.add_child(evt)
            self.to_remove.add(evt)


class FileEventCorrelator(Correlator):
    """
    Finds library load events (mmap to \*.so files)
    """
    def correlate(self):
        for fe in self.context.analysis.iter_events(self.context, FileEvent):
            if re.match('^/vendor/lib/.+\.so', fe.abspath) or re.match('^/system/lib/.+\.so', fe.abspath):

                lle = None

                if not fe.successful:
                    # failed library load
                    lle = LibraryLoad(fe.file, fe.process, False)

                if lle is None:
                    for c in fe.children:
                        if isinstance(c, MemoryMapEvent):
                            lle = LibraryLoad(fe.file, fe.process, True)
                            break

                if lle is not None:
                    lle.add_child(fe)
                    self.to_add.add(lle)
                    self.to_remove.add(fe)

        self.update_tree()


class CommandExecuteCorrelator(Correlator):
    """Finds events that form the execution of a command.

    * :class:`ambrosia_plugins.lkm.events.StartTaskEvent`: indicate the creation of a new process
    * :class:`ambrosia_plugins.lkm.events.ExecEvent`: commands are started using a fork-and-exec
    * :class:`ambrosia_plugins.lkm.events.LibraryLoad`: shortly after a fork indicates that a library is loaded that
        is essential to run the command.
    * :class:`ambrosia_plugins.lkm.events.FileEvent`: several file events happen at the begin of a command execution

    """
    def correlate(self):
        self.log.info('Searching for command executions')
        for fork in self.context.analysis.iter_events(self.context, StartTaskEvent):
            exec_ = None
            mintimediff = None
            execs_to_add = set()

            exes = list(self.context.analysis.iter_events(self.context, ExecEvent, 'process_entity',
                                                          value=fork.spawned_child))

            for exe in exes:
                assert isinstance(exe, ExecEvent)
                timediff = exe.end_ts - fork.end_ts

                if mintimediff is None or timediff < mintimediff:
                    mintimediff = timediff
                    exec_ = exe

            if exec_ is not None and mintimediff < datetime.timedelta(0, 0, 0, 1000):
                # a fork-and-exec should not take longer then 1000ms
                # find additional execs: search whole $PATH for actual executeable
                lastexe = exec_
                for exe in exes:
                    timediff = exe.end_ts - exec_.end_ts

                    if timediff < datetime.timedelta(0, 0, 0, 500):
                        execs_to_add.add(exe)

                        if exe.end_ts > lastexe.end_ts:
                            lastexe = exe

                # we use the argv of the first execve. e.g. sh -c 'xxx' instead of xxx
                cmd_evt = CommandExecuteEvent(lastexe.path, exec_.argv, fork.spawned_child)
                cmd_evt.add_child(fork)

                for e in execs_to_add:
                    cmd_evt.add_child(e)
                    self.to_remove.add(e)

                if cmd_evt.path == '/system/xbin/su':
                    su_evt = SuperUserRequest(cmd_evt.start_ts, cmd_evt.end_ts, cmd_evt.process)
                    su_evt.add_child(cmd_evt)
                    self.to_add.add(su_evt)
                else:
                    self.to_add.add(cmd_evt)
            else:
                continue

            for fe in self.context.analysis.iter_events(self.context, FileEvent, 'process',
                                                        value=fork.spawned_child):
                assert isinstance(fe, FileEvent)

                if (fe.start_ts - fork.start_ts) > datetime.timedelta(0, 2):
                    # we consider everything within 2 seconds as startup
                    continue

                if fe.successful:
                    if fe.abspath == '/proc/mounts' or \
                            fe.abspath == '/proc/filesystems' or \
                            fe.abspath == '/' or \
                            re.match('/acct/uid/\d+/tasks', fe.abspath) or \
                            fe.abspath == '/proc/'+str(fork.spawned_child.pid)+'/oom_adj':
                        # startup stuff
                        cmd_evt.add_child(fe)
                        self.to_remove.add(fe)

            for lle in self.context.analysis.iter_events(self.context, LibraryLoad, 'process',
                                                         value=fork.spawned_child):

                if (lle.start_ts - fork.start_ts) > datetime.timedelta(0, 2):
                    # we consider everything within 2 seconds as startup
                    continue

                cmd_evt.add_child(lle)
                self.to_remove.add(lle)

        self.update_tree()


class AdbCommandCorrelator(Correlator):
    """Find command executions that happen because of ANANAS (through ADB)
    """
    def correlate(self):
        self.log.info('Correlating ADB commands with command executions')

        found_matches = {}

        for cmd_evt in self.context.analysis.iter_events(self.context, CommandExecuteEvent):
            if ['/system/bin/sh', '-c'] != cmd_evt.command[:2]:
                # adb commands are started using /system/bin/sh
                continue

            if cmd_evt.process.type != 'ADBD_CHILD':
                continue

            cmd_str = cmd_evt.command[2]

            for adb_cmd in self.context.analysis.iter_events(self.context, ANANASEvent, 'start_ts',
                                                             min_value=cmd_evt.start_ts - datetime.timedelta(0, 1)):
                if adb_cmd.name != 'adb_cmd':
                    continue

                if adb_cmd in found_matches:
                        continue

                if 'shell' in adb_cmd.params:
                    idx = adb_cmd.params.index('shell')
                    cmd = adb_cmd.params[idx+1:]

                    if len(cmd) > 1:
                        cmd = join_command(cmd)
                    else:
                        cmd = cmd[0]

                    if cmd == cmd_str:
                        found_matches[adb_cmd] = cmd_evt
                        break

        for adb_cmd, cmd_evt in found_matches.iteritems():
            self.to_remove.add(adb_cmd)
            self.to_remove.add(cmd_evt)

            ase = ANANASAdbShellExec()
            ase.add_child(adb_cmd)
            ase.add_child(cmd_evt)

            self.to_add.add(ase)

        self.update_tree()