





..
    Classes and methods

Class ambrosia_web.filter.Filter
================================================================================

..
   class-title


A Filter represents a single condition (either entered by the user or a default condition).

The following shows example for the filter syntax:








    

Examples
--------


.. code-block:: javascript

    stype == "FileAccessEvent" {
     # read only
     p.flg_O_RDWR==false && p.flg_O_WRONLY==false {
         # hide getting random numbers
         r.file.p.abspath == "/dev/urandom";
     }
 }

 # hide Android shared memory operations
 (r.file.p.abspath=="/dev/ashmem" && p.flags==131074);

Please see the thesis *Ambrosia: A Framework for Visualizing Malicious Behaviour in Android Applications* for
a detailed explaination of the filter language.



Constructor
-----------

.. js:class:: ambrosia_web.filter.Filter()









Methods
-------

..
   class-methods


evaluate
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.Filter.evaluate()




    
    :returns bool:
        true if the event matches 
    


Evaluate if an an event matches this filter









    



getDescription
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.Filter.getDescription()





get the description string









    



getError
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.Filter.getError()





get the error descriptin string









    



getRule
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.Filter.getRule()





get the current rule string









    



getType
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.Filter.getType()





get the filter type









    



isEnabled
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.Filter.isEnabled()




    
    :returns bool:
        true if enabled 
    


Checks whether this filter is enabled









    



setDescription
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.Filter.setDescription(d)


    
    :param String d: 
        the description 
    




set the description









    



setEnabled
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.Filter.setEnabled(b)


    
    :param bool b: 
        whether the filter should be enabled 
    




enable or disable the filter









    



setRule
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.Filter.setRule(r)


    
    :param String r: 
        the new rule in filter syntax 
    




replaces the current rule with a new one









    



setType
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.Filter.setType(t)


    
    :param String t: 
        fitler type 
    




set the filter type









    




    



