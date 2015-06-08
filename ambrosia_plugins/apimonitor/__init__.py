#  -*- coding: utf-8 -*-
###############################################################################
#                                                                             #
#   Ambrosia - a tool to visualize ANANAS results                             #
#                                                                             #
#     Copyright (C) 2015 Wolfgang Ettlinger and the ANANAS Team               #
#                                                                             #
#    This program is free software: you can redistribute it and/or modify     #
#    it under the terms of the GNU General Public License as published by     #
#    the Free Software Foundation, either version 3 of the License, or        #
#    (at your option) any later version.                                      #
#                                                                             #
#    This program is distributed in the hope that it will be useful,          #
#    but WITHOUT ANY WARRANTY; without even the implied warranty of           #
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the            #
#    GNU General Public License for more details.                             #
#                                                                             #
#    You should have received a copy of the GNU General Public License        #
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.    #
#                                                                             #
#    the ANANAS Project  Copyright (C) 2015                                   #
#                                                                             #
###############################################################################
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


class AndroidApicallEvent(model.Event):
    """Represents an API call of the App

    Args:
        api (str): the class referenced by this API call
        method (str): the method called
        returnval (str): the return value
        start_ts (datetime.datetime): the time the API call occurred (emulator clock)
    """
    indices = {}

    def __init__(self, api, method, params, returnval, start_ts):
        super(AndroidApicallEvent, self).__init__(start_ts=start_ts)
        self.api = api
        self.method = method
        self.params = params
        self.returnval = returnval

    def adjust_times(self, context):
        assert isinstance(context, AmbrosiaContext)
        self.start_ts = context.clock_syncer.emu_time(self.start_ts)

    def get_serializeable_properties(self):
        return {
            'api': self.api,
            'method': self.method,
            'params': self.params,
            'returnval': self.returnval
        }

    def __str__(self):
        return u'[Android API-Call: {}, {}, {}, {}]'.format(self.api, self.method, self.params, self.returnval)


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
                ts = dateutil.parser.parse(unicode(ac.attrib['timestamp']))
                apicall = AndroidApicallEvent(ac.find('api').text,
                                         ac.find('method').text,
                                         ac.find('parameters').text,
                                         ac.find('returnvalue').text,
                                         ts)

                context.analysis.add_event(apicall)

    def finish(self, context):
        assert isinstance(context, AmbrosiaContext)


class ContactAccessEvent(model.Event):
    """App accesses contacts
    """
    indices = {}

    def __init__(self):
        super(ContactAccessEvent, self).__init__()

    def get_serializeable_properties(self):
        return {} # TODO

    def __str__(self):
        return '[Contact access]'


class SMSAccessEvent(model.Event):
    """App accesses SMS
    """
    indices = {}

    def __init__(self):
        super(SMSAccessEvent, self).__init__()

    def get_serializeable_properties(self):
        return {} # TODO

    def __str__(self):
        return '[SMS access]'


class CallLogAccessEvent(model.Event):
    """App accesses call logs
    """
    indices = {}

    def __init__(self):
        super(CallLogAccessEvent, self).__init__()

    def get_serializeable_properties(self):
        return {} # TODO

    def __str__(self):
        return '[Call log access]'


class PhoneCallEvent(model.Event):
    """App calls someone
    """
    indices = {}

    def __init__(self):
        super(PhoneCallEvent, self).__init__()

    def get_serializeable_properties(self):
        return {} # TODO

    def __str__(self):
        return '[Phone call]'


class SendSMSEvent(model.Event):
    """App calls someone
    """
    indices = {}

    def __init__(self):
        super(SendSMSEvent, self).__init__()

    def get_serializeable_properties(self):
        return {} # TODO

    def __str__(self):
        return '[Send SMS]'

class ApiCallCorrelator(ambrosia.Correlator):
    """Goes through all API calls and wraps known API calls into higher-level events.

    Args:
        context (ambrosia_web.context.AmbrosiaContext): the current context.
    """
    def __init__(self, context):
        assert isinstance(context, AmbrosiaContext)
        super(ApiCallCorrelator, self).__init__(context)

    def correlate(self):
        self.log.info('Generating events from API calls')
        for evt in self.context.analysis.iter_events(self.context, cls=AndroidApicallEvent):
            self._check_apicall(evt)

        self.update_tree()

    def _wrap_evt(self, apicall, o):
        """Helper function that creates an Event and adds a child to it
        """
        assert isinstance(apicall, AndroidApicallEvent)
        assert isinstance(o, Event)

        o.add_child(apicall)
        self.to_add.add(o)
        self.to_remove.add(apicall)

    def _check_apicall(self, evt):
        """Check a single API call event and wrap it into a higher-level event.
        """
        assert isinstance(evt, AndroidApicallEvent)

        if evt.api == 'Landroid/content/ContentResolver' and evt.method == 'query':
            # accessing a content provider
            m = re.match('Landroid/net/Uri;=([^ ]*)', evt.params)

            if m is not None:
                uri = m.group(1)

                if uri.startswith('content://com.android.contacts/'):
                    self._wrap_evt(evt, ContactAccessEvent())
                elif uri == 'content://sms/inbox':
                    self._wrap_evt(evt, SMSAccessEvent())
                elif uri == 'content://call_log/calls':
                    self._wrap_evt(evt, CallLogAccessEvent())
        elif evt.method == 'startActivity' and 'act=android.intent.action.CALL' in evt.params:
            # startActivity with CALL-intent -> phone call
            self._wrap_evt(evt, PhoneCallEvent())
        elif evt.api == 'Landroid/telephony/SmsManager' and \
                        evt.method in ('sendMultipartTextMessage', 'sendTextMessage', 'sendDataMessage'):
            self._wrap_evt(evt, SendSMSEvent())
