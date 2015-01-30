"use strict";

/***
 * @namespace several utilities
 */
ambrosia_web.util = {
    /**
     * The class that handles logging
     * @constructor
     */
    Log: function(){
        /**
         * log an event
         * @param {String} str the message to log
         * @param {String} level the level: DEBUG, INFO, WARN, ERROR
         */
        this.log = function (str, level){
            if(level == "ERROR"){
                window.alert("ERROR: "+str);
            }
            console.log(level+": "+str);
        };

        /**
         * shortcut for debug logging
         * @param {String} str the message to log
         */
        this.D = function(str) {
            this.log(str, "DEBUG");
        };

        /**
         * shortcut for info logging
         * @param {String} str the message to log
         */
        this.I = function(str) {
            this.log(str, "INFO");
        };

        /**
         * shortcut for warn logging
         * @param {String} str the message to log
         */
        this.W = function(str) {
            this.log(str, "WARN");
        };

        /**
         * shortcut for error logging
         * @param {String} str the message to log
         */
        this.E = function(str){
            this.log(str, "ERROR");
        };
    },

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
