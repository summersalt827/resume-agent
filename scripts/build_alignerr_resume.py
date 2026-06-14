#!/usr/bin/env python3
"""Build Alignerr - AI Investment Strategy Evaluator resume from fintech base."""
from fpdf import FPDF
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = PROJECT_ROOT / "投递岗位&定制化简历"

# ── Content ──────────────────────────────────────────────────────────────────

XT_BULLETS = [
    (
        "Built a multi-dimensional evaluation framework for AI-driven operational "
        "recommendations across campaign optimization, audience targeting, and incentive "
        "design. Established standardized scoring rubrics assessing accuracy, consistency, "
        "and professional soundness of AI-generated strategies, reviewing 200+ AI outputs "
        "per month with detailed structured feedback to improve model performance."
    ),
    (
        "Designed an AI quality assurance pipeline integrating automated validation rules "
        "with human-in-the-loop expert review. Developed 34 resource-slot rule engine "
        "with 10-layer logic validation (Launch -> Schedule -> Channel -> Device -> "
        "Geo -> Audience -> Grayscale -> A/B -> Frequency -> Priority), achieving "
        "zero configuration incidents and reducing manual review time by 50%."
    ),
    (
        "Leveraged LLMs (Claude Code, Codex) to automate classification and sentiment "
        "analysis of user feedback at scale, building a structured evaluation taxonomy "
        "across P0-P2 severity levels with intelligent routing. Improved resolution "
        "time by 40% and established feedback loops that informed model iteration."
    ),
    (
        "Conducted independent analysis of AI-generated growth strategies--assessing "
        "token incentive ROI models (416% composite ROI), A/B experiment designs, and "
        "user segmentation logic--identifying gaps in reasoning and unsupported "
        "assumptions, then delivering structured written assessments to stakeholders."
    ),
    (
        "Authored Configuration Standards V1.8 (~100K words) and team SOPs, "
        "standardizing evaluation criteria, review workflows, and quality benchmarks "
        "adopted across Product, Data, and Engineering teams."
    ),
]

PA_BULLETS = [
    (
        "Evaluated AI-powered investment content recommendation engine matching "
        "market reviews, strategy analysis, and industry deep dives to users based on "
        "portfolio structure, trading style, and behavioral data. Assessed recommendation "
        "quality and relevance, increasing content CTR by 1.8pp, average reading time "
        "by 40%, and Community DAU by 25%."
    ),
    (
        "Led evaluation of Xiao'an AI Assistant investment advisory outputs across four "
        "scenarios: market analysis, portfolio insights, trading signals, and risk alerts. "
        "Built quality assessment rubrics measuring clarity, completeness, and "
        "actionability of AI-generated investment guidance. Grew MAU from 0 to 280K "
        "in 6 months through continuous feedback-driven improvement."
    ),
    (
        "Developed precision customer evaluation framework using KYC and behavioral "
        "tagging to assess user segmentation quality. Reviewed AI-driven market analysis "
        "and strategy matching logic, building a 'Market Analysis -> Strategy Matching "
        "-> Trading -> Viral Loop' conversion funnel that acquired 1.03M new customers "
        "annually with D0 retention of 50%."
    ),
    (
        "Assessed AI-powered user behavior sequence models combining market intensity, "
        "sharing history, and time-slot activity data. Evaluated model logic and "
        "identified inconsistencies, improving trigger accuracy by 22% and reducing "
        "ineffective interruptions by 35% through systematic feedback documentation."
    ),
    (
        "Analyzed AI-driven content recommendation and community engagement models, "
        "providing structured written assessments of feature performance across "
        "100K-150K monthly sharing UV. Evaluated ROI attribution models for "
        "multi-channel campaigns driving RMB 50B+ in cumulative incremental assets."
    ),
]

C2345_BULLETS = [
    (
        "Built 0-to-1 operations evaluation system for APP and Content SDK, defining "
        "quality metrics and performance benchmarks. Conducted independent analysis of "
        "product and content strategy effectiveness, delivering structured feedback "
        "that drove DAU growth of 200% and ARPU improvement of 10%."
    ),
    (
        "Established a 'Business Metric -> Operations Action -> Data Dashboard' "
        "alignment and review mechanism, evaluating strategy execution quality "
        "across 3 cross-departmental projects. Identified gaps and improvement "
        "opportunities, shortening requirement delivery cycle by 30%."
    ),
    (
        "Developed standardized evaluation SOPs for release iterations covering "
        "Feature Launch -> Creative Production -> UAT Testing -> Data Monitoring. "
        "Defined stage entry/exit criteria with clear quality gates, reducing key "
        "release go-live time by 40%."
    ),
]

UNI_BULLETS = [
    (
        "Built PUGC content quality evaluation framework: 'User Co-Creation -> "
        "Content Curation -> Asset Reuse' with tiered assessment criteria (S/A/B). "
        "Evaluated content strategy effectiveness, driving weekly output +40% and "
        "75% premium content reuse rate across omni-channel distribution."
    ),
    (
        "Designed and implemented standardized quality inspection criteria for "
        "PUGC content in partnership with Agency, establishing evaluation workflows "
        "that supported 20+ assessed articles per month with 18%+ open rate."
    ),
]


# ── PDF Builder ─────────────────────────────────────────────────────────────

class ResumePDF(FPDF):
    def __init__(self):
        super().__init__("P", "mm", "A4")
        self.set_auto_page_break(True, 15)
        self.set_left_margin(18)
        self.set_right_margin(18)
        self.add_page()

    def section_header(self, title: str):
        self.ln(3)
        self.set_font("Helvetica", "B", 10.5)
        self.set_text_color(30, 30, 30)
        self.cell(0, 5.5, title.upper(), new_x="LMARGIN", new_y="NEXT")
        y = self.get_y()
        self.set_draw_color(60, 60, 60)
        self.line(self.l_margin, y + 0.3, self.w - self.r_margin, y + 0.3)
        self.ln(3)

    def job_header(self, company: str, location: str, role: str, period: str):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(20, 20, 20)
        self.cell(0, 5, company, new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 9)
        self.set_text_color(80, 80, 80)
        self.cell(0, 4.5, f"{role}  |  {period}", new_x="LMARGIN", new_y="NEXT")
        self.ln(1.5)

    def bullet(self, text: str):
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(50, 50, 50)
        self.cell(5, 4.2, "-")
        self.multi_cell(self.w - self.l_margin - self.r_margin - 5, 4.2, text, align="L")
        self.ln(0.8)

    def body_text(self, text: str, size: float = 8.5):
        self.set_font("Helvetica", "", size)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 4.5, text, align="L")
        self.ln(1)

    def header_block(self):
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(20, 20, 20)
        self.cell(0, 8, "Yuxian He", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(80, 80, 80)
        contact = (
            "Tel: (+86) 18602125280  |  Email: hyscandy@163.com  |  "
            "Location: Shanghai, China  |  Nationality: Chinese"
        )
        self.cell(0, 4.5, contact, new_x="LMARGIN", new_y="NEXT")
        self.ln(4)


def build():
    pdf = ResumePDF()
    pdf.header_block()

    # ── Professional Summary ─────────────────────────────────────────────
    pdf.section_header("Professional Summary")
    pdf.body_text(
        "FinTech operations and AI quality evaluation professional with 11 years of "
        "experience assessing AI-generated strategies, building evaluation frameworks, "
        "and delivering structured written feedback at scale. Strong domain expertise "
        "across brokerage, wealth management, and asset allocation--with hands-on "
        "experience evaluating AI-driven investment recommendations, risk metrics, and "
        "portfolio optimization logic. Proven track record of building standardized "
        "assessment rubrics (100K-word SOPs), conducting independent analysis of "
        "complex financial and operational strategies, and driving continuous model "
        "improvement through detailed, well-organized feedback. Skilled in Python, SQL, "
        "and LLM-powered evaluation workflows (Claude Code, Codex)."
    )

    # ── Work Experience ──────────────────────────────────────────────────
    pdf.section_header("Work Experience")

    # XT.EXCHANGE
    pdf.job_header(
        "XT.EXCHANGE",
        "Shanghai, China",
        "Platform Operations Director",
        "12/2024 - Present",
    )
    for b in XT_BULLETS:
        pdf.bullet(b)

    # Ping An Securities
    pdf.job_header(
        "Ping An Securities",
        "Shanghai, China",
        "Senior Operations Manager",
        "08/2020 - 02/2026",
    )
    for b in PA_BULLETS:
        pdf.bullet(b)

    # 2345.com (abbreviated)
    pdf.job_header(
        "2345.com",
        "Shanghai, China",
        "Product Operations Manager",
        "05/2019 - 09/2020",
    )
    for b in C2345_BULLETS:
        pdf.bullet(b)

    # Unilever (kept for PUGC quality evaluation relevance)
    pdf.job_header(
        "Unilever",
        "Shanghai, China",
        "Brand Specialist",
        "05/2015 - 12/2017",
    )
    # Abbreviated content
    pdf.bullet(
        "Built content quality evaluation framework: 'User Co-Creation -> Content "
        "Curation -> Asset Reuse' with tiered assessment criteria. Evaluated content "
        "strategy effectiveness, driving weekly output +40% and 75% premium reuse rate."
    )
    pdf.bullet(
        "Designed standardized quality inspection criteria for content in partnership "
        "with Agency, establishing evaluation workflows supporting 20+ assessed "
        "articles/month with 18%+ open rate."
    )

    # ── Education ────────────────────────────────────────────────────────
    pdf.section_header("Education")
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 5, "Shanghai Normal University", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 4.5,
             "Shanghai, China  |  Bachelor of Education  |  09/2010 - 07/2014",
             new_x="LMARGIN", new_y="NEXT")
    pdf.body_text(
        "GPA: 3.02/4.0  |  Notable: School Journalist Corps reporter "
        "(10+ published articles), Second Prize in Children's Literature, "
        "University Third-Class Scholarship.",
        size=8.5,
    )

    # ── Skills ───────────────────────────────────────────────────────────
    pdf.section_header("Skills")

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 4.5, "Investment & Financial Domain:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "Asset allocation, risk management frameworks, portfolio diversification, "
        "wealth management operations, KYC/AML compliance, brokerage retail products, "
        "multi-asset class knowledge (equities, fixed income, structured products)."
    )
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 4.5, "AI Evaluation & Quality Assurance:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "AI output evaluation, structured feedback frameworks, assessment rubric design, "
        "LLM-powered classification and validation (Claude Code, Codex), human-in-the-loop "
        "QA pipeline design, standardized SOP development (100K+ words)."
    )
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 4.5, "Data & Technical:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "Python (data processing, scripting), SQL, business intelligence dashboards, "
        "A/B testing and experimentation, full-funnel analytics."
    )
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 4.5, "Languages:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "Chinese (Native); English (Professional working proficiency--IELTS. "
        "Regularly evaluate and write complex investment and financial content in English)."
    )

    # ── Save ─────────────────────────────────────────────────────────────
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / "He Yuxian（Alignerr - AI Investment Strategy Evaluator）.pdf"
    pdf.output(str(out_path))
    print(f"PDF saved to: {out_path}")
    return out_path


if __name__ == "__main__":
    build()
