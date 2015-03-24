"use strict";

/**
 * @namespace contains the entity view
 */
ambrosia_web.view.entityview = {
    /**
     * Implements a simple view that shows details about the selected entity
     * @param {jQuery} element the jQuery element the view should be located
     * @constructor
     */
    EntityView: Class(
            'ambrosia_web.view.entityview.EntityView',
            'ambrosia_web.view.View',
        {
            __init__: function(element){
                this.super('Entity', element);
            },

            setup: function(){
                this.content.text('no entity selected');

                var ths = this;

                A.entity.onSelectHandler.push(function(entity){
                    var table = $('<table class="propertytable"/>');

                    var add = A.util.addToPropertyTable;

                    var fths = $('<button type="button"/>').text('this');
                    fths.click(function(){
                        A.filter.addFilter(new A.filter.Filter(
                            '"'+entity.id+'" : r.*.id',
                            'only show '+entity,
                            true,
                            A.filter.TYPE_FORCE_SHOW_PARENT));
                    });

                    var fnths = $('<button type="button"/>').text('not this');
                    fnths.click(function(){
                        A.filter.addFilter(new A.filter.Filter(
                            '"'+entity.id+'" : r.*.id',
                            'hide '+entity,
                            true,
                            A.filter.TYPE_BLACKLIST));
                    });

                    add('filter', $('<span/>').append(fths).append(fnths), table);

                    for(var i in entity){
                        if($.inArray(i, ['id', 'type', 'description']) != -1) {
                            add(i, entity[i], table);
                        }
                    }

                    for(var i in entity.properties){
                        add('p.'+i, entity.properties[i], table);
                    }

                    for(var i in entity.references){
                        add('r.'+i, entity.references[i], table);
                    }

                    ths.content.empty().append(table);
                    ths.show();
                });

            }
        })
};

