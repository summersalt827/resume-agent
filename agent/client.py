"""Claude API client with prompt caching support."""

import os
import time
from pathlib import Path
from typing import AsyncIterator, Iterator

from anthropic import Anthropic, RateLimitError, APIError
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("ANTHROPIC_API_KEY", "")
model = os.getenv("DEFAULT_MODEL", "claude-sonnet-4-7")


def get_client() -> Anthropic:
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not set. Copy .env.example to .env and fill in your key.")
    return Anthropic(api_key=api_key)


SYSTEM_PROMPT_CACHE = """\
You are a professional resume assistant. You help users with:
1. Generating clean, professional resumes
2. Optimizing and polishing existing resumes
3. Customizing resumes for specific job descriptions
4. Translating resumes between Chinese and English

Always output well-structured content. For resume generation, use clean formatting with clear sections.
When optimizing, provide both the original text and improved version side by side where helpful.
"""


def make_cacheable(system_text: str) -> str:
    """Wrap system prompt so Claude treats it as cacheable."""
    return f"<cacheable>\n{system_text}\n</cacheable>"


def call_claude(
    messages: list,
    system: str | None = None,
    max_tokens: int = 8192,
    temperature: float = 0.3,
    cache_prompt: bool = True,
) -> str:
    """Call Claude with automatic retry on rate limit."""
    client = get_client()
    system_msg = make_cacheable(SYSTEM_PROMPT_CACHE) if cache_prompt else (system or "")
    for attempt in range(3):
        try:
            response = client.messages.create(
                model=model,
                max_tokens=max_tokens,
                system=system_msg,
                messages=messages,
                temperature=temperature,
            )
            for block in response.content:
                if block.type == "text":
                    return block.text
            return ""
        except RateLimitError:
            if attempt < 2:
                time.sleep(2 ** attempt * 5)
            else:
                raise
        except APIError as e:
            raise RuntimeError(f"API error: {e}")


def stream_claude(
    messages: list,
    system: str | None = None,
    max_tokens: int = 8192,
    temperature: float = 0.3,
) -> Iterator[str]:
    """Stream Claude response token by token."""
    client = get_client()
    system_msg = make_cacheable(SYSTEM_PROMPT_CACHE) if system is None else system
    try:
        with client.messages.stream(
            model=model,
            max_tokens=max_tokens,
            system=system_msg,
            messages=messages,
            temperature=temperature,
        ) as stream:
            for text in stream.text_stream:
                yield text
    except RateLimitError:
        yield "\n[Rate limited, please retry]"
    except APIError as e:
        yield f"\n[API error: {e}]"
