"use strict";

function Dimensions(x, y, width, height){
    assert(isFinite(x));
    assert(isFinite(y));
    assert(isFinite(width));
    assert(isFinite(height));
    
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
}
Dimensions.prototype.getX = function(){ return this._x; }
Dimensions.prototype.getY = function(){ return this._y; }
Dimensions.prototype.getWidth = function(){ return this._width; }
Dimensions.prototype.getHeight = function(){ return this._height; }
Dimensions.prototype.getEndX = function(){ return this._x + this._width; }
Dimensions.prototype.getEndY = function(){ return this._y + this._height; }

Dimensions.prototype.setX = function(v){ assert(isFinite(v)); this._x = v; }
Dimensions.prototype.setY = function(v){ assert(isFinite(v)); this._y = v; }
Dimensions.prototype.setHeight = function(v){ assert(isFinite(v)); this._height = v; }
Dimensions.prototype.setWidth = function(v){ assert(isFinite(v)); this._width = v; }

