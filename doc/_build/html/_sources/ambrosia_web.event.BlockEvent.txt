





..
    Classes and methods

Class ambrosia_web.event.BlockEvent
================================================================================

..
   class-title


Base class for all events that are drawn as a block.








    


Constructor
-----------

.. js:class:: ambrosia_web.event.BlockEvent()









Methods
-------

..
   class-methods


calcDimensions
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.event.BlockEvent#calcDimensions(blockLayoutManager)


    
    :param ambrosia_web.layout.BlockLayoutManager blockLayoutManager: 
        the block layout manager to use 
    




Calculates the dimensions of the visualisation (for block events). The top level events are drawn using the
default block layout manager. Each event that has visible children creates a new block layout manager that
is used to position the children (the children's calcDimensions method is called). The block layout manager
that was used to position the children holds the width and height that is required to draw all children.
Afterwards (using this width/height) the parent event is drawn.









    



draw
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.event.BlockEvent#draw(xOffset)


    
    :param int xOffset: 
        (optional) if this is a child object, the x position of the parent 
    




draws the event









    




    



