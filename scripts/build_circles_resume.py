#!/usr/bin/env python3
"""Build Circles Xplore Lead resume from fintech base (strongest AI experience)."""
import sys, json, re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from agent.client import call_claude

template = (PROJECT_ROOT / "简历.md").read_text(encoding="utf-8")

# Fintech PDF extracted text (has the richest AI experience)
reference = """--- EXACT PERSONAL INFO (DO NOT CHANGE) ---
Name: Yuxian He | Nationality: Chinese | Gender: Female | Date of Birth: 27/08/1992
Tel: (+86) 18602125280 | Email: hyscandy@163.com | Location: Shanghai, China

--- WORK EXPERIENCE (DO NOT CHANGE COMPANIES/DATES) ---

Company: Ping An Securities | Shanghai, China
Role: Senior Operations Manager | 08/2020 - 02/2026
Key AI-related work:
- Led Xiao'an AI Assistant launch: grew MAU from 0 to 280K in 6 months. Built "Content -> Ask AI -> Decide" engagement loop. Community-to-AI conversion 12% -> 31%. AI users +2.1 trades/month, +32% AUM vs non-AI users. 4 key scenarios: community content embedding (18% CVR), holdings page triggers (22% CVR), viral sharing (35% activation), AI navigation.
- AI-powered content recommendation engine: matched premium content to users based on portfolio, trading style, browsing behavior. CTR +1.8pp, reading time +40%, Community DAU +25%.
- AI-powered viral timing engine: user behavior sequence model (market intensity x sharing history x time-slot activity) computing optimal trigger timing and personalized copy. Trigger accuracy +22%, ineffective interruptions -35%.
- Built KYC-based user segmentation and automated operations platform from 0 to 1.
- "Market Analysis -> Strategy Matching -> Trading -> Viral Loop" funnel: 1.03M new customers/year. D0 retention 50%, M1 retention 20%, 5,200 account openings (avg AUM RMB 100K).
- Real-time market signal campaign engine: share rate >=50%, viral ratio >=1:10, CAC ~RMB 1.1/user.
- Account Achievement System: MOT landing page, leaderboard, badge wall. Monthly sharing UV 100K-150K, PV 400K-500K.
- Reactivated 150K+ silent customers/yr, 500K active user growth, avg AUM +RMB 10M.
- Managed cross-functional coordination: Product, Data, Content, Sales teams. SOP development.

Company: 2345.com | Shanghai, China
Role: Product Operations Manager (Internal Startup Lead) | 05/2019 - 09/2020
- Led 0-to-1 ops build-out for APP + Content SDK. DAU +200%, tiered ARPU +10%.
- Built release SOP: Feature Launch->Creative->UAT->Monitoring. Go-live time -40%, delivery cycle -30%.
- Coin-based tiered model: high-value ARPU +50%, CAC -20%. 10 optimizations from feedback; retention +20%.

Company: Ping An Good House | Shanghai, China
Role: User Operations Manager (Private Domain Lead) | 12/2017 - 04/2019
- WeChat ecosystem private domain marketing: 100K new users/month, CAC 30% below industry.
- Customer journey dashboard (Enterprise WeChat + CDP): key conversion +30%.
- WeChat Work transformation: auto-tagging, scripts, scheduling -> sales +3/month.

Company: Unilever | Shanghai, China
Role: Brand Specialist | 05/2015 - 12/2017
- PUGC ecosystem: weekly output +40%, reuse rate 75%.
- Tiered content library: 20+ articles/month (18%+ open rate)."""

jd = """Circles - Lead of Xplore (AI-Powered Engagement Platform)
- Product: Xplore (Xplore Engage: games/polls/news/daily content, Xplore AI: chatbot/premium AI/agentic AI, Xplore IQ: agentic AI for telco)
- Markets: Singapore, Mongolia, Japan, Pakistan (multi-country APAC)
- Role: Own product vision, GTM coordination, roadmap, cross-functional execution, client success
- Lead team: Product, Engineering, Data, Design, GTM, Operations
- Manage external client relationships, partnerships, vendors
- 0->1->N product building experience required
- AI agents, LLM, AI/ML experience strongly preferred
- Telco engagement, CRM, gamification experience nice to have"""

prompt = f"""CRITICAL RULES:
1. Use ONLY the companies, dates, education from the reference. DO NOT INVENT.
2. Personal info is fixed - use exactly as given.
3. Reframe ALL experience for the Circles Xplore Lead role - an AI-powered engagement platform for telco across APAC markets.
4. Key angles:
   - AI product leadership: Xiao'an AI Assistant (0->280K MAU) is the centerpiece - this is AI-powered engagement platform experience
   - Product vision & 0->1->N: pitched as leading an "AI engagement product" that scaled across multiple user segments
   - Cross-functional execution: managing Product, Data, Engineering, Design, Content teams
   - Multi-stakeholder management: C-level/executive coordination, client-facing
   - Data-driven experimentation: A/B testing, metrics instrumentation
   - Gamification: Account Achievement System as engagement/gamification platform
   - Content & community: community growth, UGC
5. English only. Follow the template format exactly.
6. Job title reframed to: "Senior Product & AI Engagement Lead" or similar.
7. Output ONLY the completed resume (no preamble, no code blocks).

## Template
{template}

## Reference
{reference}

## Target JD
{jd}

Fill the template now."""

print("Building Circles resume...")
result = call_claude(
    messages=[{"role": "user", "content": prompt}],
    max_tokens=8192,
    temperature=0.3,
)

if result.startswith("```"):
    lines = result.split("\n")
    if lines[0].startswith("```"): lines = lines[1:]
    if lines and lines[-1].strip() == "```": lines = lines[:-1]
    result = "\n".join(lines)

md_path = PROJECT_ROOT / "简历/fintech+AI/He Yuxian（Circles - Xplore Lead）.md"
md_path.parent.mkdir(parents=True, exist_ok=True)
md_path.write_text(result, encoding="utf-8")
print(result)
print(f"\nSaved to: {md_path}")
