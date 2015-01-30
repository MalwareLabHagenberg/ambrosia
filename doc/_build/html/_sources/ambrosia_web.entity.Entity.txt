





..
    Classes and methods

Class ambrosia_web.entity.Entity
================================================================================

..
   class-title


The client side counterpart for an entity






.. seealso::

    :class:`ambrosia.model.Entity`



    


Constructor
-----------

.. js:class:: ambrosia_web.entity.Entity()









Methods
-------

..
   class-methods


getLink
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.entity.Entity#getLink()




    
    :returns jQuery:
        the link 
    


Returns a jQuery element containing a link that, when clicked, selects the entity.









    



resolveReferences
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.entity.Entity#resolveReferences()





resolves all references







.. seealso::

    :func:`ambrosia.model.Event.to_serializeable`



    



select
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.entity.Entity#select()





This method should be called when the user selects an entity.









    




    



