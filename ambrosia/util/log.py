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
    main_logger = logging.getLogger("ambrosia_web")
    main_logger.setLevel(log_level)

    plugin_logger = logging.getLogger("ambrosia_plugins")
    plugin_logger.setLevel(log_level)

    formatter = AmbrosiaFormater(sys.stderr.isatty())

    ch = logging.StreamHandler(sys.stderr)
    ch.setFormatter(formatter)
    main_logger.addHandler(ch)
    plugin_logger.addHandler(ch)
