"""Optimize/polish an existing resume."""

from rich.console import Console
from rich.prompt import Prompt, Confirm

from agent.client import stream_claude
from utils.resume_parser import extract_text_from_file
from prompts.system_prompts import OPTIMIZE_SYSTEM
from agent.project_experience import load_projects_text
from agent.applicant_tracker import load_feedback_summary, load_feedback_categories

console = Console()


def run_optimize():
    console.print("\n[bold green]✨ 简历优化助手[/bold green]\n")
    path = Prompt.ask("请提供简历文件路径（PDF/TXT）")
    path = path.strip().strip('"')

    try:
        content = extract_text_from_file(path)
    except Exception as e:
        console.print(f"[red]读取文件失败: {e}[/red]")
        return

    console.print(f"[dim]已读取 {len(content)} 字符[/dim]")
    extra = Prompt.ask("有什么特别想优化的方向吗？（留空默认全面优化）", default="")

    msg = f"请优化以下简历：\n\n{content}"

    # Include project experience reference
    projects_text = load_projects_text()
    if projects_text:
        use_projects = Confirm.ask("检测到已保存的项目经验，是否作为优化参考？", default=True)
        if use_projects:
            msg += f"\n\n--- 项目经验参考 ---\n{projects_text}"

    # Include interview feedback for targeted optimization
    feedback_text = load_feedback_summary()
    feedback_cats = load_feedback_categories()
    if feedback_text:
        use_feedback = Confirm.ask(
            "检测到面试反馈记录，是否根据反馈类目进行针对性优化？",
            default=True,
        )
        if use_feedback:
            msg += f"\n\n--- 面试反馈与改进建议 ---\n{feedback_text}"
            msg += f"\n\n--- 反馈类目说明 ---\n"
            msg += "\n".join(f"- {k}：{desc}" for k, desc in feedback_cats)
            msg += "\n\n请根据以上面试反馈，重点关注简历中与反馈类目相关的描述，进行针对性优化。"
    if extra:
        msg += f"\n\n特别关注：{extra}"

    console.print("\n[bold]分析并优化中...[/bold]\n")
    messages = [{"role": "user", "content": msg}]
    buffer: list[str] = []
    for token in stream_claude(messages, system=OPTIMIZE_SYSTEM):
        console.print(token, end="", highlight=False)
        buffer.append(token)
    console.print()
    return "".join(buffer)
