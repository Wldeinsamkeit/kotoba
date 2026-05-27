#!/usr/bin/env python3
"""
Final N5 vocabulary merge: GT words + OCR Chinese meanings + Anki English meanings.

Sources:
1. Bluskyo/JLPT_Vocabulary n5_vocab_cleaned.csv - canonical word/reading pairs
2. Our OCR extraction - Chinese meanings from 红宝书
3. open-anki-jlpt-decks n5.csv - English meanings (reliable)
"""

import csv
import json
import re
from pathlib import Path

GT_CSV = Path("data/n5_vocab_cleaned.csv")
OCR_JSON = Path("data/n5_vocab_clean.json")
ANKI_CSV = Path("data/n5_anki.csv")
OUTPUT = Path("data/n5_vocab_merged.json")


def clean_ocr_meaning(meaning: str) -> str:
    """Clean OCR artifacts from Chinese meaning."""
    if not meaning:
        return ""
    meaning = re.sub(r'[；;].*$', '', meaning).strip()
    meaning = re.sub(r'[A▲△].*$', '', meaning).strip()
    meaning = re.sub(r'[/／].*$', '', meaning).strip()
    meaning = re.sub(r'[。]$', '', meaning).strip()
    meaning = re.sub(r'\s+[ぁ-ん]{2,}\s*$', '', meaning)
    meaning = re.sub(r'\s+[\u4e00-\u9fff][\u3040-\u309f]{0,2}\s*$', '', meaning)
    meaning = re.sub(r'^（[^）]*?）\s*', '', meaning)
    meaning = re.sub(r'^[：:、，,～\s]+', '', meaning)
    meaning = re.sub(r'[〜～\s]+$', '', meaning)
    meaning = meaning.strip()
    return meaning


def is_good_chinese_meaning(meaning: str) -> bool:
    """Check if a Chinese meaning is clean enough to use."""
    if not meaning:
        return False
    # Must have at least 2 CJK characters
    cjk_count = sum(1 for c in meaning if '\u4e00' <= c <= '\u9fff')
    if cjk_count < 2:
        return False
    # Should not contain obvious OCR garbage patterns
    if re.search(r'[、，,]{2,}', meaning):
        return False
    if re.search(r'[・]{2,}', meaning):
        return False
    # Should not be too long (likely captured other column content)
    if len(meaning) > 30:
        return False
    return True


def main():
    # === Load ground truth ===
    gt_entries = []
    gt_set = set()
    gt_by_reading = {}
    with open(GT_CSV, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            w, r = row["Kanji"].strip(), row["Reading"].strip()
            gt_entries.append((w, r))
            gt_set.add((w, r))
            gt_by_reading.setdefault(r, []).append(w)

    # === Load OCR data (indexed by reading) ===
    ocr_by_reading = {}
    ocr_by_pair = {}
    with open(OCR_JSON, encoding="utf-8") as f:
        for e in json.load(f):
            w, r = e["word"], e["reading"]
            ocr_by_pair[(w, r)] = e
            if r not in ocr_by_reading:
                ocr_by_reading[r] = []
            ocr_by_reading[r].append(e)

    # === Load Anki English meanings ===
    anki_by_word = {}
    anki_by_reading = {}
    anki_by_pair = {}
    with open(ANKI_CSV, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            expr = row["expression"].strip()
            reading = row["reading"].strip()
            meaning = row["meaning"].strip()
            anki_by_word.setdefault(expr, []).append(meaning)
            anki_by_reading.setdefault(reading, []).append(meaning)
            anki_by_pair[(expr, reading)] = meaning

    # === Merge ===
    merged = []
    stats = {"exact": 0, "reading": 0, "no_ocr": 0, "good_cn": 0, "bad_cn": 0}

    for gt_word, gt_reading in gt_entries:
        entry = {
            "word": gt_word,
            "reading": gt_reading,
            "pos": "",
            "meaning": "",       # Chinese meaning
            "meaning_en": "",    # English meaning
        }

        # --- Get English meaning from Anki ---
        en_meaning = ""
        if (gt_word, gt_reading) in anki_by_pair:
            en_meaning = anki_by_pair[(gt_word, gt_reading)]
        elif gt_reading in anki_by_reading:
            # Multiple words share this reading, try matching
            anki_meanings = anki_by_reading[gt_reading]
            en_meaning = anki_meanings[0] if anki_meanings else ""
        entry["meaning_en"] = en_meaning

        # --- Get Chinese meaning from OCR ---
        cn_meaning = ""
        pos = ""
        if (gt_word, gt_reading) in ocr_by_pair:
            ocr = ocr_by_pair[(gt_word, gt_reading)]
            cn_meaning = clean_ocr_meaning(ocr.get("meaning", ""))
            pos = ocr.get("pos", "")
            stats["exact"] += 1
        elif gt_reading in ocr_by_reading:
            # Use first OCR entry with matching reading
            best = None
            for ocr in ocr_by_reading[gt_reading]:
                if ocr["word"] == gt_word:
                    best = ocr
                    break
            if not best:
                best = ocr_by_reading[gt_reading][0]
            cn_meaning = clean_ocr_meaning(best.get("meaning", ""))
            pos = best.get("pos", "")
            stats["reading"] += 1
        else:
            stats["no_ocr"] += 1

        entry["pos"] = pos

        # Validate Chinese meaning quality
        if is_good_chinese_meaning(cn_meaning):
            entry["meaning"] = cn_meaning
            stats["good_cn"] += 1
        elif cn_meaning:
            stats["bad_cn"] += 1
            # Keep it anyway but it's flagged as potentially bad

        merged.append(entry)

    # Deduplicate
    seen = set()
    unique = []
    for e in merged:
        key = (e["word"], e["reading"])
        if key not in seen:
            seen.add(key)
            unique.append(e)

    # Stats
    with_cn = sum(1 for e in unique if e["meaning"])
    with_en = sum(1 for e in unique if e["meaning_en"])
    with_both = sum(1 for e in unique if e["meaning"] and e["meaning_en"])

    print(f"Final: {len(unique)} unique entries")
    print(f"With Chinese meaning: {with_cn}")
    print(f"With English meaning: {with_en}")
    print(f"With both: {with_both}")
    print(f"\nMatch stats: exact={stats['exact']}, reading={stats['reading']}, no_ocr={stats['no_ocr']}")
    print(f"Chinese meaning quality: good={stats['good_cn']}, bad={stats['bad_cn']}")

    # Save
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(unique, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"\nOutput: {OUTPUT}")

    # Show entries without any meaning
    no_meaning = [e for e in unique if not e["meaning"] and not e["meaning_en"]]
    print(f"\nNo meaning at all: {len(no_meaning)}")
    if no_meaning:
        for e in no_meaning[:10]:
            print(f"  {e['word']}（{e['reading']}）")

    # Show sample
    print(f"\nSample (first 20):")
    for i, e in enumerate(unique[:20]):
        cn = e["meaning"] if e["meaning"] else "-"
        en = e["meaning_en"][:40] if e["meaning_en"] else "-"
        print(f"  {i+1}. {e['word']}（{e['reading']}）[{e['pos']}] {cn} / {en}")


if __name__ == "__main__":
    main()
