"use strict";

/**
 * @namespace contains the details view
 */
ambrosia_web.view.detailsview = {
    /**
     * Implements a simple view that shows details about the last event that has been selected
     * @param {jQuery} element the jQuery element the view should be located
     * @constructor
     *
     */
    DetailsView: Class(
            'ambrosia_web.view.detailsview.DetailsView',
            'ambrosia_web.view.View',
        {

            __init__: function(element){
                this.super('Event', element);
            },

            /**
             * set up the details view
             * @methodOf ambrosia_web.view.detailsview.DetailsView
             * @name setup
             */
            setup: function(){
                var ths = this;

                this.content.text('No Event selected');
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

                    ths.content.empty().append(table);
                    ths.show();
                });
            }
    })
};

