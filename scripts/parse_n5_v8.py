#!/usr/bin/env python3
"""
N5 vocabulary parser v8 - segment splitting approach.
1. Split each line at noise boundaries (other column's content)
2. For each segment, try to extract a vocabulary entry
3. Use strict patterns with fallbacks
"""

import json
import re
from pathlib import Path

OCR_DIR = Path("data/redbook-ocr/text")
OUTPUT = Path("data/n5_vocab_v8.json")

START_PAGE = 527
END_PAGE = 574


# Split points - these indicate content from the other column
SPLIT_PATTERN = re.compile(
    r'\s+('
    r'[■口▼▶☆★ロ]'  # another entry marker
    r'|[対関闘間類固園國題麺額閻]'  # related word markers
    r'|[A▲△]\s'  # example sentence
    r'|[同音]'  # same-sound note
    r'|慣用'  # usage note
    r')'
)


def split_line_at_column_boundaries(line: str) -> list[str]:
    """Split an OCR line at likely column boundaries."""
    # Split at entry markers (口, ■, etc.) preceded by whitespace
    # These usually indicate a new entry from the other column
    segments = re.split(r'(?<=[\u4e00-\u9fff\u30a0-\u30ff\u3040-\u309f。、・～）)])\s{1,3}(?=[■口▼▶☆★ロ])', line)
    # Also split at "関", "対" etc. when preceded by content and followed by content
    segments = [s for seg in segments for s in re.split(r'(?<=[\u4e00-\u9fff])\s*(?=対|関|間|闘|類|固|園|題|麺|額|閻)', seg)]
    return [s.strip() for s in segments if s.strip()]


def try_extract_entry(segment: str) -> dict | None:
    """Try to extract a vocabulary entry from a text segment."""
    segment = segment.strip()
    if not segment:
        return None

    # Skip non-entry segments
    if re.match(r'^[A▲△]', segment):
        return None
    if re.match(r'^(?:対|間|関|闘|類|固|園|題|麺|額|閻)\s', segment):
        return None
    if re.match(r'^(?:同音|慣用)', segment):
        return None
    if re.match(r'^\d+$', segment):
        return None
    if re.match(r'^[ぁ-ん]\s', segment) and len(segment) < 5:
        return None

    # Remove leading marker
    segment = re.sub(r'^[■口▼▶☆★ロ]\s*', '', segment)
    # Remove leading noise characters
    segment = re.sub(r'^[額麺問閻題間対関闘類固園國同硬閥閲閣へ]+\s*', '', segment)

    # Main pattern: word（reading）...［POS］...meaning
    # Word: 1-12 chars of CJK/katakana/hiragana/~
    # Key: word ends RIGHT BEFORE （
    m = re.match(
        r'^'
        r'([\u4e00-\u9fff\u30a0-\u30ff〜～][\u4e00-\u9fff\u30a0-\u30ff\u3040-\u309f〜～\d]*?)'  # word (non-greedy)
        r'(?=[（(])'  # lookahead for reading paren
        r'[（(]'
        r'([ぁ-ん]+)'  # reading (hiragana only)
        r'[）)]'
        r'([①②③④⑤⑥⑦⑧⑨⓪〇０\d]*)'  # accent
        r'\s*'
        r'[［\[]'
        r'([^］\]]+?)'  # POS
        r'[］\]]'
        r'\s*'
        r'(.+?)'  # meaning (non-greedy)
        r'(?=\s*[■口▼▶☆★ロ\s]|[A▲△]\s|/|［|$)',
        segment
    )

    if not m:
        return None

    word = m.group(1).strip()
    reading = m.group(2).strip()
    pos = m.group(4).strip()
    meaning = m.group(5).strip()

    # Validate word
    if not word:
        return None
    if not re.search(r'[\u4e00-\u9fff\u30a0-\u30ff〜～]', word):
        return None
    if len(word) > 12:
        return None

    # Validate reading (must be hiragana)
    if not re.match(r'^[ぁ-ん]+$', reading):
        return None

    # Validate POS
    pos_tags = ['名', '動', '形', '副', '代', '連体', '接尾', '接頭', '嘆', '数', '十']
    if not any(tag in pos for tag in pos_tags):
        return None

    # Clean meaning
    meaning = re.sub(r'\s+[ぁ-ん]{2,}\s*$', '', meaning)  # trailing furigana
    meaning = re.sub(r'\s+[\u4e00-\u9fff][\u3040-\u309f]{0,2}\s*$', '', meaning)  # trailing annotation
    meaning = re.sub(r'[；;].*$', '', meaning).strip()  # other column content
    meaning = re.sub(r'\s+[A▲△].*$', '', meaning)  # example sentences
    meaning = re.sub(r'[。]$', '', meaning).strip()  # trailing period
    meaning = re.sub(r'[/／].*$', '', meaning).strip()  # slash + example
    meaning = re.sub(r'^[：:、，,]+\s*', '', meaning)  # leading punctuation

    if not meaning:
        return None

    # Meaning should start with CJK character
    if not re.match(r'^[\u4e00-\u9fff（(]', meaning):
        return None

    return {
        "word": word,
        "reading": reading,
        "pos": pos,
        "meaning": meaning,
    }


def extract_entries_from_line(line: str) -> list[dict]:
    """Extract vocabulary entries from a single OCR line."""
    entries = []
    segments = split_line_at_column_boundaries(line)

    for segment in segments:
        entry = try_extract_entry(segment)
        if entry:
            entries.append(entry)

    # If no segments worked, try the original line directly
    if not entries:
        entry = try_extract_entry(line)
        if entry:
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
        text = txt_path.read_text(encoding="utf-8")
        lines = text.strip().split("\n")

        page_entries = []
        for line in lines:
            entries = extract_entries_from_line(line)
            for e in entries:
                e["source_page"] = f"p{page}"
            page_entries.extend(entries)

        page_counts[page] = len(page_entries)
        all_entries.extend(page_entries)

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

    # Quality metrics
    bad_words = [e for e in unique if len(e['word']) > 8]
    print(f"\nLong words (>8 chars): {len(bad_words)}")
    for e in bad_words[:10]:
        print(f"  {e['word']}（{e['reading']}）")

    # Show first 30 entries
    print(f"\nFirst 30 entries:")
    for i, e in enumerate(unique[:30]):
        print(f"  {i+1}. {e['word']}（{e['reading']}）[{e['pos']}] {e['meaning']}")


if __name__ == "__main__":
    main()
