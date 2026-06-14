#!/usr/bin/env python3
"""Generate Wise-customized resume from fintech base."""
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from agent.client import call_claude
from prompts.system_prompts import CUSTOMIZE_SYSTEM

# Read base fintech resume
base = (PROJECT_ROOT / "简历/fintech/He Yuxian（Fintech Platform Operation）.md").read_text()

jd = """APAC Regional PC&R Operations at Wise

Responsibilities:
- Manage the end-to-end regional review cadence. Maintain and improve the process to ensure that APAC-specific product launches and updates are reviewed for compliance and risk with high velocity and clear stakeholder accountability.
- Help execute and refine core PC&R processes within the APAC region, with a specific focus on issues management. Ensure regional risks are identified, tracked, and resolved in a timely manner.
- Help align and coordinate APAC's PC&R committed initiatives with both the global PC&R roadmap and regional product goals to ensure we are working on the most impactful tasks.
- Own and operate the internal rituals that keep our APAC team connected and high-performing.
- Work closely with the Global Ops team to ensure APAC-specific documentation, meeting outcomes, and regulatory insights are captured within the central knowledge base.
- Help to coordinate and hold stakeholders accountable towards PC&R's quarterly committee meetings in the region.

Qualifications:
- Organized & Detail-Oriented: Natural project manager, juggle regional priorities without losing sight of small details in a regulated environment.
- Process Oriented: Look for ways to make processes better, passionate about efficiency and building workflows that save people time.
- Great Communicator: Understand APAC regional nuances, communicate effectively with stakeholders from diverse cultural and professional backgrounds.
- Tooling Experience: Proficient with JIRA & G-Suite for tracking complex workflows and communicating data/project updates clearly.
- Resilient & Proactive: Thrive in fast-paced environment, comfortable taking the lead to solve problems before they escalate."""

prompt = f"""I'm applying for an APAC Regional PC&R (Policy, Compliance & Regulatory) Operations role at Wise (a global fintech company).

## Target Job Description
{jd}

## My Current Resume (Fintech version)
{base}

## Instructions
Please customize my resume for this Wise PC&R Operations role by:

1. **Reframe my experience** from "marketing/growth" to "operations/program management" lens — my core skills (process building, stakeholder coordination, risk tracking, workflow optimization) are highly transferable.
2. **Highlight these transferable skills from my experience:**
   - End-to-end process management and SOP building (30% faster delivery, 40% faster go-live)
   - Multi-stakeholder coordination (Product, Data, Content, Sales, Engineering teams)
   - Issues/risk tracking and resolution (A/B testing feedback loops, push notification quality control)
   - Documentation and knowledge management (playbooks, launch frameworks, post-campaign reports)
   - Quarterly/regular review cadences (campaign review cycles, OKR tracking)
   - APAC regional experience (worked in Shanghai across fintech regulated environments)
3. **Use this title/headline:** "APAC Regional Operations & Program Manager" or similar ops-focused
4. **Add Wise-specific keywords:** regulatory compliance, risk review, issues management, stakeholder accountability, review cadence, knowledge base, JIRA, G-Suite, quarterly committee, APAC
5. **Keep it truthful** — don't fabricate experience, only reframe what's already there
6. **Output format:** English resume first (1 page), then `---` separator, then Chinese version (中文版). Output as clean Markdown.
7. **Filename hint:** include "Wise" in the mental model but don't write the filename in the output

Output the complete customized resume now."""

print("Customizing resume for Wise PC&R role...")
result = call_claude(
    messages=[{"role": "user", "content": prompt}],
    system=CUSTOMIZE_SYSTEM,
    max_tokens=8192,
    temperature=0.3,
)

output_path = PROJECT_ROOT / "简历/fintech/He Yuxian（Wise - APAC PC&R Operations）.md"
output_path.write_text(result, encoding="utf-8")
print(result)
print(f"\nSaved to: {output_path}")
