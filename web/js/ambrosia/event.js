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
    DEFAULT_BLOCK_HEIGHT: 1,

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
    Event: Class('ambrosia_web.event.Event', {
        __init__: function() {
            this.references = {};
            this.properties = {};
            this.startTS = 0;
            this.endTS = 0;
            this.children = [];
        },

        /**
         * Draw the event. Should be called third when drawing. Must be implemented by subclass.
         * @methodOf ambrosia_web.event.Event
         * @name draw
         */
        draw: function(){ assert(false); },

        /**
         * Calculates the dimensions of the visualisation (for block events). Should be called second when drawing.
         * events.
         * @param {ambrosia_web.layout.BlockLayoutManager} blockLayoutManager the block layout manager to use
         * @methodOf ambrosia_web.event.Event
         * @name calcDimensions
         */
        calcDimensions: function(blockLayoutManager){ },

        /**
         * This is the first method called when drawing events. It calculates if an element should be shown and also
         * considers the visibility of the child elements (a child can force it's parent to show)
         * @methodOf ambrosia_web.event.Event
         * @name calcVisible
         */
        calcVisible: function(){
            this.visible = true;

            var child_forces_visible = false;
            var counter = 0;
            for(var i in this.children) {
                /* a child is visible, parent needs to be visible too */
                var rarr =this.children[i].calcVisible();
                child_forces_visible = rarr[0] || child_forces_visible;
                counter += rarr[1];
            }

            this.visible = this.visible || child_forces_visible;

            if(!child_forces_visible) {
                var filters = A.event.getEffectiveFilters(A.event.events.event_registry[this.type]);

                for (var i in filters) {
                    if (!filters[i].isEnabled()) {
                        continue;
                    }

                    if (filters[i].evaluate(this) == false) {
                        /* filter explicitly says hide */
                        this.visible = false;
                        filters[i].counter++;
                    }
                }
            }

            if(this.visible){
                counter ++;
            }else{
                counter = 0;
            }

            return [false, counter];
        },

        /**
         * Returns a jQuery element containing a link that, when clicked, selects the event.
         * @returns {jQuery} the link
         * @methodOf ambrosia_web.event.Event
         * @name getLink
         */
        getLink: function(){
            var a = $('<a href="javascript:void(0)">');
            var ths = this;

            a.click(function(){
                ths.select();
            });

            a.text(this.description);
            a.addClass('event_link');

            return a;
        },

        /**
         * This method should be called when the user selects one event.
         * @methodOf ambrosia_web.event.Event
         * @name select
         */
        select: function(){
            A.event.clearSelect();
            this.selectAdd();
        },

        /**
         * This method should be called when the user adds an event to a selection.
         * @methodOf ambrosia_web.event.Event
         * @name selectAdd
         */
        selectAdd: function(){
            for(var i in A.event.onSelectHandler){
                A.event.onSelectHandler[i](this);
            }

            A.event._selected.push(this);
        },

        /**
         * This method should be called when the user unselects one event.
         * @methodOf ambrosia_web.event.Event
         * @name unselect
         */
        unselect: function(){
            var idx = A.event._selected.indexOf(this);

            if(idx == -1){
                A.log.W('unselecting not selected event');
                return;
            }

            for(var i in A.event.onUnSelectHandler){
                A.event.onUnSelectHandler[i](this);
            }

            A.event._selected.splice(idx, 1);
        },

        toString: function(){
            return this.description;
        }
    }),

    /**
     * Receives an object containing the deserialized data from the server and returns an instance of the class
     * :js:class:`ambrosia_web.event.Event`
     * @param {object} el the deserialized data
     * @param {ambrosia_web.event.Event} parent the events parent event (if exists)
     */
    enrich: function(el, parent){
        var type = A.event.events.event_registry[el.type];

        if(type == undefined){
            throw "Undefined event: " + el.type;
        }

        var new_el = new (type);

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

        /* create shortcuts */
        new_el.r = new_el.references;
        new_el.p = new_el.properties;

        return new_el;
    },

    /**
     * Returns the filters that are effective for a specific event class.
     * @param {class} cls the event class
     * @returns {Array} the filters
     */
    getEffectiveFilters: function(cls){
        var res = [];

        if(cls.prototype.filters){
            for(var i in cls.prototype.filters){
                res.push(cls.prototype.filters[i]);
            }
        }

        for(var i in A.event._generalFilters){
            res.push(A.event._generalFilters[i]);
        }

        return res;
    },

    getAllFilters: function(){
        var res = [];
        var evts = A.event.events.event_registry;

        for(var classname in evts){
            var filters = A.event.getFilters(evts[classname]);

            for(var filteridx in filters){
                res.push(filters[filteridx]);
            }
        }

        for(var i in A.event._generalFilters){
            res.push(A.event._generalFilters[i]);
        }

        return res;
    },

    /**
     * TODO
     */
    resetFilterCounters: function(){
        var filters = A.event.getAllFilters();

        for(var i in filters){
            filters[i].counter = 0;
        }
    },

    /**
     * TODO
     */
    redrawFilters: function(){
        var filters = A.event.getAllFilters();

        for(var i in filters){
            filters[i].redraw();
        }
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
            if(!cls.prototype.filters){
                cls.prototype.filters = [];
            }

            return cls.prototype.filters;
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
            if(!cls.prototype.filters){
                cls.prototype.filters = [];
            }

            filters = cls.prototype.filters;
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
        while(A.event._selected.length > 0){
            A.event._selected[0].unselect();
        }
    },

    /**
     * Base class for all events that are drawn as a block.
     * @constructor
     * @extends ambrosia_web.event.Event
     */
    BlockEvent: Class(
            'ambrosia_web.event.BlockEvent',
            'ambrosia_web.event.Event',
        {
        /**
         * Calculates the dimensions of the visualisation (for block events). The top level events are drawn using the
         * default block layout manager. Each event that has visible children creates a new block layout manager that
         * is used to position the children (the children's calcDimensions method is called). The block layout manager
         * that was used to position the children holds the width and height that is required to draw all children.
         * Afterwards (using this width/height) the parent event is drawn.
         *
         * @param {ambrosia_web.layout.BlockLayoutManager} blockLayoutManager the block layout manager to use
         * @methodOf ambrosia_web.event.BlockEvent
         * @name calcDimensions
         */
        calcDimensions: function(blockLayoutManager) {
            assert(blockLayoutManager instanceof A.layout.BlockLayoutManager);

            if (!this.visible) {
                return;
            }

            var startTS = this.startTS;
            var endTS = this.endTS;

            var begin = null;
            var end = null;

            if (startTS != null) {
                begin = startTS - ts_offset;
            }

            if (endTS != null) {
                end = endTS - ts_offset;
            }

            if (begin == null) {
                begin = end - A.event.DEFAULT_BLOCK_HEIGHT;
            } else if (end == null) {
                end = begin + A.event.DEFAULT_BLOCK_HEIGHT;
            }

            if ((end - begin) < A.event.DEFAULT_BLOCK_HEIGHT) {
                end = begin + A.event.DEFAULT_BLOCK_HEIGHT;
            }

            this.dimensions = new A.layout.Dimensions(0, begin * 1000, A.event.BLOCK_WIDTH, (end - begin) * 1000);

            var childBlockLayoutManager = new ambrosia_web.layout.BlockLayoutManager();

            for (var i in this.children) {
                this.children[i].calcDimensions(childBlockLayoutManager);
            }

            this.dimensions.setWidth(Math.max(
                childBlockLayoutManager.getWidth() + 2 * A.event.BLOCK_PADDING,
                this.dimensions.getWidth()));

            this.dimensions.setHeight(Math.max(
                childBlockLayoutManager.getEndY() - this.dimensions.getY(),
                this.dimensions.getHeight()));

            this.dimensions = blockLayoutManager.fitBlock(this.dimensions, A.event.BLOCK_MARGIN_X, A.event.BLOCK_MARGIN_Y);
        },

        /**
         * draws the event
         * @param {int} xOffset (optional) if this is a child object, the x position of the parent
         * @methodOf ambrosia_web.event.BlockEvent
         * @name draw
         */
        draw: function(xOffset){
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
                this.dimensions.getWidth(), this.dimensions.getHeight());

            $(this.svgElement).addClass('mainview_block').addClass(this.cssClass);

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
    }),

    /**
     * Base class for all events that are drawn as a horizontal line across the main view.
     * @constructor
     * @extends ambrosia_web.event.Event
     */
    LineEvent: Class(
            'ambrosia_web.event.LineEvent',
            'ambrosia_web.event.Event',
        {

        calcDimensions: function(blockLayoutManager){},

        /**
         * draws the line
         * @methodOf ambrosia_web.event.LineEvent
         * @name draw
         */
        draw: function(){
            if(!this.visible)
                return;

            var pos = (this.startTS - ts_offset) * 1000;

            this.svgElement = A.mainView.svg.line(
                A.mainView.g_events,
                A.view.mainview.X_OFFSET,
                pos,
                A.mainView.getWidth(),
                pos,
                {class_: this.cssClass});
        }
    })
};
