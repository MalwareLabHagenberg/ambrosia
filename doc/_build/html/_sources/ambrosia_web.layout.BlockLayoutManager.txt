





..
    Classes and methods

Class ambrosia_web.layout.BlockLayoutManager
================================================================================

..
   class-title


The block layout manager is used to position event block in the main view.






.. seealso::

    :js:func:`ambrosia_web.layout.BlockLayoutManager.fitBlock` for details.

Note: in order for the block layout manager to properly work, the events have to be fitted in ascending order (x
position)



    


Constructor
-----------

.. js:class:: ambrosia_web.layout.BlockLayoutManager()









Methods
-------

..
   class-methods


fitBlock
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.layout.BlockLayoutManager#fitBlock(dim, margin_x, margin_y)


    
    :param ambrosia_web.layout.Dimensions dim: 
        the dimensions of the block (may overlap other events) 
    
    :param int margin_x: 
        the horizontal margin that should be left 
    
    :param int margin_y: 
        the vertical margin that should be left 
    



    
    :returns ambrosia_web.layout.Dimensions:
        the new dimensions of the non-overlapping block 
    


Takes a :js:class:`ambrosia_web.layout.Dimensions` object and tries to fit it considering the previously
fitted blocks.









    



getEndY
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.layout.BlockLayoutManager#getEndY()




    
    :returns number:
         
    


position bottom border of the block layout manager (considering all fitted events)









    



getWidth
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.layout.BlockLayoutManager#getWidth()




    
    :returns number:
         
    


get the width of the whole block layout manager (considering all fitted events)









    




    



