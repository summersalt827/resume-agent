"""Resume Agent - AI-powered resume assistant CLI."""

from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt

console = Console()


def show_banner():
    console.print(Panel.fit(
        "[bold cyan]📄 Resume Agent[/bold cyan]\n"
        "[dim]AI 简历助手 - 生成 / 优化 / 定制 / 翻译[/dim]",
        border_style="cyan",
    ))


def show_menu():
    console.print("\n[bold]请选择功能：[/bold]\n")
    options = [
        ("1", "📝 生成简历", "从零开始，根据个人信息生成完整简历"),
        ("2", "✨ 优化简历", "分析并润色已有简历，提升专业度"),
        ("3", "📊 简历匹配打分", "根据 JD 对所有简历版本进行匹配度评估和排名"),
        ("4", "🎯 定制简历", "根据目标职位 JD 定制简历内容"),
        ("5", "🌐 翻译简历", "中英文简历互译"),
        ("6", "📂 管理项目经验", "录入/查看/删除/同步项目经验，供优化简历时参考"),
        ("7", "📮 投递与面试管理", "管理投递公司、面试记录与反馈，提取改进建议优化简历"),
        ("8", "🔍 岗位抓取", "搜索 LinkedIn / Wellfound / MyCareersFuture 岗位并加入投递池"),
        ("0", "🚪 退出", ""),
    ]
    for num, label, desc in options:
        desc_part = f"  [dim]- {desc}[/dim]" if desc else ""
        console.print(f"  [bold]{num}[/bold]  {label}{desc_part}")
    console.print()


def main():
    show_banner()

    while True:
        show_menu()
        choice = Prompt.ask("请选择", choices=["1", "2", "3", "4", "5", "6", "7", "8", "0"], default="1")

        try:
            if choice == "1":
                from agent.generator import run_generate
                run_generate()
            elif choice == "2":
                from agent.optimizer import run_optimize
                run_optimize()
            elif choice == "3":
                from agent.matcher import run_matcher
                result = run_matcher()
                if result:
                    resume_path, jd_text = result
                    from agent.customizer import run_customize
                    run_customize(resume_path=resume_path, jd_text=jd_text)
            elif choice == "4":
                from agent.customizer import run_customize
                run_customize()
            elif choice == "5":
                from agent.translator import run_translate
                run_translate()
            elif choice == "6":
                from agent.project_experience import run_project_experience
                run_project_experience()
            elif choice == "7":
                from agent.applicant_tracker import run_applicant_tracker
                run_applicant_tracker()
            elif choice == "8":
                from agent.job_scraper_menu import run_job_scraper_menu
                run_job_scraper_menu()
            elif choice == "0":
                console.print("\n[bold green]再见！祝你求职顺利 🎉[/bold green]\n")
                break
        except KeyboardInterrupt:
            console.print("\n[yellow]已取消[/yellow]")
        except Exception as e:
            console.print(f"\n[red]出错: {e}[/red]")


if __name__ == "__main__":
    main()
