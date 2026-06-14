"""Customize a resume for a specific job description."""

import re
from pathlib import Path

from rich.console import Console
from rich.prompt import Prompt, Confirm

from agent.client import stream_claude
from utils.resume_parser import extract_text_from_file
from utils.resume_formatter import save_text, save_pdf
from prompts.system_prompts import CUSTOMIZE_SYSTEM
from agent.project_experience import load_projects_text

console = Console()

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "投递岗位&定制化简历"


def _clean_md_for_pdf(text: str) -> str:
    """Strip markdown formatting for PDF rendering."""
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    replacements = {
        "→": "->", "≥": ">=", "≤": "<=", "–": "--", "—": "--",
        "“": '"', "”": '"', "‘": "'", "’": "'",
        "•": "-", "·": "-",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def _sanitize_filename(name: str) -> str:
    return re.sub(r'[\\/:*?"<>|]', '-', name).strip()


def _guess_company_from_jd(jd_text: str) -> str:
    """Try to extract company name from JD text."""
    # Look for common patterns like "Company Name is hiring" or "About {Company}"
    for pattern in [r"About\s+([A-Z][A-Za-z0-9\s]{2,30})(?:\n|\.)", r"([A-Z][a-zA-Z0-9&.\s]{2,30})\s+(?:is|are)\s+(?:looking|hiring|seeking)"]:
        m = re.search(pattern, jd_text)
        if m:
            return m.group(1).strip()
    # Try first line
    first_line = jd_text.strip().split("\n")[0]
    if len(first_line) < 50:
        return first_line.strip()
    return ""


def run_customize(resume_path: str | None = None, jd_text: str | None = None):
    console.print("\n[bold green]🎯 简历定制助手[/bold green]\n")

    if not resume_path:
        resume_path = Prompt.ask("请提供简历文件路径（PDF/TXT/MD）")
    resume_path = resume_path.strip().strip('"')
    try:
        resume_content = extract_text_from_file(resume_path)
    except Exception as e:
        console.print(f"[red]读取简历失败: {e}[/red]")
        return

    if not jd_text:
        console.print("[dim]请粘贴目标职位的 JD（职位描述），输入完成后按两次 Enter 确认：[/dim]\n")
        jd_lines = []
        empty_count = 0
        while empty_count < 2:
            line = input()
            if line == "":
                empty_count += 1
            else:
                empty_count = 0
                jd_lines.append(line)
        jd_text = "\n".join(jd_lines)

    if not jd_text.strip():
        console.print("[yellow]JD 为空，请重试。[/yellow]")
        return

    msg = f"""请根据以下 JD 对简历进行定制化调整。

--- 简历原文 ---
{resume_content}

--- 目标职位 JD ---
{jd_text}

请按以下格式输出：
1. JD 关键词分析
2. 匹配度评估（1-10分）
3. 定制后的完整简历
"""

    projects_text = load_projects_text()
    if projects_text:
        use_projects = Confirm.ask("检测到已保存的项目经验，是否作为定制参考？", default=True)
        if use_projects:
            msg += f"\n--- 项目经验参考 ---\n{projects_text}\n"

    console.print("\n[bold]分析并定制中...[/bold]\n")
    messages = [{"role": "user", "content": msg}]
    buffer: list[str] = []
    for token in stream_claude(messages, system=CUSTOMIZE_SYSTEM):
        console.print(token, end="", highlight=False)
        buffer.append(token)
    console.print()

    full_text = "".join(buffer)
    if not full_text.strip():
        console.print("[yellow]定制结果为空，请重试。[/yellow]")
        return

    # ── Save ──────────────────────────────────────────────────────────────
    company = _guess_company_from_jd(jd_text)
    if not company:
        company = Prompt.ask("\n[cyan]请输入目标公司名（用于文件命名）[/cyan]").strip()
        if not company:
            company = "定制版"

    safe_company = _sanitize_filename(company)
    # Try to extract candidate name from resume
    name_match = re.search(r"#\s*(\S+)", full_text) or re.search(r"^(\S+)", full_text)
    candidate_name = name_match.group(1) if name_match else "Candidate"
    if candidate_name.startswith("#"):
        candidate_name = candidate_name[1:]
    base = _sanitize_filename(f"{candidate_name}（{safe_company}）")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Save markdown
    md_path = OUTPUT_DIR / f"{base}.md"
    save_text(full_text, str(md_path))
    console.print(f"\n[dim]简历已保存: {md_path}[/dim]")

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
