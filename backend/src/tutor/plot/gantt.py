from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import StrEnum
from typing import Iterable

import matplotlib as mpl
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.ticker import AutoMinorLocator
from matplotlib.typing import ColorType
import pandas as pd

from tutor.github.model import Task, Milestone


def gantt(tasks:  Task | Iterable[Task], milestones: Milestone | Iterable[Milestone] | None = None,
          ax: mpl.axes.Axes | None = None,
          title: str | None = None,
          milestone_color: ColorType | None = None,
          even_row_color: ColorType | None = None,
          odd_row_color: ColorType | None = None) -> mpl.axes.Axes:
    """
    Plots a Gantt chart of the given tasks and milestones.
    Tasks are visualized as horizontal bars while milestones are drawn as vertical lines.
    :param tasks: The tasks to plot. Can also be passed as dictionaries holding the required properties.
    :param milestones: The milestones to plot. Can also be passed as dictionaries holding the required properties.
    :param ax:
    :param title:
    :return:
    """
    if isinstance(tasks, Task):
        tasks = [tasks]

    if milestones is None:
        milestones = []
    elif isinstance(milestones, Milestone):
        milestones = [milestones]
    milestones = sorted(milestones, key=lambda m: m.date)

    if milestone_color is None:
        milestone_color = "#333333"

    if ax is None:
        _, ax = plt.subplots()
    ax.set_title(title)

    df = pd.DataFrame(tasks)
    df["start_date"] = pd.to_datetime(df["start_date"])
    df["end_date"] = pd.to_datetime(df["end_date"])
    df["duration"] = (df["end_date"] - df["start_date"]).dt.total_seconds() / 3600 + 24 # Duration in hours
    df["start_numeric"] = mdates.date2num(df["start_date"])

    min_x = df["start_date"].min()
    min_numeric = mdates.date2num(min_x)
    max_x = df["end_date"].max()
    max_dur = (max_x - min_x).total_seconds() / 3600

    yticks = []
    for i, (idx, row) in enumerate(df.iterrows()):
        if i % 2 == 0:
            if even_row_color is not None:
                ax.broken_barh([(min_numeric, max_dur)], (i - 0.5, 1.0), color=even_row_color)
        elif odd_row_color is not None:
            ax.broken_barh([(min_numeric, max_dur)], (i - 0.5, 1.0), color=odd_row_color)

        ax.broken_barh([(row["start_numeric"], row["duration"] / 24.0)], (i - 0.4, 0.8), color=row["label_color"])
        yticks.append((i, row["title"]))

    for i, milestone in enumerate(milestones):
        cur_start_numeric = mdates.date2num(milestone.date)
        label = milestone.name
        ax.axvline(cur_start_numeric, color=milestone_color, linestyle='--', linewidth=1.0, label=label)
        ax.text(cur_start_numeric, -1.2, label, color=milestone_color, ha='right', va='top', rotation=90)

    ax.set_xlim(min_x, max_x)
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%d.%m"))
    ax.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday=1))
    ax.set_xticklabels(ax.get_xticklabels(), rotation=90)
    ax.grid(axis="x", linestyle="--", alpha=0.7, which="major")

    ax.xaxis.set_minor_locator(AutoMinorLocator(7))
    ax.grid(axis="x", linestyle="--", alpha=0.15, which="minor")

    ax.yaxis.set_inverted(True)
    ax.set_yticks([yt[0] for yt in yticks])
    ax.set_yticklabels([yt[1] for yt in yticks])
    return ax


if __name__ == '__main__':
    def main() -> None:
        import os
        from dotenv import load_dotenv
        from tutor.github import get_project_tasks, get_project_milestones

        load_dotenv()
        gh_token = os.getenv("GITHUB_TOKEN")
        project_owner = os.getenv("GITHUB_PROJECT_OWNER")
        project_id = os.getenv("GITHUB_PROJECT_ID")

        current_date = datetime.now().strftime("%Y-%m-%d")
        filename = f"C:/Users/LeopoldBöss/Git/TutorProject/gantt/{current_date}.svg"

        tasks = get_project_tasks(gh_token, project_owner, project_id)
        milestones = get_project_milestones(gh_token, project_owner, project_id)

        fig, ax = plt.subplots(figsize=(10, 6.18))

        gantt(tasks, milestones, ax=ax, title="Tutor Project Task Planning", odd_row_color="#EEEEEE")

        fig.tight_layout(pad=2.0)
        plt.savefig(filename, format='svg', dpi=300, transparent=False)

    main()