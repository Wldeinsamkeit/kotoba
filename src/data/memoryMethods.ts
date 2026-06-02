import n5MemoryMethodsRaw from '../../data/memory_methods/n5/all_n5_memory_methods.json?raw'
import n4MemoryMethodsRaw from '../../data/memory_methods/n4/all_n4_memory_methods.json?raw'
import n3MemoryMethodsRaw from '../../data/memory_methods/n3/all_n3_memory_methods.json?raw'
import type { MoatVocabEntry } from '../types'

export type WordLevel = 'n5' | 'n4' | 'n3'

export type MemoryMethodEntry = {
  id: string
  word: string
  reading: string
  meaning: string
  elements: MoatVocabEntry['elements']
  mergedScene: string
  sceneScore?: {
    specific?: boolean
    emotional?: boolean
    personal?: boolean
    total?: number
  }
  reviewTip: string
  difficultyStars: 1 | 2 | 3
  exampleSentences?: Array<{
    ja: string
    zh: string
  }>
}

type RawMemoryMethodEntry = Omit<MemoryMethodEntry, 'id' | 'reviewTip' | 'difficultyStars'> & {
  id?: string
  reviewTip?: string
  reviewHint?: string
  sceneQuality?: string
  difficultyStars?: number
}

export const BATCH_SIZE = 40

export const MEMORY_METHOD_SOURCE_PATHS: Record<WordLevel, string> = {
  n5: 'data/memory_methods/n5/all_n5_memory_methods.json',
  n4: 'data/memory_methods/n4/all_n4_memory_methods.json',
  n3: 'data/memory_methods/n3/all_n3_memory_methods.json',
}

export function getMemoryMethodBatchSourcePath(level: WordLevel, batchNum: number): string {
  return `data/memory_methods/${level}/batch_${String(batchNum).padStart(2, '0')}_methods.json`
}

function clampDifficulty(value: number | undefined): 1 | 2 | 3 {
  if (value === 3) return 3
  if (value === 2) return 2
  return 1
}

function parseMemoryMethods(level: WordLevel, raw: string): RawMemoryMethodEntry[] {
  const rows: unknown = JSON.parse(raw)
  if (!Array.isArray(rows)) {
    throw new Error(`${level} memory methods must be a JSON array`)
  }
  return rows as RawMemoryMethodEntry[]
}

function sceneQualityFromScore(entry: RawMemoryMethodEntry) {
  if (entry.sceneQuality) return entry.sceneQuality
  const total = entry.sceneScore?.total ?? 0
  return total > 0 ? `具体化 · ${total}/3` : '待完善'
}

function normalizeMemoryMethods(level: WordLevel, rows: RawMemoryMethodEntry[]): MemoryMethodEntry[] {
  return rows.map((entry, index) => ({
    id: entry.id ?? `${level}-${String(index + 1).padStart(4, '0')}`,
    word: entry.word,
    reading: entry.reading,
    meaning: entry.meaning,
    elements: entry.elements,
    mergedScene: entry.mergedScene,
    sceneScore: entry.sceneScore,
    reviewTip: entry.reviewTip ?? entry.reviewHint ?? '',
    difficultyStars: clampDifficulty(entry.difficultyStars),
    exampleSentences: entry.exampleSentences,
  }))
}

function toMoatVocabEntry(entry: MemoryMethodEntry): MoatVocabEntry {
  return {
    id: entry.id,
    word: entry.word,
    reading: entry.reading,
    meaning: entry.meaning,
    elements: entry.elements,
    mergedScene: entry.mergedScene,
    sceneQuality: sceneQualityFromScore(entry),
    reviewHint: entry.reviewTip,
    difficultyStars: entry.difficultyStars,
  }
}

export const n5MemoryMethods = normalizeMemoryMethods('n5', parseMemoryMethods('n5', n5MemoryMethodsRaw))
export const n4MemoryMethods = normalizeMemoryMethods('n4', parseMemoryMethods('n4', n4MemoryMethodsRaw))
export const n3MemoryMethods = normalizeMemoryMethods('n3', parseMemoryMethods('n3', n3MemoryMethodsRaw))

export const memoryMethodsByLevel: Record<WordLevel, MemoryMethodEntry[]> = {
  n5: n5MemoryMethods,
  n4: n4MemoryMethods,
  n3: n3MemoryMethods,
}

export const n5MoatVocab = n5MemoryMethods.map(toMoatVocabEntry)
export const n4MoatVocab = n4MemoryMethods.map(toMoatVocabEntry)
export const n3MoatVocab = n3MemoryMethods.map(toMoatVocabEntry)

export function getMemoryMethodCount(level: WordLevel): number {
  return memoryMethodsByLevel[level].length
}

export function getMemoryMethodBatchCount(level: WordLevel): number {
  const total = getMemoryMethodCount(level)
  return total > 0 ? Math.ceil(total / BATCH_SIZE) : 0
}

export function getMemoryMethodBatch(level: WordLevel, batchNum: number) {
  const start = (batchNum - 1) * BATCH_SIZE
  return memoryMethodsByLevel[level].slice(start, start + BATCH_SIZE)
}
