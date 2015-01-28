"use strict";

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
    // TODO listener
    var drawing = busy('Drawing');
    mainView.redraw();
    drawing.finish();
    $(".filterinput").removeClass('filterchanged');
}

var log = new Log();
var mainView = new MainView();
var detailsView = new DetailsView();
var filterView = new FilterView();
var entityView = new EntityView();
var ts_offset = 0;

$(document).ready(function(){
    var loading = busy('loading JSON data');
    
    $.ajax('test.json', {success: function(r){
        window.am = deserialize(r[0], r[1]);
        
        for(var i in window.am.entities){
            window.am.entities[i] = Entity.enrich(window.am.entities[i]);
        }
        
        for(var i in window.am.entities){
            window.am.entities[i].resolveReferences();
        }
        
        for(var i in window.am.events){
            window.am.events[i] = Event.enrich(window.am.events[i]);
        }
        window.ts_offset = window.am.start_time;
        loading.finish();
        mainView.setup();
        detailsView.setup();
        filterView.setup();
        entityView.setup();
    }})
});

