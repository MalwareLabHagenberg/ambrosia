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
from datetime import datetime, timedelta

import ambrosia.context

__author__ = 'Wolfgang Ettlinger'


class ClockSyncer(object):
    """Used to synchronize all events.

    This class manages the **translate_table**. This Array has the following structure:

    .. code-block:: python

       [
           (time, error)
       ]

    where
    * *time* is a timestamp (datetime.datetime) when the emulator time has changed (in **emulator time**) and
    * *error* is the datetime.timedelta of how much the emulator time is in the future

    The entries have to be sorted by *time*.

    .. warning::
        This class assumes that when the emulator is started, the times are synchronized.

    .. warning::
        This class assumes that the emulator clock is always turned ahead (and never back). Currently this is the case
        since ANANAS tries to trigger behaviour that occur when the sample has been installed for a while.

        This also poses a theoretical issue e.g. if the emulator time is 17:00 at boot and at 17:02 the clock is turned
        back to 17:00. An event occurring at 17:01 can either have happened at 17:01 or 17:03.

    .. warning::
        This class assumes that all timestamps have the same time zone (local time).

    Args:
        context (ambrosia_web.context.AmbrosiaContext): The current context.
    """
    def __init__(self, context):
        assert isinstance(context, ambrosia.context.AmbrosiaContext)
        self.context = context
        self.translate_table = []

    def emu_time(self, t):
        """Calculate host time from a given emulator timestamp.

        The method goes through all entries and finds the first entry where the given emulator timestamp is greater than
        the *time*. This means that the timestamp occurs after this emulator clock change. If no such entry is found,
        the emulator clock is assumed to be in sync with the host clock.
        """
        assert isinstance(t, datetime)
        d = timedelta()
        for emuts, diff in self.translate_table:
            if emuts > t:
                break
            
            d = diff
            
        return t - d
