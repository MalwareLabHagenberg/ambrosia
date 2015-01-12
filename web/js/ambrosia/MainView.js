"use strict";

function MainView(){
    
}
MainView.prototype.view_offset = 0;
MainView.prototype.zoom_level = 3000.0;

MainView.prototype.setup = function(){
    this.setupEventHandler();
    var ths = this;
    
    $('#mainview').svg({onLoad: function(svg){
        window.setTimeout(function(){
            ths.svg = svg;
            ths.g_zoomed = svg.group();
            ths.g_unzoomed = svg.group();
            ths.g_measure = svg.group(ths.g_zoomed);
            ths.g_events = svg.group(ths.g_zoomed);
            ths.g_measure_text = svg.group(ths.g_unzoomed);
            
            ths.zoomAndPan();
            ths.redraw();
            
            for(var i in window.am.events){
                assert(window.am.events[i] instanceof Event);
                window.am.events[i].calcDimensions(Event.DEFAULT_BLOCK_LAYOUT_MAMAGER);
            }
            
            for(var i in window.am.events){
                window.am.events[i].draw();
            }
        }, 1); // JQUERY SVG catches all exceptions, we do not want this!
    }});
}

MainView.prototype.setupEventHandler = function(){
    var zoomRedrawTimeout = 0;
    var ths = this;
    
    $('#mainview').mousewheel(function(event){
        ths.zoom_level *= (-event.deltaY * 0.05) + 1;
        ths.zoomAndPan();
        window.clearTimeout(zoomRedrawTimeout);
        zoomRedrawTimeout = window.setTimeout(function(){
            ths.redraw()
        }, 50);
    });
    
    var lastPos = 0;
    var dragHandler = function(event) {
        ths.view_offset += -(event.pageY - lastPos) * (ths.zoom_level / ths.height());
        lastPos = event.pageY;
        ths.zoomAndPan();
    };
    
    var upHandler = function() {
        $(document).unbind("mousemove", dragHandler);
        $(document).unbind("mouseup", upHandler);
        ths.zoomAndPan();
        ths.redraw();
    };
    
    $('#mainview').mousedown(function(event){
        lastPos = event.pageY;
        $(document).mousemove(dragHandler);
        $(document).mouseup(upHandler);
    });
}

MainView.prototype.width = function(){
    return this.svg.width();
}

MainView.prototype.height = function(){
    return this.svg.height();
}

MainView.prototype.zoomAndPan = function(){
    this.zoom_level = Math.max(1, this.zoom_level);
    this.zoom_level = Math.min(50000, this.zoom_level);
    
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
        
    /* hide text while zooming/paning, redraw afterwards */
    this.svg.configure(
        this.g_measure_text, 
        {display: 'none'})
    
    zooming.finish();
}

MainView.prototype.redraw = function(){
    /* remove all objects from measure groups */
    while(this.g_measure.firstChild){ this.svg.remove(this.g_measure.firstChild); }
    while(this.g_measure_text.firstChild){ this.svg.remove(this.g_measure_text.firstChild); }

    /* scale for stroke widths and text sizes */
    var sw = 2 + (this.zoom_level/10000);
    var tw = (10000 / this.zoom_level) + 10;
    
    /* the scale for the lines to draw */
    var mindraw = 1000;
    
    /* depending on the zoom level draw exacter measure lines */
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
        this.width(), offset, // x2, y2
        {stroke: 'gray', fill: 'none', strokeWidth: strokeWidth});
    
    this.svg.text(
        this.g_measure_text,
        5, (offset - this.view_offset) * zoomfactor, // x, y
        text, 
        {fontSize: fontSize, fill: 'grey'});
}
