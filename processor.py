#!/usr/bin/env python
# -*- coding: utf-8 -*-
import argparse
import sys
import xml.etree.ElementTree as ET
import logging
from datetime import datetime, timedelta
from ambrosia_plugins.events import ANANASEvent
from ambrosia_plugins.lkm import FileEvent, StartTaskEvent, CommandExecuteEvent, SuperUserRequest
from ambrosia_plugins.lkm.events import SyscallEvent, CommandExecuteEvent, FileEvent, StartTaskEvent, SuperUserRequest

sys.path.append(".")

import ambrosia

def print_tree(t, i=''):
    print str(t.start_ts)+i+str(t)
    for c in t.children:
        print_tree(c, i+' ')

def main():
    logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    parser = argparse.ArgumentParser(description='process ANANAS report for Ambrosia')
    parser.add_argument('report', type=file,
                        help='the XML report input')
    parser.add_argument('--config', type=file,
                        help='the config file')

    args = parser.parse_args()
    
    xmltree = ET.parse(args.report)
    xmlroot = xmltree.getroot()

    runner = ambrosia.Ambrosia(xmlroot, args.config)
    runner.adjust_times()
    runner.correlate()
    print runner.serialize()
    '''
    for e in runner.context.analysis.iter_events(runner.context):
        #if not isinstance(e, FileEvent) and not isinstance(e, ANANASEvent):
        #    print e
        print_tree(e)
    '''
if __name__ == "__main__":
    main()
