# Resume Agent

AI-powered resume assistant CLI. Generate, optimize, customize, translate resumes using Claude API.

## Setup

```bash
pip install git+https://github.com/summersalt827/resume-agent.git
# or: pip install -e .
```

Requires `ANTHROPIC_API_KEY` in `.env`. Optionally `NOTION_TOKEN` + `NOTION_DATABASE_ID` for Notion sync.

## Architecture

```
main.py              # CLI entry point (interactive menu)
agent/
  client.py           # Anthropic API client with caching & retry
  generator.py        # Generate resume from user info
  optimizer.py        # Polish and improve existing resume
  matcher.py          # Score all resume versions against a JD
  customizer.py       # Tailor resume to a specific JD
  translator.py       # Chinese ↔ English resume translation
  project_experience.py  # Manage reusable project experience library
  applicant_tracker.py   # Track applications, interviews, feedback
  job_scraper_menu.py    # Menu for job scraping
  linkedin_jobs.py       # LinkedIn job search
  wellfound_jobs.py      # Wellfound job search
  mycareersfuture_jobs.py # MyCareersFuture job search
  daily_job_scanner.py   # Scheduled daily job scan
prompts/
  system_prompts.py  # Claude system prompts for each feature
utils/
  resume_parser.py    # Extract text from md/pdf/docx
  resume_formatter.py # Save to md/pdf
  notion_sync.py      # Bidirectional Notion sync
scripts/              # One-off resume build/generate scripts
templates/            # Resume templates (extensible)
data/                 # Runtime JSON data (applications, projects, etc.)
website/              # Landing page
```

## Key patterns

- All agents import `from agent.client import stream_claude` for AI calls
- Output goes to `投递岗位&定制化简历/` (customized resumes), `简历/` (base resumes)
- System prompts in `prompts/system_prompts.py` are specialized per feature
- Notion sync is optional — features work without it
- Job scrapers push results into the applicant tracker flow

## Common tasks

- **Add a new feature**: Create `agent/feature.py` with a `run_feature()` entry, add menu item in `main.py`
- **Tune AI output**: Edit the corresponding prompt in `prompts/system_prompts.py`
- **Add a resume template**: Place in `templates/`, reference from generator or scripts
