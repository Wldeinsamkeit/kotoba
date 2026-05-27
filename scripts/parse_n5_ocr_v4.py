#!/usr/bin/env python3
"""
N5 vocabulary parser v4 - final version.
Extracts vocabulary entries from two-column interleaved OCR text.
Strategy:
  1. Find ALL text segments matching: optional_prefix + word + （reading） + accent + ［POS］ + meaning
  2. Use broad pattern matching, then validate and clean each entry
  3. Handle OCR noise in word boundaries and meaning truncation
"""

import json
import re
from pathlib import Path

OCR_DIR = Path("data/redbook-ocr/text")
OUTPUT = Path("data/n5_vocab_clean.json")

START_PAGE = 526
END_PAGE = 574


def extract_entries_from_text(text: str) -> list[dict]:
    """Extract all vocabulary entries from OCR text."""
    entries = []
    lines = text.strip().split("\n")

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Find all entry patterns in this line
        # Pattern: word（reading）accent［POS］meaning
        # Word can be: kanji, katakana, hiragana, ~, digits, spaces (for compound words)
        # Reading: hiragana only
        # POS: in Japanese brackets
        # Meaning: Chinese text
        pattern = re.compile(
            r'('
            r'[\u4e00-\u9fff\u30a0-\u30ff〜～]'  # starts with CJK or katakana or ~
            r'[\u4e00-\u9fff\u30a0-\u30ff\u3040-\u309f〜～\d\s（）()/]*'  # continues with those + hiragana
            r')'
            r'[（(]'
            r'([ぁ-んァ-ヶー・丶ヽヾ々]+)'  # reading
            r'[）)]'
            r'([①②③④⑤⑥⑦⑧⑨⓪〇０\d]*)'  # accent
            r'\s*'
            r'[［\[]'
            r'([^］\]]+?)'  # POS
            r'[］\]]'
        )

        for m in pattern.finditer(line):
            word = m.group(1).strip()
            reading = m.group(2).strip()
            pos = m.group(4).strip()

            # Get meaning: everything after the POS closing bracket until end or next entry marker
            after_pos = line[m.end():]
            # Stop at next entry marker, example sentence, or slash
            meaning_match = re.match(r'\s*([^\n]*?)(?=\s*[■口▼▶☆★ロ\s]|[A▲△]\s|/|\[|$)', after_pos)
            if meaning_match:
                meaning = meaning_match.group(1).strip()
            else:
                meaning = after_pos.strip()

            # Clean word - remove common OCR noise prefixes
            word = re.sub(r'^[■口▼▶☆★ロ]\s*', '', word)
            word = re.sub(r'^[額麺問閻題間対関闘類固園國同硬閥閲閣]+', '', word)
            # Remove leading/trailing whitespace
            word = word.strip()

            if not word:
                continue

            # Validate reading
            if not re.match(r'^[ぁ-んァ-ヶー・]+$', reading):
                continue

            # Validate word: must contain at least one CJK or katakana
            if not re.search(r'[\u4e00-\u9fff\u30a0-\u30ff〜～]', word):
                continue

            # Word length check
            if len(word) > 20:
                continue

            # Validate POS - must contain known POS tag
            pos_tags = ['名', '動', '形', '副', '代', '連体', '接尾', '接頭', '嘆', '数', '接', '十']
            if not any(tag in pos for tag in pos_tags):
                continue

            # Clean meaning
            meaning = clean_meaning(meaning)
            if not meaning:
                continue

            entries.append({
                "word": word,
                "reading": reading,
                "pos": pos,
                "meaning": meaning,
            })

    return entries


def clean_meaning(meaning: str) -> str:
    """Clean up OCR artifacts in Chinese meanings."""
    if not meaning:
        return ""

    # Remove furigana annotations at end (isolated hiragana strings 2+ chars)
    meaning = re.sub(r'\s+[ぁ-ん]{2,}\s*$', '', meaning)

    # Remove isolated kanji + short hiragana at end (furigana annotations)
    meaning = re.sub(r'\s+[\u4e00-\u9fff][\u3040-\u309f]{0,2}\s*$', '', meaning)

    # Remove trailing sentence-ending period
    meaning = re.sub(r'[。]$', '', meaning).strip()

    # Remove "；..." continuation from other column
    meaning = re.sub(r'[；;].*$', '', meaning).strip()

    # If meaning starts with Chinese char and has other stuff, truncate at obvious boundary
    # e.g., "開的 A教科書を..." -> "開的"
    meaning = re.sub(r'\s+[A▲△]\s.*$', '', meaning)

    meaning = meaning.strip()

    # Minimum meaning length
    if len(meaning) < 1:
        return ""

    # Maximum reasonable meaning length
    if len(meaning) > 30:
        # Try to truncate at a natural boundary
        meaning = re.sub(r'[、，].*$', '', meaning)
        meaning = meaning.strip()

    return meaning


def is_related_or_supplementary(word: str, reading: str, pos: str) -> bool:
    """Check if this is a related word or supplementary entry, not a main vocab entry."""
    # Skip entries that are clearly suffixes/prefixes without real word content
    if re.match(r'^[〜～]', word) and len(word) <= 5:
        return True

    # Skip entries where POS contains "接頭" or "接尾" but no main POS
    if '接頭' in pos and '名' not in pos:
        return True

    return False


def main():
    all_entries = []
    page_counts = {}

    for page in range(START_PAGE, END_PAGE + 1):
        txt_path = OCR_DIR / f"p{page}_dpi200.txt"
        if not txt_path.exists():
            print(f"[SKIP] {txt_path} not found")
            continue
        text = txt_path.read_text(encoding="utf-8")
        entries = extract_entries_from_text(text)

        # Filter out supplementary entries
        main_entries = [e for e in entries if not is_related_or_supplementary(e['word'], e['reading'], e['pos'])]

        for e in main_entries:
            e["source_page"] = f"p{page}"

        page_counts[page] = len(main_entries)
        all_entries.extend(main_entries)

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

    low_pages = [(p, c) for p, c in page_counts.items() if c < 8]
    if low_pages:
        print(f"\nPages with <8 entries:")
        for p, c in low_pages:
            print(f"  p{p}: {c}")

    print(f"\nOutput: {OUTPUT}")

    # Show sample entries
    print(f"\nFirst 15 entries:")
    for e in unique[:15]:
        print(f"  {e['word']}（{e['reading']}）[{e['pos']}] {e['meaning']}")


if __name__ == "__main__":
    main()
