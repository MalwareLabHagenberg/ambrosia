"use strict";

function BlockLayoutManager(){
    this.blocks = [];
    this.yPosition = 0;
    this._width = 0;
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

BlockLayoutManager.prototype.fitBlock = function(dim){
    assert(dim instanceof Dimensions);

    this.yPosition = dim.getY();
    this.cleanBlocks();

    dim.setX(0);
    while(true){
        var res = this.isOccupied(dim)
        if(res === false){
            break;
        }
        
        dim.setX(res);
    }
    
    this._width = Math.max(this._width, dim.getEndX());
    
    this.blocks.push(dim);
    
    return dim;
}

BlockLayoutManager.prototype.getWidth = function(){
    assert(isFinite(this._width));
    return this._width;
}

