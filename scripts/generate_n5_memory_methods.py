#!/usr/bin/env python3
"""
Generate N5 vocabulary with memory methods in the MoatVocabEntry format.
Strategy:
- Kanji words: TYPE A (音读绑定) + TYPE B5 (语义象形) when possible
- Kana-only words: TYPE B2 (谐音故事) or direct patterns
- Katakana words: English origin hint
"""

import json
import re
import hashlib
from pathlib import Path

INPUT = Path("data/n5_vocab_final.json")
OUTPUT = Path("src/data/n5MoatVocab.ts")

# Known kanji readings for TYPE A
KANJI_READINGS = {
    # Common N5 kanji with their most frequent readings
    "会": "かい", "青": "せい/あお", "赤": "せき/あか", "秋": "しゅう/あき",
    "開": "かい/あく/ひら", "朝": "ちょう/あさ", "足": "そく/あし",
    "明": "めい/あか", "雨": "う", "安全": "あんぜん",
    "医": "い", "一": "いち", "飲": "いん/の", "右": "う/みぎ",
    "雨": "う", "売": "ばい/う", "下": "か/した", "火": "か/ひ",
    "花": "か/はな", "何": "か/なに", "画": "が/え", "外": "がい/そと",
    "学": "がく", "階": "かい", "毎": "まい", "回": "かい",
    "海": "かい/うみ", "界": "かい", "絵": "かい/え", "書": "しょ/か",
    "角": "かく", "学": "がく", "楽": "がく/たの", "間": "かん/あいだ",
    "館": "かん", "顔": "かお", "機": "き", "気": "き",
    "記": "き", "切": "せつ/き", "聞": "ぶん/き", "近": "きん/ちか",
    "九": "きゅう/く", "牛": "ぎゅう", "今日": "きょう", "急": "きゅう",
    "銀": "ぎん", "金": "きん/かね", "空": "くう/そら", "首": "しゅ/くび",
    "国": "こく/くに", "語": "ご", "口": "こう/くち", "校": "こう",
    "交": "こう", "光": "こう/ひか", "高": "こう/たか", "行": "こう/い",
    "工": "こう", "公": "こう", "好": "こう", "今": "こん/いま",
    "左": "さ/ひだり", "作": "さく/つく", "雑": "ざつ", "三": "さん",
    "山": "さん/やま", "散": "さん", "子": "し/こ", "四": "し/よん",
    "死": "し/し", "事": "じ/こと", "時": "じ/とき", "七": "しち/なな",
    "字": "じ/あざ", "自": "じ/みずか", "写": "しゃ/うつ", "社": "しゃ",
    "車": "しゃ/くるま", "者": "しゃ", "手": "しゅ/て", "受": "じゅ/う",
    "週": "しゅう", "習": "しゅう", "集": "しゅう", "住": "じゅう/す",
    "重": "じゅう/おも", "十": "じゅう/とお", "色": "しょく/いろ",
    "食": "しょく/た", "人": "じん/ひと", "新": "しん/あたら", "親": "しん/おや",
    "心": "しん/こころ", "寝": "しん/ね", "図": "ず/はか", "水": "すい/みず",
    "数": "すう/かぞ", "生": "せい/い", "西": "せい/にし", "青": "せい/あお",
    "静": "せい/しず", "切": "せつ/き", "先": "せん/さき", "千": "せん",
    "洗": "せん/あら", "前": "ぜん/まえ", "全部": "ぜんぶ",
    "送": "そう/おく", "走": "そう/はし", "多": "た/おお", "体": "たい/からだ",
    "大": "だい/おお", "代": "だい", "男": "だん/おとこ", "茶": "ちゃ",
    "中": "ちゅう/なか", "長": "ちょう/なが", "通": "つう/とお",
    "手": "て", "電": "でん", "店": "てん/みせ", "読": "どく/よ",
    "南": "なん/みなみ", "二": "に", "日": "にち/ひ", "入": "にゅう/はい",
    "年": "ねん/とし", "能": "のう", "買": "ばい/か", "白": "はく/しろ",
    "半": "はん", "番": "ばん", "母": "はは/ぼ", "百": "ひゃく",
    "病": "びょう", "秒": "びょう", "飛": "ひ/と", "返": "へん/かえ",
    "便": "びん/たよ", "父": "ふ/ちち", "婦": "ふ", "分": "ぶん/わ",
    "北": "ほく/きた", "本": "ほん", "毎": "まい", "万": "まん",
    "味": "み/あじ", "見": "けん/み", "名": "めい/な", "門": "もん",
    "野": "や/の", "約": "やく", "夕": "ゆう", "洋": "よう",
    "曜": "よう", "来": "らい/く", "理": "り", "立": "りつ/た",
    "留": "りゅう", "旅": "りょ", "料": "りょう", "力": "りょく/ちから",
    "両": "りょう", "類": "るい", "歴": "れき", "話": "わ/はな",
    "悪": "あく/わる", "安": "あん/やす", "暗": "あん/くら",
    "意": "い", "以": "い", "維": "い", "移": "い",
    "園": "えん", "遠": "えん/とお", "音": "おん/おと", "下": "か/した/くだ",
    "化": "か", "果": "か", "貨": "か", "課": "か",
    "急": "きゅう", "供": "きょう", "業": "ぎょう", "強": "きょう/つよ",
    "教": "きょう/おし", "兄弟": "きょうだい", "境": "きょう",
    "銀": "ぎん", "空": "くう/そら", "具": "ぐ", "軍": "ぐん",
    "経": "けい/へ", "計": "けい", "元": "げん/もと",
    "原": "げん", "言": "げん/い", "古": "こ/ふる", "午": "ご",
    "後": "ご/あと", "号": "ごう", "最": "さい", "歳": "さい",
    "再": "さい", "祭": "さい", "細": "さい/ほそ", "産": "さん",
    "思": "し/おも", "使": "し/つか", "始": "し/はじ",
    "室": "しつ", "質": "しつ", "弱": "じゃく/よわ",
    "主": "しゅ", "週": "しゅう", "集": "しゅう", "宿": "しゅく",
    "出": "しゅつ/で", "処": "しょ", "初": "しょ/はじ",
    "所": "しょ/ところ", "書": "しょ/か", "勝": "しょう",
    "象": "しょう", "少": "しょう/すく", "承": "しょう",
    "諸": "しょ", "女": "じょ/おんな", "上": "じょう/うえ",
    "場": "じょう/ば", "色": "しょく/いろ",
    "真": "しん/ま", "神": "しん/かみ", "進": "しん/すす",
    "人": "じん/ひと", "世": "せい/よ", "政": "せい",
    "整": "せい", "息": "そく/いき", "族": "ぞく",
    "体": "たい/からだ", "対": "たい", "退": "たい",
    "台": "だい", "代": "だい", "大": "だい/おお",
    "待": "たい/ま", "第": "だい", "題": "だい",
    "炭": "たん", "短": "たん/みじか", "談": "だん",
    "地": "ち/じ", "池": "ち", "注": "ちゅう",
    "柱": "ちゅう", "著": "ちょ", "貯": "ちょ",
    "丁": "ちょう", "鳥": "ちょう/とり", "朝": "ちょう/あさ",
    "直": "ちょく", "通": "つう/とお", "廷": "てい",
    "定": "てい", "底": "てい", "的": "てき",
    "適": "てき", "転": "てん", "伝": "でん",
    "都": "と/みやこ", "度": "ど", "投": "とう",
    "東": "とう/ひがし", "同": "どう", "動": "どう/うご",
    "堂": "どう", "道": "どう/みち", "特": "とく",
    "独": "どく", "読": "どく/よ", "内": "ない/うち",
    "日": "にち/ひ", "入": "にゅう/はい",
    "熱": "ねつ", "年": "ねん/とし", "農": "のう",
    "物": "ぶつ/もの", "返": "へん/かえ", "報": "ほう",
    "北": "ほく/きた", "味": "み/あじ", "命": "めい/いのち",
    "面": "めん", "薬": "やく/くすり", "野": "や/の",
    "有": "ゆう/あ", "余": "よ", "予": "よ",
    "洋": "よう", "曜": "よう", "来": "らい/く",
    "理": "り", "立": "りつ/た", "流": "りゅう/なが",
    "留": "りゅう", "旅": "りょ", "両": "りょう",
    "料": "りょう", "力": "りょく/ちから",
    "冷": "れい/つめ", "列": "れつ", "練": "れん",
    "話": "わ/はな",
}

# Common phonetic associations for TYPE B2 (kana → Chinese homophone)
PHONETIC_MAP = {
    "あ": "啊", "い": "衣/以", "う": "乌/有", "え": "哎/绘", "お": "哦/大",
    "か": "卡/加", "き": "起/奇", "く": "哭/苦", "け": "开/课", "こ": "口/工",
    "さ": "撒/茶", "し": "西/洗", "す": "苏/酸", "せ": "世/设", "そ": "锁/搜",
    "た": "他/踏", "ち": "七/吃", "つ": "次/吃", "て": "天/铁", "と": "偷/图",
    "な": "那/拿", "に": "你/泥", "ぬ": "奴", "ね": "捏/念", "の": "诺/弄",
    "は": "哈/花", "ひ": "hi/比", "ふ": "夫/福", "へ": "嘿/边", "ほ": "火/本",
    "ま": "妈/马", "み": "蜜/米", "む": "无/梦", "め": "目/妹", "も": "毛/摸",
    "や": "呀/压", "ゆ": "油/由", "よ": "哟/要",
    "ら": "拉/来", "り": "里/离", "る": "路/鲁", "れ": "来/列", "ろ": "老/楼",
    "わ": "瓦/挖", "を": "哦", "ん": "恩/门",
}

def has_kanji(text: str) -> bool:
    return bool(re.search(r'[\u4e00-\u9fff]', text))

def is_katakana_only(text: str) -> bool:
    return bool(re.match(r'^[\u30a0-\u30ffー〜～]+$', text))

def generate_id(word: str, reading: str) -> str:
    """Generate a stable ID from word and reading."""
    s = f"{word}_{reading}"
    h = hashlib.md5(s.encode()).hexdigest()[:8]
    return h

def generate_memory_for_word(entry: dict) -> dict:
    """Generate memory method for a single word."""
    word = entry["word"]
    reading = entry["reading"]
    meaning = entry["meaning"]
    elements = []
    merged_scene = ""

    if is_katakana_only(word):
        # Katakana loanword - note English origin
        elements.append({
            "element": word,
            "method": "外来语",
            "bridgeC": f"英语外来语，注意片假名拼写",
        })
        merged_scene = f"{word}是外来语，记忆片假名发音即可。"
        difficulty = 1
        scene_quality = "外来语直接记忆"

    elif has_kanji(word):
        # Word has kanji - try TYPE A first
        kanji_chars = [c for c in word if '\u4e00' <= c <= '\u9fff']
        unique_kanji = []
        for c in kanji_chars:
            if c not in unique_kanji:
                unique_kanji.append(c)

        for c in unique_kanji:
            # Check if kanji has known reading
            if c in KANJI_READINGS:
                elements.append({
                    "element": c,
                    "method": "A1 单字音读",
                    "bridgeC": f"{c}（{KANJI_READINGS[c]}）",
                })
            else:
                # Check if meaning is directly related to Chinese meaning
                elements.append({
                    "element": c,
                    "method": "B5 语义象形",
                    "bridgeC": f"汉字「{c}」字义与日语含义相关",
                })

        # Add kana element if there's a significant kana portion
        kana_portion = re.sub(r'[\u4e00-\u9fff]', '', reading)
        if len(kana_portion) >= 2 and kana_portion != reading:
            elements.append({
                "element": kana_portion[:2],
                "method": "B2 谐音记忆",
                "bridgeC": f"谐音联想辅助记忆",
            })

        merged_scene = f"通过汉字「{''.join(unique_kanji)}」的字义和音读组合来记忆：「{meaning}」"
        difficulty = 2 if len(unique_kanji) > 1 else 1
        scene_quality = "音读绑定 + 语义象形"

    else:
        # Pure hiragana word
        # Generate a simple phonetic association
        if reading in PHONETIC_MAP or len(reading) <= 4:
            elements.append({
                "element": reading,
                "method": "B2 谐音故事",
                "bridgeC": f"整体记忆「{reading}」= {meaning}",
            })
        else:
            # Break into chunks
            chunks = [reading[i:i+2] for i in range(0, len(reading), 2)]
            for chunk in chunks:
                elements.append({
                    "element": chunk,
                    "method": "B2 谐音记忆",
                    "bridgeC": f"谐音辅助记忆「{chunk}」",
                })

        merged_scene = f"整体记忆训读词「{word}」（{reading}）= {meaning}"
        difficulty = 2
        scene_quality = "训读词整体记忆"

    return {
        "elements": elements,
        "mergedScene": merged_scene,
        "sceneQuality": scene_quality,
        "difficultyStars": difficulty,
    }


def main():
    with open(INPUT, encoding="utf-8") as f:
        data = json.load(f)

    print(f"Input: {len(data)} entries")

    entries = []
    for i, e in enumerate(data):
        mem = generate_memory_for_word(e)
        entry = {
            "id": generate_id(e["word"], e["reading"]),
            "word": e["word"],
            "reading": e["reading"],
            "meaning": e["meaning"],
            "elements": mem["elements"],
            "mergedScene": mem["mergedScene"],
            "sceneQuality": mem.get("scene_quality", ""),
            "reviewHint": f"重走「{e['meaning']}」的联想路径",
            "difficultyStars": mem["difficultyStars"],
        }

        entries.append(entry)

    # Write as TypeScript
    lines = []
    lines.append("import type { MoatVocabEntry } from '../types'")
    lines.append("")
    lines.append("/**")
    lines.append(" * N5词汇护城河：带记忆法的词条")
    lines.append(f" * 共 {len(entries)} 条")
    lines.append(" */")
    lines.append("export const n5MoatVocab: MoatVocabEntry[] = [")
    for entry in entries:
        lines.append("  {")
        lines.append(f"    id: '{entry['id']}',")
        lines.append(f"    word: '{entry['word'].replace("'", "\\'")}',")
        lines.append(f"    reading: '{entry['reading']}',")
        lines.append(f"    meaning: '{entry['meaning'].replace("'", "\\'")}',")
        lines.append("    elements: [")
        for elem in entry["elements"]:
            lines.append("      {")
            lines.append(f"        element: '{elem['element'].replace("'", "\\'")}',")
            lines.append(f"        method: '{elem['method'].replace("'", "\\'")}',")
            lines.append(f"        bridgeC: '{elem['bridgeC'].replace("'", "\\'")}',")
            lines.append("      },")
        lines.append("    ],")
        lines.append(f"    mergedScene: '{entry['mergedScene'].replace("'", "\\'")}',")
        lines.append(f"    sceneQuality: '{entry['sceneQuality'].replace("'", "\\'")}',")
        lines.append(f"    reviewHint: '{entry['reviewHint'].replace("'", "\\'")}',")
        lines.append(f"    difficultyStars: {entry['difficultyStars']},")
        lines.append("  },")

    lines.append("]")
    lines.append("")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text("\n".join(lines), encoding="utf-8")

    print(f"Output: {OUTPUT}")
    print(f"Written {len(entries)} entries")

    # Stats
    diff_counts = {}
    for e in entries:
        d = e["difficultyStars"]
        diff_counts[d] = diff_counts.get(d, 0) + 1
    print(f"Difficulty distribution: {diff_counts}")

    # Show sample
    print(f"\nSample entries:")
    for e in entries[:5]:
        print(f"  {e['word']}（{e['reading']}）→ {e['meaning']}")
        for el in e['elements']:
            print(f"    [{el['method']}] {el['element']}: {el['bridgeC']}")


if __name__ == "__main__":
    main()
