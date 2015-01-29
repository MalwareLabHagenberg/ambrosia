"use strict";

ambrosia.filter = {
    Filter: function(str, forceShowParents){
        if(!str){
            str = '1==1';
        }
    
        if(!forceShowParents){
            forceShowParents = false;
        }
        
        var force_show_parents = forceShowParents;
        var input = $('<input class="filterinput"/>').val(str);
        var err = $('<div class="filtererror"/>');
        var del = $('<button type="button"/>').text('del');
        var force_parent_checkbox = $('<input type="checkbox"/>').prop('checked', force_show_parents);
        this._div = ($('<div/>')
            .append(input)
            .append(force_parent_checkbox)
            .append(del)
            .append(err));
        var error = false;
        var filter = null;

        this.setRule = function(r){
            try{
                var f = ambrosia.filter.parser.parse(r);
                err.text('');
                input.removeClass('errorinput');
                error = false;
                filter = f;
            }catch(ex){
                err.text(ex);
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
        
        del.click(function(){
            A.event.removeFilter(ths);
        });

        this.forcesShowParents = function(){
            return force_show_parents;
        };

        this.evaluate = function(evt){
            return filter.evaluate(evt);
        };

        this.getInput = function(){
            return this._div;
        };
    },

    Property: function(prop, prop2){
        this.evaluate = function(evt){
            assert(evt instanceof A.event.Event);

            if(prop == 'references'){
                assert(prop2 != undefined);

                var vals = [];
                for(var ref in evt.references){
                    if(evt.references[ref].properties[prop2] !== undefined){
                        vals.push(evt.references[ref].properties[prop2]);
                    }else{
                        vals.push(evt.references[ref][prop2]);
                    }
                }
                return vals;
            }else if(prop == 'true'){
                return true;
            }else if(prop == 'false'){
                return false;
            }else if(prop == 'null'){
                return null;
            }else if(evt.properties[prop]){
                return evt.properties[prop];
            }else if(evt[prop]){
                return evt[prop];
            }else{
                /* references */
                if(!evt.references[prop]){
                    return undefined;
                }

                if(evt.references[prop].properties[prop2] !== undefined){
                    return evt.references[prop].properties[prop2];
                }else{
                    return evt.references[prop][prop2];
                }
            }
        };
    },

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

    Statement: function(p1, op, p2){
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
    }
};



