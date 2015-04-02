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
     * Represents :class:`ambrosia_plugins.lkm.events.DeletePathEvent`
     * @constructor
     */
    var DeletePathEvent = Class('ambrosia_web.event.events.DeletePathEvent',
        A.event.BlockEvent, { });
    

    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SendSignalEvent`
     * @constructor
     */
    var SendSignalEvent = Class('ambrosia_web.event.events.SendSignalEvent',
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.CreateDirEvent`
     * @constructor
     */
    var CreateDirEvent = Class('ambrosia_web.event.events.CreateDirEvent',
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SocketAcceptEvent`
     * @constructor
     */
    var SocketAcceptEvent = Class('ambrosia_web.event.events.SocketAcceptEvent',
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
     * Represents :class:`ambrosia_plugins.lkm.events.SuperUserRequestEvent`
     * @constructor
     */
    var SuperUserRequestEvent = Class('ambrosia_web.event.events.SuperUserRequestEvent',
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.AndroidApicallEvent`
     * @constructor
     */
    var AndroidApicallEvent = Class('ambrosia_web.event.events.AndroidApicallEvent',
        A.event.BlockEvent, {});


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.CallLogAccessEvent`
     * @constructor
     */
    var CallLogAccessEvent = Class('ambrosia_web.event.events.CallLogAccessEvent',
        A.event.BlockEvent, {});


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.ContactAccessEvent`
     * @constructor
     */
    var ContactAccessEvent = Class('ambrosia_web.event.events.ContactAccessEvent',
        A.event.BlockEvent, {});


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.PhoneCallEvent`
     * @constructor
     */
    var PhoneCallEvent = Class('ambrosia_web.event.events.PhoneCallEvent',
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.SMSAccessEvent`
     * @constructor
     */
    var SMSAccessEvent = Class('ambrosia_web.event.events.SMSAccessEvent',
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
     * Represents :class:`ambrosia_plugins.lkm.events.ANANASAdbShellExecEvent`
     * @constructor
     */
    var ANANASAdbShellExecEvent = Class('ambrosia_web.event.events.ANANASAdbShellExecEvent',
        A.event.BlockEvent, { });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.LibraryLoadEvent`
     * @constructor
     */
    var LibraryLoadEvent = Class('ambrosia_web.event.events.LibraryLoadEvent',
        A.event.BlockEvent, {});


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.JavaLibraryLoadEvent`
     * @constructor
     */
    var JavaLibraryLoadEvent = Class('ambrosia_web.event.events.JavaLibraryLoadEvent',
        A.event.BlockEvent, {});


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.ZygoteForkEvent`
     * @constructor
     */
    var ZygoteForkEvent = Class('ambrosia_web.event.events.ZygoteForkEvent',
        A.event.BlockEvent, { });

    /**
     * Represents :class:`ambrosia_plugins.lkm.events.APKInstallEvent`
     * @constructor
     */
    var APKInstallEvent = Class('ambrosia_web.event.events.APKInstallEvent',
        A.event.BlockEvent, { });

    var evt_registry = {
        'ambrosia_plugins.events.ANANASEvent':                  ANANASEvent,
        'ambrosia_plugins.lkm.events.SyscallEvent':             SyscallEvent,
        'ambrosia_plugins.apimonitor.AndroidApicallEvent':      AndroidApicallEvent,
        'ambrosia_plugins.lkm.events.FileEvent':                FileEvent,
        'ambrosia_plugins.lkm.events.StartTaskEvent':           StartTaskEvent,
        'ambrosia_plugins.lkm.events.UnknownFdEvent':           UnknownFdEvent,
        'ambrosia_plugins.lkm.events.MemoryMapEvent':           MemoryMapEvent,
        'ambrosia_plugins.lkm.events.SocketEvent':              SocketEvent,
        'ambrosia_plugins.lkm.events.DeletePathEvent':          DeletePathEvent,
        'ambrosia_plugins.lkm.events.SendSignalEvent':          SendSignalEvent,
        'ambrosia_plugins.lkm.events.CreateDirEvent':           CreateDirEvent,
        'ambrosia_plugins.lkm.events.SocketAcceptEvent':        SocketAcceptEvent,
        'ambrosia_plugins.lkm.events.ExecEvent':                ExecEvent,
        'ambrosia_plugins.lkm.events.CommandExecuteEvent':      CommandExecuteEvent,
        'ambrosia_plugins.lkm.events.SuperUserRequestEvent':    SuperUserRequestEvent,
        'ambrosia_plugins.lkm.events.ANANASAdbShellExecEvent':  ANANASAdbShellExecEvent,
        'ambrosia_plugins.apimonitor.CallLogAccessEvent':       CallLogAccessEvent,
        'ambrosia_plugins.apimonitor.ContactAccessEvent':       ContactAccessEvent,
        'ambrosia_plugins.apimonitor.PhoneCallEvent':           PhoneCallEvent,
        'ambrosia_plugins.apimonitor.SMSAccessEvent':           SMSAccessEvent,
        'ambrosia_plugins.lkm.events.AnonymousFileEvent':       AnonymousFileEvent,
        'ambrosia_plugins.lkm.events.LibraryLoadEvent':         LibraryLoadEvent,
        'ambrosia_plugins.lkm.events.JavaLibraryLoadEvent':     JavaLibraryLoadEvent,
        'ambrosia_plugins.lkm.events.ZygoteForkEvent':          ZygoteForkEvent,
        'ambrosia_plugins.lkm.events.APKInstallEvent':          APKInstallEvent
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

