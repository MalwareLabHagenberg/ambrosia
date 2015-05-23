"use strict";

/**
 * @namespace contains the filter view
 */
ambrosia_web.view.filterview = {
    /**
     * Implements a view that allows to view and modify filters
     * @constructor
     */
    FilterView: Class(
            'ambrosia_web.view.filterview.FilterView',
            'ambrosia_web.view.View',
        {
            __init__: function(element){
                this.super('Filter', element);
                var ths = this;
                this.filterviewelements = [];
                this._type_select = $('<select/>');
                this._type_select
                    .append($('<option value="'+ A.filter.TYPE_BLACKLIST+'">blacklist</option>'))
                    .append($('<option value="'+ A.filter.TYPE_FORCE_SHOW_PARENT+'">whitelist (force show parent)'+
                                '</option>'));
                this._add_button = $('<button>add filter</button>')
                    .click(function(){
                        A.filter.addFilter(new A.filter.Filter(
                            'true',
                            'unnamed',
                            false,
                            ths._type_select.val()));
                    });
                this._panel = $('<div class="filterpanel"/>')
                    .append(this._type_select)
                    .append(this._add_button);

            },

            /**
             * sets up the filterview
             * @methodOf ambrosia_web.view.filterview.FilterView
             * @name setup
             */
            setup: function () {
                this.redraw();

                var ths = this;

                A.filter.addFilterHandler.push(function (filter) {
                    ths._addFilter(filter);
                });

                A.filter.removeFilterHandler.push(function (filter) {
                    ths._removeFilter(filter);
                });
            },

            _removeFilter: function (filter) {
                var removeIdx = -1;

                for(var i in this.filterviewelements){
                    var fve = this.filterviewelements[i];
                    if(fve.filter == filter){
                        fve.remove();
                        removeIdx = i;
                        break;
                    }
                }

                if(removeIdx != -1){
                    this.filterviewelements.splice(removeIdx, 1);
                }
            },

            /**
             * redraws the filter view
             * @methodOf ambrosia_web.view.filterview.FilterView
             * @name redraw
             */
            redraw: function () {
                this.content.empty();
                this.content.append(this._panel);

                for (var e in A.filter.filters) {
                    var filter = A.filter.filters[e];
                    this._addFilter(filter);
                }
            },

            _addFilter: function(filter){
                var container = $('<div class="filtercontainer"/>');
                this.filterviewelements.push(new A.view.filterview.FilterViewElement(filter, container))
                this.content.append(container);
            }
        }),

    /**
     * Represents a single filter in the filter view
     * @constructor
     */
    FilterViewElement: Class(
            'ambrosia_web.view.filterview.FilterViewElement',
        {
            __init__: function (filter, container) {
                this.filter = filter;
                this._container = container;
                this._rule_input = $('<div class="filterinput"/>');
                this._description_input = $('<input class="filterdescription" placeholder="Description"/>');
                this._error_label = $('<div class="filtererror"/>');
                this._delete_button = $('<button type="button"/>').text('delete filter');
                this._enable_checkbox = $('<input type="checkbox"/>').prop('checked', true);
                this._type_display = $('<div/>');
                this._apply_button = $('<button>Apply</button>')
                this._counter = $('<div class="filtercounter"/>');
                this._content = ($('<div class="tableentry"/>')
                    .append(
                        $('<div/>')
                            .append(this._type_display)
                            .append(this._apply_button)
                            .append(this._rule_input)
                    )
                    .append(this._error_label)).hide();

                this._editor = ace.edit(this._rule_input.get(0));
                this._editor.setTheme("ace/theme/idle_fingers");
                this._editor.getSession().setMode("ace/mode/ambrosia");

                var ths = this;
                var toggle_btn = $('<button>+</button>').click(function(){
                    if(toggle_btn.text() == '+'){
                        toggle_btn.text('-');
                    }else{
                        toggle_btn.text('+');
                    }

                    ths._content.toggle();
                });

                this._container.append($('<div class="tablehead"/>')
                                .append(toggle_btn)
                                .append(this._enable_checkbox)
                                .append(this._delete_button)
                                .append(this._description_input)
                                .append(this._counter))
                            .append(this._content);


                this._apply_button.click(function(){
                    ths.filter.setRule(ths._editor.getValue());
                    if(ths.filter.isEnabled()) {
                        A.redraw();
                    }
                });

                this._delete_button.click(function(){
                    A.filter.removeFilter(ths.filter);
                });

                this._enable_checkbox.click(function(){
                    ths.filter.setEnabled(ths._enable_checkbox.is(':checked'));
                    A.redraw();
                });

                this.filter.change_listener.push(function(){
                    ths.update();
                });

                this.update();
            },

            remove: function () {
                this._container.remove();
            },

            update: function(){
                this._enable_checkbox.prop('checked', this.filter.isEnabled());
                if(this._editor.getValue() != this.filter.getRule()){
                    this._editor.setValue(this.filter.getRule());
                }
                this._description_input.val(this.filter.getDescription());
                this._error_label.text(this.filter.getError());

                this._type_display.text(this.filter.getType());
            }
        })
};
