#!/usr/bin/env python3
"""Build Boku - Growth Product Manager resume from fintech base."""
from fpdf import FPDF
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = PROJECT_ROOT / "投递岗位&定制化简历"


XT_BULLETS = [
    (
        "Owned end-to-end growth funnel across acquisition, activation, retention, and expansion "
        "for a Web3 exchange platform. Identified highest-impact opportunities through funnel "
        "analysis, improving first-deposit conversion from 14% to 24% (+71%) and reducing "
        "CAC from $42 to $34 (-18%). Defined and tracked key growth metrics (conversion rate, "
        "retention rate, CAC, LTV) driving data-informed product decisions."
    ),
    (
        "Designed and ran 50+ A/B experiments on onboarding flows, incentive structures, and "
        "channel strategies. Built a 'User Tier x Incentive Type x Channel' 3D activation engine "
        "targeting crypto-native behaviors, identifying $30 as optimal first-deposit incentive "
        "and 7-day lock-up that improved 30-day trading retention from 45% to 61% (+23pp)."
    ),
    (
        "Built a 10-layer rule engine (Launch -> Schedule -> Channel -> Device -> Geo -> "
        "Audience -> Grayscale -> A/B -> Frequency -> Priority) for end-to-end automated "
        "delivery across 18 resource slots. Improved operator self-service rate from 0 to "
        "90%+, compressing configuration turnaround from 3-5 days to minutes."
    ),
    (
        "Established multi-tier PUSH strategy with global frequency control (<=5/week, <=2/day, "
        "nighttime silent, cross-channel deduplication), 7-day progressive onboarding for new "
        "users, and gradual dormant reactivation. Reduced unsubscribe rate by 30-50%, lifted "
        "dormant revival rate from 3% to 11%. Prioritized initiatives using RICE framework."
    ),
    (
        "Leveraged AI/LLM tools (Claude Code) for automated experiment analysis, user feedback "
        "classification, and growth strategy prototyping. Embedded AI Copilot across copy "
        "generation and configuration validation, boosting team efficiency by ~50%. Collaborated "
        "cross-functionally with Product, Data, Commercial, and Engineering teams."
    ),
]

PA_BULLETS = [
    (
        "Drove full-funnel growth for securities retail platform, owning acquisition, activation, "
        "and AUM expansion KPIs. Built a 'Market Analysis -> Strategy Matching -> Trading -> "
        "Viral Loop' conversion funnel, acquiring 1.03M new customers annually (D0 retention "
        "50%, M1 retention 20%). Defined growth metrics and built dashboards for real-time "
        "funnel monitoring."
    ),
    (
        "Designed market-driven viral acquisition engine triggering user emotional moments during "
        "market rallies (>2%) or individual stock movements (>5%). Deployed dynamic personalized "
        "campaign displays and sharing entry points on core APP pages, achieving >=50% in-app "
        "share rate and >=1:10 viral efficiency with CAC of approx. RMB 1.1 per user."
    ),
    (
        "Built an Account Achievement System with MOT landing pages, Anonymous Returns Leaderboard, "
        "and Investment Badge Wall distributed via omni-channel precision push across Push, "
        "Pop-up, Banner, Trading, and Asset pages. Achieved 100K-150K monthly sharing UV and "
        "400K-500K monthly sharing PV through systematic experimentation and iteration."
    ),
    (
        "Led existing customer asset growth program integrating trading data, holdings data, and "
        "DMP/CDP platforms. Reactivated 150K+ silent customers annually, drove 500K active user "
        "growth, and increased average AUM per account by RMB 10M. Continuously optimized user "
        "journeys to improve time-to-value and long-term retention."
    ),
    (
        "Grew Xiao'an AI Assistant MAU from 0 to 280K in 6 months through product-led growth "
        "across four scenarios: community content embedding (18% conversion), holdings page "
        "triggers (22% conversion), viral sharing (35% activation), and AI strategy navigation. "
        "AI users showed +2.1 monthly trades and +32% higher AUM vs. non-AI users."
    ),
]

C2345_BULLETS = [
    (
        "Led 0-to-1 product growth for APP and Content SDK, owning activation and retention "
        "KPIs. Conducted funnel analysis identifying key drop-off points, designed and ran "
        "experiments that increased DAU by 200%, tiered ARPU by 10%, and improved release "
        "iteration efficiency by 200%."
    ),
    (
        "Established a 'Business Metric -> Operations Action -> Data Dashboard' growth "
        "framework, running experiments across 3 cross-departmental projects. Used data and "
        "customer insights to inform product decisions, shortening requirement delivery "
        "cycle by 30%."
    ),
    (
        "Built standardized release iteration SOP with clear quality gates, reducing go-live "
        "time by 40% and improving issue response efficiency by 25%. Analyzed user feedback "
        "at scale to identify 10 core feature optimizations, improving month-over-month "
        "retention by 20%."
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

    pdf.section_header("Professional Summary")
    pdf.body_text(
        "Growth product management leader with 11 years of experience driving full-funnel "
        "growth (acquisition, activation, retention, expansion) across fintech, securities, "
        "and SaaS platforms. Proven expertise in A/B experimentation, funnel optimization, and "
        "data-driven product growth -- having run 50+ experiments, built growth engines from 0 to 1, "
        "and delivered measurable business impact (1.03M annual customer acquisition, 280K MAU "
        "AI product growth, $50B+ cumulative incremental AUM). Strong cross-functional "
        "collaboration skills partnering with Product, Data, Commercial, and Engineering teams. "
        "Proficient in growth frameworks (AARRR, RICE, JTBD), analytics tools, SQL, Python, "
        "and AI-powered automation (Claude Code). Native Mandarin speaker, fluent in English."
    )

    pdf.section_header("Work Experience")

    pdf.job_header(
        "XT.EXCHANGE",
        "Shanghai, China",
        "Platform Operations Director (Growth Lead)",
        "12/2024 - Present",
    )
    for b in XT_BULLETS:
        pdf.bullet(b)

    pdf.job_header(
        "Ping An Securities",
        "Shanghai, China",
        "Senior Operations Manager (Growth & Engagement)",
        "08/2020 - 02/2026",
    )
    for b in PA_BULLETS:
        pdf.bullet(b)

    pdf.job_header(
        "2345.com",
        "Shanghai, China",
        "Product Operations Manager (Internal Startup Lead)",
        "05/2019 - 09/2020",
    )
    for b in C2345_BULLETS:
        pdf.bullet(b)

    pdf.job_header(
        "Ping An Good House",
        "Shanghai, China",
        "User Operations Manager",
        "12/2017 - 05/2019",
    )
    pdf.bullet(
        "Built WeChat ecosystem growth system (Enterprise WeChat + Official Account + Mini "
        "Program) covering acquisition, conversion, and retention. Established 'Traffic In -> "
        "Conversion' SOP connecting Public Domain Ad Placement -> Enterprise WeChat Reception "
        "-> Mini Program Booking -> Community Viral Loop. Achieved 100K new users/month with "
        "CAC 30% below industry average."
    )
    pdf.bullet(
        "Built customer journey dashboard integrating Enterprise WeChat and CDP data, tiering "
        "high-intent users with differentiated strategies. Optimized Mini Program lead capture "
        "flow and Video Account 'Live Tour -> Appointment Lead' closed loop, increasing lead "
        "conversion by 20% and key stage conversion by 30%."
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
    pdf.cell(0, 4.5, "Growth & Product:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "Full-funnel growth (AARRR, North Star Metric), A/B experimentation, funnel analysis "
        "and CRO, RICE/ICE prioritization, JTBD framework, user journey optimization, SaaS "
        "lifecycle management, B2B sales funnel optimization, onboarding and activation design."
    )
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 4.5, "Analytics & Technical:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "Python (data processing, scripting), SQL, Sensors Data, CRM/CDP platforms, BI "
        "dashboards, API integrations, technical documentation, AI/LLM automation (Claude Code, "
        "Codex), experiment design and statistical analysis."
    )
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 4.5, "Languages:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "Chinese (Native Mandarin); English (Professional working proficiency, IELTS)."
    )

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / "He Yuxian（Boku - Growth Product Manager）.pdf"
    pdf.output(str(out_path))
    print(f"PDF saved to: {out_path}")
    return out_path


if __name__ == "__main__":
    build()
