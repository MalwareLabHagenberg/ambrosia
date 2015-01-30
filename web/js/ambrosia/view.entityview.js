"use strict";

/**
 * @namespace contains the entity view
 */
ambrosia_web.view.entityview = {
    /**
     * Implements a simple view that shows details about the selected entity
     * @constructor
     */
    EntityView: function(){
        this.setup = function(){
            $('#entityview').text('no entity selected');
        }
    }
};

A.entity.onSelectHandler.push(function(entity){
    $('#entityview').empty();
    
    var tab = $('<table/>');
    
    function add(h, d){
        var th = $('<th/>').text(h);
        var td = $('<td/>').append(d);
        tab.append($('<tr/>').append(th).append(td));
    }

    var fths = $('<button type="button"/>').text('this');
    fths.click(function(){
        A.event.addFilter(null, new A.filter.Filter('"'+entity.id+'" : references.id', true));
    });
    
    var fnths = $('<button type="button"/>').text('not this');
    fnths.click(function(){
        A.event.addFilter(null, new A.filter.Filter('"'+entity.id+'" !: references.id', true));
    });

    add('description', entity.getLink());
    add('id', $('<span/>').text(entity.id));
    add('filter', $('<span/>').append(fths).append(fnths));
    
    for(var i in entity.properties){
        add('property "'+i+'"', $('<span/>').text(entity.properties[i]));
    }
    
    for(var i in entity.references){
        add('reference "'+i+'"', entity.references[i].getLink());
    }

    $('#entityview').append(tab);
});
