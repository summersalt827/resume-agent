"""Bidirectional sync between local projects.json and a Notion database."""

import os
from datetime import datetime, timezone

from dotenv import load_dotenv, set_key
from notion_client import Client, errors
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt

load_dotenv()

console = Console()

NOTION_TOKEN = os.getenv("NOTION_TOKEN", "")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID", "")
ENV_FILE = os.path.join(os.path.dirname(__file__), "..", ".env")


def is_configured() -> bool:
    return bool(NOTION_TOKEN and NOTION_DATABASE_ID)


def _get_client() -> Client:
    if not NOTION_TOKEN:
        raise ValueError("NOTION_TOKEN 未配置。请先运行设置。")
    return Client(auth=NOTION_TOKEN)


def _validate_token(token: str) -> bool:
    try:
        client = Client(auth=token)
        client.users.me()
        return True
    except errors.APIResponseError:
        return False


def _validate_database(database_id: str) -> bool:
    try:
        client = Client(auth=NOTION_TOKEN)
        client.databases.retrieve(database_id=database_id)
        return True
    except errors.APIResponseError:
        return False


def setup_notion() -> bool:
    """Interactive setup wizard. Returns True on success."""
    console.print(Panel.fit(
        "[bold cyan]🔧 Notion 集成配置[/bold cyan]\n\n"
        "[bold]步骤 1: 创建 Notion Integration[/bold]\n"
        "  1. 浏览器打开 https://www.notion.so/my-integrations\n"
        "  2. 点击 [bold]\"新建集成\"[/bold] (New integration)\n"
        "  3. 名称填 \"Resume Agent\"，提交\n"
        "  4. 复制 [bold]\"Internal Integration Secret\"[/bold]\n",
        border_style="cyan",
    ))

    token = Prompt.ask("粘贴你的 Notion Integration Token", default="")
    if not token:
        console.print("[yellow]未输入 Token，已取消配置。[/yellow]")
        return False

    if not _validate_token(token):
        console.print("[red]Token 无效，请检查后重试。[/red]")
        return False

    console.print("[green]Token 验证通过！[/green]")
    set_key(ENV_FILE, "NOTION_TOKEN", token)
    global NOTION_TOKEN
    NOTION_TOKEN = token

    console.print(Panel.fit(
        "[bold]步骤 2: 创建 Notion 数据库[/bold]\n\n"
        "  1. 在 Notion 中新建一个 [bold]整页数据库[/bold] (非行内数据库)\n"
        "  2. 确保数据库包含以下列（类型均为 Text）：\n"
        "     • Name (默认标题列)\n"
        "     • Role\n"
        "     • Period\n"
        "     • Tech Stack\n"
        "     • Description\n"
        "  3. 点击数据库右上角 \"...\" → \"连接\" → 添加 \"Resume Agent\"\n"
        "  4. 从浏览器地址栏复制数据库 ID:\n"
        "     https://www.notion.so/workspace/[b]abcdef1234567890[/b]?v=...\n"
        "     (数据库 ID 是 URL 中 /workspace/ 后面、?v= 前面的 32 位字符串)\n",
        border_style="cyan",
    ))

    db_id = Prompt.ask("粘贴你的 Notion Database ID", default="")
    if not db_id:
        console.print("[yellow]未输入 Database ID，已取消配置。[/yellow]")
        return False

    if not _validate_database(db_id):
        console.print("[red]Database ID 无效或 Integration 未关联该数据库。请检查后重试。[/red]")
        return False

    console.print("[green]Database 验证通过！[/green]")
    set_key(ENV_FILE, "NOTION_DATABASE_ID", db_id)
    global NOTION_DATABASE_ID
    NOTION_DATABASE_ID = db_id

    console.print(f"\n[bold green]Notion 配置完成！[/bold green]")
    return True


def _query_all_entries(client: Client, database_id: str) -> list[dict]:
    all_results = []
    start_cursor = None

    while True:
        response = client.databases.query(
            database_id=database_id,
            start_cursor=start_cursor,
            page_size=100,
        )
        all_results.extend(response["results"])
        if not response.get("has_more"):
            break
        start_cursor = response["next_cursor"]

    return all_results


def _page_to_project(page: dict) -> dict:
    props = page["properties"]

    def _text(prop: dict) -> str:
        arr = prop.get("rich_text", [])
        return arr[0]["plain_text"] if arr else ""

    def _title(prop: dict) -> str:
        arr = prop.get("title", [])
        return arr[0]["plain_text"] if arr else ""

    return {
        "name": _title(props.get("Name", {})),
        "role": _text(props.get("Role", {})),
        "period": _text(props.get("Period", {})),
        "tech_stack": _text(props.get("Tech Stack", {})),
        "description": _text(props.get("Description", {})),
    }


def _project_to_properties(project: dict) -> dict:
    def _rt(value: str) -> dict:
        return {"rich_text": [{"text": {"content": value}}]}

    return {
        "Name": {"title": [{"text": {"content": project.get("name", "")}}]},
        "Role": _rt(project.get("role", "")),
        "Period": _rt(project.get("period", "")),
        "Tech Stack": _rt(project.get("tech_stack", "")),
        "Description": _rt(project.get("description", "")),
    }


def _create_page(client: Client, database_id: str, project: dict) -> str:
    response = client.pages.create(
        parent={"database_id": database_id},
        properties=_project_to_properties(project),
    )
    return response["id"]


def _update_page(client: Client, page_id: str, project: dict):
    client.pages.update(
        page_id=page_id,
        properties=_project_to_properties(project),
    )


def _find_name_match(name: str, notion_pages: list[dict], matched_ids: set) -> dict | None:
    for page in notion_pages:
        if page["id"] in matched_ids:
            continue
        notion_name = _page_to_project(page)["name"].strip()
        if notion_name.lower() == name.strip().lower():
            return page
    return None


def sync(projects: list[dict]) -> list[dict]:
    """Run bidirectional sync. Returns the merged project list."""
    client = _get_client()
    notion_pages = _query_all_entries(client, NOTION_DATABASE_ID)
    notion_by_id = {p["id"]: p for p in notion_pages}

    updated = []
    matched_ids: set[str] = set()
    now_utc = datetime.now(timezone.utc).isoformat()

    for project in projects:
        notion_id = project.get("notion_id", "")

        if notion_id and notion_id in notion_by_id:
            # Existing link — compare timestamps
            page = notion_by_id[notion_id]
            matched_ids.add(notion_id)
            local_time = project.get("notion_synced_at", "")
            notion_time = page.get("last_edited_time", "")

            if notion_time > local_time:
                # Notion is newer — pull
                entry = _page_to_project(page)
                entry["notion_id"] = notion_id
            elif local_time > notion_time:
                # Local is newer — push
                _update_page(client, notion_id, project)
                entry = dict(project)
            else:
                entry = dict(project)

            entry["notion_synced_at"] = page.get("last_edited_time", now_utc)
            updated.append(entry)

        elif notion_id and notion_id not in notion_by_id:
            # Notion page was deleted — re-push as new
            new_id = _create_page(client, NOTION_DATABASE_ID, project)
            entry = dict(project)
            entry["notion_id"] = new_id
            entry["notion_synced_at"] = now_utc
            updated.append(entry)

        else:
            # No notion_id — try name match, else push new
            match = _find_name_match(project.get("name", ""), notion_pages, matched_ids)

            if match:
                matched_ids.add(match["id"])
                notion_time = match.get("last_edited_time", "")
                if notion_time > "":
                    # Pull from Notion (treat as newer since local has no timestamp)
                    entry = _page_to_project(match)
                else:
                    _update_page(client, match["id"], project)
                    entry = dict(project)
                entry["notion_id"] = match["id"]
                entry["notion_synced_at"] = match.get("last_edited_time", now_utc)
            else:
                new_id = _create_page(client, NOTION_DATABASE_ID, project)
                entry = dict(project)
                entry["notion_id"] = new_id
                entry["notion_synced_at"] = now_utc

            updated.append(entry)

    # Pull orphaned Notion pages (not linked to any local entry)
    for page_id, page in notion_by_id.items():
        if page_id not in matched_ids:
            entry = _page_to_project(page)
            entry["notion_id"] = page_id
            entry["notion_synced_at"] = page.get("last_edited_time", now_utc)
            updated.append(entry)

    return updated
