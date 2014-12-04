from datetime import datetime, timedelta

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

        for evt in self.context.analysis.iter_events(
                self.context,
                plugin_events.ANANASEvent,
                'name',
                value="set_time"):

            emuts = datetime.fromtimestamp(float(evt.params))
            hostts = evt.start_ts

            self.timesets.append((emuts,
                                  emuts - hostts))
        
    def emu_time(self, t):
        d = timedelta()
        for emuts, diff in self.timesets:
            if emuts > t:
                break
            
            d = diff
            
        return t - d
