#!/usr/bin/env python3
"""Generate fintech and fintech+AI resumes using Claude API."""
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from agent.client import call_claude
from prompts.system_prompts import GENERATE_SYSTEM

# Read base resume content
trm_md = PROJECT_ROOT / "简历/fintech/He Yuxian（TRM-Events）.md"
base_resume = trm_md.read_text(encoding="utf-8")

# Read project experience
import json
projects = json.loads((PROJECT_ROOT / "data/projects.json").read_text("utf-8"))
projects_text = "\n\n".join(
    f"### {p['name']}\n- Role: {p['role']}\n- Period: {p['period']}\n- Tech: {p['tech_stack']}\n- {p['description']}"
    for p in projects
)

# ---- Fintech Version ----
fintech_prompt = f"""You are a professional resume writer for fintech roles.

Below is the candidate's current resume and detailed project experience. Create an optimized **English resume** tailored for **Fintech Platform Operation / Growth Marketing** roles (target platforms: 小羚/Boss直聘 — Chinese fintech focused).

## Current Resume
{base_resume}

## Detailed Project Experience (incorporate these)
{projects_text}

## Requirements
1. Focus on: growth loops, trading conversion, user acquisition at low CAC, MGM/viral mechanics, retention via stickiness features, A/B testing, data-driven marketing
2. Quantify EVERYTHING — use specific numbers from the project experience
3. Make it ATS-friendly with fintech keywords: CAC, LTV, ROAS, conversion funnel, DAU/MAU, retention, MGM, user segmentation, A/B testing
4. Target 1 page, clean formatting
5. Output as Markdown
6. After the English resume, add a `---` separator then a Chinese version (中文版)

Output the complete resume now."""

print("=" * 60)
print("Generating FINTECH resume...")
print("=" * 60)

fintech_result = call_claude(
    messages=[{"role": "user", "content": fintech_prompt}],
    system=GENERATE_SYSTEM,
    max_tokens=8192,
    temperature=0.3,
)

output_path = PROJECT_ROOT / "简历/fintech/He Yuxian（Fintech Platform Operation）.md"
output_path.write_text(fintech_result, encoding="utf-8")
print(fintech_result)
print(f"\nSaved to: {output_path}")

# ---- Fintech+AI Version ----
fintech_ai_prompt = f"""You are a professional resume writer for fintech+AI roles.

Below is the candidate's current resume and detailed project experience. Create an optimized **English resume** tailored for **Fintech + AI** roles (target: AI-powered fintech platforms, AI growth product roles, 小羚不卷 etc.).

## Current Resume
{base_resume}

## Detailed Project Experience (incorporate these)
{projects_text}

## Requirements
1. Focus on: AI product adoption, AI-powered growth, community-to-AI conversion, AI assistant, intelligent marketing automation, data-driven AI features
2. Emphasize the AI assistant launch experience (MAU 0→280K, community-to-AI conversion 12%→31%)
3. Emphasize AI-powered content recommendations, AI-driven push/notification optimization
4. Quantify everything with specific numbers
5. ATS-friendly keywords: AI adoption, LLM, intelligent marketing, personalization engine, A/B testing, conversion optimization, community growth
6. Target 1 page, clean formatting
7. Output as Markdown
8. After the English resume, add a `---` separator then a Chinese version (中文版)

Output the complete resume now."""

print("\n" + "=" * 60)
print("Generating FINTECH+AI resume...")
print("=" * 60)

ai_result = call_claude(
    messages=[{"role": "user", "content": fintech_ai_prompt}],
    system=GENERATE_SYSTEM,
    max_tokens=8192,
    temperature=0.3,
)

output_path_ai = PROJECT_ROOT / "简历/fintech+AI/He Yuxian（Fintech+AI）.md"
output_path_ai.write_text(ai_result, encoding="utf-8")
print(ai_result)
print(f"\nSaved to: {output_path_ai}")
