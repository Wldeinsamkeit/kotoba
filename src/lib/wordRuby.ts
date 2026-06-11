export type RubySegment = { base: string; reading: string }

const KANA_RE = /^[ぁ-んァ-ンー]+$/
const KANJI_RE = /^[\u4e00-\u9fff々〆ヵヶ]+$/

const SMALL_KANA = new Set(
  'ぁぃぅぇぉゃゅょゎゕゖァィゥェォャュョョヮヵヶ'.split(''),
)

function moraLength(text: string): number {
  let count = 0
  for (const ch of text) {
    if (!SMALL_KANA.has(ch)) count += 1
  }
  return count
}

function cumulativeMoraAt(text: string): number[] {
  const cuts = [0]
  let mora = 0
  for (const ch of text) {
    if (!SMALL_KANA.has(ch)) mora += 1
    cuts.push(mora)
  }
  return cuts
}

function splitReadingByMoraTargets(reading: string, parts: number): string[] {
  if (parts <= 1) return [reading]

  const total = moraLength(reading)
  const moraAt = cumulativeMoraAt(reading)
  const cutIndices = [0]

  for (let part = 1; part < parts; part += 1) {
    const target = (total * part) / parts
    let bestIndex = cutIndices[cutIndices.length - 1] + 1
    let bestDiff = Number.POSITIVE_INFINITY

    for (let i = cutIndices[cutIndices.length - 1] + 1; i <= reading.length; i += 1) {
      const diff = Math.abs(moraAt[i] - target)
      if (diff < bestDiff) {
        bestDiff = diff
        bestIndex = i
      }
    }

    cutIndices.push(bestIndex)
  }

  cutIndices.push(reading.length)

  const result: string[] = []
  for (let i = 0; i < cutIndices.length - 1; i += 1) {
    const slice = reading.slice(cutIndices[i], cutIndices[i + 1])
    if (slice) result.push(slice)
  }

  return result.length === parts ? result : [reading]
}

function tokenizeWord(word: string): string[] {
  return word.match(/[\u4e00-\u9fff々〆ヵヶ]+|[ぁ-んァ-ンー]+|[^\u4e00-\u9fffぁ-んァ-ンー]+/g) ?? [word]
}

function splitKanjiRun(run: string, readingSlice: string): RubySegment[] {
  const chars = [...run]
  if (chars.length === 1) return [{ base: chars[0], reading: readingSlice }]

  const readings = splitReadingByMoraTargets(readingSlice, chars.length)
  return chars.map((base, index) => ({
    base,
    reading: readings[index] ?? '',
  }))
}

function tryReadingPartsFromElements(
  word: string,
  reading: string,
  elements: Array<{ element: string }>,
): RubySegment[] | null {
  const hiraganaParts = elements
    .map((entry) => entry.element)
    .filter((part) => KANA_RE.test(part) && part !== reading)

  if (hiraganaParts.length < 2) return null
  if (hiraganaParts.join('') !== reading) return null

  const kanjiChars = [...word].filter((ch) => /[\u4e00-\u9fff々〆ヵヶ]/.test(ch))
  if (kanjiChars.length !== hiraganaParts.length) return null

  return kanjiChars.map((base, index) => ({
    base,
    reading: hiraganaParts[index],
  }))
}

export function buildRubySegments(
  word: string,
  reading: string,
  elements?: Array<{ element: string }>,
): RubySegment[] {
  if (!reading || reading === word) {
    return [{ base: word, reading: '' }]
  }

  if (elements?.length) {
    const fromElements = tryReadingPartsFromElements(word, reading, elements)
    if (fromElements) return fromElements
  }

  const segments = tokenizeWord(word)
  const result: RubySegment[] = []
  let readingPos = 0

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index]
    const remainder = reading.slice(readingPos)

    if (KANA_RE.test(segment)) {
      if (remainder.startsWith(segment)) {
        result.push({ base: segment, reading: segment })
        readingPos += segment.length
      } else {
        result.push({ base: segment, reading: remainder })
        readingPos = reading.length
      }
      continue
    }

    if (KANJI_RE.test(segment)) {
      const nextSegment = segments[index + 1]
      let readingSlice = remainder

      if (nextSegment && KANA_RE.test(nextSegment)) {
        const cut = remainder.indexOf(nextSegment)
        readingSlice = cut >= 0 ? remainder.slice(0, cut) : remainder
      }

      result.push(...splitKanjiRun(segment, readingSlice))
      readingPos += readingSlice.length
      continue
    }

    result.push({ base: segment, reading: '' })
  }

  return result.filter((segment) => segment.base || segment.reading)
}
