"use strict";

/**
 * @namespace contains all known events
 */
ambrosia_web.event.events = function(){
    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SyscallEvent`
     * @constructor
     */
    function SyscallEvent(){
        this.getColor = function(){ return '#cc9595'; };

    }
    SyscallEvent.prototype = new A.event.BlockEvent();
    SyscallEvent.filters = [new A.filter.Filter('false')];


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.StartTaskEvent`
     * @constructor
     */
    function StartTaskEvent(){
        this.getColor = function(){ return '#ff008a'; };
    }
    StartTaskEvent.filters = [
        new A.filter.Filter('is_process==false')
    ];
    StartTaskEvent.prototype = new A.event.BlockEvent();


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.MemoryMapEvent`
     * @constructor
     */
    function MemoryMapEvent(){
        this.getColor = function(){ return '#eb00ff'; };
    }
    MemoryMapEvent.prototype = new A.event.BlockEvent();
    MemoryMapEvent.filters = [new A.filter.Filter('anonymous==false')];


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.DeleteFileEvent`
     * @constructor
     */
    function DeleteFileEvent(){
        this.getColor = function(){ return '#c6005d'; };
    }
    DeleteFileEvent.filters = [
        new A.filter.Filter('file.abspath != "/data/ananaslkm.ko"')
    ];
    DeleteFileEvent.prototype = new A.event.BlockEvent();


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SendSignal`
     * @constructor
     */
    function SendSignal(){
        this.getColor = function(){ return '#ff9e9e'; };
    }
    SendSignal.prototype = new A.event.BlockEvent();


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.CreateDir`
     * @constructor
     */
    function CreateDir(){
        this.getColor = function(){ return '#f19eff'; };
    }
    CreateDir.prototype = new A.event.BlockEvent();


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SocketAccept`
     * @constructor
     */
    function SocketAccept(){
        this.getColor = function(){ return '#bb5cff'; };
    }
    SocketAccept.prototype = new A.event.BlockEvent();


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.FileEvent`
     * @constructor
     */
    function FileEvent(){
        this.getColor = function(){ return '#a6ff00'; };
    }
    FileEvent.prototype = new A.event.BlockEvent();
    FileEvent.filters = [
        new A.filter.Filter('!(abspath~"/proc/\\d+/oom_adj" && mode==131073)'),
        new A.filter.Filter('!(abspath~"/proc/\\d+/stat" && mode==131072)'),
        new A.filter.Filter('!(abspath~"/proc/\\d+/task" && mode==147456)'),
        new A.filter.Filter('!(abspath=="/proc/net/xt_qtaguid/iface_stat_fmt" && mode==131072)'),
        new A.filter.Filter('!(abspath=="/dev/binder" && mode==131074)'),
        new A.filter.Filter('!(abspath=="/dev/__properties__" && mode==688128)'),
        new A.filter.Filter('!(abspath=="/dev/ashmem" && mode==131074)'),
        new A.filter.Filter('!(abspath ~ "/system/framework/.*\\.jar" && mode==131072 && process.type=="ADBD_CHILD")')
    ];


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.AnonymousFileEvent`
     * @constructor
     */
    function AnonymousFileEvent(){
        this.getColor = function(){ return '#a6ff00'; };
    }
    AnonymousFileEvent.prototype = new A.event.BlockEvent();


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.UnknownFdEvent`
     * @constructor
     */
    function UnknownFdEvent(){
        this.getColor = function(){ return '#1dff00'; };
    }
    UnknownFdEvent.prototype = new A.event.BlockEvent();
    UnknownFdEvent.filters = [new A.filter.Filter('false')];


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SocketEvent`
     * @constructor
     */
    function SocketEvent(){
        this.getColor = function(){ return '#00ff6d'; };
    }
    SocketEvent.filters = [
        new A.filter.Filter('process.type != "ADBD"')
    ];
    SocketEvent.prototype = new A.event.BlockEvent();


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.CommandExecuteEvent`
     * @constructor
     */
    function CommandExecuteEvent(){
        this.getColor = function(){ return '#ff5600'; };
    }
    CommandExecuteEvent.prototype = new A.event.BlockEvent();


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.SuperUserRequest`
     * @constructor
     */
    function SuperUserRequest(){
        this.getColor = function(){ return '#ff9b00'; };
    }
    SuperUserRequest.prototype = new A.event.BlockEvent();


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.AndroidApicall`
     * @constructor
     */
    function AndroidApicall(){
        this.getColor = function(){ return '#a9cccc'; };
    }
    AndroidApicall.filters = [
        new A.filter.Filter('false')
    ];
    AndroidApicall.prototype = new A.event.BlockEvent();


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.CallLogAccess`
     * @constructor
     */
    function CallLogAccess(){
        this.getColor = function(){ return '#ffce00'; };
    }
    CallLogAccess.prototype = new A.event.BlockEvent();


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.ContactsAccess`
     * @constructor
     */
    function ContactsAccess(){
        this.getColor = function(){ return '#ebff00'; };
    }
    ContactsAccess.prototype = new A.event.BlockEvent();


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.PhoneCall`
     * @constructor
     */
    function PhoneCall(){
        this.getColor = function(){ return '#b7ff00'; };
    }
    PhoneCall.prototype = new A.event.BlockEvent();


    /**
     * Represents :class:`ambrosia_plugins.apimonitor.SMSAccess`
     * @constructor
     */
    function SMSAccess(){
        this.getColor = function(){ return '#84ff00'; };
    }
    SMSAccess.prototype = new A.event.BlockEvent();


    /**
     * Represents :class:`ambrosia_plugins.events.ANANASEvent`
     * @constructor
     */
    function ANANASEvent(){
    }
    ANANASEvent.prototype = new A.event.LineEvent();


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.ExecEvent`
     * @constructor
     */
    function ExecEvent(){
        this.getColor = function(){ return '#000000'; };
    }
    ExecEvent.prototype = new A.event.BlockEvent();
    

    /**
     * Represents :class:`ambrosia_plugins.lkm.events.ANANASAdbShellExec`
     * @constructor
     */
    function ANANASAdbShellExec(){
        this.getColor = function(){ return '#000000'; };
    }
    ANANASAdbShellExec.prototype = new A.event.BlockEvent();


    /**
     * Represents :class:`ambrosia_plugins.lkm.events.LibraryLoad`
     * @constructor
     */
    function LibraryLoad(){
        this.getColor = function(){ return '#000000'; };
    }
    LibraryLoad.filters = [
        new A.filter.Filter("false")
    ];
    LibraryLoad.prototype = new A.event.BlockEvent();


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

