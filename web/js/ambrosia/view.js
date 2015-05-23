/**
 * @namespace contains all views
 */
ambrosia_web.view = {
    /**
     * Base class for all panels (DetailsView, EntityView, FilterView)
     * @param {String} name the caption of the panel
     * @param {jQuery} element the element to draw the panel into
     * @constructor
     */
    Panel: Class('ambrosia_web.view.View',
        {
            __init__: function(name, element){
                this.content = $('<div class="viewcontent"/>');

                var ths = this;

                this.viewContainer = ($('<div class="viewcontainer"/>')
                    .append(
                        $('<div class="viewheader"/>')
                            .text(name)
                            .click(function(){
                                if(ths.isShown()){
                                    A.view.hideAllPanels();
                                }else{
                                    ths.show();
                                }
                            })
                    )
                    .append(this.content)
                );

                element.append(this.viewContainer);
            },

            /**
             * show this panel
             * @methodOf ambrosia_web.view.Panel
             * @name show
             */
            show: function(){
                A.view.hideAllPanels();
                this.viewContainer.addClass('viewshown');
            },

            /**
             * check whether this panel is shown
             * @methodOf ambrosia_web.view.Panel
             * @name isShown
             */
            isShown: function(){
                return this.viewContainer.hasClass('viewshown');
            }
        }),

    /**
     * hide all panels
     */
    hideAllPanels: function(){
        $('.viewcontainer').removeClass('viewshown');
    }
};