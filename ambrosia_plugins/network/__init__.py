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
import dateutil
import json

import ambrosia
from ambrosia import model
from ambrosia.context import AmbrosiaContext
from ambrosia.plugins import PluginInfoTop

__author__ = 'Wolfgang Ettlinger'


class PluginInfo(PluginInfoTop):
    """This plugin is not implemented. Implement as soon as ANANAS properly supports network traffic analysis.
    """
    pass
