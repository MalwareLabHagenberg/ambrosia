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
from xml.etree.ElementTree import Element

import dateutil.parser
import ambrosia.clocks
import ambrosia.db
import ambrosia.config
from ambrosia import model
from ambrosia.context import AmbrosiaContext
from ambrosia.util import js_date, get_logger, serialize_obj, classname

__author__ = 'Wolfgang Ettlinger'


class Ambrosia(object):
    """This class is the main class that performs starts all actions

    Args:
        root (xml.etree.Element): The document root of the XML report
        configfile (str): the config file path

    Upon object creation the report is being parsed. General information (such as the APK filename) as well as
    Plugin-specific values are obtained. Plugin-specific values are parsed using :class:`ResultParser` instances.
    """
    def __init__(self, root, configfile):
        assert isinstance(root, Element)
        self.root = root
        self.log = get_logger(self)

        # setup context
        self.context = AmbrosiaContext(configfile)

        self._parse_report()
        
    def _parse_report(self):
        self.log.info("parsing report")

        for el in self.root:
            assert isinstance(el, Element)

            if el.tag == 'filename':
                self.context.analysis.filename = el.text
            elif el.tag == 'hashes':
                for h in el:
                    self.context.analysis.hashes[h.attrib['type']] = h.text
            elif el.tag == 'package':
                self.context.analysis.package = el.text
            elif el.tag == 'starttime':
                self.context.analysis.start_time = dateutil.parser.parse(unicode(el.text))
            elif el.tag == 'endtime':
                self.context.analysis.end_time = dateutil.parser.parse(unicode(el.text))
            elif el.tag == 'plugins':
                for p in el:
                    assert p.tag == 'plugin'
                    self.context.analysis.plugins[p.attrib['name']] = p.attrib
            elif el.tag == 'results':
                self.log.info("starting result-parsers")
                ResultParser.start_parsers(el, self.context)

    def adjust_times(self):
        """This method adjusts the timestamps of all events.

        Since the emulator clock and the clock of the analysis machine may be different (e.g. when the simulation plugin
        turns time ahead) the timestamps of several Events (with timestamps comming from the emulator) have to be
        adjusted (to the clock of the analysis machine). See :class:`ambrosia_web.clocks.ClockSyncer`.

        This method should be called right after the :class:`ambrosia_web.Ambrosia` class has been created.

        """
        self.log.info("adjusting times")
        self.context.analysis.adjust_times(self.context)
        
    def correlate(self):
        """Correlates the events

        This method finds all Correlaters (see :class:`ambrosia_web.plugins.PluginManager`) and starts them.

        A :class:`Correlator` searches for specific events (at top level) and wraps them into other events. E.g. a
        open(), read() and close() SyscallEvents are wrapped into a FileAccessEvent. The :class:`Correlator` can also do
        several passes (e.g. wrap 3 events of type A into a event B, then wrap several B events and wrap them into a C
        event).

        Should be called after :func:`Ambrosia.adjust_times`.
        """
        for c in self.context.plugin_manager.correlators():
            self.log.info("starting correlator: {}".format(classname(c)))
            sc = c(self.context)
            sc.correlate()

    def serialize(self, fp):
        """Serialize Events into a compact text format (see :func:`ambrosia_web.util.serialize_obj`).

        Should be called after :func:`Ambrosia.correlate`.

        Returns:
            the serialized string
        """
        self.log.info("serializing")
        return serialize_obj(self.context.analysis.to_serializeable(), fp)


class Correlator(object):
    """Base class for Correlators.

    A Correlator is called after all primitive events (like Syscalls, API calls etc.) have been acquired. The Correlator
    is responsible to find matching primitive events (or events generated by other Correlators) and wrap them into
    higher-level Events.

    The :class:`ambrosia_web.plugins.PluginInfoTop` specifies a priority for each Correlator. This allows to force a
    specific order in which the Correlators are called (e.g. if a Correlator relies on Events generated by another
    Correlator).
    """

    def __init__(self, context):
        assert isinstance(context, AmbrosiaContext)
        self.context = context
        self.to_add = set()
        self.to_remove = set()
        self.log = get_logger(self)

    def correlate(self):
        """**Must** be implemented by the specific class.
        """
        raise NotImplementedError()

    def update_tree(self):
        """This method may be used by subclasses to update the result event tree.

        If the subclass uses the :func:`ambrosia_web.model.Event.iter_events` in a loop it may not add or remove events from
        the event tree. Otherwise events may be skipped or processed twice. Therefore the subclass may use the `to_add`
        and `to_remove` attributes to store events that should be added and removed from the top level of the event
        tree. Afterwards this method can be used to process the pending adds/removes.
        """
        self.log.info('Updating Event tree')
        for evt in self.to_remove:
            self.context.analysis.del_event(evt)

        for evt in self.to_add:
            if evt not in self.to_remove:
                self.context.analysis.add_event(evt)

        self.to_add = set()
        self.to_remove = set()


class ResultParser(object):
    """Allows a plugin to implement parsers for the results in the XML report (Abstract base class).

    When the *result* section of a report is parsed **all** ResultParsers of all plugins are called for each result
    section. Each ResultParser may generate primitive events from the supplied XML Element.
    """
    def prepare(self, context):
        """Called before any parsing is done by any ResultParser. **May** be overwritten by specific class.

        Args:
            context (ambrosia_web.context.AmbrosiaContext): The current context.
        """
        pass

    def parse(self, name, el, context):
        """The actual parsing routine **must** be implemented by the specific class.

        Args:
            name (str): The name of the tag (child of the *results* element).
            el (xml.etree.Element): The result element to parse.
            context (ambrosia_web.context.AmbrosiaContext): The current context.
        """
        raise NotImplementedError()

    def finish(self, context):
        """Called after all parsing has been done

        Args:
            context (ambrosia_web.context.AmbrosiaContext): The current context.
        """
        pass
    
    @staticmethod
    def start_parsers(el, context):
        """Starts all ResultParsers registered in the :class:`ambrosia_web.plugins.PluginManager`.

        Args:
            context (ambrosia_web.context.AmbrosiaContext): The current context.
        """
        assert isinstance(context, AmbrosiaContext)

        parsers = set()

        # prepare parsers
        for p in context.plugin_manager.parsers():
            pi = p()
            assert isinstance(pi, ResultParser)
            pi.prepare(context)
            parsers.add(pi)

        # actual parsing process
        for parser in parsers:
            assert isinstance(parser, ResultParser)
            for r in el:
                parser.parse(r.tag, r, context)

        # finish
        for parser in parsers:
            parser.finish(context)


