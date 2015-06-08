#  -*- coding: utf-8 -*-
###############################################################################
#                                                                             #
#   Ambrosia - a tool to visualize ANANAS results                             #
#                                                                             #
#     Copyright (C) 2015 Wolfgang Ettlinger and the ANANAS Team               #
#                                                                             #
#    This program is free software: you can redistribute it and/or modify     #
#    it under the terms of the GNU General Public License as published by     #
#    the Free Software Foundation, either version 3 of the License, or        #
#    (at your option) any later version.                                      #
#                                                                             #
#    This program is distributed in the hope that it will be useful,          #
#    but WITHOUT ANY WARRANTY; without even the implied warranty of           #
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the            #
#    GNU General Public License for more details.                             #
#                                                                             #
#    You should have received a copy of the GNU General Public License        #
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.    #
#                                                                             #
#    the ANANAS Project  Copyright (C) 2015                                   #
#                                                                             #
###############################################################################
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