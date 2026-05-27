#!/usr/bin/env python3
"""
Apply OCR character-level corrections to N5 vocabulary data.
Fixes common misrecognitions by macOS Vision OCR.
"""

import json
import re
from pathlib import Path

INPUT = Path("data/n5_vocab_clean.json")
OUTPUT = Path("data/n5_vocab_final.json")


# Common OCR character substitution patterns
# Format: (wrong_chars, correct_chars, context_pattern)
# Applied to meaning field only (word field corrections are done separately)
MEANING_CORRECTIONS = [
    # OCR confuses similar-looking characters
    ('会児', '会面'),
    ('面、会', '见面、会'),
    ('面：偶遇', '面；偶遇'),
    ('火$', '关'),  # 閉まる meaning: 関→关
    ('美上', '关上'),
    ('開的', '打开的'),
    ('打弁', '打开'),
    ('蔚', '开'),
    ('送介', '这个'),
    ('送', '这'),
    ('什ム', '什么'),
    ('送祥', '这样'),
    ('公', '说'),
    ('冶', '治'),
    ('涅', '洗'),
    ('鎧', '気'),
    ('駐', '肚'),
    ('徒', '挺'),
    ('鎮', '闹'),
    ('喟', '演'),
    ('肘', '时'),
    ('吋', '时'),
    ('遂', '这'),
    ('吪', '么'),
    ('夢', '岁'),
    ('志', '人'),
    ('応', '园'),
    ('疸', '层'),
    ('鉄', '连'),
    ('用', '同'),
    ('岌', '危'),
    ('熒', '热'),
    ('崗', '闹'),
    ('涅', '洗'),
    ('飯', '饭'),
    ('坂', '饭'),
    ('晩仮', '晚饭'),
    ('早坂', '早饭'),
    ('午仮', '午饭'),
    ('印』', ''),
    ('嘆', '叹'),
    ('燙', '烫'),
    ('誌', '电影'),
    ('誌影', '电影'),
    ('誌館', '电影院'),
    ('誌院', '影院'),
    ('自動3', '自他動3'),
    ('白動3', '自動3'),
    ('自動1', '自動1'),
    ('他動1', '他動1'),
    ('他動2', '他動2'),
    ('他動3', '他動3'),
    ('動1', '動1'),
    ('動2', '動2'),
    ('動3', '動3'),
]

# Word-level corrections (word -> correct_word, reading)
WORD_CORRECTIONS = {
    '星': ('昼', 'ひる'),       # 星→昼 (OCR confusion)
    '定': ('足', 'あし'),       # 定→足
    '紅革果': ('赤いりんご', 'あかいりんご'),  # wrong word entirely
}


def fix_meaning(meaning: str) -> str:
    """Apply OCR corrections to meaning text."""
    for wrong, right in MEANING_CORRECTIONS:
        if wrong.endswith('$'):
            # Regex pattern - only match at end
            meaning = re.sub(wrong[:-1] + r'$', right, meaning)
        else:
            meaning = meaning.replace(wrong, right)
    return meaning


def fix_word(word: str) -> tuple[str, str]:
    """Fix OCR errors in word field. Returns (fixed_word, reading)."""
    # Check for known wrong words (use reading as key)
    # These are cases where the kanji was completely misread
    return word, None  # reading correction handled separately


def main():
    data = json.loads(INPUT.read_text(encoding="utf-8"))
    print(f"Input: {len(data)} entries")

    # Apply word corrections
    word_corrected = 0
    for e in data:
        for wrong, (correct, correct_reading) in WORD_CORRECTIONS.items():
            if e["word"] == wrong and e["reading"] == correct_reading:
                e["word"] = correct
                word_corrected += 1
                break

    print(f"Word corrections applied: {word_corrected}")

    # Apply meaning corrections
    meaning_corrected = 0
    for e in data:
        old_meaning = e["meaning"]
        new_meaning = fix_meaning(e["meaning"])
        if new_meaning != old_meaning:
            e["meaning"] = new_meaning
            meaning_corrected += 1

    print(f"Meaning corrections applied: {meaning_corrected}")

    # Remove duplicates that might have been created
    seen = set()
    unique = []
    for e in data:
        key = (e["word"], e["reading"])
        if key not in seen:
            seen.add(key)
            unique.append(e)

    # Save
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(unique, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Output: {len(unique)} entries -> {OUTPUT}")

    # Show first 30 entries for review
    print(f"\nFirst 30 entries:")
    for i, e in enumerate(unique[:30]):
        print(f"  {i+1}. {e['word']}（{e['reading']}）[{e['pos']}] {e['meaning']}")


if __name__ == "__main__":
    main()
