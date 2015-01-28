"use strict";

function BlockLayoutManager(){
    this.blocks = [];
    this.yPosition = 0;
    this._width = 0;
    this._end_y = 0;
}

BlockLayoutManager.prototype.cleanBlocks = function(){
    for(var i in this.blocks){
        var blk = this.blocks[i];
        if((blk.getEndY()) < this.yPosition){
            delete this.blocks[i];
        }
    }    
}

BlockLayoutManager.prototype.isOccupied = function(dim){
    assert(dim instanceof Dimensions);
    
    for(var i in this.blocks){
        var blk = this.blocks[i];
        
        if(blk.getX() < dim.getEndX() && blk.getEndX() > dim.getX() && 
           blk.getY() < dim.getEndY() && blk.getEndY() > dim.getY()){
           return blk.getEndX() + 1;
       }
    }
    
    return false;
}

BlockLayoutManager.prototype.fitBlock = function(dim, margin_x, margin_y){
    assert(dim instanceof Dimensions);

    this.yPosition = dim.getY();
    this.cleanBlocks();

    // add margin for block
    var fitBlock = new Dimensions(
        0, // begin to fit at position 0
        dim.getY(), 
        dim.getWidth() + margin_x, // add margin
        dim.getHeight() + margin_y);
    
    while(true){
        var res = this.isOccupied(fitBlock)
        if(res === false){
            break;
        }
        
        fitBlock.setX(res);
    }
    
    this.blocks.push(fitBlock);
    
    // apply result to dim
    dim.setX(fitBlock.getX())
    
    this._width = Math.max(this._width, dim.getEndX());
    this._end_y = Math.max(this._end_y, dim.getEndY());
    
    return dim;
}

BlockLayoutManager.prototype.getWidth = function(){
    assert(isFinite(this._width));
    return this._width;
}

BlockLayoutManager.prototype.getEndY = function(){
    assert(isFinite(this._end_y));
    return this._end_y;
}
