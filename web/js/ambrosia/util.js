"use strict";

/***
 * @namespace several utilities
 */
ambrosia.util = {
    Log: function(){
        this.log = function (str, level){
            console.log(level+": "+str);
        };

        this.D = function(str) {
            this.log(str, "DEBUG");
        };

        this.E = function(str){
            this.log(str, "ERROR");
        };
    },

    assert: function(b){
        if(b === false){
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
