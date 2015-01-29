"use strict";

ambrosia.event = {
    onSelectHandler: [],
    onUnSelectHandler: [],
    addFilterHandler: [],
    removeFilterHandler: [],
    generalFilters: [],
    _selected: [],
    DEFAULT_BLOCK_HEIGHT: 0.1,
    BLOCK_WIDTH: 20,
    BLOCK_PADDING: 8,
    BLOCK_MARGIN_X: 4,
    BLOCK_MARGIN_Y: 3,
    DEFAULT_BLOCK_LAYOUT_MANAGER: new ambrosia.layout.BlockLayoutManager(),

    Event: function(){
        this.references = {};
        this.properties = {};
        this.startTS = 0;
        this.endTS = 0;

        this.draw = function(){ assert(false); };
        this.calcDimensions = function(blockLayoutManager){ };

        this.calcVisible = function(){
            this.visible = true;

            var childForcesShow = false;
            for(var i in this.children){
                childForcesShow = childForcesShow || this.children[i].calcVisible();
            }

            if(childForcesShow){
                /* child forces parent views */
                return true; // also force parent to show parents
            }

            /* visibility is not forced by any child */
            var filters = A.event.getEffectiveFilters(A.event.events.event_registry[this.type]);
            var forceShowParents = false;

            for(var i in filters){
                if(filters[i].evaluate(this) == false){
                    /* filter explicitly says hide */
                    this.visible = false;
                    return false;
                }

                /* filter says "visible", does it force show parents? */
                forceShowParents = forceShowParents || filters[i].forcesShowParents();
            }

            /* all filters match */
            return forceShowParents;
        };

        this.getLink = function(){
            var a = $('<a href="javascript:void(0)">');
            var ths = this;

            a.click(function(){
                ths.select();
            });

            a.text(this.description);
            a.addClass('event_link');

            return a;
        };

        this.select = function(){
            A.event.clearSelect();
            this.selectAdd();
        };

        this.selectAdd = function(){
            for(var i in A.event.onSelectHandler){
                A.event.onSelectHandler[i].apply(this);
            }

            A.event._selected.push(this);
        };

        this.unselect = function(){
            var idx = A.event._selected.indexOf(this);

            if(idx == -1){
                A.log.W('unselecting not selected event');
                return;
            }

            for(var i in A.event.onUnSelectHandler){
                A.event.onUnSelectHandler[i].apply(this);
            }

            A.event._selected.splice(idx, 1);
        };

        this.toString = function(){
            return this.description;
        };

    },

    enrich: function(el, parent){
        var new_el = new (A.event.events.event_registry[el.type]);

        for(var i in el){
            new_el[i] = el[i];
        }

        new_el.parent = parent;

        for(var i in new_el.children){
            new_el.children[i] = A.event.enrich(new_el.children[i], new_el);
        }

        for(var i in new_el.references){
            assert(A.result.entities[new_el.references[i]] instanceof A.entity.Entity);
            new_el.references[i] = A.result.entities[new_el.references[i]];
        }

        return new_el;
    },

    getEffectiveFilters: function(cls){
        var res = [];

        if(cls.filters){
            for(var i in cls.filters){
                res.push(cls.filters[i]);
            }
        }

        for(var i in A.event.generalFilters){
            res.push(A.event.generalFilters[i]);
        }

        return res;
    },

    getFilters: function(cls){
        if(!cls){
            return A.event.generalFilters;
        }else{
            if(!cls.filters){
                cls.filters = [];
            }

            return cls.filters;
        }
    },

    addFilter: function(cls, filter){
        var filters = A.event.generalFilters;

        if(cls){
            if(!cls.filters){
                cls.filters = [];
            }

            filters = cls.filters;
        }

        filters.push(filter);

        for(var i in A.event.addFilterHandler){
            A.event.addFilterHandler[i](cls, filter);
        }

        A.redraw();
    },

    removeFilter: function(filter){
        for(var i in A.event.generalFilters){
            if(A.event.generalFilters[i] == filter){
                A.event.generalFilters.splice(i, 1);
            }
        }

        for(var type in A.event.events.event_registry){
            var filters = A.event.getFilters(A.event.events.event_registry[type]);

            for(var i in filters){
                if(filters[i] == filter){
                    filters.splice(i, 1);
                }
            }
        }

        for(var i in A.event.removeFilterHandler){
            A.event.removeFilterHandler[i](filter);
        }

        A.redraw();
    },

    reset: function(){
        A.event.DEFAULT_BLOCK_LAYOUT_MAMAGER = new A.layout.BlockLayoutManager();
    },

    clearSelect: function(){
        for(var i in A.event._selected){
            A.event._selected[i].unselect();
        }
    },

    BlockEvent: function(){
        this.calcDimensions = function(blockLayoutManager){
            assert(blockLayoutManager instanceof A.layout.BlockLayoutManager);

            if(!this.visible){
                return;
            }

            var startTS = this.startTS;
            var endTS = this.endTS;

            var begin = null;
            var end = null;

            if(startTS != null){
                begin = startTS - ts_offset;
            }

            if(endTS != null){
                end = endTS - ts_offset;
            }

            if(begin == null){
                begin = end - A.event.DEFAULT_BLOCK_HEIGHT;
            }else if(end == null){
                end = begin + A.event.DEFAULT_BLOCK_HEIGHT;
            }

            if((end - begin) < A.event.DEFAULT_BLOCK_HEIGHT){
                end = begin + A.event.DEFAULT_BLOCK_HEIGHT;
            }

            this.dimensions = new A.event.Dimensions(0, begin * 1000, A.event.BLOCK_WIDTH, (end - begin) * 1000);

            var childBlockLayoutManager = new ambrosia.layout.BlockLayoutManager();

            for(var i in this.children){
                this.children[i].calcDimensions(childBlockLayoutManager);
            }

            this.dimensions.setWidth(Math.max(
                childBlockLayoutManager.getWidth() + 2 * A.event.BLOCK_PADDING,
                this.dimensions.getWidth()));

            this.dimensions.setHeight(Math.max(
                childBlockLayoutManager.getEndY() - this.dimensions.getY(),
                this.dimensions.getHeight()));

            this.dimensions = blockLayoutManager.fitBlock(this.dimensions, A.event.BLOCK_MARGIN_X, A.event.BLOCK_MARGIN_Y);
        };
        this.draw = function(xOffset){
            if(!this.visible){
                return;
            }

            var ths = this;

            if(!xOffset) {
                xOffset = A.view.mainview.X_OFFSET;
            }

            this.svgElement = A.mainView.svg.rect(
                A.mainView.g_events,
                xOffset + this.dimensions.getX(), this.dimensions.getY(),
                this.dimensions.getWidth(), this.dimensions.getHeight(),
                {fill: this.getColor()});

            $(this.svgElement).addClass('mainview_block');

            for(var i in this.children){
                this.children[i].draw(A.event.BLOCK_PADDING + xOffset + this.dimensions.getX());
            }


            $(this.svgElement).click(function(){
                ths.select();
            });
        }
    },

    LineEvent: function(){
        this.calcDimensions = function(blockLayoutManager){};

        this.draw = function(){
            if(!this.visible)
                return;

            var width = 1.0;
            var pos = (this.startTS - ts_offset) * 1000;

            this.svgElement = A.mainView.svg.line(
                A.mainView.g_events,
                A.view.mainview.X_OFFSET,
                pos,
                A.mainView.getWidth(),
                pos,
                {stroke: '#ffff00',
                 fill: 'none',
                 strokeWidth: width});
        }
    },
    
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

/* set inheritance relationships */
A.event.BlockEvent.prototype = new A.event.Event();
A.event.LineEvent.prototype = new A.event.Event();