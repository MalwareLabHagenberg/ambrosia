import json
from xml.etree.ElementTree import Element

import dateutil.parser
from ambrosia import model

import ambrosia.clocks
from ambrosia.context import AmbrosiaContext
import ambrosia.db
import ambrosia.config
from ambrosia.util import js_date, get_logger


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
                '''
                for h in el:
                    self.context.analysis.hashes[h.attrib['type']] = h.text
                '''
            elif el.tag == 'package':
                self.context.analysis.package = el.text
            elif el.tag == 'starttime':
                self.context.analysis.start_time = dateutil.parser.parse(str(el.text))
            elif el.tag == 'endtime':
                self.context.analysis.end_time = dateutil.parser.parse(str(el.text))
            elif el.tag == 'plugins':
                pass # TODO
            elif el.tag == 'results':    
                ResultParser.start_parsers(el, self.context)

        self.context.db.commit()

    def adjust_times(self):
        self.log.info("adjusting times")
        self.context.analysis.adjust_times(self.context)
        
    def correlate(self):
        #TODO
        from ambrosia_plugins.lkm import SyscallCorrelator
        from ambrosia_plugins.apimonitor import ApiCallCorrelator

        self.log.info("correlating syscalls")
        sc = SyscallCorrelator(self.context)
        sc.correlate()

        self.log.info("correlating API call")
        acc = ApiCallCorrelator(self.context)
        acc.correlate()

    def sort_events(self):
        self.log.info("sorting events")
        self.context.analysis.sort()

    def get_json(self):
        self.log.info("exporting JSON")
        return json.dumps(self.context.analysis.get_vals())



class ResultParser(object):
    def prepare(self, context):
        pass

    def parse(self, name, el, context):
        raise NotImplementedError()

    def finish(self, context):
        pass
    
    @staticmethod
    def start_parsers(el, context):
        parsers = []
        assert isinstance(context, AmbrosiaContext)
        
        # TODO
        from ambrosia_plugins.lkm import LkmPluginParser 
        from ambrosia_plugins.events import EventParser
        from ambrosia_plugins.apimonitor import ApimonitorPluginParser

        lp = LkmPluginParser()
        ep = EventParser()
        ap = ApimonitorPluginParser()

        lp.prepare(context)
        ep.prepare(context)
        ap.prepare(context)

        for parser in [lp, ep, ap]:
            for r in el:
                assert isinstance(parser, ResultParser)
                parser.parse(r.tag, r, context)
                parsers.append(parser)

        lp.finish(context)
        ep.finish(context)
        ap.finish(context)

        return parsers

