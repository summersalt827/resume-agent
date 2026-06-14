#!/usr/bin/env python3
"""Build Alias consumer acquisition resume from web3 base."""
import sys, json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from agent.client import call_claude

template = (PROJECT_ROOT / "简历.md").read_text(encoding="utf-8")

# Web3 resume extracted content
reference = """--- EXACT PERSONAL INFO (DO NOT CHANGE) ---
Name: Yuxian He | Nationality: Chinese | Gender: Female | Date of Birth: 27/08/1992
Tel: (+86) 18602125280 | Email: hyscandy@163.com | Location: Shanghai, China

--- WORK EXPERIENCE (DO NOT CHANGE COMPANIES/DATES) ---

Company: XT.EXCHANGE | Shanghai, China
Role: Platform Operations Director | 12/2024 - Present
Actual work:
- Led first deposit conversion initiative: "User x Incentive x Channel" 3D activation engine with 9-grid segmentation model. First deposit conversion 14%->24%, CAC $42->$34 (-18%).
- P0-P2 three-tier PUSH strategy with global frequency control, 7-day progressive onboarding, dormant reactivation with auto circuit-breaker. Unsubscribe rate -30-50%.
- A/B experiments: identified $30 optimal first-deposit incentive, 7-day lock-up exchanged 1.3pp first deposit rate for +23pp retention. Dormant revival rate 3%->11%.
- Built 34-slot traffic resource management system. Operator self-service rate 0->90%+, configuration turnaround 3-5 days->minutes, zero incidents.
- 10-layer display rule engine with 5 exception fallback strategies. Configuration Standards V1.8 (~100K words) and team SOPs.
- Led 5-person platform operations team across campaign, PUSH, inventory, and referral. 23 releases in 6 months.
- AI Copilot for copy generation, experiment analysis, configuration validation -> team efficiency +50%.
- LLM for user feedback classification, sentiment alerting, auto-routing -> P0/P1 fix turnaround +40%.

Company: Ping An Securities | Shanghai, China
Role: Operations Manager | 08/2020 - 08/2024
Actual work:
- KYC-based customer acquisition engine: 1.03M new customers/year, D0 retention 50%, M1 retention 20%, 5,200 account openings, community first-trade conversion +50%.
- Market-driven viral acquisition engine: in-app share rate >=50%, viral ratio >=1:10, CAC ~RMB 1.1/user.
- AI-powered viral timing engine: trigger accuracy +22%, ineffective interruptions -35%.
- Existing customer asset growth: 150K+ silent customers/yr reactivated, 500K active user growth.
- Account Achievement System: sharing UV 100K-150K/month, PV 400K-500K.
- AI content recommendation: CTR +1.8pp, reading time +40%, Community DAU +25%.
- Xiao'an AI Assistant: MAU 0->280K in 6 months, community->AI conversion 12%->31%.

Company: 2345.com | Shanghai, China
Role: Product Operations Manager | 05/2019 - 09/2020
- 0-to-1 ops for APP + Content SDK. DAU +200%, tiered ARPU +10%.
- Release SOP: go-live time -40%, delivery cycle -30%.
- Coin-based tiered model: high-value ARPU +50%, CAC -20%. 10 optimizations from feedback; retention +20%.

Company: Ping An Good House | Shanghai, China
Role: User Operations Manager | 12/2017 - 05/2019
- WeChat ecosystem marketing: 100K new users/month, CAC 30% below industry.
- Customer journey dashboard (Enterprise WeChat + CDP): key conversion +30%.

Company: Unilever | Shanghai, China
Role: Brand Specialist | 05/2015 - 12/2017
- PUGC ecosystem: weekly output +40%, reuse rate 75%.
- Tiered content library: 20+ articles/month (18%+ open rate). Managed external agency relationships."""

jd = """Alias - Head of Consumer Acquisition (Web3 Identity Protocol)
- Pre-launch, token incoming. Multi-million dollar budget.
- Manage 4 external agencies: performance marketing, KOL, PR, community
- Drive large verified user base before TGE
- Crypto consumer acquisition at scale experience required
- Personally negotiated KOL deals
- Agency management and accountability
- Multi-market awareness (Nigeria Telegram vs Korea Twitter)
- $15K/month retainer ($360K/year after)
- Founding team: payments, digital identity, engineering, capital markets"""

prompt = f"""CRITICAL RULES:
1. Use ONLY the companies, dates, education from the reference. DO NOT INVENT.
2. Personal info is fixed.
3. Reframe for Alias Web3 consumer acquisition role. Key angles:
   - Crypto exchange platform growth experience (XT.EXCHANGE = directly relevant)
   - User acquisition at scale (1.03M users/year at Ping An, 100K/month at Ping An Good House)
   - Multi-channel campaign orchestration (PUSH, in-app, WeChat, community, referrals)
   - A/B testing, experimentation, data-driven optimization
   - Agency/vendor management (Unilever agency partnerships, cross-functional coordination)
   - Budget-conscious optimization (CAC reduction, ROI tracking)
   - Community growth and engagement
   - SOP and playbook creation for scalable execution
4. Title should reflect consumer acquisition / growth leadership for crypto/Web3
5. English only. Follow the template format exactly.
6. Do NOT invent KOL negotiation experience. Bridge gaps honestly.
7. Output ONLY the completed resume (no preamble, no code blocks).

## Template
{template}

## Reference
{reference}

Fill the template now."""

print("Building Alias resume...")
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

md_path = PROJECT_ROOT / "简历/web3远程（Growth)/He Yuxian（Alias - Consumer Acquisition）.md"
md_path.write_text(result, encoding="utf-8")
print(result)
print(f"\nSaved to: {md_path}")
