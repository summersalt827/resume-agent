#!/usr/bin/env python3
"""Build Arros AI - AI Product Manager resume from fintech+AI base."""
from fpdf import FPDF
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = PROJECT_ROOT / "投递岗位&定制化简历"


XT_BULLETS = [
    (
        "Defined and drove the product vision for a multi-channel growth platform at a Web3 "
        "exchange, building a 'User Audience x Creative Assets x Traffic Inventory' dynamic "
        "configuration platform with 8-dimension targeting, multilingual content library, and "
        "18 resource slots. Led end-to-end product lifecycle from concept to launch, managing "
        "the roadmap, prioritizing features, and coordinating Engineering, Data, and Business "
        "teams to deliver on time with zero configuration incidents."
    ),
    (
        "Conducted market research and competitive analysis on crypto exchange growth "
        "infrastructure, identifying gaps in automation and personalization. Translated "
        "findings into a product roadmap that improved operator self-service rate from 0 to "
        "90%+, compressing campaign configuration turnaround from 3-5 days to minutes."
    ),
    (
        "Built an AI-powered strategy recommendation engine integrating on-chain behavioral "
        "data (wallet interaction frequency, protocol preferences, trading patterns). "
        "Designed and deployed a tiered token incentive system, running A/B experiments "
        "that identified $30 as optimal first-deposit incentive and 7-day lock-up improving "
        "30-day retention from 45% to 61% (+23pp)."
    ),
    (
        "Embedded AI Copilot across the product development workflow--copy generation, "
        "experiment analysis, and configuration validation--boosting team efficiency by ~50%. "
        "Leveraged LLMs for automated user feedback classification with sentiment alerting "
        "and intelligent routing, improving P0/P1 resolution time by 40%."
    ),
    (
        "Led a 5-person product operations team, decomposing strategic goals into per-role "
        "OKRs driving 23 releases in 6 months. Authored Configuration Standards V1.8 "
        "(~100K words), establishing scalable product development practices adopted "
        "cross-functionally."
    ),
]

PA_BULLETS = [
    (
        "Defined product vision and go-to-market strategy for Xiao'an AI Assistant, an "
        "AI-powered investment advisory product. Led the end-to-end product lifecycle from "
        "concept validation through launch to scale, growing MAU from 0 to 280K in 6 months. "
        "Managed the product roadmap across four key scenarios: community content embedding "
        "(18% conversion), holdings page triggers (22% conversion), viral sharing integration "
        "(35% activation rate), and AI-powered strategy navigation."
    ),
    (
        "Conducted competitive analysis and user research to identify AI investment tool "
        "market opportunities. Prioritized feature development based on customer feedback "
        "and behavioral data, resulting in AI users demonstrating +2.1 more monthly trades "
        "and +32% higher average AUM compared to non-AI users."
    ),
    (
        "Collaborated with Engineering, Data, Content, and Commercial teams to deploy an "
        "AI-powered content recommendation engine matching premium content to users based on "
        "portfolio structure, trading style, and browsing behavior. Increased CTR by 1.8pp, "
        "average reading time by 40%, and Community DAU by 25%."
    ),
    (
        "Deployed an AI-powered user behavior sequence model combining market intensity, "
        "sharing history, and time-slot activity for real-time optimization. Led agile sprints "
        "with cross-functional teams, improving trigger accuracy by 22% and reducing "
        "ineffective interruptions by 35%."
    ),
    (
        "Owned product KPIs and used data-driven insights to inform product decisions. "
        "Built a 'Market Analysis->Strategy Matching->Trading->Viral Loop' conversion "
        "funnel acquiring 1.03M new customers annually (D0 retention 50%, M1 retention 20%). "
        "Analyzed customer feedback to drive continuous product improvement."
    ),
]

C2345_BULLETS = [
    (
        "Led 0-to-1 product development for APP and Content SDK, defining product vision "
        "and strategy for an internal startup. Managed the full product lifecycle, "
        "prioritizing features and coordinating Product, R&D, and Content teams. Grew DAU "
        "by 200% and increased tiered ARPU by 10%."
    ),
    (
        "Established a 'Business Metric->Operations Action->Data Dashboard' product "
        "alignment mechanism, gathering and analyzing user feedback to drive 10 core "
        "feature optimizations. Shortened requirement delivery cycle by 30% and improved "
        "month-over-month retention by 20%."
    ),
    (
        "Built standardized product release SOPs defining stage entry/exit criteria. "
        "Reduced key release go-live time by 40% and improved issue response efficiency "
        "by 25% in a fast-paced startup environment."
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
        "AI product management leader with 11 years of experience defining product vision, "
        "driving end-to-end product lifecycle, and scaling AI-powered products from 0 to 1. "
        "Proven track record launching and growing AI products (Xiao'an AI: 0 to 280K MAU "
        "in 6 months) through cross-functional collaboration with Engineering, Data, Design, "
        "and Commercial teams. Deep understanding of AI/LLM technologies (Claude Code, Codex, "
        "prompt engineering, AI agent evaluation) and their practical application in product "
        "development. Data-driven decision-maker with strong product intuition--50+ A/B "
        "experiments, full-funnel analytics, and customer feedback-driven iteration. Skilled "
        "in agile methodologies, product roadmap development, and competitive analysis."
    )

    pdf.section_header("Work Experience")

    pdf.job_header(
        "XT.EXCHANGE",
        "AI Product Lead (Platform Operations Director)",
        "12/2024 - Present",
    )
    for b in XT_BULLETS:
        pdf.bullet(b)

    pdf.job_header(
        "Ping An Securities",
        "Senior Product Manager (Growth & AI)",
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
        "Defined product strategy for WeChat ecosystem private domain marketing platform "
        "(Enterprise WeChat + Official Account + Mini Program). Led cross-functional team "
        "coordinating Engineering, Sales, and Marketing to deliver product features. "
        "Achieved 100K new users/month with CAC 30% below industry average."
    )
    pdf.bullet(
        "Built customer journey dashboard integrating CDP and Enterprise WeChat data. "
        "Conducted customer feedback analysis to prioritize product improvements, increasing "
        "key stage conversion by 30%."
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
    pdf.cell(0, 4.5, "AI & Product:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "AI product strategy and roadmap, LLM application design (Claude Code, Codex), "
        "prompt engineering, AI agent evaluation, product lifecycle management, agile/Scrum, "
        "competitive analysis, market research, user research and customer feedback analysis."
    )
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 4.5, "Data & Analytics:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "SQL, Python (data processing, scripting), A/B testing and experimentation, "
        "full-funnel analytics, business intelligence dashboards, data-driven product "
        "decision-making."
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
    out_path = OUT_DIR / "He Yuxian（Arros AI - AI Product Manager）.pdf"
    pdf.output(str(out_path))
    print(f"PDF saved to: {out_path}")
    return out_path


if __name__ == "__main__":
    build()
