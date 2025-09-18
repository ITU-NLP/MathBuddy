from datetime import datetime
import logging
from logging import Logger
import sys 
from typing import Self, Type


def _get_print_logger() -> Logger:
    logger = logging.getLogger(__name__)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger


class Timelog:

    def __init__(self, logger: Logger | None = None, message: str | None = None) -> None:
        if logger is None:
            logger = _get_print_logger()
        self.logger = logger
        self.enter_time = None
        self.message = message

    def __enter__(self) -> Self:
        self.enter_time = datetime.now()
        return self


    def __exit__(self, type: Type[BaseException] | None, value: BaseException | None, traceback: object | None) -> bool | None:
        now = datetime.now()
        prev = self.enter_time

        if prev is None:
            d_time = 0.0
        else:
            d_time = (now - prev).seconds * 1000.0

        msg = self.message
        if msg is None:
            self.logger.info(f"Done in {d_time}ms")
        else:
            self.logger.info(f"{msg} done in {d_time}ms")

        return True