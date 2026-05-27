type SRSCardState = {
  wordId: string
  level: number
  nextReview: number
  lastReview: number | null
  totalReviews: number
  correctReviews: number
}

type SRSData = {
  cards: Record<string, SRSCardState>
  dailyStats: Record<string, { newCount: number; reviewedCount: number; correctCount: number }>
  streak: number
  lastStudyDate: string | null
}

const STORAGE_KEY = 'nihongo-srs-v1'

const INTERVALS = [
  4 * 60 * 1000,
  10 * 60 * 1000,
  30 * 60 * 1000,
  1 * 24 * 60 * 60 * 1000,
  2 * 24 * 60 * 60 * 1000,
  4 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  15 * 24 * 60 * 60 * 1000,
  30 * 24 * 60 * 60 * 1000,
  60 * 24 * 60 * 60 * 1000,
]

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function load(): SRSData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { cards: {}, dailyStats: {}, streak: 0, lastStudyDate: null }
}

function save(data: SRSData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export type SRSReviewResult = 'forgot' | 'hard' | 'ok' | 'easy'

function updateStreak(data: SRSData): void {
  const today = todayKey()
  const yesterday = yesterdayKey()
  if (data.lastStudyDate === today) return
  if (data.lastStudyDate === yesterday) {
    data.streak += 1
  } else if (data.lastStudyDate !== today) {
    data.streak = 1
  }
  data.lastStudyDate = today
}

export function getSRS() {
  const data = load()

  function getDueCards(allWordIds: string[]): string[] {
    const now = Date.now()
    return allWordIds.filter((id) => {
      const card = data.cards[id]
      if (!card) return true
      if (card.nextReview <= now) return true
      return false
    })
  }

  function getCardState(wordId: string): SRSCardState | null {
    return data.cards[wordId] ?? null
  }

  function isNew(wordId: string): boolean {
    return !data.cards[wordId]
  }

  function recordReview(wordId: string, result: SRSReviewResult): void {
    const today = todayKey()
    if (!data.dailyStats[today]) {
      data.dailyStats[today] = { newCount: 0, reviewedCount: 0, correctCount: 0 }
    }
    const stats = data.dailyStats[today]

    if (!data.cards[wordId]) {
      data.cards[wordId] = {
        wordId,
        level: 0,
        nextReview: 0,
        lastReview: null,
        totalReviews: 0,
        correctReviews: 0,
      }
      stats.newCount += 1
    }

    const card = data.cards[wordId]
    const isCorrect = result === 'ok' || result === 'easy'
    card.totalReviews += 1
    stats.reviewedCount += 1

    if (isCorrect) {
      card.correctReviews += 1
      stats.correctCount += 1
      const jump = result === 'easy' ? 2 : 1
      card.level = Math.min(card.level + jump, INTERVALS.length - 1)
    } else {
      if (result === 'hard') {
        card.level = Math.max(0, card.level - 1)
      } else {
        card.level = 0
      }
    }

    card.nextReview = Date.now() + INTERVALS[card.level]
    card.lastReview = Date.now()

    updateStreak(data)
    save(data)
  }

  function getStats() {
    const today = todayKey()
    const todayStats = data.dailyStats[today] ?? { newCount: 0, reviewedCount: 0, correctCount: 0 }
    const allCards = Object.values(data.cards)
    const mastered = allCards.filter((c) => c.level >= 5).length
    const learning = allCards.filter((c) => c.level > 0 && c.level < 5).length

    return {
      todayNew: todayStats.newCount,
      todayReviewed: todayStats.reviewedCount,
      todayCorrect: todayStats.correctCount,
      streak: data.streak,
      mastered,
      learning,
      total: allCards.length,
    }
  }

  return {
    getDueCards,
    getCardState,
    recordReview,
    getStats,
    isNew,
  }
}

export type { SRSCardState }
