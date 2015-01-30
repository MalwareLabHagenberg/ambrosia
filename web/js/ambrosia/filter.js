"use strict";

/**
 * @namespace used for filtering events
 */
ambrosia_web.filter = {
    /***
     * A Filter represents a single condition (either entered by the user or a default condition).
     *
     * The following shows example for the filter syntax:
     *
     * @example
     * !(test == 1.2 || (test > 2 && foo.bar != "foobar") || true ) && !false
     *
     * The logical operations "&&" and '!!' as well as the unary logical operation "!" are allowed. Parentheses may be
     * used to change the default precedence of the operations.
     *
     * These logical operations manage "comparisons". A "comparison" may compare two values using the operators "==",
     * "!=", ">=", "<=", "<", "~" (the first value matches a regex defined by the second value), ":" (the second value
     * is an array and the first element is contained in the second one) and "!:" (the first value is not contained
     * in the second value).
     *
     * A value may be a string in the form of "string", a number in the form of 1.0 or 1, true or false or a property.
     * A property is a string describing an attribute of an event (e.g. abspath, successful). Moreover a property may
     * also match a specific reference (e.g. process.pid, file.abspath). The reference defined in a property may be a
     * specific reference (like file or process) or the string "references". This special reference matches all
     * references in an event. Therefore, the value of any property using "references" (e.g. references.id) must be
     * treated as an array (Array operations ":" and "!:" must be used). A filter general filter (that is applied to all
     * events regardless of their type) can therefore be used to find all events related to a certain entity (e.g.
     * "someidofanentity" : references.id).
     *
     * @param {String} str the condition for the filter
     * @param enabled whether the filter is effective
     * @constructor
     */
    Filter: function(str, enabled){
        if(!str){
            str = 'true';
        }

        if(enabled == undefined){
            enabled = true;
        }

        var input = $('<input class="filterinput"/>').val(str);
        var error_label = $('<div class="filtererror"/>');
        var delete_button = $('<button type="button"/>').text('del');
        var enable_checkbox = $('<input type="checkbox"/>').prop('checked', enabled);
        this._div = ($('<div/>')
            .append(input)
            .append(enable_checkbox)
            .append(delete_button)
            .append(error_label));
        var error = false;
        var filter = null;

        /**
         * replaces the current rule with a new one
         * @function
         * @param r {String} the new rule in filter syntax
         */
        this.setRule = function(r){
            try{
                var f = ambrosia_web.filter.parser.parse(r);
                error_label.text('');
                input.removeClass('errorinput');
                error = false;
                filter = f;
            }catch(ex){
                error_label.text(ex);
                input.addClass('errorinput');
                error = true;
            }
        };

        this.setRule(str);
        
        var ths = this;
        
        input.keyup(function(){
            input.addClass('filterchanged');
            ths.setRule(input.val());
        });

        delete_button.click(function(){
            A.event.removeFilter(ths);
        });

        enable_checkbox.click(function(){
            enabled = enable_checkbox.is(':checked');
            A.redraw();
        });

        /**
         * Checks whether this filter is enabled
         * @returns {bool} true if enabled
         */
        this.isEnabled = function (){
            return enabled;
        };

        /**
         * Evaluate if an an event matches this filter
         * @returns {bool} true if the event matches
         */
        this.evaluate = function(evt){
            return filter.evaluate(evt);
        };

        /**
         * Get a jQuery Element that can be used as an graphical representation of the filter (a textbox)
         * @returns {jQuery}
         */
        this.getInput = function(){
            return this._div;
        };
    },

    /**
     * A property used in a filter. Used by the parser.
     * @param prop1 the string before the dot
     * @param prop2 the string after the dot or empty
     * @constructor
     */
    Property: function(prop1, prop2){
        this.evaluate = function(evt){
            assert(evt instanceof A.event.Event);

            var res_prop1;

            if(prop1 == 'references'){
                res_prop1 = [];
                for(var ref in evt.references){
                    if(evt.references[ref] == undefined) {
                        continue;
                    }

                    if(evt.references[ref].properties[prop2] !== undefined){
                        res_prop1.push(evt.references[ref].properties[prop2]);
                    }else{
                        res_prop1.push(evt.references[ref][prop2]);
                    }
                }
            }else if(prop1 == 'true'){
                res_prop1 = true;
            }else if(prop1 == 'false'){
                res_prop1 = false;
            }else if(prop1 == 'null'){
                res_prop1 = null;
            }else if(prop1 == 'undefined'){
                res_prop1 = undefined;
            }else if(evt.properties[prop1]){
                res_prop1 = evt.properties[prop1];
            }else if(evt[prop1]){
                res_prop1 = evt[prop1];
            }else {
                res_prop1 = evt.references[prop1];
            }

            if(!prop2) {
                /* there is nothing after the dot, return what we have */
                return res_prop1;
            }

            if($.isArray(res_prop1)) {
                /* if the first property is an array, return an array containing all properties from each element */

                var res = [];

                for(var i in res_prop1) {
                    if(res_prop1[i] == undefined) {
                        res.push(undefined);
                    }else {
                        res.push(res_prop1[i][prop2]);
                    }
                }
            }else {
                if(res_prop1 == undefined) {
                    return undefined;
                }else {
                    return res_prop1[prop2];
                }
            }
        };
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
    },

    /**
     * A comparison. Used by the parser.
     * @param p1 the first value that is compared
     * @param op the compare operation
     * @param p2 the sencond value
     * @constructor
     */
    Comparison: function(p1, op, p2){
        this.p1 = p1;
        this.op = op;
        this.p2 = p2;

        this._get_val = function(val, evt){
            if(val instanceof A.filter.Property){
                return val.evaluate(evt)
            }

            return val;
        };

        this.evaluate = function(evt){
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
        };
    },

    /**
     * Logical operations like "&&" and "!!". Used by the parser
     * @param p1 the first expression
     * @param op the operation
     * @param p2 the second expression
     * @constructor
     */
    LogicalOperation: function(p1, op, p2){
        this.p1 = p1;
        this.op = op;
        this.p2 = p2;

        this.evaluate = function(evt){
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
        }
    },

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
    }

};



