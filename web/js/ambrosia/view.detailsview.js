"use strict";

/**
 * @namespace contains the details view
 */
ambrosia_web.view.detailsview = {
    /**
     * Implements a simple view that shows details about the last event that has been selected
     * @constructor
     */
    DetailsView: Class('ambrosia_web.view.detailsview.DetailsView',
        {
        /**
         * set up the details view
         * @param {jQuery} element the jQuery element the view should be located
         * @methodOf ambrosia_web.view.detailsview.DetailsView
         * @name setup
         */
        setup: function(element){
            element.text('No Event selected');
            A.event.onSelectHandler.push(function(evt){
                var props = {};

                var table = $('<table class="propertytable">');

                var add = A.util.addToPropertyTable;

                for(var i in evt){
                    if($.inArray(i, ['startTS', 'endTS', 'type', 'parent', 'description', 'visible']) != -1) {
                        add(i, evt[i], table);
                    }
                }

                for(var i in evt.properties){
                    add('p.'+i, evt.properties[i], table);
                }

                for(var i in evt.references){
                    add('r.'+i, evt.references[i], table);
                }

                for(var i in evt.children){
                    add('children[]', evt.children[i], table);
                }

                element.empty().append(table);
            });
        }
    })
};

