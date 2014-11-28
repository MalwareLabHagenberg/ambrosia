from sqlalchemy import or_
import dateutil.parser

import ambrosia
from ambrosia import model
from ambrosia.context import AmbrosiaContext
from ambrosia.model import RootEvent


class SyscallEvent(model.Event):
    def __init__(self, context, props, time):
        assert isinstance(context, AmbrosiaContext)
        model.Event.__init__(self,
                       context,
                       props['name'], 
                       'lkm', 
                       start_ts=None,
                       end_ts=time)
        
        self.props = props
            
    def get_properties(self):
        return self.props.copy() 
    
    def adjust_times(self):
        self.end_ts = self.analysis.clock_syncer.emu_time(self.end_ts)
        
    def __getattr__(self, name):
        return self.props[name]


class ProcessEvent(model.Event):
    def __init__(self, pid):
        self.pid = pid
    
    @staticmethod
    def find(context):
        assert isinstance(context, AmbrosiaContext)
        print isinstance(context.analysis.root_event, RootEvent)
        forks = context.analysis.root_event.select(SyscallEvent)\
            .filter(or_(SyscallEvent.name == "fork",
                        SyscallEvent.name == "vfork",
                        SyscallEvent.name == "clone"))\
            .all()
        
        for f in forks:
            if f.returnval <= 0:
                continue
            
            p = ProcessEvent(f.returnval)
            
    def get_properties(self):
        return {'pid': self.pid}
        
    
class LkmPluginParser(ambrosia.ResultParser):
    def parse(self, name, el, context):
        assert isinstance(context, AmbrosiaContext)
        analysis = context.analysis
        if name == 'processes':
            for p in el:
                props = p.attrib.copy().items()
                props += p.find('info').attrib.items()
                props = dict(props)

                start = end = None

                if 'start' in props:
                    start = dateutil.parser.parse(props['start'])

                if 'end' in props:
                    end = dateutil.parser.parse(props['end'])

                proc = analysis.get_entity(model.Process, int(props['pid']), start, end)

                proc.ananas_id = props['id']
                proc.parentid = props['parentId']
                proc.comm = props['comm']
                proc.path = props['path']
                proc.type = props['type']

                try:
                    proc.uid = int(props['uid'])
                except ValueError:
                    # uid is 'None'
                    pass

        elif name == 'syscalltrace':
            for sc in el:
                props = sc.attrib.copy().items()
                props += sc.find('info').attrib.items()
                props = dict(props)
                
                props['returnval'] = int(sc.find('return').text)
                
                params = []
                for param in sc.findall('param'):
                    params.append(param.text)
                
                time = dateutil.parser.parse(props['time'])
                
                props['params'] = params
                
                analysis.root_event.children.append(SyscallEvent(context, props, time))
                
                