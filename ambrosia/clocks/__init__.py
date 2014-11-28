from datetime import datetime, timedelta
from sqlalchemy.orm import with_polymorphic
from sqlalchemy.sql.expression import and_

import ambrosia.context
from ambrosia.model import Event


class ClockSyncer(object):
    def __init__(self, context):
        assert isinstance(context, ambrosia.context.AmbrosiaContext)
        self.context = context
        self.timesets = []
        
    def prepare(self):
        # TODO
        import ambrosia_plugins.events as plugin_events
        poly_query = with_polymorphic(Event, [plugin_events.ANANASEvent])

        tevts = self.context.db.session.query(poly_query) \
            .filter(and_(
                poly_query.analysis == self.context.analysis,
                poly_query.name == 'set_time')) \
            .all()

        for evt in tevts:
            emuts = datetime.fromtimestamp(float(evt.params))
            hostts = evt.startTS

            self.timesets.append((emuts,
                                  emuts - hostts))
        
    def emu_time(self, t):
        d = timedelta()
        for emuts, diff in self.timesets:
            if emuts > t:
                break
            
            d = diff
            
        return t - d
