"""Format and export resumes as text or PDF."""

from pathlib import Path

try:
    from fpdf import FPDF
except ImportError:
    FPDF = None


def save_text(content: str, path: str) -> str:
    """Save resume text to a file."""
    p = Path(path)
    p.write_text(content, encoding="utf-8")
    return str(p.resolve())


def save_pdf(content: str, path: str, font_path: str | None = None) -> str:
    """Export resume content as a PDF.

    Uses fpdf2. For Chinese text, pass a TTF font path.
    """
    if FPDF is None:
        raise RuntimeError("fpdf2 not installed. Run: pip install fpdf2")

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # Try to load a Chinese-capable font if no path given
    font_resolved = font_path
    if not font_resolved:
        for candidate in [
            "/System/Library/Fonts/PingFang.ttc",
            "/System/Library/Fonts/STHeiti Light.ttc",
            "/System/Library/Fonts/Hiragino Sans GB.ttc",
        ]:
            if Path(candidate).exists():
                font_resolved = candidate
                break

    if font_resolved:
        pdf.add_font("CJK", "", font_resolved, uni=True)
        pdf.set_font("CJK", size=11)
    else:
        pdf.set_font("Helvetica", size=11)

    pdf.set_text_color(0, 0, 0)
    pdf.multi_cell(0, 6, content)
    pdf.output(path)
    return str(Path(path).resolve())
