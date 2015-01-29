"use strict";

ambrosia.event.events = function(){
    function SyscallEvent(){
        this.getColor = function(){ return '#cc9595'; };

    }
    SyscallEvent.prototype = new A.event.BlockEvent();
    SyscallEvent.filters = [new A.filter.Filter('0==1')];


    function StartTaskEvent(){
        this.getColor = function(){ return '#ff008a'; };
    }
    StartTaskEvent.filters = [
        new A.filter.Filter('is_process==false')
    ];
    StartTaskEvent.prototype = new A.event.BlockEvent();


    function MemoryMapEvent(){
        this.getColor = function(){ return '#eb00ff'; };
    }
    MemoryMapEvent.prototype = new A.event.BlockEvent();
    MemoryMapEvent.filters = [new A.filter.Filter('anonymous==false')];


    function DeleteFileEvent(){
        this.getColor = function(){ return '#c6005d'; };
    }
    DeleteFileEvent.filters = [
        new A.filter.Filter('file.abspath != "/data/ananaslkm.ko"')
    ];
    DeleteFileEvent.prototype = new A.event.BlockEvent();


    function SendSignal(){
        this.getColor = function(){ return '#ff9e9e'; };
    }
    SendSignal.prototype = new A.event.BlockEvent();


    function CreateDir(){
        this.getColor = function(){ return '#f19eff'; };
    }
    CreateDir.prototype = new A.event.BlockEvent();


    function SocketAccept(){
        this.getColor = function(){ return '#bb5cff'; };
    }
    SocketAccept.prototype = new A.event.BlockEvent();


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


    function AnonymousFileEvent(){
        this.getColor = function(){ return '#a6ff00'; };
    }
    AnonymousFileEvent.prototype = new A.event.BlockEvent();


    function UnknownFdEvent(){
        this.getColor = function(){ return '#1dff00'; };
    }
    UnknownFdEvent.prototype = new A.event.BlockEvent();
    UnknownFdEvent.filters = [new A.filter.Filter('0==1')];


    function SocketEvent(){
        this.getColor = function(){ return '#00ff6d'; };
    }
    SocketEvent.filters = [
        new A.filter.Filter('process.type != "ADBD"')
    ];
    SocketEvent.prototype = new A.event.BlockEvent();


    function CommandExecuteEvent(){
        this.getColor = function(){ return '#ff5600'; };
    }
    CommandExecuteEvent.prototype = new A.event.BlockEvent();


    function SuperUserRequest(){
        this.getColor = function(){ return '#ff9b00'; };
    }
    SuperUserRequest.prototype = new A.event.BlockEvent();


    function AndroidApicall(){
        this.getColor = function(){ return '#a9cccc'; };
    }
    AndroidApicall.filters = [
        new A.filter.Filter('1==0')
    ];
    AndroidApicall.prototype = new A.event.BlockEvent();


    function CallLogAccess(){
        this.getColor = function(){ return '#ffce00'; };
    }
    CallLogAccess.prototype = new A.event.BlockEvent();


    function ContactsAccess(){
        this.getColor = function(){ return '#ebff00'; };
    }
    ContactsAccess.prototype = new A.event.BlockEvent();


    function PhoneCall(){
        this.getColor = function(){ return '#b7ff00'; };
    }
    PhoneCall.prototype = new A.event.BlockEvent();


    function SMSAccess(){
        this.getColor = function(){ return '#84ff00'; };
    }
    SMSAccess.prototype = new A.event.BlockEvent();


    function ANANASEvent(){
    }
    ANANASEvent.prototype = new A.event.LineEvent();

    function ExecEvent(){
        this.getColor = function(){ return '#000000'; };
    }
    ExecEvent.prototype = new A.event.BlockEvent();
    
    
    function ANANASAdbShellExec(){
        this.getColor = function(){ return '#000000'; };
    }
    ANANASAdbShellExec.prototype = new A.event.BlockEvent()

    return {
        event_registry: {
            'ambrosia_plugins.events.ANANASEvent': ANANASEvent,
            'ambrosia_plugins.lkm.events.SyscallEvent': SyscallEvent,
            'ambrosia_plugins.apimonitor.AndroidApicall': AndroidApicall,
            'ambrosia_plugins.lkm.events.FileEvent': FileEvent,
            'ambrosia_plugins.lkm.events.StartTaskEvent': StartTaskEvent,
            'ambrosia_plugins.lkm.events.UnknownFdEvent': UnknownFdEvent,
            'ambrosia_plugins.lkm.events.MemoryMapEvent': MemoryMapEvent,
            'ambrosia_plugins.lkm.events.SocketEvent': SocketEvent,
            'ambrosia_plugins.lkm.events.DeleteFileEvent': DeleteFileEvent,
            'ambrosia_plugins.lkm.events.SendSignal': SendSignal,
            'ambrosia_plugins.lkm.events.CreateDir': CreateDir,
            'ambrosia_plugins.lkm.events.SocketAccept': SocketAccept,
            'ambrosia_plugins.lkm.events.ExecEvent': ExecEvent,
            'ambrosia_plugins.lkm.events.CommandExecuteEvent': CommandExecuteEvent,
            'ambrosia_plugins.lkm.events.SuperUserRequest': SuperUserRequest,
            'ambrosia_plugins.lkm.events.ANANASAdbShellExec': ANANASAdbShellExec,
            'ambrosia_plugins.apimonitor.CallLogAccess': CallLogAccess,
            'ambrosia_plugins.apimonitor.ContactsAccess': ContactsAccess,
            'ambrosia_plugins.apimonitor.PhoneCall': PhoneCall,
            'ambrosia_plugins.apimonitor.SMSAccess': SMSAccess,
            'ambrosia_plugins.lkm.events.AnonymousFileEvent': AnonymousFileEvent
        }
    };
}();

