import type { WordLinkItem, WordLinkLevelFilter } from './types'

const KANA_ROMAJI: Record<string, string> = {
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
}

const KANA_DIGRAPH: Record<string, string> = {
  きゃ: 'kya', きゅ: 'kyu', きょ: 'kyo',
  しゃ: 'sha', しゅ: 'shu', しょ: 'sho',
  ちゃ: 'cha', ちゅ: 'chu', ちょ: 'cho',
  にゃ: 'nya', にゅ: 'nyu', にょ: 'nyo',
  ひゃ: 'hya', ひゅ: 'hyu', ひょ: 'hyo',
  みゃ: 'mya', みゅ: 'myu', みょ: 'myo',
  りゃ: 'rya', りゅ: 'ryu', りょ: 'ryo',
  ぎゃ: 'gya', ぎゅ: 'gyu', ぎょ: 'gyo',
  じゃ: 'ja', じゅ: 'ju', じょ: 'jo',
  びゃ: 'bya', びゅ: 'byu', びょ: 'byo',
  ぴゃ: 'pya', ぴゅ: 'pyu', ぴょ: 'pyo',
}

export function toHiragana(value: string) {
  return value.trim().replace(/[ァ-ン]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60))
}

function kanaToRomaji(value: string) {
  const chars = Array.from(toHiragana(value))
  let result = ''
  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i]
    if (char === 'っ') {
      const next = KANA_DIGRAPH[`${chars[i + 1] || ''}${chars[i + 2] || ''}`] || KANA_ROMAJI[chars[i + 1]] || ''
      result += next[0] || ''
      continue
    }
    if (char === 'ー') {
      result += result.match(/[aeiou]$/)?.[0] || ''
      continue
    }
    const pair = char + (chars[i + 1] || '')
    if (KANA_DIGRAPH[pair]) {
      result += KANA_DIGRAPH[pair]
      i += 1
      continue
    }
    result += KANA_ROMAJI[char] || char
  }
  return result.toLowerCase().replace(/[^a-z]/g, '')
}

export function queryVariants(value: string) {
  const raw = value.trim().toLowerCase()
  const hira = toHiragana(raw).toLowerCase()
  const variants = [raw]
  if (hira && hira !== raw) variants.push(hira)
  if (/^[ぁ-ゖー]+$/.test(hira)) variants.push(kanaToRomaji(raw))
  return Array.from(new Set(variants.filter(Boolean)))
}

function levelMatches(item: WordLinkItem, level: WordLinkLevelFilter) {
  return !level || item.levels.includes(level)
}

function directQueryScore(item: WordLinkItem, queries: string[]) {
  if (!queries.length) return 0
  const fields = [item.word, item.reading, toHiragana(item.reading), item.readingRomaji]
    .filter(Boolean)
    .map((field) => field.toLowerCase())
  let best = 0
  for (const query of queries) {
    for (const field of fields) {
      if (field === query) best = Math.max(best, 1000)
      else if (field.startsWith(query)) best = Math.max(best, 600)
      else if (field.includes(query)) best = Math.max(best, 300)
    }
    if (item.searchText.includes(query)) best = Math.max(best, 200)
  }
  return best
}

export function searchWords(
  words: WordLinkItem[],
  query: string,
  level: WordLinkLevelFilter,
  limit = 12,
) {
  const queries = queryVariants(query)
  if (!queries.length) return []
  return words
    .filter((item) => levelMatches(item, level))
    .map((item) => ({ item, score: directQueryScore(item, queries) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.item.reading.localeCompare(b.item.reading))
    .slice(0, limit)
    .map((row) => row.item)
}

export function resolveWordKey(
  byKey: Map<string, WordLinkItem>,
  word: string,
  reading: string,
) {
  const direct = byKey.get(`${word}::${reading}`)
  if (direct) return direct.key
  const hira = toHiragana(reading)
  for (const item of byKey.values()) {
    if (item.word === word && toHiragana(item.reading) === hira) return item.key
  }
  return null
}
