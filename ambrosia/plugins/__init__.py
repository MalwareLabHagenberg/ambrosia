import os
import ambrosia
from ambrosia.util import get_logger


class PluginManager(object):
    def __init__(self):
        self.log = get_logger(self)
        self.plugins = []
        self._correlators = {}
        self._parsers = set()

    def find(self):
        pluginspath = os.path.join(
            os.path.dirname(
                os.path.abspath(__file__)),
            '../../ambrosia_plugins')

        for p in os.listdir(pluginspath):
            path = os.path.join(pluginspath, p)

            if not os.path.isdir(path):
                continue

            self.log.debug('processing {}'.format(p))

            try:
                pi = __import__('ambrosia_plugins.' + p, fromlist=['PluginInfo']).PluginInfo
                assert issubclass(pi, PluginInfoTop)
                self.plugins.append(pi)

                for c in pi.correlators():
                    cls, prio = c
                    assert issubclass(cls, ambrosia.Correlator)

                    if prio not in self._correlators:
                        self._correlators[prio] = set()

                    self._correlators[prio].add(cls)

                for parser in pi.parsers():
                    assert issubclass(parser, ambrosia.ResultParser)
                    self._parsers.add(parser)

                self.log.info('imported plugin {}'.format(p))
            except:
                self.log.exception('error importing plugin {}'.format(p))

    def correlators(self):
        keys = self._correlators.keys()
        keys.sort()

        for k in keys:
            for c in self._correlators[k]:
                yield c

    def parsers(self):
        return self._parsers


class PluginInfoTop(object):
    @staticmethod
    def correlators():
        return []

    @staticmethod
    def parsers():
        return []