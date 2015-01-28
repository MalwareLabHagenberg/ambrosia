"use strict";

function Entity(){
}

Entity.onSelectHandler = [];
Entity._selected = null;

Entity.enrich = function(el){
    var new_el = new (Entity.entity_registry[el.type]);
    
    for(var i in el){
        new_el[i] = el[i];
    }
    
    return new_el;
}

Entity.prototype.toString = function(){
    return this.description;
}

Entity.prototype.select = function(){
    Event.addFilter(null, new Filter('"'+this.id+'" : references.id', true));
}

Entity.prototype.select = function(){
    for(var i in Entity.onSelectHandler){
        Entity.onSelectHandler[i](this);
    }
    
    Entity._selected = this;
}

Entity.prototype.resolveReferences = function(){
    for(var i in this.references){
        this.references[i] = window.am.entities[this.references[i]];
    }
}

Entity.prototype.getLink = function(){
    var a = $('<a href="javascript:void(0)">');
    var ths = this;
    
    a.click(function(){
        ths.select();
    });
    
    a.text(this.toString());
    a.addClass('entity_link');
    
    return a;
}

