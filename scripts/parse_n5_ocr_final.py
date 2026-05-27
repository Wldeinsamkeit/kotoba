#!/usr/bin/env python3
"""
N5 vocabulary parser v6 - final cleanup version.
Fixes: concatenated words, bad meanings, OCR artifacts.
"""

import json
import re
from pathlib import Path

OCR_DIR = Path("data/redbook-ocr/text")
OUTPUT = Path("data/n5_vocab_clean.json")

START_PAGE = 527
END_PAGE = 574


def clean_word(word: str) -> str:
    """Remove OCR noise prefixes/suffixes from word."""
    # Remove common prefix noise
    word = re.sub(r'^[■口▼▶☆★ロ]\s*', '', word)
    word = re.sub(r'^[額麺問閻題間対関闘類固園國同硬閥閲閣]+\s*', '', word)
    word = re.sub(r'^[へヘ]*\s*', '', word)
    word = re.sub(r'^音\s*へ\s*', '', word)
    word = re.sub(r'^[A-Z]\s*', '', word)

    # Remove content after noise markers (other column's content)
    word = re.sub(r'\s*[■口▼▶☆★ロ].*$', '', word)
    word = re.sub(r'\s*[A▲△]\s.*$', '', word)
    word = re.sub(r'\s*[対関闘間類固園國題麺額閻閥閲閣].*$', '', word)

    return word.strip()


def clean_meaning(meaning: str) -> str:
    """Clean up OCR artifacts in Chinese meanings."""
    if not meaning:
        return ""

    # Remove furigana annotations at end
    meaning = re.sub(r'\s+[ぁ-ん]{2,}\s*$', '', meaning)
    meaning = re.sub(r'\s+[\u4e00-\u9fff][\u3040-\u309f]{0,2}\s*$', '', meaning)

    # Remove content after ；(other column)
    meaning = re.sub(r'[；;].*$', '', meaning).strip()

    # Remove content after example markers
    meaning = re.sub(r'\s+[A▲△].*$', '', meaning)

    # Remove trailing punctuation
    meaning = re.sub(r'[。]$', '', meaning).strip()

    # Remove trailing slash + content
    meaning = re.sub(r'[/／].*$', '', meaning).strip()

    # Remove leading punctuation
    meaning = re.sub(r'^[：:、，,]\s*', '', meaning)

    # Remove leading non-Chinese characters (OCR noise)
    meaning = re.sub(r'^[^（(\u4e00-\u9fff]+', '', meaning).strip()
    # Re-add leading parenthetical content that was part of meaning
    # (handled above by not removing （ from the regex)

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
            meaning_match = re.match(r'\s*([^\n]*?)(?=\s*[■口▼▶☆★ロ]|[A▲△]\s|/|\[|$)', after_pos)
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
            if len(word) > 15:
                continue

            # Validate POS
            pos_tags = ['名', '動', '形', '副', '代', '連体', '接尾', '接頭', '嘆', '数', '十']
            if not any(tag in pos for tag in pos_tags):
                continue

            if not meaning:
                continue

            # Final check: meaning must start with CJK char
            if not re.match(r'^[\u4e00-\u9fff（(]', meaning):
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
    print(f"Output: {OUTPUT}")

    # Show all entries for inspection
    print(f"\nAll entries:")
    for i, e in enumerate(unique):
        print(f"  {i+1}. {e['word']}（{e['reading']}）[{e['pos']}] {e['meaning']}")


if __name__ == "__main__":
    main()
