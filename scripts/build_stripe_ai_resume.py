#!/usr/bin/env python3
"""Build Stripe AI Enablement resume from fintech base."""
import sys, json, re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from agent.client import call_claude

template = (PROJECT_ROOT / "简历.md").read_text(encoding="utf-8")

reference = """--- EXACT PERSONAL INFO (DO NOT CHANGE) ---
Name: Yuxian He | Nationality: Chinese | Gender: Female | Date of Birth: 27/08/1992
Tel: (+86) 18602125280 | Email: hyscandy@163.com | Location: Shanghai, China

--- WORK EXPERIENCE (DO NOT CHANGE COMPANIES/DATES) ---

Company: Ping An Securities | Shanghai, China
Role: Senior Operations Manager | 08/2020 - 02/2026
Key AI work:
- Led Xiao'an AI Assistant: MAU 0->280K in 6 months. "Content -> Ask AI -> Decide" loop. Community-to-AI conversion 12%->31%. AI users +2.1 trades/month, +32% AUM.
- AI content recommendation engine: CTR +1.8pp, reading time +40%, Community DAU +25%.
- AI-powered viral timing engine: behavior sequence model, trigger accuracy +22%, ineffective interruptions -35%.
- Used Claude Code / Codex for automated research, MVP deployment, operational optimization.
- AI Copilot for copy generation, experiment analysis, configuration validation.
- LLM-powered user feedback classification, sentiment alerting, auto-routing (P0/P1 fix turnaround +40%).
- Built KYC-based operations platform from 0 to 1.
- Account Achievement System: MOT landing page, leaderboard, badge wall. Sharing UV 100K-150K/month, PV 400K-500K.
- Managed cross-functional team (Product, Data, Content, Sales). SOP development.
- 1.03M new customers/year, D0 retention 50%, M1 retention 20%.

Company: 2345.com | Shanghai, China
Role: Product Operations Manager | 05/2019 - 09/2020
- Led 0-to-1 ops for APP + Content SDK. DAU +200%, tiered ARPU +10%.
- Built release SOP: go-live time -40%, delivery cycle -30%.
- 10 optimizations from feedback; retention +20%.

Company: Ping An Good House | Shanghai, China
Role: User Operations Manager | 12/2017 - 04/2019
- WeChat ecosystem marketing: 100K new users/month, CAC 30% below industry.
- Customer journey dashboard (Enterprise WeChat + CDP): key conversion +30%.

Company: Unilever | Shanghai, China
Role: Brand Specialist | 05/2015 - 12/2017
- PUGC ecosystem: weekly output +40%, reuse rate 75%.
- Tiered content library: 20+ articles/month (18%+ open rate)."""

jd = """Stripe - Marketing AI Enablement Coach / AI Transformation Specialist
- Build AI agents, automations, tools that change how real marketing work gets done
- Coach and enable ~20 marketers at varying stages of AI journey
- Meet people where they are; create desire for progress; adapt approach per person
- Understand marketing workflows, deliverables, tools deeply
- Pattern recognition: build for one, scale to many
- Bias to action: working POC today over polished deck next quarter
- New team, new operating model - comfortable with ambiguity
- 5+ years analytical + cross-functional experience
- Hands-on AI building (not just using chatbots - building WITH AI)
- Coaching/teaching track record with evidence of behavior change
- Strong communication to explain technical to non-technical
- Bonus: marketing/growth experience, Claude/Claude Code/Codex, change management, marketing tech stack, playbooks adopted beyond team, consulting/technical account management background"""

prompt = f"""CRITICAL RULES:
1. Use ONLY the companies, dates, education from the reference. DO NOT INVENT.
2. Personal info is fixed.

3. Reframe ALL experience for this Stripe role: Marketing AI Enablement Coach. This person helps marketers adopt AI by:
   - Building AI tools/agents/automations with them in real-time (Claude Code, LLM workflows)
   - Coaching them at their level, creating evidence of behavior change
   - Understanding their marketing workflows before transforming them
   - Spotting patterns (what works for one marketer -> scale to all 20)
   - Moving fast: working POC > polished deck
   - Operating in ambiguity (new team, new playbook)

4. Key experience to highlight:
   - AI Copilot for team (50% efficiency boost) -> this IS the job
   - Claude Code for automated research, MVP, operational optimization
   - LLM feedback classification & auto-routing -> AI automation replacing manual work
   - AI content recommendation engine -> AI transforming marketing delivery
   - SOP/playbook writing (100K-word Configuration Standards) -> adopted beyond team
   - Cross-functional coaching and enablement

5. The job title should reflect this: "Marketing AI Enablement Lead" or similar

6. English only. Follow the template format exactly. Output ONLY the resume (no preamble, no code blocks).

## Template
{template}

## Reference
{reference}

Fill the template now."""

print("Building Stripe AI Enablement resume...")
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

md_path = PROJECT_ROOT / "简历/fintech/He Yuxian（Stripe - AI Enablement）.md"
md_path.write_text(result, encoding="utf-8")
print(result)
print(f"\nSaved to: {md_path}")
