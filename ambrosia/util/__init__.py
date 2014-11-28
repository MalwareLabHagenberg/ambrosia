import time
from datetime import datetime
import logging


def get_logger(o):
    assert isinstance(o, object)
    return logging.getLogger(o.__module__ + "." + o.__class__.__name__)


def js_date(date):
    if date is None:
        return None
    assert isinstance(date, datetime)
    
    return time.mktime(date.timetuple()) + date.microsecond * 1e-6