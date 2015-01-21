"use strict";


function Event(){
}

Event.onSelectHandler = [];
Event.event_registry = {}
Event.DEFAULT_BLOCK_LAYOUT_MAMAGER = new BlockLayoutManager();
Event.prototype.draw = function(){ assert(false); }
Event.prototype.calcDimensions = function(blockLayoutManager){ }

Event.reset = function(){
    Event.DEFAULT_BLOCK_LAYOUT_MAMAGER = new BlockLayoutManager();
}

Event.prototype.getFilters = function(){
    var f = Event.event_registry[this.type].filters;
    if(f){
        return f;
    }

    return [];
}

Event.prototype.isVisible = function(){
    var filters = this.getFilters();
    for(var i in filters){
        if(filters[i].evaluate(this) == true){
            return false;
        }
    }
    
    return true;
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

Event.prototype.select = function(){
    for(var i in Event.onSelectHandler){
        Event.onSelectHandler[i].apply(this);
    }
}

Event.prototype.toString = function(){
    return this.description;
}

function BlockEvent(){
}

BlockEvent.prototype = new Event();

BlockEvent.DEFAULT_HEIGHT = 0.1;
BlockEvent.WIDTH = 50;
BlockEvent.MARGIN = 5;
BlockEvent.X_OFFSET = 55;


BlockEvent.prototype.draw = function(xOffset){
    if(!this.visible){
        return;
    }

    var ths = this;

    if(!xOffset) {
        xOffset = BlockEvent.X_OFFSET;
    }
    
    this.svgElement = mainView.svg.rect(
        mainView.g_events, 
        xOffset + this.dimensions.getX(), this.dimensions.getY(), 
        this.dimensions.getWidth(), this.dimensions.getHeight(), 
        {stroke: '#000000', 
         fill: this.getColor(), 
         strokeWidth: 0.001,
         fillOpacity: 0.8, 
         strokeOpacity: 0.1});
    
    for(var i in this.children){
        this.children[i].draw(BlockEvent.MARGIN + xOffset + this.dimensions.getX());
    }

        
    $(this.svgElement).click(function(){
        ths.select();
    });
}


BlockEvent.prototype.calcDimensions = function(blockLayoutManager){
    assert(blockLayoutManager instanceof BlockLayoutManager);
    
    this.visible = this.isVisible();
   
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
    
    if((begin - end) < BlockEvent.DEFAULT_HEIGHT){
        end = begin + BlockEvent.DEFAULT_HEIGHT;
    }
    
    this.dimensions = new Dimensions(0, begin * 1000, BlockEvent.WIDTH, (end - begin) * 1000);
    
    var childBlockLayoutManager = new BlockLayoutManager();
    
    for(var i in this.children){
        this.children[i].calcDimensions(childBlockLayoutManager);
    }
    
    this.dimensions.setWidth(Math.max(
        childBlockLayoutManager.getWidth() + 2*BlockEvent.MARGIN, 
        this.dimensions.getWidth()));
        
    this.dimensions.setHeight(Math.max(
        childBlockLayoutManager.getEndY() - this.dimensions.getY(), 
        this.dimensions.getHeight()));
    
    this.dimensions = blockLayoutManager.fitBlock(this.dimensions);
}

function LineEvent(){
}

LineEvent.prototype = new Event();

LineEvent.prototype.calcDimensions = function(blockLayoutManager){
    this.visible = this.isVisible();
}

LineEvent.prototype.draw = function(){
    if(!this.visible)
        return;

    var width = 1.0;
    var pos = (this.startTS - ts_offset) * 1000;
    
    this.svgElement = mainView.svg.line(
        mainView.g_events, 
        55, 
        pos, 
        mainView.getWidth(), 
        pos, 
        {stroke: '#ffff00', 
         fill: 'none', 
         strokeWidth: width});
}

