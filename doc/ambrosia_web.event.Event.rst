





..
    Classes and methods

Class ambrosia_web.event.Event
================================================================================

..
   class-title


The client side counterpart for an event






.. seealso::

    :class:`ambrosia.model.Event`



    


Constructor
-----------

.. js:class:: ambrosia_web.event.Event()









Methods
-------

..
   class-methods


calcDimensions
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.event.Event.calcDimensions(blockLayoutManager)


    
    :param ambrosia_web.layout.BlockLayoutManager blockLayoutManager: 
        the block layout manager to use 
    




Calculates the dimensions of the visualisation (for block events). Should be called second when drawing.
events.









    



calcVisible
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.event.Event.calcVisible()





This is the first method called when drawing events. It calculates if an element should be shown and also
considers the visibility of the child elements (a child can force it's parent to show)









    



draw
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.event.Event.draw()





Draw the event. Should be called third when drawing. Must be implemented by subclass.









    



getLink
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.event.Event.getLink()




    
    :returns jQuery:
        the link 
    


Returns a jQuery element containing a link that, when clicked, selects the event.









    



select
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.event.Event.select()





This method should be called when the user selects one event.









    



selectAdd
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.event.Event.selectAdd()





This method should be called when the user adds an event to a selection.









    



unselect
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.event.Event.unselect()





This method should be called when the user unselects one event.









    




    



