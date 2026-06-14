"""Manage project experience entries (add / list / delete)."""

import json
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.table import Table

console = Console()

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "projects.json"

FIELDS = [
    ("name", "项目名称"),
    ("role", "你的角色"),
    ("period", "时间周期（如 2024.03 - 2024.08）"),
    ("tech_stack", "技术栈（如 Python, React, PostgreSQL）"),
    ("description", "项目描述与主要成果"),
]


def _load() -> list[dict]:
    if not DATA_FILE.exists():
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save(projects: list[dict]):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(projects, f, ensure_ascii=False, indent=2)


def add_project():
    console.print("\n[bold]📋 录入项目经验[/bold]\n")
    project = {}
    for key, label in FIELDS:
        value = Prompt.ask(f"  [cyan]{label}[/cyan]")
        if value:
            project[key] = value
    if not project:
        console.print("[yellow]未提供任何信息，已取消。[/yellow]")
        return
    projects = _load()
    projects.append(project)
    _save(projects)
    console.print(f"[green]已保存项目「{project.get('name', '未命名')}」[/green]")


def list_projects():
    projects = _load()
    if not projects:
        console.print("[yellow]暂无已保存的项目经验。[/yellow]")
        return
    table = Table(title="已保存的项目经验", show_lines=True)
    table.add_column("#", style="bold", width=4)
    table.add_column("项目名称", style="cyan")
    table.add_column("角色", style="green")
    table.add_column("时间")
    table.add_column("技术栈")
    table.add_column("描述", max_width=40)
    for i, p in enumerate(projects, 1):
        table.add_row(
            str(i),
            p.get("name", ""),
            p.get("role", ""),
            p.get("period", ""),
            p.get("tech_stack", ""),
            p.get("description", ""),
        )
    console.print(table)


def delete_project():
    projects = _load()
    if not projects:
        console.print("[yellow]暂无项目经验可删除。[/yellow]")
        return
    list_projects()
    idx = Prompt.ask("请输入要删除的项目编号", default="")
    try:
        idx = int(idx)
        if idx < 1 or idx > len(projects):
            raise ValueError
    except ValueError:
        console.print("[red]无效编号。[/red]")
        return
    removed = projects.pop(idx - 1)
    _save(projects)
    console.print(f"[green]已删除项目「{removed.get('name', '未命名')}」[/green]")


def load_projects_text() -> str:
    """Return formatted project experience text for use in prompts, or empty string."""
    projects = _load()
    if not projects:
        return ""
    lines = ["以下是用户的项目经验参考：\n"]
    for i, p in enumerate(projects, 1):
        parts = [f"【项目 {i}】"]
        if p.get("name"):
            parts.append(f"名称：{p['name']}")
        if p.get("role"):
            parts.append(f"角色：{p['role']}")
        if p.get("period"):
            parts.append(f"时间：{p['period']}")
        if p.get("tech_stack"):
            parts.append(f"技术栈：{p['tech_stack']}")
        if p.get("description"):
            parts.append(f"描述：{p['description']}")
        lines.append(" | ".join(parts))
    return "\n".join(lines)


def _run_notion_sync():
    from utils.notion_sync import is_configured, setup_notion, sync

    if not is_configured():
        console.print("[yellow]未配置 Notion 集成。开始配置...[/yellow]")
        if not setup_notion():
            console.print("[yellow]配置已取消。[/yellow]")
            return
        console.print("[green]Notion 配置完成！[/green]")

    if not Confirm.ask("将从 Notion 同步项目经验，是否继续？", default=True):
        return

    try:
        projects = _load()
        console.print(f"[dim]本地 {len(projects)} 个项目，正在同步...[/dim]")
        updated = sync(projects)
        _save(updated)

        local_only = sum(1 for p in updated if not p.get("notion_synced_at"))
        synced = len(updated) - local_only
        console.print(f"[green]同步完成！共 {len(updated)} 个项目经验 (Notion 关联 {synced} 个)。[/green]")
    except Exception as e:
        console.print(f"[red]同步失败: {e}[/red]")
        console.print("[yellow]本地数据未受影响。请检查 Notion 配置后重试。[/yellow]")


def run_project_experience():
    console.print(Panel.fit(
        "[bold cyan]📂 项目经验管理[/bold cyan]\n"
        "[dim]录入、查看、删除你的项目经验[/dim]",
        border_style="cyan",
    ))

    while True:
        console.print("\n[bold]请选择操作：[/bold]\n")
        console.print("  [bold]1[/bold]  ➕ 录入新项目经验")
        console.print("  [bold]2[/bold]  📋 查看已保存的项目经验")
        console.print("  [bold]3[/bold]  🗑️  删除项目经验")
        console.print("  [bold]4[/bold]  🔄 同步到 Notion")
        console.print("  [bold]0[/bold]  ⬅️  返回主菜单")
        console.print()

        choice = Prompt.ask("请选择", choices=["1", "2", "3", "4", "0"], default="1")
        if choice == "1":
            add_project()
        elif choice == "2":
            list_projects()
        elif choice == "3":
            delete_project()
        elif choice == "4":
            _run_notion_sync()
        elif choice == "0":
            break
