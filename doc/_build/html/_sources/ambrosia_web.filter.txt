





..
    Classes and methods

Namespace ambrosia_web.filter
================================================================================

..
   class-title











    


Constructor
-----------

.. js:class:: ambrosia_web.filter









Methods
-------

..
   class-methods


addFilter
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.addFilter(filter, no_redraw)


    
    :param  filter: 
        the filter object 
    
    :param  no_redraw: 
        true if the visualisation should not be redrawn 
    



    
    :returns *:
         
    


Add a filter.









    



handleLogicalOperation
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.handleLogicalOperation(ex1, rest)


    
    :param  ex1: 
        an expression 
    
    :param  rest: 
        an array containing a logical operation and a second expression or undefined 
    



    
    :returns *:
         
    


Helper function for the parser.









    



handleStatement
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.handleStatement(op, block, stmt2)


    
    :param  op: 
        the selector of a statement 
    
    :param  block: 
        the block of a statement 
    
    :param  stmt2: 
        the next statement 
    



    
    :returns *:
         
    


Helper function for the parser.









    



optimizeLogical
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.optimizeLogical(p1, op, p2)


    
    :param  p1: 
         
    
    :param  op: 
         
    
    :param  p2: 
         
    




optimize a comparison. Used by the parser.









    



removeFilter
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.removeFilter(filter)


    
    :param  filter: 
        the filter object to remove 
    



    
    :returns *:
         
    


Remove a filter









    




    

Attributes
----------

..
   class-attributes


addFilterHandler
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:attribute:: addFilterHandler (static)  


contains all handlers for adding filters to an  event class. Any part of the application may listen to those
events (i.e. add a function to this array). If the user select an entity the interface can adapt to this.








    



removeFilterHandler
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:attribute:: removeFilterHandler (static)  


contains all handlers for removing filters from an  event class. Any part of the application may listen to those
events (i.e. add a function to this array). If the user select an entity the interface can adapt to this.








    



TYPE_BLACKLIST
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:attribute:: TYPE_BLACKLIST (static)  


the filter type for blacklist filters








    



TYPE_FORCE_SHOW_PARENT
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:attribute:: TYPE_FORCE_SHOW_PARENT (static)  


the filter type for whitelist filters








    






