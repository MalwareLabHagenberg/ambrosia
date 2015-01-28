from ambrosia.plugins import PluginManager


class AmbrosiaContext(object):
    def __init__(self, configfile):
        from ambrosia import config, db, clocks

        self.config = config.Config(configfile)
        self.db = db.AmbrosiaDb(self)
        self.analysis = self.db.add_analysis()
        self.clock_syncer = clocks.ClockSyncer(self)
        self.plugin_manager = PluginManager()
        self.plugin_manager.find()