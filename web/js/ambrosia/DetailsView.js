"use strict";

function DetailsView(){
    
}

DetailsView.prototype.setup = function(){
    Event.onSelectHandler.push(function(){
        var props = {};
        
        props['Description'] = this.description;
        props['Type'] = this.type;
        props['Parent'] = (this.parent == null) ? ('no parent') : (this.parent.getLink());
        props['Start'] = this.startTS - ts_offset;
        props['End'] = this.endTS - ts_offset;
        
        for(var k in this.properties){
            props['Property "'+k+'"'] = this.properties[k];
        }
        
        for(var k in this.references){
            props['Reference "'+k+'"'] = this.properties[k];
        }
        
        for(var k in this.children){
            props['Child '+((k*1)+1)] = this.children[k].getLink();
        }
        
        var table = $('<table>');
        for(var k in props){
            var tr = $('<tr>');
            var td1 = $('<td>');
            var td2 = $('<td>');
            tr.append(td1);
            tr.append(td2);
            td1.text(k);
            td2.append(props[k]);
            table.append(tr);
        }
        
        $('#detailsview').empty();
        $('#detailsview').append(table);
    });
    
    $('#detailsview').text('No Event selected');
}

