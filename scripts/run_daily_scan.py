#!/usr/bin/env python3
"""Cron entry point: run daily LinkedIn job scan non-interactively.

Intended to be called by cron / launchd at 10 AM daily.
Output goes to stdout (can be redirected to a log file).
"""

import sys
from pathlib import Path

# Ensure the project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from agent.daily_job_scanner import run_daily_scan


def main():
    print(f"[{__file__}] Starting daily job scan...")
    jobs = run_daily_scan(silent=False)
    print(f"[{__file__}] Done. Found {len(jobs)} matching jobs.")
    if jobs:
        top = jobs[:5]
        print("Top results:")
        for j in top:
            print(f"  #{j.get('seq')} [{j.get('source')}] {j.get('company')} — {j.get('position')}")
            print(f"       Keywords: {j.get('matched_keywords')}")
            print(f"       URL: {j.get('url')}")


if __name__ == "__main__":
    main()
