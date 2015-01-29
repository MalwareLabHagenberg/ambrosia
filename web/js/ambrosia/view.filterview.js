"use strict";

ambrosia.view = ambrosia.view || {};

ambrosia.view.filterview = {
   FilterView: function() {
       var tab_registry = [];

       this.setup = function () {
           this.redraw();
       };

       this._addFilterLine = function (filter, tab) {
           var tdf = $('<tr/>').append(filter.getInput());
           var trf = $('<tr/>').append(tdf);

           tab.append(trf);
       };

       this._removeFilterLine = function (filter) {
           filter.getInput().remove();
       };


       this._addFilters = function (evt_cls, text, filters) {
           var tab = $('<table/>');

           var add_link = $('<a href="javascript:void(0)">add</a>');
           var th = $('<th/>').text(text).append(add_link);
           var tr = $('<tr/>').append(th);

           tab.append(tr);

           for (var f in filters) {
               this._addFilterLine(filters[f], tab);
           }

           add_link.click(function () {
               var filter = new A.filter.Filter();

               A.event.addFilter(evt_cls, filter);
           });

           tab_registry.push([evt_cls, tab]);

           $('#filterview').append(tab);
       };

       this._getTab = function (evt_cls) {
           for (var i in tab_registry) {
               var t = tab_registry[i];

               if (t[0] == evt_cls) {
                   return t[1];
               }
           }
       };

       this.redraw = function () {
           for (var e in A.event.events.event_registry) {
               var evt_cls = A.event.events.event_registry[e];
               var filters = A.event.getFilters(evt_cls);
               this._addFilters(evt_cls, e, filters);
           }

           this._addFilters(null, 'general', A.event.getFilters(null));

           var applyButton = $('<button type="button"/>').text('Apply');
           applyButton.click(function () {
               A.redraw();
           });

           $('#filterview').append(applyButton);
       };
   }
};

A.event.addFilterHandler.push(function (evt_cls, filter) {
    A.filterView._addFilterLine(filter, A.filterView._getTab(evt_cls));
});

A.event.removeFilterHandler.push(function (filter) {
    A.filterView._removeFilterLine(filter);
});