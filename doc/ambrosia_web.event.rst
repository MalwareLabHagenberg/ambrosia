﻿





..
    Classes and methods

Namespace ambrosia_web.event
================================================================================

..
   class-title











    


Constructor
-----------

.. js:class:: ambrosia_web.event









Methods
-------

..
   class-methods


clearSelect
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.event.clearSelect()





unselect all events









    



enrich
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.event.enrich(el, parent)


    
    :param object el: 
        the deserialized data 
    
    :param ambrosia_web.event.Event parent: 
        the events parent event (if exists) 
    




Receives an object containing the deserialized data from the server and returns an instance of the class
:js:class:`ambrosia_web.event.Event`









    



reset
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.event.reset()





Resets the default :js:class:`A.layout.BlockLayoutManager`









    




    

Attributes
----------

..
   class-attributes


BLOCK_MARGIN_X
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:attribute:: BLOCK_MARGIN_X (static)(constant)  


The horizontal space Ambrosia should keep between two adjacent event








    



BLOCK_MARGIN_Y
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:attribute:: BLOCK_MARGIN_Y (static)(constant)  


The vertical space Ambrosia should keep between two adjacent event








    



BLOCK_PADDING
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:attribute:: BLOCK_PADDING (static)(constant)  


The horizontal space Ambrosia should keep between the borders of a child event and its parent (in pixel)








    



BLOCK_WIDTH
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:attribute:: BLOCK_WIDTH (static)  


The minimum width of a block (in pixel)








    



DEFAULT_BLOCK_HEIGHT
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:attribute:: DEFAULT_BLOCK_HEIGHT (static)(constant)  


The default height in seconds for an event








    



DEFAULT_BLOCK_LAYOUT_MANAGER
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:attribute:: DEFAULT_BLOCK_LAYOUT_MANAGER (static)(constant)  


The default :js:class:`ambrosia_web.layout.BlockLayoutManager` that is used on the top level








    



onSelectHandler
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:attribute:: onSelectHandler (static)  


contains all handlers for selecting events. Any part of the application may listen to those events (i.e. add a
function to this array). If the user select an entity the interface can adapt to this (e.g. the
:js:class:`ambrosia_web.view.detailsview.DetailsView` shows details about this event).








    



onUnSelectHandler
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:attribute:: onUnSelectHandler (static)  


contains all handlers for unselecting events. Any part of the application may listen to those events (i.e. add a
function to this array). If the user unselect an entity the interface can adapt to this (e.g. the
:js:class:`ambrosia_web.view.detailsview.DetailsView` shows details about this event).








    






