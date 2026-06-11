const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'data/word_relations')
const LEVELS = process.argv.slice(2).length ? process.argv.slice(2) : ['n5']
let activeLevelLabel = 'N5'

const KANJI_RE = /[\u4e00-\u9fff]/g
const KANA_RE = /[ぁ-ゟ゠-ヿー]/g
const DAKUTEN_PAIRS = new Map([
  ['か', 'が'], ['き', 'ぎ'], ['く', 'ぐ'], ['け', 'げ'], ['こ', 'ご'],
  ['さ', 'ざ'], ['し', 'じ'], ['す', 'ず'], ['せ', 'ぜ'], ['そ', 'ぞ'],
  ['た', 'だ'], ['ち', 'ぢ'], ['つ', 'づ'], ['て', 'で'], ['と', 'ど'],
  ['は', 'ば'], ['ひ', 'び'], ['ふ', 'ぶ'], ['へ', 'べ'], ['ほ', 'ぼ'],
  ['は', 'ぱ'], ['ひ', 'ぴ'], ['ふ', 'ぷ'], ['へ', 'ぺ'], ['ほ', 'ぽ'],
])

const DAKUTEN_EQUIV = new Map()
for (const [a, b] of DAKUTEN_PAIRS.entries()) {
  DAKUTEN_EQUIV.set(`${a}:${b}`, true)
  DAKUTEN_EQUIV.set(`${b}:${a}`, true)
}

function normalize(value) {
  return String(value || '').trim()
}

function toHiragana(value) {
  return normalize(value).replace(/[ァ-ン]/g, (char) =>
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
  return result
}

function normalizeRomaji(value) {
  return String(value || '').toLowerCase().replace(/[^a-z]/g, '')
}

function readingRomaji(value) {
  return normalizeRomaji(kanaToRomaji(value))
}

function keyOf(entry) {
  return `${entry.word}::${entry.reading}`
}

function pairKey(a, b, type) {
  const keys = [keyOf(a), keyOf(b)].sort()
  return `${type}::${keys[0]}=>${keys[1]}`
}

function getKanji(word) {
  return Array.from(new Set(normalize(word).match(KANJI_RE) || []))
}

function readingStem(reading) {
  return normalize(reading).replace(/[るす]$/, '')
}

function levenshtein(a, b) {
  const aa = Array.from(a)
  const bb = Array.from(b)
  const dp = Array.from({ length: aa.length + 1 }, () => Array(bb.length + 1).fill(0))
  for (let i = 0; i <= aa.length; i++) dp[i][0] = i
  for (let j = 0; j <= bb.length; j++) dp[0][j] = j
  for (let i = 1; i <= aa.length; i++) {
    for (let j = 1; j <= bb.length; j++) {
      const cost = aa[i - 1] === bb[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      )
    }
  }
  return dp[aa.length][bb.length]
}

function dakutenDiffInfo(a, b) {
  const aa = Array.from(a)
  const bb = Array.from(b)
  if (aa.length !== bb.length || aa.length < 2) return null
  let diffs = 0
  let diff = null
  for (let i = 0; i < aa.length; i++) {
    if (aa[i] === bb[i]) continue
    if (!DAKUTEN_EQUIV.has(`${aa[i]}:${bb[i]}`)) return null
    diffs += 1
    diff = { index: i, from: aa[i], to: bb[i] }
  }
  return diffs === 1 ? diff : null
}

function dakutenDiff(a, b) {
  return Boolean(dakutenDiffInfo(a, b))
}

function dakutenVariationInfo(a, b) {
  const variants = [
    { left: normalize(a), right: normalize(b), evidence: 'single_dakuten_difference', exact: true },
    { left: readingStem(a), right: readingStem(b), evidence: 'reading_stem_single_dakuten_difference', exact: false },
    { left: readingStem(a), right: normalize(b), evidence: 'left_stem_single_dakuten_difference', exact: false },
    { left: normalize(a), right: readingStem(b), evidence: 'right_stem_single_dakuten_difference', exact: false },
  ]
  const seen = new Set()
  for (const variant of variants) {
    if (!variant.left || !variant.right || variant.left === variant.right) continue
    const key = `${variant.left}<->${variant.right}`
    if (seen.has(key)) continue
    seen.add(key)
    const diff = dakutenDiffInfo(variant.left, variant.right)
    if (!diff) continue
    return { ...variant, ...diff }
  }
  return null
}

function kanaOnly(value) {
  const text = normalize(value)
  return text && Array.from(text).every((char) => char.match(KANA_RE))
}

function readingPrefixInfo(a, b) {
  const aReading = toHiragana(a.reading)
  const bReading = toHiragana(b.reading)
  if (!aReading || !bReading || aReading === bReading) return null

  const pairs = [
    { short: a, long: b, shortReading: aReading, longReading: bReading },
    { short: b, long: a, shortReading: bReading, longReading: aReading },
  ]

  for (const pair of pairs) {
    const shortChars = Array.from(pair.shortReading)
    const longChars = Array.from(pair.longReading)
    if (shortChars.length < 2) continue
    if (longChars.length <= shortChars.length) continue
    if (!pair.longReading.startsWith(pair.shortReading)) continue
    return {
      short: pair.short,
      long: pair.long,
      prefix: pair.shortReading,
      tail: longChars.slice(shortChars.length).join(''),
    }
  }

  return null
}

function shortMeaning(value) {
  return normalize(value).replace(/\s+/g, '').slice(0, 24)
}

function getLevelPaths(level) {
  const normalizedLevel = normalize(level).toLowerCase()
  if (normalizedLevel === 'all') {
    const levels = ['n5', 'n4', 'n3', 'n2', 'n1']
    return {
      level: 'all',
      label: 'N5-N4-N3-N2-N1',
      inputs: levels.map((item) => ({
        level: item,
        label: item.toUpperCase(),
        path: getLevelPaths(item).input,
      })),
      legacyHighValues: levels.map((item) => path.join(ROOT, `data/word_relations/${item}_high_value_relations.json`)),
      edgesOut: path.join(OUT_DIR, 'all_relation_edges.json'),
      indexOut: path.join(OUT_DIR, 'all_word_relation_index.json'),
      graphOut: path.join(OUT_DIR, 'all_word_relations_graph.json'),
      summaryOut: path.join(OUT_DIR, 'all_relations_summary.md'),
    }
  }
  if (normalizedLevel === 'n2' || normalizedLevel === 'n1') {
    return {
      level: normalizedLevel,
      label: normalizedLevel.toUpperCase(),
      input: path.join(ROOT, `data/word_relations/sources/${normalizedLevel}_vocab.json`),
      legacyHighValue: path.join(ROOT, `data/word_relations/${normalizedLevel}_high_value_relations.json`),
      edgesOut: path.join(OUT_DIR, `${normalizedLevel}_relation_edges.json`),
      indexOut: path.join(OUT_DIR, `${normalizedLevel}_word_relation_index.json`),
      summaryOut: path.join(OUT_DIR, `${normalizedLevel}_relations_summary.md`),
    }
  }
  return {
    level: normalizedLevel,
    label: normalizedLevel.toUpperCase(),
    input: path.join(ROOT, `data/memory_methods/${normalizedLevel}/all_${normalizedLevel}_memory_methods.json`),
    legacyHighValue: path.join(ROOT, `data/word_relations/${normalizedLevel}_high_value_relations.json`),
    edgesOut: path.join(OUT_DIR, `${normalizedLevel}_relation_edges.json`),
    indexOut: path.join(OUT_DIR, `${normalizedLevel}_word_relation_index.json`),
    summaryOut: path.join(OUT_DIR, `${normalizedLevel}_relations_summary.md`),
  }
}

function makeEdge(type, from, to, options = {}) {
  return {
    id: '',
    level: options.levelLabel || activeLevelLabel,
    type,
    source: options.source || 'generated',
    from: {
      word: from.word,
      reading: from.reading,
      readingRomaji: from.readingRomaji || readingRomaji(from.reading),
      meaning: from.meaning,
      levels: from.levels || [from.level].filter(Boolean),
    },
    to: {
      word: to.word,
      reading: to.reading,
      readingRomaji: to.readingRomaji || readingRomaji(to.reading),
      meaning: to.meaning,
      levels: to.levels || [to.level].filter(Boolean),
    },
    relationKey: options.relationKey || '',
    confidence: options.confidence,
    memoryValue: options.memoryValue,
    suggestedStrategy: options.suggestedStrategy,
    note: options.note,
    evidence: options.evidence || [],
    status: options.status || 'auto',
  }
}

function addEdge(edges, seen, edge) {
  const fromKey = `${edge.from.word}::${edge.from.reading}`
  const toKey = `${edge.to.word}::${edge.to.reading}`
  const keys = [fromKey, toKey].sort()
  const dedupeKey = `${edge.type}::${keys[0]}=>${keys[1]}::${edge.relationKey}`
  if (seen.has(dedupeKey)) return
  seen.add(dedupeKey)
  edge.id = `${edge.level.toLowerCase()}-rel-${String(edges.length + 1).padStart(5, '0')}`
  edges.push(edge)
}

function loadLegacyNotes(entries, legacyHighValue) {
  const byWordReading = new Map(entries.map((entry) => [keyOf(entry), entry]))
  const notes = new Map()
  const legacyFiles = Array.isArray(legacyHighValue) ? legacyHighValue : [legacyHighValue]

  for (const file of legacyFiles) {
    if (!fs.existsSync(file)) continue
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    for (const group of data.highValueRelations || []) {
      for (const pair of group.pairs || []) {
        const w1 = byWordReading.get(`${pair.w1}::${pair.r1}`)
        const w2 = byWordReading.get(`${pair.w2}::${pair.r2}`)
        if (!w1 || !w2) continue
        notes.set(pairKey(w1, w2, group.type), pair.note)
        notes.set(pairKey(w1, w2, 'same_reading_different_writing'), pair.note)
        notes.set(pairKey(w1, w2, 'kana_similarity'), pair.note)
      }
    }
  }
  return notes
}

function buildRelations(paths) {
  activeLevelLabel = paths.label
  const sourceFiles = paths.inputs || [{ level: paths.level, label: paths.label, path: paths.input }]
  const rawEntries = []
  for (const source of sourceFiles) {
    const sourceEntries = JSON.parse(fs.readFileSync(source.path, 'utf8'))
    for (const entry of sourceEntries) {
      rawEntries.push({ ...entry, sourceLevel: source.label })
    }
  }

  const mergedEntries = new Map()
  for (const entry of rawEntries) {
    const word = normalize(entry.word)
    const reading = normalize(entry.reading)
    const meaning = normalize(entry.meaning)
    if (!word || !reading) continue
    const key = `${word}::${reading}`
    const existing = mergedEntries.get(key)
    if (existing) {
      if (!existing.levels.includes(entry.sourceLevel)) existing.levels.push(entry.sourceLevel)
      if (meaning && !existing.meanings.includes(meaning)) existing.meanings.push(meaning)
      existing.meaning = existing.meanings[0]
      continue
    }
    mergedEntries.set(key, {
      id: '',
      word,
      reading,
      readingRomaji: readingRomaji(reading),
      meaning,
      meanings: meaning ? [meaning] : [],
      levels: [entry.sourceLevel],
      kanji: getKanji(word),
    })
  }

  const entries = Array.from(mergedEntries.values()).map((entry, index) => ({
    ...entry,
    id: `${paths.level}-word-${String(index + 1).padStart(4, '0')}`,
  }))

  const legacyNotes = loadLegacyNotes(entries, paths.legacyHighValues || paths.legacyHighValue)
  const edges = []
  const seen = new Set()

  const byReadingRomaji = new Map()
  const byKanji = new Map()
  for (const entry of entries) {
    if (entry.readingRomaji) {
      if (!byReadingRomaji.has(entry.readingRomaji)) byReadingRomaji.set(entry.readingRomaji, [])
      byReadingRomaji.get(entry.readingRomaji).push(entry)
    }
    for (const kanji of entry.kanji) {
      if (!byKanji.has(kanji)) byKanji.set(kanji, [])
      byKanji.get(kanji).push(entry)
    }
  }

  for (const group of byReadingRomaji.values()) {
    if (group.length < 2) continue
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i]
        const b = group[j]
        if (a.word === b.word && a.meaning === b.meaning) continue
        const manualNote = legacyNotes.get(pairKey(a, b, 'same_reading_different_writing'))
        addEdge(edges, seen, makeEdge('same_reading_different_writing', a, b, {
          relationKey: a.readingRomaji,
          confidence: 0.98,
          memoryValue: 0.95,
          suggestedStrategy: '同音不同字（罗马音归一） + 汉字/场景区分',
          note: manualNote || `${a.readingRomaji} 完全同音：${a.word}(${a.reading})=${shortMeaning(a.meaning)}，${b.word}(${b.reading})=${shortMeaning(b.meaning)}，必须成对区分。`,
          evidence: ['reading_romaji_exact_match', `from_reading:${a.reading}`, `to_reading:${b.reading}`],
          source: manualNote ? 'legacy_high_value+generated' : 'generated',
          status: manualNote ? 'needs_review_confirmed_seed' : 'auto',
        }))
      }
    }
  }

  for (const [kanji, group] of byKanji.entries()) {
    if (group.length < 2) continue
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i]
        const b = group[j]
        const type = a.readingRomaji === b.readingRomaji ? 'same_kanji_same_reading' : 'same_kanji_different_reading'
        const memoryValue = type === 'same_kanji_different_reading' ? 0.86 : 0.76
        addEdge(edges, seen, makeEdge(type, a, b, {
          relationKey: kanji,
          confidence: 0.88,
          memoryValue,
          suggestedStrategy: type === 'same_kanji_different_reading'
            ? '同字不同音 + 固定读音提醒'
            : '同汉字家族 + 意义串联',
          note: `共享汉字「${kanji}」：${a.word}(${a.reading}) / ${b.word}(${b.reading})。`,
          evidence: [`shared_kanji:${kanji}`],
        }))
      }
    }
  }

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i]
      const b = entries[j]
      if (a.reading === b.reading) continue
      const dist = levenshtein(a.reading, b.reading)
      const dakutenInfo = dakutenVariationInfo(a.reading, b.reading)
      const prefixInfo = readingPrefixInfo(a, b)
      const hasUsefulLength = Math.min(Array.from(a.reading).length, Array.from(b.reading).length) >= 2

      if (dakutenInfo) {
        const manualNote = legacyNotes.get(pairKey(a, b, 'kana_similarity')) || legacyNotes.get(pairKey(a, b, 'dakutenDiff'))
        const exactNote = `${a.reading} 和 ${b.reading} 只差一个浊点/半浊点，优先把这个点编进故事。`
        const stemNote = `${a.reading} 和 ${b.reading} 的核心读音「${dakutenInfo.left} / ${dakutenInfo.right}」只差 ${dakutenInfo.from}/${dakutenInfo.to} 这个浊点变化，适合把浊点当成记忆开关。`
        addEdge(edges, seen, makeEdge('dakuten_or_handakuten_difference', a, b, {
          relationKey: `${a.reading}<->${b.reading}:dakuten:${dakutenInfo.left}<->${dakutenInfo.right}`,
          confidence: dakutenInfo.exact ? 0.9 : 0.84,
          memoryValue: dakutenInfo.exact ? 0.9 : 0.88,
          suggestedStrategy: '浊点/半浊点差异 + 字形变化故事',
          note: manualNote || (dakutenInfo.exact ? exactNote : stemNote),
          evidence: [dakutenInfo.evidence, `dakuten:${dakutenInfo.from}<->${dakutenInfo.to}`],
          source: manualNote ? 'legacy_high_value+generated' : 'generated',
        }))
        continue
      }

      if (prefixInfo) {
        addEdge(edges, seen, makeEdge('reading_prefix_chunk', prefixInfo.short, prefixInfo.long, {
          relationKey: `reading_prefix:${prefixInfo.prefix}->${toHiragana(prefixInfo.long.reading)}`,
          confidence: 0.84,
          memoryValue: 0.84,
          suggestedStrategy: '读音前缀/假名词块 + 拆分谐音故事',
          note: `${prefixInfo.long.reading} 从开头包含已学读音块「${prefixInfo.prefix}」：${prefixInfo.short.word}(${prefixInfo.short.reading}) / ${prefixInfo.long.word}(${prefixInfo.long.reading})，适合先拆出开头词块再编故事。`,
          evidence: ['reading_prefix_from_start', `prefix:${prefixInfo.prefix}`, `tail:${prefixInfo.tail}`],
        }))
        continue
      }

      if (dist === 1 && hasUsefulLength) {
        const sharedKanji = a.kanji.some((kanji) => b.kanji.includes(kanji))
        const bothKanaWords = kanaOnly(a.word) && kanaOnly(b.word)
        const memoryValue = sharedKanji || bothKanaWords ? 0.84 : 0.72
        if (memoryValue < 0.8) continue
        const manualNote = legacyNotes.get(pairKey(a, b, 'kana_similarity')) || legacyNotes.get(pairKey(a, b, 'oneKanaDiff'))
        addEdge(edges, seen, makeEdge('kana_similarity', a, b, {
          relationKey: `edit_distance_1:${a.reading}<->${b.reading}`,
          confidence: 0.82,
          memoryValue,
          suggestedStrategy: '相似假名 + 多一点/少一点/换一笔对比',
          note: manualNote || `${a.reading} 和 ${b.reading} 只差一个假名/长音/促音，适合对比记。`,
          evidence: ['reading_edit_distance_1'],
          source: manualNote ? 'legacy_high_value+generated' : 'generated',
        }))
      }
    }
  }

  for (const kanjiGroup of byKanji.values()) {
    for (let i = 0; i < kanjiGroup.length; i++) {
      for (let j = i + 1; j < kanjiGroup.length; j++) {
        const a = kanjiGroup[i]
        const b = kanjiGroup[j]
        const aEndsSu = a.word.endsWith('す') && a.reading.endsWith('す')
        const bEndsRu = b.word.endsWith('る') && b.reading.endsWith('る')
        const bEndsSu = b.word.endsWith('す') && b.reading.endsWith('す')
        const aEndsRu = a.word.endsWith('る') && a.reading.endsWith('る')
        const isPair = (aEndsSu && bEndsRu && readingStem(a.reading) === readingStem(b.reading)) ||
          (bEndsSu && aEndsRu && readingStem(b.reading) === readingStem(a.reading))
        if (!isPair) continue
        addEdge(edges, seen, makeEdge('transitive_intransitive_pair', a, b, {
          relationKey: readingStem(a.reading) || readingStem(b.reading),
          confidence: 0.88,
          memoryValue: 0.9,
          suggestedStrategy: '自动词/他动词对比 + す/る 结尾动作区分',
          note: `${a.word}(${a.reading}) 和 ${b.word}(${b.reading}) 共享汉字和词干，优先成对记自动/他动。`,
          evidence: ['shared_kanji', 'su_ru_verb_pair'],
        }))
      }
    }
  }

  for (const entry of entries) {
    const base = entries.find((candidate) =>
      candidate !== entry &&
      entry.word === `${candidate.word}い` &&
      entry.reading === `${candidate.reading}い`
    )
    if (!base) continue
    addEdge(edges, seen, makeEdge('adjective_derivation', base, entry, {
      relationKey: `${base.word}+い`,
      confidence: 0.92,
      memoryValue: 0.84,
      suggestedStrategy: '名词/颜色词 + い 形容词化',
      note: `${base.word} 加 い 变成 ${entry.word}，表示「${shortMeaning(base.meaning)}的」。`,
      evidence: ['word_plus_i', 'reading_plus_i'],
    }))
  }

  edges.sort((a, b) =>
    b.memoryValue - a.memoryValue ||
    b.confidence - a.confidence ||
    a.type.localeCompare(b.type) ||
    a.from.reading.localeCompare(b.from.reading)
  )
  edges.forEach((edge, index) => { edge.id = `${paths.level}-rel-${String(index + 1).padStart(5, '0')}` })

  const index = new Map(entries.map((entry) => [keyOf(entry), {
    id: entry.id,
    word: entry.word,
    reading: entry.reading,
    readingRomaji: entry.readingRomaji,
    meaning: entry.meaning,
    meanings: entry.meanings,
    levels: entry.levels,
    kanji: entry.kanji,
    searchKeys: Array.from(new Set([entry.word, entry.reading, entry.readingRomaji].filter(Boolean))),
    relations: [],
    relationSummary: {
      total: 0,
      highValue: 0,
      types: {},
    },
    suggestedPrimaryStrategies: [],
  }]))

  for (const edge of edges) {
    for (const side of ['from', 'to']) {
      const current = edge[side]
      const other = side === 'from' ? edge.to : edge.from
      const item = index.get(`${current.word}::${current.reading}`)
      if (!item) continue
      item.relations.push({
        edgeId: edge.id,
        type: edge.type,
        targetWord: other.word,
        targetReading: other.reading,
        targetReadingRomaji: other.readingRomaji || readingRomaji(other.reading),
        targetMeaning: other.meaning,
        targetLevels: other.levels || [],
        memoryValue: edge.memoryValue,
        confidence: edge.confidence,
        suggestedStrategy: edge.suggestedStrategy,
        note: edge.note,
      })
      item.relationSummary.total += 1
      if (edge.memoryValue >= 0.85) item.relationSummary.highValue += 1
      item.relationSummary.types[edge.type] = (item.relationSummary.types[edge.type] || 0) + 1
    }
  }

  for (const item of index.values()) {
    item.relations.sort((a, b) => b.memoryValue - a.memoryValue || b.confidence - a.confidence)
    item.relations = item.relations.slice(0, 12)
    item.suggestedPrimaryStrategies = Array.from(new Set(item.relations
      .filter((rel) => rel.memoryValue >= 0.84)
      .map((rel) => rel.suggestedStrategy)))
      .slice(0, 4)
  }

  const relationEdges = {
    metadata: {
      level: paths.label,
      generatedAt: new Date().toISOString(),
      source: paths.inputs
        ? paths.inputs.map((source) => path.relative(ROOT, source.path))
        : path.relative(ROOT, paths.input),
      sourceWords: rawEntries.length,
      totalWords: entries.length,
      totalEdges: edges.length,
      description: `${paths.label} 单词关系边列表。用于程序构建链路图、筛选高价值记忆关系。`,
    },
    relations: edges,
  }

  const wordIndex = {
    metadata: {
      level: paths.label,
      generatedAt: relationEdges.metadata.generatedAt,
      source: relationEdges.metadata.source,
      sourceWords: rawEntries.length,
      totalWords: entries.length,
      description: `${paths.label} 按词索引关系图。用于 AI 编写记忆方法时先查该词关系。`,
    },
    words: Object.fromEntries(Array.from(index.values()).map((item) => [keyOf(item), item])),
  }

  return { relationEdges, wordIndex }
}

function writeSummary(paths, relationEdges, wordIndex) {
  const counts = {}
  for (const edge of relationEdges.relations) counts[edge.type] = (counts[edge.type] || 0) + 1
  const topWords = Object.values(wordIndex.words)
    .sort((a, b) => b.relationSummary.highValue - a.relationSummary.highValue || b.relationSummary.total - a.relationSummary.total)
    .slice(0, 12)

  const samples = relationEdges.relations.slice(0, 12).map((edge) =>
    `- ${edge.from.word}(${edge.from.reading}) ↔ ${edge.to.word}(${edge.to.reading}) ｜ ${edge.type} ｜ ${edge.note}`
  ).join('\n')

  const typeRows = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `| ${type} | ${count} |`)
    .join('\n')

  const wordRows = topWords
    .map((word) => `| ${word.word} | ${word.reading} | ${word.relationSummary.total} | ${word.relationSummary.highValue} | ${word.suggestedPrimaryStrategies.join('；')} |`)
    .join('\n')

  return `# ${paths.label} 单词关系图总结

本文件由 \`scripts/build_word_relations.cjs\` 生成。它不是人工最终审稿，而是给「单词链路图」和「记忆方法生成」使用的第一版结构化底座。

## 输出文件

- \`${path.relative(ROOT, paths.edgesOut)}\`：关系边列表，适合画链路图和做统计。
- \`${path.relative(ROOT, paths.indexOut)}\`：按单词索引，适合 AI 写记忆法前检索。

## 数据规模

- ${paths.label} 原始词条数：${relationEdges.metadata.sourceWords}
- ${paths.label} 去重后单词节点数：${relationEdges.metadata.totalWords}
- 关系边数：${relationEdges.metadata.totalEdges}

## 关系类型统计

| 类型 | 数量 |
|------|------|
${typeRows}

## 高价值样例

${samples}

## 关系最多的词

| 单词 | 读音 | 关系数 | 高价值关系 | 建议策略 |
|------|------|--------|------------|----------|
${wordRows}

## 目前判断

这版已经能支撑「先查关系，再写记忆法」：

1. 同音不同字按罗马音归一判断，优先用于易混提醒。
2. 同字不同音优先沉淀固定读音。
3. 相似假名优先做多一点、少一点、浊点差故事。
4. 自动词/他动词和形容词派生优先成组记。

下一步应加入人工确认状态：用户确认过的关系进入 \`status: confirmed\`，AI 自动发现但未审的关系保持 \`status: auto\`。
`
}

fs.mkdirSync(OUT_DIR, { recursive: true })
for (const level of LEVELS) {
  const paths = getLevelPaths(level)
  const inputFiles = paths.inputs?.map((source) => source.path) || [paths.input]
  for (const inputFile of inputFiles) {
    if (!fs.existsSync(inputFile)) {
      throw new Error(`Missing source file: ${path.relative(ROOT, inputFile)}`)
    }
  }
  const { relationEdges, wordIndex } = buildRelations(paths)
  fs.writeFileSync(paths.edgesOut, `${JSON.stringify(relationEdges, null, 2)}\n`)
  fs.writeFileSync(paths.indexOut, `${JSON.stringify(wordIndex, null, 2)}\n`)
  if (paths.graphOut) {
    fs.writeFileSync(paths.graphOut, `${JSON.stringify({
      metadata: {
        ...relationEdges.metadata,
        description: `${paths.label} 单词总关系图。包含词节点 words 和关系边 relations，用于完整链路图和记忆方法检索。`,
      },
      words: wordIndex.words,
      relations: relationEdges.relations,
    }, null, 2)}\n`)
  }
  fs.writeFileSync(paths.summaryOut, writeSummary(paths, relationEdges, wordIndex))

  console.log(`wrote ${path.relative(ROOT, paths.edgesOut)} (${relationEdges.relations.length} edges)`)
  console.log(`wrote ${path.relative(ROOT, paths.indexOut)} (${Object.keys(wordIndex.words).length} words)`)
  if (paths.graphOut) console.log(`wrote ${path.relative(ROOT, paths.graphOut)} (graph)`)
  console.log(`wrote ${path.relative(ROOT, paths.summaryOut)}`)
}
