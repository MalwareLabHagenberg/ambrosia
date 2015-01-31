"use strict";

/***
 * @namespace several utilities
 */
ambrosia_web.util = {
    /**
     * The class that handles logging
     * @constructor
     */
    Log: Class('ambrosia_web.util.Log',
        {
        /**
         * log an event
         * @param {String} str the message to log
         * @param {String} level the level: DEBUG, INFO, WARN, ERROR
         */
        log: function (str, level){
            if(level == "ERROR"){
                window.alert("ERROR: "+str);
            }
            console.log(level+": "+str);
        },

        /**
         * shortcut for debug logging
         * @param {String} str the message to log
         */
        D: function(str) {
            this.log(str, "DEBUG");
        },

        /**
         * shortcut for info logging
         * @param {String} str the message to log
         */
        I: function(str) {
            this.log(str, "INFO");
        },

        /**
         * shortcut for warn logging
         * @param {String} str the message to log
         */
        W: function(str) {
            this.log(str, "WARN");
        },

        /**
         * shortcut for error logging
         * @param {String} str the message to log
         */
        E: function(str){
            this.log(str, "ERROR");
        }
    }),

    /**
     * Simple helper function that raises an exception when false is passed
     * @param {bool} b
     */
    assert: function(b){
        if(b === false){
            A.log.E("Assertion failed");
            throw "Assertion failed";
        }
    },

    busy: function(msg) {
        var busybox = $('<div class="busybox"/>').text(msg);
        $('#busyindicator').append(busybox)

        function createRet(bb) {
            return {
                'finish': function () {
                    bb.remove();
                }
            }
        }

        return createRet(busybox);
    },

    /***
     * deserialize results from Ambrosia
     *
     * @function
     * @param obj the obj from Ambrosia
     * @param objs the objs from Ambrosia
     */
    deserialize: function(obj, objs)
    {
        if (obj * 1 == obj) {
            return objs[obj];
        } else if (obj instanceof Array) {
            ret = [];

            for (var i in obj) {
                ret.push(A.util.deserialize(obj[i], objs));
            }

            return ret;
        } else if (typeof(obj) == 'object') {
            var ret = {};
            for (var i in obj) {
                ret[A.util.deserialize(i, objs)] = A.util.deserialize(obj[i], objs);
            }
            return ret;
        } else {
            assert(false);
        }
    }
};

/* export some utility function to global namespace */
var busy = A.util.busy;
var assert = A.util.assert;

/**
 * creates a class
 * @param {String} name the fully qualified name of the new class
 * @param {String|Object} p1 if two parameters are passed: the object containing class members, else the superclass
 * @param {Object} p2 the obj object containing class members
 * @returns {class} the newly created class
 * @function
 */
function Class(name, p1, p2) {
    var values = p1;
    var superclass = Object;

    if(Class._class_registry == undefined) {
        Class._class_registry = {};
    }

    if(Class._class_registry[name] != undefined){
        throw "Class already defined";
    }

    if(p2){
        values = p2;
        superclass = p1;
    }

    if(typeof(superclass) == "string"){
        superclass = Class._class_registry[superclass];
    }

    var new_cls = function(){
        if(this.__init__) {
            this.__init__.apply(this, arguments);
        }
    };

    new_cls.prototype = Object.create(superclass.prototype);

    new_cls.prototype.super = function(){
        if(superclass.prototype.__init__) {
            superclass.prototype.__init__.apply(this, arguments);
        }
    };

    new_cls.prototype.constructor = new_cls;

    for(var i in values){
        new_cls.prototype[i] = values[i];
    }

    Class._class_registry[name] = new_cls;

    new_cls.prototype.class_name = name;

    return new_cls;
}