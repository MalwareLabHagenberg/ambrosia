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
        getColor: function(){ return '#cc9595'; },
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
        getColor: function(){ return '#ff008a'; },
        filters: [
            new A.filter.BlacklistFilter('p.is_process==false', 'hide forks that spawn a thread')
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.MemoryMapEvent`
     * @constructor
     */
    var MemoryMapEvent = Class('ambrosia_web.event.events.MemoryMapEvent',
        A.event.BlockEvent, {
        getColor: function(){ return '#eb00ff'; },
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
        getColor: function(){ return '#c6005d'; },
        filters: [
            new A.filter.BlacklistFilter('r.file.abspath != "/data/ananaslkm.ko"',
                'hide the removal of the lkm file (done by ANANAS)')
        ]
    });
    

    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SendSignal`
     * @constructor
     */
    var SendSignal = Class('ambrosia_web.event.events.SendSignal',
        A.event.BlockEvent, {
        getColor: function(){ return '#ff9e9e'; },
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.CreateDir`
     * @constructor
     */
    var CreateDir = Class('ambrosia_web.event.events.CreateDir',
        A.event.BlockEvent, {
        getColor: function(){ return '#f19eff'; },
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SocketAccept`
     * @constructor
     */
    var SocketAccept = Class('ambrosia_web.event.events.SocketAccept',
        A.event.BlockEvent, {
        getColor: function(){ return '#bb5cff'; },
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.FileEvent`
     * @constructor
     */
    var FileEvent = Class('ambrosia_web.event.events.FileEvent',
        A.event.BlockEvent, {
        getColor: function(){ return '#a6ff00'; },
        filters: [
            new A.filter.BlacklistFilter('!(p.abspath~"^/proc/\\d+/oom_adj$" && p.mode==131073)', ''),
            new A.filter.BlacklistFilter('!(p.abspath~"^/proc/\\d+/stat$" && p.mode==131072)', ''),
            new A.filter.BlacklistFilter('!(p.abspath~"^/proc/\\d+/task$" && p.mode==147456)', ''),
            new A.filter.BlacklistFilter('!(p.abspath=="/proc/net/xt_qtaguid/iface_stat_fmt" && p.mode==131072)', ''),
            new A.filter.BlacklistFilter('!(p.abspath=="/dev/binder" && p.mode==131074)', ''),
            new A.filter.BlacklistFilter('!(p.abspath=="/dev/__properties__" && p.mode==688128)', ''),
            new A.filter.BlacklistFilter('!(p.abspath=="/dev/ashmem" && p.mode==131074)', ''),
            new A.filter.BlacklistFilter(
                '!(p.abspath ~ "/system/framework/.*\\.jar" && p.mode==131072 && r.process.p.type=="ADBD_CHILD")',
                '')
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.AnonymousFileEvent`
     * @constructor
     */
    var AnonymousFileEvent = Class('ambrosia_web.event.events.AnonymousFileEvent',
        A.event.BlockEvent, {
        getColor: function(){ return '#a6ff00'; },
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.UnknownFdEvent`
     * @constructor
     */
    var UnknownFdEvent = Class('ambrosia_web.event.events.UnknownFdEvent',
        A.event.BlockEvent, {
        getColor: function(){ return '#1dff00'; },
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
        getColor: function(){ return '#00ff6d'; },
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
        getColor: function(){ return '#ff5600'; },
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SuperUserRequest`
     * @constructor
     */
    var SuperUserRequest = Class('ambrosia_web.event.events.SuperUserRequest',
        A.event.BlockEvent, {
        getColor: function(){ return '#ff9b00'; },
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.AndroidApicall`
     * @constructor
     */
    var AndroidApicall = Class('ambrosia_web.event.events.AndroidApicall',
        A.event.BlockEvent, {
        getColor: function(){ return '#a9cccc'; },
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
        getColor: function(){ return '#ffce00'; },
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.ContactsAccess`
     * @constructor
     */
    var ContactsAccess = Class('ambrosia_web.event.events.ContactsAccess',
        A.event.BlockEvent, {
        getColor: function(){ return '#ebff00'; },
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.PhoneCall`
     * @constructor
     */
    var PhoneCall = Class('ambrosia_web.event.events.PhoneCall',
        A.event.BlockEvent, {
        getColor: function(){ return '#b7ff00'; },
        filters: [
        ]
    });


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.SMSAccess`
     * @constructor
     */
    var SMSAccess = Class('ambrosia_web.event.events.SMSAccess',
        A.event.BlockEvent, {
        getColor: function(){ return '#84ff00'; },
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
        getColor: function(){ return '#000000'; },
        filters: [
        ]
    });
    

    /**
     * Represents :class:`ambrosia_plugins.lkm.events.ANANASAdbShellExec`
     * @constructor
     */
    var ANANASAdbShellExec = Class('ambrosia_web.event.events.ANANASAdbShellExec',
        A.event.BlockEvent, {
        getColor: function(){ return '#000000'; },
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
        getColor: function(){ return '#000000'; },
        filters: [
            new A.filter.BlacklistFilter("false", 'hide all library loads')
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
        'ambrosia_plugins.lkm.events.LibraryLoad':          LibraryLoad
    };

    var ret = {
        event_registry: evt_registry
    };

    for(var i in evt_registry){
        ret[i.substr(i.lastIndexOf('.') + 1)] = evt_registry[i];
    }

    return ret;
}();

