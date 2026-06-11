import type { CollectedWordCard, StoredProgress, CharacterAffinity, VocabItem } from '../types'
import { createCollectedWordCard } from './wordCards'
import { todayLocal, yesterdayLocal } from './dates'

const KEY = 'nihongo-daily-progress-v1'
export const LESSON_PASS_RATE = 0.6

const defaultProgress: StoredProgress = {
  completedLessonIds: [],
  wrongByLesson: {},
  completedChapterIds: [],
  lastReadByChapter: {},
  lastActiveDate: null,
  streak: 0,
  quizStats: {},
  readingTimeByDate: {},
  dailyReadingGoal: 15,
  bookmarks: {},
  vocabularyBook: {},
  totalXP: 0,
  level: 1,
  unlockedAchievements: [],
  completedDailyTasks: {},
  characterAffinity: {},
  collectedWordCards: {},
}

export function loadProgress(): StoredProgress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaultProgress }
    const parsed = JSON.parse(raw) as StoredProgress
    return {
      ...defaultProgress,
      ...parsed,
      wrongByLesson: parsed.wrongByLesson ?? {},
      quizStats: parsed.quizStats ?? {},
      completedChapterIds: parsed.completedChapterIds ?? [],
      lastReadByChapter: parsed.lastReadByChapter ?? {},
      readingTimeByDate: parsed.readingTimeByDate ?? {},
      dailyReadingGoal: parsed.dailyReadingGoal ?? 15,
      bookmarks: parsed.bookmarks ?? {},
      vocabularyBook: parsed.vocabularyBook ?? {},
      characterAffinity: parsed.characterAffinity ?? {},
      collectedWordCards: parsed.collectedWordCards ?? {},
    }
  } catch {
    return { ...defaultProgress }
  }
}

export function saveProgress(p: StoredProgress): void {
  localStorage.setItem(KEY, JSON.stringify(p))
}

/** 完成任意学习行为时调用，更新连续打卡 */
export function bumpStreak(p: StoredProgress): StoredProgress {
  const today = todayLocal()
  if (p.lastActiveDate === today) return p

  let streak = 1
  if (p.lastActiveDate === yesterdayLocal()) {
    streak = (p.streak || 0) + 1
  }

  return {
    ...p,
    lastActiveDate: today,
    streak,
  }
}

export function addWrong(
  p: StoredProgress,
  lessonId: string,
  questionId: string,
): StoredProgress {
  const prev = p.wrongByLesson[lessonId] ?? []
  if (prev.includes(questionId)) return p
  return {
    ...p,
    wrongByLesson: {
      ...p.wrongByLesson,
      [lessonId]: [...prev, questionId],
    },
  }
}

export function removeWrong(
  p: StoredProgress,
  lessonId: string,
  questionId: string,
): StoredProgress {
  const prev = p.wrongByLesson[lessonId] ?? []
  const next = prev.filter((id) => id !== questionId)
  const wrongByLesson = { ...p.wrongByLesson }
  if (next.length === 0) delete wrongByLesson[lessonId]
  else wrongByLesson[lessonId] = next
  return { ...p, wrongByLesson }
}

export function markLessonComplete(
  p: StoredProgress,
  lessonId: string,
): StoredProgress {
  if (p.completedLessonIds.includes(lessonId)) return p
  return {
    ...p,
    completedLessonIds: [...p.completedLessonIds, lessonId],
  }
}

export function hasQuizPassed(
  stat: { correct: number; total: number } | undefined,
): boolean {
  return Boolean(stat && stat.total > 0 && stat.correct / stat.total >= LESSON_PASS_RATE)
}

export function hasLessonPassed(
  p: StoredProgress,
  lessonId: string,
): boolean {
  return p.completedLessonIds.includes(lessonId) || hasQuizPassed(p.quizStats[lessonId])
}

export function setQuizStats(
  p: StoredProgress,
  lessonId: string,
  correct: number,
  total: number,
): StoredProgress {
  return {
    ...p,
    quizStats: {
      ...p.quizStats,
      [lessonId]: { correct, total },
    },
  }
}

export function markChapterComplete(
  p: StoredProgress,
  chapterId: string,
): StoredProgress {
  if (p.completedChapterIds.includes(chapterId)) return p
  return {
    ...p,
    completedChapterIds: [...p.completedChapterIds, chapterId],
  }
}

export function setChapterReadPosition(
  p: StoredProgress,
  chapterId: string,
  lastParagraphIndex: number,
): StoredProgress {
  return {
    ...p,
    lastReadByChapter: {
      ...p.lastReadByChapter,
      [chapterId]: { lastParagraphIndex },
    },
  }
}

/** 记录阅读时间（分钟） */
export function addReadingTime(
  p: StoredProgress,
  date: string,
  minutes: number,
): StoredProgress {
  const current = p.readingTimeByDate[date] ?? 0
  return {
    ...p,
    readingTimeByDate: {
      ...p.readingTimeByDate,
      [date]: current + minutes,
    },
  }
}

/** 设置每日阅读目标 */
export function setDailyReadingGoal(
  p: StoredProgress,
  goal: number,
): StoredProgress {
  return {
    ...p,
    dailyReadingGoal: goal,
  }
}

/** 添加/移除书签 */
export function toggleBookmark(
  p: StoredProgress,
  chapterId: string,
  paragraphIndex: number,
): StoredProgress {
  const hasBookmark = p.bookmarks[chapterId] === paragraphIndex
  const bookmarks = { ...p.bookmarks }
  if (hasBookmark) {
    delete bookmarks[chapterId]
  } else {
    bookmarks[chapterId] = paragraphIndex
  }
  return { ...p, bookmarks }
}

/** 添加生词到生词本 */
export function addVocabulary(
  p: StoredProgress,
  word: string,
  reading: string,
  meaning: string,
  context?: string,
  bookId: string = '',
  chapterId: string = '',
): StoredProgress {
  if (p.vocabularyBook[word]) return p
  return {
    ...p,
    vocabularyBook: {
      ...p.vocabularyBook,
      [word]: {
        reading,
        meaning,
        context,
        bookId,
        chapterId,
        addedAt: new Date().toISOString(),
      },
    },
  }
}

/** 收入课程词卡到羁绊背包 */
export function collectWordCard(
  p: StoredProgress,
  lessonId: string,
  lessonTitle: string,
  vocab: VocabItem,
): { progress: StoredProgress; isNew: boolean; card: CollectedWordCard } {
  const card = createCollectedWordCard(lessonId, lessonTitle, vocab)
  if (p.collectedWordCards[card.id]) {
    return { progress: p, isNew: false, card: p.collectedWordCards[card.id] }
  }
  return {
    progress: {
      ...p,
      collectedWordCards: {
        ...p.collectedWordCards,
        [card.id]: card,
      },
    },
    isNew: true,
    card,
  }
}

/** 从生词本移除单词 */
export function removeVocabulary(
  p: StoredProgress,
  word: string,
): StoredProgress {
  const vocabularyBook = { ...p.vocabularyBook }
  delete vocabularyBook[word]
  return { ...p, vocabularyBook }
}

// ---- 好感度系统 ----

const AFFINITY_LEVELS = [
  { level: 1, threshold: 0, title: '初识' },
  { level: 2, threshold: 50, title: '眼熟' },
  { level: 3, threshold: 150, title: '认识' },
  { level: 4, threshold: 300, title: '熟悉' },
  { level: 5, threshold: 500, title: '朋友' },
  { level: 6, threshold: 800, title: '好友' },
  { level: 7, threshold: 1200, title: '挚友' },
  { level: 8, threshold: 1800, title: '知己' },
  { level: 9, threshold: 2500, title: '亲密' },
  { level: 10, threshold: 3500, title: '羁绊' },
]

export function getAffinityLevel(points: number): { level: number; title: string; nextThreshold: number } {
  let current = AFFINITY_LEVELS[0]
  for (let i = AFFINITY_LEVELS.length - 1; i >= 0; i--) {
    if (points >= AFFINITY_LEVELS[i].threshold) {
      current = AFFINITY_LEVELS[i]
      break
    }
  }
  const nextIndex = AFFINITY_LEVELS.findIndex((l) => l.level === current.level + 1)
  const nextThreshold = nextIndex >= 0 ? AFFINITY_LEVELS[nextIndex].threshold : current.threshold
  return { level: current.level, title: current.title, nextThreshold }
}

export function addAffinityPoints(
  p: StoredProgress,
  characterId: string,
  points: number,
): { progress: StoredProgress; leveledUp: boolean } {
  const today = todayLocal()
  const prev = p.characterAffinity[characterId] ?? {
    points: 0,
    level: 1,
    interactions: 0,
    lastInteraction: '',
  }
  const newPoints = prev.points + points
  const oldLevel = getAffinityLevel(prev.points).level
  const newLevel = getAffinityLevel(newPoints).level

  const updated: CharacterAffinity = {
    points: newPoints,
    level: newLevel,
    interactions: prev.interactions + 1,
    lastInteraction: today,
  }

  return {
    progress: {
      ...p,
      characterAffinity: {
        ...p.characterAffinity,
        [characterId]: updated,
      },
    },
    leveledUp: newLevel > oldLevel,
  }
}

export { AFFINITY_LEVELS }
