import { lessons } from '../data/lessons'
import { n3MoatVocab, n4MoatVocab, n5MoatVocab } from '../data/memoryMethods'
import type { Lesson, VocabItem } from '../types'

/** 子串重复但应保留的词条对（较长词 → 较短词） */
const SUBSTRING_DEDUPE_ALLOWLIST = new Set([
  '留学生|学生',
  '週末|週',
  'また明日|明日',
  '外にする|外',
  'だそうです|そうです',
  'ありますか|あります',
  '風邪薬|薬',
])

export type VocabSpan = {
  start: number
  end: number
  text: string
  item: VocabItem
}

function normalizeWord(value: string): string {
  return value.replace(/[～〜]/g, '').trim()
}

function shouldKeepDespiteSubstring(longer: string, shorter: string): boolean {
  return SUBSTRING_DEDUPE_ALLOWLIST.has(`${longer}|${shorter}`)
}

function dedupeLessonVocabulary(items: VocabItem[]): VocabItem[] {
  const kept: VocabItem[] = []

  for (const item of items) {
    if (!item.word) continue

    const redundant = kept.some((existing) => {
      if (existing.word === item.word) return true
      if (existing.word.includes(item.word)) {
        return !shouldKeepDespiteSubstring(existing.word, item.word)
      }
      if (item.word.includes(existing.word)) {
        return !shouldKeepDespiteSubstring(item.word, existing.word)
      }
      return false
    })

    if (!redundant) kept.push(item)
  }

  return kept
}

function getConjugationPrefixes(word: string): string[] {
  const w = normalizeWord(word)
  if (!w) return []

  const prefixes = new Set<string>([w])
  if (w.length >= 3) prefixes.add(w.slice(0, -1))

  const last = w.at(-1)
  if (!last) return [...prefixes].filter((value) => value.length >= 2)

  if (last === 'る' && w.length >= 2) {
    const stem = w.slice(0, -1)
    if (stem.length >= 1) prefixes.add(`${stem}っ`)
    if (stem.length >= 2) prefixes.add(stem)
    if (stem.length >= 1) prefixes.add(`${stem}て`)
    if (stem.length >= 1) prefixes.add(`${stem}た`)
  }

  const iStemSuffix: Record<string, string> = {
    く: 'き',
    ぐ: 'ぎ',
    す: 'し',
    つ: 'ち',
    ぬ: 'に',
    ぶ: 'び',
    む: 'み',
    る: 'り',
    う: 'い',
  }
  const iStem = iStemSuffix[last]
  if (iStem) {
    const stem = w.slice(0, -1)
    if (stem.length >= 1) prefixes.add(`${stem}${iStem}`)
    if (stem.length >= 2) prefixes.add(stem)
  }

  return [...prefixes]
    .filter((value) => value.length >= 2)
    .sort((a, b) => b.length - a.length)
}

function getMatchCandidates(item: VocabItem): string[] {
  const candidates = new Set<string>()
  if (item.word) candidates.add(item.word)
  const bare = item.word.replace(/^～/, '')
  if (bare) candidates.add(bare)
  if (item.reading && item.reading.length >= 2) candidates.add(item.reading)
  getConjugationPrefixes(item.word).forEach((prefix) => candidates.add(prefix))
  return [...candidates].sort((a, b) => b.length - a.length)
}

export function appearsInDialogue(item: VocabItem, dialogueText: string): boolean {
  if (!item.word || !dialogueText) return false
  return getMatchCandidates(item).some((candidate) => dialogueText.includes(candidate))
}

let globalVocabBank: VocabItem[] | null = null

function buildGlobalVocabBank(currentLessonId?: string): VocabItem[] {
  const byWord = new Map<string, VocabItem>()

  for (const entry of [...n5MoatVocab, ...n4MoatVocab, ...n3MoatVocab]) {
    const key = normalizeWord(entry.word)
    if (!key || byWord.has(key)) continue
    byWord.set(key, {
      word: entry.word,
      reading: entry.reading,
      meaning: entry.meaning,
    })
  }

  for (const lesson of lessons) {
    for (const item of lesson.vocabulary) {
      const key = normalizeWord(item.word)
      if (!key) continue
      byWord.set(key, item)
    }
  }

  if (currentLessonId) {
    const currentLesson = lessons.find((lesson) => lesson.id === currentLessonId)
    currentLesson?.vocabulary.forEach((item) => {
      const key = normalizeWord(item.word)
      if (!key) return
      byWord.set(key, item)
    })
  }

  return [...byWord.values()]
}

function getGlobalVocabBank(currentLessonId?: string): VocabItem[] {
  if (!currentLessonId && globalVocabBank) return globalVocabBank
  const bank = buildGlobalVocabBank(currentLessonId)
  if (!currentLessonId) globalVocabBank = bank
  return bank
}

export function getLessonDialogueText(lesson: Lesson | undefined): string {
  if (!lesson) return ''
  return lesson.dialogue.map((line) => line.ja).join(' ')
}

export function getLessonVocabulary(lesson: Lesson | undefined): VocabItem[] {
  if (!lesson) return []

  const dialogueText = getLessonDialogueText(lesson)
  const bank = getGlobalVocabBank(lesson.id)
  const matched: VocabItem[] = []
  const seen = new Set<string>()

  for (const item of bank.sort((a, b) => b.word.length - a.word.length)) {
    const key = normalizeWord(item.word)
    if (!key || seen.has(key)) continue
    if (!appearsInDialogue(item, dialogueText)) continue
    matched.push(item)
    seen.add(key)
  }

  return dedupeLessonVocabulary(matched).sort((a, b) => b.word.length - a.word.length)
}

export function findVocabSpansInSentence(sentence: string, vocabulary: VocabItem[]): VocabSpan[] {
  if (!sentence || vocabulary.length === 0) return []

  const occupied = new Array<boolean>(sentence.length).fill(false)
  const spans: VocabSpan[] = []
  const sorted = [...vocabulary].sort((a, b) => b.word.length - a.word.length)

  for (const item of sorted) {
    for (const candidate of getMatchCandidates(item)) {
      if (candidate.length < 2) continue

      let index = 0
      while (index <= sentence.length - candidate.length) {
        const start = sentence.indexOf(candidate, index)
        if (start < 0) break

        const end = start + candidate.length
        if (!occupied.slice(start, end).some(Boolean)) {
          spans.push({
            start,
            end,
            text: sentence.slice(start, end),
            item,
          })
          for (let i = start; i < end; i += 1) occupied[i] = true
          break
        }

        index = start + 1
      }
    }
  }

  return spans.sort((a, b) => a.start - b.start)
}
