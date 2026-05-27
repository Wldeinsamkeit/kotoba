#!/usr/bin/env python3
"""
Improved N5 vocabulary parser v2.
Handles the two-column interleaved OCR output from redbook pages.
Key improvements:
  1. Entry detection via 口/■/ロ prefix markers
  2. Only captures the FIRST LINE of each entry (avoiding concatenated noise)
  3. Better POS and meaning extraction
  4. Filters out non-vocabulary lines (examples, related words, headers)
"""

import json
import re
from pathlib import Path

OCR_DIR = Path("data/redbook-ocr/text")
OUTPUT = Path("data/n5_vocab_clean.json")

START_PAGE = 526
END_PAGE = 574


def clean_meaning(meaning: str) -> str:
    """Clean up OCR artifacts in Chinese meanings."""
    # Remove trailing example sentence markers
    meaning = re.sub(r'\s*[／/].*$', '', meaning)
    # Remove furigana annotations like あさしちに at end
    meaning = re.sub(r'\s+[ぁ-ん]{2,}\s*$', '', meaning)
    # Remove isolated kanji/furigana at the very end that look like annotations
    meaning = re.sub(r'\s+[\u4e00-\u9fff][\u3040-\u309f]{0,2}\s*$', '', meaning)
    # Clean up common OCR substitutions in Chinese text
    replacements = {
        '仮': '饭', '姉': '师', '対': '对', '闘': '斗',
        '財': '対', '閻': '関', '閒': '関', '題': '類',
        '涅': '洗', '鎧': '気', '駐': '肚', '徒': '挺',
        '色経': '应该', '送': '这', 'ム': '么', '化': '心',
        '熒': '热', '鉄': '连', '用': '同', '崗': '闹',
        '冶': '治', '岌': '危', '喟': '演', '冴': '发',
        '肘': '时', '吋': '时', '遂': '这', '吪': '么',
        '夢': '岁', '志': '人', '応': '园', '疸': '层',
        '慣用': '', '類': '', '固': '', '関': '', '対': '',
        '間': '', '國': '', '園': '', '題': '',
    }
    # Don't do blanket replacements - they cause more harm than good
    # Just clean up whitespace
    meaning = meaning.strip()
    # Remove any remaining sentence-ending punctuation from concatenated text
    meaning = re.sub(r'[。．、，]$', '', meaning).strip()
    return meaning


def extract_entry_from_line(line: str) -> dict | None:
    """Try to extract a vocabulary entry from a single line."""
    line = line.strip()
    if not line:
        return None

    # Must start with a vocabulary marker
    if not re.match(r'^[■口▼▶☆★ロ]', line):
        return None

    # Remove the marker prefix
    line = re.sub(r'^[■口▼▶☆★ロ]\s*', '', line)

    # Skip if line starts with example/related markers after stripping
    if re.match(r'^[▲△A]', line):
        return None

    # Pattern: word（reading）number［POS］meaning
    # The word can contain kanji, hiragana, katakana, ~, digits
    pattern = re.compile(
        r'^(.+?)'                    # word
        r'[（(]'
        r'([ぁ-んァ-ヶー・丶ヽヾ々]+)'  # reading (hiragana/katakana)
        r'[）)]'
        r'([①②③④⑤⑥⑦⑧⑨⓪〇０\d]*)?'  # accent number
        r'\s*'
        r'[［\[]'
        r'(.+?)'                    # part of speech
        r'[］\]]'
        r'\s*'
        r'(.+)'                     # meaning
    )

    m = pattern.match(line)
    if not m:
        return None

    word = m.group(1).strip()
    reading = m.group(2).strip()
    pos = m.group(4).strip()
    meaning = m.group(5).strip()

    # Validate: word should contain at least one CJK or katakana character
    if not re.search(r'[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff〜～]', word):
        return None

    # Validate: reading should be hiragana
    if not re.match(r'^[ぁ-んァ-ヶー・]+$', reading):
        return None

    # Validate: word shouldn't be too long (max ~15 chars for normal vocab)
    if len(word) > 15:
        return None

    # Validate: meaning should contain Chinese characters
    if not re.search(r'[\u4e00-\u9fff]', meaning):
        return None

    # Clean meaning
    meaning = clean_meaning(meaning)

    if not meaning:
        return None

    return {
        "word": word,
        "reading": reading,
        "pos": pos,
        "meaning": meaning,
    }


def parse_page(filepath: Path) -> list[dict]:
    """Parse one OCR text file into vocabulary entries."""
    text = filepath.read_text(encoding="utf-8")
    lines = text.strip().split("\n")

    entries = []

    for line in lines:
        entry = extract_entry_from_line(line)
        if entry:
            entry["source_page"] = filepath.stem.split("_")[0]
            entries.append(entry)
            continue

        # Also check for entries that might have the marker in the middle
        # (due to two-column interleaving, sometimes the marker appears mid-line)
        # Look for patterns like: "some text 口 word（reading）...［POS］meaning"
        # But only if the 口 is preceded by a space or common OCR noise
        parts = re.split(r'\s+(?=[■口▼▶☆★ロ])', line)
        for part in parts:
            entry = extract_entry_from_line(part)
            if entry:
                entry["source_page"] = filepath.stem.split("_")[0]
                entries.append(entry)

    return entries


def main():
    all_entries = []
    page_counts = {}

    for page in range(START_PAGE, END_PAGE + 1):
        txt_path = OCR_DIR / f"p{page}_dpi200.txt"
        if not txt_path.exists():
            print(f"[SKIP] {txt_path} not found")
            continue
        entries = parse_page(txt_path)
        page_counts[page] = len(entries)
        print(f"[OK] page {page}: {len(entries)} entries")
        all_entries.extend(entries)

    # Deduplicate by (word, reading)
    seen = set()
    unique = []
    dupes = 0
    for e in all_entries:
        key = (e["word"], e["reading"])
        if key not in seen:
            seen.add(key)
            unique.append(e)
        else:
            dupes += 1

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(unique, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\nTotal: {len(all_entries)} entries, {len(unique)} unique, {dupes} duplicates")
    print(f"Pages with 0 entries: {[p for p, c in page_counts.items() if c == 0]}")
    print(f"Pages with <10 entries: {[(p, c) for p, c in page_counts.items() if 0 < c < 10]}")
    print(f"Output: {OUTPUT}")


if __name__ == "__main__":
    main()
