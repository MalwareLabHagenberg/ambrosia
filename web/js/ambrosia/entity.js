"use strict";

ambrosia.entity = {
    onSelectHandler: [],
    _selected: null,

    Entity: function(){
        this.toString = function(){
            return this.description;
        };

        this.select = function(){
            Event.addFilter(null, new Filter('"'+this.id+'" : references.id', true));
        };

        this.select = function(){
            for(var i in A.entity.onSelectHandler){
                A.entity.onSelectHandler[i](this);
            }

            A.entity._selected = this;
        };

        this.resolveReferences = function(){
            for(var i in this.references){
                this.references[i] = A.result.entities[this.references[i]];
            }
        };

        this.getLink = function(){
            var a = $('<a href="javascript:void(0)">');
            var ths = this;

            a.click(function(){
                ths.select();
            });

            a.text(this.toString());
            a.addClass('entity_link');

            return a;
        }

    },

    enrich: function(el){
        var new_el = new (A.entity.entities.entity_registry[el.type]);

        for(var i in el){
            new_el[i] = el[i];
        }

        return new_el;
    }
};

