#!/usr/bin/env python3
"""
N5 vocabulary parser v7 - strict word boundaries.
Key insight: the word is SHORT and ends immediately before （.
The two-column interleaving means we need to be very strict about word boundaries.
"""

import json
import re
from pathlib import Path

OCR_DIR = Path("data/redbook-ocr/text")
OUTPUT = Path("data/n5_vocab_clean.json")

START_PAGE = 527
END_PAGE = 574


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

    # Remove trailing period
    meaning = re.sub(r'[。]$', '', meaning).strip()

    # Remove trailing slash
    meaning = re.sub(r'[/／].*$', '', meaning).strip()

    # Remove leading punctuation/noise
    meaning = re.sub(r'^[：:、，,\s]+', '', meaning)

    # Remove content in parentheses at the start if it's a parenthetical note
    # (keep these - they're part of the meaning like "(天气)热的")

    meaning = meaning.strip()

    if len(meaning) < 1:
        return ""

    return meaning


def extract_entries_from_text(text: str) -> list[dict]:
    """Extract vocabulary entries from OCR text with strict word boundaries."""
    entries = []
    lines = text.strip().split("\n")

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Find all occurrences of the pattern: word（reading）
        # The word is bounded by: start-of-string, whitespace, or entry marker BEFORE it
        # and （ AFTER it
        # We look for: (optional_marker + whitespace + word + （reading）...［POS］)
        #
        # Critical: the word itself should NOT contain （ or other entry markers

        # Strategy: find all （...） that contain hiragana readings,
        # then look backward from each to find the word

        reading_pattern = re.compile(r'[（(]([ぁ-んァ-ヶー・丶ヽヾ々]+)[）)]')

        for rm in reading_pattern.finditer(line):
            reading = rm.group(1)
            if not re.match(r'^[ぁ-ん]+$', reading):
                continue  # skip katakana-only readings (usually English loanwords)

            # Look backward from the （ to find the word
            before_paren = line[:rm.start()]
            # The word ends at the end of before_paren
            # It starts after the last marker or whitespace/punctuation boundary

            # Strip trailing whitespace from before_paren
            word_area = before_paren.rstrip()

            if not word_area:
                continue

            # Find the start of the word
            # The word should start after: entry marker (口■▼ etc), or a space, or
            # a noise character from the other column
            # Common noise before the word: "A", "▲", "△", "対", "関", "間",
            # "同音", "類", "固", "園", "題", "麺", "額", "閻", etc.
            # Also could be preceded by meaning text from the other column

            # Strategy: find the LAST occurrence of an entry marker or noise separator
            # and take everything after it as the word

            # Remove any trailing junk after the actual word
            # (content from the other column that appears between the word and the paren)
            noise_after_word = re.compile(
                r'[\s　]*'  # whitespace
                r'(?:'
                r'[A▲△▶]'  # example markers
                r'|[■口▼★☆ロ]'  # entry markers (if a second entry starts before our paren)
                r'|[対関闘間類固園國題麺額閻閥閲閣]'  # related-word markers
                r'|[同硬額麺問閻題]'  # more noise
                r')'
                r'.*$'
            )
            word_area_clean = noise_after_word.sub('', word_area)

            # Now find the word start - it should start after the last entry marker or noise
            # The word is the last "clean" segment of word_area_clean
            # Look for the last occurrence of a marker/separator
            marker_pattern = re.compile(
                r'(?:'
                r'[■口▼▶☆★ロ]\s*'  # entry markers
                r'|[対関闘間類固園國題麺額閻閥閲閣]\s*'  # related-word markers
                r'|[同音]\s*'  # same-sound note
                r'|[\s　][A-Z]\s*'  # example marker
                r')'
            )

            last_marker = None
            for mm in marker_pattern.finditer(word_area_clean):
                last_marker = mm

            if last_marker:
                word = word_area_clean[last_marker.end():].strip()
            else:
                # No marker found - the word might be the entire area
                # But check if it contains other-column noise
                word = word_area_clean.strip()

            # Additional cleanup: remove leading hiragana that's likely noise
            word = re.sub(r'^[へヘ]+\s*', '', word)

            # Validate word
            if not word:
                continue

            # Word should be reasonably short (N5 vocab is typically 1-8 chars)
            # Allow up to 12 for compound words like 外国語
            if len(word) > 12:
                # Try to truncate - look for the actual vocab word
                # N5 words rarely exceed 8 kanji
                word = word[:12]

            # Word must contain at least one CJK or katakana
            if not re.search(r'[\u4e00-\u9fff\u30a0-\u30ff〜～]', word):
                continue

            # Look ahead for POS and meaning
            after_reading = line[rm.end():]

            # Extract accent number (circled numbers or digits)
            accent_match = re.match(r'([①②③④⑤⑥⑦⑧⑨⓪〇０\d]+)', after_reading)
            if accent_match:
                after_reading = after_reading[accent_match.end():]

            # Extract POS from brackets
            pos_match = re.match(r'\s*[［\[]([^］\]]+?)[］\]]', after_reading)
            if not pos_match:
                continue

            pos = pos_match.group(1).strip()
            after_pos = after_reading[pos_match.end():]

            # Validate POS
            pos_tags = ['名', '動', '形', '副', '代', '連体', '接尾', '接頭', '嘆', '数', '十']
            if not any(tag in pos for tag in pos_tags):
                continue

            # Extract meaning
            meaning_match = re.match(
                r'\s*([^\n]*?)(?=\s*[■口▼▶☆★ロ]|[A▲△]\s|/|\[|$)',
                after_pos
            )
            if meaning_match:
                meaning = meaning_match.group(1).strip()
            else:
                meaning = after_pos.strip()

            meaning = clean_meaning(meaning)
            if not meaning:
                continue

            # Final meaning validation: must start with CJK
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

    # Show all entries
    for i, e in enumerate(unique):
        print(f"  {i+1}. {e['word']}（{e['reading']}）[{e['pos']}] {e['meaning']}")


if __name__ == "__main__":
    main()
