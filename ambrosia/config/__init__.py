from ConfigParser import SafeConfigParser
import os

__author__ = 'Wolfgang Ettlinger'


class Config(SafeConfigParser):
    """Allows simple access to the configuration file (currently not used or implemented)
    """
    def __init__(self, configfile):
        SafeConfigParser.__init__(self)
        self.read(
            os.path.join(
                os.path.dirname(__file__),
                'default.cfg'
            ))

        if configfile is not None:
            self.readfp(configfile)

