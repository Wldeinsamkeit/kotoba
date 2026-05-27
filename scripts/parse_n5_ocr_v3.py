#!/usr/bin/env python3
"""
N5 vocabulary parser v3.
Strategy: extract ALL substrings matching word（reading）...［POS］meaning
from each OCR line, regardless of column layout or prefix markers.
Then filter out non-main-entry patterns (examples, related words, etc).
"""

import json
import re
from pathlib import Path

OCR_DIR = Path("data/redbook-ocr/text")
OUTPUT = Path("data/n5_vocab_clean.json")

START_PAGE = 526
END_PAGE = 574


# Entries that are related words (対), same-sound notes (同音), usage notes (慣用), etc
RELATED_PREFIXES = re.compile(r'^(?:対|同音|慣用|類|硬|閻|閒|閥|閲|閣|閥|閧|閒|閑|閒)')

# Lines that are clearly example sentences or annotations
EXAMPLE_PREFIXES = re.compile(r'^[A▲△▶]')

# Part of speech patterns that indicate main vocabulary entries
MAIN_POS_PATTERNS = re.compile(
    r'^(?:名|動|イ形|ナ形|十形|副|代|連体|接尾|接頭|嘆|数|接|名・|動[12]|動3|他動|自動|名・他|名・自|名・ナ|名・副|名・連|名・代|十形・副|ナ形・副|名・自動|名・他動|名・接尾)'
)


def extract_entries_from_line(line: str) -> list[dict]:
    """Extract all vocabulary entries from a single OCR line."""
    entries = []
    line = line.strip()
    if not line:
        return entries

    # Find ALL occurrences of: word（reading）accent［POS］meaning
    # Pattern breakdown:
    #   word: CJK chars, katakana, ~, digits (the Japanese word)
    #   （reading）: hiragana in full-width or half-width parens
    #   accent: circled numbers or digits
    #   ［POS］: part of speech in brackets
    #   meaning: Chinese text after POS
    pattern = re.compile(
        r'([\u4e00-\u9fff\u30a0-\u30ff〜～\d][\u4e00-\u9fff\u30a0-\u30ff\u3040-\u309f〜～\d\s]*?)'
        r'[（(]'
        r'([ぁ-んァ-ヶー・丶ヽヾ々]+)'
        r'[）)]'
        r'([①②③④⑤⑥⑦⑧⑨⓪〇０\d①-⑨]*)'
        r'\s*'
        r'[［\[]'
        r'([^］\]]+?)'
        r'[］\]]'
        r'\s*'
        r'([\u4e00-\u9fff].*?)'
        r'(?=$|\s+[■口▼▶☆★ロ\s]|[/／]|\s+[A▲△])'
    )

    for m in pattern.finditer(line):
        word = m.group(1).strip()
        reading = m.group(2).strip()
        accent = m.group(3).strip()
        pos = m.group(4).strip()
        meaning = m.group(5).strip()

        # Clean word - remove leading junk characters that are OCR noise
        word = re.sub(r'^[額麺問閻題間対関闘類固園國國同硬閥閲閣]+', '', word)
        word = re.sub(r'^[■口▼▶☆★ロ]\s*', '', word)
        word = re.sub(r'^\d+[^\u4e00-\u9fff]*', '', word)  # remove leading digits
        word = word.strip()

        if not word:
            continue

        # Validate word: must contain CJK or katakana
        if not re.search(r'[\u4e00-\u9fff\u30a0-\u30ff]', word):
            continue

        # Validate reading: must be hiragana
        if not re.match(r'^[ぁ-んァ-ヶー・]+$', reading):
            continue

        # Word length check (max 15 for normal vocab, allow up to 20 for compound words)
        if len(word) > 20:
            continue

        # Validate POS - must start with a known POS tag
        pos_clean = pos.split('・')[0].split('・')[0]
        if not MAIN_POS_PATTERNS.match(pos_clean):
            continue

        # Validate meaning - must have Chinese characters
        if not re.search(r'[\u4e00-\u9fff]', meaning):
            continue

        # Clean meaning
        meaning = meaning.strip()
        # Remove trailing furigana annotations (isolated hiragana strings)
        meaning = re.sub(r'\s+[ぁ-ん]{2,}\s*$', '', meaning)
        # Remove sentence-ending period
        meaning = re.sub(r'[。]$', '', meaning).strip()
        # Keep meaning reasonable length
        if len(meaning) > 40:
            meaning = meaning[:40]

        if not meaning:
            continue

        entries.append({
            "word": word,
            "reading": reading,
            "pos": pos,
            "meaning": meaning,
        })

    return entries


def parse_page(filepath: Path) -> list[dict]:
    """Parse one OCR text file into vocabulary entries."""
    text = filepath.read_text(encoding="utf-8")
    lines = text.strip().split("\n")

    all_entries = []
    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Skip example-only lines
        if EXAMPLE_PREFIXES.match(line):
            continue

        # Skip header lines (page numbers, kana headers)
        if re.match(r'^\d+$', line):
            continue
        if re.match(r'^[ぁ-ん]\s', line) and len(line) < 5:
            continue

        entries = extract_entries_from_line(line)
        all_entries.extend(entries)

    return all_entries


def main():
    all_entries = []
    page_counts = {}

    for page in range(START_PAGE, END_PAGE + 1):
        txt_path = OCR_DIR / f"p{page}_dpi200.txt"
        if not txt_path.exists():
            print(f"[SKIP] {txt_path} not found")
            continue
        entries = parse_page(txt_path)
        # Tag with source page
        for e in entries:
            e["source_page"] = f"p{page}"
        page_counts[page] = len(entries)
        all_entries.extend(entries)

    # Deduplicate by (word, reading), keeping first occurrence
    seen = set()
    unique = []
    for e in all_entries:
        key = (e["word"], e["reading"])
        if key not in seen:
            seen.add(key)
            unique.append(e)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(unique, ensure_ascii=False, indent=2), encoding="utf-8")

    total = sum(page_counts.values())
    print(f"Total extracted: {total}, Unique: {len(unique)}")
    print(f"\nPer page counts:")
    for p in range(START_PAGE, END_PAGE + 1):
        c = page_counts.get(p, 0)
        marker = " ***" if c < 5 else ""
        print(f"  p{p}: {c}{marker}")

    print(f"\nOutput: {OUTPUT}")

    # Show some sample entries
    print(f"\nSample entries:")
    for e in unique[:10]:
        print(f"  {e['word']}（{e['reading']}）[{e['pos']}] {e['meaning']}")


if __name__ == "__main__":
    main()
