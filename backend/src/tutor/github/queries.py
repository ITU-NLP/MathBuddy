from string import Template
from typing import Final

GET_PROJECT_ISSUES_QUERY: Final[Template] = Template("""{
  ${project_owner_type}(login: "${project_owner_login}") {
    projectV2(number: ${project_id}) {
      items(first: 100) {
        nodes {
          content {
            ... on Issue {
              title
              url
              body
              labels(first: 1) {
                nodes {
                  name
                  color
                }
              }
            }
          }
          fieldValues(first: 20) {
            nodes {
              ... on ProjectV2ItemFieldDateValue {
                field {
                  ... on ProjectV2FieldCommon {
                    name
                  }
                }
                date
              }
            }
          }
        }
      }
    }
  }
}
""")

GET_PROJECT_REPOSITORIES_QUERY: Final[Template] = Template("""{
  ${project_owner_type}(login: "${project_owner_login}") {
    projectV2(number: ${project_id}) {
      items(first: 100) {
        nodes {
          content {
            ... on Issue {
              repository {
                name
                owner {
                  login
                }
                url
              }
            }
            ... on PullRequest {
              repository {
                name
                owner {
                  login
                }
              }
            }
          }
        }
      }
    }
  }
}
""")

GET_REPOSITORY_MILESTONES_QUERY: Final[Template] = Template("""{
  repository(owner: "${repository_owner_login}", name: "${repository_name}") {
    milestones(first: 100) {
      nodes {
        title
        description
        dueOn
        url
      }
    }
  }
}
""")
