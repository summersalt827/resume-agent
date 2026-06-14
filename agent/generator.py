"""Generate a new resume from user-provided information."""

import re
from pathlib import Path

from rich.console import Console
from rich.prompt import Prompt

from agent.client import stream_claude
from prompts.system_prompts import GENERATE_SYSTEM
from utils.resume_formatter import save_text, save_pdf

console = Console()

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "投递岗位&定制化简历"

RESUME_QUESTIONS = [
    ("name", "姓名 / Name"),
    ("contact", "联系方式（手机/邮箱）/ Contact"),
    ("summary", "个人简介（1-2句话）/ Summary"),
    ("education", "教育背景 / Education（学校、专业、学位、时间）"),
    ("experience", "工作/实习经历 / Experience（公司、职位、时间、主要工作内容）"),
    ("projects", "项目经历 / Projects（项目名称、你的角色、主要成果）"),
    ("skills", "专业技能 / Skills"),
    ("language", "输出语言（中文/英文/both）", "中文"),
]


def collect_info() -> dict[str, str]:
    console.print("\n[bold]📝 请逐项填写简历信息（留空跳过）：[/bold]\n")
    info = {}
    for key, question in RESUME_QUESTIONS:
        default = question[-1] if len(question) > 2 and key == "language" else ""
        value = Prompt.ask(f"  [cyan]{question}[/cyan]", default=default)
        if value:
            info[key] = value
    return info


def format_info(info: dict[str, str]) -> str:
    lines = []
    for key, question in RESUME_QUESTIONS:
        short = question.split("/")[0]
        if key in info:
            lines.append(f"{short}：{info[key]}")
    return "\n".join(lines)


def _clean_md_for_pdf(text: str) -> str:
    """Strip markdown formatting for PDF rendering."""
    # Remove bold markers
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    # Remove italic markers
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    # Replace special chars
    replacements = {
        "→": "->", "≥": ">=", "≤": "<=", "–": "--", "—": "--",
        "“": '"', "”": '"', "‘": "'", "’": "'",
        "•": "-", "·": "-",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def _sanitize_filename(name: str) -> str:
    """Remove characters invalid in filenames."""
    return re.sub(r'[\\/:*?"<>|]', '-', name).strip()


def run_generate():
    console.print("\n[bold green]🚀 简历生成助手[/bold green]\n")
    info = collect_info()
    if not info:
        console.print("[yellow]未提供任何信息，请重试。[/yellow]")
        return

    raw = format_info(info)
    lang = info.get("language", "中文")
    user_msg = f"请根据以下信息生成简历：\n\n{raw}\n\n输出语言：{lang}"

    console.print("\n[bold]生成中...[/bold]\n")
    messages = [{"role": "user", "content": user_msg}]
    buffer: list[str] = []
    for token in stream_claude(messages, system=GENERATE_SYSTEM):
        console.print(token, end="", highlight=False)
        buffer.append(token)
    console.print()

    full_text = "".join(buffer)
    if not full_text.strip():
        console.print("[yellow]生成结果为空，请重试。[/yellow]")
        return

    # ── Save ──────────────────────────────────────────────────────────────
    name = info.get("name", "resume")
    safe_name = _sanitize_filename(name)
    base = f"{safe_name}（通用版）"

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Save markdown
    md_path = OUTPUT_DIR / f"{base}.md"
    save_text(full_text, str(md_path))
    console.print(f"[dim]简历已保存: {md_path}[/dim]")

    # Save PDF
    pdf_path = OUTPUT_DIR / f"{base}.pdf"
    try:
        save_pdf(_clean_md_for_pdf(full_text), str(pdf_path))
        console.print(f"[dim]PDF 已保存: {pdf_path}[/dim]")
    except Exception as e:
        console.print(f"[yellow]PDF 生成失败: {e}[/yellow]")

    # Sync to Obsidian vault
    obsidian_dir = Path.home() / "Library/Mobile Documents/iCloud~md~obsidian/Documents/AI信息源/resume-agent/投递岗位&定制化简历"
    try:
        obsidian_dir.mkdir(parents=True, exist_ok=True)
        save_text(full_text, str(obsidian_dir / f"{base}.md"))
        console.print(f"[dim]已同步到 Obsidian[/dim]")
    except Exception:
        pass

    return full_text
