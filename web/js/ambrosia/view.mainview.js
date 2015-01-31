"use strict";


/**
 * @namespace contains the main view
 */
ambrosia_web.view.mainview = {
    /**
     * the x offset where events may be drawn
     * @constant
     */
    X_OFFSET: 55,

    /**
     * the extra horizontal space that should be left after the last event
     * @constant
     */
    EXTRA_WIDTH: 50,

    /**
     * the main view showing all events in a timeline
     * @constructor
     */
    MainView: Class('ambrosia_web.view.mainview.MainView', {
        __init__: function () {
            this._width = 1000;
            this._view_offset = 0;
            this._zoom_level = 500000.0;
            this._drawn_zoom_level = 0;
            this._main_view_element = $('#mainview');
        },

        /**
         * set up the main view
         */
        setup: function () {
            this._setupEventHandler();
            var ths = this;

            this._main_view_element.svg({
                onLoad: function (svg) {
                    window.setTimeout(function () {
                        ths.svg = svg;

                        ths.redraw();
                    }, 1); // JQUERY SVG catches all exceptions, we do not want this!
                }, settings: {height: $('#mainview').height() - 20}
            });

            A.event.onSelectHandler.push(function (evt) {
                $(evt.svgElement).addClass('mainview_selected');
            });

            A.event.onUnSelectHandler.push(function (evt) {
                $(evt.svgElement).removeClass('mainview_selected');
            });
        },

        /**
         * redraw the main view
         */
        redraw: function () {
            var lastTS = 0;

            A.event.reset();

            this.svg.clear();
            this.g_zoomed = this.svg.group();
            this.g_unzoomed = this.svg.group();
            this.g_measure = this.svg.group(this.g_zoomed);
            this.g_events = this.svg.group(this.g_zoomed);
            this.g_measure_text = this.svg.group(this.g_unzoomed);

            for (var i in A.result.events) {
                assert(A.result.events[i] instanceof A.event.Event);
                assert(A.result.events[i].startTS >= lastTS);
                lastTS = A.result.events[i].startTS;
                A.result.events[i].calcVisible();
                A.result.events[i].calcDimensions(A.event.DEFAULT_BLOCK_LAYOUT_MANAGER);
            }

            this.setWidth(A.view.mainview.EXTRA_WIDTH +
                A.view.mainview.X_OFFSET +
                A.event.DEFAULT_BLOCK_LAYOUT_MANAGER.getWidth());

            for (var i in A.result.events) {
                A.result.events[i].draw();
            }


            this._drawn_zoom_level = 0;
            this._zoomAndPan();
            this._redrawMeasure();
        },

        /**
         * sets up the event handlers for mouse and mouse wheel input
         * @private
         */
        _setupEventHandler: function () {
            var zoom_redraw_measure_timeout = 0;
            var ths = this;

            this._main_view_element.mousewheel(function (event) {
                ths._zoom_level *= (-event.deltaY * 0.05) + 1;
                ths._zoomAndPan();
                window.clearTimeout(zoom_redraw_measure_timeout);
                zoom_redraw_measure_timeout = window.setTimeout(function () {
                    ths._redrawMeasure()
                }, 50);

                return false;
            });

            var lastPos = 0;
            var dragHandler = function (event) {
                ths._view_offset += -(event.pageY - lastPos) * (ths._zoom_level / ths.getHeight());
                lastPos = event.pageY;
                ths._zoomAndPan();
                return false;
            };

            var upHandler = function () {
                $(document).unbind("mousemove", dragHandler);
                $(document).unbind("mouseup", upHandler);
                ths._zoomAndPan();
                ths._redrawMeasure();
            };

            this._main_view_element.mousedown(function (event) {
                lastPos = event.pageY;
                $(document).mousemove(dragHandler);
                $(document).mouseup(upHandler);
            });
        },

        /**
         * get the width of the main view
         * @returns {number} the width
         */
        getWidth: function () {
            return this._width;
        },

        /**
         * set the width of the main view
         * @param {number} val the width
         */
        setWidth: function (val) {
            this._width = val;
            this.svg.configure({width: this._width});
            this._redrawMeasure();
        },

        /**
         * get the height of the main view
         * @returns {number} the height
         */
        getHeight: function () {
            return this.svg.height();
        },

        /**
         * Updates the zoom and translation of the SVG. The measurement lines are hidden. This allows faster zooming
         * and paning without having to draw the measure lines.
         * @private
         */
        _zoomAndPan: function () {
            this._zoom_level = Math.max(1, this._zoom_level);
            this._zoom_level = Math.min(500000, this._zoom_level);

            this._view_offset = Math.max(-1000, this._view_offset);

            if (this._drawn_zoom_level == this._zoom_level &&
                this._drawn_view_offset == this._view_offset) {
                return;
            }

            var zooming = busy('zooming');

            this._drawn_zoom_level = this._zoom_level;
            this._drawn_view_offset = this._view_offset;

            var scale = this.getHeight() / this._zoom_level;
            var translate = -this._view_offset;

            this.svg.configure(
                this.g_zoomed,
                {transform: 'scale(1, ' + scale + ') translate(0, ' + translate + ')'});

            /* hide text while zooming/paning, _redrawMeasure afterwards */
            this.svg.configure(
                this.g_measure_text,
                {display: 'none'});

            zooming.finish();
        },

        /**
         * draw the measure lines
         * @private
         */
        _redrawMeasure: function () {
            /* remove all objects from measure groups */
            while (this.g_measure.firstChild) {
                this.svg.remove(this.g_measure.firstChild);
            }
            while (this.g_measure_text.firstChild) {
                this.svg.remove(this.g_measure_text.firstChild);
            }

            /* scale for stroke widths and text sizes */
            var sw = 2 + (this._zoom_level / 10000);

            /* the scale for the lines to draw */
            var mindraw = 20000;

            /* depending on the zoom level draw exacter measure lines */
            if (this._zoom_level < 400000) mindraw = 10000;
            if (this._zoom_level < 40000) mindraw = 1000;
            if (this._zoom_level < 4000) mindraw = 100;
            if (this._zoom_level < 400) mindraw = 10;
            if (this._zoom_level < 40) mindraw = 1;

            var draw_start = Math.ceil(this._view_offset / mindraw) * mindraw;
            var draw_end = draw_start + this._zoom_level;

            for (var i = draw_start; i < draw_end; i += mindraw) {
                if (i % 1000 == 0) {
                    this._drawMeasureLine(i, 14, sw * 5, (i / 1000) + "s");
                } else if (i % 100 == 0) {
                    this._drawMeasureLine(i, 12, sw / 5, i + "ms");
                } else if (i % 10 == 0) {
                    this._drawMeasureLine(i, 12, sw / 10, i + "ms");
                } else {
                    this._drawMeasureLine(i, 12, sw / 50, i + "ms");
                }
            }

            /* unhide text */
            this.svg.configure(
                this.g_measure_text,
                {display: ''});
        },

        /**
         * Helper method to draw a single measure line
         * @param {number} offset the y position of the line
         * @param {number} fontSize the font size in pt
         * @param {number} strokeWidth the stroke width in pt
         * @param {String} text the caption
         * @private
         */
        _drawMeasureLine: function (offset, fontSize, strokeWidth, text) {
            var zoomfactor = (this.getHeight() / this._zoom_level);

            this.svg.line(
                this.g_measure,
                50, offset,   // x1, y1
                this.getWidth(), offset, // x2, y2
                {stroke: 'gray', fill: 'none', strokeWidth: strokeWidth});

            this.svg.text(
                this.g_measure_text,
                5, (offset - this._view_offset) * zoomfactor, // x, y
                text,
                {fontSize: fontSize, fill: 'grey'});
        }
    })
};