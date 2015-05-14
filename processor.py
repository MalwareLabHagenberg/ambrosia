#!/usr/bin/env python
# -*- coding: utf-8 -*-
import argparse
import codecs
import sys
import xml.etree.ElementTree as ElementTree
import code
from ambrosia.util.log import init_logging

sys.path.append(".")

import ambrosia


def _print_tree(output, t, i=''):
    output.write(i + unicode(t) + '\n')

    for c in t.children:
        _print_tree(output, c, i+' ')


def main():
    """The main method
    """
    parser = argparse.ArgumentParser(description='process ANANAS report for Ambrosia')
    parser.add_argument('report', type=file, help='the XML report input')
    # not used in this version
    # parser.add_argument('--config', type=file, help='the config file')
    parser.add_argument('--loglevel', choices=['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG'], default='INFO',
                        help='the log level for stderr')
    parser.add_argument('--output', type=argparse.FileType('w'), help='the output file, default is stdout',
                        default=sys.stdout)
    parser.add_argument('--output-type', choices=['serialized', 'none', 'tree', 'interactive'], default='serialized',
                        help='define what should be printed')

    args = parser.parse_args()

    init_logging(args.loglevel)

    xml_tree = ElementTree.parse(codecs.EncodedFile(args.report, 'utf-8', 'utf-8', errors='replace'))
    xml_root = xml_tree.getroot()

    runner = ambrosia.Ambrosia(xml_root, None)
    runner.adjust_times()
    runner.correlate()

    if args.output_type == 'serialized':
        runner.serialize(args.output)
    elif args.output_type == 'tree':
        for e in runner.context.analysis.iter_events(runner.context):
            _print_tree(args.output, e)
    elif args.output_type == 'interactive':
        code.interact(local=locals())

if __name__ == "__main__":
    main()
