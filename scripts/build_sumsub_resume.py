#!/usr/bin/env python3
"""Build Sumsub-customized resume from web3 base."""
import sys, json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from agent.client import call_claude

template = (PROJECT_ROOT / "简历.md").read_text(encoding="utf-8")

# Web3 resume extracted text + projects data
projects = json.loads((PROJECT_ROOT / "data/projects.json").read_text("utf-8"))
projects_text = "\n".join(
    f"- {p['name']}: {p['description']}" for p in projects
)

reference = """--- EXACT PERSONAL INFO ---
Name: Yuxian He | Nationality: Chinese | Gender: Female | Date of Birth: 27/08/1992
Tel: (+86) 18602125280 | Email: hyscandy@163.com | Location: Shanghai, China

--- WORK EXPERIENCE (DO NOT CHANGE COMPANIES OR DATES) ---

Company: XT.EXCHANGE | Shanghai, China (crypto exchange)
Role: Platform Operations Manager | 12/2024 - Present
Actual work:
- Led first deposit conversion initiative: built "User x Incentive x Channel" 3D activation engine with 9-grid segmentation model, increased first deposit conversion from 14% to 24%, reduced CAC from $42 to $34 (-18%).
- Established P0-P2 three-tier PUSH strategy system with global frequency control, 7-day progressive onboarding, dormant reactivation with auto circuit-breaker, 4 preference toggles replacing binary unsubscribe (unsubscribe rate -30-50%).
- Designed A/B experiments: identified $30 as optimal first-deposit incentive, 7-day lock-up period exchanged 1.3pp of first deposit rate for +23pp retention gain (30-day trading retention 45%->61%). Tiered recall lifted dormant revival rate from 3% to 11%.
- Built 34-slot traffic resource management system from scratch with 8 operational control capabilities (grayscale release, 50+ dimension audience targeting, A/B testing, frequency management). Operator self-service rate 0->90%+, configuration turnaround 3-5 days->minutes, zero incidents.
- Designed 10-layer display rule engine with 5 exception fallback strategies. Delivered Configuration Standards V1.8 (~100K words) and team SOPs.
- Led 5-person platform operations team. Implemented AI Copilot for copy generation, experiment analysis, and configuration validation (+50% team efficiency). Used LLM for user feedback classification, sentiment alerting, and auto-routing (P0/P1 fix turnaround +40%).

Company: Ping An Securities | Shanghai, China
Role: Operations Manager | 08/2020 - 08/2024
Actual work:
- Built KYC-based precision customer acquisition engine: "Market Analysis -> Strategy Matching -> Trading -> Viral Loop" funnel. 1.03M new customers/year, D0 retention 50%, M1 retention 20%, 5,200 account openings (avg AUM RMB 100K), community first-trade conversion +50%.
- Market-driven viral acquisition engine: real-time market signal triggering during rallies (>2%) or stock movements (>5%), dynamic personalized campaigns, in-app share rate >=50%, viral ratio >=1:10, CAC ~RMB 1.1/user.
- AI-powered user behavior sequence model (market intensity x sharing history x time-slot activity) for viral trigger optimization: trigger accuracy +22%, ineffective interruptions -35%.
- Existing customer asset growth: reactivated 150K+ silent customers/yr, 500K active user growth, avg AUM +RMB 10M per account.
- Account Achievement System: MOT landing pages, Anonymous Returns Leaderboard, Investment Badge Wall. Monthly sharing UV 100K-150K, PV 400K-500K.
- AI content recommendation: CTR +1.8pp, reading time +40%, Community DAU +25%.
- Xiao'an AI Assistant: MAU 0->280K in 6 months, community->AI conversion 12%->31%.

Company: 2345.com | Shanghai, China
Role: Product Operations Manager | 05/2019 - 09/2020
Actual work:
- Led 0-to-1 operations build-out for APP + Content SDK. DAU +200%, tiered ARPU +10%.
- Built release SOP: Feature Launch->Creative->UAT->Monitoring. Go-live time -40%, delivery cycle -30%.
- Coin-based tiered model: high-value ARPU +50%, CAC -20%. 10 core optimizations from feedback; retention +20%.

Company: Ping An Good House | Shanghai, China
Role: User Operations Manager | 12/2017 - 05/2019
Actual work:
- WeChat ecosystem private domain marketing: 100K new users/month, CAC 30% below industry.
- Customer journey dashboard (Enterprise WeChat + CDP): key conversion +30%.
- WeChat Work transformation: auto-tagging, scripts, scheduling -> sales +3/month.

Company: Unilever | Shanghai, China
Role: Brand Specialist | 05/2015 - 12/2017
Actual work:
- PUGC ecosystem: weekly output +40%, reuse rate 75%.
- Tiered content library (S/A/B): 20+ articles/month (18%+ open rate).

--- EDUCATION (DO NOT CHANGE) ---
Shanghai Normal University | Shanghai, China
Bachelor of Education, Primary Education | 09/2010 - 07/2014 | GPA: 3.02/4.0
Notable: School journalist (10+ articles), 2nd Prize in Children's Literature, University 3rd-Class Scholarship"""

jd = """Sumsub - Junior Customer Success Manager

Company: Leading full-cycle verification platform (KYC, KYB, ongoing monitoring). 4,000+ clients including Bitpanda, Wirex, Bybit, Vodafone, Duolingo. No-code interface for customizable compliance workflows.

Responsibilities:
- Manage clients on technical, business, and product levels; help them succeed
- Manage and grow relationships with Key Clients (stakeholders)
- Identify opportunities and potential challenges
- Provide client training and webinars
- Introduce clients to new features; handle new feature releases
- Provide client feedback internally
- Collaborate with Sales, Solution Architects, Partners, Product Management, Legal, Marketing teams

Requirements:
- Native/Bilingual Chinese + Advanced English
- Prior CSM / Account Manager / BD / Project Manager experience in crypto, fintech, payments
- Basic KYC understanding is a big plus
- Google Sheets / MS Excel proficiency
- Strong analytical skills and proactive approach"""

prompt = f"""CRITICAL RULES:
1. Use ONLY the companies, dates, locations, education from the reference. DO NOT invent or change any of them.
2. Personal info is fixed - use exactly as given.
3. Reframe ALL experience descriptions for a Junior Customer Success Manager role at Sumsub (KYC/compliance verification SaaS platform serving crypto + fintech clients).
4. Key angles to emphasize:
   - Client-facing work, stakeholder relationship management
   - Training, onboarding, feature release coordination
   - Customer feedback collection and internal advocacy
   - Cross-functional collaboration (Sales, Product, Legal, Marketing)
   - KYC and compliance-related experience
   - Data analysis (Excel/Sheets proficiency, A/B testing, analytics)
   - Crypto/fintech industry knowledge (XT.EXCHANGE experience is gold)
5. Tone down seniority — frame as "Manager" not "Director". Emphasize hands-on client work over strategy.
6. English only. Follow the template format exactly.
7. Output ONLY the completed resume (no preamble, no code blocks).

## Template Format
{template}

## Reference Content (DO NOT INVENT companies/dates/education)
{reference}

## Target Job
{jd}

Fill the template now."""

print("Building Sumsub resume...")
result = call_claude(
    messages=[{"role": "user", "content": prompt}],
    max_tokens=8192,
    temperature=0.3,
)

# Clean wrappers
if result.startswith("```"):
    lines = result.split("\n")
    if lines[0].startswith("```"): lines = lines[1:]
    if lines and lines[-1].strip() == "```": lines = lines[:-1]
    result = "\n".join(lines)

md_path = PROJECT_ROOT / "简历/web3远程（Growth)/He Yuxian（Sumsub - Junior CSM）.md"
md_path.write_text(result, encoding="utf-8")
print(result)
print(f"\nSaved to: {md_path}")
