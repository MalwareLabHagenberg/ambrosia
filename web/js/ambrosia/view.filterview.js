"use strict";

/**
 * @namespace contains the filter view
 */
ambrosia_web.view.filterview = {
    /**
     * Implements a view that allows to view and modify filters
     * @constructor
     */
    FilterView: Class(
            'ambrosia_web.view.filterview.FilterView',
            'ambrosia_web.view.View',
        {
            __init__: function(element){
                this.super('Filter', element);
                this._tab_registry = [];
            },

            /**
             * sets up the filterview
             * @methodOf ambrosia_web.view.filterview.FilterView
             * @name setup
             */
            setup: function () {
                this.redraw();

                var ths = this;

                A.event.addFilterHandler.push(function (evt_cls, filter) {
                    ths._addFilterLine(filter, ths._getTab(evt_cls));
                });

                A.event.removeFilterHandler.push(function (filter) {
                    ths._removeFilterLine(filter);
                });
            },

            _addFilterLine: function (filter, tab) {
                tab.append(filter.getInput());
            },

            _removeFilterLine: function (filter) {
                filter.getInput().remove();
            },

            _addFilters: function (evt_cls, text, filters) {
                var tab = $('<div class="fitlertable"/>').hide();

                var add_btn = $('<button>add</button>');
                var toggle_btn = $('<button>+</button>').click(function(){
                    if(toggle_btn.text() == '+'){
                        toggle_btn.text('-');
                    }else{
                        toggle_btn.text('+');
                    }

                    tab.toggle();
                });

                tab.append($('<div class="tableentry"/>').append(add_btn));

                var filter_container = ($('<div class="filtercontainer"/>')
                    .append($('<div class="tablehead"/>')
                        .append(toggle_btn)
                        .append($('<span/>').text(text)))
                    .append(tab));

                for (var f in filters) {
                    this._addFilterLine(filters[f], tab);
                }

                add_btn.click(function () {
                    var filter = new A.filter.BlacklistFilter('true', '', true);

                    A.event.addFilter(evt_cls, filter);
                });

                this._tab_registry.push([evt_cls, tab]);

                this.content.append(filter_container);
            },

            _getTab: function (evt_cls) {
                for (var i in this._tab_registry) {
                    var t = this._tab_registry[i];

                    if (t[0] == evt_cls) {
                        return t[1];
                    }
                }
            },

            /**
             * redraws the filter view
             * @methodOf ambrosia_web.view.filterview.FilterView
             * @name redraw
             */
            redraw: function () {
                for (var e in A.event.events.event_registry) {
                    var evt_cls = A.event.events.event_registry[e];
                    var filters = A.event.getFilters(evt_cls);
                    this._addFilters(evt_cls, e, filters);
                }

                this._addFilters(null, 'general', A.event.getFilters(null));
            }
        })
};
