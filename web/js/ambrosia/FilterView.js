"use strict";

function FilterView(){
}

FilterView.prototype.setup = function(){
    this.redraw();
}

FilterView.prototype._addFilterLine = function(filter, tab){
    var tdf = $('<tr/>').append(filter.getInput());
    var trf = $('<tr/>').append(tdf);
    
    tab.append(trf);
}

FilterView.prototype._makeaddLinkClickCallback = function(evtcls, tab){
    var ths = this;
    
    function cb(){
        var filter = new Filter();
        
        if(!evtcls.filters){
            evtcls.filters = [];
        }
        
        evtcls.filters.push(filter);
        ths._addFilterLine(filter, tab);
    }
    return cb;
}

FilterView.prototype.redraw = function(){
    var ths = this;

    for(var e in Event.event_registry){
        var tab = $('<table/>');
        var evtcls = Event.event_registry[e];
        
        var addlink = $('<a href="javascript:void(0)">add</a>');
        var th = $('<th/>').text(e).append(addlink);
        var tr = $('<tr/>').append(th);
        
        tab.append(tr);
        
        if(evtcls.filters){
            for(var f in evtcls.filters){
                this._addFilterLine(evtcls.filters[f], tab);
            }
        }
        
        addlink.click(this._makeaddLinkClickCallback(evtcls, tab));
        
        $('#filterview').append(tab);
    }
}
