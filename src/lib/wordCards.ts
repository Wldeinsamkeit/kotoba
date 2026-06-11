import type { CollectedWordCard, StoredProgress, VocabItem, WordCardCategory } from '../types'
import { getWordCardCategory, WORD_CARD_CATEGORY_ORDER } from './wordCardCategory'

export function buildWordCardId(lessonId: string, word: string): string {
  return `${lessonId}::${word}`
}

export function listCollectedWordCards(
  progress: StoredProgress,
): CollectedWordCard[] {
  return Object.values(progress.collectedWordCards ?? {}).sort((a, b) =>
    b.collectedAt.localeCompare(a.collectedAt),
  )
}

export function hasCollectedWordCard(
  progress: StoredProgress,
  lessonId: string,
  word: string,
): boolean {
  return Boolean(progress.collectedWordCards?.[buildWordCardId(lessonId, word)])
}

export function groupCollectedWordCards(
  cards: CollectedWordCard[],
): Record<WordCardCategory, CollectedWordCard[]> {
  const grouped = Object.fromEntries(
    WORD_CARD_CATEGORY_ORDER.map((category) => [category, [] as CollectedWordCard[]]),
  ) as Record<WordCardCategory, CollectedWordCard[]>

  cards.forEach((card) => {
    grouped[card.category].push(card)
  })

  return grouped
}

export function createCollectedWordCard(
  lessonId: string,
  lessonTitle: string,
  vocab: VocabItem,
): CollectedWordCard {
  const id = buildWordCardId(lessonId, vocab.word)
  return {
    id,
    word: vocab.word,
    reading: vocab.reading ?? '',
    meaning: vocab.meaning,
    category: getWordCardCategory(vocab),
    lessonId,
    lessonTitle,
    collectedAt: new Date().toISOString(),
  }
}
