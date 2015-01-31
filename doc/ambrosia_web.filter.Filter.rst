





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

    !(test == 1.2 || (test > 2 && p.bar != "foobar") || true ) && !false

The logical operations "&&" and '!!' as well as the unary logical operation "!" are allowed. Parentheses may be
used to change the default precedence of the operations.

These logical operations manage "comparisons". A "comparison" may compare two values using the operators "==",
"!=", ">=", "<=", "<", "~" (the first value matches a regex defined by the second value), ":" (the second value
is an array and the first element is contained in the second one) and "!:" (the first value is not contained
in the second value).

A value may be a string in the form of "string", a number in the form of 1.0 or 1, true or false or a property.
A property is a string describing an attribute of an event (e.g. abspath, successful). Moreover a property may
also match a specific reference (e.g. r.process.pid, r.file.abspath). The reference defined in a property may be
a specific reference (like r.file or r.process). Moreover the string "*" may be used to get all values
(e.g. r.*.id). Since multiple values are returned, the value  must be treated as an array (Array operations ":"
and "!:" must be used). A general filter (that is applied to all events regardless of their type) can therefore
be used to find all events related to a certain entity (e.g. "someidofanentity" : r.*.id).



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









    



getInput
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.Filter.getInput()




    
    :returns jQuery:
         
    


Get a jQuery Element that can be used as an graphical representation of the filter (a textbox)









    



getSubClassElements
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.Filter.getSubClassElements()




    
    :returns Array:
         
    


A subclass may return custom jQuery elements









    



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

.. js:function:: ambrosia_web.filter.Filter.setRule(r, no_input_update)


    
    :param String r: 
        the new rule in filter syntax 
    
    :param bool no_input_update: 
        used internally, disables update of the text field 
    




replaces the current rule with a new one









    




    



