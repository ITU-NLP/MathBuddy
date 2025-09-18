from dataclasses import dataclass
from datetime import datetime
from typing import TypedDict


@dataclass
class Task:
    title: str
    description: str
    label_name: str
    label_color: str
    url: str
    start_date: datetime
    end_date: datetime


class TaskDict(TypedDict):
    title: str
    description: str
    label_name: str
    label_color: str
    url: str
    start_date: datetime
    end_date: datetime

TaskLike = Task | TaskDict