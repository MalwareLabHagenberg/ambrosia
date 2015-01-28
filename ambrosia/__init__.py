import json
from xml.etree.ElementTree import Element

import dateutil.parser
from ambrosia import model

import ambrosia.clocks
from ambrosia.context import AmbrosiaContext
import ambrosia.db
import ambrosia.config
from ambrosia.util import js_date, get_logger, serialize_obj, classname


class Ambrosia(object):
    def __init__(self, root, configfile):
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
                self.context.analysis.start_time = dateutil.parser.parse(str(el.text))
            elif el.tag == 'endtime':
                self.context.analysis.end_time = dateutil.parser.parse(str(el.text))
            elif el.tag == 'plugins':
                for p in el:
                    assert p.tag == 'plugin'
                    self.context.analysis.plugins[p.attrib['name']] = p.attrib
            elif el.tag == 'results':    
                ResultParser.start_parsers(el, self.context)

        self.context.db.commit()

    def adjust_times(self):
        self.log.info("adjusting times")
        self.context.analysis.adjust_times(self.context)
        
    def correlate(self):
        from ambrosia_plugins.lkm import SyscallCorrelator
        from ambrosia_plugins.apimonitor import ApiCallCorrelator

        for c in self.context.plugin_manager.correlators():
            self.log.info("starting correlator: {}".format(classname(c)))
            sc = c(self.context)
            sc.correlate()

    def sort_events(self):
        self.log.info("sorting events")
        self.context.analysis.sort()

    def serialize(self):
        self.log.info("serializing")
        return serialize_obj(self.context.analysis.get_vals())


class Correlator(object):
    def correlate(self):
        raise NotImplementedError()


class ResultParser(object):
    def prepare(self, context):
        pass

    def parse(self, name, el, context):
        raise NotImplementedError()

    def finish(self, context):
        pass
    
    @staticmethod
    def start_parsers(el, context):
        assert isinstance(context, AmbrosiaContext)

        parsers = set()

        for p in context.plugin_manager.parsers():
            pi = p()
            assert isinstance(pi, ResultParser)
            pi.prepare(context)
            parsers.add(pi)

        for parser in parsers:
            assert isinstance(parser, ResultParser)
            for r in el:
                parser.parse(r.tag, r, context)

        for parser in parsers:
            parser.finish(context)

        return parsers

