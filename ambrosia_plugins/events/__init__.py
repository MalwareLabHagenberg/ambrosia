import dateutil
import json
from sqlalchemy import *
from sqlalchemy.orm import relationship

import ambrosia
from ambrosia import model
from ambrosia.context import AmbrosiaContext
from ambrosia.model import Base


class ANANASEvent(model.Event):
    __tablename__ = "ANANASEvent"
    id = Column(Integer, ForeignKey('Event.id'), primary_key=True)
    __mapper_args__ = {
        'polymorphic_identity': 'File',
    }
    params = Column(String(255))

    def __init__(self, context, name, timestamp, params):
        model.Event.__init__(self, context, name, 'core', start_ts=timestamp)
        self.name = name
        self.params = json.dumps(params)
    
    def get_properties(self):
        return {'name': self.name,
                'params': self.params}

class EventParser(ambrosia.ResultParser):
    def parse(self, name, el, context):
        assert isinstance(context, AmbrosiaContext)
        if name == 'events':
            for evt in el:
                context.analysis.root_event.children.append(ANANASEvent(
                    context,
                    evt.attrib['name'],
                    dateutil.parser.parse(evt.attrib['timestamp']),
                    json.loads(evt.attrib['parameters'])))




