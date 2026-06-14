"""Daily LinkedIn job scanner — auto-scan + interactive customization."""

import json
import re
import time
from datetime import datetime
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.table import Table

from agent.client import stream_claude
from prompts.system_prompts import LINKEDIN_JD_SYSTEM, CUSTOMIZE_SYSTEM
from utils.resume_parser import extract_text_from_file

console = Console()

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DAILY_JOBS_FILE = DATA_DIR / "daily_jobs.json"
RESUME_DIR = Path(__file__).resolve().parent.parent / "简历"

# Optional dependency
try:
    from ddgs import DDGS
    HAS_DDGS = True
except ImportError:
    try:
        from duckduckgo_search import DDGS
        HAS_DDGS = True
    except ImportError:
        HAS_DDGS = False
        DDGS = None

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False
    requests = None

# ── Configuration ──────────────────────────────────────────────────────────────

# Keywords to search for (English + Chinese)
TARGET_KEYWORDS_EN = ["growth", "operation", "product"]
TARGET_KEYWORDS_CN = ["增长", "运营", "产品"]

# Search configs: (label, query_suffix, timelimit, max_results)
SEARCH_CONFIGS = [
    # Global, past 24 hours
    ("Global 24h", "", "d", 10),
    # Singapore, past 24 hours
    ("Singapore 24h", " Singapore", "d", 10),
]

# Keywords to search (combined)
SEARCH_TERMS = TARGET_KEYWORDS_EN + TARGET_KEYWORDS_CN

REQUEST_TIMEOUT = 8
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
}

# Resume paths for customization
RESUME_PATHS = {
    "fintech": RESUME_DIR / "fintech" / "He Yuxian（fintech）.pdf",
    "web3": RESUME_DIR / "web3远程（Growth)" / "He Yuxian（HyperLink-Growth-Lead）.pdf",
}


def _is_linkedin_job_url(url: str) -> bool:
    return "linkedin.com/jobs" in url


def _title_matches_keywords(title: str) -> list[str]:
    """Return list of keywords that match the job title (case-insensitive)."""
    title_lower = title.lower()
    matched = []
    all_kw = TARGET_KEYWORDS_EN + TARGET_KEYWORDS_CN
    for kw in all_kw:
        if kw.lower() in title_lower:
            matched.append(kw)
    return matched


def _search_linkedin(keywords: str, timelimit: str = "w", max_results: int = 10) -> list[dict]:
    """Search LinkedIn jobs via DuckDuckGo. timelimit: 'd', 'w', 'm', 'y'."""
    query = f"site:linkedin.com/jobs/view {keywords}"
    results = []
    try:
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=max_results, timelimit=timelimit):
                url = r.get("href", "")
                if _is_linkedin_job_url(url):
                    results.append({
                        "title": r.get("title", ""),
                        "url": url,
                        "snippet": r.get("body", ""),
                    })
                if len(results) >= max_results:
                    break
    except Exception as e:
        console.print(f"[yellow]搜索 '{keywords}' 出错: {e}[/yellow]")
    return results


def _try_fetch_page(url: str) -> str | None:
    """Try to fetch a LinkedIn job page for full JD text."""
    if not HAS_REQUESTS:
        return None
    try:
        resp = requests.get(url, headers=REQUEST_HEADERS, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 200 and len(resp.text) > 500:
            text = re.sub(r"<[^>]+>", " ", resp.text)
            text = re.sub(r"\s+", " ", text).strip()
            return text[:3000]
    except Exception:
        pass
    return None


def _extract_json_array(text: str) -> list[dict] | None:
    """Try to extract a JSON array from Claude's output."""
    try:
        result = json.loads(text.strip())
        if isinstance(result, list):
            return result
    except json.JSONDecodeError:
        pass

    m = re.search(r"```(?:json)?\s*(\[.+?\])\s*```", text, re.DOTALL)
    if m:
        try:
            result = json.loads(m.group(1))
            if isinstance(result, list):
                return result
        except json.JSONDecodeError:
            pass

    m = re.search(r"\[.*\]", text, re.DOTALL)
    if m:
        try:
            result = json.loads(m.group(0))
            if isinstance(result, list):
                return result
        except json.JSONDecodeError:
            pass

    return None


def _translate_jobs(raw_jobs: list[dict]) -> list[dict]:
    """Send job snippets to Claude for structured extraction and Chinese translation."""
    if not raw_jobs:
        return []

    lines = ["请分析以下 LinkedIn 职位搜索结果片段，提取结构化信息并翻译为中文：\n"]
    for i, j in enumerate(raw_jobs):
        snippet = j.get("snippet", "")[:500]
        lines.append(f"--- 职位 {i} ---")
        lines.append(f"标题: {j.get('title', '')}")
        lines.append(f"链接: {j.get('url', '')}")
        lines.append(f"片段: {snippet}")
        lines.append("")

    msg = "\n".join(lines)
    messages = [{"role": "user", "content": msg}]
    buffer: list[str] = []
    for token in stream_claude(messages, system=LINKEDIN_JD_SYSTEM):
        buffer.append(token)
    full_response = "".join(buffer)

    parsed = _extract_json_array(full_response)
    if parsed:
        return parsed

    # Fallback: minimal records from raw data
    records = []
    for i, j in enumerate(raw_jobs):
        title = j.get("title", "")
        records.append({
            "index": i,
            "company": "",
            "position": title,
            "location": "",
            "requirements_cn": j.get("snippet", ""),
            "salary_estimate": "",
        })
    return records


def run_daily_scan(silent: bool = False) -> list[dict]:
    """Non-interactive scan: search all keyword combos, filter, translate, save.

    Returns the list of matched & translated jobs.
    """
    if not HAS_DDGS:
        if not silent:
            console.print("[red]缺少依赖 ddgs，请运行: pip install ddgs[/red]")
        return []

    if not silent:
        console.print(Panel.fit(
            "[bold cyan]🔍 Daily Job Scanner[/bold cyan]\n"
            "[dim]搜索 Global (24h) + Singapore (7d) 的 Growth / Operation / Product 岗位[/dim]",
            border_style="cyan",
        ))

    # Phase 1: Collect all raw job results
    all_raw: dict[str, dict] = {}  # url -> job dict

    for kw in SEARCH_TERMS:
        for label, suffix, timelimit, max_results in SEARCH_CONFIGS:
            query = kw + suffix
            if not silent:
                console.print(f"[dim]搜索: {query} (timelimit={timelimit})...[/dim]")
            results = _search_linkedin(query, timelimit=timelimit, max_results=max_results)
            for job in results:
                url = job.get("url", "")
                if url and url not in all_raw:
                    matched_kw = _title_matches_keywords(job.get("title", ""))
                    if matched_kw:
                        job["matched_keywords"] = matched_kw
                        job["source"] = label
                        all_raw[url] = job
            # Small delay to avoid rate limiting
            time.sleep(1.5)

    raw_list = list(all_raw.values())
    if not silent:
        console.print(f"[green]搜索到 {len(raw_list)} 个匹配岗位（关键词命中）[/green]")

    if not raw_list:
        return []

    # Phase 2: Try to fetch full page content
    for job in raw_list:
        content = _try_fetch_page(job.get("url", ""))
        if content:
            job["page_content"] = content

    # Phase 3: Translate via Claude (batch all together)
    if not silent:
        console.print("[bold]正在通过 Claude 翻译和分析岗位...[/bold]")
    parsed_jobs = _translate_jobs(raw_list)

    # Phase 4: Merge matched_keywords and source back into parsed jobs
    for i, job in enumerate(parsed_jobs):
        raw_idx = job.get("index", i)
        if isinstance(raw_idx, int) and raw_idx < len(raw_list):
            job["matched_keywords"] = raw_list[raw_idx].get("matched_keywords", [])
            job["source"] = raw_list[raw_idx].get("source", "")
            job["url"] = raw_list[raw_idx].get("url", "")

    # Phase 5: Score and sort
    for job in parsed_jobs:
        matched = job.get("matched_keywords", [])
        title = job.get("position", "")
        # Higher score = more keyword matches + title relevance
        score = len(matched) * 10
        # Bonus for exact keyword in position title
        for kw in TARGET_KEYWORDS_EN + TARGET_KEYWORDS_CN:
            if kw.lower() in title.lower():
                score += 5
        job["relevance_score"] = score

    parsed_jobs.sort(key=lambda j: j.get("relevance_score", 0), reverse=True)

    # Phase 6: Assign sequence numbers
    for i, job in enumerate(parsed_jobs):
        job["seq"] = i + 1

    # Phase 7: Save
    payload = {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total": len(parsed_jobs),
        "jobs": parsed_jobs,
    }
    DAILY_JOBS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DAILY_JOBS_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    if not silent:
        console.print(f"[bold green]已保存 {len(parsed_jobs)} 个岗位到 {DAILY_JOBS_FILE}[/bold green]")

    return parsed_jobs


def _load_daily_jobs() -> dict | None:
    """Load saved daily jobs, or None if not available."""
    if not DAILY_JOBS_FILE.exists():
        return None
    with open(DAILY_JOBS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _show_jobs_table(jobs: list[dict]):
    """Display curated job list in a Rich table."""
    table = Table(title="重点关注岗位清单", show_lines=True)
    table.add_column("#", style="bold", width=4)
    table.add_column("来源", style="magenta", width=10)
    table.add_column("公司", style="cyan")
    table.add_column("职位", style="green")
    table.add_column("地点", max_width=12)
    table.add_column("匹配关键词", style="yellow", max_width=18)
    table.add_column("要求摘要", max_width=50)

    for j in jobs:
        req = j.get("requirements_cn", "")
        if len(req) > 60:
            req = req[:57] + "..."
        matched = ", ".join(j.get("matched_keywords", []))
        table.add_row(
            str(j.get("seq", "")),
            j.get("source", ""),
            j.get("company", "") or "—",
            j.get("position", "") or "—",
            j.get("location", "") or "—",
            matched,
            req or "—",
        )
    console.print(table)


def _pick_resume() -> str | None:
    """Let user pick which resume to use for customization."""
    console.print("\n[bold]选择简历版本：[/bold]")
    console.print("  [bold]1[/bold]  Fintech — He Yuxian（fintech）")
    console.print("  [bold]2[/bold]  Web3 — He Yuxian（HyperLink-Growth-Lead）")
    console.print("  [bold]0[/bold]  取消")
    choice = Prompt.ask("请选择", choices=["1", "2", "0"], default="1")
    if choice == "1":
        return "fintech"
    elif choice == "2":
        return "web3"
    return None


def _customize_for_job(job: dict, resume_type: str):
    """Customize the selected resume for a specific job."""
    resume_path = RESUME_PATHS.get(resume_type)
    if not resume_path or not resume_path.exists():
        console.print(f"[red]简历文件不存在: {resume_path}[/red]")
        return

    try:
        resume_content = extract_text_from_file(str(resume_path))
    except Exception as e:
        console.print(f"[red]读取简历失败: {e}[/red]")
        return

    jd_text = f"""公司: {job.get('company', '')}
职位: {job.get('position', '')}
地点: {job.get('location', '')}
薪资: {job.get('salary_estimate', '')}
要求: {job.get('requirements_cn', '')}"""

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

    console.print(f"\n[bold]🎯 正在为 [cyan]{job.get('company', '')} — {job.get('position', '')}[/cyan] 定制简历...[/bold]\n")
    messages = [{"role": "user", "content": msg}]
    for token in stream_claude(messages, system=CUSTOMIZE_SYSTEM):
        console.print(token, end="", highlight=False)
    console.print()


def _show_job_detail(job: dict):
    """Display full job detail in a panel."""
    content = (
        f"[bold]公司：[/bold]{job.get('company', '—')}\n"
        f"[bold]职位：[/bold]{job.get('position', '—')}\n"
        f"[bold]地点：[/bold]{job.get('location', '—')}\n"
        f"[bold]薪资：[/bold]{job.get('salary_estimate', '—')}\n"
        f"[bold]来源：[/bold]{job.get('source', '—')}\n"
        f"[bold]匹配关键词：[/bold]{', '.join(job.get('matched_keywords', []))}\n\n"
        f"[bold]JD 摘要：[/bold]\n{job.get('requirements_cn', '—')}"
    )
    console.print(Panel(content, title=f"岗位详情 #{job.get('seq', '?')}", border_style="cyan"))


def run_interactive():
    """Interactive mode: show curated list, let user pick a job, customize resume."""
    data = _load_daily_jobs()
    if not data or not data.get("jobs"):
        console.print(Panel.fit(
            "[yellow]暂无每日岗位数据。[/yellow]\n"
            "[dim]请先运行每日扫描，或等待上午 10 点自动扫描。[/dim]\n\n"
            "可以手动触发扫描：选择 [bold]1. 立即扫描[/bold]",
            border_style="yellow",
            title="📭 暂无数据",
        ))
        if Confirm.ask("\n是否立即执行扫描？", default=True):
            jobs = run_daily_scan(silent=False)
            if not jobs:
                console.print("[yellow]未找到匹配的岗位。[/yellow]")
                return
            data = _load_daily_jobs()
        else:
            return

    if not data or not data.get("jobs"):
        return

    jobs = data["jobs"]
    generated_at = data.get("generated_at", "未知")

    console.print(Panel.fit(
        f"[bold cyan]📋 重点关注岗位清单[/bold cyan]\n"
        f"[dim]扫描时间: {generated_at} | 共 {len(jobs)} 个岗位 | "
        f"关键词: {', '.join(TARGET_KEYWORDS_EN + TARGET_KEYWORDS_CN)}[/dim]",
        border_style="cyan",
    ))

    _show_jobs_table(jobs)

    while True:
        console.print(
            "\n[dim]输入岗位编号查看详情并定制简历，输入 [bold]r[/bold] 重新扫描，输入 [bold]0[/bold] 返回：[/dim]"
        )
        sel = Prompt.ask("请选择", default="0")

        if sel == "0":
            break
        elif sel.lower() == "r":
            console.print("[bold]重新扫描中...[/bold]")
            run_daily_scan(silent=False)
            data = _load_daily_jobs()
            if data and data.get("jobs"):
                jobs = data["jobs"]
                _show_jobs_table(jobs)
            else:
                console.print("[yellow]未找到匹配岗位。[/yellow]")
                break
            continue

        try:
            seq = int(sel)
            job = next((j for j in jobs if j.get("seq") == seq), None)
            if not job:
                console.print(f"[red]无效编号: {seq}，请输入表格中 # 列的编号。[/red]")
                continue
        except ValueError:
            console.print("[red]请输入数字编号。[/red]")
            continue

        # Show detail and customize
        _show_job_detail(job)

        resume_type = _pick_resume()
        if resume_type:
            _customize_for_job(job, resume_type)

        # Ask if user wants to continue
        if not Confirm.ask("\n是否继续查看其他岗位？", default=True):
            break


def run_daily_job_menu():
    """Entry point for the CLI menu."""
    console.print(Panel.fit(
        "[bold cyan]🔍 每日岗位扫描与定制[/bold cyan]\n"
        "[dim]自动扫描 Global (24h) + Singapore (7d) Growth/Operation/Product 岗位 → 定制简历[/dim]",
        border_style="cyan",
    ))

    # Check current data
    data = _load_daily_jobs()
    if data and data.get("jobs"):
        generated_at = data.get("generated_at", "未知")
        console.print(f"\n[dim]上次扫描: {generated_at} | 共 {data['total']} 个岗位[/dim]")

    console.print("\n[bold]请选择操作：[/bold]")
    console.print("  [bold]1[/bold]  📋 查看岗位清单 & 定制简历")
    console.print("  [bold]2[/bold]  🔄 立即执行新扫描")
    console.print("  [bold]0[/bold]  ⬅️  返回主菜单")

    choice = Prompt.ask("请选择", choices=["1", "2", "0"], default="1")

    if choice == "1":
        run_interactive()
    elif choice == "2":
        run_daily_scan(silent=False)
        console.print("\n[green]扫描完成！[/green]")
        if Confirm.ask("是否查看结果并定制简历？", default=True):
            run_interactive()
    elif choice == "0":
        return
