"""Track job applications, interviews, and interview feedback."""

import json
from pathlib import Path
from datetime import datetime

from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.table import Table

console = Console()

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

APPLICATION_FILE = DATA_DIR / "applications.json"
INTERVIEW_FILE = DATA_DIR / "interviews.json"
FEEDBACK_FILE = DATA_DIR / "resume_feedback.json"

# Application status options
APP_STATUSES = [
    ("待投递", "待投递"),
    ("已投递", "已投递"),
    ("简历筛选", "简历筛选中"),
    ("笔试", "笔试中"),
    ("一面", "一面"),
    ("二面", "二面"),
    ("三面", "三面/HR面"),
    ("录用", "录用"),
    ("已拒绝", "已拒绝"),
    ("不合适", "不合适"),
]

# Feedback categories (used in interviews and resume optimization)
FEEDBACK_CATEGORIES = [
    ("项目深度", "项目经验深度与复杂度"),
    ("技术广度", "技术栈广度与前沿技术了解"),
    ("系统设计", "系统设计与架构能力"),
    ("问题解决", "问题拆解与解决思路"),
    ("业务理解", "业务理解与产品思维"),
    ("沟通表达", "沟通表达与逻辑条理"),
    ("算法编码", "算法与编码能力"),
    ("综合素质", "综合素质与文化匹配"),
]

APPLICATION_FIELDS = [
    ("company", "公司名称"),
    ("position", "岗位名称"),
    ("channel", "投递渠道"),
    ("resume_version", "简历版本（PDF）"),
    ("location", "工作地点（可选，留空跳过）", True),
    ("url", "招聘信息链接（可选，留空跳过）", True),
    ("salary", "薪资范围（可选，留空跳过）", True),
    ("status", "当前状态"),
    ("applied_date", "投递日期（如 2024.05.06）"),
    ("notes", "备注信息（可选，留空跳过）", True),
]

# Channels grouped by direction (matches job-application-preferences)
CHANNELS = [
    "小羚 (Smart Deer)",
    "Boss直聘",
    "LinkedIn (领英)",
    "Welljob",
    "公司官网",
    "小羚不卷",
    # Web3 startup channels
    "CryptoJobsList",
    "Web3.career",
    "DeJob / PANews",
    # AI/tech startup channels
    "AngelList (Wellfound)",
    "Y Combinator (Work at a Startup)",
    "即刻",
    "Product Hunt",
    # General/remote
    "Remote OK",
    "Upwork / Toptal",
    # Other
    "Twitter/X",
    "其他小众平台",
    "内推",
    "猎头",
]

RESUME_DIR = Path(__file__).resolve().parent.parent / "简历"


def _scan_resume_pdfs() -> list[str]:
    """Scan 简历/ folder for all PDF resumes, return relative paths."""
    pdfs = []
    if RESUME_DIR.exists():
        for pdf in sorted(RESUME_DIR.rglob("*.pdf")):
            rel = pdf.relative_to(RESUME_DIR)
            pdfs.append(str(rel))
    return pdfs


def _pick_channel() -> str:
    """Pick a channel from the predefined list or enter custom."""
    console.print("\n[cyan]选择投递渠道：[/cyan]")
    for i, ch in enumerate(CHANNELS, 1):
        console.print(f"  [bold]{i}[/bold]  {ch}")
    console.print(f"  [bold]0[/bold]  手动输入")
    choices = [str(i) for i in range(len(CHANNELS) + 1)]
    idx = Prompt.ask("请选择编号", choices=choices)
    idx = int(idx)
    if idx == 0:
        return Prompt.ask("请输入渠道名称")
    return CHANNELS[idx - 1]


def _pick_resume_version() -> str:
    """Pick a resume PDF from the scanned list or enter custom."""
    pdfs = _scan_resume_pdfs()
    console.print("\n[cyan]选择简历版本：[/cyan]")
    if not pdfs:
        console.print("  [dim]未检测到 PDF，请手动输入[/dim]")
        return Prompt.ask("请输入简历版本")
    for i, path in enumerate(pdfs, 1):
        console.print(f"  [bold]{i}[/bold]  {path}")
    console.print(f"  [bold]0[/bold]  手动输入")
    choices = [str(i) for i in range(len(pdfs) + 1)]
    idx = Prompt.ask("请选择编号", choices=choices)
    idx = int(idx)
    if idx == 0:
        return Prompt.ask("请输入简历版本名称")
    return pdfs[idx - 1]

INTERVIEW_FIELDS = [
    ("company", "公司名称"),
    ("position", "岗位名称"),
    ("round", "面试轮次（如 一面/二面/HR面）"),
    ("date", "面试日期（如 2024.05.06）"),
    ("duration", "面试时长（如 60分钟）"),
    ("format", "面试形式（线上/线下/电话）"),
    ("interviewer", "面试官（可选，留空跳过）", True),
    ("notes", "面试内容记录（可选，留空跳过）", True),
]

FEEDBACK_FIELDS = [
    ("company", "公司名称"),
    ("position", "岗位名称"),
    ("round", "面试轮次"),
    ("date", "反馈日期（如 2024.05.06）"),
    ("categories", "反馈类目（可多选，如 1,2,3）"),
    ("summary", "反馈总结"),
    ("suggestions", "简历/面试改进建议"),
]


def _load_json(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_json(path: Path, data: list[dict]):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _show_status_map():
    for i, (val, label) in enumerate(APP_STATUSES, 1):
        console.print(f"  [dim]{i}[/dim]  {label}")


def _pick_status() -> str:
    console.print("\n[cyan]选择当前状态：[/cyan]")
    for i, (val, label) in enumerate(APP_STATUSES, 1):
        console.print(f"  [bold]{i}[/bold]  {label}")
    idx = Prompt.ask("请选择编号", choices=[str(i) for i in range(1, len(APP_STATUSES) + 1)])
    return APP_STATUSES[int(idx) - 1][0]


def _show_category_map():
    for i, (key, label) in enumerate(FEEDBACK_CATEGORIES, 1):
        console.print(f"  [dim]{i}[/dim]  {key} — {label}")


def _pick_categories() -> list[str]:
    console.print("\n[cyan]选择反馈类目（输入编号，多选用逗号分隔，如 1,2,3）：[/cyan]")
    _show_category_map()
    raw = Prompt.ask("请选择")
    indices = []
    for part in raw.replace("，", ",").split(","):
        part = part.strip()
        if part.isdigit():
            idx = int(part)
            if 1 <= idx <= len(FEEDBACK_CATEGORIES):
                indices.append(FEEDBACK_CATEGORIES[idx - 1][0])
    return indices


# ── Applications ──────────────────────────────────────────────────────────────

def add_application():
    console.print("\n[bold]📨 录入投递记录[/bold]\n")
    record = {}
    for spec in APPLICATION_FIELDS:
        key, label = spec[0], spec[1]
        optional = len(spec) > 2 and spec[2]
        if key == "status":
            record[key] = _pick_status()
        elif key == "channel":
            record[key] = _pick_channel()
        elif key == "resume_version":
            record[key] = _pick_resume_version()
        else:
            value = Prompt.ask(f"  [cyan]{label}[/cyan]")
            if not value and not optional:
                console.print("[yellow]此项为必填，已跳过。[/yellow]")
                continue
            if value:
                record[key] = value
    if not record:
        console.print("[yellow]未提供任何信息，已取消。[/yellow]")
        return
    if "applied_date" not in record:
        record["applied_date"] = datetime.now().strftime("%Y.%m.%d")
    records = _load_json(APPLICATION_FILE)
    records.append(record)
    _save_json(APPLICATION_FILE, records)
    console.print(f"[green]已保存投递记录「{record.get('company', '')} - {record.get('position', '')}」[/green]")


def list_applications():
    records = _load_json(APPLICATION_FILE)
    if not records:
        console.print("[yellow]暂无投递记录。[/yellow]")
        return
    table = Table(title="投递记录", show_lines=True)
    table.add_column("#", style="bold", width=4)
    table.add_column("公司", style="cyan")
    table.add_column("岗位", style="green")
    table.add_column("渠道", style="magenta", max_width=14)
    table.add_column("简历版本", max_width=20)
    table.add_column("地点", max_width=12)
    table.add_column("状态", style="yellow")
    table.add_column("投递日期", max_width=12)
    table.add_column("链接", max_width=20)
    for i, r in enumerate(records, 1):
        table.add_row(
            str(i),
            r.get("company", ""),
            r.get("position", ""),
            r.get("channel", ""),
            r.get("resume_version", ""),
            r.get("location", ""),
            r.get("status", ""),
            r.get("applied_date", ""),
            r.get("url", ""),
        )
    console.print(table)


def update_application_status():
    records = _load_json(APPLICATION_FILE)
    if not records:
        console.print("[yellow]暂无投递记录。[/yellow]")
        return
    list_applications()
    idx = Prompt.ask("请输入要更新状态的记录编号", default="")
    try:
        idx = int(idx)
        if idx < 1 or idx > len(records):
            raise ValueError
    except ValueError:
        console.print("[red]无效编号。[/red]")
        return
    old = records[idx - 1]
    new_status = _pick_status()
    records[idx - 1]["status"] = new_status
    _save_json(APPLICATION_FILE, records)
    console.print(f"[green]已将「{old.get('company', '')} - {old.get('position', '')}」状态更新为：{new_status}[/green]")


def delete_application():
    records = _load_json(APPLICATION_FILE)
    if not records:
        console.print("[yellow]暂无投递记录可删除。[/yellow]")
        return
    list_applications()
    idx = Prompt.ask("请输入要删除的记录编号", default="")
    try:
        idx = int(idx)
        if idx < 1 or idx > len(records):
            raise ValueError
    except ValueError:
        console.print("[red]无效编号。[/red]")
        return
    removed = records.pop(idx - 1)
    _save_json(APPLICATION_FILE, records)
    console.print(f"[green]已删除记录「{removed.get('company', '')} - {removed.get('position', '')}」[/green]")


# ── Interviews ───────────────────────────────────────────────────────────────

def add_interview():
    console.print("\n[bold]🗓️ 录入面试记录[/bold]\n")
    record = {}
    for spec in INTERVIEW_FIELDS:
        key, label = spec[0], spec[1]
        optional = len(spec) > 2 and spec[2]
        value = Prompt.ask(f"  [cyan]{label}[/cyan]")
        if not value and not optional:
            console.print("[yellow]此项为必填，已跳过。[/yellow]")
            continue
        if value:
            record[key] = value
    if not record:
        console.print("[yellow]未提供任何信息，已取消。[/yellow]")
        return
    if "date" not in record:
        record["date"] = datetime.now().strftime("%Y.%m.%d")
    records = _load_json(INTERVIEW_FILE)
    records.append(record)
    _save_json(INTERVIEW_FILE, records)
    console.print(f"[green]已保存面试记录「{record.get('company', '')} - {record.get('round', '')}」[/green]")


def list_interviews():
    records = _load_json(INTERVIEW_FILE)
    if not records:
        console.print("[yellow]暂无面试记录。[/yellow]")
        return
    table = Table(title="面试记录", show_lines=True)
    table.add_column("#", style="bold", width=4)
    table.add_column("公司", style="cyan")
    table.add_column("岗位", style="green")
    table.add_column("轮次", style="yellow")
    table.add_column("日期", max_width=12)
    table.add_column("时长", max_width=8)
    table.add_column("形式", max_width=8)
    table.add_column("面试官", max_width=12)
    for i, r in enumerate(records, 1):
        table.add_row(
            str(i),
            r.get("company", ""),
            r.get("position", ""),
            r.get("round", ""),
            r.get("date", ""),
            r.get("duration", ""),
            r.get("format", ""),
            r.get("interviewer", ""),
        )
    console.print(table)


def delete_interview():
    records = _load_json(INTERVIEW_FILE)
    if not records:
        console.print("[yellow]暂无面试记录可删除。[/yellow]")
        return
    list_interviews()
    idx = Prompt.ask("请输入要删除的记录编号", default="")
    try:
        idx = int(idx)
        if idx < 1 or idx > len(records):
            raise ValueError
    except ValueError:
        console.print("[red]无效编号。[/red]")
        return
    removed = records.pop(idx - 1)
    _save_json(INTERVIEW_FILE, records)
    console.print(f"[green]已删除面试记录「{removed.get('company', '')} - {removed.get('round', '')}」[/green]")


# ── Resume Feedback ────────────────────────────────────────────────────────────

def add_feedback():
    console.print("\n[bold]💬 录入面试反馈与改进建议[/bold]\n")
    record = {}
    for spec in FEEDBACK_FIELDS:
        key, label = spec[0], spec[1]
        optional = len(spec) > 2 and spec[2]
        if key == "categories":
            record[key] = _pick_categories()
        else:
            value = Prompt.ask(f"  [cyan]{label}[/cyan]")
            if not value and not optional:
                console.print("[yellow]此项为必填，已跳过。[/yellow]")
                continue
            if value:
                record[key] = value
    if not record or not record.get("categories"):
        console.print("[yellow]未提供任何信息，已取消。[/yellow]")
        return
    if "date" not in record:
        record["date"] = datetime.now().strftime("%Y.%m.%d")
    records = _load_json(FEEDBACK_FILE)
    records.append(record)
    _save_json(FEEDBACK_FILE, records)
    console.print(f"[green]已保存反馈记录「{record.get('company', '')} - {record.get('round', '')}」[/green]")


def list_feedback():
    records = _load_json(FEEDBACK_FILE)
    if not records:
        console.print("[yellow]暂无反馈记录。[/yellow]")
        return
    table = Table(title="面试反馈记录", show_lines=True)
    table.add_column("#", style="bold", width=4)
    table.add_column("公司", style="cyan")
    table.add_column("岗位", style="green")
    table.add_column("轮次", style="yellow")
    table.add_column("日期", max_width=12)
    table.add_column("反馈类目", max_width=30)
    for i, r in enumerate(records, 1):
        cats = r.get("categories", [])
        cat_labels = [next((l for k, l in FEEDBACK_CATEGORIES if k == c), c) for c in cats]
        table.add_row(
            str(i),
            r.get("company", ""),
            r.get("position", ""),
            r.get("round", ""),
            r.get("date", ""),
            " / ".join(cat_labels),
        )
    console.print(table)
    # Show details
    console.print("\n[dim]输入编号查看详情：[/dim]")
    sel = Prompt.ask("请选择", default="0")
    try:
        idx = int(sel)
        if 1 <= idx <= len(records):
            r = records[idx - 1]
            cats = r.get("categories", [])
            cat_labels = [next((l for k, l in FEEDBACK_CATEGORIES if k == c), c) for c in cats]
            console.print(Panel(
                f"[bold]公司：[/bold]{r.get('company', '')}\n"
                f"[bold]岗位：[/bold]{r.get('position', '')}\n"
                f"[bold]轮次：[/bold]{r.get('round', '')}\n"
                f"[bold]日期：[/bold]{r.get('date', '')}\n"
                f"[bold]反馈类目：[/bold]{' / '.join(cat_labels)}\n\n"
                f"[bold]反馈总结：[/bold]\n{r.get('summary', '（无）')}\n\n"
                f"[bold]改进建议：[/bold]\n{r.get('suggestions', '（无）')}",
                title=f"反馈详情 #{idx}",
                border_style="cyan",
            ))
    except ValueError:
        pass


def delete_feedback():
    records = _load_json(FEEDBACK_FILE)
    if not records:
        console.print("[yellow]暂无反馈记录可删除。[/yellow]")
        return
    list_feedback()
    idx = Prompt.ask("请输入要删除的记录编号", default="")
    try:
        idx = int(idx)
        if idx < 1 or idx > len(records):
            raise ValueError
    except ValueError:
        console.print("[red]无效编号。[/red]")
        return
    removed = records.pop(idx - 1)
    _save_json(FEEDBACK_FILE, records)
    console.print(f"[green]已删除反馈记录「{removed.get('company', '')} - {removed.get('round', '')}」[/green]")


def load_feedback_summary() -> str:
    """Return a formatted summary of all feedback for use in prompts."""
    records = _load_json(FEEDBACK_FILE)
    if not records:
        return ""
    lines = ["以下是用户的面试反馈与改进建议汇总：\n"]
    for i, r in enumerate(records, 1):
        cats = r.get("categories", [])
        cat_labels = [next((l for k, l in FEEDBACK_CATEGORIES if k == c), c) for c in cats]
        lines.append(f"【反馈 {i}】{r.get('company', '')} - {r.get('round', '')}（{r.get('date', '')}）")
        lines.append(f"  类目：{' / '.join(cat_labels)}")
        if r.get("summary"):
            lines.append(f"  总结：{r.get('summary')}")
        if r.get("suggestions"):
            lines.append(f"  建议：{r.get('suggestions')}")
        lines.append("")
    return "\n".join(lines)


def load_feedback_categories() -> list[tuple[str, str]]:
    """Return the list of feedback categories."""
    return FEEDBACK_CATEGORIES


def add_applications_batch(records: list[dict]) -> int:
    """Add multiple application records to applications.json at once.

    Each record should contain the same fields expected by add_application().
    Returns the number of records added.
    """
    if not records:
        return 0
    existing = _load_json(APPLICATION_FILE)
    existing.extend(records)
    _save_json(APPLICATION_FILE, existing)
    return len(records)


# ── Main entry point ──────────────────────────────────────────────────────────

def run_applicant_tracker():
    console.print(Panel.fit(
        "[bold cyan]📮 投递与面试管理[/bold cyan]\n"
        "[dim]管理投递公司、面试记录与反馈，提取改进建议优化简历[/dim]",
        border_style="cyan",
    ))

    while True:
        console.print("\n[bold]请选择功能：[/bold]\n")
        console.print("  [bold]1[/bold]  📨 投递记录管理（录入/查看/更新/删除）")
        console.print("  [bold]2[/bold]  🗓️ 面试记录管理（录入/查看/删除）")
        console.print("  [bold]3[/bold]  💬 面试反馈录入（录入/查看/删除）")
        console.print("  [bold]4[/bold]  📊 反馈类目说明（查看所有反馈类目及含义）")
        console.print("  [bold]0[/bold]  ⬅️  返回主菜单")
        console.print()

        choice = Prompt.ask("请选择", choices=["1", "2", "3", "4", "0"], default="1")

        if choice == "1":
            _run_applications_menu()
        elif choice == "2":
            _run_interviews_menu()
        elif choice == "3":
            _run_feedback_menu()
        elif choice == "4":
            _show_category_info()
        elif choice == "0":
            break


def _run_applications_menu():
    while True:
        console.print("\n[bold]📨 投递记录管理[/bold]")
        console.print("  [bold]1[/bold]  ➕ 录入新投递")
        console.print("  [bold]2[/bold]  📋 查看投递记录")
        console.print("  [bold]3[/bold]  🔄 更新投递状态")
        console.print("  [bold]4[/bold]  🗑️  删除记录")
        console.print("  [bold]0[/bold]  ⬅️  返回")
        choice = Prompt.ask("请选择", choices=["1", "2", "3", "4", "0"], default="1")
        if choice == "1":
            add_application()
        elif choice == "2":
            list_applications()
        elif choice == "3":
            update_application_status()
        elif choice == "4":
            delete_application()
        elif choice == "0":
            break


def _run_interviews_menu():
    while True:
        console.print("\n[bold]🗓️ 面试记录管理[/bold]")
        console.print("  [bold]1[/bold]  ➕ 录入新面试")
        console.print("  [bold]2[/bold]  📋 查看面试记录")
        console.print("  [bold]3[/bold]  🗑️  删除记录")
        console.print("  [bold]0[/bold]  ⬅️  返回")
        choice = Prompt.ask("请选择", choices=["1", "2", "3", "0"], default="1")
        if choice == "1":
            add_interview()
        elif choice == "2":
            list_interviews()
        elif choice == "3":
            delete_interview()
        elif choice == "0":
            break


def _run_feedback_menu():
    while True:
        console.print("\n[bold]💬 面试反馈管理[/bold]")
        console.print("  [bold]1[/bold]  ➕ 录入新反馈")
        console.print("  [bold]2[/bold]  📋 查看反馈记录")
        console.print("  [bold]3[/bold]  🗑️  删除记录")
        console.print("  [bold]0[/bold]  ⬅️  返回")
        choice = Prompt.ask("请选择", choices=["1", "2", "3", "0"], default="1")
        if choice == "1":
            add_feedback()
        elif choice == "2":
            list_feedback()
        elif choice == "3":
            delete_feedback()
        elif choice == "0":
            break


def _show_category_info():
    console.print(Panel.fit(
        "\n".join(
            f"  [bold]{k}[/bold]  {desc}"
            for k, desc in FEEDBACK_CATEGORIES
        ),
        title="💬 反馈类目说明",
        subtitle="这些类目用于标记面试反馈，并作为简历优化的子方向",
        border_style="cyan",
    ))
