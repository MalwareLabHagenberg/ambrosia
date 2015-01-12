"use strict";

function SyscallEvent(){
}
SyscallEvent.prototype = new BlockEvent();
SyscallEvent.prototype.draw = function(){}

function GenericEvent(){
}
GenericEvent.prototype = new BlockEvent();

function InvisibleEvent(){
}
InvisibleEvent.prototype = new BlockEvent();
InvisibleEvent.prototype.draw = function(){}

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
        'ambrosia_plugins.apimonitor.AndroidApicall': GenericEvent,
        'ambrosia_plugins.lkm.events.FileEvent': InvisibleEvent,
        'ambrosia_plugins.lkm.events.StartThreadEvent': InvisibleEvent,
        'ambrosia_plugins.lkm.events.FileDescriptorEvent': InvisibleEvent,
        'ambrosia_plugins.lkm.events.MemoryMapEvent': GenericEvent,
        'ambrosia_plugins.lkm.events.SocketEvent': GenericEvent,
        'ambrosia_plugins.lkm.events.DeleteFileEvent': GenericEvent,
        'ambrosia_plugins.lkm.events.SendSignal': GenericEvent,
        'ambrosia_plugins.lkm.events.CreateDir': GenericEvent,
        'ambrosia_plugins.lkm.events.SocketAccept': GenericEvent,
        'ambrosia_plugins.lkm.events.ExecEvent': InvisibleEvent,
        'ambrosia_plugins.lkm.events.CommandExecuteEvent': GenericEvent,
        'ambrosia_plugins.lkm.events.SuperUserRequest': GenericEvent,
        'ambrosia_plugins.lkm.events.ANANASAdbShellExec': InvisibleEvent,
        'ambrosia_plugins.apimonitor.CallLogAccess': GenericEvent,
        'ambrosia_plugins.apimonitor.ContactsAccess': GenericEvent,
        'ambrosia_plugins.apimonitor.PhoneCall': GenericEvent,
        'ambrosia_plugins.apimonitor.SMSAccess': GenericEvent
    };

