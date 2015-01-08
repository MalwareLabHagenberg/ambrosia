import re
import copy
import dateutil.parser

import ambrosia
from ambrosia import model
from ambrosia.context import AmbrosiaContext
from ambrosia_plugins.events import ANANASEvent


class AndroidApicall(model.Event):
    indices = {'process'}

    def __init__(self, api, method, params, returnval, start_ts):
        super(AndroidApicall, self).__init__('', "apimonitor", start_ts=start_ts)
        self.api = api
        self.method = method
        self.params = params
        self.returnval = returnval

    def adjust_times(self, context):
        assert isinstance(context, AmbrosiaContext)
        self.start_ts = context.clock_syncer.emu_time(self.start_ts)

    def __str__(self):
        return 'Android API-Call: {}, {}, {}, {}'.format(self.api, self.method, self.params, self.returnval)

class ApimonitorPluginParser(ambrosia.ResultParser):
    def __init__(self):
        super(ApimonitorPluginParser, self).__init__()
        self.processes = {}

    def parse(self, name, el, context):
        assert isinstance(context, AmbrosiaContext)

        if name == 'apimonitor':
            for ac in el:
                assert ac.tag == 'apicall'
                ts = dateutil.parser.parse(str(ac.attrib['timestamp']))
                apicall = AndroidApicall(ac.find('api').text,
                                         ac.find('method').text,
                                         ac.find('parameters').text,
                                         ac.find('returnvalue').text,
                                         ts)

                context.analysis.add_event(apicall)

    def finish(self, context):
        assert isinstance(context, AmbrosiaContext)


class ApimonitirCorrelator(object):
    def __init__(self, context):
        assert isinstance(context, AmbrosiaContext)
        self.proc_attrs = {}
        self.context = context
        self.to_add = set()
        self.to_remove = set()

    def correlate(self):
        pass