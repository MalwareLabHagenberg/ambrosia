





..
    Classes and methods

Namespace ambrosia_web.entity
================================================================================

..
   class-title











    


Constructor
-----------

.. js:class:: ambrosia_web.entity









Methods
-------

..
   class-methods


enrich
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.entity.enrich(el)


    
    :param object el: 
        the deserialized data 
    




Receives an object containing the deserialized data from the server and returns an instance of the class
:js:class:`ambrosia_web.entity.Entity`









    




    

Attributes
----------

..
   class-attributes


onSelectHandler
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:attribute:: onSelectHandler (static)  


contains all handlers for selecting entities. Any part of the application may listen to those events (i.e. add a
function to this array). If the user select an entity the interface can adapt to this (e.g. the
:js:class:`ambrosia_web.view.entityview.EntityView` shows details about this entity).








    






