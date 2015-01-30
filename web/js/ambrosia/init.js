"use strict";

/**
 * @namespace the top namespace containing all other namespaces
 */
var ambrosia_web = {
    mainView: null,
    detailsView: null,
    filterView: null,
    entityView: null,
    ts_offset: 0,
    result: {},
    log: null,

    /**
     * Redraws all views of the application
     */
    redraw: function() {
        // TODO listener
        var drawing = busy('Drawing');
        A.mainView.redraw();
        drawing.finish();
        $(".filterinput").removeClass('filterchanged');
    },

    /**
     * initialize Ambrosia
     */
    init: function () {
        A.log = new A.util.Log();

        var loading = busy('loading JSON data');

        $.extend(ambrosia_web, {
            mainView: new A.view.mainview.MainView(),
            detailsView: new A.view.detailsview.DetailsView(),
            filterView: new A.view.filterview.FilterView(),
            entityView: new A.view.entityview.EntityView()
        });

        var result_file = location.hash.substr(1);

        if(result_file == ''){
            A.log.E("no file give, please load Ambrosia with an input file");
            return;
        }

        $.ajax(result_file, {
            success: function (r) {
                A.result = A.util.deserialize(r[0], r[1]);

                for (var i in A.result.entities) {
                    A.result.entities[i] = A.entity.enrich(A.result.entities[i]);
                }

                for (var i in A.result.entities) {
                    A.result.entities[i].resolveReferences();
                }

                for (var i in A.result.events) {
                    A.result.events[i] = A.event.enrich(A.result.events[i]);
                }
                window.ts_offset = A.result.start_time;

                loading.finish();

                A.mainView.setup();
                A.detailsView.setup();
                A.filterView.setup();
                A.entityView.setup();
            }
        })
    }
};

/* create shortcut */
var A = ambrosia_web;

$(document).ready(A.init);