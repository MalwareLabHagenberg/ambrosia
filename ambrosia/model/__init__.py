from datetime import datetime
import os.path
from BTrees import OOBTree
from persistent import Persistent
from persistent.list import PersistentList
from persistent.mapping import PersistentMapping

import ambrosia.context
from ambrosia.util import js_date, obj_classname, classname

__author__ = 'wolfgang'


class Analysis(Persistent):
    def __init__(self):
        self.filename = None
        self.package = None
        self.start_time = None
        self.end_time = None
        # TODO hashes
        self._entities = PersistentMapping()
        self._events = PersistentList()
        self._event_index = PersistentMapping()

    def iter_entities(self, cls):
        assert issubclass(cls, Entity)

        for e in self._entities[classname(cls)][0]:
            yield e

    def add_entity(self, context, cls, *args):
        self.get_entity(context, cls, *args)

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

    def iter_events(self, context, cls, key=None, min_value=None, max_value=None, value=None):
        assert isinstance(context, ambrosia.context.AmbrosiaContext)
        assert issubclass(cls, Event)
        assert isinstance(key, str) or key is None

        if key is None:
            # no key -> just get all elements
            for el in self._events:
                if isinstance(el, cls):
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

        if key_val not in key_index:
            key_index[key_val] = PersistentList()

        return key_index[key_val]

    def add_event(self, evt):
        assert isinstance(evt, Event)

        self._events.append(evt)

        for idx in getattr(evt.__class__, 'indices'):
            self._event_index_list(evt, idx).append(evt)

    def del_event(self, evt):
        assert isinstance(evt, Event)

        self._events.remove(evt)
        for idx in getattr(evt.__class__, 'indices'):
            self._event_index_list(evt, idx).remove(evt)

    def combine_events(self, evts, evt):
        assert isinstance(evt, Event)

        for e in evts:
            self.del_event(e)
            evt.children.append(e)

        self.add_event(evt)

    def get_vals(self):
        return {'start_time': js_date(self.start_time),
                'end_time': js_date(self.end_time),
                'filename': self.filename,
                'package': self.package,
                'events': [e.get_vals() for e in self._events]}

    def adjust_times(self, context):
        assert isinstance(context, ambrosia.context.AmbrosiaContext)

        for el in self._events:
            el.adjust_times(context)


class Event(Persistent):
    """
    this set contains all attributes that can be searched for; these attributes MUST NOT be CHANGED after the event has
       been added
    """
    indices = set()

    def __init__(self, name, plugin, start_ts=None, end_ts=None):
        assert isinstance(name, str)
        assert isinstance(plugin, str)
        assert isinstance(start_ts, datetime) or start_ts is None
        assert isinstance(end_ts, datetime) or end_ts is None
        self.name = name
        self.plugin = plugin
        self.start_ts = start_ts
        self.end_ts = end_ts
        self.children = PersistentList()

    def get_properties(self):
        raise NotImplementedError()

    def adjust_times(self, context):
        assert isinstance(context, ambrosia.context.AmbrosiaContext)

        for c in self.children:
            c.adjust_times(context)

    @staticmethod
    def find(analysis):
        pass

    def get_vals(self):
        return {'type': classname(type(self)),
                'children': [c.get_vals() for c in self.children],
                'startTS': js_date(self.start_ts),
                'endTS': js_date(self.end_ts),
                'name': self.name,
                'plugin': self.plugin,
                'properties': self.get_properties()}

class Entity(Persistent):
    def __init__(self, primary_identifier):
        self.primary_identifier = primary_identifier

    @staticmethod
    def find(context, entities, identifier_btree, *args):
        raise NotImplementedError()


class Process(Entity):
    def __init__(self, context, pid, start_ts, end_ts):
        super(Process, self).__init__(pid)
        assert isinstance(context, ambrosia.context.AmbrosiaContext)
        assert isinstance(start_ts, datetime) or start_ts is None
        assert isinstance(end_ts, datetime) or end_ts is None

        self.pid = pid
        self.comm = None
        self.path = None
        self.type = None
        self.uid = None

        start_ts, end_ts = self._normalize_times(context, start_ts, end_ts)

        self.start_ts = start_ts
        self.end_ts = end_ts

    @staticmethod
    def _normalize_times(context, start_ts, end_ts):
        assert isinstance(context, ambrosia.context.AmbrosiaContext)

        if start_ts is None:
            start_ts = context.analysis.start_time

        if end_ts is None:
            end_ts = context.analysis.end_time

        return start_ts, end_ts

    @staticmethod
    def find(context, entities, identifier_btree, pid, start_ts, end_ts):
        assert isinstance(context, ambrosia.AmbrosiaContext)
        assert isinstance(identifier_btree, OOBTree.BTree)
        assert isinstance(start_ts, datetime) or start_ts is None
        assert isinstance(end_ts, datetime) or end_ts is None

        start_ts, end_ts = Process._normalize_times(context, start_ts, end_ts)

        els = identifier_btree.get(pid)

        if els is None:
            return None

        for el in els:
            # the two processes overlap and have the same pid -> match
            if start_ts < el.end_ts and end_ts > el.start_ts:
                # update actual start/end
                el.start_ts = min(el.start_ts, start_ts)
                el.end_ts = max(el.end_ts, end_ts)
                return el


class File(Entity):
    def __init__(self, context, abspath):
        assert isinstance(context, ambrosia.context.AmbrosiaContext)
        abspath = os.path.normpath(abspath)
        super(File, self).__init__(abspath)
        self.abspath = abspath

    def matches_entity(self, abspath):
        return os.path.normpath(abspath) == self.abspath

    @staticmethod
    def find(context, entities, identifier_btree, abspath):
        assert isinstance(context, ambrosia.AmbrosiaContext)
        assert isinstance(identifier_btree, OOBTree.BTree)
        return identifier_btree.get(abspath)[0]


class ServerEndpoint(Entity):
    def __init__(self, context, protocol, address, port=None):
        assert isinstance(context, ambrosia.context.AmbrosiaContext)
        super(ServerEndpoint, self).__init__(address)
        self.protocol = protocol
        self.address = address
        self.port = port

    def find(context, entities, identifier_btree, protocol, address, port):
        assert isinstance(context, ambrosia.AmbrosiaContext)
        assert isinstance(identifier_btree, OOBTree.BTree)

        for el in identifier_btree.get(address):
            assert isinstance(el, ServerEndpoint)

            if el.protocol != protocol:
                continue

            if el.port != port:
                continue

            return el

