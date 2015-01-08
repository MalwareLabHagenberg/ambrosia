from ambrosia import model, AmbrosiaContext
import ambrosia

__author__ = 'wolfgang'


class SyscallEvent(model.Event):
    indices = {'name'}

    def __init__(self, context, props, time, monotonoc_ts, process_entity, spawned_child=None):
        assert isinstance(context, AmbrosiaContext)
        assert isinstance(process_entity, model.Process)
        super(SyscallEvent, self).__init__(
            props['name'],
            'lkm',
            start_ts=None,
            end_ts=time)

        self.monotonoc_ts = monotonoc_ts
        self.pid = int(props['pid'])
        self.params = props['params']
        self.returnval = props['returnval']
        self.process = process_entity
        self.spawned_child = spawned_child

        add_info = props['add_info']

        if 'execve_argv' in add_info:
            self.argv = add_info['execve_argv']

        if 'execve_envp' in add_info:
            self.env = add_info['execve_envp']


    def get_properties(self):
        return {
            'pid': self.pid,
            'params': self.params,
            'returnval': self.returnval
        }

    def __str__(self):
        return 'Syscall: {} {} by {} result:{}'.format(
            self.name,
            (','.join(self.params)),
            self.process,
            self.returnval)


class ProcessEvent(model.Event):
    indices = {'pid'}

    def __init__(self, pid, start_ts, end_ts, process_entitiy):
        assert isinstance(process_entitiy, model.Process)
        super(ProcessEvent, self).__init__("PID "+str(pid), "lkm", start_ts, end_ts)
        self.pid = pid
        self.process_entity = process_entitiy

    @staticmethod
    def find(context):
        assert isinstance(context, AmbrosiaContext)

        process_events = {}
        associated_syscalls = {}

        for pe in context.analysis.iter_entities(model.Process):
            assert isinstance(pe, model.Process)
            process_events[pe.ananas_id] = ProcessEvent(pe.pid, pe.start_ts, pe.end_ts, pe)

        for sc in context.analysis.iter_events(context, SyscallEvent):
            if sc.processid not in associated_syscalls:
                associated_syscalls[sc.processid] = []

            associated_syscalls[sc.processid].append(sc)

        for p_id, scls in associated_syscalls.iteritems():
            context.analysis.combine_events(scls, process_events[p_id])

    def get_properties(self):
        return {'pid': self.pid,
                'comm': self.process_entity.comm,
                'path': self.process_entity.path,
                }


class CommandExecuteEvent(model.Event):
    indices = {'process'}

    def __init__(self, path, command, process):
        assert isinstance(process, model.Process)
        super(CommandExecuteEvent, self).__init__('', "lkm")
        self.process = process
        self.command = command
        self.path = path

    def __str__(self):
        return 'Execute: {}, {}'.format(self.path, self.command)


class FileDescriptorEvent(model.Event):
    indices = {'opening_process'}

    def __init__(self, name, opening_process, successful, start_ts, end_ts):
        assert isinstance(opening_process, model.Process) or opening_process is None
        super(FileDescriptorEvent, self).__init__(name, "lkm", start_ts, end_ts)
        self.opening_process = opening_process
        self.successful = successful

    @staticmethod
    def find(context):
        pass

    def get_properties(self):
        return {}

    def __str__(self):
        return 'FD-Event (unknown FD)'


class FileEvent(FileDescriptorEvent):
    indices = FileDescriptorEvent.indices | {'abspath'}

    def __init__(self, file_entity, mode, opening_process, successful, start_ts, end_ts):
        assert isinstance(file_entity, model.File)
        super(FileEvent, self).__init__("file " + str(file_entity.abspath) + " " + str(mode), opening_process,
                                        successful, start_ts, end_ts)
        self.abspath = file_entity.abspath
        self.file_entity = file_entity
        self.mode = mode

    @staticmethod
    def find(context):
        assert isinstance(context, AmbrosiaContext)

        process_events = {}
        associated_syscalls = {}

        for pe in context.analysis.iter_entities(model.Process):
            assert isinstance(pe, model.Process)
            process_events[pe.ananas_id] = ProcessEvent(pe.pid, pe.start_ts, pe.end_ts, pe)

        for sc in context.analysis.iter_events(context, SyscallEvent):
            if sc.processid not in associated_syscalls:
                associated_syscalls[sc.processid] = []

            associated_syscalls[sc.processid].append(sc)

        for p_id, scls in associated_syscalls.iteritems():
            context.analysis.combine_events(scls, process_events[p_id])

    def get_properties(self):
        return {'mode': self.mode,
                'abspath': self.abspath,
                }

    def __str__(self):
        return 'FileEvent: ' + self.abspath


class SocketEvent(FileDescriptorEvent):
    indices = FileDescriptorEvent.indices | set()

    def __init__(self, opening_process, successful, start_ts, end_ts):
        super(SocketEvent, self).__init__("socket", opening_process, successful, start_ts, end_ts)

    @staticmethod
    def find(context):
        pass # TODO

    def get_properties(self):
        return {} # TODO


class SocketAccept(FileDescriptorEvent):
    indices = FileDescriptorEvent.indices | set()

    def __init__(self, opening_process, successful, start_ts, end_ts):
        super(SocketAccept, self).__init__("accept", opening_process, successful, start_ts, end_ts)

    def get_properties(self):
        return {} # TODO

    def __str__(self):
        return 'Accept from socket'


class AllocateSegmentEvent(model.Event):
    indices = {'process_entity'}

    mmap_flags = {'MAP_SHARED': 0x001,
        'MAP_PRIVATE': 0x002,
        'MAP_TYPE': 0x00f,
        'MAP_FIXED': 0x010,
        'MAP_RENAME': 0x020,
        'MAP_AUTOGROW': 0x040,
        'MAP_LOCAL': 0x080,
        'MAP_AUTORSRV': 0x100,
        'MAP_NORESERVE': 0x0400,
        'MAP_ANONYMOUS': 0x0800,
        'MAP_GROWSDOWN': 0x1000,
        'MAP_DENYWRITE': 0x2000,
        'MAP_EXECUTABLE': 0x4000,
        'MAP_LOCKED': 0x8000,
        'MAP_POPULATE': 0x10000,
        'MAP_NONBLOCK': 0x20000,
        'MAP_STACK': 0x40000,
        'MAP_HUGETLB': 0x80000
    }

    def __init__(self, flags, fd, address, process_entity, successful, start_ts, end_ts):
        assert isinstance(process_entity, model.Process)
        super(AllocateSegmentEvent, self).__init__("allocate segment", "lkm", start_ts, end_ts)
        self.process_entity = process_entity
        self.file_entity = None
        self.address = address
        self.flags_val = flags
        self.flags = set()
        self.successful = successful
        for f, v in AllocateSegmentEvent.mmap_flags.iteritems():
            if (v & flags) != 0:
                self.flags.add(f)
        self.fd = fd

    @staticmethod
    def find(context):
        pass # TODO

    def get_properties(self):
        return {} # TODO

    def __str__(self):
        res = ''

        if not self.successful:
            res += 'FAILED: '

        if self.file_entity is None:
            res += 'Memory'
        else:
            res += str(self.file_entity)

        res += ' mapped to '+hex(self.address)
        return res


class StartThreadEvent(model.Event):
    indices = set()

    def __init__(self, start_ts, end_ts, process_entity, child_pid, spawned_child):
        assert isinstance(process_entity, model.Process)
        super(StartThreadEvent, self).__init__("thread", "lkm", start_ts, end_ts)
        self.child_pid = child_pid
        self.process_entity = process_entity
        self.spawned_child = spawned_child

    @staticmethod
    def find(context):
        pass # TODO

    def get_properties(self):
        return {} # TODO


class SuperUserRequest(model.Event):
    indices = set()

    def __init__(self, start_ts, end_ts, process_entity):
        assert isinstance(process_entity, model.Process)
        super(SuperUserRequest, self).__init__("su", "lkm", start_ts, end_ts)
        self.process_entity = process_entity

    @staticmethod
    def find(context):
        pass # TODO

    def get_properties(self):
        return {} # TODO

    def __str__(self):
        return 'SU-Request by PID {}, UID {}'.format(self.process_entity.pid, self.process_entity.uid)


class CreateDir(model.Event):
    indices = set()

    def __init__(self, start_ts, end_ts, process_entity, file_entity):
        assert isinstance(process_entity, model.Process)
        assert isinstance(file_entity, model.File)
        super(CreateDir, self).__init__("mkdir", "lkm", start_ts, end_ts)
        self.process_entity = process_entity
        self.file_entity = file_entity

    @staticmethod
    def find(context):
        pass # TODO

    def get_properties(self):
        return {} # TODO

    def __str__(self):
        return 'Mkdir '+str(self.file_entity)


class SendSignal(model.Event):
    indices = set()

    def __init__(self, start_ts, end_ts, number, process_entity, target_process):
        assert isinstance(process_entity, model.Process)
        assert isinstance(target_process, model.Process)
        super(SendSignal, self).__init__("kill", "lkm", start_ts, end_ts)
        self.process_entity = process_entity
        self.target_process = target_process
        self.number = number

    @staticmethod
    def find(context):
        pass # TODO

    def get_properties(self):
        return {} # TODO

    def __str__(self):
        return 'Signal {} to {} (by {})  '.format(self.number, self.target_process, self.process_entity)


class DeleteFileEvent(model.Event):
    indices = set()

    def __init__(self, start_ts, end_ts, successful, file_entity):
        assert isinstance(file_entity, model.File)
        super(DeleteFileEvent, self).__init__("delete file", "lkm", start_ts, end_ts)
        self.file_entity = file_entity
        self.successful = successful

    @staticmethod
    def find(context):
        pass # TODO

    def get_properties(self):
        return {} # TODO


class ExecEvent(model.Event):
    indices = {'process_entity'}

    def __init__(self, start_ts, end_ts, path, argv, env, process_entity):
        assert isinstance(process_entity, model.Process)
        super(ExecEvent, self).__init__("exec", "lkm", start_ts, end_ts)
        self.process_entity = process_entity
        self.argv = argv
        self.env = env
        self.path = path

    @staticmethod
    def find(context):
        pass # TODO

    def get_properties(self):
        return {} # TODO

    def __str__(self):
        return 'Exec: {}, {}'.format(self.path, (' '.join(self.argv)))