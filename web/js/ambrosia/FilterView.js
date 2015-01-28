"use strict";

function FilterView(){
    this._tab_registry = [];
}

FilterView.prototype.setup = function(){
    this.redraw();
}

FilterView.prototype._addFilterLine = function(filter, tab){
    var tdf = $('<tr/>').append(filter.getInput());
    var trf = $('<tr/>').append(tdf);
    
    tab.append(trf);
}

FilterView.prototype._removeFilterLine = function(filter){
    filter.getInput().remove();
}


FilterView.prototype._addFilters = function(evtcls, text, filters){
    var tab = $('<table/>');
    
    var addlink = $('<a href="javascript:void(0)">add</a>');
    var th = $('<th/>').text(text).append(addlink);
    var tr = $('<tr/>').append(th);
    
    tab.append(tr);
    
    for(var f in filters){
        this._addFilterLine(filters[f], tab);
    }
    
    addlink.click(function(){
        var filter = new Filter();
        
        Event.addFilter(evtcls, filter);
    });

    this._tab_registry.push([evtcls, tab]);
    
    $('#filterview').append(tab);
}

FilterView.prototype._getTab = function(evtcls){
    for(var i in this._tab_registry){
        var t = this._tab_registry[i];
        
        if(t[0] == evtcls){
            return t[1];
        }
    }
}

Event.addFilterHandler.push(function(evtcls, filter){
    filterView._addFilterLine(filter, filterView._getTab(evtcls));
});

Event.removeFilterHandler.push(function(filter){
    filterView._removeFilterLine(filter);
});

FilterView.prototype.redraw = function(){
    var ths = this;

    for(var e in Event.event_registry){
        var evtcls = Event.event_registry[e];
        var filters = Event.getFilters(evtcls);
        this._addFilters(evtcls, e, filters);
    }
    
    this._addFilters(null, 'general', Event.getFilters(null));
    
    var applyButton = $('<button type="button"/>').text('Apply');
    applyButton.click(function(){
        redraw();
    });
    
    $('#filterview').append(applyButton);
}

