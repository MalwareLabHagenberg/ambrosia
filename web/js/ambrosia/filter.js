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
     * !(test == 1.2 || (test > 2 && p.bar != "foobar") || true ) && !false
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
     * also match a specific reference (e.g. r.process.pid, r.file.abspath). The reference defined in a property may be
     * a specific reference (like r.file or r.process). Moreover the string "*" may be used to get all values
     * (e.g. r.*.id). Since multiple values are returned, the value  must be treated as an array (Array operations ":"
     * and "!:" must be used). A general filter (that is applied to all events regardless of their type) can therefore
     * be used to find all events related to a certain entity (e.g. "someidofanentity" : r.*.id).
     *
     * @constructor
     */
    Filter: Class('ambrosia_web.filter.Filter',
        {
        __init__: function() {
            this._rule_input = $('<input class="filterinput"/>').val('true');
            this._description_input = $('<input class="filterdescription"/>');
            this._error_label = $('<div class="filtererror"/>');
            this._delete_button = $('<button type="button"/>').text('del');
            this._enable_checkbox = $('<input type="checkbox"/>').prop('checked', true);
            this._div = undefined;
            this._error = false;
            this._filter = null;

            var ths = this;

            this._rule_input.keyup(function(){
                ths._rule_input.addClass('filterchanged');
                ths.setRule(ths._rule_input.val(), true);
            });

            this._rule_input.change(function(){
                A.redraw();
            });

            this._delete_button.click(function(){
                A.event.removeFilter(ths);
            });

            this._enable_checkbox.click(function(){
                A.redraw();
            });
        },

        /**
         * A subclass may return custom jQuery elements
         * @returns {Array}
         * @methodOf ambrosia_web.filter.Filter
         * @name getSubClassElements
         */
        getSubClassElements: function(){ return [];},

        /**
         * replaces the current rule with a new one
         * @function
         * @param {String} r the new rule in filter syntax
         * @param {bool} no_input_update used internally, disables update of the text field
         * @methodOf ambrosia_web.filter.Filter
         * @name setRule
         */
        setRule: function(r, no_input_update){
            try{
                var f = ambrosia_web.filter.parser.parse(r);
                if(!no_input_update){
                    this._rule_input.val(r);
                }
                this._error_label.text('');
                this._rule_input.removeClass('errorinput');
                this._error = false;
                this._filter = f;f
            }catch(ex){
                this._error_label.text(ex);
                this._rule_input.addClass('errorinput');
                this._error = true;
            }
        },

        /**
         * set the description
         * @param {String} d the description
         * @methodOf ambrosia_web.filter.Filter
         * @name setDescription
         */
        setDescription: function(d){
            this._description_input.val(d);
        },

        /**
         * enable or disable the filter
         * @param {bool} b whether the filter should be enabled
         * @methodOf ambrosia_web.filter.Filter
         * @name setEnabled
         */
        setEnabled: function (b) {
            this._enable_checkbox.prop('checked', b);
        },

        toString: function () {
            return 'Filter: '+this._rule_input.val();
        },

        /**
         * Checks whether this filter is enabled
         * @returns {bool} true if enabled
         * @methodOf ambrosia_web.filter.Filter
         * @name isEnabled
         */
        isEnabled: function (){
            return this._enable_checkbox.is(':checked');
        },

        /**
         * Evaluate if an an event matches this filter
         * @returns {bool} true if the event matches
         * @methodOf ambrosia_web.filter.Filter
         * @name evaluate
         */
        evaluate: function(evt){
            return this._filter.evaluate(evt);
        },

        /**
         * Get a jQuery Element that can be used as an graphical representation of the filter (a textbox)
         * @returns {jQuery}
         * @methodOf ambrosia_web.filter.Filter
         * @name getInput
         */
        getInput: function(){
            if(!this._div){
                this._div = ($('<div/>')
                    .append(this._description_input)
                    .append(this._rule_input)
                    .append(this._enable_checkbox));
                this._div.append(this.getSubClassElements());
                this._div.append(this._delete_button)
                         .append(this._error_label);
            }
            return this._div;
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
                return [true];
            }else if(s == 'false'){
                return [false];
            }else if(s == 'null'){
                return  [null];
            }else if(s == 'undefined') {
                return  [undefined];
            }

            var props = s.split('.');
            var val = [evt];

            for (var i in props) {
                val = this._get_value(val, props[i]);
            }

            return val;
        };

        this._get_value = function(oldval, property){
            var new_val =[];
            for(var i in oldval){
                if(oldval[i] == undefined) {
                    new_val.push(undefined);
                }else if(property == '*'){
                    for(var j in oldval[i]){
                        new_val.push(oldval[i][j]);
                    }
                }else{
                    new_val.push(oldval[i][property]);
                }
            }
            return new_val;
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

            return [val];
        },

        evaluate: function(evt){
            assert(evt instanceof A.event.Event);

            var p1 = this._get_val(this.p1, evt);
            var p2 = this._get_val(this.p2, evt);

            var reverseIn = false;

            switch(this.op){
            case 'EQ':
                return p1[0] == p2[0];
                break;
            case 'NEQ':
                return p1[0] != p2[0];
                break;
            case 'G':
                return p1[0] > p2[0];
                break;
            case 'GE':
                return p1[0] >= p2[0];
                break;
            case 'L':
                return p1[0] < p2[0];
                break;
            case 'LE':
                return p1[0] <= p2[0];
                break;
            case 'REGEX':
                return new RegExp(p2[0]).test(p1[0]);
                break;
            case 'NIN':
                reverseIn = true;
                /* no break */
            case 'IN':
                for(var i in p2){
                    if(p2[i] == p1[0]){
                        return !reverseIn;
                    }
                }
                return reverseIn;
                break;
            default:
                throw "Unknown operation";
                break;
            }
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
        }
    }),

    /**
     * A blacklisting filter
     *
     * @param {String} rule the condition for the filter
     * @param {String} description a string describing the filter
     * @param {bool} enabled (optional) whether the filter is effective
     * @constructor
     */
    BlacklistFilter: Class(
            'ambrosia_web.filter.BlacklistFilter',
            'ambrosia_web.filter.Filter',
        {
        __init__: function(rule, description, enabled) {
            this.super();

            if (enabled != undefined) {
                this.setEnabled(enabled);
            }

            this.setDescription(description);
            this.setRule(rule);
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
    }

};