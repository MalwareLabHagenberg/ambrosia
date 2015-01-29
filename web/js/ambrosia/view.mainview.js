"use strict";

ambrosia.view = ambrosia.view || {};

ambrosia.view.mainview = {
    X_OFFSET: 55,
    EXTRA_WIDTH: 55 + 50,

    MainView: function () {
        var width = 1000;
        var view_offset = 0;
        var zoom_level = 500000.0;
        var drawn_zoom_level = 0;
        var main_view_element = $('#mainview');

        this.setup = function () {
            this.setupEventHandler();
            var ths = this;

            main_view_element.svg({
                onLoad: function (svg) {
                    window.setTimeout(function () {
                        ths.svg = svg;

                        ths.redraw();
                    }, 1); // JQUERY SVG catches all exceptions, we do not want this!
                }, settings: {height: $('#mainview').height() - 20}
            });

            A.event.onSelectHandler.push(function () {
                $(this.svgElement).addClass('mainview_selected');
            });

            A.event.onUnSelectHandler.push(function () {
                $(this.svgElement).removeClass('mainview_selected');
            });
        };


        this.redraw = function () {
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
                A.result.events[i].calcDimensions(A.event.DEFAULT_BLOCK_LAYOUT_MAMAGER);
            }

            this.setWidth(A.view.mainview.EXTRA_WIDTH + A.event.DEFAULT_BLOCK_LAYOUT_MAMAGER.getWidth());

            for (var i in A.result.events) {
                A.result.events[i].draw();
            }


            drawn_zoom_level = 0;
            this.zoomAndPan();
            this.redrawMeasure();
        };

        this.setupEventHandler = function () {
            var zoom_redraw_measure_timeout = 0;
            var ths = this;

            main_view_element.mousewheel(function (event) {
                zoom_level *= (-event.deltaY * 0.05) + 1;
                ths.zoomAndPan();
                window.clearTimeout(zoom_redraw_measure_timeout);
                zoom_redraw_measure_timeout = window.setTimeout(function () {
                    ths.redrawMeasure()
                }, 50);

                return false;
            });

            var lastPos = 0;
            var dragHandler = function (event) {
                view_offset += -(event.pageY - lastPos) * (zoom_level / ths.getHeight());
                lastPos = event.pageY;
                ths.zoomAndPan();
                return false;
            };

            var upHandler = function () {
                $(document).unbind("mousemove", dragHandler);
                $(document).unbind("mouseup", upHandler);
                ths.zoomAndPan();
                ths.redrawMeasure();
            };

            main_view_element.mousedown(function (event) {
                lastPos = event.pageY;
                $(document).mousemove(dragHandler);
                $(document).mouseup(upHandler);
            });
        };


        this.getWidth = function () {
            return width;
        };

        this.setWidth = function (val) {
            width = val;
            this.svg.configure({width: width});
            this.redrawMeasure();
        };

        this.getHeight = function () {
            return this.svg.height();
        };

        this.zoomAndPan = function () {
            zoom_level = Math.max(1, zoom_level);
            zoom_level = Math.min(500000, zoom_level);

            view_offset = Math.max(-1000, view_offset);

            if (drawn_zoom_level == zoom_level &&
                this._drawn_view_offset == view_offset) {
                return;
            }

            var zooming = busy('zooming');

            drawn_zoom_level = zoom_level;
            this._drawn_view_offset = view_offset;

            var scale = this.getHeight() / zoom_level;
            var translate = -view_offset;

            this.svg.configure(
                this.g_zoomed,
                {transform: 'scale(1, ' + scale + ') translate(0, ' + translate + ')'});

            /* hide text while zooming/paning, redrawMeasure afterwards */
            this.svg.configure(
                this.g_measure_text,
                {display: 'none'});

            zooming.finish();
        };

        this.redrawMeasure = function () {
            /* remove all objects from measure groups */
            while (this.g_measure.firstChild) {
                this.svg.remove(this.g_measure.firstChild);
            }
            while (this.g_measure_text.firstChild) {
                this.svg.remove(this.g_measure_text.firstChild);
            }

            /* scale for stroke widths and text sizes */
            var sw = 2 + (zoom_level / 10000);

            /* the scale for the lines to draw */
            var mindraw = 20000;

            /* depending on the zoom level draw exacter measure lines */
            if (zoom_level < 400000) mindraw = 10000;
            if (zoom_level < 40000) mindraw = 1000;
            if (zoom_level < 4000) mindraw = 100;
            if (zoom_level < 400) mindraw = 10;
            if (zoom_level < 40) mindraw = 1;

            var draw_start = Math.ceil(view_offset / mindraw) * mindraw;
            var draw_end = draw_start + zoom_level;

            for (var i = draw_start; i < draw_end; i += mindraw) {
                if (i % 1000 == 0) {
                    this.drawMeasureLine(i, 14, sw * 5, (i / 1000) + "s");
                } else if (i % 100 == 0) {
                    this.drawMeasureLine(i, 12, sw / 5, i + "ms");
                } else if (i % 10 == 0) {
                    this.drawMeasureLine(i, 12, sw / 10, i + "ms");
                } else {
                    this.drawMeasureLine(i, 12, sw / 50, i + "ms");
                }
            }

            /* unhide text */
            this.svg.configure(
                this.g_measure_text,
                {display: ''});
        };

        this.drawMeasureLine = function (offset, fontSize, strokeWidth, text) {
            var zoomfactor = (this.getHeight() / zoom_level);

            this.svg.line(
                this.g_measure,
                50, offset,   // x1, y1
                this.getWidth(), offset, // x2, y2
                {stroke: 'gray', fill: 'none', strokeWidth: strokeWidth});

            this.svg.text(
                this.g_measure_text,
                5, (offset - view_offset) * zoomfactor, // x, y
                text,
                {fontSize: fontSize, fill: 'grey'});
        }

    }
};