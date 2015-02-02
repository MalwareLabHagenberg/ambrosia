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
        var drawing = busy('Drawing');

        /* avoid browser freeze before "Drawing" is shown */
        window.setTimeout(function(){
            A.mainView.redraw();
            $(".filterinput").removeClass('filterchanged');
            drawing.finish();
        }, 10);
    },

    _createView: function (name, element) {
        var content = $('<div class="viewcontent"/>');

        var v = ($('<div class="viewcontainer"/>')
            .append(
                $('<div class="viewheader"/>')
                    .text(name)
                    .click(function(){
                        var was_shown = v.hasClass('viewshown');
                        $('.viewcontainer').removeClass('viewshown');
                        if(!was_shown){
                            v.addClass('viewshown');
                        }
                    })
            )
            .append(content)
        );

        element.append(v);

        return content;
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
                A.detailsView.setup(A._createView('Event', $('#detailsview')));
                A.filterView.setup(A._createView('Filter', $('#filterview')));
                A.entityView.setup(A._createView('Entity', $('#entityview')));
            }
        })
    }
};

/* create shortcut */
var A = ambrosia_web;

$(document).ready(A.init);