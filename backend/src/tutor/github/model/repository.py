from dataclasses import dataclass
from typing import TypedDict


@dataclass
class Repository:
    name: str
    owner_login: str
    url: str


class RepositoryDict(TypedDict):
    name: str
    owner_login: str
    url: str

RepositoryLike = Repository | RepositoryDict