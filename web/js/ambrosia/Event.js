"use strict";


function Event(){
}

Event.onSelectHandler = [];
Event.onUnSelectHandler = [];
Event.addFilterHandler = [];
Event.removeFilterHandler = [];
Event.event_registry = {}
Event.generalFilters = [];
Event._selected = [];
Event.DEFAULT_BLOCK_LAYOUT_MAMAGER = new BlockLayoutManager();
Event.prototype.draw = function(){ assert(false); }
Event.prototype.calcDimensions = function(blockLayoutManager){ }

Event.enrich = function(el, parent){
    var new_el = new (Event.event_registry[el.type]);
    
    for(var i in el){
        new_el[i] = el[i];
    }
    
    new_el.parent = parent;
    
    for(var i in new_el.children){
        new_el.children[i] = Event.enrich(new_el.children[i], new_el);
    }
    
    for(var i in new_el.references){
        assert(window.am.entities[new_el.references[i]] instanceof Entity);
        new_el.references[i] = window.am.entities[new_el.references[i]];
    }
    
    return new_el;
}

Event.getEffectiveFilters = function(cls){
    var res = [];
    
    if(cls.filters){
        for(var i in cls.filters){
            res.push(cls.filters[i]);
        }
    }
    
    for(var i in Event.generalFilters){
        res.push(Event.generalFilters[i]);
    }

    return res;
}

Event.getFilters = function(cls){
    if(!cls){
        return Event.generalFilters;
    }else{
        if(!cls.filters){
            cls.filters = [];
        }
        
        return cls.filters;
    }
}

Event.addFilter = function(cls, filter){
    var filters = Event.generalFilters;
    
    if(cls){
        if(!cls.filters){
            cls.filters = [];
        }
        
        filters = cls.filters;
    }
    
    filters.push(filter);
    
    for(var i in Event.addFilterHandler){
        Event.addFilterHandler[i](cls, filter);
    }
    
    redraw();
}

Event.removeFilter = function(filter){
    for(var i in Event.generalFilters){
        if(Event.generalFilters[i] == filter){
            Event.generalFilters.splice(i, 1);
        }
    }
    
    for(var type in Event.event_registry){
        var filters = Event.getFilters(Event.event_registry[type]);
        
        for(var i in filters){
            if(filters[i] == filter){
                filters.splice(i, 1);
            }
        }
    }
    
    for(var i in Event.removeFilterHandler){
        Event.removeFilterHandler[i](filter);
    }
    
    redraw();
}

Event.reset = function(){
    Event.DEFAULT_BLOCK_LAYOUT_MAMAGER = new BlockLayoutManager();
}

Event.prototype.calcVisible = function(){
    this.visible = true;

    var childForcesShow = false
    for(var i in this.children){
        childForcesShow = childForcesShow || this.children[i].calcVisible();
    }
    
    if(childForcesShow){
        /* child forces parent views */
        return true; // also force parent to show parents
    }
    

    /* visibility is not forced by any child */
    var filters = Event.getEffectiveFilters(Event.event_registry[this.type]);
    var forceShowParents = false;
    
    for(var i in filters){
        if(filters[i].evaluate(this) == false){
            /* filter explicitly says hide */
            this.visible = false;
            return false;
        }
        
        /* filter says "visible", does it force show parents? */
        forceShowParents = forceShowParents || filters[i].forcesShowParents();
    }
    
    /* all filters match */
    return forceShowParents;
}

Event.prototype.getLink = function(){
    var a = $('<a href="javascript:void(0)">');
    var ths = this;
    
    a.click(function(){
        ths.select();
    });
    
    a.text(this.description);
    a.addClass('event_link');
    
    return a;
}

Event.clearSelect = function(){
    for(var i in Event._selected){
        Event._selected[i].unselect();
    }
}

Event.prototype.select = function(){
    Event.clearSelect();
    this.selectAdd();
}

Event.prototype.selectAdd = function(){
    for(var i in Event.onSelectHandler){
        Event.onSelectHandler[i].apply(this);
    }
    
    Event._selected.push(this);
}


Event.prototype.unselect = function(){
    var idx = Event._selected.indexOf(this);
    
    if(idx == -1){
        log.W('unselecting not selected event');
        return;
    }

    for(var i in Event.onUnSelectHandler){
        Event.onUnSelectHandler[i].apply(this);
    }
    
    Event._selected.splice(idx, 1);
}

Event.prototype.toString = function(){
    return this.description;
}

function BlockEvent(){
}

BlockEvent.prototype = new Event();

BlockEvent.DEFAULT_HEIGHT = 0.1;
BlockEvent.WIDTH = 20;
BlockEvent.PADDING = 8;
BlockEvent.MARGIN_X = 4;
BlockEvent.MARGIN_Y = 3;


BlockEvent.prototype.draw = function(xOffset){
    if(!this.visible){
        return;
    }

    var ths = this;

    if(!xOffset) {
        xOffset = MainView.X_OFFSET;
    }
    
    this.svgElement = mainView.svg.rect(
        mainView.g_events, 
        xOffset + this.dimensions.getX(), this.dimensions.getY(), 
        this.dimensions.getWidth(), this.dimensions.getHeight(), 
        {fill: this.getColor()});
    
    $(this.svgElement).addClass('mainview_block');
    
    for(var i in this.children){
        this.children[i].draw(BlockEvent.PADDING + xOffset + this.dimensions.getX());
    }

        
    $(this.svgElement).click(function(){
        ths.select();
    });
}


BlockEvent.prototype.calcDimensions = function(blockLayoutManager){
    assert(blockLayoutManager instanceof BlockLayoutManager);
    
    if(!this.visible){
        return;
    }

    var startTS = this.startTS;
    var endTS = this.endTS;
    
    var begin = null;
    var end = null;
    
    if(startTS != null){
        begin = startTS - ts_offset;
    }
    
    if(endTS != null){
        end = endTS - ts_offset;
    }
    
    if(begin == null){
        begin = end - BlockEvent.DEFAULT_HEIGHT;
    }else if(end == null){
        end = begin + BlockEvent.DEFAULT_HEIGHT;
    }
    
    if((end - begin) < BlockEvent.DEFAULT_HEIGHT){
        end = begin + BlockEvent.DEFAULT_HEIGHT;
    }
    
    this.dimensions = new Dimensions(0, begin * 1000, BlockEvent.WIDTH, (end - begin) * 1000);
    
    var childBlockLayoutManager = new BlockLayoutManager();
    
    for(var i in this.children){
        this.children[i].calcDimensions(childBlockLayoutManager);
    }
    
    this.dimensions.setWidth(Math.max(
        childBlockLayoutManager.getWidth() + 2*BlockEvent.PADDING, 
        this.dimensions.getWidth()));
        
    this.dimensions.setHeight(Math.max(
        childBlockLayoutManager.getEndY() - this.dimensions.getY(), 
        this.dimensions.getHeight()));
    
    this.dimensions = blockLayoutManager.fitBlock(this.dimensions, BlockEvent.MARGIN_X, BlockEvent.MARGIN_Y);
}

function LineEvent(){
}

LineEvent.prototype = new Event();

LineEvent.prototype.calcDimensions = function(blockLayoutManager){
}

LineEvent.prototype.draw = function(){
    if(!this.visible)
        return;

    var width = 1.0;
    var pos = (this.startTS - ts_offset) * 1000;
    
    this.svgElement = mainView.svg.line(
        mainView.g_events, 
        MainView.X_OFFSET, 
        pos, 
        mainView.getWidth(), 
        pos, 
        {stroke: '#ffff00', 
         fill: 'none', 
         strokeWidth: width});
}

