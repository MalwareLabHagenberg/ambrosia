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
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.StartTaskEvent`
     * @constructor
     */
    var StartTaskEvent = Class('ambrosia_web.event.events.StartTaskEvent',
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.MemoryMapEvent`
     * @constructor
     */
    var MemoryMapEvent = Class('ambrosia_web.event.events.MemoryMapEvent',
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.DeleteFileEvent`
     * @constructor
     */
    var DeleteFileEvent = Class('ambrosia_web.event.events.DeleteFileEvent',
        A.event.BlockEvent, { });
    

    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SendSignal`
     * @constructor
     */
    var SendSignal = Class('ambrosia_web.event.events.SendSignal',
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.CreateDir`
     * @constructor
     */
    var CreateDir = Class('ambrosia_web.event.events.CreateDir',
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SocketAccept`
     * @constructor
     */
    var SocketAccept = Class('ambrosia_web.event.events.SocketAccept',
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.FileEvent`
     * @constructor
     */
    var FileEvent = Class('ambrosia_web.event.events.FileEvent',
        A.event.BlockEvent, {
            /*
            new A.filter.Filter(
                '!(p.abspath=="/proc/net/xt_qtaguid/iface_stat_fmt" && p.flags==131072 &&  "m.android.phone" !: p.process.comm)',
                'android phone accesses /proc/net/xt_qtaguid/iface_stat_fmt'),




            new A.filter.Filter('!(p.abspath=="/dev/binder" && p.mode==131074)', ''),

            new A.filter.Filter(
                '!(p.abspath ~ "/system/framework/.*\\.jar" && p.mode==131072 && r.process.p.type=="ADBD_CHILD")',
                '')*/

    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.AnonymousFileEvent`
     * @constructor
     */
    var AnonymousFileEvent = Class('ambrosia_web.event.events.AnonymousFileEvent',
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.UnknownFdEvent`
     * @constructor
     */
    var UnknownFdEvent = Class('ambrosia_web.event.events.UnknownFdEvent',
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SocketEvent`
     * @constructor
     */
    var SocketEvent = Class('ambrosia_web.event.events.SocketEvent',
        A.event.BlockEvent, {});


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.CommandExecuteEvent`
     * @constructor
     */
    var CommandExecuteEvent = Class('ambrosia_web.event.events.CommandExecuteEvent',
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SuperUserRequest`
     * @constructor
     */
    var SuperUserRequest = Class('ambrosia_web.event.events.SuperUserRequest',
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.AndroidApicall`
     * @constructor
     */
    var AndroidApicall = Class('ambrosia_web.event.events.AndroidApicall',
        A.event.BlockEvent, {});


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.CallLogAccess`
     * @constructor
     */
    var CallLogAccess = Class('ambrosia_web.event.events.CallLogAccess',
        A.event.BlockEvent, {});


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.ContactsAccess`
     * @constructor
     */
    var ContactsAccess = Class('ambrosia_web.event.events.ContactsAccess',
        A.event.BlockEvent, {});


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.PhoneCall`
     * @constructor
     */
    var PhoneCall = Class('ambrosia_web.event.events.PhoneCall',
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.SMSAccess`
     * @constructor
     */
    var SMSAccess = Class('ambrosia_web.event.events.SMSAccess',
        A.event.BlockEvent, { });


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
        A.event.BlockEvent, { });
    

    /**
     * Represents :class:`ambrosia_plugins.lkm.events.ANANASAdbShellExec`
     * @constructor
     */
    var ANANASAdbShellExec = Class('ambrosia_web.event.events.ANANASAdbShellExec',
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.LibraryLoad`
     * @constructor
     */
    var LibraryLoad = Class('ambrosia_web.event.events.LibraryLoad',
        A.event.BlockEvent, {});


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.JavaLibraryLoad`
     * @constructor
     */
    var JavaLibraryLoad = Class('ambrosia_web.event.events.JavaLibraryLoad',
        A.event.BlockEvent, {});


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.ZygoteForkEvent`
     * @constructor
     */
    var ZygoteForkEvent = Class('ambrosia_web.event.events.ZygoteForkEvent',
        A.event.BlockEvent, { });

    /**
     * Represents :class:`ambrosia_plugins.lkm.events.APKInstall`
     * @constructor
     */
    var APKInstall = Class('ambrosia_web.event.events.APKInstall',
        A.event.BlockEvent, { });

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
        'ambrosia_plugins.lkm.events.ZygoteForkEvent':      ZygoteForkEvent,
        'ambrosia_plugins.lkm.events.APKInstall':           APKInstall
    };

    var ret = {
        event_registry: evt_registry
    };

    for(var i in evt_registry){
        var cls_name = i.substr(i.lastIndexOf('.') + 1);
        ret[cls_name] = evt_registry[i];
        evt_registry[i].prototype.stype = cls_name; // short type
        evt_registry[i].prototype.cssClass = 'event_'+cls_name;
    }

    return ret;
}();

