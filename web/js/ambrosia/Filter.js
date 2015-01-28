"use strict";

function Filter(str, forceShowParents){
    if(!str){
        str = '1==1';
    }

    if(!forceShowParents){
        forceShowParents = false;
    }
    
    this._forceShowParents = forceShowParents;
    this._input = $('<input class="filterinput"/>').val(str);
    this._err = $('<div class="filtererror"/>')
    this._del = $('<button type="button"/>').text('del');
    this._forceParentCb = $('<input type="checkbox"/>').prop('checked', this._forceShowParents);
    this._div = ($('<div/>')
        .append(this._input)
        .append(this._forceParentCb)
        .append(this._del)
        .append(this._err));
    this._error = false;
    
    this.setRule(str);
    
    var ths = this;
    
    this._input.keyup(function(){
        ths._input.addClass('filterchanged');
        ths.setRule(ths._input.val());
    });
    
    this._del.click(function(){
        Event.removeFilter(ths);
    });
}

Filter.prototype.forcesShowParents = function(){
    return this._forceShowParents;
}

Filter.prototype.setRule = function(r){
    try{
        var filter = Filter.parser.parse(r);
        this._err.text('');
        this._input.removeClass('errorinput');
        this.error = false;
        this._filter = filter;
    }catch(ex){
        this._err.text(ex);
        this._input.addClass('errorinput');
        this.error = true;
    }
}

Filter.prototype.evaluate = function(evt){
    return this._filter.evaluate(evt);
}

Filter.prototype.getInput = function(){
    return this._div;
}

function Property(prop, prop2){
    this.prop = prop;
    this.prop2 = prop2;
}
Property.prototype.evaluate = function(evt){
    assert(evt instanceof Event);
    
    if(this.prop == 'references'){
        assert(this.prop2 != undefined);
        
        var vals = [];
        for(var ref in evt.references){
            if(evt.references[ref].properties[this.prop2] !== undefined){
                vals.push(evt.references[ref].properties[this.prop2]);
            }else{
                vals.push(evt.references[ref][this.prop2]);
            }
        }
        return vals;
    }else if(this.prop == 'true'){
        return true;
    }else if(this.prop == 'false'){
        return false;
    }else if(this.prop == 'null'){
        return null;
    }else if(evt.properties[this.prop]){
        return evt.properties[this.prop];
    }else if(evt[this.prop]){
        return evt[this.prop];
    }else{
        /* refernces */
        if(!evt.references[this.prop]){
            return undefined;
        }
        
        if(evt.references[this.prop].properties[this.prop2] !== undefined){
            return evt.references[this.prop].properties[this.prop2];
        }else{
            return evt.references[this.prop][this.prop2];
        }
    }
}

function UnaryOperator(op, expression){
    this.op = op;
    this.expression = expression;
}

UnaryOperator.prototype.evaluate = function(evt){
    switch(this.op){
    case 'NOT':
        return !this.expression.evaluate(evt);
        break;
    default:
        throw "Unknown unary operation";
        break;
    }
}


function Comparison(p1, op, p2){
    this.p1 = p1;
    this.op = op;
    this.p2 = p2;
}
Comparison.prototype._get_val = function(val, evt){
    if(val instanceof Property){
        return val.evaluate(evt)
    }
    
    return val;
}
Comparison.prototype.evaluate = function(evt){
    assert(evt instanceof Event);
    
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
                return reverseIn ? false : true;
            }
        }
        return reverseIn ? true : false;
        break;
    default:
        throw "Unknown operation";
        break;
    }
}

function Statement(p1, op, p2){
    this.p1 = p1;
    this.op = op;
    this.p2 = p2;
}
Statement.prototype.evaluate = function(evt){
    assert(evt instanceof Event);
    
    switch(this.op){
    case 'AND':
        return (this.p1.evaluate(evt) == true) && (this.p2.evaluate(evt) == true);
        break;
    case 'OR':
        return (this.p1.evaluate(evt) == true) || (this.p2.evaluate(evt) == true);
        break;
    default:
        throw "Unknown operation"
        break;
    }
}

