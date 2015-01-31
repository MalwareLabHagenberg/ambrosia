Ambrosia Server Documentation
*****************************

.. toctree::

    modules

Overview
========

This section gives a short overview of the internal workings of Ambrosia. For a detailed description please see the
documentation for the modules.

The main function for the Ambrosia server side part is located in :mod:`processor`. The following shows the usage
of the processor:

.. code-block:: none


    usage: processor.py [-h] [--config CONFIG]
                        [--loglevel {FATAL,ERROR,WARN,INFO,DEBUG}]
                        [--output OUTPUT]
                        [--output-type {serialized,none,tree,interactive}]
                        report

    process ANANAS report for Ambrosia

    positional arguments:
      report                the XML report input

    optional arguments:
      -h, --help            show this help message and exit
      --config CONFIG       the config file
      --loglevel {FATAL,ERROR,WARN,INFO,DEBUG}
                            the log level for stderr
      --output OUTPUT       the output file, default is stdout
      --output-type {serialized,none,tree,interactive}
                            define what should be printed


The processor initializes logging (see :func:`ambrosia.util.log.init_logging`), reads the XML report and creates an
:class:`ambrosia.Ambrosia` instance. It adjusts the timestamps of events coming from the emulator (see
:func:`ambrosia.Ambrosia.adjust_times`), correlates the events (:func:`ambrosia.Ambrosia.correlate`) and serializes
them (:func:`ambrosia.Ambrosia.serialize`).

All the results are stored in an :class:`ambrosia.model.Analysis` instance. The main two types of entries in the result
are events (:class:`ambrosia.model.Event`) and entities (:class:`ambrosia.model.Entity`). All events and entities
are managed by the :class:`ambrosia.model.Analysis` class. All entities are defined in :mod:`ambrosia.model.entities`.
The events are defined by each plugin.

Plugins
-------

All plugins are defined in the :mod:`ambrosia_plugins` module. A plugin has to specify a
:class:`ambrosia.plugins.PluginInfoTop` class called "PluginInfo". This class should return all
:class:`ambrosia.Correlator` and :class:`ambrosia.ResultParser` classes defined by the plugin.

A :class:`ambrosia.ResultParser` is used to extract events from the report. A :class:`ambrosia.Correlator` can be used
to correlate and consolidate events.

:mod:`ambrosia_plugins.apimonitor`
++++++++++++++++++++++++++++++++++

The :class:`ambrosia_plugins.apimonitor.ApimonitorPluginParser` generates events from the report. The
:class:`ambrosia_plugins.apimonitor.ApiCallCorrelator` is used to then find known API calls and wrap them into
higher-level events.

:mod:`ambrosia_plugins.events`
++++++++++++++++++++++++++++++
This simple plugin parses all events created by ANANAS itself.

:mod:`ambrosia_plugins.lkm`
+++++++++++++++++++++++++++

The lkm plugin handles events originating from the lkm. After the ambrosia_plugins.lkm.LkmPluginParser has parsed all
the lkm related information from the report, the :class:`ambrosia_plugins.lkm.SyscallCorrelator` wraps primitive syscall
events into higher-level event (like :class:`ambrosia_plugins.lkm.events.SendSignal` or
:class:`ambrosia_plugins.lkm.events.CreateDir`). The :class:`ambrosia_plugins.lkm.FileEventCorrelator` is used to
classify file events (to :class:`ambrosia_plugins.lkm.events.LibraryLoad`). The
:class:`ambrosia_plugins.lkm.CommandExecuteCorrelator` then finds command executions. The
:class:`ambrosia_plugins.lkm.AdbCommandCorrelator` is then used to find command executions that have been caused by
ANANAS itself.

:mod:`ambrosia_plugins.network`
+++++++++++++++++++++++++++++++
This plugin is currently not implemented.