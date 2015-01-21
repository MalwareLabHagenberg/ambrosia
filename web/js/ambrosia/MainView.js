"use strict";

function MainView(){
    this._width = 1000;
}
MainView.prototype.view_offset = 0;
MainView.prototype.zoom_level = 500000.0;

MainView.prototype.setup = function(){
    this.setupEventHandler();
    var ths = this;
    
    $('#mainview').svg({onLoad: function(svg){
        window.setTimeout(function(){
            ths.svg = svg;
            
            ths.redraw();
        }, 1); // JQUERY SVG catches all exceptions, we do not want this!
    }, settings: {height: $('#mainview').height() - 20}});
    
    Event.onSelectHandler.push(function(){
        $(this.svgElement).addClass('mainview_selected');
    });
}

MainView.prototype.redraw = function(){
    var lastTS = 0;
    
    Event.reset();
    
    this.svg.clear();
    this.g_zoomed = this.svg.group();
    this.g_unzoomed = this.svg.group();
    this.g_measure = this.svg.group(this.g_zoomed);
    this.g_events = this.svg.group(this.g_zoomed);
    this.g_measure_text = this.svg.group(this.g_unzoomed);
    
    for(var i in window.am.events){
        assert(window.am.events[i] instanceof Event);
        assert(window.am.events[i].startTS >= lastTS);
        lastTS = window.am.events[i].startTS;
        window.am.events[i].calcDimensions(Event.DEFAULT_BLOCK_LAYOUT_MAMAGER);
    }
    
    this.setWidth(Event.DEFAULT_BLOCK_LAYOUT_MAMAGER.getWidth());
    
    for(var i in window.am.events){
        window.am.events[i].draw();
    }
    

    this._drawn_zoom_level = 0;
    this.zoomAndPan();
    this.redrawMeasure();
}

MainView.prototype.setupEventHandler = function(){
    var zoomredrawMeasureTimeout = 0;
    var ths = this;
    
    $('#mainview').mousewheel(function(event){
        ths.zoom_level *= (-event.deltaY * 0.05) + 1;
        ths.zoomAndPan();
        window.clearTimeout(zoomredrawMeasureTimeout);
        zoomredrawMeasureTimeout = window.setTimeout(function(){
            ths.redrawMeasure()
        }, 50);
        
        return false;
    });
    
    var lastPos = 0;
    var dragHandler = function(event) {
        ths.view_offset += -(event.pageY - lastPos) * (ths.zoom_level / ths.height());
        lastPos = event.pageY;
        ths.zoomAndPan();
        return false;
    };
    
    var upHandler = function(event) {
        $(document).unbind("mousemove", dragHandler);
        $(document).unbind("mouseup", upHandler);
        ths.zoomAndPan();
        ths.redrawMeasure();
    };
    
    $('#mainview').mousedown(function(event){
        lastPos = event.pageY;
        $(document).mousemove(dragHandler);
        $(document).mouseup(upHandler);
    });
}

MainView.prototype.getWidth = function(){
    return this._width;
}

MainView.prototype.setWidth = function(val){
    this._width = val;
    this.svg.configure({width: Event.DEFAULT_BLOCK_LAYOUT_MAMAGER.getWidth()});
    this.redrawMeasure();
}

MainView.prototype.height = function(){
    return this.svg.height();
}

MainView.prototype.zoomAndPan = function(){
    this.zoom_level = Math.max(1, this.zoom_level);
    this.zoom_level = Math.min(500000, this.zoom_level);
    
    this.view_offset = Math.max(-1000, this.view_offset);

    if(this._drawn_zoom_level == this.zoom_level &&
       this._drawn_view_offset == this.view_offset) {
        return;
    }

    var zooming = busy('zooming');
    
    this._drawn_zoom_level = this.zoom_level;
    this._drawn_view_offset = this.view_offset;

    var scale = this.height() / this.zoom_level;
    var translate = -this.view_offset;
    
    this.svg.configure(
        this.g_zoomed, 
        {transform: 'scale(1, '+scale+') translate(0, '+translate+')'})
        
    /* hide text while zooming/paning, redrawMeasure afterwards */
    this.svg.configure(
        this.g_measure_text, 
        {display: 'none'})
    
    zooming.finish();
}

MainView.prototype.redrawMeasure = function(){
    /* remove all objects from measure groups */
    while(this.g_measure.firstChild){ this.svg.remove(this.g_measure.firstChild); }
    while(this.g_measure_text.firstChild){ this.svg.remove(this.g_measure_text.firstChild); }

    /* scale for stroke widths and text sizes */
    var sw = 2 + (this.zoom_level/10000);
    var tw = (10000 / this.zoom_level) + 10;
    
    /* the scale for the lines to draw */
    var mindraw = 20000;
    
    /* depending on the zoom level draw exacter measure lines */
    if(this.zoom_level < 400000) mindraw = 10000;
    if(this.zoom_level < 40000) mindraw = 1000;
    if(this.zoom_level < 4000) mindraw = 100;
    if(this.zoom_level < 400) mindraw = 10;
    if(this.zoom_level < 40) mindraw = 1;
    
    var drawStart = Math.ceil(this.view_offset / mindraw) * mindraw;
    var drawEnd = drawStart + this.zoom_level;
    
    for(var i = drawStart; i < drawEnd; i+=mindraw){
        if(i % 1000 == 0){
            this.drawMeasureLine(i, 14, sw*5, (i/1000)+"s");
        }else if(i % 100 == 0){
            this.drawMeasureLine(i, 12, sw/5, i+"ms");
        }else if(i % 10 == 0){
            this.drawMeasureLine(i, 12, sw/10, i+"ms");
        }else{
            this.drawMeasureLine(i, 12, sw/50, i+"ms");
        }
    }
    
    /* unhide text */
    this.svg.configure(
        this.g_measure_text, 
        {display: ''});
}

MainView.prototype.drawMeasureLine = function(offset, fontSize, strokeWidth, text){
    var zoomfactor = (this.height() / this.zoom_level);

    this.svg.line(
        this.g_measure, 
        50, offset,   // x1, y1
        this.getWidth(), offset, // x2, y2
        {stroke: 'gray', fill: 'none', strokeWidth: strokeWidth});
    
    this.svg.text(
        this.g_measure_text,
        5, (offset - this.view_offset) * zoomfactor, // x, y
        text, 
        {fontSize: fontSize, fill: 'grey'});
}
