from dataclasses import dataclass
from datetime import datetime
from typing import TypedDict


@dataclass
class Milestone:
    name: str
    description: str
    date: datetime
    url: str

class MilestoneDict(TypedDict):
    name: str
    description: str
    date: datetime
    url: str

MilestoneLike = Milestone | MilestoneDict