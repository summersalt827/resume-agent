#!/usr/bin/env python3
"""Build Arki Finance - Technical Product Manager resume from fintech base."""
from fpdf import FPDF
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = PROJECT_ROOT / "投递岗位&定制化简历"


XT_BULLETS = [
    (
        "Owned the product roadmap for a multi-channel growth platform at a regulated Web3 "
        "exchange, prioritizing features against business outcomes, user feedback, and "
        "compliance constraints. Defined and instrumented success metrics for every feature "
        "shipped, driving first-deposit conversion from 14% to 24% (+71%) and 30-day "
        "retention from 45% to 61% (+23pp)."
    ),
    (
        "Translated product decisions into unambiguous technical requirements for a 10-layer "
        "rule engine (Launch->Schedule->Channel->Device->Geo->Audience->Grayscale->A/B->"
        "Frequency->Priority) spanning 18 resource slots. Collaborated directly with "
        "Engineering on API design, data architecture, and system constraints, eliminating "
        "daily hand-holding and achieving zero configuration incidents."
    ),
    (
        "Led new feature workstreams from discovery to delivery, evaluating build vs. buy vs. "
        "integrate decisions. Designed a tiered token incentive system integrating on-chain "
        "behavioral data APIs (wallet interaction, protocol preferences, trading patterns), "
        "running 50+ A/B experiments that identified $30 as optimal first-deposit incentive."
    ),
    (
        "Coordinated with Operations and Compliance teams on KYC/onboarding flows, ensuring "
        "features were built within regulatory boundaries from the start. Established P0-P2 "
        "frequency control framework with cross-channel deduplication, reducing unsubscribe "
        "rate by 30-50% while maintaining compliance guardrails."
    ),
    (
        "Ran lean Agile delivery--sprint planning, backlog grooming, retrospectives--for a "
        "5-person product team. Identified and removed blockers proactively, delivering 23 "
        "releases in 6 months. Authored Configuration Standards V1.8 (~100K words) as the "
        "single source of truth for product requirements."
    ),
]

PA_BULLETS = [
    (
        "Owned the product roadmap for Xiao'an AI Assistant, an AI-powered investment advisory "
        "product on a regulated securities platform. Synthesized user feedback from 280K MAU, "
        "operational learnings, and compliance requirements into prioritized product decisions. "
        "Made scope and trade-off decisions grounded in data across four product scenarios."
    ),
    (
        "Engaged directly with Engineering on API design and data architecture for an AI "
        "content recommendation engine matching premium investment content (market reviews, "
        "strategy analysis, industry deep dives) to users based on portfolio structure, trading "
        "style, and browsing behavior. Increased CTR by 1.8pp and reading time by 40%."
    ),
    (
        "Coordinated with Operations, Compliance, and Investment teams to ensure all features "
        "adhered to securities regulatory requirements. Built KYC-segmented customer journeys "
        "on a regulated retail brokerage platform, translating investment operations requirements "
        "into scalable product decisions that acquired 1.03M customers annually."
    ),
    (
        "Defined and instrumented success metrics across the full conversion funnel: 'Market "
        "Analysis->Strategy Matching->Trading->Viral Loop'. Deployed AI-powered behavioral "
        "sequence models for real-time trigger optimization, improving accuracy by 22% and "
        "reducing ineffective interruptions by 35%. Communicated product progress and strategy "
        "to C-suite leadership."
    ),
    (
        "Balanced new feature development against existing product stability on a platform "
        "managing $50B+ cumulative incremental AUM. Built customer journey dashboards "
        "integrating CDP and trading data, delivering product insights that increased key "
        "stage conversion by 30%."
    ),
]

C2345_BULLETS = [
    (
        "Led 0-to-1 product development for APP and Content SDK as an internal startup lead, "
        "owning the product roadmap and making build vs. buy vs. integrate decisions in a "
        "resource-constrained environment. Grew DAU by 200% and tiered ARPU by 10%."
    ),
    (
        "Ran lean Agile delivery with cross-functional Engineering, Product, R&D, and Content "
        "teams. Standardized release iteration SOPs with clear quality gates and stage "
        "entry/exit criteria, reducing go-live time by 40% and improving issue response "
        "efficiency by 25%."
    ),
    (
        "Translated user feedback from tens of thousands of entries into prioritized product "
        "requirements, driving 10 core feature optimizations that improved month-over-month "
        "retention by 20%. Shortened requirement delivery cycle by 30% through process "
        "optimization."
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
        "Technical Product Manager with 11 years of experience across regulated fintech, "
        "securities brokerage, and digital investment platforms. Proven track record owning "
        "product roadmaps, writing technical requirements (REST APIs, data schemas, SQL), "
        "and leading Agile delivery with Engineering teams. Deep domain expertise in KYC/AML "
        "workflows, trade lifecycle, settlements, reconciliation, and fund operations -- built "
        "on hands-on experience shipping live products on regulated financial platforms managing "
        "$50B+ in cumulative AUM. Strong written communication: PRDs, configuration standards "
        "(100K+ words SOPs), and executive reporting. Comfortable in lean, high-ownership "
        "environments making build vs. buy vs. integrate decisions grounded in data."
    )

    pdf.section_header("Work Experience")

    pdf.job_header(
        "XT.EXCHANGE",
        "Technical Product Manager (Platform & Growth)",
        "12/2024 - Present",
    )
    for b in XT_BULLETS:
        pdf.bullet(b)

    pdf.job_header(
        "Ping An Securities",
        "Senior Product Manager (Investment Platform & AI)",
        "08/2020 - 02/2026",
    )
    for b in PA_BULLETS:
        pdf.bullet(b)

    pdf.job_header(
        "2345.com",
        "Product Operations Manager (Internal Startup Lead)",
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
        "Owned product strategy for WeChat ecosystem private domain platform integrating "
        "Enterprise WeChat, Official Account, and Mini Program. Made build vs. integrate "
        "decisions for CDP and customer journey dashboard. Achieved 100K new users/month "
        "with CAC 30% below industry average."
    )
    pdf.bullet(
        "Built customer journey analytics integrating CDP with WeChat Work data. Defined "
        "success metrics (add rate, virtual tour conversion, deal cycle) and instrumented "
        "tracking, increasing key stage conversion by 30%."
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
    pdf.cell(0, 4.5, "Product & Delivery:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "Product roadmap ownership, PRD writing, Agile/Scrum delivery, sprint planning & "
        "backlog grooming, build vs. buy vs. integrate evaluation, feature instrumentation "
        "and success metrics, stakeholder communication, executive reporting."
    )
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 4.5, "Technical:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "REST API design and documentation, SQL (data analysis, schema interpretation), "
        "Python (data processing, automation), API integrations (Clay/Apollo, n8n/Zapier), "
        "data pipeline concepts, technical requirement writing, architecture discussion "
        "participation."
    )
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 4.5, "Financial Domain:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "KYC/AML workflows, trade lifecycle, settlements & reconciliation, fund accounting "
        "operations, regulated securities brokerage, digital investment platforms, "
        "compliance-by-design product development."
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
    out_path = OUT_DIR / "He Yuxian（Arki Finance - Technical Product Manager）.pdf"
    pdf.output(str(out_path))
    print(f"PDF saved to: {out_path}")
    return out_path


if __name__ == "__main__":
    build()
