"use strict";

/**
 * @namespace contains all classes used for positioning elements
 */
ambrosia_web.layout = {
    /**
     * The block layout manager is used to position event block in the main view.
     *
     * @see :js:func:`ambrosia_web.layout.BlockLayoutManager.fitBlock` for details.
     *
     * Note: in order for the block layout manager to properly work, the events have to be fitted in ascending order (x
     * position)
     * @constructor
     */
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
            assert(dim instanceof A.layout.Dimensions);

            for(var i in blocks){
                var blk = blocks[i];

                if(blk.getX() < dim.getEndX() && blk.getEndX() > dim.getX() &&
                   blk.getY() < dim.getEndY() && blk.getEndY() > dim.getY()){
                   return blk.getEndX() + 1;
               }
            }

            return false;
        };

        /**
         * Takes a :js:class:`ambrosia_web.layout.Dimensions` object and tries to fit it considering the previously
         * fitted blocks.
         * @param {ambrosia_web.layout.Dimensions} dim the dimensions of the block (may overlap other events)
         * @param {int} margin_x the horizontal margin that should be left
         * @param {int} margin_y the vertical margin that should be left
         * @returns {ambrosia_web.layout.Dimensions} the new dimensions of the non-overlapping block
         */
        this.fitBlock = function(dim, margin_x, margin_y){
            assert(dim instanceof A.layout.Dimensions);

            yPosition = dim.getY();
            this.cleanBlocks();

            // add margin for block
            var fitBlock = new A.layout.Dimensions(
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

        /**
         * get the width of the whole block layout manager (considering all fitted events)
         * @returns {number}
         */
        this.getWidth = function(){
            assert(isFinite(width));
            return width;
        };

        /**
         * position bottom border of the block layout manager (considering all fitted events)
         * @returns {number}
         */
        this.getEndY = function(){
            assert(isFinite(end_y));
            return end_y;
        }
    },

    /**
     * Helper class that represents the dimensions of a block
     * @param x the x position
     * @param y the y position
     * @param width the width
     * @param height the height
     * @constructor
     */
    Dimensions: function (x, y, width, height){
        assert(isFinite(x));
        assert(isFinite(y));
        assert(isFinite(width));
        assert(isFinite(height));

        this.getX = function(){ return x; };
        this.getY = function(){ return y; };
        this.getWidth = function(){ return width; };
        this.getHeight = function(){ return height; };
        this.getEndX = function(){ return x + width; };
        this.getEndY = function(){ return y + height; };

        this.setX = function(v){ assert(isFinite(v)); x = v; };
        this.setY = function(v){ assert(isFinite(v)); y = v; };
        this.setHeight = function(v){ assert(isFinite(v)); height = v; };
        this.setWidth = function(v){ assert(isFinite(v)); width = v; };
    }
};