import dateutil
import json

import ambrosia
from ambrosia import model
from ambrosia.context import AmbrosiaContext
from ambrosia.plugins import PluginInfoTop


class PluginInfo(PluginInfoTop):
    @staticmethod
    def correlators():
        return []

    @staticmethod
    def parsers():
        return [EventParser]


class ANANASEvent(model.Event):
    indices = {'name', 'start_ts'}

    def __init__(self, name, timestamp, params):
        super(ANANASEvent, self).__init__(start_ts=timestamp)
        self.name = name
        self.params = params
    
    def get_properties(self):
        return {'name': self.name,
                'params': self.params}

    def __str__(self):
        return '[ANANAS Event: {} {}]'.format(self.name, json.dumps(self.params))


class EventParser(ambrosia.ResultParser):
    def parse(self, name, el, context):
        assert isinstance(context, AmbrosiaContext)
        if name == 'events':
            for evt in el:
                context.analysis.add_event(ANANASEvent(
                    evt.attrib['name'],
                    dateutil.parser.parse(evt.attrib['timestamp']),
                    json.loads(evt.attrib['parameters'])))




