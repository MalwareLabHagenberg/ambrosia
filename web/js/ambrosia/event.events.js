"use strict";

/**
 * @namespace contains all known events
 */
ambrosia_web.event.events = function(){
    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SyscallEvent`
     * @constructor
     */
    var SyscallEvent = Class('ambrosia_web.event.events.SyscallEvent',
        A.event.BlockEvent, {
        filters: [
            new A.filter.BlacklistFilter('false', 'disable all syscall events')
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.StartTaskEvent`
     * @constructor
     */
    var StartTaskEvent = Class('ambrosia_web.event.events.StartTaskEvent',
        A.event.BlockEvent, {
        filters: [
            new A.filter.BlacklistFilter('p.is_process==true', 'hide forks that spawn a thread')
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.MemoryMapEvent`
     * @constructor
     */
    var MemoryMapEvent = Class('ambrosia_web.event.events.MemoryMapEvent',
        A.event.BlockEvent, {
        filters: [
            new A.filter.BlacklistFilter('p.anonymous==false', 'hide mmaps that do not operate on a file')
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.DeleteFileEvent`
     * @constructor
     */
    var DeleteFileEvent = Class('ambrosia_web.event.events.DeleteFileEvent',
        A.event.BlockEvent, {
        filters: [
            new A.filter.BlacklistFilter('r.file.p.abspath != "/data/ananaslkm.ko"',
                'hide the removal of the lkm file (done by ANANAS)')
        ]
    });
    

    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SendSignal`
     * @constructor
     */
    var SendSignal = Class('ambrosia_web.event.events.SendSignal',
        A.event.BlockEvent, {
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.CreateDir`
     * @constructor
     */
    var CreateDir = Class('ambrosia_web.event.events.CreateDir',
        A.event.BlockEvent, {
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SocketAccept`
     * @constructor
     */
    var SocketAccept = Class('ambrosia_web.event.events.SocketAccept',
        A.event.BlockEvent, {
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.FileEvent`
     * @constructor
     */
    var FileEvent = Class('ambrosia_web.event.events.FileEvent',
        A.event.BlockEvent, {
        filters: [
            new A.filter.BlacklistFilter(
                '!(p.abspath~"^/proc/\\d+/stat$" && p.flags == 131072 && "ActivityManager" : r.process.p.comm)',
                'ActivityManager regularily opens /proc/*/stat'),
            new A.filter.BlacklistFilter(
                '!(p.abspath~"^/proc/\\d+/oom_adj$" && p.flags==131073 && r.process.p.type=="ZYGOTE_CHILD")',
                'several zygote childs access /proc/*/oom_adj'),
            new A.filter.BlacklistFilter(
                '!(p.abspath~"^/proc/\\d+/task$" && p.flags==147456 && r.process.p.type=="ZYGOTE_CHILD")',
                'several zygote childs access /proc/*/task'),
            new A.filter.BlacklistFilter(
                '!(p.abspath~"^/proc/\\d+/smaps$" && p.flags==131072 && r.process.p.type=="ZYGOTE_CHILD")',
                'Several zygote childs access /proc/*/smaps'),
            new A.filter.BlacklistFilter(
                '!(p.abspath~"^/proc" && p.flg_O_RDWR==false && p.flg_O_WRONLY==false)',
                'hide misc read-only /proc/* access'),
            new A.filter.BlacklistFilter(
                '!(p.abspath=="/proc/net/xt_qtaguid/ctrl" && p.flags==131073 && "NetworkPolicy" : r.process.p.comm)',
                'hide NetworkPolicy operations'),
            new A.filter.BlacklistFilter(
                '!(p.abspath=="/proc/net/xt_quota/globalAlert" && p.flags==131649 && r.process.p.type == "NETD")',
                'hide netd /proc/net operations'),
            new A.filter.BlacklistFilter('!(p.abspath=="/dev/ashmem" && p.flags==131074)',
                'hide Android shared memory operations'),
            new A.filter.BlacklistFilter('!(p.abspath=="/dev/__properties__" && p.flags==688128)',
                'hide access to /dev/__properties__'),
            new A.filter.BlacklistFilter('!((p.abspath=="/dev/ptmx" && p.flags==131074 && r.process.p.type=="ADBD")' +
                ' || (p.abspath~"^/dev/pts/\\d+$" && p.flags==131074 && r.process.p.type=="ADBD_CHILD")' +
                ' || (p.abspath=="/dev/tty" && p.flags==131074 && r.process.p.type=="ADBD_CHILD"))',
                'hide ADB pseudoterminal operations'),
            new A.filter.BlacklistFilter('!(p.abspath~"^/dev/log/")',
                'hide logging operations'),
            new A.filter.BlacklistFilter('!(p.abspath=="/dev/qemu_trace")',
                'hide access to /dev/qemu_trace'),
            /*
            see
             https://www.sqlite.org/tempfiles.html
             https://www.sqlite.org/atomiccommit.html
            */
            new A.filter.BlacklistFilter('!(p.abspath~"^/data/(data|user)/.+\\.db(-journal|-shm|-wal|-mj[0-9A-F]{9})?$")',
                'hide access to databases'),

            new A.filter.BlacklistFilter('!(p.abspath~"^/data/dalvik-cache/.+\\.dex" && (p.flags == 131072 || p.flags == 131138))',
                'hide dalvik cache access'),

            new A.filter.BlacklistFilter('!(p.abspath~"^/sys/class/power_supply" && r.process.p.type=="HEALTHD")',
                'hide healthd operations'),

            new A.filter.BlacklistFilter(
                '!(r.process.r.app.p.package == "com.android.providers.telephony" && p.abspath~"^/data/data/com\\.android\\.(providers\\.telephony|phone)")',
                'hide events phone'),

            new A.filter.BlacklistFilter(
                '!(p.abspath~"^/data/data/com.google.android.googlequicksearchbox" && r.process.r.app.p.package == "com.google.android.googlequicksearchbox")',
                'hide events from google searchbox'),

            new A.filter.BlacklistFilter(
                '!(p.abspath~"^/data/data/com.google.android.gms" && r.process.r.app.p.package == "com.google.android.syncadapters.contacts")',
                'hide contacts app'),

            new A.filter.BlacklistFilter('!(p.abspath~"^/system/media/audio/.+\\.ogg" && r.process.r.app.p.package == "com.android.providers.settings")',
                'hide audio effects')

            /*
            new A.filter.BlacklistFilter(
                '!(p.abspath=="/proc/net/xt_qtaguid/iface_stat_fmt" && p.flags==131072 &&  "m.android.phone" !: p.process.comm)',
                'android phone accesses /proc/net/xt_qtaguid/iface_stat_fmt'),




            new A.filter.BlacklistFilter('!(p.abspath=="/dev/binder" && p.mode==131074)', ''),

            new A.filter.BlacklistFilter(
                '!(p.abspath ~ "/system/framework/.*\\.jar" && p.mode==131072 && r.process.p.type=="ADBD_CHILD")',
                '')*/
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.AnonymousFileEvent`
     * @constructor
     */
    var AnonymousFileEvent = Class('ambrosia_web.event.events.AnonymousFileEvent',
        A.event.BlockEvent, {
        filters: [
            new A.filter.BlacklistFilter('!(p.description=="pipe")', 'hide file operations on fds created by pipe()'),
            new A.filter.BlacklistFilter('!(p.description=="epoll")', 'hide file operations on fds created by epoll()')
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.UnknownFdEvent`
     * @constructor
     */
    var UnknownFdEvent = Class('ambrosia_web.event.events.UnknownFdEvent',
        A.event.BlockEvent, {
        filters: [
            new A.filter.BlacklistFilter('false', 'hide all unknown fd events')
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SocketEvent`
     * @constructor
     */
    var SocketEvent = Class('ambrosia_web.event.events.SocketEvent',
        A.event.BlockEvent, {
        filters: [
            new A.filter.BlacklistFilter('r.process.p.type != "ADBD"', 'hide the socket created by ADBD')
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.CommandExecuteEvent`
     * @constructor
     */
    var CommandExecuteEvent = Class('ambrosia_web.event.events.CommandExecuteEvent',
        A.event.BlockEvent, {
        filters: [
            new A.filter.BlacklistFilter('!(p.path == "/system/bin/iptables" && r.process.r.parent.p.type == "NETD")',
                'hide netd iptables calls')
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SuperUserRequest`
     * @constructor
     */
    var SuperUserRequest = Class('ambrosia_web.event.events.SuperUserRequest',
        A.event.BlockEvent, {
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.AndroidApicall`
     * @constructor
     */
    var AndroidApicall = Class('ambrosia_web.event.events.AndroidApicall',
        A.event.BlockEvent, {
        filters: [
            new A.filter.BlacklistFilter('false', 'hide all low-level API call events')
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.CallLogAccess`
     * @constructor
     */
    var CallLogAccess = Class('ambrosia_web.event.events.CallLogAccess',
        A.event.BlockEvent, {
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.ContactsAccess`
     * @constructor
     */
    var ContactsAccess = Class('ambrosia_web.event.events.ContactsAccess',
        A.event.BlockEvent, {
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.PhoneCall`
     * @constructor
     */
    var PhoneCall = Class('ambrosia_web.event.events.PhoneCall',
        A.event.BlockEvent, {
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.SMSAccess`
     * @constructor
     */
    var SMSAccess = Class('ambrosia_web.event.events.SMSAccess',
        A.event.BlockEvent, {
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.events.ANANASEvent`
     * @constructor
     */
    var ANANASEvent = Class('ambrosia_web.event.events.ANANASEvent',
        A.event.LineEvent, {});


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.ExecEvent`
     * @constructor
     */
    var ExecEvent = Class('ambrosia_web.event.events.ExecEvent',
        A.event.BlockEvent, {
        filters: [
        ]
    });
    

    /**
     * Represents :class:`ambrosia_plugins.lkm.events.ANANASAdbShellExec`
     * @constructor
     */
    var ANANASAdbShellExec = Class('ambrosia_web.event.events.ANANASAdbShellExec',
        A.event.BlockEvent, {
        filters: [
            new A.filter.BlacklistFilter('false', 'hide command executes initiated by ANANAS')
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.LibraryLoad`
     * @constructor
     */
    var LibraryLoad = Class('ambrosia_web.event.events.LibraryLoad',
        A.event.BlockEvent, {
        filters: [
            new A.filter.BlacklistFilter("false", 'hide all library loads')
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.JavaLibraryLoad`
     * @constructor
     */
    var JavaLibraryLoad = Class('ambrosia_web.event.events.JavaLibraryLoad',
        A.event.BlockEvent, {
        filters: [
            new A.filter.BlacklistFilter("p.system_library==false", 'hide all system java library loads'),
            new A.filter.BlacklistFilter('!(r.file.p.abspath~"^/data/app/.+\\.(apk|odex)$")',
                'hide all standard application java library loads')
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.ZygoteForkEvent`
     * @constructor
     */
    var ZygoteForkEvent = Class('ambrosia_web.event.events.ZygoteForkEvent',
        A.event.BlockEvent, {
        filters: [
            new A.filter.BlacklistFilter("false", 'hide Zygote forks')
        ]
    });


    var evt_registry = {
        'ambrosia_plugins.events.ANANASEvent':              ANANASEvent,
        'ambrosia_plugins.lkm.events.SyscallEvent':         SyscallEvent,
        'ambrosia_plugins.apimonitor.AndroidApicall':       AndroidApicall,
        'ambrosia_plugins.lkm.events.FileEvent':            FileEvent,
        'ambrosia_plugins.lkm.events.StartTaskEvent':       StartTaskEvent,
        'ambrosia_plugins.lkm.events.UnknownFdEvent':       UnknownFdEvent,
        'ambrosia_plugins.lkm.events.MemoryMapEvent':       MemoryMapEvent,
        'ambrosia_plugins.lkm.events.SocketEvent':          SocketEvent,
        'ambrosia_plugins.lkm.events.DeleteFileEvent':      DeleteFileEvent,
        'ambrosia_plugins.lkm.events.SendSignal':           SendSignal,
        'ambrosia_plugins.lkm.events.CreateDir':            CreateDir,
        'ambrosia_plugins.lkm.events.SocketAccept':         SocketAccept,
        'ambrosia_plugins.lkm.events.ExecEvent':            ExecEvent,
        'ambrosia_plugins.lkm.events.CommandExecuteEvent':  CommandExecuteEvent,
        'ambrosia_plugins.lkm.events.SuperUserRequest':     SuperUserRequest,
        'ambrosia_plugins.lkm.events.ANANASAdbShellExec':   ANANASAdbShellExec,
        'ambrosia_plugins.apimonitor.CallLogAccess':        CallLogAccess,
        'ambrosia_plugins.apimonitor.ContactsAccess':       ContactsAccess,
        'ambrosia_plugins.apimonitor.PhoneCall':            PhoneCall,
        'ambrosia_plugins.apimonitor.SMSAccess':            SMSAccess,
        'ambrosia_plugins.lkm.events.AnonymousFileEvent':   AnonymousFileEvent,
        'ambrosia_plugins.lkm.events.LibraryLoad':          LibraryLoad,
        'ambrosia_plugins.lkm.events.JavaLibraryLoad':      JavaLibraryLoad,
        'ambrosia_plugins.lkm.events.ZygoteForkEvent':      ZygoteForkEvent
    };

    var ret = {
        event_registry: evt_registry
    };

    for(var i in evt_registry){
        var cls_name = i.substr(i.lastIndexOf('.') + 1);
        ret[cls_name] = evt_registry[i];
        evt_registry[i].prototype.cssClass = 'event_'+cls_name;
    }

    return ret;
}();

