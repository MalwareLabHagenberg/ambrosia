"use strict";

function enrichElement(el, parent){
    var new_el = new (Event.event_registry[el.type]);
    
    for(var i in el){
        new_el[i] = el[i];
    }
    
    new_el.parent = parent;
    
    for(var i in new_el.children){
        new_el.children[i] = enrichElement(new_el.children[i], new_el);
    }
    
    return new_el;
}

var log = new Log();
var mainView = new MainView();
var ts_offset = 0;

$(document).ready(function(){
    var loading = busy('loading JSON data');
    
    $.ajax('test.json', {success: function(r){
        window.am = r;
        for(var i in window.am.events){
            window.am.events[i] = enrichElement(window.am.events[i]);
        }
        window.ts_offset = window.am.start_time;
        loading.finish();
        mainView.setup();
    }})
    $('#zoom').on('input', zoom);
});

