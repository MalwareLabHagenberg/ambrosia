Ambrosia Client Documentation
*****************************

.. toctree::
    :glob:
    :maxdepth: 1

    _global_
    ambrosia_web*

Overview
========

This section gives a short overview of the internal workings of Ambrosia Web. For a detailed description please see the
documentation for the packages.

The function :js:func:`ambrosia_web.init` loads the serialized data (specified after the hash symbol in the URL),
enriches the events and entities (:js:func:`ambrosia_web.entity.enrich` and :js:func:`ambrosia_web.event.enrich`) and
resolves all references of the entities (:js:func:`ambrosia_web.entity.Entity.resolveReferences`). Afterwards all views
are set up (:js:class:`ambrosia_web.view.mainview.MainView`, :js:class:`ambrosia_web.view.entityview.EntityView`,
:js:class:`ambrosia_web.view.detailsview.DetailsView`, :js:class:`ambrosia_web.view.filterview.FilterView).

The main view shows all events on a timeline. The method :js:func:`ambrosia_web.view.mainview.MainView.redraw` uses the
following methods to draw the events:

* :js:func:`ambrosia_web.event.Event.calcVisible`: calculates if the event should be drawn at all (i.e. whether it is
  filtered)
* :js:func:`ambrosia_web.event.Event.calcDimensions`: calculates where the event should be drawn and how big it should
  be
* :js:func:`ambrosia_web.event.Event.draw`: draws the element.

Each of theses methods may call the corresponding methods on child events (e.g. a parent event needs to know about the
positions of the children to decide how big it should be).

Ambrosia defines two types of events:

* a :js:class:`ambrosia_web.event.BlockEvent` is drawn as a block in the main view
* a :js:class:`ambrosia_web.event.LineEvent` is drawn as a line across the main view (children are not drawn)

In order for a block event to decide where it should be drawn the :js:class:`ambrosia_web.layout.BlockLayoutManager` is
used. This class remembers the relevant block events that have already been drawn and allows an event to find a position
where enough free space is available. the block layout manager is used on the top level and to position children of an
event. Each event with children creates a new block layout manager.

Events and entities can be selected (see :js:func:`ambrosia_web.event.Event.select`
:js:func:`ambrosia_web.event.Event.selectAdd`, :js:func:`ambrosia_web.event.Event.unselect`.
:js:func:`ambrosia_web.event.clearSelect`, :js:func:`ambrosia_web.entity.Entity.select`). Any part of the application
may select an entity or an event and all parts of the application may register to select and unselect events (see
:js:attr:`ambrosia_web.event.onSelectHandler`, :js:attr:`ambrosia_web.event.onUnSelectHandler`,
:js:attr:`ambrosia_web.entity.onSelectHandler`). Multiple events may be selected but only one entity can be selected.

Each event class specifies filters. For an event all filters have to match for the event to be shown. General filters
are applied to all events (see :js:class:`ambrosia_web.event.Event`). Those the rules for these filters follow a
specific syntax (see :js:class:`ambrosia_web.filter.Filter`).

