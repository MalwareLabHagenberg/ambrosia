#  -*- coding: utf-8 -*-
###############################################################################
#                                                                             #
#   Ambrosia - a tool to visualize ANANAS results                             #
#                                                                             #
#     Copyright (C) 2015 Wolfgang Ettlinger and the ANANAS Team               #
#                                                                             #
#    This program is free software: you can redistribute it and/or modify     #
#    it under the terms of the GNU General Public License as published by     #
#    the Free Software Foundation, either version 3 of the License, or        #
#    (at your option) any later version.                                      #
#                                                                             #
#    This program is distributed in the hope that it will be useful,          #
#    but WITHOUT ANY WARRANTY; without even the implied warranty of           #
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the            #
#    GNU General Public License for more details.                             #
#                                                                             #
#    You should have received a copy of the GNU General Public License        #
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.    #
#                                                                             #
#    the ANANAS Project  Copyright (C) 2015                                   #
#                                                                             #
###############################################################################
from datetime import datetime

from BTrees import OOBTree
from persistent import Persistent
from persistent.list import PersistentList
from persistent.mapping import PersistentMapping

import ambrosia.context
from ambrosia.util import js_date, obj_classname, classname, unique_id, get_class

__author__ = 'Wolfgang Ettlinger'


class Analysis(Persistent):
    """An Analysis object (and the referenced objects) stores all information the Ambrosia analysis found out.

    Attributes:
    * filename (str): the name of the APK
    * package (str): the package of the APK
    * start_time (datetime.datetime): when the ANANAS analysis started
    * end_time (datetime.datetime): when the ANANAS analysis ended
    * plugins (dict): the plugins (key) and wheter they were active during ANANAS analysis (value, bool)
    * hashes (dict): the hashes of the APK in the form {type: hash}

    Analysis also manages all (top-level) Events and Entities (see :class:`ambrosia_web.model.Event`,
    :class:`ambrosia_web.model.Entity`) and tries to optimize for searching performance.
    """
    def __init__(self):
        self.filename = None
        self.package = None
        self.start_time = None
        self.end_time = None

        self._entities = PersistentMapping()
        """contains all entities in the form of (simplified):
        {
            class_name: (
                [entitiy, ...],
                Binary tree of all entities (key: primary_identifier)
            )
        }
        """

        self._events = OOBTree.TreeSet()
        """contains all entities
        """

        self._event_index = PersistentMapping()
        """contains indices for events in the form of
        {
            class_name: {
                key: Binary Tree {
                        attribute_value: set(event, ...)
                    }
            }
        }
        """

        self.plugins = {}
        self.hashes = {}

    def add_entity(self, context, cls, *args):
        """Add an entity (alias for :func:`Analysis.get_entity`)
        """
        self.get_entity(context, cls, *args)

    def iter_entities(self, context, cls):
        """iterate all known entities of a specific class.

        Args:
            context (ambrosia_web.context.AmbrosiaContext): the current context
            cls (class): the class of the entity we are looking for
        """
        assert isinstance(context, ambrosia.context.AmbrosiaContext)
        assert issubclass(cls, Entity)

        if classname(cls) not in self._entities:
            return

        for entity in self._entities[classname(cls)][0]:
            yield entity

    def get_entity(self, context, cls, *args):
        """Search for a specific entity, if it does not exist, create a new one

        Args:
            context (ambrosia_web.context.AmbrosiaContext): the current context
            cls (class): the class of the entity we are looking for
            *args: the arguments that would construct an entity

        This method uses :func:`Entity.find` (of the specific entity class) to search for entities. This method
        receives a List of all known entitites of that class as well as a :class:`BTrees.OOBTree.BTree` also containing
        all entities (indexed by their *primary_identifier* to allow more efficient searching). Moreover this method
        relieves the \*args argument.

        The \*args argument contains all information that identifies a certain entity. This could be e.g. the IP address
        and the port of a server. Those values are passed to the find method. If the server is already known, the entity
        representing it is returned. If no such server entity exist a new one is created using those two parameters.

        This behaviour makes sure that multiple event referencing the same entity all have references to the exact same
        entity in memory.
        """
        assert isinstance(context, ambrosia.context.AmbrosiaContext)
        assert issubclass(cls, Entity)

        if classname(cls) not in self._entities:
            # self.entities contains a tuple 1. with all emlements and 2. with an BTree over the primary identifier
            self._entities[classname(cls)] = (PersistentList(), OOBTree.BTree())

        entity = self._entities[classname(cls)]

        res = cls.find(context, entity[0], entity[1], *args)

        if res is None:
            res = cls(context, *args)
            assert isinstance(res, Entity)
            entity[0].append(res)

            if res.primary_identifier not in entity[1]:
                entity[1][res.primary_identifier] = PersistentList()

            entity[1][res.primary_identifier].append(res)

        return res

    def iter_all_events(self, context, key=None, min_value=None, max_value=None, value=None):
        """Iterates over all event classes.

        Args:
            context (ambrosia_web.context.AmbrosiaContext): the current context
            key: the key we are searching for
            min_value: the minimum value
            max_value: the maximum value
            value: the specific value (to search for exactly one value)

        This method works just like :func:`Analysis.iter_events` but is not limited to a certain entity Type. Instead,
        it searches entitiy of all types.
        """
        for class_name, idx in self._event_index.iteritems():
            cls = get_class(class_name)
            assert issubclass(cls, Event)

            if key not in cls.indices:
                continue

            for evt in self.iter_events(context, cls, key, min_value, max_value, value):
                yield evt

    def iter_events(self, context, cls=None, key=None, min_value=None, max_value=None, value=None):
        """Iterates over all events matching specific conditions in an efficient manner.

        Args:
            context (ambrosia_web.context.AmbrosiaContext): the current context
            cls (class): the class of the events we are looking for
            key: the key we are searching for
            min_value: the minimum value
            max_value: the maximum value
            value: the specific value (to search for exactly one value)

        This method uses a internal indices to efficiently select specific events. Each event class defines attributes
        that should be indexed (:class:`Event`.indices). This class makes sure that those attributes can be searched for
        very fast.

        The method accepts the following combinations of argument:
        * nothing: return all events
        * *cls*: return all events of a specific class (inefficient)
        * *cls*, *key*, *min_value* and/or *max_value*: search for all events of a specific class where the attribute
        *key* is within the defined value constraints
        * *cls*, *key*, *value*: search all events of a specific class where the attribute *key* has the value *value*
        """
        assert isinstance(context, ambrosia.context.AmbrosiaContext)
        assert cls is None or issubclass(cls, Event)
        assert isinstance(key, str) or key is None

        if key is None:
            # no key -> just get all elements
            for el in self._events:
                # if cls is given: filter by class
                if cls is None or isinstance(el, cls):
                    yield el
        else:
            assert key in cls.indices, "key is not defined as index"

            if value is not None:
                # set min_value and max_value to value (if value is given)
                min_value, max_value = value, value

            class_name = classname(cls)

            # check if there is an index (there is none if no events of this class is known)
            if class_name in self._event_index and key in self._event_index[class_name]:

                # locate the index and use it
                for val, lst in self._event_index[class_name][key].iteritems(min_value, max_value):

                    # the value the index refers to is a list since multiple events may have the same value
                    for el in lst:
                        yield el

    def _event_index_set(self, evt, key):
        """Locates the index for a specific event and key (and creates it if it does not exist)
        """
        assert isinstance(key, str)
        assert isinstance(evt, Event)
        class_name = obj_classname(evt)

        if class_name not in self._event_index:
            self._event_index[class_name] = PersistentMapping()

        class_index = self._event_index[class_name]

        if key not in class_index:
            class_index[key] = OOBTree.BTree()

        key_index = class_index[key]

        key_val = getattr(evt, key)

        if key_val is None:
            return None

        ret = key_index.get(key_val)
        if ret is None:
            ret = OOBTree.OOTreeSet()
            key_index[key_val] = ret

        return ret

    def add_event(self, evt):
        """Add event and generate indices

        Args:
            evt (Event): the event to add

        .. warning::
            The indexed attributes of an event may not be altered after the event has been added (otherwise the indices
            are out of date). This means that only static values may be indexed.
        """
        assert isinstance(evt, Event)

        self._events.add(evt)

        for idx in getattr(evt.__class__, 'indices'):
            idxset = self._event_index_set(evt, idx)
            if idxset is not None:
                idxset.add(evt)

    def del_event(self, evt):
        """Delete event and update indices

        Args:
            evt (Event): the event to remove
        """
        assert isinstance(evt, Event)

        try:
            self._events.remove(evt)
        except ValueError:
            # event does not exist, that's fine too
            return

        for idx in getattr(evt.__class__, 'indices'):
            idxset = self._event_index_set(evt, idx)
            if idxset is not None:
                idxset.remove(evt)

    def to_serializeable(self):
        """Returns all results in a serializable form
        """
        for el in self._events:
            assert isinstance(el, Event)
            assert(el.start_ts > self.start_time)
            assert(el.start_ts < self.end_time)
            el.sort()

        events = list(self._events)
        events.sort(cmp=lambda x, y: x.cmp_by_time(y))

        entities = {}

        for entity_class, class_entities in self._entities.iteritems():
            for entity in class_entities[0]:
                assert isinstance(entity, Entity)
                entities[entity.primary_key] = entity.to_serializeable()

        return {
            'start_time': js_date(self.start_time),
            'end_time': js_date(self.end_time),
            'filename': self.filename,
            'package': self.package,
            'events': [e.to_serializeable() for e in events],
            'entities': entities
        }

    def adjust_times(self, context):
        """Goes through all events and calls adjust_times on all Events
        """
        assert isinstance(context, ambrosia.context.AmbrosiaContext)

        for el in self._events:
            el.adjust_times(context)


class Event(Persistent):
    """Event represents any event with a start-time and/or end-time

    Args:
        start_ts (datetime.datetime): the time the event began
        end_ts  (datetime.datetime): the time the event ended
    """
    indices = set()
    """
    This set contains all attributes that can be searched for; these attributes MUST NOT be CHANGED after the event has
       been added
    """

    def __init__(self, start_ts=None, end_ts=None):
        assert isinstance(start_ts, datetime) or start_ts is None
        assert isinstance(end_ts, datetime) or end_ts is None

        self._start_ts = None
        self._end_ts = None

        self._parent = None
        self._children = PersistentList()

        if start_ts is not None:
            self.start_ts = start_ts

        if end_ts is not None:
            self.end_ts = end_ts

        self._unique_identifier = unique_id()

    def __eq__(self, other):
        if not isinstance(other, Event):
            return NotImplemented
        else:
            return self._unique_identifier == other._unique_identifier

    def __cmp__(self, other):
        if not isinstance(other, Event):
            return NotImplemented
        else:
            return cmp(self._unique_identifier, other._unique_identifier)

    @property
    def start_ts(self):
        """The start timestamp if set else the end timestamp (assuming that start timestamp = end timestamp)

        Returns:
            The start timestamp
        """
        if self._start_ts is None:
            return self._end_ts

        return self._start_ts

    @start_ts.setter
    def start_ts(self, value):
        """Sets the start timestamp and updates the timestamps of the parent (the parents start timestamp cannot be
        smaller then the child's)
        """
        assert isinstance(value, datetime)
        self._start_ts = value

        if self._parent is not None:
            assert isinstance(self._parent, Event)
            self._parent._update_start_ts(self._start_ts)

    @property
    def end_ts(self):
        """The end timestamp if set else the start timestamp (assuming that start timestamp = end timestamp)

        Returns:
            The end timestamp
        """
        if self._end_ts is None:
            return self._start_ts

        return self._end_ts

    @end_ts.setter
    def end_ts(self, value):
        """Sets the end timestamp and updates the timestamps of the parent (the parents end timestamp cannot be
        greater then the child's)
        """
        assert isinstance(value, datetime)
        self._end_ts = value

        if self._parent is not None:
            assert isinstance(self._parent, Event)
            self._parent._update_end_ts(self._end_ts)

    def add_child(self, c):
        """Add child to this event. Also checks whether new child already has a parent (this is not allowed in a tree
        structure) and updates timestamps.
        """
        assert isinstance(c, Event)
        assert c._parent is None, 'child already has a parent'
        c._parent = self
        self._children.append(c)
        if c.start_ts is not None:
            self._update_start_ts(c.start_ts)
        if c.end_ts is not None:
            self._update_end_ts(c.end_ts)

    def _update_start_ts(self, start_ts):
        assert isinstance(start_ts, datetime)

        if self.start_ts is None or start_ts < self.start_ts:
            self.start_ts = start_ts

    def _update_end_ts(self, end_ts):
        assert isinstance(end_ts, datetime)

        if self.end_ts is None or end_ts > self.end_ts:
            self.end_ts = end_ts

    @property
    def children(self):
        """Iterates over all children.
        """
        for c in self._children:
            yield c

    def get_serializeable_properties(self):
        """This method is used for serialisation, has to be implemented by the subclass. Should return a dict with all
        important information about the event.
        """
        raise NotImplementedError(type(self))

    def adjust_times(self, context):
        """Adjust times (e.g. emulator time -> system time)

        Args:
            context (ambrosia_web.context.AmbrosiaContext): the current context
        """
        assert isinstance(context, ambrosia.context.AmbrosiaContext)

        for c in self.children:
            c.adjust_times(context)

    def to_serializeable(self):
        """Returns a dict that can be used for serialization.

        The primary keys of entities this entity refers to (e.g. parent process) are stored in the attribute
        "references". This way any entity only has to be transmitted once, when the entity is referenced only the
        primary key is used.
        """
        vals = self.get_serializeable_properties()
        refs, props = {}, {}

        for k, v in vals.iteritems():
            if isinstance(v, Entity):
                refs[k] = v.primary_key
            else:
                props[k] = v

        return {'type': classname(type(self)),
                'children': [c.to_serializeable() for c in self.children],
                'startTS': js_date(self.start_ts),
                'endTS': js_date(self.end_ts),
                'description': unicode(self),
                'properties': props,
                'references': refs}

    def __str__(self):
        raise NotImplementedError(type(self))

    def cmp_by_time(self, other):
        """Compares two events by start timestamp

        Args:
            other (Event): the other event
        """
        assert isinstance(other, Event)
        return cmp(self.start_ts, other.start_ts)

    def sort(self):
        """Sort events by start timestamp
        """
        self._children.sort(cmp=lambda x, y: x.cmp_by_time(y))

        for c in self._children:
            assert isinstance(c, Event)
            c.sort()


class Entity(Persistent):
    """An Entity represents a static element without a timestamp e.g. a file or a server.

    Args:
        primary_identifier (str): A identifier that identifies the entity. This does not have to be unique
         (e.g. PID).

    """

    def __init__(self, primary_identifier):
        self._primary_identifier = primary_identifier
        self.primary_key = unique_id()
        """A generated unique key
        """

    @property
    def primary_identifier(self):
        """Returns the primary identifier for the entity.
        """
        return self._primary_identifier

    @staticmethod
    def find(context, entities, identifier_btree, *args):
        """Should find and return an entity based on the \*args. Must be implemented by subclass.

        Args:
            entities (list): all entities known
            identifier_btree (BTrees.OOBTree.BTree): a binary tree where the keys are the primary identifier and the
             values are a list containg the matching entity.
            *args: the arguments identifying the entity. Must be identical to the constructor parameters.
        """
        raise NotImplementedError()

    def __cmp__(self, other):
        if not isinstance(other, Entity):
            return NotImplemented
        return cmp(self.primary_key, other.primary_key)

    def to_serializeable(self):
        """Returns a dict containing all relevant information about the entity.
        """
        properties, references = self.get_serializeable_properties()

        refs = {}

        for k, v in references.iteritems():
            if isinstance(v, list) or isinstance(v, set):
                lst = []

                for l in v:
                    lst.append(l.primary_key)

                refs[k] = lst
            elif v is None:
                refs[k] = None
            else:
                refs[k] = v.primary_key

        return {
            'id': self.primary_key,
            'type': classname(type(self)),
            'properties': properties,
            'references': refs,
            'description': unicode(self)
        }

    def get_serializeable_properties(self):
        """Should return all information relevant about the specific entity. Must be implemented by subclass.
        """
        raise NotImplementedError(type(self))