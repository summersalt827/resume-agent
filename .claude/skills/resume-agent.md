# Resume Agent Skill

AI resume assistant — generate, optimize, customize, match, translate resumes.

## What this skill does

Provides 8 resume tools. When invoked, run the corresponding Python module directly. The user does NOT need to navigate the CLI menu manually — you execute the right tool based on their request.

## Tools

| # | Tool | Command | What it does |
|---|------|---------|--------------|
| 1 | Generate | `python -m agent.generator` | Generate a complete resume from scratch based on user-provided background info |
| 2 | Optimize | `python -m agent.optimizer` | Polish and improve an existing resume, enhance wording and impact |
| 3 | Match | `python -m agent.matcher` | Score all resume versions against a job description, rank best match |
| 4 | Customize | `python -m agent.customizer` | Tailor a specific resume to a target job description |
| 5 | Translate | `python -m agent.translator` | Translate resumes between Chinese and English |
| 6 | Projects | `python -m agent.project_experience` | Manage reusable project experience library (CRUD) |
| 7 | Track | `python -m agent.applicant_tracker` | Track job applications, interviews, and extract improvement suggestions |
| 8 | Scrape | `python -m agent.job_scraper_menu` | Search jobs from LinkedIn / Wellfound / MyCareersFuture |

## How to use

When the user says things like:
- "帮我生成一份简历" → run **Generate** (`python -m agent.generator`)
- "帮我优化简历" → run **Optimize** (`python -m agent.optimizer`)
- "帮我看看哪个简历最适合这个岗位" → run **Match** (`python -m agent.matcher`)
- "根据这个 JD 定制简历" → run **Customize** (`python -m agent.customizer`)
- "把这份简历翻译成英文" → run **Translate** (`python -m agent.translator`)
- "管理一下我的项目经验" → run **Projects** (`python -m agent.project_experience`)
- "最近投递情况怎么样" → run **Track** (`python -m agent.applicant_tracker`)
- "帮我搜一下 growth PM 的岗位" → run **Scrape** (`python -m agent.job_scraper_menu`)

## Prerequisites

The project must be installed (`pip install -e .`) and `.env` must have `ANTHROPIC_API_KEY` set.

## Tips

- Users can chain tools: match first, then customize the best-matching resume
- After customizing, remind the user they can track this application via **Track**
- Resumes are saved as `.md` files; PDF generation is available within tools
