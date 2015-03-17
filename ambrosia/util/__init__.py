import time
from datetime import datetime
import logging
import random
import string
import json

__author__ = 'Wolfgang Ettlinger'


def get_logger(o):
    """Create a logger for a object.

    Args:
        o (object): the `self` reference of a object
    """
    assert isinstance(o, object)
    return logging.getLogger(o.__module__ + "." + o.__class__.__name__)


def js_date(date):
    """Converts a datetime.datetime to a float timestamp for javascript
    """
    if date is None:
        return None
    assert isinstance(date, datetime)
    
    return time.mktime(date.timetuple()) + date.microsecond * 1e-6


def obj_classname(o):
    """Returns the full class name of an object
    """
    assert isinstance(o, object)

    return classname(o.__class__)


def classname(cls):
    """Returns the full class name of a class
    """
    assert issubclass(cls, object)

    return cls.__module__ + "." + cls.__name__


def unique_id():
    """Generates a uniqe id
    """
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(16))


def join_command(lst):
    """Convert a list of arguments (argv) to a command line
    """
    res = []

    for c in lst:
        if ' ' in c or '\'' in c or '"' in c:
            res.append('"' + c.replace('\\', '\\\\').replace('"', '\\\'') + '"')
        else:
            res.append(c)

    return ' '.join(res)


class SerializationError(Exception):
    """Indicates that something went wrong during serialization
    """
    pass


def _serialize_entry(obj, objs, _obj_idx_cache):
    if obj is None:
        return 0
    elif isinstance(obj, (int, float, basestring)):
        # we use sets, they are faster for "in" operations
        if obj in _obj_idx_cache:
            idx = _obj_idx_cache[obj]
            if type(objs[idx]) == type(obj):
                # because 0==False
                return idx

        objs.append(obj)
        _obj_idx_cache[obj] = len(objs) - 1
        return len(objs) - 1
    elif isinstance(obj, dict):
        ret = {}
        for k, v in obj.iteritems():
            ret[_serialize_entry(k, objs, _obj_idx_cache)] = _serialize_entry(v, objs, _obj_idx_cache)
        return ret
    elif isinstance(obj, list) or isinstance(obj, set):
        ret = []
        for x in obj:
            ret.append(_serialize_entry(x, objs, _obj_idx_cache))

        return ret
    else:
        raise SerializationError("invalid type: {}".format(type(obj)))


def serialize_obj(obj):
    """Serialize an object

    Args:
        obj (object): the object to serialize

    Returns a JSON-string containing the "hollow" object and a list with objects. All actual data is striped from the
    object and appended to the objects list.

    For example this function converts the dict:

    .. code-block:: python

        {
            'test': [None, 1, 'test']
        }

    into the following "hollow" object:

    .. code-block:: python

        {
            1: [0, 2, 1]
        }

    and the following objects list:
    .. code-block:: python

        [None, 'test', 1]

    All the data in the "hollow" object references data in the objects list. E.g. `1` references 'test'.

    This type of is used for compression. Since Ambrosia generates a lot of data containing the same string multiple
    times this serialization should reduce the size of the serialized data (since a string only has to be stored once
    in the objects list. E.g. in the example above the string 'test' is contained two times in the original data but
    only once in the objects list.
    """
    objs = [None]

    res = _serialize_entry(obj, objs, {})

    return json.dumps([res, objs])

