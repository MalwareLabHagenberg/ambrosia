import dateutil.parser

import ambrosia
from ambrosia import model
from ambrosia.context import AmbrosiaContext


class SyscallEvent(model.Event):
    indices = {'name'}

    def __init__(self, context, props, time):
        assert isinstance(context, AmbrosiaContext)
        super(SyscallEvent, self).__init__(
            props['name'],
            'lkm',
            start_ts=None,
            end_ts=time)
        
        self.props = props
            
    def get_properties(self):
        return self.props.copy() 
    
    def adjust_times(self, context):
        assert isinstance(context, ambrosia.context.AmbrosiaContext)
        self.end_ts = context.clock_syncer.emu_time(self.end_ts)
        
    def __getattr__(self, name):
        return self.props[name]


class ProcessEvent(model.Event):
    indices = {'pid'}

    def __init__(self, pid, start_ts, end_ts, process_entitiy):
        assert isinstance(process_entitiy, model.Process)
        super(ProcessEvent, self).__init__("PID "+str(pid), "lkm", start_ts, end_ts)
        self.pid = pid
        self.process_entity = process_entitiy
    
    @staticmethod
    def find(context):
        assert isinstance(context, AmbrosiaContext)

        process_events = {}
        associated_syscalls = {}

        for pe in context.analysis.iter_entities(model.Process):
            assert isinstance(pe, model.Process)
            process_events[pe.ananas_id] = ProcessEvent(pe.pid, pe.start_ts, pe.end_ts, pe)

        for sc in context.analysis.iter_events(context, SyscallEvent):
            if sc.processid not in associated_syscalls:
                associated_syscalls[sc.processid] = []

            associated_syscalls[sc.processid].append(sc)

        for p_id, scls in associated_syscalls.iteritems():
            context.analysis.combine_events(scls, process_events[p_id])
            
    def get_properties(self):
        return {'pid': self.pid,
                'comm': self.process_entity.comm,
                'path': self.process_entity.path,
                }


class FileEvent(model.Event):
    indices = {'abspath'}

    def __init__(self, file_entity, mode, start_ts, end_ts):
        assert isinstance(file_entity, model.File)
        super(FileEvent, self).__init__("file "+str(file_entity.abspath)+" "+mode, "lkm", start_ts, end_ts)
        self.abspath = file_entity.abspath
        self.file_entity = file_entity
        self.mode = mode

    @staticmethod
    def find(context):
        assert isinstance(context, AmbrosiaContext)

        process_events = {}
        associated_syscalls = {}

        for pe in context.analysis.iter_entities(model.Process):
            assert isinstance(pe, model.Process)
            process_events[pe.ananas_id] = ProcessEvent(pe.pid, pe.start_ts, pe.end_ts, pe)

        for sc in context.analysis.iter_events(context, SyscallEvent):
            if sc.processid not in associated_syscalls:
                associated_syscalls[sc.processid] = []

            associated_syscalls[sc.processid].append(sc)

        for p_id, scls in associated_syscalls.iteritems():
            context.analysis.combine_events(scls, process_events[p_id])

    def get_properties(self):
        return {'mode': self.mode,
                'abspath': self.abspath,
                }

    
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

                proc = analysis.get_entity(context,
                                           model.Process,
                                           int(props['pid']),
                                           start,
                                           end)

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
                
                analysis.add_event(SyscallEvent(context, props, time))
                
                