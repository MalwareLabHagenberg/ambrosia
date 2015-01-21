"use strict";

function SyscallEvent(){
}
SyscallEvent.prototype = new BlockEvent();
SyscallEvent.prototype.getColor = function(){ return '#cc9595'; }
SyscallEvent.filters = [new Filter('1==1')];

function StartThreadEvent(){
}
StartThreadEvent.prototype = new BlockEvent();
StartThreadEvent.prototype.getColor = function(){ return '#ff008a'; }

function MemoryMapEvent(){
}
MemoryMapEvent.prototype = new BlockEvent();
MemoryMapEvent.prototype.getColor = function(){ return '#eb00ff'; }
MemoryMapEvent.filters = [new Filter('anonymous==true')]

function DeleteFileEvent(){
}
DeleteFileEvent.prototype = new BlockEvent();
DeleteFileEvent.prototype.getColor = function(){ return '#c6005d'; }

function SendSignal(){
}
SendSignal.prototype = new BlockEvent();
SendSignal.prototype.getColor = function(){ return '#ff9e9e'; }

function CreateDir(){
}
CreateDir.prototype = new BlockEvent();
CreateDir.prototype.getColor = function(){ return '#f19eff'; }

function SocketAccept(){
}
SocketAccept.prototype = new BlockEvent();
SocketAccept.prototype.getColor = function(){ return '#bb5cff'; }




function FileEvent(){
}
FileEvent.prototype = new BlockEvent();
FileEvent.prototype.getColor = function(){ return '#a6ff00'; }
FileEvent.filters = [
    new Filter('abspath~"/proc/\\d+/oom_adj" && mode==131073'),
    new Filter('abspath~"/proc/\\d+/stat" && mode==131072'),
    new Filter('abspath~"/proc/\\d+/task" && mode==147456'),
    new Filter('abspath=="/proc/net/xt_qtaguid/iface_stat_fmt" && mode==131072'),
    new Filter('abspath=="/dev/binder" && mode==131074'),
    new Filter('abspath=="/dev/__properties__" && mode==688128'),
    new Filter('abspath=="/dev/ashmem" && mode==131074'),
];

function AnonymousFileEvent(){
}
AnonymousFileEvent.prototype = new BlockEvent();
AnonymousFileEvent.prototype.getColor = function(){ return '#a6ff00'; }

function UnknownFdEvent(){
}
UnknownFdEvent.prototype = new BlockEvent();
UnknownFdEvent.prototype.getColor = function(){ return '#1dff00'; }
UnknownFdEvent.filters = [new Filter('1==1')];

function SocketEvent(){
}
SocketEvent.prototype = new BlockEvent();
SocketEvent.prototype.getColor = function(){ return '#00ff6d'; }



function CommandExecuteEvent(){
}
CommandExecuteEvent.prototype = new BlockEvent();
CommandExecuteEvent.prototype.getColor = function(){ return '#ff5600'; }

function SuperUserRequest(){
}
SuperUserRequest.prototype = new BlockEvent();
SuperUserRequest.prototype.getColor = function(){ return '#ff9b00'; }


function AndroidApicall(){
}
AndroidApicall.prototype = new BlockEvent();
AndroidApicall.prototype.getColor = function(){ return '#a9cccc'; }

function CallLogAccess(){
}
CallLogAccess.prototype = new BlockEvent();
CallLogAccess.prototype.getColor = function(){ return '#ffce00'; }

function ContactsAccess(){
}
ContactsAccess.prototype = new BlockEvent();
ContactsAccess.prototype.getColor = function(){ return '#ebff00'; }

function PhoneCall(){
}
PhoneCall.prototype = new BlockEvent();
PhoneCall.prototype.getColor = function(){ return '#b7ff00'; }

function SMSAccess(){
}
SMSAccess.prototype = new BlockEvent();
SMSAccess.prototype.getColor = function(){ return '#84ff00'; }

function InvisibleEvent(){
}
InvisibleEvent.prototype = new Event();
InvisibleEvent.prototype.draw = function(){}
InvisibleEvent.prototype.calcDimensions = function(blockLayoutManager){ }

function ANANASEvent(){
}
ANANASEvent.prototype = new LineEvent();
/*
ANANASEvent.prototype.draw = function(){
    switch(this.properties.name){
    case 'start_emulator':  this.drawLine('#00ff00', 10); break;
    case 'emulator_booted': this.drawLine('#00ffff', 10); break;
    default:                this.drawLine('#ff0000',  1); break;
    }
}
*/
Event.event_registry = {
        'ambrosia_plugins.events.ANANASEvent': ANANASEvent,
        'ambrosia_plugins.lkm.events.SyscallEvent': SyscallEvent,
        'ambrosia_plugins.apimonitor.AndroidApicall': AndroidApicall,
        'ambrosia_plugins.lkm.events.FileEvent': FileEvent,
        'ambrosia_plugins.lkm.events.StartThreadEvent': StartThreadEvent,
        'ambrosia_plugins.lkm.events.UnknownFdEvent': UnknownFdEvent,
        'ambrosia_plugins.lkm.events.MemoryMapEvent': MemoryMapEvent,
        'ambrosia_plugins.lkm.events.SocketEvent': SocketEvent,
        'ambrosia_plugins.lkm.events.DeleteFileEvent': DeleteFileEvent,
        'ambrosia_plugins.lkm.events.SendSignal': SendSignal,
        'ambrosia_plugins.lkm.events.CreateDir': CreateDir,
        'ambrosia_plugins.lkm.events.SocketAccept': SocketAccept,
        'ambrosia_plugins.lkm.events.ExecEvent': InvisibleEvent,
        'ambrosia_plugins.lkm.events.CommandExecuteEvent': CommandExecuteEvent,
        'ambrosia_plugins.lkm.events.SuperUserRequest': SuperUserRequest,
        'ambrosia_plugins.lkm.events.ANANASAdbShellExec': InvisibleEvent,
        'ambrosia_plugins.apimonitor.CallLogAccess': CallLogAccess,
        'ambrosia_plugins.apimonitor.ContactsAccess': ContactsAccess,
        'ambrosia_plugins.apimonitor.PhoneCall': PhoneCall,
        'ambrosia_plugins.apimonitor.SMSAccess': SMSAccess,
        'ambrosia_plugins.lkm.events.AnonymousFileEvent': AnonymousFileEvent
    };

