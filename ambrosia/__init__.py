import json
from xml.etree.ElementTree import Element

import dateutil.parser

import ambrosia.clocks
from ambrosia.context import AmbrosiaContext
import ambrosia.db
import ambrosia.config
from ambrosia.util import js_date


class Ambrosia(object):
    def __init__(self, root, configfile):
        self.root = root

        # setup context
        self.context = AmbrosiaContext(configfile)

        self._parse_report()
        
    def _parse_report(self):
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
        self.context.clock_syncer.prepare()
        self.context.analysis.root_event.adjust_times()
        
    def correlate(self):
        
        #TODO
        from ambrosia_plugins.lkm import ProcessEvent
        ProcessEvent.find(self.context)

    def get_json(self):
        analysis = self.context.analysis
        return json.dumps({'start_time': js_date(analysis.start_time),
                           'end_time': js_date(analysis.end_time),
                           'filename': analysis.filename,
                           'package': analysis.package,
                           'root_event': analysis.root_event.get_vals()})


class ResultParser(object):
    def parse(self, name, el, context):
        raise NotImplementedError()
    
    @staticmethod
    def start_parsers(el, context):
        parsers = []
        assert isinstance(context, AmbrosiaContext)
        
        # TODO
        from ambrosia_plugins.lkm import LkmPluginParser 
        from ambrosia_plugins.events import EventParser
        
        for cls in [LkmPluginParser, EventParser]:
            for r in el:
                parser = cls()
                assert isinstance(parser, ResultParser)
                parser.parse(r.tag, r, context)
                parsers.append(parser)
        
        return parsers

