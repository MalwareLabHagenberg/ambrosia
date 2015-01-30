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

A.event.onSelectHandler.push(function(){
    var props = {};
    
    props['Description'] = this.description;
    props['Type'] = this.type;
    props['Parent'] = (this.parent == null) ? ('no parent') : (this.parent.getLink());
    props['Start'] = this.startTS - ts_offset;
    props['End'] = this.endTS - ts_offset;
    
    for(var k in this.properties){
        props['Property "'+k+'"'] = this.properties[k] + '';
    }
    
    for(var k in this.references){
        props['Reference "'+k+'"'] = this.references[k].getLink();
    }
    
    for(var k in this.children){
        props['Child '+((k*1)+1)] = this.children[k].getLink();
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

