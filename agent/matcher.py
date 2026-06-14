"""Match and score all resume versions against a job description."""

from pathlib import Path

from rich.console import Console
from rich.prompt import Prompt, Confirm

from agent.client import stream_claude
from utils.resume_parser import extract_text_from_file
from prompts.system_prompts import MATCHER_SYSTEM

console = Console()

RESUME_DIR = Path(__file__).resolve().parent.parent / "简历"


def _pick_best_file(files: list[Path]) -> Path:
    """Prefer English .md or .pdf files."""
    en_files = [f for f in files if not any('一' <= c <= '鿿' for c in f.stem)]
    pool = en_files or files
    # prefer .md over .pdf for better AI parseability
    md = [f for f in pool if f.suffix == '.md']
    return md[0] if md else pool[0]


def scan_resume_versions() -> dict[str, str]:
    """Scan 简历/ directory, return {version_name: file_path}."""
    versions: dict[str, str] = {}
    if not RESUME_DIR.exists():
        return versions
    for entry in sorted(RESUME_DIR.iterdir()):
        if not entry.is_dir() or entry.name.startswith('.') or entry.name.startswith('面试'):
            continue
        files = [f for f in entry.iterdir() if f.suffix.lower() in ('.md', '.pdf', '.txt')]
        if files:
            versions[entry.name] = str(_pick_best_file(files))
    return versions


def _read_jd() -> str | None:
    """Read JD from user input (double Enter to finish)."""
    console.print("[dim]请粘贴目标职位的 JD（职位描述），输入完成后按两次 Enter 确认：[/dim]\n")
    lines: list[str] = []
    empty_count = 0
    while empty_count < 2:
        line = input()
        if line == "":
            empty_count += 1
        else:
            empty_count = 0
            lines.append(line)
    jd = "\n".join(lines).strip()
    return jd if jd else None


def run_matcher(jd_text: str | None = None) -> tuple[str, str] | None:
    """Match and score all resume versions against a JD.

    Returns (resume_path, jd_text) of the selected version, or None if cancelled.
    """
    console.print("\n[bold cyan]📊 简历匹配打分[/bold cyan]\n")

    versions = scan_resume_versions()
    if not versions:
        console.print("[yellow]未找到任何简历版本，请先在 简历/ 目录下添加简历。[/yellow]")
        return None

    console.print(f"[dim]找到 {len(versions)} 个简历版本: {', '.join(versions.keys())}[/dim]\n")

    if jd_text is None:
        jd_text = _read_jd()

    if not jd_text:
        console.print("[yellow]JD 为空，已取消。[/yellow]")
        return None

    # Extract resume texts
    console.print("[bold]正在提取简历内容...[/bold]\n")
    resume_texts: dict[str, str] = {}
    for name, path in versions.items():
        try:
            text = extract_text_from_file(path)
            resume_texts[name] = text[:4000] + ("..." if len(text) > 4000 else "")
            console.print(f"  [green]✓[/green] {name}")
        except Exception as e:
            console.print(f"  [red]✗[/red] {name}: {e}")

    if not resume_texts:
        return None

    # Build prompt
    resumes_block = ""
    for i, (name, text) in enumerate(resume_texts.items(), 1):
        resumes_block += f"\n## 版本 {i}: {name}\n```\n{text}\n```\n"

    prompt = f"""请评估以下各版本简历与目标 JD 的匹配度。

## 目标职位 JD
{jd_text}

## 简历版本
{resumes_block}

请按评分标准对每个版本逐项打分，最后给出排名和推荐。"""

    console.print("\n[bold]正在分析匹配度...[/bold]\n")
    messages = [{"role": "user", "content": prompt}]

    for token in stream_claude(messages, system=MATCHER_SYSTEM):
        console.print(token, end="", highlight=False)
    console.print()

    # Let user pick version to customize
    version_names = list(versions.keys())
    choices = [str(i + 1) for i in range(len(version_names))] + ["0"]
    console.print("\n[bold]选择要定制的版本：[/bold]")
    for i, name in enumerate(version_names, 1):
        console.print(f"  [bold]{i}[/bold]  {name}")
    console.print(f"  [bold]0[/bold]  跳过，不定制\n")

    choice = Prompt.ask("请选择", choices=choices, default="0")
    if choice == "0":
        return None

    return versions[version_names[int(choice) - 1]], jd_text
