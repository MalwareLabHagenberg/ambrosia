from datetime import datetime
import os.path
from BTrees import OOBTree
import ambrosia.context
from ambrosia.model import Entity

__author__ = 'wolfgang'


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
        self.parent = None

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

    def __str__(self):
        return '[Process: "{}" ({}) Path: {}]'.format(self.comm, self.pid, self.path)


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
        e = identifier_btree.get(abspath)

        if e is not None:
            return e[0]

    def __str__(self):
        return '[File "{}"]'.format(self.abspath)


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