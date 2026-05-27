#!/usr/bin/env python3
"""
N5 vocabulary parser v5 - final version with aggressive cleaning.
"""

import json
import re
from pathlib import Path

OCR_DIR = Path("data/redbook-ocr/text")
OUTPUT = Path("data/n5_vocab_v5.json")

START_PAGE = 527  # 526 is index page
END_PAGE = 574


def clean_word(word: str) -> str:
    """Remove OCR noise prefixes/suffixes from word."""
    # Remove common prefix noise from two-column interleaving
    prefixes_to_remove = [
        r'^[■口▼▶☆★ロ]\s*',
        r'^[額麺問閻題間対関闘類固園國同硬閥閲閣]+\s*',
        r'^[へヘ]*\s*',  # stray hiragana
        r'^音\s*へ\s*',  # "同音" OCR artifacts
        r'^[A-Z]\s*',    # stray Latin letters
    ]
    for pat in prefixes_to_remove:
        word = re.sub(pat, '', word)

    # Remove trailing noise
    word = re.sub(r'\s*[■口▼▶☆★ロ].*$', '', word)
    word = re.sub(r'\s*[A▲△]\s.*$', '', word)

    return word.strip()


def clean_meaning(meaning: str) -> str:
    """Clean up OCR artifacts in Chinese meanings."""
    if not meaning:
        return ""

    # Remove furigana annotations at end (isolated hiragana strings 2+ chars)
    meaning = re.sub(r'\s+[ぁ-ん]{2,}\s*$', '', meaning)

    # Remove isolated kanji + short hiragana at end
    meaning = re.sub(r'\s+[\u4e00-\u9fff][\u3040-\u309f]{0,2}\s*$', '', meaning)

    # Remove content after ；(other column's content)
    meaning = re.sub(r'[；;].*$', '', meaning).strip()

    # Remove content after example sentence markers
    meaning = re.sub(r'\s+[A▲△].*$', '', meaning)

    # Remove trailing sentence-ending period
    meaning = re.sub(r'[。]$', '', meaning).strip()

    # Remove trailing / followed by example
    meaning = re.sub(r'[/／].*$', '', meaning).strip()

    # Remove leading OCR artifacts
    meaning = re.sub(r'^[：:]\s*', '', meaning)

    # Remove parenthetical content at start if it looks like an annotation
    # (e.g., "(天气)" at the start should stay as it's part of the meaning)

    meaning = meaning.strip()

    if len(meaning) < 1:
        return ""

    return meaning


def extract_entries_from_text(text: str) -> list[dict]:
    """Extract all vocabulary entries from OCR text."""
    entries = []
    lines = text.strip().split("\n")

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Pattern: word（reading）accent［POS］
        pattern = re.compile(
            r'('
            r'[\u4e00-\u9fff\u30a0-\u30ff〜～]'
            r'[\u4e00-\u9fff\u30a0-\u30ff\u3040-\u309f〜～\d\s]*'
            r')'
            r'[（(]'
            r'([ぁ-んァ-ヶー・丶ヽヾ々]+)'
            r'[）)]'
            r'([①②③④⑤⑥⑦⑧⑨⓪〇０\d]*)'
            r'\s*'
            r'[［\[]'
            r'([^］\]]+?)'
            r'[］\]]'
        )

        for m in pattern.finditer(line):
            word_raw = m.group(1).strip()
            reading = m.group(2).strip()
            pos = m.group(4).strip()

            # Get meaning after POS bracket
            after_pos = line[m.end():]
            meaning_match = re.match(r'\s*([^\n]*?)(?=\s*[■口▼▶☆★ロ\s]|[A▲△]\s|/|\[|$)', after_pos)
            if meaning_match:
                meaning = meaning_match.group(1).strip()
            else:
                meaning = after_pos.strip()

            # Clean all fields
            word = clean_word(word_raw)
            meaning = clean_meaning(meaning)

            # Validate
            if not word:
                continue
            if not re.search(r'[\u4e00-\u9fff\u30a0-\u30ff〜～]', word):
                continue
            if not re.match(r'^[ぁ-んァ-ヶー・]+$', reading):
                continue
            if len(word) > 20:
                continue

            # Validate POS
            pos_tags = ['名', '動', '形', '副', '代', '連体', '接尾', '接頭', '嘆', '数', '十']
            if not any(tag in pos for tag in pos_tags):
                continue

            if not meaning:
                continue

            entries.append({
                "word": word,
                "reading": reading,
                "pos": pos,
                "meaning": meaning,
            })

    return entries


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

        for e in entries:
            e["source_page"] = f"p{page}"

        page_counts[page] = len(entries)
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

    total = sum(page_counts.values())
    print(f"Total extracted: {total}, Unique: {len(unique)}")

    # Quality check: entries with suspiciously short or long meanings
    short_meaning = [e for e in unique if len(e['meaning']) <= 2]
    long_meaning = [e for e in unique if len(e['meaning']) > 20]
    print(f"Entries with short meaning (<=2 chars): {len(short_meaning)}")
    print(f"Entries with long meaning (>20 chars): {len(long_meaning)}")

    if short_meaning:
        print("  Short meaning samples:")
        for e in short_meaning[:5]:
            print(f"    {e['word']}（{e['reading']}）[{e['pos']}] {e['meaning']}")

    print(f"\nOutput: {OUTPUT}")


if __name__ == "__main__":
    main()
