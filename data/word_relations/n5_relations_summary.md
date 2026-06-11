# N5 单词关系图总结

本文件由 `scripts/build_word_relations.cjs` 生成。它不是人工最终审稿，而是给「单词链路图」和「记忆方法生成」使用的第一版结构化底座。

## 输出文件

- `data/word_relations/n5_relation_edges.json`：关系边列表，适合画链路图和做统计。
- `data/word_relations/n5_word_relation_index.json`：按单词索引，适合 AI 写记忆法前检索。

## 数据规模

- N5 单词数：673
- 关系边数：1029

## 关系类型统计

| 类型 | 数量 |
|------|------|
| same_kanji_different_reading | 853 |
| kana_similarity | 147 |
| same_reading_different_writing | 18 |
| adjective_derivation | 5 |
| dakuten_or_handakuten_difference | 3 |
| same_kanji_same_reading | 2 |
| transitive_intransitive_pair | 1 |

## 高价值样例

- 暑い(あつい) ↔ 熱い(あつい) ｜ same_reading_different_writing ｜ 汉字区分
- 暑い(あつい) ↔ 厚い(あつい) ｜ same_reading_different_writing ｜ 汉字区分
- 熱い(あつい) ↔ 厚い(あつい) ｜ same_reading_different_writing ｜ 汉字区分
- 雨(あめ) ↔ 飴(あめ) ｜ same_reading_different_writing ｜ 下雨想吃糖
- 伯母さん(おばさん) ↔ 叔母さん(おばさん) ｜ same_reading_different_writing ｜ おばさん 完全同音：伯母さん=阿姨、伯母，叔母さん=阿姨、婶婶，必须成对区分。
- 風(かぜ) ↔ 風邪(かぜ) ｜ same_reading_different_writing ｜ 吹风容易感冒
- 川(かわ) ↔ 河(かわ) ｜ same_reading_different_writing ｜ かわ 完全同音：川=河，河=河流，必须成对区分。
- 切る(きる) ↔ 着る(きる) ｜ same_reading_different_writing ｜ きる 完全同音：切る=切，着る=穿（上身），必须成对区分。
- 閉める(しめる) ↔ 締める(しめる) ｜ same_reading_different_writing ｜ しめる 完全同音：閉める=关上（他动），締める=系紧，必须成对区分。
- 取る(とる) ↔ 撮る(とる) ｜ same_reading_different_writing ｜ とる 完全同音：取る=拿、取得、得，撮る=照相，必须成对区分。
- 橋(はし) ↔ はし(はし) ｜ same_reading_different_writing ｜ はし 完全同音：橋=桥，はし=筷子，必须成对区分。
- 初め(はじめ) ↔ 始め(はじめ) ｜ same_reading_different_writing ｜ はじめ 完全同音：初め=开始，始め=开始，必须成对区分。

## 关系最多的词

| 单词 | 读音 | 关系数 | 高价值关系 | 建议策略 |
|------|------|--------|------------|----------|
| 一昨日 | おととい | 35 | 34 | 同字不同音 + 固定读音提醒 |
| 月曜日 | げつようび | 34 | 34 | 同字不同音 + 固定读音提醒 |
| 二十日 | はつか | 33 | 31 | 同字不同音 + 固定读音提醒 |
| 一日 | いちにち | 31 | 31 | 同字不同音 + 固定读音提醒 |
| 金曜日 | きんようび | 30 | 30 | 同字不同音 + 固定读音提醒 |
| 水曜日 | すいようび | 30 | 30 | 同字不同音 + 固定读音提醒 |
| 木曜日 | もくようび | 30 | 30 | 同字不同音 + 固定读音提醒 |
| 火曜日 | かようび | 30 | 29 | 同字不同音 + 固定读音提醒 |
| 今日 | きょう | 30 | 29 | 同字不同音 + 固定读音提醒 |
| 土曜日 | どようび | 30 | 29 | 同字不同音 + 固定读音提醒 |
| 日曜日 | にちようび | 29 | 29 | 同字不同音 + 固定读音提醒 |
| 二日 | ふつか | 30 | 28 | 同字不同音 + 固定读音提醒 |

## 目前判断

这版已经能支撑「先查关系，再写记忆法」：

1. 同音不同字优先用于易混提醒。
2. 同字不同音优先沉淀固定读音。
3. 相似假名优先做多一点、少一点、浊点差故事。
4. 自动词/他动词和形容词派生优先成组记。

下一步应加入人工确认状态：用户确认过的关系进入 `status: confirmed`，AI 自动发现但未审的关系保持 `status: auto`。
