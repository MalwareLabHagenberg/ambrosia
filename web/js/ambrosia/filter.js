"use strict";

/**
 * @namespace used for filtering events
 */
ambrosia_web.filter = {
    filters: [],

    /**
     * contains all handlers for adding filters to an  event class. Any part of the application may listen to those
     * events (i.e. add a function to this array). If the user select an entity the interface can adapt to this.
     */
    addFilterHandler: [],

    /**
     * contains all handlers for removing filters from an  event class. Any part of the application may listen to those
     * events (i.e. add a function to this array). If the user select an entity the interface can adapt to this.
     */
    removeFilterHandler: [],

    /**
     * the filter type for whitelist filters
     */
    TYPE_FORCE_SHOW_PARENT: 'whitelist_force_show_parent',

    /**
     * the filter type for blacklist filters
     */
    TYPE_BLACKLIST: 'blacklist',

    /***
     * A Filter represents a single condition (either entered by the user or a default condition).
     *
     * The following shows example for the filter syntax:
     *
     * @example
     * stype == "FileAccessEvent" {
     *      # read only
     *      p.flg_O_RDWR==false && p.flg_O_WRONLY==false {
     *          # hide getting random numbers
     *          r.file.p.abspath == "/dev/urandom";
     *      }
     *  }
     *
     *  # hide Android shared memory operations
     *  (r.file.p.abspath=="/dev/ashmem" && p.flags==131074);
     *
     * Please see the thesis *Ambrosia: A Framework for Visualizing Malicious Behaviour in Android Applications* for
     * a detailed explaination of the filter language.
     *
     * @constructor
     */
    Filter: Class('ambrosia_web.filter.Filter',
        {
            __init__: function(rule, description, enabled, type) {
                this._error = '';
                this._filter = ambrosia_web.filter.parser.parse(rule);
                this._enabled  = true;
                this._rule = rule;
                this.change_listener = [];
                this._description = description;
                this._type = A.filter.TYPE_BLACKLIST;

                if (enabled != undefined) {
                    this._enabled = enabled;
                }

                if(type != undefined){
                    this._type = type;
                }
            },

            _call_change_listener: function(){
                for(var i in this.change_listener){
                    this.change_listener[i]()
                }
            },

            /**
             * replaces the current rule with a new one
             * @function
             * @param {String} r the new rule in filter syntax
             * @methodOf ambrosia_web.filter.Filter
             * @name setRule
             */
            setRule: function(r){
                try{
                    this._rule = r;
                    var f = ambrosia_web.filter.parser.parse(r);
                    this._error = '';
                    this._filter = f;
                }catch(ex){
                    this._error = ex;
                }
                this._call_change_listener();
            },

            /**
             * get the current rule string
             * @function
             * @methodOf ambrosia_web.filter.Filter
             * @name getRule
             */
            getRule: function () {
                return this._rule;
            },

            /**
             * get the error descriptin string
             * @function
             * @methodOf ambrosia_web.filter.Filter
             * @name getError
             */
            getError: function () {
                return this._error;
            },

            /**
             * get the filter type
             * @function
             * @methodOf ambrosia_web.filter.Filter
             * @name getType
             */
            getType: function () {
                return this._type;
            },

            /**
             * set the description
             * @param {String} d the description
             * @methodOf ambrosia_web.filter.Filter
             * @name setDescription
             */
            setDescription: function(d){
                this._description = d;
                this._call_change_listener();
            },

            /**
             * set the filter type
             * @param {String} t fitler type
             * @methodOf ambrosia_web.filter.Filter
             * @name setType
             */
            setType: function(t){
                this._type = t;
                this._call_change_listener();
            },

            /**
             * get the description string
             * @function
             * @methodOf ambrosia_web.filter.Filter
             * @name getDescription
             */
            getDescription: function(){
                return this._description;
            },

            /**
             * enable or disable the filter
             * @param {bool} b whether the filter should be enabled
             * @methodOf ambrosia_web.filter.Filter
             * @name setEnabled
             */
            setEnabled: function (b) {
                this._enabled = b;
                this._call_change_listener();
            },

            /**
             * Checks whether this filter is enabled
             * @returns {bool} true if enabled
             * @methodOf ambrosia_web.filter.Filter
             * @name isEnabled
             */
            isEnabled: function (){
                return this._enabled;
            },

            toString: function () {
                return 'Filter: '+this._rule_input.val();
            },

            /**
             * Evaluate if an an event matches this filter
             * @returns {bool} true if the event matches
             * @methodOf ambrosia_web.filter.Filter
             * @name evaluate
             */
            evaluate: function(evt){
                var res = this._filter.evaluate(evt);

                switch (this._type) {
                    case A.filter.TYPE_BLACKLIST:
                    return [(res == true)?(false):(null), false];
                    break;
                case A.filter.TYPE_FORCE_SHOW_PARENT:
                    return [(res == true)?(true):(null), res];
                    break;
                default:
                    throw "Invalid type";
                    break;
                }
            }
        }),

    /**
     * A property used in a filter. Used by the parser.
     * @param s the property string
     * @constructor
     */
    Property: function(s){
        this.evaluate = function(evt) {
            assert(evt instanceof A.event.Event);

            if(s == 'true'){
                return true;
            }else if(s == 'false'){
                return false;
            }else if(s == 'null'){
                return  null;
            }else if(s == 'undefined') {
                return  undefined;
            }

            var props = s.split('.');
            var val = evt;

            for (var i in props) {
                val = this._get_value(val, props[i]);
            }

            return val;
        };

        this._get_value = function(oldval, property){
            if($.isArray(oldval)) {
                var new_val = [];

                for (var i in oldval) {
                    if (oldval[i] == undefined) {
                        new_val.push(undefined);
                    } else if (property == '*') {
                        for (var j in oldval[i]) {
                            new_val.push(oldval[i][j]);
                        }
                    } else {
                        new_val.push(oldval[i][property]);
                    }
                }
                return new_val;
            }else{
                if(oldval == undefined){
                    return undefined;
                }else if (property == '*'){
                    new_val = [];
                    for (var j in oldval) {
                        new_val.push(oldval[j]);
                    }
                    return new_val;
                }else{
                    return oldval[property];
                }
            }
        };

        this.toString = function(){
            return '['+s+']';
        }
    },

    /**
     * A static value in a filter. Used by the parser.
     * @constructor
     */
    Static: Class('ambrosia_web.filter.Static',
        {
        __init__: function(val) {
            this.val = val;
        },

        evaluate: function(evt){
            assert(evt instanceof A.event.Event);

            return this.val;
        },

        toString: function(){
            return 'static('+ this.val + ')';
        }
    }),

    /**
     * optimize a comparison. Used by the parser.
     */
    optimizeLogical: function(p1, op, p2){
        var p1_static = p1 instanceof A.filter.Static;
        var p2_static = p2 instanceof A.filter.Static;

        if(op == 'OR'){
            if(p1_static && p1.val == false){
                return p2;
            }else if(p1_static && p1.val == true){
                return new A.filter.Static(true);
            }else if(p2_static && p2.val == false){
                return p1;
            }else if(p2_static && p2.val == true){
                return new A.filter.Static(true);
            }
       }else{
            if(p1_static && p1.val == true){
                return p2;
            }else if(p1_static && p1.val == false){
                return new A.filter.Static(false);
            }else if(p2_static && p2.val == true){
                return p1;
            }else if(p2_static && p2.val == false){
                return new A.filter.Static(false);
            }
        }

        return new A.filter.LogicalOperation(p1, op, p2);
    },

    /**
     * Unary operators. Used by the parser
     * @param op the operation e.g. NOT
     * @param expression the expression the operator is applied to
     * @constructor
     */
    UnaryOperator: function(op, expression){
        this.op = op;
        this.expression = expression;

        this.evaluate = function(evt){
            switch(this.op){
            case 'NOT':
                return !this.expression.evaluate(evt);
                break;
            default:
                throw "Unknown unary operation";
                break;
            }
        };
        this.toString = function(){
            return 'unary('+op+', '+expression.toString() + ')';
        }
    },

    /**
     * A comparison. Used by the parser.
     * @param p1 the first value that is compared
     * @param op the compare operation
     * @param p2 the sencond value
     * @constructor
     */
    Comparison: Class('ambrosia_web.filter.Comparison',
        {
        __init__: function(p1, op, p2) {
            this.p1 = p1;
            this.op = op;
            this.p2 = p2;
        },

        _get_val: function(val, evt){
            if(val instanceof A.filter.Property){
                return val.evaluate(evt)
            }

            return val;
        },

        evaluate: function(evt){
            assert(evt instanceof A.event.Event);

            var p1 = this._get_val(this.p1, evt);
            var p2 = this._get_val(this.p2, evt);

            var reverseIn = false;

            switch(this.op){
            case 'EQ':
                return p1 == p2;
                break;
            case 'NEQ':
                return p1 != p2;
                break;
            case 'G':
                return p1 > p2;
                break;
            case 'GE':
                return p1 >= p2;
                break;
            case 'L':
                return p1 < p2;
                break;
            case 'LE':
                return p1 <= p2;
                break;
            case 'REGEX':
                return new RegExp(p2).test(p1);
                break;
            case 'NIN':
                reverseIn = true;
                /* no break */
            case 'IN':
                for(var i in p2){
                    if(p2[i] == p1){
                        return !reverseIn;
                    }
                }
                return reverseIn;
                break;
            default:
                throw "Unknown operation";
                break;
            }
        },

        toString: function(){
            return 'cmp(' + this.p1.toString() + ', ' + this.op + ', ' + this.p2.toString() + ')';
        }
    }),

    /**
     * Logical operations like "&&" and "!!". Used by the parser
     * @param p1 the first expression
     * @param op the operation
     * @param p2 the second expression
     * @constructor
     */
    LogicalOperation: Class('ambrosia_web.filter.LogicalOperation',
        {
        __init__: function(p1, op, p2) {
            this.p1 = p1;
            this.op = op;
            this.p2 = p2;
        },

        evaluate: function(evt){
            assert(evt instanceof A.event.Event);

            switch(this.op){
            case 'AND':
                return (this.p1.evaluate(evt) == true) && (this.p2.evaluate(evt) == true);
                break;
            case 'OR':
                return (this.p1.evaluate(evt) == true) || (this.p2.evaluate(evt) == true);
                break;
            default:
                throw "Unknown operation";
                break;
            }
        },

        toString: function(){
            return 'logical(' + this.p1.toString() + ', ' + this.op + ', ' + this.p2.toString() + ')';
        }
    }),

    /**
     * Helper function for the parser.
     * @param ex1 an expression
     * @param rest an array containing a logical operation and a second expression or undefined
     * @returns {*}
     */
    handleLogicalOperation: function(ex1, rest){
        if(rest){
            return new A.filter.LogicalOperation(ex1, rest[0], rest[1]);
        }else{
            return ex1;
        }
    },

    /**
     * Helper function for the parser.
     * @param op the selector of a statement
     * @param block the block of a statement
     * @param stmt2 the next statement
     * @returns {*}
     */
    handleStatement: function(op, block, stmt2){
        var stmt = A.filter.optimizeLogical(op, 'AND', block);
        return A.filter.optimizeLogical(stmt, 'OR', stmt2);
    },

    /**
     * Add a filter.
     * @param filter the filter object
     * @param no_redraw true if the visualisation should not be redrawn
     * @returns {*}
     */
    addFilter: function(filter, no_redraw){
        A.filter.filters.push(filter);
        for(var i in A.filter.addFilterHandler){
            A.filter.addFilterHandler[i](filter);
        }

        if(filter.isEnabled() && !no_redraw) {
            /* redraw only if the new filter is enabled */
            A.redraw();
        }
    },

    /**
     * Remove a filter
     * @param filter the filter object to remove
     * @returns {*}
     */
    removeFilter: function(filter){
        var idx = A.filter.filters.indexOf(filter);

        if(idx > -1){
            A.filter.filters.splice(idx, 1);
        }

        for(var i in A.filter.removeFilterHandler){
            A.filter.removeFilterHandler[i](filter);
        }

        A.redraw();
    }
};
