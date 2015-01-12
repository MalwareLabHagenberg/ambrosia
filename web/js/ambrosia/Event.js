"use strict";

function Event(){
}

Event.event_registry = {}
Event.DEFAULT_BLOCK_LAYOUT_MAMAGER = new BlockLayoutManager();
Event.prototype.draw = function(){ assert(false); }
Event.prototype.calcDimensions = function(blockLayoutManager){ }


function BlockEvent(){
}

BlockEvent.prototype = new Event();

BlockEvent.DEFAULT_HEIGHT = 1;
BlockEvent.WIDTH = 50;
BlockEvent.MARGIN = 0.01;
BlockEvent.X_OFFSET = 55;


BlockEvent.prototype.draw = function(xOffset){
    var ths = this;

    if(!xOffset) {
        xOffset = BlockEvent.X_OFFSET;
    }
    
    for(var i in this.children){
        this.children[i].draw(this.dimensions.getX());
    }

    this.svgElement = mainView.svg.rect(
        mainView.g_events, 
        xOffset + this.dimensions.getX(), this.dimensions.getY(), 
        this.dimensions.getWidth(), this.dimensions.getHeight(), 
        {stroke: '#ff0000', 
         fill: '#000000', 
         strokeWidth: 0.01,
         fillOpacity: 0.1, 
         strokeOpacity: 0.3});
        
    $(this.svgElement).click(function(){
        alert(ths.description);
    });
}


BlockEvent.prototype.calcDimensions = function(blockLayoutManager){
    assert(blockLayoutManager instanceof BlockLayoutManager);

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
    
    this.dimensions.setWidth(Math.max(childBlockLayoutManager.getWidth(), this.dimensions.getWidth()))
    
    this.dimensions = blockLayoutManager.fitBlock(this.dimensions);
}

function LineEvent(){
}

LineEvent.prototype = new Event();

LineEvent.prototype.draw = function(){
    var width = 1.0;
    var pos = (this.startTS - ts_offset) * 1000;
    
    this.svgElement = mainView.svg.line(
        mainView.g_events, 
        55, 
        pos, 
        mainView.width(), 
        pos, 
        {stroke: '#ffff00', 
         fill: 'none', 
         strokeWidth: width});
}

