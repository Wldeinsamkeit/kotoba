#!/usr/bin/env python3
"""
N5 vocabulary - merge and clean final version.
Combines v5 (broad extraction, 674 entries) with v8 (clean extraction, 458 entries)
and applies comprehensive cleanup.
"""

import json
import re
from pathlib import Path

OUTPUT = Path("data/n5_vocab_clean.json")


def is_valid_word(word: str) -> bool:
    """Check if word looks like a valid Japanese vocabulary entry."""
    if not word:
        return False
    # Must start with CJK, katakana, ~, or お/ご (honorific prefixes)
    if not re.match(r'^[\u4e00-\u9fff\u30a0-\u30ff〜～おご]', word):
        return False
    # Must contain at least one CJK or katakana
    if not re.search(r'[\u4e00-\u9fff\u30a0-\u30ff]', word):
        return False
    # Word should be reasonable length
    if len(word) > 12:
        return False
    # Should not contain obvious noise
    if re.search(r'[■口▼▶☆★ロ対関闘間類固園國題麺額閻閥閲閣]', word):
        return False
    if re.search(r'[/／]', word):
        return False
    if re.search(r'[A-Z]', word):
        return False
    if re.search(r'[。、！？]', word):
        return False
    # Should not start with common OCR noise characters that were incorrectly captured
    if re.match(r'^(?:菌|効|日|額|麺|問|閻|題|間|対|関|闘|類|固|園|國|同|硬|音|斯|豆|念|四|迗|在)', word):
        return False
    return True


def clean_meaning(meaning: str) -> str:
    """Clean meaning text."""
    if not meaning:
        return ""
    # Remove furigana at end
    meaning = re.sub(r'\s+[ぁ-ん]{2,}\s*$', '', meaning)
    meaning = re.sub(r'\s+[\u4e00-\u9fff][\u3040-\u309f]{0,2}\s*$', '', meaning)
    # Remove other column content
    meaning = re.sub(r'[；;].*$', '', meaning).strip()
    meaning = re.sub(r'\s+[A▲△].*$', '', meaning)
    # Remove trailing period and slash
    meaning = re.sub(r'[。]$', '', meaning).strip()
    meaning = re.sub(r'[/／].*$', '', meaning).strip()
    # Remove leading punctuation
    meaning = re.sub(r'^[：:、，,]+\s*', '', meaning)
    # Remove obvious parenthetical OCR artifacts at start like （】、等）
    meaning = re.sub(r'^（[^）]*?）\s*', '', meaning)
    # Remove trailing noise after Chinese meaning
    meaning = re.sub(r'\s+[\u4e00-\u9fff]{1,2}[\u3040-\u309f]{0,3}\s*$', '', meaning)
    meaning = meaning.strip()
    return meaning


def main():
    # Load v5 data (broad extraction)
    import subprocess
    subprocess.run(["python3", "scripts/parse_n5_ocr_v5.py"], check=True, capture_output=True)
    v5_data = json.loads(Path("data/n5_vocab_v5.json").read_text())

    # Load v8 data (clean extraction)
    subprocess.run(["python3", "scripts/parse_n5_v8.py"], check=True, capture_output=True)
    v8_data = json.loads(Path("data/n5_vocab_v8.json").read_text())

    # Merge: start with all v5 entries, add v8 entries that aren't in v5
    all_entries = {}

    for e in v5_data:
        key = (e["word"], e["reading"])
        if is_valid_word(e["word"]):
            e["meaning"] = clean_meaning(e["meaning"])
            if e["meaning"] and re.match(r'^[\u4e00-\u9fff（(]', e["meaning"]):
                all_entries[key] = e

    for e in v8_data:
        key = (e["word"], e["reading"])
        if key not in all_entries and is_valid_word(e["word"]):
            e["meaning"] = clean_meaning(e["meaning"])
            if e["meaning"] and re.match(r'^[\u4e00-\u9fff（(]', e["meaning"]):
                all_entries[key] = e

    # Convert to list and sort by source_page then word
    entries = sorted(all_entries.values(), key=lambda x: (x.get("source_page", ""), x["word"]))

    # Save
    OUTPUT.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Final: {len(entries)} unique vocabulary entries")
    print(f"Output: {OUTPUT}")

    # Stats
    short_meanings = [e for e in entries if len(e["meaning"]) <= 2]
    print(f"Entries with short meaning (<=2 chars): {len(short_meanings)}")

    # Show first 20
    print(f"\nFirst 20 entries:")
    for i, e in enumerate(entries[:20]):
        print(f"  {i+1}. {e['word']}（{e['reading']}）[{e['pos']}] {e['meaning']}")


if __name__ == "__main__":
    main()
