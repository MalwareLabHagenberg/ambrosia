"use strict";

function Filter(str){
    if(!str){
        str = '0==1';
    }

    this._input = $('<input class="filterinput"/>').val(str);
    this._err = $('<div class="filtererror"/>')
    this._div = $('<div/>').append(this._input).append(this._err);
    this._error = false;
    
    this.setRule(str);
    
    var ths = this;
    
    this._input.keyup(function(){
        ths.setRule(ths._input.val());
    });
    
    this._input.change(function(){
        if(!this.error){
            redraw()
        }
    });
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

function Property(prop){
    this.prop = prop;
}
Property.prototype.evaluate = function(evt){
    assert(evt instanceof Event);
    
    if(this.prop == 'true'){
        return true;
    }else if(this.prop == 'false'){
        return false;
    }else if(this.prop == 'null'){
        return null;
    }else if(evt[this.prop]){
        return evt[this.prop];
    }else{
        return evt.properties[this.prop];
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
    default:
        throw "Unknown operation"
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
