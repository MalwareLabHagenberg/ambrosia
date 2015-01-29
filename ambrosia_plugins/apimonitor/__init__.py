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

__author__ = 'Wolfgang Ettlinger'


class PluginInfo(PluginInfoTop):
    @staticmethod
    def correlators():
        return [(ApiCallCorrelator, 10)]

    @staticmethod
    def parsers():
        return [ApimonitorPluginParser]


class AndroidApicall(model.Event):
    """Represents an API call of the App

    Args:
        api (str): the class referenced by this API call
        method (str): the method called
        returnval (str): the return value
        start_ts (datetime.datetime): the time the API call occurred (emulator clock)
    """
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

    def get_serializeable_properties(self):
        return {}

    def __str__(self):
        return '[Android API-Call: {}, {}, {}, {}]'.format(self.api, self.method, self.params, self.returnval)


class ApimonitorPluginParser(ambrosia.ResultParser):
    """The plugin parser that parses the apimonitor tag
    """
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


class ContactsAccess(model.Event):
    """App accesses contacts
    """
    indices = {}

    def __init__(self):
        super(ContactsAccess, self).__init__()

    def get_serializeable_properties(self):
        return {} # TODO

    def __str__(self):
        return '[Contact access]'


class SMSAccess(model.Event):
    """App accesses SMS
    """
    indices = {}

    def __init__(self):
        super(SMSAccess, self).__init__()

    def get_serializeable_properties(self):
        return {} # TODO

    def __str__(self):
        return '[SMS access]'


class CallLogAccess(model.Event):
    """App accesses call logs
    """
    indices = {}

    def __init__(self):
        super(CallLogAccess, self).__init__()

    def get_serializeable_properties(self):
        return {} # TODO

    def __str__(self):
        return '[Call log access]'


class PhoneCall(model.Event):
    """App calls someone
    """
    indices = {}

    def __init__(self):
        super(PhoneCall, self).__init__()

    def get_serializeable_properties(self):
        return {} # TODO

    def __str__(self):
        return '[Phone call]'


class ApiCallCorrelator(ambrosia.Correlator):
    """Goes through all API calls and wraps known API calls into higher-level events.

    Args:
        context (ambrosia.context.AmbrosiaContext): the current context.
    """
    def __init__(self, context):
        assert isinstance(context, AmbrosiaContext)
        super(ApiCallCorrelator, self).__init__(context)

    def correlate(self):
        self.log.info('Generating events from API calls')
        for evt in self.context.analysis.iter_events(self.context, cls=AndroidApicall):
            self._check_apicall(evt)

        self.update_tree()

    def _wrap_evt(self, apicall, cls):
        """Helper function that creates an Event and adds a child to it
        """
        assert isinstance(apicall, AndroidApicall)
        assert issubclass(cls, Event)

        o = cls()
        assert isinstance(o, Event)
        o.add_child(apicall)
        self.to_add.add(o)
        self.to_remove.add(apicall)

    def _check_apicall(self, evt):
        """Check a single API call event and wrap it into a higher-level event.
        """
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