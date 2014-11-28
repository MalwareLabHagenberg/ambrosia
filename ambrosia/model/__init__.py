from sqlalchemy import *
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, with_polymorphic
from datetime import datetime
import os.path

import ambrosia.context
from ambrosia.util import js_date

__author__ = 'wolfgang'

Base = declarative_base()


class Analysis(Base):
    __tablename__ = "Analysis"
    id = Column(Integer, primary_key=True)
    root_event = relationship("Event", uselist=False, backref="analysis")
    filename = Column(String(255))
    package = Column(String(255))
    start_time = Column(TIMESTAMP)
    end_time = Column(TIMESTAMP)
    # TODO hashes
    entities = relationship("Entity", backref="analysis", lazy="dynamic")

    def __init__(self, context):
        assert isinstance(context, ambrosia.context.AmbrosiaContext)
        self.context = context
        self.root_event = RootEvent(context)
        # since ambrosia is the client on the database that uses a specific analyis,
        # we can simply cache the entities for this analysis
        self._entities_cache = {}

    def add_entity(self, cls, *args):
        self.get_entity(cls, *args)

    def get_entity(self, cls, *args):
        assert issubclass(cls, Entity)

        if cls not in self._entities_cache:
            self._entities_cache[cls] = []

        for entity in self._entities_cache[cls]:
            assert isinstance(entity, Entity)
            assert isinstance(entity, cls)
            if entity.matches_entity(*args):
                return entity

        new_entity = cls(self.context, *args)
        self.entities.append(new_entity)
        self._entities_cache[cls].append(new_entity)

        return new_entity


class Event(Base):
    __tablename__ = "Event"
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    plugin = Column(String(50))
    start_ts = Column(TIMESTAMP)
    end_ts = Column(TIMESTAMP)
    children = relationship("Event", backref="parent", remote_side=[id], uselist=True)
    parent_id = Column(Integer, ForeignKey("Event.id"))
    analysis_id = Column(Integer, ForeignKey("Analysis.id"))
    event_type = Column(String(50))

    __mapper_args__ = {
        'polymorphic_identity': 'Event',
        'polymorphic_on': event_type
    }

    def __init__(self, context, name, plugin, start_ts=None, end_ts=None):
        assert isinstance(context, ambrosia.context.AmbrosiaContext)
        self.context = context
        self.name = name
        self.plugin = plugin
        self.start_ts = start_ts
        self.end_ts = end_ts

    def get_properties(self):
        raise NotImplementedError()

    def adjust_times(self):
        for c in self.children:
            c.adjust_times()

    @staticmethod
    def find(root_event):
        pass


class Entity(Base):
    __tablename__ = "Entity"
    id = Column(Integer, primary_key=True)
    analysis_id = Column(Integer, ForeignKey("Analysis.id"))
    entity_type = Column(String(50))

    __mapper_args__ = {
        'polymorphic_identity': 'Entity',
        'polymorphic_on': entity_type
    }

    def matches_entity(self, **args):
        raise NotImplementedError()


class Process(Entity):
    __tablename__ = "Process"
    id = Column(Integer, ForeignKey('Entity.id'), primary_key=True)
    __mapper_args__ = {
        'polymorphic_identity': 'Process',
    }
    comm = Column(String(255))
    path = Column(String(255))
    type = Column(String(50))
    ananas_id = Column(Integer)
    uid = Column(Integer)
    start_ts = Column(TIMESTAMP)
    end_ts = Column(TIMESTAMP)
    pid = Column(Integer)

    def __init__(self, context, pid, start_ts, end_ts):
        assert isinstance(start_ts, datetime) or start_ts is None
        assert isinstance(end_ts, datetime) or end_ts is None
        assert isinstance(context, ambrosia.context.AmbrosiaContext)
        self.context = context

        self.pid = pid
        self.comm = None
        self.path = None
        self.type = None
        self.uid = None

        start_ts, end_ts = self._normalize_times(start_ts, end_ts)

        self.start_ts = start_ts
        self.end_ts = end_ts

    def _normalize_times(self, startts, endts):
        if startts is None:
            startts = self.context.analysis.start_time

        if endts is None:
            endts = self.context.analysis.end_time

        return startts, endts

    def matches_entity(self, pid, startTS, endTS):
        assert isinstance(startTS, datetime) or startTS is None
        assert isinstance(endTS, datetime) or endTS is None

        if pid != self.pid:
            return False

        startTS, endTS = self._normalize_times(startTS, endTS)

        # the two processes overlap and have the same pid -> match
        if startTS < self.endTS and endTS > self.startTS:
            # update actual start/end
            self.startTS = min(self.startTS, startTS)
            self.endTS = max(self.endTS, endTS)
            return True

        return False


class File(Entity):
    __tablename__ = "File"
    id = Column(Integer, ForeignKey('Entity.id'), primary_key=True)
    __mapper_args__ = {
        'polymorphic_identity': 'File',
    }
    abspath = Column(String(255))

    def __init__(self, analysis, abspath):
        self.abspath = os.path.normpath(abspath)

    def matches_entity(self, abspath):
        return os.path.normpath(abspath) == self.abspath


class ServerEndpoint(Entity):
    __tablename__ = "ServerEndpoint"
    id = Column(Integer, ForeignKey('Entity.id'), primary_key=True)
    __mapper_args__ = {
        'polymorphic_identity': 'ServerEndpoint',
    }
    protocol = Column(String(50))
    address = Column(String(100))
    port = Column(Integer)

    def __init__(self, analysis, protocol, address, port=None):
        self.protocol = protocol
        self.address = address
        self.port = port

    def matches_entity(self, protocol, address, port=None):
        return protocol == self.protocol and \
            address == self.address and \
            port == self.port


class RootEvent(Event):
    def __init__(self, context):
        Event.__init__(self, context, '<root>', '<none>')

    def _get_vals(self, el):
        assert isinstance(el, Event)
        children = []

        for c in el.get_children():
            children.append(self._get_vals(c))

        props = el.get_properties()

        return {'type': type(el).__name__,
                'children': children,
                'startTS': js_date(el.startTS),
                'endTS': js_date(el.endTS),
                'name': el.name,
                'plugin': el.plugin,
                'properties': props}

    def get_vals(self):
        return self._get_vals(self)

    def get_properties(self):
        return {}

    def select(self, clazz):
        poly_query = with_polymorphic(Event, clazz)

        return self.context.db.session.query(poly_query)