const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SOURCE_FILE = path.join(ROOT, 'data/word_relations/all_word_relation_index.json')
const OUT_DIR = path.join(ROOT, 'data/word_relations/explorer')
const INDEX_OUT = path.join(OUT_DIR, 'word_relation_search_index.json')
const HTML_OUT = path.join(OUT_DIR, 'word_relation_explorer.html')
const MEMORY_ROOT = path.join(ROOT, 'data/memory_methods')
const MEMORY_LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1']

/** 链路图「已编写记忆法」进度：各级别收录到第几批（含该批）。与 writing_scope 的 throughBatch 对齐。 */
const MEMORY_WRITING_THROUGH_BATCH = {
  n5: Number.POSITIVE_INFINITY,
  n4: 30,
  n3: Number.POSITIVE_INFINITY,
  n2: Number.POSITIVE_INFINITY,
  n1: Number.POSITIVE_INFINITY,
}

function toHiragana(value) {
  return String(value || '').trim().replace(/[ァ-ン]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0x60)
  )
}

const KANA_ROMAJI = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', を: 'wo', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ゔ: 'vu',
  ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o',
}

const KANA_DIGRAPH_ROMAJI = {
  きゃ: 'kya', きゅ: 'kyu', きょ: 'kyo',
  しゃ: 'sha', しゅ: 'shu', しょ: 'sho',
  ちゃ: 'cha', ちゅ: 'chu', ちょ: 'cho',
  にゃ: 'nya', にゅ: 'nyu', にょ: 'nyo',
  ひゃ: 'hya', ひゅ: 'hyu', ひょ: 'hyo',
  みゃ: 'mya', みゅ: 'myu', みょ: 'myo',
  りゃ: 'rya', りゅ: 'ryu', りょ: 'ryo',
  ぎゃ: 'gya', ぎゅ: 'gyu', ぎょ: 'gyo',
  じゃ: 'ja', じゅ: 'ju', じょ: 'jo',
  ぢゃ: 'ja', ぢゅ: 'ju', ぢょ: 'jo',
  びゃ: 'bya', びゅ: 'byu', びょ: 'byo',
  ぴゃ: 'pya', ぴゅ: 'pyu', ぴょ: 'pyo',
}

function kanaToRomaji(value) {
  const chars = Array.from(toHiragana(value))
  let result = ''
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]
    if (char === 'っ') {
      const nextPair = `${chars[i + 1] || ''}${chars[i + 2] || ''}`
      const next = KANA_DIGRAPH_ROMAJI[nextPair] || KANA_ROMAJI[chars[i + 1]] || ''
      result += next[0] || ''
      continue
    }
    if (char === 'ー') {
      const vowel = result.match(/[aeiou]$/)?.[0] || ''
      result += vowel
      continue
    }
    const pair = `${char}${chars[i + 1] || ''}`
    if (KANA_DIGRAPH_ROMAJI[pair]) {
      result += KANA_DIGRAPH_ROMAJI[pair]
      i += 1
      continue
    }
    result += KANA_ROMAJI[char] || char
  }
  return result.toLowerCase().replace(/[^a-z]/g, '')
}

function compactRelation(relation) {
  const targetWord = relation.targetWord || ''
  const targetReading = relation.targetReading || ''
  const targetReadingRomaji = relation.targetReadingRomaji || kanaToRomaji(targetReading)
  return {
    type: relation.type,
    targetKey: `${targetWord}::${targetReading}`,
    targetWord,
    targetReading,
    targetReadingRomaji,
    targetMeaning: relation.targetMeaning,
    targetLevels: relation.targetLevels || [],
    memoryValue: relation.memoryValue,
    confidence: relation.confidence,
    suggestedStrategy: relation.suggestedStrategy,
    note: relation.note,
  }
}

function memoryKey(word, reading) {
  return `${word || ''}::${reading || ''}`
}

function hasUsableMemory(entry) {
  const mergedScene = String(entry.mergedScene || '').trim()
  const reviewTip = String(entry.reviewTip || entry.reviewHint || '').trim()
  if (!mergedScene && !reviewTip) return false
  if (mergedScene.includes('在便利店门口，小田和朋友把刚发生的小事演了一遍')) return false
  if (mergedScene.includes('在小田的房间，小田蹲在地板上在房间里翻找东西')) return false
  if (mergedScene.includes('这个小插曲就代表') && mergedScene.includes('作为固定读法记住')) return false
  if (reviewTip.includes('汉字直觉 + 固定读音') || reviewTip.includes('纯假名拆读')) return false
  return true
}

function compactMemoryMethod(entry, level, batch, index) {
  const elements = (entry.elements || []).slice(0, 5).map((element) => ({
    element: element.element || '',
    method: element.method || '',
    bridgeC: element.bridgeC || '',
  })).filter((element) => element.element || element.method || element.bridgeC)
  return {
    source: level.toUpperCase(),
    batch,
    index: index + 1,
    mergedScene: entry.mergedScene || '',
    reviewTip: entry.reviewTip || entry.reviewHint || '',
    difficultyStars: entry.difficultyStars || 0,
    elements,
  }
}

function loadMemoryMethodIndex() {
  const index = new Map()
  for (const level of MEMORY_LEVELS) {
    const levelDir = path.join(MEMORY_ROOT, level)
    if (!fs.existsSync(levelDir)) continue
    const throughBatch = MEMORY_WRITING_THROUGH_BATCH[level] ?? Number.POSITIVE_INFINITY
    const files = fs.readdirSync(levelDir)
      .filter((file) => /^batch_\d+_methods\.json$/.test(file))
      .sort()
    for (const file of files) {
      const batch = Number(file.match(/^batch_(\d+)_methods\.json$/)?.[1] || 0)
      if (batch > throughBatch) continue
      const entries = JSON.parse(fs.readFileSync(path.join(levelDir, file), 'utf8'))
      entries.forEach((entry, entryIndex) => {
        if (!hasUsableMemory(entry)) return
        const key = memoryKey(entry.word, entry.reading)
        if (!index.has(key)) index.set(key, compactMemoryMethod(entry, level, batch, entryIndex))
      })
    }
  }
  return index
}

const memoryMethods = loadMemoryMethodIndex()

function compactWord(item) {
  const key = `${item.word}::${item.reading}`
  const readingRomaji = item.readingRomaji || kanaToRomaji(item.reading)
  const relations = (item.relations || []).slice(0, 16).map(compactRelation)
  const memoryMethod = memoryMethods.get(key) || null
  return {
    key,
    word: item.word,
    reading: item.reading,
    readingRomaji,
    meaning: item.meaning,
    meanings: item.meanings || [],
    levels: item.levels || [],
    kanji: item.kanji || [],
    searchKeys: Array.from(new Set([
      item.word,
      item.reading,
      toHiragana(item.reading),
      readingRomaji,
      ...(item.searchKeys || []),
    ].filter(Boolean))),
    relationSummary: item.relationSummary || { total: 0, highValue: 0, byType: {} },
    suggestedPrimaryStrategies: item.suggestedPrimaryStrategies || [],
    hasMemoryMethod: Boolean(memoryMethod),
    memoryMethod,
    relations,
    searchText: [
      item.word,
      item.reading,
      toHiragana(item.reading),
      readingRomaji,
      item.meaning,
      ...(item.meanings || []),
      ...(item.levels || []),
      ...(item.searchKeys || []),
      memoryMethod?.mergedScene,
      memoryMethod?.reviewTip,
      ...(memoryMethod?.elements || []).flatMap((element) => [element.element, element.method, element.bridgeC]),
      ...relations.flatMap((relation) => [
        relation.targetWord,
        relation.targetReading,
        toHiragana(relation.targetReading),
        relation.targetReadingRomaji,
        relation.targetMeaning,
        relation.type,
        relation.suggestedStrategy,
      ]),
    ].filter(Boolean).join(' ').toLowerCase(),
  }
}

function escapeScriptJson(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

const source = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'))
const words = Object.values(source.words)
  .map(compactWord)
  .sort((a, b) => a.reading.localeCompare(b.reading) || a.word.localeCompare(b.word))

const output = {
  metadata: {
    generatedAt: new Date().toISOString(),
    source: path.relative(ROOT, SOURCE_FILE),
    totalWords: words.length,
    memoryMethodCount: memoryMethods.size,
    memoryWritingThroughBatch: Object.fromEntries(
      Object.entries(MEMORY_WRITING_THROUGH_BATCH).map(([level, batch]) => [
        level,
        Number.isFinite(batch) ? batch : null,
      ]),
    ),
    description: '日语单词动态链路图索引。主视图为可缩放、可拖拽、可按 JLPT 等级筛选的 Canvas 关系地图。',
  },
  words,
}

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="data:,">
  <title>日语单词动态链路图</title>
  <style>
    :root {
      color-scheme: dark;
      --paper: #f7f3ea;
      --paper-strong: #fffaf2;
      --ink: #14202a;
      --muted: #7d817b;
      --line: rgba(52, 65, 72, 0.16);
      --accent: #c96543;
      --accent-soft: #f3ded4;
      --map-bg: #101923;
      --map-bg-2: #182736;
      --panel: rgba(255, 250, 242, 0.92);
      --panel-dark: rgba(17, 29, 40, 0.82);
      --n5: #74a889;
      --n4: #d28c5c;
      --n3: #9b83c9;
      --n2: #6d91c0;
      --n1: #d94132;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    }
    * { box-sizing: border-box; }
    html, body { width: 100%; height: 100%; }
    body {
      margin: 0;
      overflow: hidden;
      background:
        radial-gradient(circle at 20% 18%, rgba(116,168,137,0.18), transparent 32%),
        radial-gradient(circle at 80% 78%, rgba(201,101,67,0.18), transparent 30%),
        linear-gradient(145deg, var(--map-bg), var(--map-bg-2));
      color: var(--paper);
    }
    button, input, select {
      font: inherit;
    }
    button {
      border: 0;
      cursor: pointer;
    }
    .map-shell {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }
    #graphCanvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
    }
    .topbar {
      position: absolute;
      top: 22px;
      left: 22px;
      right: 22px;
      z-index: 5;
      display: grid;
      grid-template-columns: minmax(210px, 330px) minmax(220px, 1fr) auto auto;
      gap: 12px;
      align-items: stretch;
      pointer-events: none;
    }
    .brand-card,
    .control-card,
    .level-card {
      pointer-events: auto;
      border: 1px solid rgba(255,255,255,0.16);
      background: rgba(247,243,234,0.9);
      color: var(--ink);
      border-radius: 16px;
      box-shadow: 0 18px 50px rgba(0,0,0,0.24);
      backdrop-filter: blur(14px);
    }
    .brand-card {
      padding: 15px 16px;
      display: grid;
      gap: 6px;
    }
    h1 {
      margin: 0;
      font-family: Georgia, "Times New Roman", "Songti SC", serif;
      font-size: 24px;
      line-height: 1.05;
      font-weight: 500;
      letter-spacing: 0;
    }
    .graph-stats {
      color: var(--muted);
      font-size: 12px;
      line-height: 1.45;
    }
    .control-card {
      display: grid;
      grid-template-columns: minmax(180px, 1fr) 150px 122px;
      gap: 10px;
      padding: 10px;
    }
    .control-card input,
    .control-card select {
      min-height: 42px;
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: rgba(255,255,255,0.72);
      color: var(--ink);
      padding: 0 12px;
      outline: none;
    }
    .control-card input:focus,
    .control-card select:focus {
      border-color: rgba(201,101,67,0.55);
      box-shadow: 0 0 0 3px rgba(201,101,67,0.14);
    }
    .level-card {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 10px;
      white-space: nowrap;
    }
    .level-card button {
      min-width: 46px;
      min-height: 42px;
      border-radius: 12px;
      background: rgba(20,32,42,0.08);
      color: var(--ink);
      font-weight: 800;
    }
    .level-card button.active {
      background: var(--ink);
      color: var(--paper);
    }
    .map-action {
      pointer-events: auto;
      min-width: 104px;
      border-radius: 16px;
      background: var(--accent);
      color: white;
      font-weight: 800;
      box-shadow: 0 18px 50px rgba(201,101,67,0.34);
    }
    .legend {
      position: absolute;
      left: 22px;
      bottom: 22px;
      z-index: 5;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      max-width: min(620px, calc(100vw - 44px));
      pointer-events: none;
    }
    .legend span,
    .hint-pill {
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(17, 29, 40, 0.72);
      color: rgba(247,243,234,0.88);
      border-radius: 999px;
      padding: 8px 11px;
      font-size: 12px;
      backdrop-filter: blur(12px);
    }
    .legend i {
      display: inline-block;
      width: 9px;
      height: 9px;
      margin-right: 6px;
      border-radius: 50%;
    }
    .search-results {
      position: absolute;
      top: 122px;
      left: 22px;
      z-index: 7;
      width: min(360px, calc(100vw - 44px));
      max-height: min(560px, calc(100vh - 205px));
      overflow: auto;
      display: none;
      padding: 8px;
      border: 1px solid rgba(255,255,255,0.16);
      border-radius: 16px;
      background: var(--panel);
      color: var(--ink);
      box-shadow: 0 22px 70px rgba(0,0,0,0.28);
      backdrop-filter: blur(16px);
      transform: translateX(0);
      transition: opacity .18s ease, transform .18s ease;
    }
    .search-results.open { display: grid; gap: 8px; }
    .search-results.collapsed {
      opacity: 0;
      pointer-events: none;
      transform: translateX(calc(-100% - 28px));
    }
    .search-dock-toggle {
      position: absolute;
      top: 122px;
      left: 22px;
      z-index: 8;
      display: none;
      min-height: 40px;
      border-radius: 999px;
      padding: 0 14px;
      background: rgba(247,243,234,0.92);
      color: var(--ink);
      font-weight: 850;
      box-shadow: 0 16px 42px rgba(0,0,0,0.22);
      backdrop-filter: blur(14px);
    }
    .search-dock-toggle.visible { display: inline-flex; align-items: center; }
    .search-dock-toggle.panel-open {
      left: min(394px, calc(100vw - 116px));
      background: var(--accent);
      color: white;
    }
    .search-result {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
      width: 100%;
      min-height: 58px;
      padding: 10px 12px;
      border-radius: 12px;
      background: rgba(255,255,255,0.54);
      color: var(--ink);
      text-align: left;
    }
    .search-result strong {
      display: block;
      font-size: 18px;
      letter-spacing: 0;
    }
    .search-result small {
      display: block;
      margin-top: 3px;
      color: var(--muted);
    }
    .level-badge {
      align-self: center;
      border-radius: 999px;
      padding: 5px 8px;
      background: var(--accent-soft);
      color: #9b4a31;
      font-size: 12px;
      font-weight: 800;
    }
    .drawer {
      position: absolute;
      top: 104px;
      right: 22px;
      bottom: 22px;
      z-index: 6;
      width: min(430px, calc(100vw - 44px));
      display: grid;
      grid-template-rows: auto 1fr;
      border: 1px solid rgba(255,255,255,0.16);
      border-radius: 20px;
      background: var(--panel);
      color: var(--ink);
      box-shadow: 0 24px 80px rgba(0,0,0,0.35);
      backdrop-filter: blur(18px);
      transform: translateX(calc(100% + 34px));
      transition: transform .22s ease;
      overflow: hidden;
    }
    .drawer.open {
      transform: translateX(0);
    }
    .drawer-head {
      padding: 18px 18px 14px;
      border-bottom: 1px solid var(--line);
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: start;
    }
    .drawer h2 {
      margin: 0;
      font-size: 42px;
      line-height: 1;
      letter-spacing: 0;
      font-family: Georgia, "Times New Roman", "Songti SC", serif;
      font-weight: 500;
    }
    .drawer .reading {
      margin-top: 8px;
      color: var(--muted);
      font-size: 15px;
    }
    .drawer .meaning {
      margin-top: 10px;
      color: #4f5550;
      line-height: 1.62;
      font-size: 15px;
    }
    .close-drawer {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(20,32,42,0.08);
      color: var(--ink);
      font-size: 20px;
    }
    .drawer-body {
      overflow: auto;
      padding: 16px 18px 20px;
      display: grid;
      gap: 15px;
    }
    .chip-row {
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
    }
    .chip {
      border-radius: 999px;
      padding: 6px 9px;
      background: rgba(20,32,42,0.08);
      color: #55605a;
      font-size: 12px;
      font-weight: 700;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .summary-cell {
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 10px;
      background: rgba(255,255,255,0.46);
    }
    .summary-cell span {
      display: block;
      color: var(--muted);
      font-size: 12px;
    }
    .summary-cell strong {
      display: block;
      margin-top: 5px;
      color: var(--ink);
      font-size: 20px;
    }
    .section-title {
      color: #a04c32;
      font-weight: 850;
      font-size: 13px;
      margin: 5px 0 2px;
    }
    .memory-card,
    .relation-card {
      border: 1px solid var(--line);
      border-radius: 15px;
      background: rgba(255,255,255,0.58);
      padding: 13px;
      line-height: 1.62;
    }
    .official-memory-card {
      display: grid;
      gap: 10px;
      border: 1px solid rgba(201,101,67,0.22);
      border-radius: 17px;
      background: linear-gradient(145deg, rgba(255,255,255,0.72), rgba(247,243,234,0.72));
      padding: 14px;
      line-height: 1.68;
      box-shadow: 0 14px 34px rgba(20,32,42,0.08);
    }
    .official-memory-card .memory-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      color: #a04c32;
      font-size: 12px;
      font-weight: 850;
    }
    .official-memory-card .memory-scene,
    .official-memory-card .memory-tip {
      margin: 0;
      color: #29332f;
    }
    .official-memory-card .memory-tip {
      border-top: 1px dashed rgba(20,32,42,0.14);
      padding-top: 9px;
      color: #5a615d;
      font-size: 14px;
    }
    .official-memory-card .memory-elements {
      display: grid;
      gap: 7px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .official-memory-card .memory-elements li {
      border-radius: 12px;
      background: rgba(20,32,42,0.06);
      padding: 8px 10px;
      color: #4f5550;
      font-size: 13px;
    }
    .memory-jump-button {
      justify-self: start;
      min-height: 34px;
      border-radius: 999px;
      padding: 0 12px;
      background: rgba(201,101,67,0.12);
      color: #9b4a31;
      font-weight: 850;
      cursor: default;
    }
    .relation-card {
      display: grid;
      gap: 7px;
    }
    .relation-card button,
    .copy-button {
      justify-self: start;
      min-height: 36px;
      border-radius: 999px;
      padding: 0 13px;
      background: var(--ink);
      color: white;
      font-weight: 800;
    }
    .relation-card h3 {
      margin: 0;
      font-size: 22px;
    }
    .relation-card .note {
      color: #5a615d;
      font-size: 14px;
    }
    .type-line {
      color: #9b4a31;
      font-size: 12px;
      font-weight: 850;
    }
    .tooltip {
      position: absolute;
      z-index: 8;
      display: none;
      max-width: 260px;
      padding: 9px 11px;
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 12px;
      background: rgba(17,29,40,0.86);
      color: var(--paper);
      pointer-events: none;
      box-shadow: 0 18px 50px rgba(0,0,0,0.28);
      backdrop-filter: blur(12px);
    }
    .tooltip strong {
      display: block;
      font-size: 18px;
      margin-bottom: 3px;
    }
    .tooltip span {
      color: rgba(247,243,234,0.72);
      font-size: 12px;
      line-height: 1.5;
    }
    @media (max-width: 900px) {
      .topbar {
        grid-template-columns: minmax(220px, 1fr) auto;
        grid-template-areas:
          "brand action"
          "controls levels";
      }
      .brand-card { grid-area: brand; }
      .control-card {
        grid-area: controls;
        grid-template-columns: minmax(180px, 1fr) 145px 112px;
      }
      .level-card { grid-area: levels; }
      .map-action {
        grid-area: action;
        min-height: 100%;
        padding: 0 18px;
      }
      .search-results {
        top: 152px;
        left: 22px;
      }
      .search-dock-toggle {
        top: 152px;
      }
      .search-dock-toggle.panel-open {
        left: min(394px, calc(100vw - 116px));
      }
    }
    @media (max-width: 680px) {
      .topbar {
        top: 12px;
        left: 12px;
        right: 12px;
        grid-template-columns: 1fr;
        grid-template-areas:
          "brand"
          "controls"
          "levels"
          "action";
      }
      .brand-card {
        padding: 12px 13px;
      }
      h1 { font-size: 20px; }
      .control-card {
        grid-template-columns: 1fr;
      }
      .level-card {
        overflow-x: auto;
      }
      .map-action {
        min-height: 44px;
      }
      .drawer {
        top: auto;
        left: 12px;
        right: 12px;
        bottom: 12px;
        width: auto;
        max-height: 70vh;
        transform: translateY(calc(100% + 24px));
      }
      .drawer.open {
        transform: translateY(0);
      }
      .search-results {
        top: 250px;
        left: 12px;
        right: 12px;
        width: auto;
        max-height: min(360px, calc(100vh - 320px));
      }
      .search-dock-toggle {
        top: 250px;
        left: 12px;
      }
      .search-dock-toggle.panel-open {
        left: auto;
        right: 12px;
      }
      .legend {
        left: 12px;
        bottom: 12px;
      }
      .hint-pill {
        display: none;
      }
    }
  </style>
</head>
<body>
  <main class="map-shell">
    <canvas id="graphCanvas" aria-label="日语单词动态链路图"></canvas>
    <section class="topbar" aria-label="链路图控制台">
      <div class="brand-card">
        <h1>日语单词动态链路图</h1>
        <div class="graph-stats" id="graphStats">正在载入关系索引</div>
      </div>
      <div class="control-card">
        <input id="queryInput" type="search" placeholder="搜索单词、假名、中文意思">
        <select id="typeFilter" aria-label="关系类型">
          <option value="">全部关系</option>
          <option value="same_kanji_different_reading">同字不同音</option>
          <option value="same_reading_different_writing">同音不同字</option>
          <option value="kana_similarity">假名相近</option>
          <option value="dakuten_or_handakuten_difference">浊音变化</option>
          <option value="transitive_intransitive_pair">自他动词</option>
          <option value="adjective_derivation">形容词派生</option>
        </select>
        <select id="densityFilter" aria-label="节点密度">
          <option value="compact" selected>清爽</option>
          <option value="balanced">标准</option>
          <option value="full">更多</option>
        </select>
      </div>
      <div class="level-card" id="levelTabs" aria-label="JLPT 等级">
        <button class="active" data-level="">ALL</button>
        <button data-level="N5">N5</button>
        <button data-level="N4">N4</button>
        <button data-level="N3">N3</button>
        <button data-level="N2">N2</button>
        <button data-level="N1">N1</button>
      </div>
      <button class="map-action" id="fitButton">归位</button>
    </section>

    <button class="search-dock-toggle" id="searchDockToggle" aria-expanded="false">结果</button>
    <aside class="search-results collapsed" id="searchResults" aria-label="搜索结果"></aside>

    <aside class="drawer" id="detailDrawer" aria-live="polite">
      <div class="drawer-head">
        <div>
          <h2 id="drawerWord">请选择节点</h2>
          <div class="reading" id="drawerReading">拖拽、缩放地图，点击任意球体查看关系。</div>
          <div class="meaning" id="drawerMeaning"></div>
        </div>
        <button class="close-drawer" id="closeDrawer" aria-label="关闭详情">×</button>
      </div>
      <div class="drawer-body" id="drawerBody"></div>
    </aside>

    <div class="legend" aria-hidden="true">
      <span><i style="background: var(--n5)"></i>N5</span>
      <span><i style="background: var(--n4)"></i>N4</span>
      <span><i style="background: var(--n3)"></i>N3</span>
      <span><i style="background: var(--n2)"></i>N2</span>
      <span><i style="background: var(--n1)"></i>N1</span>
      <span class="hint-pill">滚轮缩放 · 拖拽移动 · 点击节点看记忆链</span>
    </div>
    <div class="tooltip" id="tooltip"></div>
  </main>

  <script id="relationData" type="application/json">${escapeScriptJson(output)}</script>
  <script>
    const DATA = JSON.parse(document.getElementById('relationData').textContent)
    const words = DATA.words
    const byKey = new Map(words.map((item) => [item.key, item]))
    const graphStatsEl = document.getElementById('graphStats')
    const queryInput = document.getElementById('queryInput')
    const typeFilter = document.getElementById('typeFilter')
    const densityFilter = document.getElementById('densityFilter')
    const levelTabs = document.getElementById('levelTabs')
    const fitButton = document.getElementById('fitButton')
    const searchResults = document.getElementById('searchResults')
    const searchDockToggle = document.getElementById('searchDockToggle')
    const drawer = document.getElementById('detailDrawer')
    const closeDrawer = document.getElementById('closeDrawer')
    const drawerWord = document.getElementById('drawerWord')
    const drawerReading = document.getElementById('drawerReading')
    const drawerMeaning = document.getElementById('drawerMeaning')
    const drawerBody = document.getElementById('drawerBody')
    const tooltip = document.getElementById('tooltip')
    const canvas = document.getElementById('graphCanvas')
    const ctx = canvas.getContext('2d')

    const typeLabel = {
      same_kanji_different_reading: '同字不同音',
      kana_similarity: '假名相近',
      same_reading_different_writing: '同音不同字',
      dakuten_or_handakuten_difference: '浊音变化',
      transitive_intransitive_pair: '自他动词',
      same_kanji_same_reading: '同字同音',
      adjective_derivation: '形容词派生',
    }
    const relationStyle = {
      same_kanji_different_reading: { symbol: '字', color: '#86b7dc', alpha: 0.34, width: 1.05, distance: 205 },
      same_reading_different_writing: { symbol: '音', color: '#8fc9a6', alpha: 0.42, width: 1.25, distance: 178 },
      kana_similarity: { symbol: '仮', color: '#e0bd6f', alpha: 0.44, width: 1.18, distance: 170 },
      dakuten_or_handakuten_difference: { symbol: '゛', color: '#dd8066', alpha: 0.48, width: 1.35, distance: 162 },
      transitive_intransitive_pair: { symbol: '自', color: '#b99add', alpha: 0.54, width: 1.45, distance: 150 },
      same_kanji_same_reading: { symbol: '同', color: '#9fc0cf', alpha: 0.42, width: 1.2, distance: 160 },
      adjective_derivation: { symbol: 'い', color: '#d7a1b8', alpha: 0.5, width: 1.35, distance: 145 },
    }
    const levelColor = {
      N5: '#74a889',
      N4: '#d28c5c',
      N3: '#9b83c9',
      N2: '#6d91c0',
      N1: '#d94132',
    }
    const state = {
      level: '',
      type: '',
      density: 'compact',
      query: '',
      nodes: [],
      links: [],
      visibleTotal: 0,
      selected: null,
      hover: null,
      transform: { x: 0, y: 0, k: 1 },
      isPanning: false,
      dragNode: null,
      dragStart: null,
      panStart: null,
      needsFit: true,
      searchDockOpen: true,
    }
    const previousNodes = new Map()
    let dpr = 1
    let width = 0
    let height = 0
    let animationTime = 0

    function esc(value) {
      return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[char]))
    }

    function toHiragana(value) {
      return String(value || '').trim().replace(/[ァ-ン]/g, (char) =>
        String.fromCharCode(char.charCodeAt(0) - 0x60)
      )
    }

    const clientKanaRomaji = {
      あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
      か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
      さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
      た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
      な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
      は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
      ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
      や: 'ya', ゆ: 'yu', よ: 'yo',
      ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
      わ: 'wa', を: 'wo', ん: 'n',
      が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
      ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
      だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
      ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
      ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
      ゔ: 'vu',
      ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o',
    }

    const clientKanaDigraphRomaji = {
      きゃ: 'kya', きゅ: 'kyu', きょ: 'kyo',
      しゃ: 'sha', しゅ: 'shu', しょ: 'sho',
      ちゃ: 'cha', ちゅ: 'chu', ちょ: 'cho',
      にゃ: 'nya', にゅ: 'nyu', にょ: 'nyo',
      ひゃ: 'hya', ひゅ: 'hyu', ひょ: 'hyo',
      みゃ: 'mya', みゅ: 'myu', みょ: 'myo',
      りゃ: 'rya', りゅ: 'ryu', りょ: 'ryo',
      ぎゃ: 'gya', ぎゅ: 'gyu', ぎょ: 'gyo',
      じゃ: 'ja', じゅ: 'ju', じょ: 'jo',
      ぢゃ: 'ja', ぢゅ: 'ju', ぢょ: 'jo',
      びゃ: 'bya', びゅ: 'byu', びょ: 'byo',
      ぴゃ: 'pya', ぴゅ: 'pyu', ぴょ: 'pyo',
    }

    function kanaToRomaji(value) {
      const chars = Array.from(toHiragana(value))
      let result = ''
      for (let i = 0; i < chars.length; i += 1) {
        const char = chars[i]
        if (char === 'っ') {
          const nextPair = (chars[i + 1] || '') + (chars[i + 2] || '')
          const next = clientKanaDigraphRomaji[nextPair] || clientKanaRomaji[chars[i + 1]] || ''
          result += next[0] || ''
          continue
        }
        if (char === 'ー') {
          const match = result.match(/[aeiou]$/)
          result += match ? match[0] : ''
          continue
        }
        const pair = char + (chars[i + 1] || '')
        if (clientKanaDigraphRomaji[pair]) {
          result += clientKanaDigraphRomaji[pair]
          i += 1
          continue
        }
        result += clientKanaRomaji[char] || char
      }
      return result.toLowerCase().replace(/[^a-z]/g, '')
    }

    function canRomanizeQuery(value) {
      const kana = toHiragana(value).replace(/[\\s　・･·.,，。/／~〜～-]/g, '')
      return Boolean(kana) && /^[ぁ-ゖー]+$/.test(kana)
    }

    function queryVariants(value) {
      const raw = String(value || '').trim().toLowerCase()
      const hira = toHiragana(raw).toLowerCase()
      const variants = [raw]
      if (hira && hira !== raw) variants.push(hira)
      if (canRomanizeQuery(raw)) variants.push(kanaToRomaji(raw))
      return Array.from(new Set(variants.filter(Boolean)))
    }

    function hash(value) {
      let h = 2166136261
      for (let i = 0; i < value.length; i += 1) {
        h ^= value.charCodeAt(i)
        h = Math.imul(h, 16777619)
      }
      return (h >>> 0) / 4294967295
    }

    function scoreWord(item) {
      const summary = item.relationSummary || {}
      return (summary.highValue || 0) * 8 + (summary.total || 0) + (item.relations || []).length
    }

    function primaryLevel(item) {
      const levels = item.levels || []
      if (state.level && levels.includes(state.level)) return state.level
      return levels[0] || 'N5'
    }

    function nodeColor(item) {
      return levelColor[primaryLevel(item)] || '#c9b17b'
    }

    function hexToRgba(hex, alpha) {
      const normalized = hex.replace('#', '')
      const value = parseInt(normalized, 16)
      const r = (value >> 16) & 255
      const g = (value >> 8) & 255
      const b = value & 255
      return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')'
    }

    function relationMatches(rel) {
      return !state.type || rel.type === state.type
    }

    function levelMatches(item) {
      return !state.level || (item.levels || []).includes(state.level)
    }

    function queryMatches(item, queries) {
      return !queries.length || queries.some((query) => item.searchText.includes(query))
    }

    function directQueryScore(item, queries) {
      if (!queries.length) return 0
      const fields = [
        item.word,
        item.reading,
        toHiragana(item.reading),
        item.readingRomaji,
        ...(item.searchKeys || []),
      ].filter(Boolean).map((field) => String(field).toLowerCase())
      let best = 0
      for (const query of queries) {
        for (const field of fields) {
          if (field === query) best = Math.max(best, 1000)
          else if (field.startsWith(query)) best = Math.max(best, 600)
          else if (field.includes(query)) best = Math.max(best, 300)
        }
      }
      return best
    }

    function compareSearch(a, b, queries) {
      return directQueryScore(b, queries) - directQueryScore(a, queries) ||
        scoreWord(b) - scoreWord(a) ||
        a.reading.localeCompare(b.reading) ||
        a.word.localeCompare(b.word)
    }

    function nodeCap() {
      const caps = {
        compact: { all: 130, N5: 160, N4: 185, N3: 210, N2: 240, N1: 260 },
        balanced: { all: 260, N5: 300, N4: 340, N3: 380, N2: 420, N1: 460 },
        full: { all: 520, N5: 520, N4: 620, N3: 720, N2: 820, N1: 900 },
      }
      const table = caps[state.density] || caps.balanced
      return table[state.level || 'all'] || table.all
    }

    function densityConfig() {
      const configs = {
        compact: { searchMatches: 18, searchNeighbors: 70, linkDensity: 0.46, queryLinkDensity: 0.7 },
        balanced: { searchMatches: 48, searchNeighbors: 180, linkDensity: 0.58, queryLinkDensity: 1 },
        full: { searchMatches: 92, searchNeighbors: 360, linkDensity: 0.72, queryLinkDensity: 1.25 },
      }
      return configs[state.density] || configs.balanced
    }

    function filteredWords() {
      const queries = queryVariants(state.query)
      return words.filter((item) => levelMatches(item) && queryMatches(item, queries))
    }

    function addNeighbors(keys, sourceWords, maxNeighbors) {
      const keySet = new Set(keys)
      let added = 0
      for (const item of sourceWords) {
        if (!keySet.has(item.key)) continue
        for (const rel of item.relations || []) {
          if (added >= maxNeighbors) return keySet
          if (!relationMatches(rel)) continue
          const target = byKey.get(rel.targetKey)
          if (!target || !levelMatches(target)) continue
          if (!keySet.has(target.key)) {
            keySet.add(target.key)
            added += 1
          }
        }
      }
      return keySet
    }

    function initialPosition(item, index, count) {
      const saved = previousNodes.get(item.key)
      if (saved) return { x: saved.x, y: saved.y, vx: saved.vx * 0.25, vy: saved.vy * 0.25 }
      const level = primaryLevel(item)
      const anchors = {
        N5: { x: -560, y: -360 },
        N4: { x: 560, y: -320 },
        N3: { x: -480, y: 430 },
        N2: { x: 580, y: 440 },
        N1: { x: 0, y: 720 },
      }
      const anchor = state.level ? { x: 0, y: 0 } : (anchors[level] || { x: 0, y: 0 })
      const seed = hash(item.key)
      const angle = index * 2.399963 + seed * 0.85
      const radius = 150 + Math.sqrt(index + 1) * (state.level ? 29 : 19) + seed * 150
      const spread = state.level ? 1.55 : 1.18
      return {
        x: anchor.x + Math.cos(angle) * radius * spread,
        y: anchor.y + Math.sin(angle) * radius * spread,
        vx: (hash(item.key + 'vx') - 0.5) * 0.8,
        vy: (hash(item.key + 'vy') - 0.5) * 0.8,
      }
    }

    function buildGraph() {
      previousNodes.clear()
      for (const node of state.nodes) previousNodes.set(node.key, node)

      const queries = queryVariants(state.query)
      const base = words.filter(levelMatches)
      const density = densityConfig()
      let candidates
      if (queries.length) {
        const matches = base.filter((item) => queryMatches(item, queries))
          .sort((a, b) => compareSearch(a, b, queries))
          .slice(0, density.searchMatches)
        const keys = addNeighbors(matches.map((item) => item.key), matches, density.searchNeighbors)
        candidates = Array.from(keys).map((key) => byKey.get(key)).filter(Boolean)
      } else {
        candidates = base
          .slice()
          .sort((a, b) => scoreWord(b) - scoreWord(a) || a.reading.localeCompare(b.reading))
          .slice(0, nodeCap())
      }

      state.visibleTotal = base.length
      const visibleKeys = new Set(candidates.map((item) => item.key))
      const nodes = candidates.map((item, index) => {
        const pos = initialPosition(item, index, candidates.length)
        return {
          key: item.key,
          item,
          x: pos.x,
          y: pos.y,
          vx: pos.vx,
          vy: pos.vy,
          r: 7 + Math.min(13, Math.sqrt(scoreWord(item)) * 0.52),
          color: nodeColor(item),
          seed: hash(item.key + 'seed'),
          fixed: false,
        }
      })
      const nodeMap = new Map(nodes.map((node) => [node.key, node]))
      const linkMap = new Map()
      for (const node of nodes) {
        for (const rel of node.item.relations || []) {
          if (!relationMatches(rel) || !visibleKeys.has(rel.targetKey)) continue
          const target = nodeMap.get(rel.targetKey)
          if (!target || target.key === node.key) continue
          const pair = [node.key, target.key].sort().join('~~') + '::' + rel.type
          if (linkMap.has(pair)) continue
          linkMap.set(pair, {
            source: node,
            target,
            type: rel.type,
            value: rel.memoryValue || 0.5,
            seed: hash(pair),
          })
        }
      }
      state.nodes = nodes
      const linkDensity = state.query ? density.queryLinkDensity : density.linkDensity
      state.links = Array.from(linkMap.values())
        .sort((a, b) => (b.value || 0) - (a.value || 0))
        .slice(0, Math.max(36, Math.floor(nodes.length * linkDensity)))
      if (state.selected && !nodeMap.has(state.selected.key)) state.selected = null
      renderSearchResults()
      renderStats()
      state.needsFit = true
    }

    function renderStats() {
      const level = state.level || 'ALL'
      const shown = state.nodes.length
      const total = state.visibleTotal
      const links = state.links.length
      const type = state.type ? typeLabel[state.type] : '全部关系'
      const densityLabel = { compact: '清爽', balanced: '标准', full: '更多' }[state.density] || '标准'
      const memoryProgress = DATA.metadata.memoryWritingThroughBatch || {}
      const n4Batch = memoryProgress.n4
      const memoryNote = n4Batch ? ' · 记忆法 N4≤' + n4Batch + '组' : ''
      graphStatsEl.textContent = level + ' · ' + densityLabel + ' · 显示 ' + shown + '/' + total + ' 个节点 · ' + links + ' 条链 · ' + type + memoryNote
    }

    function renderSearchResults() {
      const queries = queryVariants(state.query)
      if (!queries.length) {
        searchResults.classList.remove('open')
        searchResults.classList.add('collapsed')
        searchDockToggle.classList.remove('visible', 'panel-open')
        searchDockToggle.setAttribute('aria-expanded', 'false')
        searchResults.innerHTML = ''
        return
      }
      const rows = words
        .filter((item) => levelMatches(item) && queryMatches(item, queries))
        .sort((a, b) => compareSearch(a, b, queries))
        .slice(0, 8)
      searchResults.innerHTML = rows.map((item) => (
        '<button class="search-result" data-key="' + esc(item.key) + '">' +
          '<span><strong>' + esc(item.word) + '</strong><small>' + esc(item.reading) + ' · ' + esc(item.meaning) + '</small></span>' +
          '<span class="level-badge">' + esc((item.levels || []).join('/')) + '</span>' +
        '</button>'
      )).join('')
      const hasRows = rows.length > 0
      searchDockToggle.classList.toggle('visible', hasRows)
      searchDockToggle.classList.toggle('panel-open', hasRows && state.searchDockOpen)
      searchDockToggle.textContent = state.searchDockOpen ? '隐藏结果' : '结果 ' + rows.length
      searchDockToggle.setAttribute('aria-expanded', state.searchDockOpen ? 'true' : 'false')
      searchResults.classList.toggle('open', hasRows)
      searchResults.classList.toggle('collapsed', !hasRows || !state.searchDockOpen)
    }

    function relationMemory(item) {
      const best = (item.relations || []).find((rel) => rel.note || rel.suggestedStrategy)
      if (!best) return '索引暂时没有高价值近邻。可以先用谐音或字形拆分建立第一条记忆链。'
      return '关系联想：' + item.word + ' 可以和 ' + best.targetWord + ' 放在一起看。' +
        '两者属于「' + (typeLabel[best.type] || best.type) + '」，提示是：' +
        (best.note || best.suggestedStrategy || '对比读音、字形和意思差异。')
    }

    function phoneticMemory(item) {
      return '谐音草稿：先把「' + item.reading + '」拆成更顺口的中文音，再把中文音变成小故事，最后落回「' + item.meaning + '」。'
    }

    function promptText(item) {
      return [
        '请按照项目的日语单词记忆方法规则，为这个词生成两种记忆法：',
        '1. 谐音故事记忆',
        '2. 根据关系索引联想记忆',
        '',
        '目标词：' + item.word + '（' + item.reading + '）',
        '意思：' + item.meaning,
        '等级：' + (item.levels || []).join('/'),
        '关系：',
        ...(item.relations || []).slice(0, 8).map((rel) => '- ' + rel.targetWord + '（' + rel.targetReading + '）：' + (typeLabel[rel.type] || rel.type) + '；' + (rel.note || rel.suggestedStrategy || '')),
      ].join('\\n')
    }

    function officialMemoryHtml(item) {
      const memory = item.memoryMethod
      if (!memory) return ''
      const meta = [
        memory.source,
        memory.batch ? '第 ' + memory.batch + ' 组' : '',
        memory.index ? '#' + memory.index : '',
      ].filter(Boolean).join(' · ')
      const stars = memory.difficultyStars ? '⭐'.repeat(Math.min(5, memory.difficultyStars)) : '已编写'
      const elements = (memory.elements || []).slice(0, 4).map((element) => (
        '<li><strong>' + esc(element.element || element.method || '记忆点') + '</strong>' +
        (element.bridgeC ? '：' + esc(element.bridgeC) : '') +
        '</li>'
      )).join('')
      return (
        '<div class="section-title">已编写记忆方法</div>' +
        '<section class="official-memory-card">' +
          '<div class="memory-meta"><span>' + esc(meta) + '</span><span>' + esc(stars) + '</span></div>' +
          (memory.mergedScene ? '<p class="memory-scene">' + esc(memory.mergedScene) + '</p>' : '') +
          (memory.reviewTip ? '<p class="memory-tip">' + esc(memory.reviewTip) + '</p>' : '') +
          (elements ? '<ul class="memory-elements">' + elements + '</ul>' : '') +
          '<button class="memory-jump-button" type="button">App 接入后可跳转到记忆页</button>' +
        '</section>'
      )
    }

    function selectNode(node) {
      if (!node) return
      state.selected = node.item
      drawer.classList.add('open')
      drawerWord.textContent = node.item.word
      drawerReading.textContent = node.item.reading + ' · ' + (node.item.levels || []).join('/')
      drawerMeaning.textContent = node.item.meaning || ''
      const relations = (node.item.relations || []).slice(0, 10)
      drawerBody.innerHTML =
        officialMemoryHtml(node.item) +
        '<div class="chip-row">' +
          (node.item.suggestedPrimaryStrategies || []).map((strategy) => '<span class="chip">' + esc(strategy) + '</span>').join('') +
        '</div>' +
        '<div class="summary-grid">' +
          '<div class="summary-cell"><span>总关系</span><strong>' + esc(node.item.relationSummary.total || 0) + '</strong></div>' +
          '<div class="summary-cell"><span>高价值</span><strong>' + esc(node.item.relationSummary.highValue || 0) + '</strong></div>' +
          '<div class="summary-cell"><span>图内连接</span><strong>' + esc(state.links.filter((link) => link.source.key === node.key || link.target.key === node.key).length) + '</strong></div>' +
        '</div>' +
        '<button class="copy-button" id="copyPrompt">复制给 AI</button>' +
        '<div class="section-title">高价值关系</div>' +
        relations.map((rel) => (
          '<article class="relation-card">' +
            '<div class="type-line">' + esc((relationStyle[rel.type]?.symbol || '链') + ' · ' + (typeLabel[rel.type] || rel.type)) + ' · 记忆价值 ' + esc(Math.round((rel.memoryValue || 0) * 100)) + '</div>' +
            '<h3>' + esc(rel.targetWord) + '</h3>' +
            '<div class="reading">' + esc(rel.targetReading) + ' · ' + esc((rel.targetLevels || []).join('/')) + '</div>' +
            '<div class="meaning">' + esc(rel.targetMeaning || '') + '</div>' +
            '<div class="note">' + esc(rel.note || rel.suggestedStrategy || '') + '</div>' +
            '<button data-key="' + esc(rel.targetKey) + '">跳到这个词</button>' +
          '</article>'
        )).join('')
      history.replaceState(null, '', '#' + encodeURIComponent(node.key))
    }

    function resize() {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      state.needsFit = true
    }

    function worldToScreen(x, y) {
      return {
        x: x * state.transform.k + state.transform.x,
        y: y * state.transform.k + state.transform.y,
      }
    }

    function screenToWorld(x, y) {
      return {
        x: (x - state.transform.x) / state.transform.k,
        y: (y - state.transform.y) / state.transform.k,
      }
    }

    function fitView() {
      if (!state.nodes.length) return
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      for (const node of state.nodes) {
        minX = Math.min(minX, node.x)
        minY = Math.min(minY, node.y)
        maxX = Math.max(maxX, node.x)
        maxY = Math.max(maxY, node.y)
      }
      const graphW = Math.max(1, maxX - minX)
      const graphH = Math.max(1, maxY - minY)
      const mobile = width < 900
      const sideReserve = mobile ? 28 : 470
      const topReserve = mobile ? 260 : 140
      const availableW = Math.max(320, width - sideReserve)
      const availableH = Math.max(320, height - topReserve - 70)
      const scale = Math.max(0.18, Math.min(1.2, Math.min(availableW / graphW, availableH / graphH) * 0.74))
      state.transform.k = scale
      state.transform.x = (availableW / 2) - ((minX + graphW / 2) * scale) + (mobile ? 0 : 18)
      state.transform.y = topReserve + (availableH / 2) - ((minY + graphH / 2) * scale)
      state.needsFit = false
    }

    function simulationTick() {
      const nodes = state.nodes
      const links = state.links
      if (!nodes.length) return
      const grid = new Map()
      const cellSize = 165
      for (const node of nodes) {
        const cx = Math.floor(node.x / cellSize)
        const cy = Math.floor(node.y / cellSize)
        const key = cx + ',' + cy
        if (!grid.has(key)) grid.set(key, [])
        grid.get(key).push(node)
      }
      for (const link of links) {
        const source = link.source
        const target = link.target
        const dx = target.x - source.x
        const dy = target.y - source.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const style = relationStyle[link.type] || relationStyle.kana_similarity
        const preferred = style.distance
        const strength = 0.0028 + Math.min(0.006, (link.value || 0.4) * 0.006)
        const force = (dist - preferred) * strength
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        if (!source.fixed) {
          source.vx += fx
          source.vy += fy
        }
        if (!target.fixed) {
          target.vx -= fx
          target.vy -= fy
        }
      }
      for (const node of nodes) {
        const cx = Math.floor(node.x / cellSize)
        const cy = Math.floor(node.y / cellSize)
        for (let gx = cx - 1; gx <= cx + 1; gx += 1) {
          for (let gy = cy - 1; gy <= cy + 1; gy += 1) {
            const bucket = grid.get(gx + ',' + gy)
            if (!bucket) continue
            for (const other of bucket) {
              if (other === node) continue
              const dx = node.x - other.x
              const dy = node.y - other.y
              const dist2 = dx * dx + dy * dy
              if (dist2 <= 0.01 || dist2 > 27225) continue
              const dist = Math.sqrt(dist2)
              const minDist = node.r + other.r + 58
              if (dist < minDist) {
                const push = (minDist - dist) * 0.025
                if (!node.fixed) {
                  node.vx += (dx / dist) * push
                  node.vy += (dy / dist) * push
                }
              }
            }
          }
        }
        const level = primaryLevel(node.item)
        const anchors = state.level ? { N5: [0,0], N4: [0,0], N3: [0,0], N2: [0,0], N1: [0,0] } : {
          N5: [-560, -360],
          N4: [560, -320],
          N3: [-480, 430],
          N2: [580, 440],
          N1: [0, 720],
        }
        const anchor = anchors[level] || [0, 0]
        if (!node.fixed) {
          node.vx += (anchor[0] - node.x) * 0.00034
          node.vy += (anchor[1] - node.y) * 0.00034
          node.vx *= 0.88
          node.vy *= 0.88
          node.x += node.vx
          node.y += node.vy
        }
      }
    }

    function drawBackground() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      const glow = ctx.createRadialGradient(width * 0.52, height * 0.48, 40, width * 0.52, height * 0.48, Math.max(width, height) * 0.78)
      glow.addColorStop(0, 'rgba(255,255,255,0.05)')
      glow.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)
    }

    function drawLinks() {
      const phase = animationTime / 1150
      ctx.lineCap = 'round'
      const selectedKey = state.selected && state.selected.key
      for (const link of state.links) {
        const a = worldToScreen(link.source.x, link.source.y)
        const b = worldToScreen(link.target.x, link.target.y)
        if ((a.x < -200 && b.x < -200) || (a.x > width + 200 && b.x > width + 200) || (a.y < -200 && b.y < -200) || (a.y > height + 200 && b.y > height + 200)) {
          continue
        }
        const style = relationStyle[link.type] || relationStyle.kana_similarity
        const focused = selectedKey && (link.source.key === selectedKey || link.target.key === selectedKey)
        const hovered = state.hover && (link.source.key === state.hover.key || link.target.key === state.hover.key)
        const active = focused || hovered
        ctx.strokeStyle = hexToRgba(style.color, active ? 0.82 : style.alpha)
        ctx.lineWidth = Math.max(1, style.width * state.transform.k * (active ? 2.1 : 1))
        if (link.type === 'kana_similarity') ctx.setLineDash([8 * state.transform.k, 7 * state.transform.k])
        else if (link.type === 'dakuten_or_handakuten_difference') ctx.setLineDash([2 * state.transform.k, 7 * state.transform.k])
        else if (link.type === 'same_reading_different_writing') ctx.setLineDash([12 * state.transform.k, 5 * state.transform.k])
        else ctx.setLineDash([])
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
        ctx.setLineDash([])
        const beadCount = link.type === 'same_kanji_different_reading' ? 2 : 3
        for (let i = 0; i < beadCount; i += 1) {
          const t = (phase * 0.18 + link.seed + i / beadCount) % 1
          const x = a.x + (b.x - a.x) * t
          const y = a.y + (b.y - a.y) * t
          ctx.fillStyle = hexToRgba(style.color, active ? 0.82 : 0.54)
          ctx.beginPath()
          ctx.arc(x, y, Math.max(1.5, 2.6 * state.transform.k), 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    function drawNodes() {
      const k = state.transform.k
      const labelBudget = k > 0.72 ? 80 : k > 0.48 ? 34 : 12
      let labels = 0
      const selectedKey = state.selected && state.selected.key
      for (const node of state.nodes) {
        const p = worldToScreen(node.x, node.y)
        if (p.x < -80 || p.x > width + 80 || p.y < -80 || p.y > height + 80) continue
        const selected = selectedKey === node.key
        const hovered = state.hover && state.hover.key === node.key
        const pulse = selected ? 1 + Math.sin(animationTime / 180) * 0.08 : 1
        const r = Math.max(4, node.r * k * pulse)
        const grad = ctx.createRadialGradient(p.x - r * 0.35, p.y - r * 0.45, r * 0.2, p.x, p.y, r * 1.25)
        grad.addColorStop(0, '#fff8e8')
        grad.addColorStop(0.23, node.color)
        grad.addColorStop(1, 'rgba(13, 21, 30, 0.84)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = selected ? '#fff1d6' : hovered ? 'rgba(255,241,214,0.86)' : 'rgba(255,255,255,0.28)'
        ctx.lineWidth = selected ? 3 : hovered ? 2 : 1
        ctx.stroke()

        const shouldLabel = selected || hovered || (labels < labelBudget && (scoreWord(node.item) > 34 || k > 0.9))
        if (shouldLabel) {
          labels += 1
          ctx.font = (selected ? 18 : 13) + 'px "PingFang SC", "Hiragino Sans", sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.lineWidth = 4
          ctx.strokeStyle = 'rgba(10, 15, 20, 0.74)'
          ctx.strokeText(node.item.word, p.x, p.y + r + 5)
          ctx.fillStyle = 'rgba(255,250,242,0.95)'
          ctx.fillText(node.item.word, p.x, p.y + r + 5)
        }
      }
    }

    function draw() {
      animationTime = performance.now()
      if (state.needsFit) fitView()
      for (let i = 0; i < 2; i += 1) simulationTick()
      drawBackground()
      drawLinks()
      drawNodes()
      requestAnimationFrame(draw)
    }

    function hitNode(screenX, screenY) {
      const world = screenToWorld(screenX, screenY)
      let best = null
      let bestDist = Infinity
      for (const node of state.nodes) {
        const dx = world.x - node.x
        const dy = world.y - node.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const radius = Math.max(12 / state.transform.k, node.r + 8)
        if (dist <= radius && dist < bestDist) {
          best = node
          bestDist = dist
        }
      }
      return best
    }

    function updateTooltip(event) {
      const node = state.hover
      if (!node) {
        tooltip.style.display = 'none'
        return
      }
      tooltip.innerHTML = '<strong>' + esc(node.item.word) + '</strong><span>' + esc(node.item.reading) + ' · ' + esc(node.item.meaning) + '</span>'
      tooltip.style.display = 'block'
      tooltip.style.left = Math.min(width - 280, event.clientX + 14) + 'px'
      tooltip.style.top = Math.min(height - 92, event.clientY + 14) + 'px'
    }

    canvas.addEventListener('wheel', (event) => {
      event.preventDefault()
      const before = screenToWorld(event.clientX, event.clientY)
      const factor = Math.exp(-event.deltaY * 0.001)
      state.transform.k = Math.max(0.12, Math.min(3.8, state.transform.k * factor))
      state.transform.x = event.clientX - before.x * state.transform.k
      state.transform.y = event.clientY - before.y * state.transform.k
    }, { passive: false })

    canvas.addEventListener('pointerdown', (event) => {
      const node = hitNode(event.clientX, event.clientY)
      canvas.setPointerCapture(event.pointerId)
      state.dragStart = { x: event.clientX, y: event.clientY }
      if (node) {
        state.dragNode = node
        node.fixed = true
      } else {
        state.isPanning = true
        state.panStart = { x: event.clientX, y: event.clientY, tx: state.transform.x, ty: state.transform.y }
      }
    })

    canvas.addEventListener('pointermove', (event) => {
      if (state.dragNode) {
        const world = screenToWorld(event.clientX, event.clientY)
        state.dragNode.x = world.x
        state.dragNode.y = world.y
        state.dragNode.vx = 0
        state.dragNode.vy = 0
        return
      }
      if (state.isPanning && state.panStart) {
        state.transform.x = state.panStart.tx + event.clientX - state.panStart.x
        state.transform.y = state.panStart.ty + event.clientY - state.panStart.y
        return
      }
      state.hover = hitNode(event.clientX, event.clientY)
      canvas.style.cursor = state.hover ? 'pointer' : 'grab'
      updateTooltip(event)
    })

    canvas.addEventListener('pointerup', (event) => {
      const moved = state.dragStart && Math.hypot(event.clientX - state.dragStart.x, event.clientY - state.dragStart.y) > 8
      if (state.dragNode) {
        state.dragNode.fixed = false
        if (!moved) selectNode(state.dragNode)
      } else if (!moved) {
        const node = hitNode(event.clientX, event.clientY)
        if (node) selectNode(node)
      }
      state.dragNode = null
      state.isPanning = false
      state.dragStart = null
      state.panStart = null
    })

    queryInput.addEventListener('input', () => {
      state.query = queryInput.value
      buildGraph()
    })

    typeFilter.addEventListener('change', () => {
      state.type = typeFilter.value
      buildGraph()
    })

    densityFilter.addEventListener('change', () => {
      state.density = densityFilter.value
      buildGraph()
    })

    levelTabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-level]')
      if (!button) return
      state.level = button.dataset.level
      for (const item of levelTabs.querySelectorAll('button')) {
        item.classList.toggle('active', item === button)
      }
      buildGraph()
    })

    searchResults.addEventListener('click', (event) => {
      const button = event.target.closest('[data-key]')
      if (!button) return
      const node = state.nodes.find((item) => item.key === button.dataset.key)
      if (node) {
        selectNode(node)
        searchResults.classList.remove('open')
      }
    })

    searchDockToggle.addEventListener('click', () => {
      state.searchDockOpen = !state.searchDockOpen
      renderSearchResults()
    })

    drawerBody.addEventListener('click', async (event) => {
      const copy = event.target.closest('#copyPrompt')
      if (copy && state.selected) {
        await navigator.clipboard.writeText(promptText(state.selected))
        copy.textContent = '已复制'
        setTimeout(() => { copy.textContent = '复制给 AI' }, 1200)
        return
      }
      const jump = event.target.closest('[data-key]')
      if (!jump) return
      const target = byKey.get(jump.dataset.key)
      if (!target) return
      if (state.level && !(target.levels || []).includes(state.level)) {
        state.level = ''
        for (const item of levelTabs.querySelectorAll('button')) item.classList.toggle('active', item.dataset.level === '')
      }
      state.query = target.word
      queryInput.value = target.word
      buildGraph()
      setTimeout(() => {
        const node = state.nodes.find((item) => item.key === target.key)
        if (node) selectNode(node)
      }, 50)
    })

    closeDrawer.addEventListener('click', () => drawer.classList.remove('open'))
    fitButton.addEventListener('click', () => { state.needsFit = true })
    window.addEventListener('resize', resize)

    resize()
    buildGraph()
    const hashKey = decodeURIComponent(location.hash.replace(/^#/, ''))
    if (hashKey && byKey.has(hashKey)) {
      const item = byKey.get(hashKey)
      state.query = item.word
      queryInput.value = item.word
      buildGraph()
      setTimeout(() => {
        const node = state.nodes.find((entry) => entry.key === hashKey)
        if (node) selectNode(node)
      }, 80)
    }
    requestAnimationFrame(draw)
  </script>
</body>
</html>`

fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(INDEX_OUT, `${JSON.stringify(output, null, 2)}\n`)
fs.writeFileSync(HTML_OUT, html)

console.log(`wrote ${path.relative(ROOT, INDEX_OUT)} (${words.length} words)`)
console.log(`wrote ${path.relative(ROOT, HTML_OUT)}`)
