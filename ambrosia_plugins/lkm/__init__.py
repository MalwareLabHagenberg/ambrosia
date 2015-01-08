import re
import datetime

import dateutil.parser

import ambrosia
from ambrosia import model
from ambrosia.context import AmbrosiaContext
from ambrosia_plugins.events import ANANASEvent
from ambrosia_plugins.lkm.events import SyscallEvent, ProcessEvent, CommandExecuteEvent, FileDescriptorEvent, FileEvent, \
    SocketEvent, SocketAccept, AllocateSegmentEvent, StartThreadEvent, SuperUserRequest, CreateDir, SendSignal, \
    DeleteFileEvent, ExecEvent


class LkmPluginParser(ambrosia.ResultParser):
    def __init__(self):
        super(LkmPluginParser, self).__init__()
        self.processes = {}

    def _timedelta_diff(self, td1, td2):
        assert isinstance(td1, datetime.timedelta)
        assert isinstance(td2, datetime.timedelta)

        if td1 < td2:
            return td2 - td1
        else:
            return td1 - td2

    def parse(self, name, el, context):
        assert isinstance(context, AmbrosiaContext)
        analysis = context.analysis
        if name == 'processes':
            for p in el:
                props = p.attrib.copy().items()
                props += p.find('info').attrib.items()
                props = dict(props)

                start = end = None

                if 'start' in props:
                    start = dateutil.parser.parse(props['start'])

                if 'end' in props:
                    end = dateutil.parser.parse(props['end'])

                proc = analysis.get_entity(context,
                                           model.Process,
                                           int(props['pid']),
                                           start,
                                           end)

                proc.ananas_id = int(props['id'])
                proc.parent_id = int(props['parentId'])
                proc.comm = props['comm']
                proc.path = props['path']
                proc.type = props['type']

                try:
                    proc.uid = int(props['uid'])
                except ValueError:
                    # uid is 'None'
                    pass

                self.processes[proc.ananas_id] = proc

        elif name == 'syscalltrace':
            boot_time = None
            lasterror = None

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

                if boot_time is None:
                    boot_time = time - datetime.timedelta(0, mt)

                error = time - datetime.timedelta(0, mt) - boot_time
                adjtime = time - error

                if lasterror is None or self._timedelta_diff(lasterror, error) > datetime.timedelta(0, 1):
                    # add 1 for safety to definitely get all events
                    offset = datetime.timedelta(0, 1)
                    context.clock_syncer.translate_table.append(([time - offset], error + offset))

                lasterror = error

                syscall_event = SyscallEvent(context,
                                             props,
                                             adjtime,
                                             mt,
                                             self.processes[props['processid']],
                                             spawned_child)
                analysis.add_event(syscall_event)


    def finish(self, context):
        for ananas_id, proc in self.processes.iteritems():
            if proc.parent_id != -1:
                proc.parent = self.processes[proc.parent_id]


class SyscallCorrelator(object):
    def __init__(self, context):
        assert isinstance(context, AmbrosiaContext)
        self.proc_attrs = {}
        self.context = context
        self.to_add = set()
        self.to_remove = set()

    def _get_fd_event(self, evt, fd, proc_attrs, clazz=None):
        assert isinstance(evt, model.Event)

        if fd not in proc_attrs["fd_events"]:
            fdevt = FileDescriptorEvent("unknown", None, True, evt.end_ts, evt.end_ts)
            proc_attrs["fd_events"][fd] = fdevt
            self.to_add.add(fdevt)

        res = proc_attrs["fd_events"][fd]

        if clazz is not None:
            if not isinstance(res, clazz):
                return

        return res

    def _get_del_fd_event(self, evt, fd, proc_attrs, clazz=None):
        assert isinstance(evt, model.Event)
        evt = self._get_fd_event(evt, fd, proc_attrs, clazz)

        if evt is None:
            return

        del proc_attrs["fd_events"][fd]

        return evt

    def _get_dup(self, evt, oldfd, newfd, proc_attrs):
        assert isinstance(evt, model.Event)

        if oldfd not in proc_attrs["fd_events"]:
            fdevt = FileDescriptorEvent("unknown", None, True, evt.end_ts, evt.end_ts)
            proc_attrs["fd_events"][oldfd] = fdevt
            self.to_add.add(fdevt)

        fevt = proc_attrs["fd_events"][oldfd]

        if evt.returnval >= 0:
            proc_attrs["fd_events"][newfd] = fevt

        return fevt

    def _update_tree(self):
        for evt in self.to_remove:
            self.context.analysis.del_event(evt)

        for evt in self.to_add:
            if evt not in self.to_remove:
                self.context.analysis.add_event(evt)

        self.to_add = set()
        self.to_remove = set()


    def correlate(self):
        for evt in self.context.analysis.iter_events(self.context, cls=SyscallEvent):
            self._check_syscall(evt)

        self._update_tree()

        self._find_execs()
        self._update_tree()

        self._find_test()

    def _find_test(self):
        #for cmd in self.context.analysis.iter_events(self.context, CommandExecuteEvent):
        for adb_cmd in self.context.analysis.iter_events(self.context, ANANASEvent, 'name', value='adb_cmd'):
            if 'shell' in adb_cmd.params:
                idx = adb_cmd.params.index('shell')
                cmd = adb_cmd.params[idx+1:]



    def _find_execs(self):
        for fork in self.context.analysis.iter_events(self.context, StartThreadEvent):
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
                
                cmd_evt = CommandExecuteEvent(lastexe.path, ' '.join(lastexe.argv), fork.spawned_child)

                for e in execs_to_add:
                    cmd_evt.children.append(e)
                    self.to_remove.add(e)

                if cmd_evt.path == '/system/xbin/su':
                    su_evt = SuperUserRequest(cmd_evt.start_ts, cmd_evt.end_ts, cmd_evt.process)
                    su_evt.children.append(cmd_evt)
                    self.to_add.add(su_evt)
                else:
                    self.to_add.add(cmd_evt)
            else:
                continue

            for mmap in self.context.analysis.iter_events(self.context, AllocateSegmentEvent, 'process_entity',
                                                          value=fork.spawned_child):
                if mmap.end_ts >= exec_.end_ts and \
                        (mmap.end_ts - exec_.end_ts) < datetime.timedelta(0, 0, 0, 1000):
                    # mmaps within first 1000ms are considered to be initialisation calls
                    cmd_evt.children.append(mmap)
                    self.to_remove.add(mmap)

            for fe in self.context.analysis.iter_events(self.context, FileEvent, 'opening_process',
                                                        value=fork.spawned_child):
                assert isinstance(fe, FileEvent)

                if not fe.successful:
                    if re.match('^/vendor/lib/.+.so', fe.abspath) or re.match('^/system/lib/.+.so', fe.abspath):
                        # unsucessful library loads
                        cmd_evt.children.append(fe)
                        self.to_remove.add(fe)
                else:
                    if fe.abspath == '/proc/mounts' or \
                            fe.abspath == '/proc/filesystems' or \
                            fe.abspath == '/' or \
                            re.match('/acct/uid/\d+/tasks', fe.abspath):
                        # startup stuff
                        cmd_evt.children.append(fe)
                        self.to_remove.add(fe)



    def _check_syscall(self, evt):
        assert isinstance(evt, SyscallEvent)

        proc = evt.process
        parent_evt = None

        assert isinstance(proc, model.Process)

        if proc not in self.proc_attrs:
            if proc.parent in self.proc_attrs:
                # parent is known -> fds are inherited
                self.proc_attrs[proc] = self.proc_attrs[proc.parent].copy()
            else:
                self.proc_attrs[proc] = {
                    "fd_events": {}
                }

        proc_attrs = self.proc_attrs[proc]

        if evt.name == "open" or evt.name == "creat":
            parent_evt = FileEvent(
                self.context.analysis.get_entity(
                    self.context,
                    model.File,
                    evt.params[0]),
                int(evt.params[1]),
                proc,
                evt.returnval >= 0,
                evt.end_ts,
                evt.end_ts
            )

            if parent_evt.successful:
                proc_attrs["fd_events"][evt.returnval] = parent_evt

            self.to_add.add(parent_evt)
        elif evt.name == "socket":
            parent_evt = SocketEvent(
                proc,
                evt.returnval >= 0,
                evt.end_ts,
                evt.end_ts
            )

            if parent_evt.successful:
                proc_attrs["fd_events"][evt.returnval] = parent_evt

            self.to_add.add(parent_evt)
        elif evt.name == "accept":
            mainsocket = self._get_fd_event(evt, int(evt.params[0]), proc_attrs)

            parent_evt = SocketAccept(
                proc,
                evt.returnval >= 0,
                evt.end_ts,
                evt.end_ts
            )

            if parent_evt.successful:
                proc_attrs["fd_events"][evt.returnval] = parent_evt

            mainsocket.children.append(parent_evt)
            self.to_add.add(mainsocket)
        elif evt.name == "connect":
            parent_evt = self._get_fd_event(evt, int(evt.params[0]), proc_attrs)
        elif evt.name == "read" or \
                evt.name == "write" or \
                evt.name == "sendto" or \
                evt.name == "sendmsg" or \
                evt.name == "recvfrom" or \
                evt.name == "recvmsg":

            parent_evt = self._get_fd_event(evt, int(evt.params[0]), proc_attrs)
        elif evt.name == "close":
            parent_evt = self._get_del_fd_event(evt, int(evt.params[0]), proc_attrs)
        elif evt.name == "dup":
            parent_evt = self._get_dup(evt, int(evt.params[0]), evt.returnval, proc_attrs)
        elif evt.name == "dup2":
            parent_evt = self._get_dup(evt, int(evt.params[0]), int(evt.params[1]), proc_attrs)
        elif evt.name == "mmap2":
            fd = int(evt.params[4])
            flags = int(evt.params[3])
            address = int(evt.returnval)

            # TODO check if successfull
            parent_evt = AllocateSegmentEvent(flags, fd, address, proc, True, evt.end_ts, evt.end_ts)
            self.to_add.add(parent_evt)

            if 'MAP_ANONYMOUS' not in parent_evt.flags:
                fdevt = self._get_fd_event(evt, fd, proc_attrs, (FileEvent, FileDescriptorEvent))
                parent_evt.children.append(fdevt)
                if isinstance(fdevt, FileEvent):
                    parent_evt.file_entity = fdevt.file_entity
                self.to_remove.add(fdevt)

        elif evt.name == "clone" or evt.name == "fork" or evt.name == "vfork":
            if evt.returnval < 0:
                return

            pid = evt.returnval
            if pid < 0:
                pid = None

            parent_evt = StartThreadEvent(evt.end_ts, evt.end_ts, proc, pid, evt.spawned_child)
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
                                             model.File,
                                             evt.params[0]))
            self.to_add.add(parent_evt)
        elif evt.name == "mkdir":
            parent_evt = CreateDir(evt.start_ts,
                                   evt.end_ts,
                                   proc,
                                   self.context.analysis.get_entity(
                                       self.context,
                                       model.File,
                                       evt.params[0]))
            self.to_add.add(parent_evt)
        elif evt.name == "kill":
            parent_evt = SendSignal(evt.start_ts,
                                    evt.end_ts,
                                    int(evt.params[1]),
                                    proc,
                                    self.context.analysis.get_entity(
                                        self.context,
                                        model.Process,
                                        int(evt.params[0]),
                                        evt.start_ts,
                                        evt.end_ts))
            self.to_add.add(parent_evt)

        if parent_evt is not None:
            assert isinstance(parent_evt, model.Event)
            parent_evt.children.append(evt)
            self.to_remove.add(evt)