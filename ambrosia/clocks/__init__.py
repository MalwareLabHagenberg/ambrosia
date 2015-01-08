from datetime import datetime, timedelta

import ambrosia.context
from ambrosia.model import Event


class ClockSyncer(object):
    def __init__(self, context):
        assert isinstance(context, ambrosia.context.AmbrosiaContext)
        self.context = context
        self.translate_table = []

    def emu_time(self, t):
        assert isinstance(t, datetime)
        d = timedelta()
        for emuts, diff in self.translate_table:
            if emuts > t:
                break
            
            d = diff
            
        return t - d
