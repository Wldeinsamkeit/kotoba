#!/usr/bin/env python3
"""批量 OCR N5 词汇页（526-574），使用 macOS Vision (ocrmac)"""

from pathlib import Path
import subprocess
import sys

START_PAGE = 526
END_PAGE = 574

for page in range(START_PAGE, END_PAGE + 1):
    txt_path = Path(f"data/redbook-ocr/text/p{page}_dpi200.txt")
    if txt_path.exists():
        print(f"[SKIP] page {page} already done")
        continue
    print(f"[OCR] page {page} ...")
    result = subprocess.run(
        [sys.executable, "scripts/redbook_render_and_ocr.py", "--page", str(page)],
        cwd="/Users/Zhuanz/Downloads/编程内容/日语学习网站",
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"  ERROR: {result.stderr.strip()}")
    else:
        print(f"  OK")

print("Done!")
