from datetime import datetime

from BTrees import OOBTree
from persistent import Persistent
from persistent.list import PersistentList
from persistent.mapping import PersistentMapping

import ambrosia.context
from ambrosia.util import js_date, obj_classname, classname, unique_id


__author__ = 'wolfgang'


class Analysis(Persistent):
    def __init__(self):
        self.filename = None
        self.package = None
        self.start_time = None
        self.end_time = None
        self._entities = PersistentMapping()
        self._events = OOBTree.TreeSet()
        self._event_index = PersistentMapping()
        self.plugins = {}
        self.hashes = {}

    def add_entity(self, context, cls, *args):
        self.get_entity(context, cls, *args)

    def iter_entities(self, context, cls):
        assert isinstance(context, ambrosia.context.AmbrosiaContext)
        assert issubclass(cls, Entity)

        if classname(cls) not in self._entities:
            return

        for entity in self._entities[classname(cls)][0]:
            yield entity

    def get_entity(self, context, cls, *args):
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

    def iter_events(self, context, cls=None, key=None, min_value=None, max_value=None, value=None):
        assert isinstance(context, ambrosia.context.AmbrosiaContext)
        assert cls is None or issubclass(cls, Event)
        assert isinstance(key, str) or key is None

        if key is None:
            # no key -> just get all elements
            for el in self._events:
                if cls is None or isinstance(el, cls):
                    yield el
        else:
            assert key in cls.indices, "key is not defined as index"
            if value is not None:
                min_value, max_value = value, value

            class_name = classname(cls)

            if class_name in self._event_index and key in self._event_index[class_name]:
                for val, lst in self._event_index[class_name][key].iteritems(min_value, max_value):
                    for el in lst:
                        yield el

    def _event_index_list(self, evt, key):
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
            ret = PersistentList()
            key_index[key_val] = ret

        return ret

    def add_event(self, evt):
        assert isinstance(evt, Event)

        self._events.add(evt)

        for idx in getattr(evt.__class__, 'indices'):
            idxlist = self._event_index_list(evt, idx)
            if idxlist is not None:
                idxlist.append(evt)

    def del_event(self, evt):
        assert isinstance(evt, Event)

        try:
            self._events.remove(evt)
        except ValueError:
            # event does not exist, that's fine too
            return

        for idx in getattr(evt.__class__, 'indices'):
            idxlist = self._event_index_list(evt, idx)
            if idxlist is not None:
                idxlist.remove(evt)

    def get_vals(self):
        for el in self._events:
            assert isinstance(el, Event)
            el.sort()

        events = list(self._events)
        events.sort(cmp=lambda x, y: x.cmp_by_time(y))

        entities = {}

        for entity_class, class_entities in self._entities.iteritems():
            for entity in class_entities[0]:
                assert isinstance(entity, Entity)
                entities[entity.primary_key] = entity.get_vals()

        return {'start_time': js_date(self.start_time),
                'end_time': js_date(self.end_time),
                'filename': self.filename,
                'package': self.package,
                'events': [e.get_vals() for e in events],
                'entities': entities
        }

    def adjust_times(self, context):
        assert isinstance(context, ambrosia.context.AmbrosiaContext)

        for el in self._events:
            el.adjust_times(context)



class Event(Persistent):
    """
    Events represent any event with a start-time and/or end-time
    """

    """
    this set contains all attributes that can be searched for; these attributes MUST NOT be CHANGED after the event has
       been added
    """
    indices = set()

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

    @property
    def start_ts(self):
        if self._start_ts is None:
            return self._end_ts

        return self._start_ts

    @start_ts.setter
    def start_ts(self, value):
        assert isinstance(value, datetime)
        self._start_ts = value

        if self._parent is not None:
            assert isinstance(self._parent, Event)
            self._parent._update_start_ts(self._start_ts)

    @property
    def end_ts(self):
        if self._end_ts is None:
            return self._start_ts

        return self._end_ts

    @end_ts.setter
    def end_ts(self, value):
        assert isinstance(value, datetime)
        self._end_ts = value

        if self._parent is not None:
            assert isinstance(self._parent, Event)
            self._parent._update_end_ts(self._end_ts)

    def add_child(self, c):
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
        for c in self._children:
            yield c

    def get_properties(self):
        """
        This method is used for serialisation, has to be implemented by the subclass
        :return: a python dict representing the Event
        """
        raise NotImplementedError(type(self))

    def adjust_times(self, context):
        """
        Adjust times (e.g. emulator time -> system time)
        :param context: the AmbrosiaContext
        """
        assert isinstance(context, ambrosia.context.AmbrosiaContext)

        for c in self.children:
            c.adjust_times(context)

    def get_vals(self):
        vals = self.get_properties()
        refs, props = {}, {}

        for k, v in vals.iteritems():
            if isinstance(v, Entity):
                refs[k] = v.primary_key
            else:
                props[k] = v

        return {'type': classname(type(self)),
                'children': [c.get_vals() for c in self.children],
                'startTS': js_date(self.start_ts),
                'endTS': js_date(self.end_ts),
                'description': str(self),
                'properties': props,
                'references': refs}

    def __str__(self):
        raise NotImplementedError(type(self))

    def cmp_by_time(self, other):
        assert isinstance(other, Event)
        return cmp(self.start_ts, other.start_ts)

    def sort(self):
        self._children.sort(cmp=lambda x,y: x.cmp_by_time(y))

        for c in self._children:
            assert isinstance(c, Event)
            c.sort()


class Entity(Persistent):
    def __init__(self, primary_identifier):
        self.primary_identifier = primary_identifier
        self.primary_key = unique_id()

    @staticmethod
    def find(context, entities, identifier_btree, *args):
        raise NotImplementedError()

    def __cmp__(self, other):
        if not isinstance(other, Entity):
            return -1
        return cmp(self.primary_key, other.primary_key)

    def get_vals(self):
        properties, references = {}, {}

        props = self.get_properties()

        for k, v in props.iteritems():
            if isinstance(v, Entity):
                references[k] = v.primary_key
            else:
                properties[k] = v

        return {
            'id': self.primary_key,
            'type': classname(type(self)),
            'properties': properties,
            'references': references,
            'description': str(self)
        }

    def get_properties(self):
        raise NotImplementedError(type(self))