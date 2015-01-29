"use strict";

ambrosia.layout = {
    BlockLayoutManager: function(){
        var blocks = [];
        var yPosition = 0;
        var width = 0;
        var end_y = 0;

        this.cleanBlocks = function(){
            for(var i in blocks){
                var blk = blocks[i];
                if((blk.getEndY()) < yPosition){
                    delete blocks[i];
                }
            }
        };

        this.isOccupied = function(dim){
            assert(dim instanceof A.event.Dimensions);

            for(var i in blocks){
                var blk = blocks[i];

                if(blk.getX() < dim.getEndX() && blk.getEndX() > dim.getX() &&
                   blk.getY() < dim.getEndY() && blk.getEndY() > dim.getY()){
                   return blk.getEndX() + 1;
               }
            }

            return false;
        };

        this.fitBlock = function(dim, margin_x, margin_y){
            assert(dim instanceof A.event.Dimensions);

            yPosition = dim.getY();
            this.cleanBlocks();

            // add margin for block
            var fitBlock = new A.event.Dimensions(
                0, // begin to fit at position 0
                dim.getY(),
                dim.getWidth() + margin_x, // add margin
                dim.getHeight() + margin_y);

            while(true){
                var res = this.isOccupied(fitBlock);
                if(res === false){
                    break;
                }

                fitBlock.setX(res);
            }

            blocks.push(fitBlock);

            // apply result to dim
            dim.setX(fitBlock.getX());

            width = Math.max(width, dim.getEndX());
            end_y = Math.max(end_y, dim.getEndY());

            return dim;
        };

        this.getWidth = function(){
            assert(isFinite(width));
            return width;
        };

        this.getEndY = function(){
            assert(isFinite(end_y));
            return end_y;
        }
    }
};