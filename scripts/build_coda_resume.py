#!/usr/bin/env python3
"""Build Coda - Director, Commercial Strategy & Revenue Operations resume."""
from fpdf import FPDF
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = PROJECT_ROOT / "投递岗位&定制化简历"


XT_BULLETS = [
    (
        "Built the commercial intelligence and revenue operations infrastructure for a global "
        "Web3 exchange, owning pipeline governance, revenue reporting, and commercial analytics "
        "across 100+ markets. Synthesized transaction data, user behavior patterns, and "
        "competitive dynamics into strategic recommendations for C-suite leadership, driving "
        "first-deposit conversion from 14% to 24% (+71%) and reducing CAC from $42 to $34 (-18%)."
    ),
    (
        "Designed and deployed a tiered token incentive commercial model evaluating $2,470/user "
        "lifetime reward value with 416% composite ROI. Built the analytical framework that "
        "informed pricing and incentive allocation decisions, running 50+ A/B experiments "
        "identifying $30 as the optimal first-deposit incentive threshold."
    ),
    (
        "Drove AI-led process improvement across the commercial organisation, embedding AI "
        "Copilot for copy generation, experiment analysis, and configuration validation that "
        "boosted team efficiency by ~50%. Leveraged LLMs for automated user feedback "
        "classification, sentiment alerting, and intelligent routing, improving P0/P1 "
        "resolution time by 40%."
    ),
    (
        "Owned commercial reporting and KPI tracking for a 5-person platform operations team, "
        "decomposing strategic goals into per-role OKRs driving 23 releases in 6 months. "
        "Established global frequency control framework (P0-P2) with cross-channel "
        "deduplication and real-time monitoring dashboards."
    ),
    (
        "Built end-to-end automated commercial workflows integrating on-chain behavioral data "
        "(wallet interaction, protocol preferences, trading patterns) with CRM-like pipeline "
        "management, eliminating 3-5 day manual turnaround and achieving 90%+ self-service rate."
    ),
]

PA_BULLETS = [
    (
        "Served as the commercial analytics and strategy engine for a securities retail platform "
        "managing $50B+ cumulative incremental AUM. Synthesized pipeline data, trading behavior "
        "patterns, and market trends into strategic recommendations for senior leadership. Built "
        "commercial models that informed market prioritization and resource allocation decisions."
    ),
    (
        "Owned the commercial narrative and performance reporting for the retail growth division, "
        "translating complex trading, acquisition, and AUM data into clear strategic insight. "
        "Built forecasting infrastructure giving leadership real-time visibility on acquisition "
        "performance across channels, achieving 1.03M new customers annually."
    ),
    (
        "Designed a market-driven commercial engine triggering user acquisition during market "
        "rallies (>2%) or individual stock movements (>5%), achieving 1:10 viral efficiency "
        "with CAC of approximately RMB 1.1. Defined pipeline stages, qualification frameworks, "
        "and conversion metrics across the full funnel."
    ),
    (
        "Deployed AI-powered analytics and automation: built an AI content recommendation engine "
        "that increased CTR by 1.8pp and reading time by 40%; deployed an AI behavioral sequence "
        "model improving trigger accuracy by 22% and reducing ineffective interruptions by 35%. "
        "Grew Xiao'an AI Assistant from 0 to 280K MAU in 6 months."
    ),
    (
        "Led cross-functional alignment across Product, Data, Content, Sales, and Engineering "
        "teams. Built customer journey dashboards integrating CDP and trading data, driving "
        "data-informed commercial decisions that increased key stage conversion by 30% and "
        "reactivated 150K+ silent customers annually."
    ),
]

C2345_BULLETS = [
    (
        "Built commercial operations infrastructure from 0 to 1 for an internal startup (APP + "
        "Content SDK). Established a 'Business Metric -> Operations Action -> Data Dashboard' "
        "performance framework, defining KPIs and reporting cadence that aligned Product, R&D, "
        "and Content teams. Shortened requirement delivery cycle by 30%."
    ),
    (
        "Developed tiered commercial models dynamically adjusting incentive strategies based on "
        "DAU and ARPU data, coupled with CAC optimization that reduced acquisition cost by 20% "
        "while increasing high-value user ARPU by 50%. Grew overall DAU by 200%."
    ),
    (
        "Built standardized commercial reporting and release governance: stage entry/exit "
        "criteria, quality gates, and accountability frameworks that reduced go-live time "
        "by 40% and improved issue response efficiency by 25%."
    ),
]


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

    def job_header(self, company: str, role: str, period: str):
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

    pdf.section_header("Professional Summary")
    pdf.body_text(
        "Commercial strategy and revenue operations leader with 11 years of experience "
        "building analytical frameworks, driving process automation, and delivering strategic "
        "insight at the executive level. Proven track record owning commercial intelligence "
        "and pipeline governance for fintech and securities platforms managing $50B+ in "
        "cumulative AUM and serving over 1M+ customers. AI-native operator: deeply embedded "
        "AI/LLM tools (Claude Code, Codex) to automate workflows, build commercial models, "
        "and synthesize complex data into actionable strategy -- boosting team efficiency by "
        "~50%. Strong cross-functional leader experienced in aligning Sales, Product, Data, "
        "and Engineering teams around commercial objectives. Comfortable producing "
        "board-ready output and presenting to C-suite audiences."
    )

    pdf.section_header("Work Experience")

    pdf.job_header(
        "XT.EXCHANGE",
        "Director, Platform Operations & Commercial Strategy",
        "12/2024 - Present",
    )
    for b in XT_BULLETS:
        pdf.bullet(b)

    pdf.job_header(
        "Ping An Securities",
        "Senior Manager, Commercial Strategy & Growth Operations",
        "08/2020 - 02/2026",
    )
    for b in PA_BULLETS:
        pdf.bullet(b)

    pdf.job_header(
        "2345.com",
        "Commercial Operations Lead (Internal Startup)",
        "05/2019 - 09/2020",
    )
    for b in C2345_BULLETS:
        pdf.bullet(b)

    pdf.job_header(
        "Ping An Good House",
        "User Operations Manager",
        "12/2017 - 05/2019",
    )
    pdf.bullet(
        "Built commercial operations infrastructure for WeChat ecosystem platform, defining "
        "pipeline stages, conversion metrics, and reporting cadence. Delivered 100K new "
        "users/month with CAC 30% below industry average. Built customer analytics dashboards "
        "integrating CDP and CRM data for real-time commercial visibility."
    )
    pdf.bullet(
        "Led cross-functional process improvement across Sales, Marketing, and Product, "
        "standardizing lead-to-deal workflows and qualification frameworks that increased "
        "key stage conversion by 30% and sales efficiency by 3 deals/month."
    )

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

    pdf.section_header("Skills")

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 4.5, "Commercial Strategy & Analytics:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "Pipeline analytics and forecasting, commercial modeling, revenue operations, "
        "market analysis and competitive intelligence, investor/board-level reporting, "
        "strategic resource allocation, pricing and incentive model design."
    )
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 4.5, "AI & Automation:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "AI-native workflow automation (Claude Code, Codex), LLM-powered analytics and "
        "classification, automated reporting and dashboarding, process optimization via AI, "
        "API integrations and low-code automation (n8n/Zapier)."
    )
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 4.5, "Tools & Technical:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "Python, SQL, CRM platforms (HubSpot familiarity), BI dashboards, A/B testing "
        "and experimentation frameworks, CDP/DMP platforms, cross-functional process "
        "design and governance."
    )
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 4.5, "Languages:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "Chinese (Native); English (Professional working proficiency, IELTS)."
    )

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / "He Yuxian（Coda - Director, Commercial Strategy & Revenue Operations）.pdf"
    pdf.output(str(out_path))
    print(f"PDF saved to: {out_path}")
    return out_path


if __name__ == "__main__":
    build()
