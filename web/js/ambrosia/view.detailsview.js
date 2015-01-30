"use strict";

/**
 * @namespace contains the details view
 */
ambrosia_web.view.detailsview = {
    /**
     * Implements a simple view that shows details about the last event that has been selected
     * @constructor
     */
    DetailsView: function(){
        /**
         * set up the details view
         */
        this.setup = function(){
            $('#detailsview').text('No Event selected');
        }
    }
};

A.event.onSelectHandler.push(function(evt){
    var props = {};
    
    props['Description'] = evt.description;
    props['Type'] = evt.type;
    props['Parent'] = (evt.parent == null) ? ('no parent') : (evt.parent.getLink());
    props['Start'] = evt.startTS - ts_offset;
    props['End'] = evt.endTS - ts_offset;
    
    for(var k in evt.properties){
        props['Property "'+k+'"'] = evt.properties[k] + '';
    }
    
    for(var k in evt.references){
        props['Reference "'+k+'"'] = evt.references[k].getLink();
    }
    
    for(var k in evt.children){
        props['Child '+((k*1)+1)] = evt.children[k].getLink();
    }
    
    var table = $('<table>');
    for(var k in props){
        var tr = $('<tr>');
        var th = $('<th>');
        var td = $('<td>');
        tr.append(th);
        tr.append(td);
        th.text(k);
        td.append(props[k]);
        table.append(tr);
    }
    
    $('#detailsview').empty();
    $('#detailsview').append(table);
});

