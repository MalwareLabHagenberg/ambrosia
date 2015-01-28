import time
from datetime import datetime
import logging
import random
import string
import json


def get_logger(o):
    assert isinstance(o, object)
    return logging.getLogger(o.__module__ + "." + o.__class__.__name__)


def js_date(date):
    if date is None:
        return None
    assert isinstance(date, datetime)
    
    return time.mktime(date.timetuple()) + date.microsecond * 1e-6


def obj_classname(o):
    assert isinstance(o, object)

    return classname(o.__class__)


def classname(cls):
    assert issubclass(cls, object)

    return cls.__module__ + "." + cls.__name__


def unique_id():
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(16))

def join_command(lst):
    res = []

    for c in lst:
        if ' ' in c or '\'' in c or '"' in c:
            res.append('"' + c.replace('\\', '\\\\').replace('"', '\\\'') + '"')
        else:
            res.append(c)

    return ' '.join(res)


class SerializationError(Exception):
    pass


def _serialize_entry(obj, objs, _serialized_set):
    if obj is None:
        return 0
    elif isinstance(obj, (int, float, basestring)):
        # we use sets, they are faster for "in" operations
        if obj in _serialized_set:
            return objs.index(obj)
        else:
            objs.append(obj)
            _serialized_set.add(obj)
            return len(objs) - 1
    elif isinstance(obj, dict):
        ret = {}
        for k, v in obj.iteritems():
            ret[_serialize_entry(k, objs, _serialized_set)] = _serialize_entry(v, objs, _serialized_set)
        return ret
    elif isinstance(obj, list):
        ret = []
        for x in obj:
            ret.append(_serialize_entry(x, objs, _serialized_set))

        return ret
    else:
        raise SerializationError("invalid type: {}".format(type(obj)))


def serialize_obj(obj):
    objs = [None]

    res = _serialize_entry(obj, objs, set())

    return json.dumps([res, objs])