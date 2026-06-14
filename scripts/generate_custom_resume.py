"""Generate customized PDF resume with updated XT experience (English)."""

from fpdf import FPDF
from pathlib import Path

# ── Content ──────────────────────────────────────────────────────────────────

# New XT project description (merged & translated)
XT_BULLETS = [
    # Bullet 1: Automation Engine + Growth Infrastructure
    (
        "Built growth infrastructure from scratch at a Web3 exchange. Designed and deployed a "
        '"User Audience x Creative Assets x Traffic Inventory" dynamic configuration '
        "platform--8-dimension audience targeting, multilingual content library, and 18 resource "
        "slots--powered by a 10-layer rule engine (Launch -> Schedule -> Channel -> "
        "Device -> Geo -> Audience -> Grayscale -> A/B -> Frequency -> "
        "Priority) for end-to-end automated delivery. Improved operator self-service rate from 0 to "
        "90%+ and compressed configuration turnaround from 3-5 days to minutes, achieving zero "
        "configuration incidents."
    ),
    # Bullet 2: Web3 Growth Strategy + Token Incentives
    (
        "Built a "User Tier x Incentive Type x Channel" 3D activation engine "
        "targeting crypto-native behaviors (wallet connection, KYC, first deposit, contract trading). "
        "Deployed a tiered token incentive system--up to $2,470/user in lifetime rewards with "
        "416% composite ROI--increasing first deposit conversion from 14% to 24% (+71%) and "
        "reducing CAC from $42 to $34 (-18%). Designed and validated A/B experiments "
        "identifying $30 as the optimal first-deposit incentive and a 7-day lock-up period that "
        "improved 30-day trading retention from 45% to 61% (+23pp)."
    ),
    # Bullet 3: PUSH Strategy + Retention
    (
        "Established a multi-tier PUSH strategy system with global frequency control (<=5/week, "
        "<=2/day, nighttime silent, cross-channel deduplication), 7-day progressive onboarding "
        "for new users, gradual dormant reactivation with auto circuit-breaker, and 4 preference "
        "toggles replacing binary unsubscribe. Reduced unsubscribe rate by 30-50%. Tiered and "
        "time-limited recall campaigns lifted dormant user revival rate from 3% to 11%."
    ),
    # Bullet 4: AI Agents + LLM Automation
    (
        "Embedded AI Copilot across copy generation, experiment analysis, and configuration "
        "validation, boosting team efficiency by ~50%. Leveraged LLMs for automated user feedback "
        "classification, sentiment alerting, and intelligent routing, improving P0/P1 resolution "
        "time by 40%. Integrated on-chain behavioral data (wallet interaction frequency, protocol "
        "preferences, trading patterns) to power AI-driven outbound strategy "
        "recommendations--adapting Clay/Apollo + n8n/Zapier low-code automation paradigms to "
        "the crypto exchange operating environment."
    ),
    # Bullet 5: Team Leadership
    (
        "Led a 5-person platform operations team across campaign, PUSH, inventory, and referral "
        "functions. Decomposed strategic goals into per-role OKRs driving 23 releases in 6 months. "
        "Delivered Configuration Standards V1.8 (~100K words) and team SOPs."
    ),
]

# ── Resume PDF Builder ───────────────────────────────────────────────────────


class ResumePDF(FPDF):
    def __init__(self):
        super().__init__("P", "mm", "A4")
        self.set_auto_page_break(True, 15)
        # Margins
        self.set_left_margin(18)
        self.set_right_margin(18)
        self.add_page()

    # ── layout helpers ────────────────────────────────────────────────────

    def section_header(self, title: str):
        """Print a section header with a thin line below."""
        self.ln(3)
        self.set_font("Helvetica", "B", 10.5)
        self.set_text_color(30, 30, 30)
        self.cell(0, 5.5, title.upper(), new_x="LMARGIN", new_y="NEXT")
        # thin underline
        y = self.get_y()
        self.set_draw_color(60, 60, 60)
        self.line(self.l_margin, y + 0.3, self.w - self.r_margin, y + 0.3)
        self.ln(3)

    def job_header(self, company: str, location: str, role: str, period: str):
        """Company name (bold) | location (right) then role | period."""
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(20, 20, 20)
        # company + location on same line
        self.cell(0, 5, f"{company}", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 9)
        self.set_text_color(80, 80, 80)
        self.cell(0, 4.5, f"{role}  |  {period}", new_x="LMARGIN", new_y="NEXT")
        self.ln(1.5)

    def bullet(self, text: str):
        """Print a bullet point with hanging indent."""
        x0 = self.get_x()
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(50, 50, 50)
        # bullet marker
        self.cell(5, 4.2, "-")
        # wrapped text
        self.multi_cell(
            self.w - self.l_margin - self.r_margin - 5,
            4.2,
            text,
            align="L",
        )
        self.ln(1)

    def body_text(self, text: str, size: float = 8.5):
        """Plain wrapped paragraph."""
        self.set_font("Helvetica", "", size)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 4.5, text, align="L")
        self.ln(1)

    def header_block(self):
        """Name + contact info."""
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(20, 20, 20)
        self.cell(0, 8, "Yuxian He", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)
        # contact line
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

    # ── Header ──────────────────────────────────────────────────────────────
    pdf.header_block()

    # ── Professional Summary ─────────────────────────────────────────────────
    pdf.section_header("Professional Summary")
    pdf.body_text(
        "FinTech and internet platform operations leader with 11 years of experience across "
        "user growth, precision marketing, and AUM conversion, driving over RMB 50B in "
        "cumulative incremental assets. Proven expertise in building automated operations "
        "platforms from 0 to 1 across blockchain, securities, and internet industries. Strong "
        "data analysis skills (Python, SQL) combined with AI tool proficiency (Claude Code, "
        "Codex) for automated research, MVP deployment, and operational optimization. "
        "Experienced team manager with a track record of exceeding OKRs through "
        "cross-functional collaboration and data-driven strategy."
    )

    # ── Work Experience ──────────────────────────────────────────────────────
    pdf.section_header("Work Experience")

    # -- XT.EXCHANGE (NEW content) --------------------------------------------
    pdf.job_header(
        "XT.EXCHANGE",
        "Shanghai, China",
        "Platform Operations Director",
        "12/2024 - Present",
    )
    for b in XT_BULLETS:
        pdf.bullet(b)

    # -- Ping An Securities (unchanged) ---------------------------------------
    PA_BULLETS = [
        (
            "Developed a precision customer acquisition engine (Official Account + Mini "
            "Program + Community) using KYC and behavioral tagging to build a "Market "
            "Analysis -> Strategy Matching -> Trading -> Viral Loop" conversion "
            "funnel. Acquired 1.03M new customers annually (D0 retention 50%, M1 retention "
            "20%), achieved 5,200 effective account openings with average AUM of RMB 100K, "
            "and increased community first-trade conversion by 50%."
        ),
        (
            "Designed a market-driven viral acquisition engine capturing user emotional "
            "moments during market rallies (>2%) or individual stock movements (>5%). "
            "Deployed dynamic personalized campaign displays and sharing entry points on "
            "core APP pages, achieving >=50% in-app share rate, >=1:10 viral "
            "efficiency, and a CAC of approximately RMB 1.1 per user."
        ),
        (
            "Optimized the APP-to-Mini Program cross-platform transition path and guided "
            "users to subscribe to WeChat template messages, with focused targeting on "
            "high-sensitivity users holding >=3 watchlist stocks. Introduced an AI-powered "
            "user behavior sequence model combining market intensity, sharing history, and "
            "time-slot activity for real-time viral trigger optimization, improving trigger "
            "accuracy by 22% and reducing ineffective interruptions by 35%."
        ),
        (
            "Led an existing customer asset growth program integrating securities trading "
            "data, holdings data, and DMP/CDP platforms to build a personalized real-time "
            "marketing engine. Reactivated 150K+ silent customers annually, drove 500K active "
            "user growth, and increased average AUM per account by RMB 10M."
        ),
        (
            "Built an Account Achievement System featuring MOT landing pages with intraday "
            "charts, an Anonymous Returns Leaderboard, and an Investment Badge Wall, "
            "distributed via omni-channel precision push across Push, Pop-up, Banner, "
            "Trading, and Asset pages. Achieved 100K-150K monthly sharing UV and "
            "400K-500K monthly sharing PV, with daily community interaction growth of "
            "~1,000 UV."
        ),
        (
            "Deployed AI-powered community content recommendation matching premium content "
            "(market reviews, strategy analysis, industry deep dives) to users based on "
            "portfolio structure, trading style, and browsing behavior, increasing content "
            "CTR by 1.8pp, average reading time by 40%, and Community DAU by 25%."
        ),
        (
            "Led the Xiao'an AI Assistant initiative converting community traffic into "
            "AI investment tool users through four key scenarios: community content embedding "
            "(18% conversion rate), holdings page intelligent triggers (22% conversion rate), "
            "viral sharing integration (35% activation rate), and AI-powered strategy "
            "navigation. Grew Xiao'an MAU from 0 to 280K in 6 months. AI users "
            "demonstrated +2.1 more monthly trades and +32% higher average AUM compared to "
            "non-AI users."
        ),
    ]
    pdf.job_header(
        "Ping An Securities",
        "Shanghai, China",
        "Operations Manager",
        "08/2020 - 08/2024",
    )
    for b in PA_BULLETS:
        pdf.bullet(b)

    # -- 2345.com (unchanged) --------------------------------------------------
    C2345_BULLETS = [
        (
            "Led the 0-to-1 operations system build-out for both APP and Content SDK, "
            "covering strategic decomposition, process development, and data-driven growth. "
            "Increased DAU by 200%, tiered ARPU by 10%, and release iteration efficiency "
            "by 200%."
        ),
        (
            "Reverse-engineered operational requirements from APP version goals (DAU, "
            "Retention, ROI) and led Content SDK and Information Feed Platform solution "
            "design, driving 3 cross-departmental projects to delivery. Established a "
            ""Business Metric -> Operations Action -> Data Dashboard" "
            "alignment mechanism, shortening requirement delivery cycle by 30%."
        ),
        (
            "Built a standardized release iteration SOP covering Feature Launch -> "
            "Creative Production -> UAT Testing -> Data Monitoring, coordinating "
            "Product, R&D, and Content teams. Defined stage entry/exit criteria and "
            "accountability, reducing key release go-live time by 40% and improving issue "
            "response efficiency by 25%."
        ),
        (
            "Developed a coin-based tiered operations model dynamically adjusting incentive "
            "strategies based on DAU and ARPU data, coupled with app store promotion ROI "
            "optimization, increasing high-value user ARPU by 50% and reducing CAC by 20%. "
            "Established a user feedback prioritization mechanism analyzing tens of thousands "
            "of feedback entries to drive 10 core feature optimizations, improving "
            "month-over-month retention by 20%."
        ),
    ]
    pdf.job_header(
        "2345.com",
        "Shanghai, China",
        "Product Operations Manager (Internal Startup Lead)",
        "05/2019 - 09/2020",
    )
    for b in C2345_BULLETS:
        pdf.bullet(b)

    # -- Ping An Good House (unchanged) ----------------------------------------
    PAGH_BULLETS = [
        (
            "Built a WeChat ecosystem private domain marketing system (Enterprise WeChat + "
            "Official Account + Mini Program) covering growth engine, data operations, and "
            "touchpoint productization. Increased add-to-WeChat rate by 100%, shortened lead "
            "conversion cycle by 30 days, and improved requirement delivery efficiency by 100%."
        ),
        (
            "Designed scenario-based "Traffic In -> Conversion" SOPs connecting "
            "Public Domain Ad Placement -> Enterprise WeChat Reception -> Mini Program "
            "Virtual Tour Booking -> Community Viral Loop, establishing a real-estate-"
            "vertical conversion pathway. Achieved 100K new private domain users per month "
            "with CAC 30% below industry average."
        ),
        (
            "Built a customer journey dashboard integrating Enterprise WeChat and CDP data "
            "(Add Rate, Virtual Tour Conversion, Deal Cycle), tiering high-intent users by "
            "down payment capacity and location preference with differentiated content "
            "matching, increasing key stage conversion by 30%."
        ),
        (
            "Led WeChat Work business-oriented feature transformation including auto-tagging, "
            "talk script library, and scheduling reminders, increasing sales efficiency by 3 "
            "deals per month and shortening requirement launch cycle by 40%. Optimized Mini "
            "Program lead capture flow and designed a Video Account "Live Tour -> "
            "Appointment Lead Capture" closed loop, increasing lead conversion by 20% "
            "and MQL volume by 100 per month."
        ),
    ]
    pdf.job_header(
        "Ping An Good House",
        "Shanghai, China",
        "User Operations Manager (Private Domain Lead)",
        "12/2017 - 05/2019",
    )
    for b in PAGH_BULLETS:
        pdf.bullet(b)

    # -- Unilever (unchanged) --------------------------------------------------
    UNI_BULLETS = [
        (
            "Built a PUGC content ecosystem using a "User Co-Creation -> Content "
            "Curation -> Asset Reuse" driving loop. Increased weekly content output "
            "by 40%, achieved 75% premium content reuse rate across official website and "
            "social media, and drove single content omni-channel exposure beyond 100K."
        ),
        (
            "Designed a "Crowd-Creation -> Screening -> Packaging" "
            "closed-loop mechanism with task incentives and creative workshops, establishing "
            "PUGC quality inspection standards in partnership with Agency. Built a tiered "
            "PUGC content library (S/A/B levels) connecting Official Account topic planning, "
            "video production, and data review, supporting 20+ viral articles per month with "
            "18%+ open rate and 90% offline event video reuse rate."
        ),
        (
            "Operated a "User Testimonials + Professional Reviews" content matrix "
            "distributed across Video Accounts and Moments Ads, amplifying UGC trust value "
            "and increasing community follower add rate by 25%."
        ),
    ]
    pdf.job_header(
        "Unilever",
        "Shanghai, China",
        "Brand Specialist",
        "05/2015 - 12/2017",
    )
    for b in UNI_BULLETS:
        pdf.bullet(b)

    # ── Education ────────────────────────────────────────────────────────────
    pdf.section_header("Education")
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 5, "Shanghai Normal University", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 4.5, "Shanghai, China  |  Bachelor of Education, Major: Primary Education  |  09/2010 - 07/2014", new_x="LMARGIN", new_y="NEXT")
    pdf.body_text(
        "GPA: 3.02/4.0  |  Notable: School Journalist Corps reporter "
        "(10+ published articles), Second Prize in Children's Literature, "
        "University Third-Class Scholarship.",
        size=8.5,
    )

    # ── Skills ───────────────────────────────────────────────────────────────
    pdf.section_header("Skills")

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 4.5, "Operations & Growth:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "User growth strategy, precision marketing, AUM conversion, KYC segmentation, "
        "viral/acquisition engine design, private domain operations, PUSH strategy system "
        "design, A/B testing and experimentation, SOP development."
    )
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 4.5, "Data & Technical:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "Python (data processing, scripting), SQL, Sensors Data (Sensors Analytics), "
        "CRM/CDP platforms, business intelligence dashboards, full-funnel analytics "
        "(CTR/CVR/CAC/Retention)."
    )
    pdf.ln(1)

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 4.5, "AI & Tools:", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(50, 50, 50)
    pdf.multi_cell(0, 4.5,
        "Claude Code, Codex, LLM-powered classification and automation, AI Copilot for "
        "operations, automated MVP deployment, MS Office (Proficient)."
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

    # ── Save ─────────────────────────────────────────────────────────────────
    out_dir = Path(__file__).resolve().parent.parent / "简历" / "custom"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "He Yuxian（Web3-Growth-Custom）.pdf"
    pdf.output(str(out_path))
    print(f"Saved to: {out_path}")
    return out_path


if __name__ == "__main__":
    build()
