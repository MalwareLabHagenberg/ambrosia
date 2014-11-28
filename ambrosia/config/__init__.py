from ConfigParser import SafeConfigParser
import os

__author__ = 'wolfgang'


class Config(SafeConfigParser):
    def __init__(self, configfile):
        SafeConfigParser.__init__(self)
        self.read(
            os.path.join(
                os.path.dirname(__file__),
                'default.cfg'
            ))

        if configfile is not None:
            self.readfp(configfile)

