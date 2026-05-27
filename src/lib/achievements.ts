export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  requirement: (progress: any) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-lesson',
    name: '初出茅庐',
    description: '完成第一课',
    icon: '🌱',
    xpReward: 50,
    requirement: (progress) => progress.completedLessonIds.length >= 1
  },
  {
    id: 'lesson-5',
    name: '渐入佳境',
    description: '完成5课',
    icon: '📚',
    xpReward: 100,
    requirement: (progress) => progress.completedLessonIds.length >= 5
  },
  {
    id: 'lesson-10',
    name: '勤学苦练',
    description: '完成10课',
    icon: '🎓',
    xpReward: 200,
    requirement: (progress) => progress.completedLessonIds.length >= 10
  },
  {
    id: 'streak-3',
    name: '持之以恒',
    description: '连续学习3天',
    icon: '🔥',
    xpReward: 75,
    requirement: (progress) => progress.streak >= 3
  },
  {
    id: 'streak-7',
    name: '七日达人',
    description: '连续学习7天',
    icon: '⭐',
    xpReward: 150,
    requirement: (progress) => progress.streak >= 7
  },
  {
    id: 'streak-30',
    name: '月度冠军',
    description: '连续学习30天',
    icon: '👑',
    xpReward: 500,
    requirement: (progress) => progress.streak >= 30
  },
  {
    id: 'perfect-score',
    name: '满分王者',
    description: '在任何测验中获得满分',
    icon: '💯',
    xpReward: 100,
    requirement: (progress) => {
      return Object.values(progress.quizStats).some(
        (stat: any) => stat.correct === stat.total && stat.total > 0
      )
    }
  },
  {
    id: 'vocabulary-10',
    name: '词汇积累者',
    description: '收集10个生词',
    icon: '📝',
    xpReward: 50,
    requirement: (progress) => Object.keys(progress.vocabularyBook).length >= 10
  },
  {
    id: 'vocabulary-50',
    name: '词汇大师',
    description: '收集50个生词',
    icon: '📖',
    xpReward: 150,
    requirement: (progress) => Object.keys(progress.vocabularyBook).length >= 50
  },
  {
    id: 'reading-1-chapter',
    name: '阅读新手',
    description: '完成第一章阅读',
    icon: '📕',
    xpReward: 50,
    requirement: (progress) => progress.completedChapterIds.length >= 1
  },
  {
    id: 'reading-10-chapters',
    name: '书虫',
    description: '完成10章阅读',
    icon: '📗',
    xpReward: 150,
    requirement: (progress) => progress.completedChapterIds.length >= 10
  },
  {
    id: 'reading-goal-7',
    name: '目标达成者',
    description: '连续7天完成阅读目标',
    icon: '🎯',
    xpReward: 200,
    requirement: (progress) => {
      const goal = progress.dailyReadingGoal
      const last7Days = getLastNDays(7)
      return last7Days.every(date => {
        const time = progress.readingTimeByDate[date] || 0
        return time >= goal
      })
    }
  }
]

function getLastNDays(n: number): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = 0; i < n; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}

export function checkAchievements(progress: any): string[] {
  const newAchievements: string[] = []

  for (const achievement of ACHIEVEMENTS) {
    if (!progress.unlockedAchievements.includes(achievement.id)) {
      if (achievement.requirement(progress)) {
        newAchievements.push(achievement.id)
      }
    }
  }

  return newAchievements
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a: Achievement) => a.id === id)
}

export function getUnlockedAchievements(progress: any): Achievement[] {
  return progress.unlockedAchievements
    .map((id: string) => getAchievementById(id))
    .filter((a: Achievement | undefined): a is Achievement => a !== undefined)
}

export function getLockedAchievements(progress: any): Achievement[] {
  const unlockedIds = new Set(progress.unlockedAchievements)
  return ACHIEVEMENTS.filter((a: Achievement) => !unlockedIds.has(a.id))
}
