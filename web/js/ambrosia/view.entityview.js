"use strict";

/**
 * @namespace contains the entity view
 */
ambrosia_web.view.entityview = {
    /**
     * Implements a simple view that shows details about the selected entity
     * @constructor
     */
    EntityView: Class('ambrosia_web.view.entityview.EntityView',
        {
        setup: function(element){
            element.text('no entity selected');

            A.entity.onSelectHandler.push(function(entity){
                var table = $('<table class="propertytable"/>');

                function add(k, v){
                    var tr = $('<tr>');
                    var th = $('<th>');
                    var td = $('<td>');
                    tr.append(th);
                    tr.append(td);
                    th.text(k);
                    if(v instanceof A.event.Event || v instanceof A.entity.Entity) {
                        td.append(v.getLink());
                    }else if(v instanceof jQuery) {
                        td.append(v);
                    }else{
                        td.text(v);
                    }
                    table.append(tr);
                }

                var fths = $('<button type="button"/>').text('this');
                fths.click(function(){
                    A.event.addFilter(null, new A.filter.BlacklistFilter('"'+entity.id+'" : r.*.id', 'show entity filter'));
                });

                var fnths = $('<button type="button"/>').text('not this');
                fnths.click(function(){
                    A.event.addFilter(null, new A.filter.BlacklistFilter('"'+entity.id+'" !: r.*.id', 'hide entity filter'));
                });

                add('filter', $('<span/>').append(fths).append(fnths));

                for(var i in entity){
                    if($.inArray(i, ['id', 'type', 'description']) != -1) {
                        add(i, entity[i]);
                    }
                }

                for(var i in entity.properties){
                    add('p.'+i, entity.properties[i]);
                }

                for(var i in entity.references){
                    add('r.'+i, entity.references[i]);
                }

                element.empty().append(table);
            });

        }
    })
};

