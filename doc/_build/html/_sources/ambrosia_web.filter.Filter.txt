





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

    !(test == 1.2 || (test > 2 && foo.bar != "foobar") || true ) && !false

The logical operations "&&" and '!!' as well as the unary logical operation "!" are allowed. Parentheses may be
used to change the default precedence of the operations.

These logical operations manage "comparisons". A "comparison" may compare two values using the operators "==",
"!=", ">=", "<=", "<", "~" (the first value matches a regex defined by the second value), ":" (the second value
is an array and the first element is contained in the second one) and "!:" (the first value is not contained
in the second value).

A value may be a string in the form of "string", a number in the form of 1.0 or 1, true or false or a property.
A property is a string describing an attribute of an event (e.g. abspath, successful). Moreover a property may
also match a specific reference (e.g. process.pid, file.abspath). The reference defined in a property may be a
specific reference (like file or process) or the string "references". This special reference matches all
references in an event. Therefore, the value of any property using "references" (e.g. references.id) must be
treated as an array (Array operations ":" and "!:" must be used). A filter general filter (that is applied to all
events regardless of their type) can therefore be used to find all events related to a certain entity (e.g.
"someidofanentity" : references.id).



Constructor
-----------

.. js:class:: ambrosia_web.filter.Filter(str, forceShowParents)



    
    :param String str: 
        the condition for the filter 
    
    :param  forceShowParents: 
        TODO 
    







Methods
-------

..
   class-methods


evaluate
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.Filter#evaluate(evt)


    
    :param  evt: 
         
    



    
    :returns bool:
        true if the event matches 
    


Evaluate if an avent matches this filter









    



getInput
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.Filter#getInput()




    
    :returns jQuery:
         
    


Get a jQuery Element that can be used as an graphical representation of the filter (a textbox)









    



setRule
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

.. js:function:: ambrosia_web.filter.Filter#setRule(r)


    
    :param  r: 
        {String} the new rule in filter syntax 
    




replaces the current rule with a new one









    




    



