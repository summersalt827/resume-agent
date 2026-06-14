#!/usr/bin/env python3
"""Build Wise resume using EXACT content from fintech PDF, reframed for PC&R Ops."""
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from agent.client import call_claude

template = (PROJECT_ROOT / "简历.md").read_text(encoding="utf-8")

# EXACT extracted text from the fintech PDF - DO NOT INVENT
reference = """--- EXACT PERSONAL INFO (DO NOT CHANGE) ---
Name: Yuxian He
Nationality: Chinese | Gender: Female | Date of Birth: 27/08/1992
Tel: (+86) 18602125280 | Email: hyscandy@163.com | Location: Shanghai, China

--- EXACT WORK EXPERIENCE (DO NOT CHANGE COMPANIES, DATES, LOCATIONS) ---

Company: Ping An Securities | Shanghai, China
Role: Senior Operations Manager | 08/2020 - 02/2026
Actual work:
- Built KYC-based user segmentation and automated operations platform from 0 to 1
- Designed "Market Analysis -> Strategy Matching -> Trading -> Viral Loop" conversion funnel; acquired 1.03M new customers/year (D0 retention 50%, M1 retention 20%)
- Real-time market signal-driven campaign engine: share rate >=50%, viral ratio >=1:10, CAC ~RMB 1.1/user
- AI-powered viral timing engine: user behavior sequence model, trigger accuracy +22%, ineffective interruptions -35%
- Reactivated 150K+ silent customers/yr, drove 500K active user growth, avg AUM +RMB 10M
- Built Account Achievement System (MOT landing page, leaderboard, badge wall); monthly sharing UV 100K-150K, PV 400K-500K
- AI content recommendation: CTR +1.8pp, reading time +40%, Community DAU +25%
- Led Xiao'an AI Assistant launch: MAU 0->280K (6mo), community->AI conversion 12%->31%, AI users +2.1 trades/month, +32% AUM
- Managed SOP development and cross-functional coordination across Product, Data, Content, Sales teams

Company: 2345.com | Shanghai, China
Role: Product Operations Manager (Internal Startup Lead) | 05/2019 - 09/2020
Actual work:
- Led 0-to-1 ops build-out for APP + Content SDK; DAU +200%, tiered ARPU +10%
- Built release SOP: Feature Launch->Creative->UAT->Monitoring; go-live time -40%, delivery cycle -30%
- Coin-based tiered model with DAU/ARPU-driven incentives; high-value ARPU +50%, CAC -20%
- 10 core optimizations from feedback; retention +20%

Company: Ping An Good House | Shanghai, China
Role: User Operations Manager (Private Domain Lead) | 12/2017 - 04/2019
Actual work:
- Built WeChat ecosystem private domain marketing; 100K new users/month, CAC 30% below industry
- Customer journey dashboard (Enterprise WeChat + CDP); key conversion +30%
- WeChat Work transformation: auto-tagging, scripts, scheduling -> sales +3/month
- Mini Program + Video Account loop -> lead conversion +20%, MQL +100/month

Company: Unilever | Shanghai, China
Role: Brand Specialist | 05/2015 - 12/2017
Actual work:
- Built PUGC ecosystem: weekly output +40%, reuse rate 75%
- PUGC library (S/A/B); 20+ articles/month (18%+ open rate)
- "Testimonials + Reviews" matrix across Video Accounts + Moments Ads; follower add rate +25%

--- EXACT EDUCATION (DO NOT CHANGE) ---
School: Shanghai Normal University | Shanghai, China
Degree: Bachelor of Education | 09/2010 - 07/2014
Major: Primary Education | GPA: 3.02/4.0
Highlights: School journalist (10+ articles), 2nd Prize in Children's Literature, University 3rd-Class Scholarship"""

jd = """Role: APAC Regional PC&R Operations at Wise
- End-to-end regional review cadence for product launches (compliance & risk review)
- Core PC&R process execution: issues management, risk identification/tracking/resolution
- Align APAC PC&R initiatives with global roadmap
- Own team rituals; coordinate quarterly committee meetings
- Document in central knowledge base (JIRA, G-Suite)
- Requirements: organized, detail-oriented, process-minded, great communicator, JIRA & G-Suite"""

prompt = f"""CRITICAL RULES - VIOLATION MEANS FAILURE:
1. Use ONLY the companies, dates, locations, education, and personal info from the reference below. DO NOT INVENT OR CHANGE ANY OF THEM.
2. DO NOT add fake companies like "Ant Financial", "DBS Bank", "PwC".
3. DO NOT change the university to "Fudan" or any other school.
4. Reframe the descriptions for Wise PC&R Operations role (process management, review cadence, issues tracking, stakeholder coordination, knowledge base, compliance). But the underlying facts must stay the same.
5. English only.
6. Output clean Markdown following the template format exactly. No preamble text.

## Template Format
{template}

## Reference Content (ALL factual data comes from here - DO NOT INVENT)
{reference}

## Target Job
{jd}

Fill the template now. Output ONLY the completed resume."""

print("Generating Wise resume (strict reference)...")
result = call_claude(
    messages=[{"role": "user", "content": prompt}],
    max_tokens=8192,
    temperature=0.3,
)

# Clean any wrapper
if result.startswith("```"):
    lines = result.split("\n")
    if lines[0].startswith("```"):
        lines = lines[1:]
    if lines and lines[-1].strip() == "```":
        lines = lines[:-1]
    result = "\n".join(lines)

md_path = PROJECT_ROOT / "简历/fintech/He Yuxian（Wise - APAC PC&R Operations）.md"
md_path.write_text(result, encoding="utf-8")
print(result)
print(f"\nSaved to: {md_path}")
