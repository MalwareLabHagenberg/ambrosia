import ambrosia.model
from ambrosia.context import AmbrosiaContext
from ambrosia.util import get_logger


class AmbrosiaDb(object):
    def __init__(self, context):
        assert isinstance(context, AmbrosiaContext)
        self.context = context
        self.log = get_logger(self)

    def add_analysis(self):
        analysis = ambrosia.model.Analysis()
        return analysis

    def commit(self):
        pass