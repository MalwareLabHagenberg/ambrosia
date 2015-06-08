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
from ambrosia.context import AmbrosiaContext
from ambrosia.util import get_logger

__author__ = 'Wolfgang Ettlinger'


class AmbrosiaDb(object):
    """For future use: persistently store objects in Memory using ZODB.

    Currently the memory-footprint of Ambrosia is reasonable. However, Ambrosia is designed to be stored in ZODB.
    This database allows transparent storage to disk if memory becomes scarce. ZODB also uses certain data structures
    optimized (e.g. BTree module). Ambrosia already uses these data structures. The following classes are already
    designed to be stored in ZODB:

    * :class:`ambrosia_web.model.Analysis`
    * :class:`ambrosia_web.model.Entity`
    * :class:`ambrosia_web.model.Event`

    Args:
        context (ambrosia_web.context.AmbrosiaContext): The current context.
    """
    def __init__(self, context):
        assert isinstance(context, AmbrosiaContext)
        self.context = context
        self.log = get_logger(self)
