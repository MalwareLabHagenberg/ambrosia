from ambrosia.model import Analysis
from ambrosia.plugins import PluginManager

__author__ = 'Wolfgang Ettlinger'


class AmbrosiaContext(object):
    """Objects of this class hold all relevant information for **one** run of Ambrosia:

    * *config* (:class:`ambrosia_web.config.Config`): the configuration
    * *db* (:class:`ambrosia_web.db.AmbrosiaDb`): the database (currently not used)
    * *analysis* (:class:`ambrosia_web.model.Analysis`): the object containing the Analysis results.
    * *clock_syncer* (:class:`ambrosia_web.clocks.ClockSyncer`): used to syncronize clocks (emulator <-> host)
    * *plugin_manager* (:class:`ambrosia_web.plugins.PluginManager`): the object holding information about the Ambrosia
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