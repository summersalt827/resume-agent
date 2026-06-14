"""Translate resume between Chinese and English."""

from rich.console import Console
from rich.prompt import Prompt

from agent.client import stream_claude
from utils.resume_parser import extract_text_from_file
from prompts.system_prompts import TRANSLATE_SYSTEM

console = Console()


def run_translate():
    console.print("\n[bold green]🌐 简历翻译助手[/bold green]\n")
    choice = Prompt.ask(
        "选择输入方式",
        choices=["1", "2"],
        default="1",
    )
    if choice == "1":
        path = Prompt.ask("请提供简历文件路径（PDF/TXT）").strip().strip('"')
        try:
            content = extract_text_from_file(path)
        except Exception as e:
            console.print(f"[red]读取文件失败: {e}[/red]")
            return
    else:
        console.print("[dim]粘贴简历内容，完成后按两次 Enter：[/dim]\n")
        lines = []
        empty_count = 0
        while empty_count < 2:
            line = input()
            if line == "":
                empty_count += 1
            else:
                empty_count = 0
                lines.append(line)
        content = "\n".join(lines)

    if not content.strip():
        console.print("[yellow]内容为空，请重试。[/yellow]")
        return

    direction = Prompt.ask("翻译方向", choices=["1", "2", "3"], default="1")
    dir_text = {"1": "中文→英文", "2": "英文→中文", "3": "自动判断"}[direction]
    msg = f"翻译方向：{dir_text}\n\n{content}"

    console.print("\n[bold]翻译中...[/bold]\n")
    messages = [{"role": "user", "content": msg}]
    buffer: list[str] = []
    for token in stream_claude(messages, system=TRANSLATE_SYSTEM):
        console.print(token, end="", highlight=False)
        buffer.append(token)
    console.print()
    return "".join(buffer)
