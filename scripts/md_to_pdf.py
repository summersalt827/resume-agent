#!/usr/bin/env python3
"""Generate PDF from Wise resume markdown."""
import sys, re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from fpdf import FPDF

class ResumePDF(FPDF):
    def __init__(self):
        super().__init__()
        self.F = "Helvetica"

    def footer(self):
        self.set_y(-15)
        self.set_font(self.F, "", 7)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def write_bold_text(self, txt, sz=8.2):
        """Write text with **bold** markers rendered properly."""
        parts = re.split(r"(\*\*.*?\*\*)", txt)
        for part in parts:
            if part.startswith("**") and part.endswith("**"):
                self.set_font(self.F, "B", sz)
                self.write(sz * 0.6, part[2:-2])
            else:
                self.set_font(self.F, "", sz)
                self.write(sz * 0.6, part)
        self.ln()

    def section(self, title):
        self.ln(3)
        self.set_font(self.F, "B", 8.5)
        self.set_text_color(0, 0, 0)
        self.cell(0, 5, title.upper(), new_x="LMARGIN", new_y="NEXT")
        y = self.get_y() + 0.5
        self.set_draw_color(0, 0, 0)
        self.set_line_width(0.4)
        self.line(self.l_margin, y, self.w - self.r_margin, y)
        self.ln(3)

    def entry(self, company, location, role, dates):
        self.set_x(self.l_margin)
        y0 = self.get_y()
        self.set_font(self.F, "B", 8.5)
        self.set_text_color(0, 0, 0)
        self.cell(self.get_string_width(company) + 1, 4, company, new_x="RIGHT", new_y="LAST")
        self.set_font(self.F, "", 7.5)
        self.set_text_color(80, 80, 80)
        loc_w = self.get_string_width(location)
        self.set_xy(self.w - self.r_margin - loc_w, y0)
        self.cell(loc_w, 4, location, new_x="LMARGIN", new_y="NEXT")
        y1 = self.get_y()
        self.set_font(self.F, "B", 8)
        self.set_text_color(40, 40, 40)
        self.cell(self.get_string_width(role) + 1, 4, role, new_x="RIGHT", new_y="LAST")
        self.set_font(self.F, "", 7.5)
        self.set_text_color(100, 100, 100)
        date_w = self.get_string_width(dates)
        self.set_xy(self.w - self.r_margin - date_w, y1)
        self.cell(date_w, 4, dates, new_x="LMARGIN", new_y="NEXT")
        self.ln(0.5)

    def subhead(self, text, sz=8):
        self.ln(1)
        self.set_font(self.F, "B", sz)
        self.set_text_color(40, 40, 40)
        self.cell(0, 4.5, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(0.5)

    def bul(self, text, sz=7.8, indent=5):
        self.set_x(self.l_margin + indent)
        self.set_font(self.F, "", 7)
        self.cell(3, 4, "-")
        self.set_font(self.F, "", sz)
        self.set_text_color(40, 40, 40)
        self.write_bold_text(text, sz)

    def body(self, text, sz=8):
        self.set_font(self.F, "", sz)
        self.set_text_color(40, 40, 40)
        self.write_bold_text(text, sz)


pdf = ResumePDF()
pdf.alias_nb_pages()
pdf.set_auto_page_break(True, 12)
pdf.set_left_margin(18)
pdf.set_right_margin(18)
pdf.add_page()

md_path = PROJECT_ROOT / "简历/fintech/He Yuxian（Wise - APAC PC&R Operations）.md"
content = md_path.read_text(encoding="utf-8")
# Replace special chars for Helvetica compatibility
replacements = {
    "→": "->",  # right arrow
    "≥": ">=",  # greater-or-equal
    "≤": "<=",  # less-or-equal
    "–": "--",  # en dash
    "—": "--",  # em dash
    "“": "\"",  # left double quote
    "”": "\"",  # right double quote
    "‘": "'",   # left single quote
    "’": "'",   # right single quote
    "•": "-",   # bullet
    "·": "-",   # middle dot
}
for old, new in replacements.items():
    content = content.replace(old, new)
lines = content.split("\n")
i = 0

while i < len(lines):
    line = lines[i]

    if not line.strip():
        i += 1
        continue

    # H1: Name
    if line.startswith("# "):
        pdf.set_font(pdf.F, "B", 14)
        pdf.set_text_color(0, 0, 0)
        pdf.ln(1)
        name = line[2:]
        pdf.cell(0, 6, name, new_x="LMARGIN", new_y="NEXT")
        i += 1
        # Personal info line
        if i < len(lines) and lines[i].startswith("**"):
            pdf.set_font(pdf.F, "", 7)
            pdf.set_text_color(60, 60, 60)
            info = lines[i].strip()
            # Bold markers
            info_clean = info.replace("**", "").replace(" | ", " | ")
            pdf.cell(0, 4.5, info_clean, new_x="LMARGIN", new_y="NEXT")
            i += 1
        continue

    # Section: ##
    if line.startswith("## "):
        pdf.section(line[3:])
        i += 1
        continue

    # Company: ###
    if line.startswith("### "):
        company_loc = line[4:]
        if " | " in company_loc:
            company, location = company_loc.split(" | ", 1)
        else:
            company, location = company_loc, ""
        i += 1
        role_dates = ""
        if i < len(lines) and lines[i].startswith("**") and not lines[i].startswith("**Nationality"):
            role_dates = lines[i].strip()
            i += 1
        role, dates = "", ""
        if " | " in role_dates:
            role = role_dates.split(" | ")[0].replace("**", "")
            dates = role_dates.split(" | ")[1].replace("**", "")
        pdf.entry(company.strip(), location.strip(), role.strip(), dates.strip())
        continue

    # Strategy / Case subhead
    if line.startswith("**") and line.endswith("**") and not line.startswith("**Nationality"):
        pdf.subhead(line[2:-2])
        i += 1
        continue

    # Bullet
    if line.strip().startswith("- "):
        pdf.bul(line.strip()[2:])
        i += 1
        continue

    # Case: line
    if line.startswith("Case:"):
        pdf.subhead(line, sz=8)
        i += 1
        continue

    # Skills (lines starting with >)
    if line.strip().startswith("> "):
        pdf.set_x(pdf.l_margin + 3)
        pdf.set_font(pdf.F, "", 7.8)
        pdf.set_text_color(40, 40, 40)
        pdf.write_bold_text(line.strip()[2:], sz=7.8)
        i += 1
        continue

    # Regular text / body
    pdf.body(line.strip())
    i += 1

output = PROJECT_ROOT / "简历/fintech/He Yuxian（Wise - APAC PC&R Operations）.pdf"
pdf.output(str(output))
print(f"PDF saved: {output}")
print(f"Pages: {pdf.pages_count}")
