"use strict";

/**
 * @namespace the namespace used for classes related to events
 */
ambrosia_web.event = {
    /**
     * contains all handlers for selecting events. Any part of the application may listen to those events (i.e. add a
     * function to this array). If the user select an entity the interface can adapt to this (e.g. the
     * :js:class:`ambrosia_web.view.detailsview.DetailsView` shows details about this event).
     */
    onSelectHandler: [],

    /**
     * contains all handlers for unselecting events. Any part of the application may listen to those events (i.e. add a
     * function to this array). If the user unselect an entity the interface can adapt to this (e.g. the
     * :js:class:`ambrosia_web.view.detailsview.DetailsView` shows details about this event).
     */
    onUnSelectHandler: [],

    /**
     * contains all handlers for adding filters to an  event class. Any part of the application may listen to those
     * events (i.e. add a function to this array). If the user select an entity the interface can adapt to this.
     */
    addFilterHandler: [],

    /**
     * contains all handlers for removing filters from an  event class. Any part of the application may listen to those
     * events (i.e. add a function to this array). If the user select an entity the interface can adapt to this.
     */
    removeFilterHandler: [],

    _generalFilters: [],
    _selected: [],

    /**
     * The default height in seconds for an event
     * @constant
     */
    DEFAULT_BLOCK_HEIGHT: 0.1,

    /**
     * The minimum width of a block (in pixel)
     * @contant
     */
    BLOCK_WIDTH: 20,

    /**
     * The horizontal space Ambrosia should keep between the borders of a child event and its parent (in pixel)
     * @constant
     */
    BLOCK_PADDING: 8,

    /**
     * The horizontal space Ambrosia should keep between two adjacent event
     * @constant
     */
    BLOCK_MARGIN_X: 4,

    /**
     *  The vertical space Ambrosia should keep between two adjacent event
     *  @constant
     */
    BLOCK_MARGIN_Y: 3,

    /**
     * The default :js:class:`ambrosia_web.layout.BlockLayoutManager` that is used on the top level
     * @constant
     */
    DEFAULT_BLOCK_LAYOUT_MANAGER: new ambrosia_web.layout.BlockLayoutManager(),

    /**
     * The client side counterpart for an event
     * @see :class:`ambrosia.model.Event`
     * @constructor
     */
    Event: function(){
        this.references = {};
        this.properties = {};
        this.startTS = 0;
        this.endTS = 0;
        this.children = [];

        /**
         * Draw the event. Should be called third when drawing. Must be implemented by subclass.
         */
        this.draw = function(){ assert(false); };

        /**
         * Calculates the dimensions of the visualisation (for block events). Should be called second when drawing.
         * events.
         * @param {ambrosia_web.layout.BlockLayoutManager} blockLayoutManager the block layout manager to use
         */
        this.calcDimensions = function(blockLayoutManager){ };

        /**
         * This is the first method called when drawing events. It calculates if an element should be shown and also
         * considers the visibility of the child elements (if a child event is shown show this event)
         */
        this.calcVisible = function(){
            this.visible = true;

            var filters = A.event.getEffectiveFilters(A.event.events.event_registry[this.type]);

            for (var i in filters) {
                if (!filters[i].isEnabled()) {
                    continue;
                }

                if (filters[i].evaluate(this) == false) {
                    /* filter explicitly says hide */
                    this.visible = false;
                    break;
                }
            }

            var child_forces_visible = false;
            for(var i in this.children) {
                /* a child is visible, parent needs to be visible too */
                child_forces_visible = this.children[i].calcVisible() || child_forces_visible;
            }

            this.visible = this.visible || child_forces_visible;

            return this.visible;
        };

        /**
         * Returns a jQuery element containing a link that, when clicked, selects the event.
         * @returns {jQuery} the link
         */
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

        /**
         * This method should be called when the user selects one event.
         */
        this.select = function(){
            A.event.clearSelect();
            this.selectAdd();
        };

        /**
         * This method should be called when the user adds an event to a selection.
         */
        this.selectAdd = function(){
            for(var i in A.event.onSelectHandler){
                A.event.onSelectHandler[i](this);
            }

            A.event._selected.push(this);
        };

        /**
         * This method should be called when the user unselects one event.
         */
        this.unselect = function(){
            var idx = A.event._selected.indexOf(this);

            if(idx == -1){
                A.log.W('unselecting not selected event');
                return;
            }

            for(var i in A.event.onUnSelectHandler){
                A.event.onUnSelectHandler[i](this);
            }

            A.event._selected.splice(idx, 1);
        };

        this.toString = function(){
            return this.description;
        };

    },

    /**
     * Receives an object containing the deserialized data from the server and returns an instance of the class
     * :js:class:`ambrosia_web.event.Event`
     * @param {object} el the deserialized data
     * @param {ambrosia_web.event.Event} parent the events parent event (if exists)
     */
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

    /**
     * Returns the filters that are effective for a specific event class.
     * @param {class} cls the event class
     * @returns {Array} the filters
     */
    getEffectiveFilters: function(cls){
        var res = [];

        if(cls.filters){
            for(var i in cls.filters){
                res.push(cls.filters[i]);
            }
        }

        for(var i in A.event._generalFilters){
            res.push(A.event._generalFilters[i]);
        }

        return res;
    },

    /**
     * Returns all filter for a class. If null is passed, returns the general filters.
     * @param {class} cls the event class
     * @returns {Array} the filter
     */
    getFilters: function(cls){
        if(!cls){
            return A.event._generalFilters;
        }else{
            if(!cls.filters){
                cls.filters = [];
            }

            return cls.filters;
        }
    },

    /**
     * Add a filter to an event class. If null is passed, the filter is added to the general filters.
     * @param {class} cls the event class
     * @param {ambrosia_web.filter.Filter} filter the filter to add
     */
    addFilter: function(cls, filter){
        var filters = A.event._generalFilters;

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

    /**
     * Removes a filter
     * @param {ambrosia_web.filter.Filter} filter the filter to remove
     */
    removeFilter: function(filter){
        for(var i in A.event._generalFilters){
            if(A.event._generalFilters[i] == filter){
                A.event._generalFilters.splice(i, 1);
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

    /**
     * Resets the default :js:class:`A.layout.BlockLayoutManager`
     */
    reset: function(){
        A.event.DEFAULT_BLOCK_LAYOUT_MANAGER = new A.layout.BlockLayoutManager();
    },

    /**
     * unselect all events
     */
    clearSelect: function(){
        for(var i in A.event._selected){
            A.event._selected[i].unselect();
        }
    },

    /**
     * Base class for all events that are drawn as a block.
     * @constructor
     */
    BlockEvent: function(){
        /**
         * Calculates the dimensions of the visualisation (for block events). The top level events are drawn using the
         * default block layout manager. Each event that has visible children creates a new block layout manager that
         * is used to position the children (the children's calcDimensions method is called). The block layout manager
         * that was used to position the children holds the width and height that is required to draw all children.
         * Afterwards (using this width/height) the parent event is drawn.
         *
         * @param {ambrosia_web.layout.BlockLayoutManager} blockLayoutManager the block layout manager to use
         */
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

            this.dimensions = new A.layout.Dimensions(0, begin * 1000, A.event.BLOCK_WIDTH, (end - begin) * 1000);

            var childBlockLayoutManager = new ambrosia_web.layout.BlockLayoutManager();

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

        /**
         * draws the event
         * @param {int} xOffset (optional) if this is a child object, the x position of the parent
         */
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


            $(this.svgElement).click(function(event){
                if(event.ctrlKey){
                    ths.selectAdd();
                }else {
                    ths.select();
                }
            });
        }
    },

    /**
     * Base class for all events that are drawn as a horizontal line across the main view.
     * @constructor
     */
    LineEvent: function(){
        this.calcDimensions = function(blockLayoutManager){};

        /**
         * draws the line
         */
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
    }
};

/* set inheritance relationships */
A.event.BlockEvent.prototype = new A.event.Event();
A.event.LineEvent.prototype = new A.event.Event();