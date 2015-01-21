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

function deserialize(obj, objs){
    if(obj*1 == obj){
        return objs[obj];
    }else if(obj instanceof Array){
        ret = [];
        
        for(var i in obj){
            ret.push(deserialize(obj[i], objs));
        }
        
        return ret;
    }else if(typeof(obj) == 'object'){
        var ret = {};
        for(var i in obj){
            ret[deserialize(i, objs)] = deserialize(obj[i], objs);
        }
        return ret;
    }else{
        assert(false);
    }
}

function redraw(){
    var drawing = busy('Drawing');
    mainView.redraw();
    drawing.finish();
}

var log = new Log();
var mainView = new MainView();
var detailsView = new DetailsView();
var filterView = new FilterView();
var ts_offset = 0;

$(document).ready(function(){
    var loading = busy('loading JSON data');
    
    $.ajax('test.json', {success: function(r){
        window.am = deserialize(r[0], r[1]);
        for(var i in window.am.events){
            window.am.events[i] = enrichElement(window.am.events[i]);
        }
        window.ts_offset = window.am.start_time;
        loading.finish();
        mainView.setup();
        detailsView.setup();
        filterView.setup();
    }})
});

