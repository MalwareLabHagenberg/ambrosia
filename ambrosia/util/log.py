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
import logging
import sys

__author__ = 'Wolfgang Ettlinger'


class AmbrosiaFormater(logging.Formatter):
    """A custom log formatter that can use colors
    """

    color_mapping = {
        "DEBUG": "1;32",
        "WARNING": "1;33",
        "WARN": "1;33",
        "INFO": "1;35",
        "CRITICAL": "1;31",
        "ERROR": "1;31"
    }

    def __init__(self, use_colors):
        super(AmbrosiaFormater, self).__init__(
            datefmt="%Y-%m-%d_%H:%M:%S")
        self._use_colors = use_colors

    def _color(self, color, s):
        if self._use_colors:
            return '\x1b[{}m{}\x1b[0m'.format(color, s)
        else:
            return s

    def format(self, record):
        self._fmt = (self._color("1;30", "%(asctime)s") +
                     ": " +
                     self._color(self.color_mapping[record.levelname], "%(levelname)s") +
                     " " +
                     self._color("1;30", "%(message)s") +
                     " (" +
                     self._color("4;30", "%(name)s") +
                     self._color("30", ":%(lineno)d") +
                     ")")

        return super(AmbrosiaFormater, self).format(record)


def init_logging(log_level):
    """Initialize logging to stderr

    Args:
        log_level (str): the minimum log level
    """
    main_logger = logging.getLogger("ambrosia")
    main_logger.setLevel(log_level)

    plugin_logger = logging.getLogger("ambrosia_plugins")
    plugin_logger.setLevel(log_level)

    formatter = AmbrosiaFormater(sys.stderr.isatty())

    ch = logging.StreamHandler(sys.stderr)
    ch.setFormatter(formatter)
    main_logger.addHandler(ch)
    plugin_logger.addHandler(ch)
