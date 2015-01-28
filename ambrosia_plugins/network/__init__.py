import dateutil
import json

import ambrosia
from ambrosia import model
from ambrosia.context import AmbrosiaContext
from ambrosia.plugins import PluginInfoTop


class PluginInfo(PluginInfoTop):
    @staticmethod
    def correlators():
        return []
