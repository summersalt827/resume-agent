"""Parse resume files (PDF and TXT)."""

import re
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None


def extract_text_from_pdf(path: str) -> str:
    """Extract text content from a PDF file."""
    if fitz is None:
        raise RuntimeError("PyMuPDF not installed. Run: pip install pymupdf")
    doc = fitz.open(path)
    text = "\n".join(page.get_text() for page in doc)
    doc.close()
    return text.strip()


def extract_text_from_file(path: str) -> str:
    """Extract text from any supported file type."""
    p = Path(path)
    suffix = p.suffix.lower()
    if suffix == ".pdf":
        return extract_text_from_pdf(path)
    elif suffix in (".txt", ".md"):
        return p.read_text(encoding="utf-8").strip()
    else:
        raise ValueError(f"Unsupported file type: {suffix}")


def parse_resume_sections(text: str) -> dict[str, str]:
    """Attempt to split raw resume text into named sections."""
    section_pattern = re.compile(
        r"(?m)^(基本信息|个人信息|联系信息|教育背景|学历|工作经历|实习经历|项目经验|项目经历|"
        r"项目|技能|专业技能|个人技能|语言|证书|获奖|兴趣爱好|自我介绍|个人简介|工作技能)\s*$",
        re.IGNORECASE,
    )
    lines = text.splitlines()
    sections: dict[str, str] = {}
    current_title = "_preface"
    current_lines: list[str] = []

    for line in lines:
        if section_pattern.match(line):
            if current_lines:
                sections[current_title] = "\n".join(current_lines).strip()
                current_lines = []
            current_title = section_pattern.match(line).group(1)
        else:
            current_lines.append(line)

    if current_lines:
        sections[current_title] = "\n".join(current_lines).strip()

    return sections
