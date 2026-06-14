"""Search LinkedIn jobs, translate JDs, and add to application pool."""

import json
import re
from datetime import datetime

from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.table import Table

from agent.client import stream_claude
from prompts.system_prompts import LINKEDIN_JD_SYSTEM
from agent.applicant_tracker import add_applications_batch, _load_json, APPLICATION_FILE

console = Console()

# Optional dependency: duckduckgo_search (ddgs is the newer package name)
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

# Optional dependency: requests (for Hail Mary page fetch)
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False
    requests = None

MAX_RESULTS = 10
REQUEST_TIMEOUT = 8
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}


def _is_linkedin_job_url(url: str) -> bool:
    return "linkedin.com/jobs" in url


def _search_linkedin(keywords: str) -> list[dict]:
    """Search LinkedIn jobs via DuckDuckGo, filtered to the past week. Returns list of {title, url, snippet}."""
    # Target individual job postings with /jobs/view/, time-filtered to past week
    query = f"site:linkedin.com/jobs/view {keywords}"
    results = []
    try:
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=MAX_RESULTS, timelimit="w"):
                url = r.get("href", "")
                if _is_linkedin_job_url(url):
                    results.append({
                        "title": r.get("title", ""),
                        "url": url,
                        "snippet": r.get("body", ""),
                    })
                if len(results) >= MAX_RESULTS:
                    break
    except Exception as e:
        console.print(f"[yellow]搜索过程出错: {e}[/yellow]")
    return results


def _try_fetch_page(url: str) -> str | None:
    """Try to fetch a LinkedIn job page. Almost always returns None due to bot blocking."""
    if not HAS_REQUESTS:
        return None
    try:
        resp = requests.get(url, headers=REQUEST_HEADERS, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 200 and len(resp.text) > 500:
            # Crude HTML-to-text: strip tags
            text = re.sub(r"<[^>]+>", " ", resp.text)
            text = re.sub(r"\s+", " ", text).strip()
            return text[:3000]
    except Exception:
        pass
    return None


def _extract_json_array(text: str) -> list[dict] | None:
    """Try to extract a JSON array from Claude's output. Multiple fallback strategies."""
    # Strategy 1: direct JSON parse
    try:
        result = json.loads(text.strip())
        if isinstance(result, list):
            return result
    except json.JSONDecodeError:
        pass

    # Strategy 2: extract from markdown code block
    m = re.search(r"```(?:json)?\s*(\[.+?\])\s*```", text, re.DOTALL)
    if m:
        try:
            result = json.loads(m.group(1))
            if isinstance(result, list):
                return result
        except json.JSONDecodeError:
            pass

    # Strategy 3: find any JSON array in the text
    m = re.search(r"\[.*\]", text, re.DOTALL)
    if m:
        try:
            result = json.loads(m.group(0))
            if isinstance(result, list):
                return result
        except json.JSONDecodeError:
            pass

    return None


def _build_fallback_jobs(raw_jobs: list[dict]) -> list[dict]:
    """Build minimal job records from raw search results when JSON parsing fails."""
    records = []
    for i, j in enumerate(raw_jobs):
        title = j.get("title", "")
        # Try to split "Company hiring Position" or similar patterns
        parts = [p.strip() for p in title.replace(" hiring ", " | ").split(" | ")]
        company = parts[0] if len(parts) >= 1 else ""
        position = parts[1] if len(parts) >= 2 else title
        records.append({
            "index": i,
            "company": company,
            "position": position,
            "location": "",
            "requirements_cn": j.get("snippet", ""),
            "salary_estimate": "",
        })
    return records


def _translate_jobs(raw_jobs: list[dict]) -> list[dict]:
    """Send job snippets to Claude for translation and structured extraction."""
    if not raw_jobs:
        return []

    # Build prompt with all job snippets
    lines = ["请分析以下 LinkedIn 职位搜索结果片段，提取结构化信息并翻译为中文：\n"]
    for i, j in enumerate(raw_jobs):
        snippet = j.get("snippet", "")[:500]
        lines.append(f"--- 职位 {i} ---")
        lines.append(f"标题: {j.get('title', '')}")
        lines.append(f"链接: {j.get('url', '')}")
        lines.append(f"片段: {snippet}")
        lines.append("")

    msg = "\n".join(lines)

    console.print("\n[bold]正在翻译和分析岗位信息...[/bold]\n")
    messages = [{"role": "user", "content": msg}]
    buffer: list[str] = []
    for token in stream_claude(messages, system=LINKEDIN_JD_SYSTEM):
        console.print(token, end="", highlight=False)
        buffer.append(token)
    console.print()

    full_response = "".join(buffer)
    parsed = _extract_json_array(full_response)

    if parsed:
        return parsed

    # Fallback: build minimal records from raw data
    console.print("[yellow]JSON 解析失败，使用原始搜索数据。[/yellow]")
    return _build_fallback_jobs(raw_jobs)


def _show_jobs_table(jobs: list[dict]):
    """Display parsed jobs in a Rich table."""
    table = Table(title="LinkedIn 最新岗位", show_lines=True)
    table.add_column("#", style="bold", width=3)
    table.add_column("公司", style="cyan")
    table.add_column("职位", style="green")
    table.add_column("地点", max_width=14)
    table.add_column("薪资", max_width=14)
    table.add_column("要求摘要", max_width=50)

    for i, j in enumerate(jobs):
        req = j.get("requirements_cn", "")
        if len(req) > 60:
            req = req[:57] + "..."
        table.add_row(
            str(i + 1),
            j.get("company", "") or "—",
            j.get("position", "") or "—",
            j.get("location", "") or "—",
            j.get("salary_estimate", "") or "—",
            req or "—",
        )
    console.print(table)


def _parse_selection(raw: str, max_idx: int) -> list[int]:
    """Parse comma-separated user input into 0-based indices."""
    indices = []
    for part in raw.replace("，", ",").split(","):
        part = part.strip()
        if part.isdigit():
            idx = int(part) - 1
            if 0 <= idx < max_idx and idx not in indices:
                indices.append(idx)
    return sorted(indices)


def _deduplicate_by_url(records: list[dict]) -> list[dict]:
    """Remove records whose URL already exists in the application pool."""
    existing = _load_json(APPLICATION_FILE)
    existing_urls = {r.get("url", "") for r in existing if r.get("url")}
    deduped = []
    skipped = 0
    for r in records:
        if r.get("url") in existing_urls:
            skipped += 1
        else:
            deduped.append(r)
    if skipped:
        console.print(f"[dim]已自动跳过 {skipped} 个已存在于投递池中的岗位[/dim]")
    return deduped


def run_linkedin_jobs():
    """Entry point: search LinkedIn jobs, translate, and optionally add to pool."""
    console.print(Panel.fit(
        "[bold cyan]🔍 LinkedIn 最新岗位抓取[/bold cyan]\n"
        "[dim]搜索 LinkedIn 岗位 JD → 翻译为中文 → 加入投递池[/dim]",
        border_style="cyan",
    ))

    if not HAS_DDGS:
        console.print("[red]缺少依赖 ddgs，请运行: pip install ddgs[/red]")
        return

    # Phase 1: keywords
    keywords = Prompt.ask("\n[cyan]请输入搜索关键词[/cyan]（如 Python 后端 实习）")
    if not keywords.strip():
        console.print("[yellow]关键词为空，已取消。[/yellow]")
        return

    # Phase 2: search
    console.print(f"\n[bold]🔎 正在搜索 LinkedIn 岗位:[/bold] {keywords}")
    raw_jobs = _search_linkedin(keywords)
    if not raw_jobs:
        console.print("[yellow]未搜索到 LinkedIn 岗位结果。可能原因：DuckDuckGo 限流、关键词过于具体、或暂无相关岗位。[/yellow]")
        console.print("[dim]建议：尝试更简短的关键词，或稍后再试。[/dim]")
        return

    console.print(f"[green]找到 {len(raw_jobs)} 个 LinkedIn 岗位[/green]")

    # Phase 3: Hail Mary page fetch (best effort, silent fail)
    for j in raw_jobs:
        url = j.get("url", "")
        if url:
            content = _try_fetch_page(url)
            if content:
                j["page_content"] = content
    fetched = sum(1 for j in raw_jobs if "page_content" in j)
    if fetched:
        console.print(f"[dim]成功获取 {fetched} 个岗位的完整页面内容[/dim]")

    # Phase 4: translate via Claude
    parsed_jobs = _translate_jobs(raw_jobs)
    if not parsed_jobs:
        console.print("[yellow]翻译结果为空，请重试。[/yellow]")
        return

    # Phase 5: show table
    _show_jobs_table(parsed_jobs)

    # Phase 6: user selection
    console.print("\n[dim]输入要加入投递池的岗位编号（逗号分隔，如 1,2,3），输入 0 跳过：[/dim]")
    sel = Prompt.ask("请选择", default="0")
    indices = _parse_selection(sel, len(parsed_jobs))
    if not indices:
        console.print("[yellow]未选择任何岗位。[/yellow]")
        return

    # Phase 7: build records with correct URL from raw_jobs
    records = []
    for idx in indices:
        job = parsed_jobs[idx]
        # Map back to raw_jobs to get the correct URL
        raw_idx = job.get("index", idx)
        url = ""
        if isinstance(raw_idx, int) and raw_idx < len(raw_jobs):
            url = raw_jobs[raw_idx].get("url", "")
        records.append({
            "company": job.get("company", ""),
            "position": job.get("position", ""),
            "location": job.get("location", ""),
            "url": url,
            "salary": job.get("salary_estimate", ""),
            "status": "待投递",
            "applied_date": datetime.now().strftime("%Y.%m.%d"),
            "notes": f"JD 摘要: {job.get('requirements_cn', '')[:200]}",
        })

    # Phase 8: deduplicate
    records = _deduplicate_by_url(records)
    if not records:
        console.print("[yellow]所选岗位均已存在于投递池中。[/yellow]")
        return

    # Phase 9: confirm
    console.print("\n[bold]即将添加以下岗位到投递池：[/bold]")
    for r in records:
        console.print(f"  [cyan]{r['company']}[/cyan] — {r['position']} [dim]({r.get('location', '')})[/dim]")

    if not Confirm.ask("\n确认添加？", default=True):
        console.print("[yellow]已取消。[/yellow]")
        return

    # Phase 10: write
    added = add_applications_batch(records)
    console.print(f"\n[green]已添加 {added} 个岗位到投递池！[/green]")
    console.print("[dim]可在「投递与面试管理」中查看和管理。[/dim]")
