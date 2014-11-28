from sqlalchemy import *
from sqlalchemy.orm import sessionmaker
import ambrosia.model
from ambrosia.context import AmbrosiaContext
from ambrosia.util import get_logger


class AmbrosiaDb(object):
    def __init__(self, context):
        assert isinstance(context, AmbrosiaContext)
        self.context = context
        self.engine = create_engine(context.config.get('db', 'connectionstring'))
        self.session = sessionmaker(bind=self.engine)()
        self.log = get_logger(self)

        #TODO
        from ambrosia_plugins.lkm import SyscallEvent, ProcessEvent
        from ambrosia_plugins.events import ANANASEvent

        ambrosia.model.Base.metadata.create_all(self.engine)

    def add_analysis(self):
        analysis = ambrosia.model.Analysis(self.context)
        self.session.add(analysis)
        return analysis

    def commit(self):
        self.session.commit()