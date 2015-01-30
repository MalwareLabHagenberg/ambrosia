import os
import ambrosia
from ambrosia.util import get_logger

__author__ = 'Wolfgang Ettlinger'


class PluginManager(object):
    """Manages all Ambrosia plugins
    """
    def __init__(self):
        self.log = get_logger(self)
        self.plugins = []
        self._correlators = {}
        self._parsers = set()

    def find(self):
        """Finds all plugins and gathers information about them.
        """
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
        """Iterate all correlators (sorted by priority)
        """
        keys = self._correlators.keys()
        keys.sort()

        for k in keys:
            for c in self._correlators[k]:
                yield c

    def parsers(self):
        """Returs a set with all parsers
        """
        return self._parsers


class PluginInfoTop(object):
    """The base class to all PluginInfo classes. Every plugin must define a class named `PluginInfo` in the base module
    of the plugin.
    """

    @staticmethod
    def correlators():
        """Should return a list with tuples containing a :class:`ambrosia_web.Correlator` and the priority (int)
        """
        return []

    @staticmethod
    def parsers():
        """Should return a list with all defined :class:`ambrosia_web.ResultParser` classes.
        """
        return []