from ambrosia.model import Analysis
from ambrosia.plugins import PluginManager

__author__ = 'Wolfgang Ettlinger'


class AmbrosiaContext(object):
    """Objects of this class hold all relevant information for **one** run of Ambrosia:

    * *config* (:class:`ambrosia.config.Config`): the configuration
    * *db* (:class:`ambrosia.db.AmbrosiaDb`): the database (currently not used)
    * *analysis* (:class:`ambrosia.model.Analysis`): the object containing the Analysis results.
    * *clock_syncer* (:class:`ambrosia.clocks.ClockSyncer`): used to syncronize clocks (emulator <-> host)
    * *plugin_manager* (:class:`ambrosia.plugins.PluginManager`): the object holding information about the Ambrosia
      plugins

    Args:
        configfile (str): path to configuration file
    """
    def __init__(self, configfile):
        from ambrosia import config, db, clocks

        self.config = config.Config(configfile)
        self.db = db.AmbrosiaDb(self)
        self.analysis = Analysis()
        self.clock_syncer = clocks.ClockSyncer(self)
        self.plugin_manager = PluginManager()
        self.plugin_manager.find()