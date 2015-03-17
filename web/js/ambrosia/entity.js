"use strict";

/**
 * @namespace the namespace used for classes related to entities
 */
ambrosia_web.entity = {
    /**
     * contains all handlers for selecting entities. Any part of the application may listen to those events (i.e. add a
     * function to this array). If the user select an entity the interface can adapt to this (e.g. the
     * :js:class:`ambrosia_web.view.entityview.EntityView` shows details about this entity).
     */
    onSelectHandler: [],
    _selected: null,

    /**
     * The client side counterpart for an entity
     * @see :class:`ambrosia.model.Entity`
     * @constructor
     */
    Entity: Class('ambrosia_web.entity.Entity', {
        __init__: function () {
            this.description = null;
            this.id = null;
            this.references = [];
        },

        toString: function () {
            return this.description;
        },

        /**
         * This method should be called when the user selects an entity.
         * @methodOf ambrosia_web.entity.Entity
         * @name select
         */
        select: function () {
            for (var i in A.entity.onSelectHandler) {
                A.entity.onSelectHandler[i](this);
            }

            A.entity._selected = this;
        },

        /**
         * resolves all references
         * @see :func:`ambrosia.model.Event.to_serializeable`
         * @methodOf ambrosia_web.entity.Entity
         * @name resolveReference
         */
        resolveReferences: function () {
            for (var i in this.references) {
                if($.isArray(this.references[i])){
                    var arr = [];
                    for(var j in this.references[i]){
                        arr[j] = A.result.entities[this.references[i][j]]
                    }
                    this.references[i] = arr;
                }else {
                    this.references[i] = A.result.entities[this.references[i]];
                }
            }
        },

        /**
         * Returns a jQuery element containing a link that, when clicked, selects the entity.
         * @returns {jQuery} the link
         * @methodOf ambrosia_web.entity.Entity
         * @name getLink
         */
        getLink: function () {
            var a = $('<a href="javascript:void(0)">');
            var ths = this;

            a.click(function () {
                ths.select();
            });

            a.text(this.toString());
            a.addClass('entity_link');

            return a;
        }
    }),

    /**
     * Receives an object containing the deserialized data from the server and returns an instance of the class
     * :js:class:`ambrosia_web.entity.Entity`
     * @param {object} el the deserialized data
     */
    enrich: function(el){
        var type = A.entity.entities.entity_registry[el.type];

        if(type == undefined){
            throw "Undefined entity: " + el.type;
        }

        var new_el = new (type);

        for(var i in el){
            new_el[i] = el[i];
        }

        new_el.r = new_el.references;
        new_el.p = new_el.properties;

        return new_el;
    }
};

