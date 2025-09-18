import json
from pathlib import Path
from typing import Union, IO, TypeVar, Callable

from tutor.util.types import JsonResult

_T = TypeVar("_T")

def load(source: Union[str, Path, IO]) -> JsonResult:
    """
    Load JSON data from a file path or a file-like object.
    :param source: The file path to the JSON file or an open file-like object.
    :type source: (str | Path | IO)
    :return: The parsed JSON data.
    """
    if isinstance(source, (str, Path)):
        with open(source, 'r', encoding='utf-8') as f:
            return json.load(f)
    else:
        return json.load(source)


def load_or_default(source: Union[str, Path, IO], default: _T | Callable[[], _T], default_on_none: bool = False) -> JsonResult | _T:
    """
    :param source: The file path to the JSON file or an open file-like object.
    :type source: (str | Path | IO)
    :param default: The default value to return if the file does not exist or cannot be loaded. If a callable with no
    parameters is provided, the result of calling it will be returned instead.
    :type default: _T | Callable[[], _T]
    :param default_on_none: Whether the default value should be returned if JSON loads a ``None`` value.
    :type default_on_none: bool
    :return: The parsed JSON data if the source can be loaded; otherwise the default value.
    """
    try:
        result = load(source)
        if not default_on_none or result is not None:
            return result
    except (OSError, json.decoder.JSONDecodeError):
        pass
    if isinstance(default, Callable):
        return default()
    return default