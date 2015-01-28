from ambrosia.context import AmbrosiaContext
from ambrosia.util import get_logger

__author__ = 'Wolfgang Ettlinger'


class AmbrosiaDb(object):
    """For future use: persistently store objects in Memory using ZODB.

    Currently the memory-footprint of Ambrosia is reasonable. However, Ambrosia is designed to be stored in ZODB.
    This database allows transparent storage to disk if memory becomes scarce. ZODB also uses certain data structures
    optimized (e.g. BTree module). Ambrosia already uses these data structures. The following classes are already
    designed to be stored in ZODB:

    * :class:`ambrosia.model.Analysis`
    * :class:`ambrosia.model.Entity`
    * :class:`ambrosia.model.Event`

    Args:
        context (ambrosia.context.AmbrosiaContext): The current context.
    """
    def __init__(self, context):
        assert isinstance(context, AmbrosiaContext)
        self.context = context
        self.log = get_logger(self)
