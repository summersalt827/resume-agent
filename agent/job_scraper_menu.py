"""Unified job scraper menu — LinkedIn / Wellfound / MyCareersFuture."""

from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt

console = Console()


def run_job_scraper_menu():
    console.print(Panel.fit(
        "[bold cyan]🔍 岗位抓取[/bold cyan]\n"
        "[dim]搜索 LinkedIn / Wellfound / MyCareersFuture 岗位，翻译并加入投递池[/dim]",
        border_style="cyan",
    ))

    while True:
        console.print("\n[bold]请选择平台：[/bold]\n")
        console.print("  [bold]1[/bold]  💼 LinkedIn (领英)")
        console.print("  [bold]2[/bold]  💼 Wellfound (AngelList 初创平台)")
        console.print("  [bold]3[/bold]  🇸🇬 MyCareersFuture (新加坡政府)")
        console.print("  [bold]0[/bold]  ↩ 返回主菜单\n")

        choice = Prompt.ask("请选择", choices=["1", "2", "3", "0"], default="0")

        if choice == "1":
            from agent.linkedin_jobs import run_linkedin_jobs
            run_linkedin_jobs()
        elif choice == "2":
            from agent.wellfound_jobs import run_wellfound_jobs
            run_wellfound_jobs()
        elif choice == "3":
            from agent.mycareersfuture_jobs import run_mycareersfuture_jobs
            run_mycareersfuture_jobs()
        elif choice == "0":
            break
