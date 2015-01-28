"use strict";

function EntityView(){
    
}

EntityView.prototype.setup = function(){
    $('#entityview').text('no entity selected');
}

Entity.onSelectHandler.push(function(entity){
    $('#entityview').empty();
    
    var tab = $('<table/>');
    
    function add(h, d){
        var th = $('<th/>').text(h);
        var td = $('<td/>').append(d);
        tab.append($('<tr/>').append(th).append(td));
    }

    var fths = $('<button type="button"/>').text('this');
    fths.click(function(){
        Event.addFilter(null, new Filter('"'+entity.id+'" : references.id', true));
    });
    
    var fnths = $('<button type="button"/>').text('not this');
    fnths.click(function(){
        Event.addFilter(null, new Filter('"'+entity.id+'" !: references.id', true));
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
