/**
 * 从 N5/N4/N3 关系索引生成 App 用子图数据（仅含 N5+N4+N3 词，关系目标也限定在这三级）。
 * 输出：public/word-relations/n5_n4_n3_link_map.json
 *
 * 用法：node scripts/build_n5_n4_link_map_public.cjs
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const REL_ROOT = path.join(ROOT, 'data/word_relations')
const MEMORY_ROOT = path.join(ROOT, 'data/memory_methods')
const OUT_DIR = path.join(ROOT, 'public/word-relations')
const OUT_FILE = path.join(OUT_DIR, 'n5_n4_n3_link_map.json')

const LEVELS = ['n5', 'n4', 'n3']

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

function toHiragana(value) {
  return String(value || '').trim().replace(/[ァ-ン]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0x60),
  )
}

function kanaToRomaji(value) {
  const chars = Array.from(toHiragana(value))
  let result = ''
  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i]
    if (char === 'っ') {
      const nextPair = `${chars[i + 1] || ''}${chars[i + 2] || ''}`
      const next = KANA_DIGRAPH_ROMAJI[nextPair] || KANA_ROMAJI[chars[i + 1]] || ''
      result += next[0] || ''
      continue
    }
    if (char === 'ー') {
      result += result.match(/[aeiou]$/)?.[0] || ''
      continue
    }
    const pair = char + (chars[i + 1] || '')
    if (KANA_DIGRAPH_ROMAJI[pair]) {
      result += KANA_DIGRAPH_ROMAJI[pair]
      i += 1
      continue
    }
    result += KANA_ROMAJI[char] || char
  }
  return result.toLowerCase().replace(/[^a-z]/g, '')
}

function memoryKey(word, reading) {
  return `${word || ''}::${reading || ''}`
}

function hasUsableMemory(entry) {
  const mergedScene = String(entry.mergedScene || '').trim()
  const reviewTip = String(entry.reviewTip || entry.reviewHint || '').trim()
  if (!mergedScene && !reviewTip) return false
  if (mergedScene.includes('在便利店门口，小田和朋友把刚发生的小事演了一遍')) return false
  return true
}

function loadMemoryIndex() {
  const index = new Map()
  for (const level of LEVELS) {
    const dir = path.join(MEMORY_ROOT, level)
    if (!fs.existsSync(dir)) continue
    for (const file of fs.readdirSync(dir).filter((f) => /^batch_\d+_methods\.json$/.test(f))) {
      const entries = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
      entries.forEach((entry, entryIndex) => {
        if (!hasUsableMemory(entry)) return
        const key = memoryKey(entry.word, entry.reading)
        if (index.has(key)) return
        index.set(key, {
          source: level.toUpperCase(),
          batch: Number(file.match(/^batch_(\d+)_methods\.json$/)?.[1] || 0),
          index: entryIndex + 1,
          mergedScene: entry.mergedScene || '',
          reviewTip: entry.reviewTip || entry.reviewHint || '',
          difficultyStars: entry.difficultyStars || 0,
        })
      })
    }
  }
  return index
}

function compactRelation(relation, allowedKeys) {
  const targetWord = relation.targetWord || ''
  const targetReading = relation.targetReading || ''
  const targetKey = memoryKey(targetWord, targetReading)
  if (!allowedKeys.has(targetKey)) return null
  return {
    type: relation.type,
    targetKey,
    targetWord,
    targetReading,
    targetReadingRomaji: relation.targetReadingRomaji || kanaToRomaji(targetReading),
    targetMeaning: relation.targetMeaning || '',
    targetLevels: relation.targetLevels || [],
    memoryValue: relation.memoryValue,
    confidence: relation.confidence,
    suggestedStrategy: relation.suggestedStrategy || '',
    note: relation.note || '',
  }
}

function compactWord(raw, levelTag, allowedKeys, memoryIndex) {
  const key = memoryKey(raw.word, raw.reading)
  const readingRomaji = raw.readingRomaji || kanaToRomaji(raw.reading)
  const relations = (raw.relations || [])
    .map((rel) => compactRelation(rel, allowedKeys))
    .filter(Boolean)
    .slice(0, 20)
  const memoryMethod = memoryIndex.get(key) || null
  const searchText = [
    raw.word,
    raw.reading,
    toHiragana(raw.reading),
    readingRomaji,
    raw.meaning,
    ...(raw.kanji || []),
    ...relations.flatMap((rel) => [rel.targetWord, rel.targetReading, rel.targetMeaning]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return {
    key,
    word: raw.word,
    reading: raw.reading,
    readingRomaji,
    meaning: raw.meaning || '',
    levels: [levelTag],
    kanji: raw.kanji || [],
    relations,
    relationSummary: {
      total: relations.length,
      highValue: relations.filter((rel) => (rel.memoryValue || 0) >= 0.82).length,
    },
    suggestedPrimaryStrategies: raw.suggestedPrimaryStrategies || [],
    searchText,
    memoryMethod,
  }
}

function main() {
  const rawByKey = new Map()
  for (const level of LEVELS) {
    const file = path.join(REL_ROOT, `${level}_word_relation_index.json`)
    if (!fs.existsSync(file)) {
      console.error('missing', file)
      process.exit(1)
    }
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'))
    const tag = level.toUpperCase()
    for (const [key, item] of Object.entries(payload.words || {})) {
      rawByKey.set(key, { ...item, __level: tag })
    }
  }

  const allowedKeys = new Set(rawByKey.keys())
  const memoryIndex = loadMemoryIndex()
  const words = Array.from(rawByKey.entries())
    .map(([key, item]) => compactWord(item, item.__level, allowedKeys, memoryIndex))
    .sort((a, b) => a.reading.localeCompare(b.reading) || a.word.localeCompare(b.word))

  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      levels: ['N5', 'N4', 'N3'],
      totalWords: words.length,
      description: 'N5+N4+N3 单词链路子图索引，仅含这三级的词与词间关系。',
    },
    words,
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(output)}\n`)
  console.log(`wrote ${path.relative(ROOT, OUT_FILE)} (${words.length} words)`)
}

main()
