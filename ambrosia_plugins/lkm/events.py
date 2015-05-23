from ambrosia import model, AmbrosiaContext
import ambrosia
from ambrosia.model.entities import Task, File
from ambrosia.util import join_command

__author__ = 'Wolfgang Ettlinger'


class SyscallEvent(model.Event):
    """Represents a system call from lkm
    """
    indices = {'name', 'index'}

    def __init__(self, context, props, time, monotonic_ts, process, idx, spawned_child=None, target_task=None):
        assert isinstance(context, AmbrosiaContext)
        assert isinstance(process, Task)
        super(SyscallEvent, self).__init__(end_ts=time)

        self.name = props['name']
        self.monotonic_ts = monotonic_ts
        self.pid = int(props['pid'])
        self.params = props['params']
        self.returnval = props['returnval']
        self.process = process
        self.spawned_child = spawned_child
        self.target_task = target_task
        self.index = idx

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
            'target_task': self.target_task,
            'monotonic_ts': self.monotonic_ts,
            'syscall_index': self.index
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
        return '[Syscall: {} {} result:{}]'.format(
            self.name,
            (','.join(self.params)),
            self.returnval)


class CommandExecuteEvent(model.Event):
    """Represents the execution of a command (including fork, exec, library loads, etc.)
    """
    indices = {'process'}

    def __init__(self, path, command, process, execfile):
        assert isinstance(process, Task)
        assert isinstance(execfile, File)
        super(CommandExecuteEvent, self).__init__()
        self.process = process
        self.command = command
        self.path = path
        self.execfile = execfile

    def get_serializeable_properties(self):
        return {
            'process': self.process,
            'command': self.command,
            'path': self.path,
            'execfile': self.execfile
        }

    def __str__(self):
        return '[Execute: {}, {}]'.format(self.path, join_command(self.command))


class ZygoteForkEvent(model.Event):
    """ Represents that *zygote* forked to start an app
    """
    indices = {'process'}

    def __init__(self, process):
        assert isinstance(process, Task)
        super(ZygoteForkEvent, self).__init__()
        self.process = process

    def get_serializeable_properties(self):
        return {
            'process': self.process
        }

    def __str__(self):
        return '[Zygote Fork, UID: {}]'.format(self.process.uid)


class FileDescriptorEvent(model.Event):
    """The base event for all file descriptor related events
    """
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
        raise NotImplementedError()


class UnknownFdEvent(FileDescriptorEvent):
    """Represents a fd event where no syscall opening the fd has been found.
    """
    def __init__(self, process, fd_number, successful):
        super(UnknownFdEvent, self).__init__(process, successful)
        self.fd_number = fd_number

    def get_serializeable_properties(self):
        props = super(UnknownFdEvent, self).get_serializeable_properties()

        props.update({
            'fd_number': self.fd_number
        })

        return props

    def __str__(self):
        return '[Unknown FD-Event (#{})]'.format(self.fd_number)


class FileAccessEvent(FileDescriptorEvent):
    """Represents a normal file operation on a file, directory or pipe
    """
    indices = FileDescriptorEvent.indices | {'abspath'}

    mode_flags = {
        'O_WRONLY': 00000001,
        'O_RDWR': 00000002,
        'O_CREAT': 00000100,
        'O_EXCL': 00000200,
        'O_NOCTTY': 00000400,
        'O_TRUNC': 00001000,
        'O_APPEND': 00002000,
        'O_NONBLOCK': 00004000,
        'O_DSYNC': 00010000,
        'O_DIRECT': 00040000,
        'O_LARGEFILE': 00100000,
        'O_DIRECTORY': 00200000,
        'O_NOFOLLOW': 00400000,
        'O_NOATIME': 01000000,
        'O_CLOEXEC': 02000000,
        'O_PATH': 010000000
    }

    def __init__(self, file, flags, mode, process, successful):
        assert isinstance(file, File)
        super(FileAccessEvent, self).__init__(process, successful)
        self.abspath = file.abspath
        self.file = file
        self.mode = mode
        self.flags_val = flags
        self.flags = set()
        if flags is not None:
            for f, v in FileAccessEvent.mode_flags.iteritems():
                if (v & flags) != 0:
                    self.flags.add(f)

    def get_serializeable_properties(self):
        props = super(FileAccessEvent, self).get_serializeable_properties()

        props.update({
            'mode': self.mode,
            'file': self.file,
            'flags': self.flags_val
        })

        for f in FileAccessEvent.mode_flags:
            props['flg_'+f] = f in self.flags

        return props

    def __str__(self):
        return '[FileAccessEvent: "{}"]'.format(self.abspath)


class AnonymousFileAccessEvent(FileAccessEvent):
    """Represents an operation that happens on a file without a name (e.g. an unnamed pipe)
    """
    indices = FileDescriptorEvent.indices

    def __init__(self, description, process, context, successful=True):
        assert isinstance(context, AmbrosiaContext)
        super(AnonymousFileAccessEvent, self).__init__(File.unknown(context), None, None, process, successful)
        self.description = description

    def get_serializeable_properties(self):
        props = super(AnonymousFileAccessEvent, self).get_serializeable_properties()
        props['description'] = self.description
        return props

    def __str__(self):
        return '[Anonymous File "{}"]'.format(self.description)


class SocketEvent(FileDescriptorEvent):
    """Represents an operation on a socket
    """
    indices = FileDescriptorEvent.indices | set()

    address_families = {
        0: 'AF_UNSPEC',
        1: 'AF_UNIX',  # Unix domain sockets
        2: 'AF_INET',  # Internet IP Protocol
        3: 'AF_AX25',  # Amateur Radio AX.25
        4: 'AF_IPX',  # Novell IPX
        5: 'AF_APPLETALK',  # AppleTalk DDP
        6: 'AF_NETROM',  # Amateur Radio NET/ROM
        7: 'AF_BRIDGE',  # Multiprotocol bridge
        8: 'AF_ATMPVC',  # ATM PVCs
        9: 'AF_X25',  # Reserved for X.25,         project
        10: 'AF_INET6',  # IP version:6
        11: 'AF_ROSE',  # Amateur Radio X.25,         PLP
        12: 'AF_DECnet',  # Reserved for DECnet project
        13: 'AF_NETBEUI',  # Reserved for:802.2LLC projec
        14: 'AF_SECURITY',  # Security callback pseudo AF
        15: 'AF_KEY',  # PF_KEY key management API
        16: 'AF_NETLINK',
        17: 'AF_PACKET',  # Packet family
        18: 'AF_ASH',  # Ash
        19: 'AF_ECONET',  # Acorn Econet
        20: 'AF_ATMSVC',  # ATM SVCs
        21: 'AF_RDS',  # RDS sockets
        22: 'AF_SNA',  # Linux SNA Project (nutters!)
        23: 'AF_IRDA',  # IRDA sockets
        24: 'AF_PPPOX',  # PPPoX sockets
        25: 'AF_WANPIPE',  # Wanpipe API Sockets
        26: 'AF_LLC',  # Linux LLC
        27: 'AF_IB',  # Native InfiniBand address
        29: 'AF_CAN',  # Controller Area Network
        30: 'AF_TIPC',  # TIPC sockets
        31: 'AF_BLUETOOTH',  # Bluetooth sockets
        32: 'AF_IUCV',  # IUCV sockets
        33: 'AF_RXRPC',  # RxRPC sockets
        34: 'AF_ISDN',  # mISDN sockets
        35: 'AF_PHONET',  # Phonet sockets
        36: 'AF_IEEE802154',  # IEEE80,2154 sockets
        37: 'AF_CAIF',  # CAIF sockets
        38: 'AF_ALG',  # Algorithm sockets
        39: 'AF_NFC',  # NFC sockets
        40: 'AF_VSOCK',  # vSockets
    }

    sock_types = {
        1: 'SOCK_STREAM',
        2: 'SOCK_DGRAM',
        3: 'SOCK_RAW',
        4: 'SOCK_RDM',
        5: 'SOCK_SEQPACKET',
        6: 'SOCK_DCCP',
        10: 'SOCK_PACKET'
    }

    def __init__(self, process, successful):
        super(SocketEvent, self).__init__(process, successful)
        self.client_socket = False
        self.server_socket = False
        self.address_family = None
        self.socket_type = None
        self.connected_to = None
        self.bound_to = None

    def get_serializeable_properties(self):
        props = super(SocketEvent, self).get_serializeable_properties()
        props['client_socket'] = self.client_socket
        props['server_socket'] = self.server_socket

        if self.address_family in SocketEvent.address_families:
            props['address_family'] = SocketEvent.address_families[self.address_family]

        if self.socket_type in SocketEvent.sock_types:
            props['socket_type'] = SocketEvent.sock_types[self.socket_type]

        props['connected_to'] = self.connected_to
        props['bound_to'] = self.bound_to

        return props

    def __str__(self):
        return '[Socket Event]'


class SocketAcceptEvent(FileDescriptorEvent):
    """Represents a successful accept() on a socket

    This event's parent normally is a :class:`ambrosia_plugins.lkm.events.SocketEvent` and it is a
    :class:`ambrosia_plugins.lkm.events.FileDescriptorEvent` and therefore itself is a file descriptor operation.
    """
    indices = FileDescriptorEvent.indices | set()

    def __init__(self, process, successful):
        super(SocketAcceptEvent, self).__init__(process, successful)

    def get_serializeable_properties(self):
        props = super(SocketAcceptEvent, self).get_serializeable_properties()

        return props

    def __str__(self):
        return '[Accept from socket]'


class MemoryMapEvent(model.Event):
    """Represents a call to mmap(). It's parent normally is a :class:`ambrosia_plugins.lkm.events.FileDescriptorEvent`
    """
    indices = {'process'}

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

    def __init__(self, flags, fd, address, process, return_value, start_ts, end_ts):
        assert isinstance(process, Task)
        super(MemoryMapEvent, self).__init__(start_ts=start_ts, end_ts=end_ts)
        self.process = process
        self.file = None
        self.address = address
        self.flags_val = flags
        self.flags = set()
        self.successful = return_value != 4294967295  # this is -1 (signed) written in unsigned, called MAP_FAILED
        for f, v in MemoryMapEvent.mmap_flags.iteritems():
            if (v & flags) != 0:
                self.flags.add(f)
        self.fd = fd

    def get_serializeable_properties(self):
        return {
            'process': self.process,
            'file': self.file,
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

        if self.file is None:
            res += 'Memory'
        else:
            res += str(self.file)

        res += ' mapped to '+hex(self.address)

        return '['+res+']'


class StartTaskEvent(model.Event):
    """Represents a fork()-like syscall
    """
    indices = set()

    def __init__(self, start_ts, end_ts, process, child_pid, spawned_child):
        assert isinstance(process, Task)
        assert isinstance(spawned_child, Task)
        super(StartTaskEvent, self).__init__(start_ts=start_ts, end_ts=end_ts)
        self.child_pid = child_pid
        self.process = process
        self.spawned_child = spawned_child
        self.is_process = spawned_child.is_process

    def get_serializeable_properties(self):
        return {
            'child_pid': self.child_pid,
            'process': self.process,
            'spawned_child': self.spawned_child,
            'is_process': self.is_process
        }

    def __str__(self):
        return '[Start {}: {}]'.format('process' if self.is_process else 'thread', self.child_pid)


class SuperUserRequestEvent(model.Event):
    """Indicates that the process tried to run "su"
    """
    indices = set()

    def __init__(self, start_ts, end_ts, process):
        assert isinstance(process, Task)
        super(SuperUserRequestEvent, self).__init__(start_ts=start_ts, end_ts=end_ts)
        self.process = process

    def get_serializeable_properties(self):
        return {
            'process': self.process
        }

    def __str__(self):
        return '[SU-Request by PID {}, UID {}]'.format(self.process.pid, self.process.uid)


class CreateDirEvent(model.Event):
    """Represents an mkdir() syscall
    """
    indices = {'process'}

    def __init__(self, start_ts, end_ts, process, successful, file):
        assert isinstance(process, Task)
        assert isinstance(file, File)
        super(CreateDirEvent, self).__init__(start_ts=start_ts, end_ts=end_ts)
        self.process = process
        self.file = file
        self.successful = successful

    def get_serializeable_properties(self):
        return {
            'file': self.file,
            'process': self.process,
            'successful': self.successful
        }

    def __str__(self):
        return '[Mkdir: {}]'.format(str(self.file))


class SendSignalEvent(model.Event):
    """Represents a kill() syscall
    """
    indices = set()

    def __init__(self, start_ts, end_ts, number, process, target_process):
        assert isinstance(process, Task)
        assert isinstance(target_process, Task)
        super(SendSignalEvent, self).__init__(start_ts=start_ts, end_ts=end_ts)
        self.process = process
        self.target_process = target_process
        self.number = number

    def get_serializeable_properties(self):
        return {
            'process': self.process,
            'target_process': self.target_process,
            'number': self.number
        }

    def __str__(self):
        return '[Signal {} to {} (by {})]'.format(self.number, self.target_process, self.process)


class DeletePathEvent(model.Event):
    """Represents an unlink() syscall
    """
    indices = set()

    def __init__(self, start_ts, end_ts, successful, file, process):
        assert isinstance(file, File)
        assert isinstance(process, Task)
        super(DeletePathEvent, self).__init__(start_ts=start_ts, end_ts=end_ts)
        self.file = file
        self.successful = successful
        self.process = process

    def get_serializeable_properties(self):
        return {
            'file': self.file,
            'successful': self.successful,
            'process': self.process
        }

    def __str__(self):
        return "[Delete File: {}]".format(str(self.file))


class ExecEvent(model.Event):
    """Represents an execve() syscall
    """
    indices = {'process'}

    def __init__(self, start_ts, end_ts, path, argv, env, process):
        assert isinstance(process, Task)
        super(ExecEvent, self).__init__(start_ts=start_ts, end_ts=end_ts)
        self.process = process
        self.argv = argv
        self.env = env
        self.path = path

    def get_serializeable_properties(self):
        return {
            'argv': join_command(self.argv),
            'env': '\n'.join(self.env),
            'path': self.path,
            'process': self.process
        }

    def __str__(self):
        return '[Exec: {}, {}]'.format(self.path, join_command(self.argv))


class ANANASAdbShellExecEvent(model.Event):
    """Represents a command that has been executed by ANANAS
    """
    indices = set()

    def __init__(self, process):
        assert isinstance(process, Task)
        super(ANANASAdbShellExecEvent, self).__init__()
        self.process = process

    def get_serializeable_properties(self):
        return {
            'process': self.process
        }

    def __str__(self):
        return '[ANANAS Shell Command]'


class LibraryLoadEvent(model.Event):
    """Represents mmap() operations on a library file
    """
    indices = {'process'}

    def __init__(self, file, process, successful):
        assert isinstance(file, File)
        assert isinstance(process, Task)
        super(LibraryLoadEvent, self).__init__()
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


class JavaLibraryLoadEvent(model.Event):
    """Represents dalvik library load operation
    """
    indices = {'process'}

    def __init__(self, file, process, successful, system_library_load):
        assert isinstance(file, File)
        assert isinstance(process, Task)
        super(JavaLibraryLoadEvent, self).__init__()
        self.file = file
        self.process = process
        self.successful = successful
        self.system_library = system_library_load

    def get_serializeable_properties(self):
        return {
            'file': self.file,
            'process': self.process,
            'system_library': self.system_library
        }

    def __str__(self):
        return '[Java Library load: {}]'.format(self.file.abspath)


class APKInstallEvent(model.Event):
    """ Represents an app installation
    """
    indices = set()

    def __init__(self, file, process):
        assert isinstance(file, File)
        assert isinstance(process, Task)
        super(APKInstallEvent, self).__init__()
        self.file = file
        self.process = process

    def get_serializeable_properties(self):
        return {
            'file': self.file,
            'process': self.process
        }

    def __str__(self):
        return '[APK install: {}]'.format(self.file.abspath)


class MountEvent(model.Event):
    """ Represents a mount syscall
    """
    indices = set()

    def __init__(self, dev, mountpoint, type, flags, data, process, successful):
        assert isinstance(dev, File)
        assert isinstance(mountpoint, File)
        super(MountEvent, self).__init__()
        self.dev = dev
        self.mountpoint = mountpoint
        self.type = type
        self.flags = flags
        self.data = data
        self.process = process
        self.successful = successful

    def get_serializeable_properties(self):
        return {
            'dev': self.dev,
            'mountpoint': self.mountpoint,
            'type': self.type,
            'flags': self.flags,
            'data': self.data,
            'process': self.process,
            'successful': self.successful
        }

    def __str__(self):
        return '[Mount: {} to {}]'.format(self.dev.abspath, self.mountpoint.abspath)

