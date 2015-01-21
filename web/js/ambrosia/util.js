"use strict";

function Log(){
    this.log = function (str, level){
        console.log(level+": "+str);
    }

    this.D = function(str){
        this.log(str, "DEBUG");
    }

    this.E = function(str){
        this.log(str, "ERROR");
    }
}

function assert(b){
    if(b === false){
        throw "Assertion failed";
    }
}

function busy(msg){
    var busybox = $('<div class="busybox"/>').text(msg);
    $('#busyindicator').append(busybox)
    
    function createRet(bb){
        return {
            'finish': function(){
                bb.remove();
            }
        }
    }
    
    return createRet(busybox);
}
