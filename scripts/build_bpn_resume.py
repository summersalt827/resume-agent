#!/usr/bin/env python3
"""Build BPN resume from web3 base."""
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from agent.client import call_claude

template = (PROJECT_ROOT / "简历.md").read_text(encoding="utf-8")

reference = """--- EXACT PERSONAL INFO ---
Name: Yuxian He | Nationality: Chinese | Gender: Female | Date of Birth: 27/08/1992
Tel: (+86) 18602125280 | Email: hyscandy@163.com | Location: Shanghai, China

--- WORK EXPERIENCE (DO NOT CHANGE) ---

Company: XT.EXCHANGE | Shanghai, China
Role: Platform Operations Director | 12/2024 - Present
- Led first deposit conversion: "User x Incentive x Channel" 3D engine, conversion 14%->24%, CAC $42->$34 (-18%).
- P0-P2 PUSH strategy, 7-day onboarding, dormant reactivation with auto circuit-breaker. Unsubscribe -30-50%.
- A/B experiments: $30 optimal incentive, 7-day lock-up. Dormant revival 3%->11%.
- 34-slot traffic resource system, operator self-service 0->90%+, config turnaround days->minutes.
- 10-layer display rule engine. Configuration Standards V1.8 (~100K words) and SOPs.
- Led 5-person team. AI Copilot +50% efficiency. LLM feedback classification -> P0/P1 +40%.

Company: Ping An Securities | Shanghai, China
Role: Operations Manager | 08/2020 - 08/2024
- KYC-based acquisition: 1.03M new customers/year, D0 retention 50%, M1 retention 20%.
- Viral acquisition engine: share rate >=50%, viral ratio >=1:10, CAC ~RMB 1.1/user.
- AI viral timing: trigger accuracy +22%, interruptions -35%.
- Reactivated 150K+ silent customers/yr, +500K active users.
- Xiao'an AI Assistant: MAU 0->280K in 6mo, community->AI CVR 12%->31%.

Company: 2345.com | Shanghai, China
Role: Product Operations Manager | 05/2019 - 09/2020
- 0-to-1 APP + Content SDK. DAU +200%, ARPU +10%.
- Release SOP: go-live -40%, delivery -30%. User feedback -> 10 optimizations, retention +20%.

Company: Ping An Good House | Shanghai, China
Role: User Operations Manager | 12/2017 - 05/2019
- WeChat ecosystem: 100K new users/month, CAC 30% below industry.
- Customer journey dashboard (Enterprise WeChat + CDP): key CVR +30%.

Company: Unilever | Shanghai, China
Role: Brand Specialist | 05/2015 - 12/2017
- PUGC ecosystem, agency partnerships. Weekly output +40%, reuse 75%.
- 20+ articles/month, 18%+ open rate."""

jd = """BPN - Financial Institutions & Business Development Support (Contractor)
- Web3 PayFi and stablecoin payment rails
- Identify/evaluate institutional partners in payments, fintech, digital assets
- Support due diligence, partner onboarding, pipeline tracking
- Prepare presentations, pitch decks, product docs, market research
- Coordinate with financial institutions and external partners
- Requirements: English+Mandarin, Excel/Sheets, PPT/Slides, analytical, self-driven"""

prompt = f"""CRITICAL RULES:
1. Use ONLY companies, dates, education from reference. DO NOT INVENT.
2. Personal info is fixed.

3. Reframe for BPN FIBD support role. This is a contractor/junior-level role, so tone down seniority. Key angles:
   - Crypto/Web3 industry familiarity (XT.EXCHANGE)
   - Financial institution experience (Ping An Securities - regulated securities firm)
   - Partner/stakeholder coordination (cross-functional, external vendor management at Unilever)
   - Data analysis, presentation preparation, pipeline tracking
   - Market research and competitive analysis
   - Excel/Sheets + PPT/Slides proficiency
   - Self-driven independent work in fast-paced ambiguous environment
   - Bilingual Chinese/English for regional partner engagement

4. Don't fabricate BD/deal-flow/institutional finance experience. Bridge honestly.
5. English only. Follow template format exactly.
6. Output ONLY the completed resume.

## Template
{template}

## Reference
{reference}

Fill the template now."""

print("Building BPN resume...")
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

md_path = PROJECT_ROOT / "简历/web3远程（Growth)/He Yuxian（BPN - FIBD Support）.md"
md_path.write_text(result, encoding="utf-8")
print(result)
print(f"\nSaved to: {md_path}")
