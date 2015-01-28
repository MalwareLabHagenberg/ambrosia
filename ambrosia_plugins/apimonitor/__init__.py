import re
import copy
import dateutil.parser

import ambrosia
from ambrosia import model
from ambrosia.context import AmbrosiaContext
from ambrosia.model import Event
from ambrosia.plugins import PluginInfoTop
from ambrosia_plugins.events import ANANASEvent
from ambrosia.util import get_logger


class PluginInfo(PluginInfoTop):
    @staticmethod
    def correlators():
        return [(ApimonitorCorrelator, 10)]

    @staticmethod
    def parsers():
        return [ApimonitorPluginParser]

class AndroidApicall(model.Event):
    indices = {}

    def __init__(self, api, method, params, returnval, start_ts):
        super(AndroidApicall, self).__init__(start_ts=start_ts)
        self.api = api
        self.method = method
        self.params = params
        self.returnval = returnval

    def adjust_times(self, context):
        assert isinstance(context, AmbrosiaContext)
        self.start_ts = context.clock_syncer.emu_time(self.start_ts)

    def get_properties(self):
        return {}

    def __str__(self):
        return '[Android API-Call: {}, {}, {}, {}]'.format(self.api, self.method, self.params, self.returnval)


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


class ApimonitorCorrelator(ambrosia.Correlator):
    def __init__(self, context):
        assert isinstance(context, AmbrosiaContext)
        self.proc_attrs = {}
        self.context = context
        self.to_add = set()
        self.to_remove = set()

    def correlate(self):
        pass


class ContactsAccess(model.Event):
    indices = {}

    def __init__(self):
        super(ContactsAccess, self).__init__()

    def get_properties(self):
        return {} # TODO

    def __str__(self):
        return '[Contact access]'


class SMSAccess(model.Event):
    indices = {}

    def __init__(self):
        super(SMSAccess, self).__init__()

    def get_properties(self):
        return {} # TODO

    def __str__(self):
        return '[SMS access]'


class CallLogAccess(model.Event):
    indices = {}

    def __init__(self):
        super(CallLogAccess, self).__init__()

    def get_properties(self):
        return {} # TODO

    def __str__(self):
        return '[Call log access]'


class PhoneCall(model.Event):
    indices = {}

    def __init__(self):
        super(PhoneCall, self).__init__()

    def get_properties(self):
        return {} # TODO

    def __str__(self):
        return '[Phone call]'

class ApiCallCorrelator(object):
    def __init__(self, context):
        assert isinstance(context, AmbrosiaContext)
        self.context = context
        self.to_add = set()
        self.to_remove = set()
        self.log = get_logger(self)

    def _update_tree(self):
        self.log.info('Updating Event tree')
        for evt in self.to_remove:
            self.context.analysis.del_event(evt)

        for evt in self.to_add:
            if evt not in self.to_remove:
                self.context.analysis.add_event(evt)

        self.to_add = set()
        self.to_remove = set()

    def correlate(self):
        self.log.info('Generating events from API calls')
        for evt in self.context.analysis.iter_events(self.context, cls=AndroidApicall):
            self._check_apicall(evt)

        self._update_tree()

    def _wrap_evt(self, apicall, cls):
        assert isinstance(apicall, AndroidApicall)
        assert issubclass(cls, Event)

        o = cls()
        assert isinstance(o, Event)
        o.add_child(apicall)
        self.to_add.add(o)
        self.to_remove.add(apicall)

    def _check_apicall(self, evt):
        assert isinstance(evt, AndroidApicall)

        if evt.api == 'Landroid/content/ContentResolver' and evt.method == 'query':
            # accessing a content provider
            m = re.match('Landroid/net/Uri;=([^ ]*)', evt.params)

            if m is not None:
                uri = m.group(1)

                if uri == 'content://com.android.contacts/contacts':
                    self._wrap_evt(evt, ContactsAccess)
                elif uri == 'content://sms/inbox':
                    self._wrap_evt(evt, SMSAccess)
                elif uri == 'content://call_log/calls':
                    self._wrap_evt(evt, CallLogAccess)
        elif evt.method == 'startActivity' and 'act=android.intent.action.CALL' in evt.params:
            # startActivity with CALL-intent -> phone call
            self._wrap_evt(evt, PhoneCall)