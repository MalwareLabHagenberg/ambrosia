from ambrosia import model, AmbrosiaContext
import ambrosia
from ambrosia.model.entities import Task, File
from ambrosia.util import join_command

__author__ = 'Wolfgang Ettlinger'


class SyscallEvent(model.Event):
    indices = {'name'}

    def __init__(self, context, props, time, monotonic_ts, process_entity, spawned_child=None):
        assert isinstance(context, AmbrosiaContext)
        assert isinstance(process_entity, Task)
        super(SyscallEvent, self).__init__(end_ts=time)

        self.name = props['name']
        self.monotonic_ts = monotonic_ts
        self.pid = int(props['pid'])
        self.params = props['params']
        self.returnval = props['returnval']
        self.process = process_entity
        self.spawned_child = spawned_child

        add_info = props['add_info']

        self.argv, self.env = None, None

        if 'execve_argv' in add_info:
            self.argv = add_info['execve_argv']

        if 'execve_envp' in add_info:
            self.env = add_info['execve_envp']

    def get_serializeable_properties(self):
        props = {
            'pid': self.pid,
            'params': self.params,
            'returnval': self.returnval,
            'name': self.name,
            'process': self.process,
            'spawned_child': self.spawned_child,
            'monotonic_ts': self.monotonic_ts
        }

        if self.argv is not None:
            props['argv'] = join_command(self.argv)

        if self.env is not None:
            props['env'] = '\n'.join(self.env)

        i = 1
        for p in self.params:
            props['param_'+str(i)] = p
            i += 1

        return props

    def __str__(self):
        return '[Syscall: {} {} by {} result:{}]'.format(
            self.name,
            (','.join(self.params)),
            self.process,
            self.returnval)


class CommandExecuteEvent(model.Event):
    indices = {'process'}

    def __init__(self, path, command, process):
        assert isinstance(process, Task)
        super(CommandExecuteEvent, self).__init__()
        self.process = process
        self.command = command
        self.path = path

    def get_serializeable_properties(self):
        return {
            'process': self.process,
            'command': self.command,
            'path': self.path
        }

    def __str__(self):
        return '[Execute: {}, {}]'.format(self.path, join_command(self.command))


class FileDescriptorEvent(model.Event):
    indices = {'process'}

    def __init__(self, process, successful):
        assert isinstance(process, Task) or process is None
        super(FileDescriptorEvent, self).__init__()
        self.process = process
        self.successful = successful

    def get_serializeable_properties(self):
        return {
            'process': self.process,
            'sucessful': self.successful
        }

    def __str__(self):
        return '[File Descriptor Event]'


class UnknownFdEvent(FileDescriptorEvent):
    def __init__(self, process, fd_number):
        super(UnknownFdEvent, self).__init__(process, True)
        self.fd_number = fd_number

    def get_serializeable_properties(self):
        props = super(UnknownFdEvent, self).get_serializeable_properties()

        props.update({
            'fd_number': self.fd_number
        })

        return props

    def __str__(self):
        return '[Unknown FD-Event (#{})]'.format(self.fd_number)


class FileEvent(FileDescriptorEvent):
    indices = FileDescriptorEvent.indices | {'abspath'}

    def __init__(self, file_entity, mode, process, successful):
        assert isinstance(file_entity, File)
        super(FileEvent, self).__init__(process, successful)
        self.abspath = file_entity.abspath
        self.file = file_entity
        self.mode = mode

    def get_serializeable_properties(self):
        props = super(FileEvent, self).get_serializeable_properties()

        props.update({
            'mode': self.mode,
            'abspath': self.abspath,
            'file': self.file
        })

        return props

    def __str__(self):
        return '[FileEvent: "{}"]'.format(self.abspath)


class AnonymousFileEvent(FileEvent):
    indices = FileDescriptorEvent.indices

    def __init__(self, description, process, context, successful=True):
        assert isinstance(context, AmbrosiaContext)
        super(AnonymousFileEvent, self).__init__(File.unknown(context), None, process, successful)
        self.description = description

    def __str__(self):
        return '[Anonymous File "{}"]'.format(self.description)


class SocketEvent(FileDescriptorEvent):
    indices = FileDescriptorEvent.indices | set()

    def __init__(self, process, successful):
        super(SocketEvent, self).__init__(process, successful)

    def get_serializeable_properties(self):
        props = super(SocketEvent, self).get_serializeable_properties()

        return props


class SocketAccept(FileDescriptorEvent):
    indices = FileDescriptorEvent.indices | set()

    def __init__(self, process, successful):
        super(SocketAccept, self).__init__(process, successful)

    def get_serializeable_properties(self):
        props = super(SocketAccept, self).get_serializeable_properties()

        return props

    def __str__(self):
        return '[Accept from socket]'


class MemoryMapEvent(model.Event):
    indices = {'process_entity'}

    mmap_flags = {'MAP_SHARED': 0x1,
                  'MAP_PRIVATE': 0x2,
                  'MAP_FIXED': 0x10,
                  'MAP_ANONYMOUS': 0x20,
                  'MAP_GROWSDOWN': 0x100,
                  'MAP_DENYWRITE': 0x800,
                  'MAP_EXECUTABLE': 0x1000,
                  'MAP_LOCKED': 0x2000,
                  'MAP_NORESERVE': 0x4000,
                  'MAP_POPULATE': 0x8000,
                  'MAP_NONBLOCK': 0x10000,
                  'MAP_STACK': 0x20000,
                  'MAP_HUGETLB': 0x40000,
                  'MAP_UNINITIALIZED': 0x4000000,
                  }

    def __init__(self, flags, fd, address, process_entity, successful, start_ts, end_ts):
        assert isinstance(process_entity, Task)
        super(MemoryMapEvent, self).__init__(start_ts=start_ts, end_ts=end_ts)
        self.process_entity = process_entity
        self.file_entity = None
        self.address = address
        self.flags_val = flags
        self.flags = set()
        self.successful = successful
        for f, v in MemoryMapEvent.mmap_flags.iteritems():
            if (v & flags) != 0:
                self.flags.add(f)
        self.fd = fd

    def get_serializeable_properties(self):
        return {
            'process': self.process_entity,
            'file': self.file_entity,
            'address': self.address,
            'flags_value': self.flags_val,
            'sucessful': self.successful,
            'shared': 'MAP_SHARED' in self.flags,
            'private': 'MAP_PRIVATE' in self.flags,
            'anonymous': 'MAP_ANONYMOUS' in self.flags,
            'flags': ','.join([x for x in self.flags]),
            'fd': self.fd
        }

    def __str__(self):
        res = ''

        if not self.successful:
            res += 'FAILED: '

        if self.file_entity is None:
            res += 'Memory'
        else:
            res += str(self.file_entity)

        res += ' mapped to '+hex(self.address)

        return '['+res+']'


class StartTaskEvent(model.Event):
    indices = set()

    def __init__(self, start_ts, end_ts, process_entity, child_pid, spawned_child):
        assert isinstance(process_entity, Task)
        assert isinstance(spawned_child, Task)
        super(StartTaskEvent, self).__init__(start_ts=start_ts, end_ts=end_ts)
        self.child_pid = child_pid
        self.process_entity = process_entity
        self.spawned_child = spawned_child
        self.is_process = spawned_child.is_process

    def get_serializeable_properties(self):
        return {
            'child_pid': self.child_pid,
            'process': self.process_entity,
            'spawned_child': self.spawned_child,
            'is_process': self.is_process
        }

    def __str__(self):
        return '[Start {}: {}]'.format('process' if self.is_process else 'thread', self.child_pid)


class SuperUserRequest(model.Event):
    indices = set()

    def __init__(self, start_ts, end_ts, process_entity):
        assert isinstance(process_entity, Task)
        super(SuperUserRequest, self).__init__(start_ts=start_ts, end_ts=end_ts)
        self.process_entity = process_entity

    def get_serializeable_properties(self):
        return {
            'process': self.process_entity
        }

    def __str__(self):
        return '[SU-Request by PID {}, UID {}]'.format(self.process_entity.pid, self.process_entity.uid)


class CreateDir(model.Event):
    indices = set()

    def __init__(self, start_ts, end_ts, process_entity, file_entity):
        assert isinstance(process_entity, Task)
        assert isinstance(file_entity, File)
        super(CreateDir, self).__init__(start_ts=start_ts, end_ts=end_ts)
        self.process_entity = process_entity
        self.file_entity = file_entity

    def get_serializeable_properties(self):
        return {
            'file': self.file_entity,
            'process': self.process_entity
        }

    def __str__(self):
        return '[Mkdir: {}]'.format(str(self.file_entity))


class SendSignal(model.Event):
    indices = set()

    def __init__(self, start_ts, end_ts, number, process_entity, target_process):
        assert isinstance(process_entity, Task)
        assert isinstance(target_process, Task)
        super(SendSignal, self).__init__(start_ts=start_ts, end_ts=end_ts)
        self.process_entity = process_entity
        self.target_process = target_process
        self.number = number

    def get_serializeable_properties(self):
        return {
            'process': self.process_entity,
            'target_process': self.target_process,
            'number': self.number
        }

    def __str__(self):
        return '[Signal {} to {} (by {})]'.format(self.number, self.target_process, self.process_entity)


class DeleteFileEvent(model.Event):
    indices = set()

    def __init__(self, start_ts, end_ts, successful, file_entity, process):
        assert isinstance(file_entity, File)
        assert isinstance(process, Task)
        super(DeleteFileEvent, self).__init__(start_ts=start_ts, end_ts=end_ts)
        self.file_entity = file_entity
        self.successful = successful
        self.process = process

    def get_serializeable_properties(self):
        return {
            'file': self.file_entity,
            'successful': self.successful
        }

    def __str__(self):
        return "[Delete File: {}]".format(str(self.file_entity))


class ExecEvent(model.Event):
    indices = {'process_entity'}

    def __init__(self, start_ts, end_ts, path, argv, env, process_entity):
        assert isinstance(process_entity, Task)
        super(ExecEvent, self).__init__(start_ts=start_ts, end_ts=end_ts)
        self.process_entity = process_entity
        self.argv = argv
        self.env = env
        self.path = path

    def get_serializeable_properties(self):
        return {
            'argv': join_command(self.argv),
            'env': '\n'.join(self.env),
            'path': self.path
        }

    def __str__(self):
        return '[Exec: {}, {}]'.format(self.path, join_command(self.argv))


class ANANASAdbShellExec(model.Event):
    indices = set()

    def __init__(self):
        super(ANANASAdbShellExec, self).__init__()

    def get_serializeable_properties(self):
        return {}

    def __str__(self):
        return '[ANANAS Shell Command]'


class LibraryLoad(model.Event):
    indices = {'process'}

    def __init__(self, file, process, successful):
        assert isinstance(file, File)
        assert isinstance(process, Task)
        super(LibraryLoad, self).__init__()
        self.file = file
        self.process = process
        self.successful = successful

    def get_serializeable_properties(self):
        return {
            'file': self.file,
            'process': self.process
        }

    def __str__(self):
        return '[Library load: {}]'.format(self.file.abspath)