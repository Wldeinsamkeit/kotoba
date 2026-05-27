#!/usr/bin/env python3
"""
从 macOS Vision OCR 输出的 txt 文件中解析 N5 词汇条目。
输入：data/redbook-ocr/text/p{526..574}_dpi200.txt
输出：data/n5_vocab_raw.json
"""

import json
import re
from pathlib import Path

OCR_DIR = Path("data/redbook-ocr/text")
OUTPUT = Path("data/n5_vocab_raw.json")

START_PAGE = 526
END_PAGE = 574

def parse_page(filepath: Path) -> list[dict]:
    """Parse one OCR text file into vocabulary entries."""
    text = filepath.read_text(encoding="utf-8")
    lines = text.strip().split("\n")

    entries = []
    current_entry = {}

    # Pattern for vocabulary entry lines like:
    # 口 会う（あう）①［自動1］见面、会面；偶遇，碰
    # 口 青い（あおい）②［イ形］蓝的，绿色的
    # A銀行で友達に会った。／在銀行偶遇朋友。
    entry_pattern = re.compile(
        r'^[■口▼▶☆★]?\s*'
        r'(.+?)'                # word
        r'[（(]'
        r'([ぁ-んァ-ヶー・]+)'  # reading
        r'[）)]'
        r'([①②③④⑤⑥⑦⑧⑨⓪〇０①-⑨\d]*)?'  # accent number
        r'\s*'
        r'[［\[](.+?)[］\]]'   # part of speech
        r'\s*'
        r'(.+)'                 # meaning
    )

    # Simpler pattern for entries without clear parentheses
    simple_pattern = re.compile(
        r'^[■口▼▶☆★]?\s*'
        r'(.+?)'
        r'[（(]'
        r'([ぁ-んァ-ヶー・]+)'
        r'[）)]'
        r'([①②③④⑤⑥⑦⑧⑨⓪〇０①-⑨\d]*)?'
        r'\s*'
        r'(.+)'
    )

    example_pattern = re.compile(r'^[▲△A]\s')  # example sentences
    related_pattern = re.compile(r'^(?:対|間|関|闘)\s')  # related words
    header_pattern = re.compile(r'^(?:N5|5\d{2}|あ\s|か\s|き\s|く\s|け\s|こ\s|さ\s|し\s|す\s|せ\s|そ\s|た\s|ち\s|つ\s|て\s|と\s|な\s|に\s|ぬ\s|ね\s|の\s|は\s|ひ\s|ふ\s|へ\s|ほ\s|ま\s|み\s|む\s|め\s|も\s|や\s|ゆ\s|よ\s|ら\s|り\s|る\s|れ\s|ろ\s|わ\s|を\s|ん\s)')

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Skip non-entry lines
        if example_pattern.match(line):
            continue
        if related_pattern.match(line):
            continue
        if header_pattern.match(line):
            continue
        if re.match(r'^\d+$', line):
            continue
        if re.match(r'^[A-Z][a-z]+', line) and not any(c in line for c in ['［', '[']):
            continue

        # Try full pattern first
        m = entry_pattern.match(line)
        if m:
            word = m.group(1).strip()
            reading = m.group(2).strip()
            pos = m.group(4).strip()
            meaning = m.group(5).strip()

            # Clean up
            word = re.sub(r'^[■口▼▶☆★]\s*', '', word)
            meaning = meaning.split('／')[0].strip()  # take first meaning before slash

            entries.append({
                "word": word,
                "reading": reading,
                "pos": pos,
                "meaning": meaning,
                "source_page": filepath.stem.split("_")[0]
            })
            continue

        # Try simpler pattern
        m = simple_pattern.match(line)
        if m:
            word = m.group(1).strip()
            reading = m.group(2).strip()
            rest = m.group(4).strip()

            # Try to extract POS from rest
            pos_match = re.search(r'[［\[](.+?)[］\]]', rest)
            if pos_match:
                pos = pos_match.group(1)
                meaning = rest[:pos_match.start()].strip() + " " + rest[pos_match.end():].strip()
            else:
                pos = ""
                meaning = rest

            word = re.sub(r'^[■口▼▶☆★]\s*', '', word)
            meaning = meaning.split('／')[0].strip()

            entries.append({
                "word": word,
                "reading": reading,
                "pos": pos,
                "meaning": meaning,
                "source_page": filepath.stem.split("_")[0]
            })

    return entries


def main():
    all_entries = []
    for page in range(START_PAGE, END_PAGE + 1):
        txt_path = OCR_DIR / f"p{page}_dpi200.txt"
        if not txt_path.exists():
            print(f"[SKIP] {txt_path} not found")
            continue
        entries = parse_page(txt_path)
        print(f"[OK] page {page}: {len(entries)} entries")
        all_entries.extend(entries)

    # Deduplicate by (word, reading)
    seen = set()
    unique = []
    for e in all_entries:
        key = (e["word"], e["reading"])
        if key not in seen:
            seen.add(key)
            unique.append(e)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(unique, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nTotal: {len(all_entries)} entries, {len(unique)} unique")
    print(f"Output: {OUTPUT}")


if __name__ == "__main__":
    main()
