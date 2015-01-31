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
    BlockLayoutManager: Class('ambrosia_web.layout.BlockLayoutManager',
        {
        __init__: function() {
            this._blocks = [];
            this._yPosition = 0;
            this._width = 0;
            this._end_y = 0;
        },

        cleanBlocks: function(){
            for(var i in this._blocks){
                var blk = this._blocks[i];
                if((blk.getEndY()) < this._yPosition){
                    delete this._blocks[i];
                }
            }
        },

        isOccupied: function(dim){
            assert(dim instanceof A.layout.Dimensions);

            for(var i in this._blocks){
                var blk = this._blocks[i];

                if(blk.getX() < dim.getEndX() && blk.getEndX() > dim.getX() &&
                   blk.getY() < dim.getEndY() && blk.getEndY() > dim.getY()){
                   return blk.getEndX() + 1;
               }
            }

            return false;
        },

        /**
         * Takes a :js:class:`ambrosia_web.layout.Dimensions` object and tries to fit it considering the previously
         * fitted blocks.
         * @param {ambrosia_web.layout.Dimensions} dim the dimensions of the block (may overlap other events)
         * @param {int} margin_x the horizontal margin that should be left
         * @param {int} margin_y the vertical margin that should be left
         * @returns {ambrosia_web.layout.Dimensions} the new dimensions of the non-overlapping block
         * @methodOf ambrosia_web.layout.BlockLayoutManager
         * @name fitBlock
         */
        fitBlock: function(dim, margin_x, margin_y){
            assert(dim instanceof A.layout.Dimensions);

            this._yPosition = dim.getY();
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

            this._blocks.push(fitBlock);

            // apply result to dim
            dim.setX(fitBlock.getX());

            this._width = Math.max(this._width, dim.getEndX());
            this._end_y = Math.max(this._end_y, dim.getEndY());

            return dim;
        },

        /**
         * get the width of the whole block layout manager (considering all fitted events)
         * @returns {number}
         * @methodOf ambrosia_web.layout.BlockLayoutManager
         * @name getWidth
         */
        getWidth: function(){
            assert(isFinite(this._width));
            return this._width;
        },

        /**
         * position bottom border of the block layout manager (considering all fitted events)
         * @returns {number}
         * @methodOf ambrosia_web.layout.BlockLayoutManager
         * @name getEndY
         */
        getEndY: function(){
            assert(isFinite(this._end_y));
            return this._end_y;
        }
    }),

    /**
     * Helper class that represents the dimensions of a block
     * @param x the x position
     * @param y the y position
     * @param width the width
     * @param height the height
     * @constructor
     */
    Dimensions: Class('ambrosia_web.layout.Dimensions',
        {
        __init__: function (x, y, width, height) {
            assert(isFinite(x));
            assert(isFinite(y));
            assert(isFinite(width));
            assert(isFinite(height));

            this._x = x;
            this._y = y;
            this._width = width;
            this._height = height;
        },

        getX: function(){ return this._x; },
        getY: function(){ return this._y; },
        getWidth: function(){ return this._width; },
        getHeight: function(){ return this._height; },
        getEndX: function(){ return this._x + this._width; },
        getEndY: function(){ return this._y + this._height; },

        setX: function(v){ assert(isFinite(v)); this._x = v; },
        setY: function(v){ assert(isFinite(v)); this._y = v; },
        setWidth: function(v){ assert(isFinite(v)); this._width = v; },
        setHeight: function(v){ assert(isFinite(v)); this._height = v; }
    })
};