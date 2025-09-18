from datetime import datetime

import requests

from tutor.github.queries import GET_PROJECT_ISSUES_QUERY, GET_PROJECT_REPOSITORIES_QUERY, \
    GET_REPOSITORY_MILESTONES_QUERY
from tutor.github.model import Task, Milestone, Repository


def _is_o_conv(is_organization: bool) -> str:
    return "organization" if is_organization else "user"


def _send_query(gh_token: str, query: str) -> requests.Response:
    headers = {
        "Authorization": f"Bearer {gh_token}",
        "Content-Type": "application/json"
    }

    response = requests.post("https://api.github.com/graphql", headers=headers, json={"query": query})
    return response


def issue_node_to_task(node: dict) -> Task | None:
    try:
        content = node["content"]
        title = content["title"]
        description = content["body"]
        url = content["url"]

        label_content = content["labels"]["nodes"][0]
        label_name = label_content["name"]
        label_color = label_content["color"]
        field_values = node["fieldValues"]["nodes"]

        if not label_color.startswith("#"):
            label_color = "#" + label_color
        start_date = datetime.strptime(field_values[-2]['date'], "%Y-%m-%d")
        end_date = datetime.strptime(field_values[-1]['date'], "%Y-%m-%d")

        return Task(
            title=title,
            description=description,
            label_name=label_name,
            label_color=label_color,
            url=url,
            start_date=start_date,
            end_date=end_date,
        )
    except KeyError:
        pass
    return None


def get_project_tasks(gh_token: str, owner_login: str, project_id: str | int, is_organization: bool = False) -> list[Task] | None:
    project_owner_type = _is_o_conv(is_organization)
    query = GET_PROJECT_ISSUES_QUERY.substitute(
        project_owner_type=project_owner_type,
        project_id=project_id,
        project_owner_login=owner_login,
    )

    response = _send_query(gh_token, query)

    if response.status_code == 200:
        data = response.json()
        try:
            issues = data["data"]["user"]["projectV2"]["items"]["nodes"]
            return [issue_node_to_task(i) for i in issues]
        except KeyError:
            pass
    return None


def repository_node_to_repository(node: dict) -> Repository | None:
    try:
        repository_fields = node["content"]["repository"]
        name = repository_fields["name"]
        owner_login = repository_fields["owner"]["login"]
        url = repository_fields["url"]
        return Repository(name, owner_login, url)
    except KeyError:
        pass
    return None


def get_project_repositories(gh_token: str, owner_login: str, project_id: str | int,
                             is_organization: bool = False) -> list[Repository] | None:
    project_owner_type = _is_o_conv(is_organization)
    query = GET_PROJECT_REPOSITORIES_QUERY.substitute(
        project_owner_type=project_owner_type,
        project_id=project_id,
        project_owner_login=owner_login,
    )

    response = _send_query(gh_token, query)

    if response.status_code == 200:
        data = response.json()
        try:
            repository_nodes = data["data"]["user"]["projectV2"]["items"]["nodes"]
            repositories = []
            for repository_node in repository_nodes:
                cur_repo = repository_node_to_repository(repository_node)
                if cur_repo is not None and cur_repo not in repositories:
                    repositories.append(cur_repo)
            return repositories
        except KeyError:
            pass
    return None


def milestone_node_to_milestone(milestone_node: dict) -> Milestone | None:
    try:
        name = milestone_node["title"]
        description = milestone_node["description"]
        date = datetime.strptime(milestone_node["dueOn"], "%Y-%m-%dT%H:%M:%SZ")
        url = milestone_node["url"]
        return Milestone(name, description, date, url)
    except KeyError:
        pass
    return None


def get_repository_milestones(gh_token: str, owner_login: str, repository_name: str) -> list[Milestone] | None:
    query = GET_REPOSITORY_MILESTONES_QUERY.substitute(
        repository_owner_login=owner_login,
        repository_name=repository_name
    )

    response = _send_query(gh_token, query)

    if response.status_code == 200:
        data = response.json()
        try:
            milestone_nodes = data["data"]["repository"]["milestones"]["nodes"]
            milestones = []
            for milestone_node in milestone_nodes:
                cur_milestone = milestone_node_to_milestone(milestone_node)
                if cur_milestone is not None and cur_milestone not in milestones:
                    milestones.append(cur_milestone)
            return milestones
        except KeyError:
            pass
    return None


def get_project_milestones(gh_token: str, owner_login: str, project_id: str | int, is_organization: bool = False) -> list[Milestone] | None:
    repositories = get_project_repositories(gh_token, owner_login, project_id, is_organization)
    if repositories is None:
        return None

    milestones = []
    for repository in repositories:
        cur_milestones = get_repository_milestones(gh_token, repository.owner_login, repository.name)
        if cur_milestones is not None:
            milestones.extend(cur_milestones)

    return milestones