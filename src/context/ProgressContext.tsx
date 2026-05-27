import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { StoredProgress } from '../types'
import {
  addWrong,
  bumpStreak,
  hasQuizPassed,
  loadProgress,
  markLessonComplete,
  markChapterComplete,
  removeWrong,
  saveProgress,
  setQuizStats,
  setChapterReadPosition as setChapterReadPositionInternal,
  addReadingTime,
  setDailyReadingGoal,
  toggleBookmark,
  addVocabulary,
  removeVocabulary,
  addAffinityPoints,
} from '../lib/progress'
import { checkAchievements, getAchievementById } from '../lib/achievements'
import { getXPReward, getLevelFromXP, checkLevelUp } from '../lib/xpSystem'
import { triggerXPToast } from '../components/XPToast'
import { triggerAchievementToast } from '../components/AchievementToast'
import { triggerLevelUpCelebration } from '../components/LevelUpCelebration'
import { todayLocal } from '../lib/dates'

type ProgressContextValue = {
  progress: StoredProgress
  refresh: () => void
  recordActivity: () => void
  completeLesson: (lessonId: string, characterIds?: string[]) => void
  completeChapter: (chapterId: string) => void
  setChapterReadPosition: (chapterId: string, lastParagraphIndex: number) => void
  registerQuizResult: (
    lessonId: string,
    results: { questionId: string; correct: boolean }[],
  ) => void
  clearWrong: (lessonId: string, questionId: string) => void
  addReadingTime: (date: string, minutes: number) => void
  setDailyReadingGoal: (goal: number) => void
  toggleBookmark: (chapterId: string, paragraphIndex: number) => void
  addVocabulary: (
    word: string,
    reading: string,
    meaning: string,
    context?: string,
    bookId?: string,
    chapterId?: string,
  ) => void
  removeVocabulary: (word: string) => void
  addXP: (amount: number, source: string) => void
  addAffinity: (characterId: string, points: number) => void
  checkAndUnlockAchievements: () => void
  completeDailyTask: (taskId: string) => void
  showLevelUpNotification: boolean
  setShowLevelUpNotification: (show: boolean) => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<StoredProgress>(() => {
    const loaded = loadProgress()
    return {
      ...loaded,
      totalXP: loaded.totalXP ?? 0,
      level: loaded.level ?? 1,
      unlockedAchievements: loaded.unlockedAchievements ?? [],
      completedDailyTasks: loaded.completedDailyTasks ?? {},
      characterAffinity: loaded.characterAffinity ?? {},
    }
  })
  const [showLevelUpNotification, setShowLevelUpNotification] = useState(false)
  const checkedRef = useRef(false)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  // Check achievements on mount and after progress changes
  useEffect(() => {
    if (checkedRef.current) {
      const newAchievements = checkAchievements(progress)
      if (newAchievements.length > 0) {
        setProgress((p) => {
          let xpGain = 0
          newAchievements.forEach((id) => {
            const a = getAchievementById(id)
            if (a) xpGain += a.xpReward
          })
          const oldXP = p.totalXP ?? 0
          const newXP = oldXP + xpGain
          const newLevel = getLevelFromXP(newXP)
          if (checkLevelUp(oldXP, newXP)) {
            triggerLevelUpCelebration(newLevel)
          }
          if (xpGain > 0) triggerXPToast(xpGain, 'achievement')
          return {
            ...p,
            totalXP: newXP,
            level: newLevel,
            unlockedAchievements: [...(p.unlockedAchievements ?? []), ...newAchievements],
          }
        })
        newAchievements.forEach((id) => {
          const a = getAchievementById(id)
          if (a) triggerAchievementToast(a)
        })
      }
    }
    checkedRef.current = true
  }, [progress.completedLessonIds.length, progress.streak, progress.unlockedAchievements.length])

  const refresh = useCallback(() => {
    setProgress(loadProgress())
  }, [])

  const recordActivity = useCallback(() => {
    setProgress((p) => bumpStreak({ ...p }))
  }, [])

  const completeLesson = useCallback((lessonId: string, characterIds?: string[]) => {
    setProgress((p) => {
      if (p.completedLessonIds.includes(lessonId)) return p
      const updated = bumpStreak(markLessonComplete({ ...p }, lessonId))
      const xp = getXPReward('COMPLETE_LESSON')
      const newXP = (updated.totalXP ?? 0) + xp
      const newLevel = getLevelFromXP(newXP)

      if (checkLevelUp(updated.totalXP ?? 0, newXP)) {
        triggerLevelUpCelebration(newLevel)
      }
      triggerXPToast(xp, 'lesson')

      // Add affinity to characters in this lesson
      let withAffinity = updated
      if (characterIds) {
        for (const cid of characterIds) {
          const result = addAffinityPoints(withAffinity, cid, 20)
          withAffinity = result.progress
        }
      }

      return {
        ...withAffinity,
        totalXP: newXP,
        level: newLevel,
      }
    })
  }, [])

  const completeChapter = useCallback((chapterId: string) => {
    setProgress((p) => {
      if (p.completedChapterIds.includes(chapterId)) return p
      const updated = bumpStreak(markChapterComplete({ ...p }, chapterId))
      const xp = getXPReward('COMPLETE_CHAPTER')
      const newXP = (updated.totalXP ?? 0) + xp
      const newLevel = getLevelFromXP(newXP)
      if (checkLevelUp(updated.totalXP ?? 0, newXP)) {
        triggerLevelUpCelebration(newLevel)
      }
      triggerXPToast(xp, 'chapter')
      return { ...updated, totalXP: newXP, level: newLevel }
    })
  }, [])

  const setChapterReadPosition = useCallback(
    (chapterId: string, lastParagraphIndex: number) => {
      setProgress((p) =>
        setChapterReadPositionInternal(p, chapterId, lastParagraphIndex),
      )
    },
    [],
  )

  const registerQuizResult = useCallback(
    (lessonId: string, results: { questionId: string; correct: boolean }[]) => {
      setProgress((p) => {
        let next = { ...p }
        const correct = results.filter((r) => r.correct).length
        const total = results.length
        next = setQuizStats(next, lessonId, correct, total)
        if (hasQuizPassed({ correct, total })) {
          next = markLessonComplete(next, lessonId)
        }
        for (const r of results) {
          if (r.correct) {
            next = removeWrong(next, lessonId, r.questionId)
          } else {
            next = addWrong(next, lessonId, r.questionId)
          }
        }
        next = bumpStreak(next)

        // Award XP for correct answers
        const correctXP = correct * getXPReward('QUIZ_CORRECT')
        const perfectXP = correct === total && total > 0 ? getXPReward('PERFECT_QUIZ') : 0
        const totalQuizXP = correctXP + perfectXP

        if (totalQuizXP > 0) {
          const oldXP = next.totalXP ?? 0
          const newXP = oldXP + totalQuizXP
          const newLevel = getLevelFromXP(newXP)
          if (checkLevelUp(oldXP, newXP)) {
            triggerLevelUpCelebration(newLevel)
          }
          next = { ...next, totalXP: newXP, level: newLevel }
          triggerXPToast(totalQuizXP, 'quiz')
        }

        return next
      })
    },
    [],
  )

  const clearWrong = useCallback((lessonId: string, questionId: string) => {
    setProgress((p) => removeWrong({ ...p }, lessonId, questionId))
  }, [])

  const addReadingTimeCallback = useCallback((date: string, minutes: number) => {
    setProgress((p) => {
      const updated = addReadingTime({ ...p }, date, minutes)
      const xp = getXPReward('READING_MINUTE') * minutes
      if (xp > 0) {
        const oldXP = updated.totalXP ?? 0
        const newXP = oldXP + xp
        const newLevel = getLevelFromXP(newXP)
        if (checkLevelUp(oldXP, newXP)) triggerLevelUpCelebration(newLevel)
        return { ...updated, totalXP: newXP, level: newLevel }
      }
      return updated
    })
  }, [])

  const setDailyReadingGoalCallback = useCallback((goal: number) => {
    setProgress((p) => setDailyReadingGoal({ ...p }, goal))
  }, [])

  const toggleBookmarkCallback = useCallback(
    (chapterId: string, paragraphIndex: number) => {
      setProgress((p) => toggleBookmark({ ...p }, chapterId, paragraphIndex))
    },
    [],
  )

  const addVocabularyCallback = useCallback(
    (
      word: string,
      reading: string,
      meaning: string,
      context?: string,
      bookId?: string,
      chapterId?: string,
    ) => {
      setProgress((p) => {
        if (p.vocabularyBook[word]) return p
        const updated = addVocabulary({ ...p }, word, reading, meaning, context, bookId, chapterId)
        const xp = getXPReward('ADD_VOCABULARY')
        const oldXP = updated.totalXP ?? 0
        const newXP = oldXP + xp
        const newLevel = getLevelFromXP(newXP)
        if (checkLevelUp(oldXP, newXP)) triggerLevelUpCelebration(newLevel)
        triggerXPToast(xp, 'vocabulary')
        return { ...updated, totalXP: newXP, level: newLevel }
      })
    },
    [],
  )

  const removeVocabularyCallback = useCallback((word: string) => {
    setProgress((p) => removeVocabulary({ ...p }, word))
  }, [])

  const addXPCallback = useCallback((amount: number, _source: string) => {
    setProgress((p) => {
      const oldXP = p.totalXP ?? 0
      const newXP = oldXP + amount
      const newLevel = getLevelFromXP(newXP)
      if (checkLevelUp(oldXP, newXP)) {
        triggerLevelUpCelebration(newLevel)
      }
      return { ...p, totalXP: newXP, level: newLevel }
    })
  }, [])

  const addAffinityCallback = useCallback((characterId: string, points: number) => {
    setProgress((p) => {
      const result = addAffinityPoints(p, characterId, points)
      return result.progress
    })
  }, [])

  const checkAndUnlockAchievementsCallback = useCallback(() => {
    setProgress((p) => {
      const newAchievements = checkAchievements(p)
      if (newAchievements.length > 0) {
        let xpGain = 0
        newAchievements.forEach((id) => {
          const a = getAchievementById(id)
          if (a) {
            xpGain += a.xpReward
            triggerAchievementToast(a)
          }
        })
        const oldXP = p.totalXP ?? 0
        const newXP = oldXP + xpGain
        const newLevel = getLevelFromXP(newXP)
        if (checkLevelUp(oldXP, newXP)) {
          triggerLevelUpCelebration(newLevel)
        }
        if (xpGain > 0) triggerXPToast(xpGain, 'achievement')
        return {
          ...p,
          totalXP: newXP,
          level: newLevel,
          unlockedAchievements: [...(p.unlockedAchievements ?? []), ...newAchievements],
        }
      }
      return p
    })
  }, [])

  const completeDailyTask = useCallback((taskId: string) => {
    const today = todayLocal()
    setProgress((p) => {
      const todayTasks = p.completedDailyTasks[today] ?? []
      if (todayTasks.includes(taskId)) return p
      return {
        ...p,
        completedDailyTasks: {
          ...p.completedDailyTasks,
          [today]: [...todayTasks, taskId],
        },
      }
    })
  }, [])

  const value = useMemo(
    () => ({
      progress,
      refresh,
      recordActivity,
      completeLesson,
      completeChapter,
      setChapterReadPosition,
      registerQuizResult,
      clearWrong,
      addReadingTime: addReadingTimeCallback,
      setDailyReadingGoal: setDailyReadingGoalCallback,
      toggleBookmark: toggleBookmarkCallback,
      addVocabulary: addVocabularyCallback,
      removeVocabulary: removeVocabularyCallback,
      addXP: addXPCallback,
      addAffinity: addAffinityCallback,
      checkAndUnlockAchievements: checkAndUnlockAchievementsCallback,
      completeDailyTask,
      showLevelUpNotification,
      setShowLevelUpNotification,
    }),
    [
      progress,
      refresh,
      recordActivity,
      completeLesson,
      completeChapter,
      setChapterReadPosition,
      registerQuizResult,
      clearWrong,
      addReadingTimeCallback,
      setDailyReadingGoalCallback,
      toggleBookmarkCallback,
      addVocabularyCallback,
      removeVocabularyCallback,
      addXPCallback,
      addAffinityCallback,
      checkAndUnlockAchievementsCallback,
      completeDailyTask,
      showLevelUpNotification,
    ],
  )

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
