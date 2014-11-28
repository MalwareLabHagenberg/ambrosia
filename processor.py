#!/usr/bin/env python
# -*- coding: utf-8 -*-
import argparse
import sys
import xml.etree.ElementTree as ET

sys.path.append(".")

import ambrosia


def main():
    parser = argparse.ArgumentParser(description='process ANANAS report for Ambrosia')
    parser.add_argument('report', type=file,
                        help='the XML report input')
    parser.add_argument('--config', type=file,
                        help='the config file')

    args = parser.parse_args()
    
    xmltree = ET.parse(args.report)
    xmlroot = xmltree.getroot()

    analysis = ambrosia.Ambrosia(xmlroot, args.config)
    analysis.adjust_times()
    analysis.correlate()
    print analysis.get_json()

if __name__ == "__main__":
    main()
