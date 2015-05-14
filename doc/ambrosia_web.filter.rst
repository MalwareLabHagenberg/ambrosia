





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


handleLogicalOperation
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.handleLogicalOperation(ex1, rest)


    
    :param  ex1: 
        an expression 
    
    :param  rest: 
        an array containing a logical operation and a second expression or undefined 
    



    
    :returns *:
         
    


Helper function for the parser.









    




    

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








    






