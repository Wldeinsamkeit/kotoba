import { n4MoatVocab } from '../data/n4MoatVocab'
import { n5MoatVocab } from '../data/n5MoatVocab'
import type { MoatMemoryElement, MoatVocabEntry, VocabItem } from '../types'

export type LessonMemorySource = 'N5' | 'N4' | '课程生成'

export type LessonMemory = {
  source: LessonMemorySource
  word: string
  reading: string
  meaning: string
  elements: MoatMemoryElement[]
  mergedScene: string
  reviewHint: string
  difficultyStars: 1 | 2 | 3
  matchedEntry?: MoatVocabEntry
}

const memoryEntries = [
  ...n5MoatVocab.map((entry) => ({ entry, source: 'N5' as const })),
  ...n4MoatVocab.map((entry) => ({ entry, source: 'N4' as const })),
]

const exactIndex = new Map<string, (typeof memoryEntries)[number]>()
const wordIndex = new Map<string, (typeof memoryEntries)[number]>()
const normalizedIndex = new Map<string, (typeof memoryEntries)[number]>()

function normalizeWord(value: string): string {
  return value
    .replace(/[～〜]/g, '')
    .replace(/[。、，,./・\s]/g, '')
    .trim()
}

function key(word: string, reading?: string): string {
  return `${normalizeWord(word)}|${normalizeWord(reading ?? '')}`
}

for (const item of memoryEntries) {
  const word = normalizeWord(item.entry.word)
  const reading = normalizeWord(item.entry.reading)
  const exactKey = key(item.entry.word, item.entry.reading)
  if (!exactIndex.has(exactKey)) exactIndex.set(exactKey, item)
  if (!wordIndex.has(word)) wordIndex.set(word, item)
  if (reading && !normalizedIndex.has(reading)) normalizedIndex.set(reading, item)
}

function buildFallbackMemory(vocab: VocabItem): LessonMemory {
  const reading = vocab.reading || vocab.word
  const hasKanji = /[\u4e00-\u9fff]/.test(vocab.word)
  const elements: MoatMemoryElement[] = hasKanji
    ? [
        {
          element: vocab.word,
          method: 'TYPE A1',
          bridgeC: `${vocab.word} 含汉字，先用汉字直觉绑定核心意思“${vocab.meaning}”。`,
        },
        {
          element: reading,
          method: 'TYPE B2',
          bridgeC: `${reading} 先按课堂原句多读几遍，再把读音钉到“${vocab.meaning}”这个场景上。`,
        },
      ]
    : [
        {
          element: reading,
          method: 'TYPE B2',
          bridgeC: `${reading} 暂时不硬凑单个汉字，优先用课堂语境记住它表示“${vocab.meaning}”。`,
        },
      ]

  return {
    source: '课程生成',
    word: vocab.word,
    reading,
    meaning: vocab.meaning,
    elements,
    mergedScene: `在本课对话里遇到「${vocab.word}」时，先读作 ${reading}，再把它和“${vocab.meaning}”这个具体课堂场景绑定起来。`,
    reviewHint: `${reading} - 课堂语境绑定 - 在本单元中表示“${vocab.meaning}”。`,
    difficultyStars: hasKanji ? 2 : 1,
  }
}

export function getLessonMemory(vocab: VocabItem): LessonMemory {
  const exact = exactIndex.get(key(vocab.word, vocab.reading))
  const word = wordIndex.get(normalizeWord(vocab.word))
  const reading = vocab.reading ? normalizedIndex.get(normalizeWord(vocab.reading)) : undefined
  const hit = exact ?? word ?? reading

  if (!hit) return buildFallbackMemory(vocab)

  return {
    source: hit.source,
    word: hit.entry.word,
    reading: hit.entry.reading,
    meaning: hit.entry.meaning,
    elements: hit.entry.elements,
    mergedScene: hit.entry.mergedScene,
    reviewHint: hit.entry.reviewHint,
    difficultyStars: hit.entry.difficultyStars,
    matchedEntry: hit.entry,
  }
}
