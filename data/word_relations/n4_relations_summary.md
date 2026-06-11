# N4 单词关系图总结

本文件由 `scripts/build_word_relations.cjs` 生成。它不是人工最终审稿，而是给「单词链路图」和「记忆方法生成」使用的第一版结构化底座。

## 输出文件

- `data/word_relations/n4_relation_edges.json`：关系边列表，适合画链路图和做统计。
- `data/word_relations/n4_word_relation_index.json`：按单词索引，适合 AI 写记忆法前检索。

## 数据规模

- N4 单词数：1175
- 关系边数：2538

## 关系类型统计

| 类型 | 数量 |
|------|------|
| same_kanji_different_reading | 2316 |
| kana_similarity | 166 |
| same_reading_different_writing | 37 |
| dakuten_or_handakuten_difference | 9 |
| same_kanji_same_reading | 5 |
| transitive_intransitive_pair | 4 |
| adjective_derivation | 1 |

## 高价值样例

- 合う(あう) ↔ 遭う(あう) ｜ same_reading_different_writing ｜ あう 完全同音：合う=合适，适合，遭う=偶遇，碰见，必须成对区分。
- 暖める(あたためる) ↔ 温める(あたためる) ｜ same_reading_different_writing ｜ あたためる 完全同音：暖める=温，温める=温，热，必须成对区分。
- 暑い(あつい) ↔ 厚い(あつい) ｜ same_reading_different_writing ｜ あつい 完全同音：暑い=热，厚い=厚，必须成对区分。
- 或る(ある) ↔ 有る(ある) ｜ same_reading_different_writing ｜ ある 完全同音：或る=某，有る=存在，有，必须成对区分。
- 写す(うつす) ↔ 移す(うつす) ｜ same_reading_different_writing ｜ うつす 完全同音：写す=抄，誊，移す=移动，转移，必须成对区分。
- 移る(うつる) ↔ 写る(うつる) ｜ same_reading_different_writing ｜ うつる 完全同音：移る=移动，搬家，写る=照像，拍照，必须成对区分。
- 蝦(えび) ↔ 海老(えび) ｜ same_reading_different_writing ｜ えび 完全同音：蝦=虾，海老=虾，必须成对区分。
- 送る(おくる) ↔ 贈る(おくる) ｜ same_reading_different_writing ｜ おくる 完全同音：送る=送行，送走，贈る=赠送，送礼，必须成对区分。
- 起こる(おこる) ↔ 怒る(おこる) ｜ same_reading_different_writing ｜ おこる 完全同音：起こる=起，发生，怒る=怒，恼怒，必须成对区分。
- 折る(おる) ↔ 居る(おる) ｜ same_reading_different_writing ｜ おる 完全同音：折る=折断，居る=在，有，必须成对区分。
- 換える(かえる) ↔ 変える(かえる) ｜ same_reading_different_writing ｜ かえる 完全同音：換える=改换，交换，変える=改变，变更，必须成对区分。
- 科学(かがく) ↔ 化学(かがく) ｜ same_reading_different_writing ｜ かがく 完全同音：科学=[名·サ变]，化学=化学，必须成对区分。

## 关系最多的词

| 单词 | 读音 | 关系数 | 高价值关系 | 建议策略 |
|------|------|--------|------------|----------|
| 大学生 | だいがくせい | 37 | 37 | 同字不同音 + 固定读音提醒 |
| 見物人 | けんぶつにん | 33 | 33 | 同字不同音 + 固定读音提醒 |
| 社会人 | しゃかいじん | 29 | 29 | 同字不同音 + 固定读音提醒 |
| 中学校 | ちゅうがっこう | 29 | 29 | 同字不同音 + 固定读音提醒 |
| 大都会 | だいとかい | 29 | 29 | 同字不同音 + 固定读音提醒 |
| 大事 | だいじ | 28 | 27 | 同字不同音 + 固定读音提醒 |
| 大人 | おとな | 27 | 27 | 同字不同音 + 固定读音提醒 |
| 大人しい | おとなしい | 27 | 27 | 同字不同音 + 固定读音提醒 |
| 中学 | ちゅうがく | 27 | 26 | 同字不同音 + 固定读音提醒 |
| 見学 | けんがく | 27 | 26 | 同字不同音 + 固定读音提醒 |
| 入学 | にゅうがく | 26 | 25 | 同字不同音 + 固定读音提醒 |
| 出入り口 | でいりぐち | 25 | 25 | 同字不同音 + 固定读音提醒 |

## 目前判断

这版已经能支撑「先查关系，再写记忆法」：

1. 同音不同字优先用于易混提醒。
2. 同字不同音优先沉淀固定读音。
3. 相似假名优先做多一点、少一点、浊点差故事。
4. 自动词/他动词和形容词派生优先成组记。

下一步应加入人工确认状态：用户确认过的关系进入 `status: confirmed`，AI 自动发现但未审的关系保持 `status: auto`。
