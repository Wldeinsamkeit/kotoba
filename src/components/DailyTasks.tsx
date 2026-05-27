import { useState } from 'react'
import { todayLocal } from '../lib/dates'
import type { StoredProgress } from '../types'

export type DailyTask = {
  id: string
  label: string
  icon: string
  xpReward: number
  check: (progress: StoredProgress, context?: DailyTaskContext) => boolean
}

export type DailyTaskContext = {
  dialogueCompleted?: boolean
  wordsCollected?: number
  shadowCount?: number
  quizCompleted?: boolean
}

const DAILY_TASKS: DailyTask[] = [
  {
    id: 'daily-dialogue',
    label: '今日对话',
    icon: '💬',
    xpReward: 15,
    check: (_p, ctx) => ctx?.dialogueCompleted === true,
  },
  {
    id: 'daily-vocab',
    label: '词汇猎人',
    icon: '📝',
    xpReward: 10,
    check: (_p, ctx) => (ctx?.wordsCollected ?? 0) >= 5,
  },
  {
    id: 'daily-shadow',
    label: '跟读达人',
    icon: '🎤',
    xpReward: 10,
    check: (_p, ctx) => (ctx?.shadowCount ?? 0) >= 3,
  },
  {
    id: 'daily-quiz',
    label: '测验挑战',
    icon: '🎯',
    xpReward: 15,
    check: (_p, ctx) => ctx?.quizCompleted === true,
  },
]

export function getDailyTasks() {
  return DAILY_TASKS
}

export function isAllDailyDone(progress: StoredProgress, ctx?: DailyTaskContext): boolean {
  return DAILY_TASKS.every((t) => t.check(progress, ctx))
}

export function DailyTasksCard({
  progress,
  context,
}: {
  progress: StoredProgress
  context?: DailyTaskContext
}) {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }
    return !window.matchMedia('(max-width: 768px)').matches
  })
  const today = todayLocal()
  const completedToday = progress.completedDailyTasks[today] ?? []
  const completedCount = DAILY_TASKS.filter((task) => (
    completedToday.includes(task.id) || task.check(progress, context)
  )).length
  const allDone = completedCount === DAILY_TASKS.length

  return (
    <section className={`daily-tasks-card${open ? ' is-open' : ' is-closed'}`}>
      <button
        type="button"
        className="daily-tasks-toggle"
        aria-expanded={open}
        aria-controls="daily-tasks-list"
        onClick={() => setOpen((current) => !current)}
      >
        <span>
          <strong>每日任务</strong>
          <small>{completedCount}/{DAILY_TASKS.length} 已完成</small>
        </span>
        <span className="daily-tasks-toggle-meta">
          {allDone ? '全部完成' : open ? '收起' : '展开'}
        </span>
      </button>

      <div id="daily-tasks-list" className="daily-tasks-panel">
        {allDone && <span className="daily-tasks-done-badge">全部完成</span>}
        <ul className="daily-tasks-list">
          {DAILY_TASKS.map((task) => {
            const done = completedToday.includes(task.id) || task.check(progress, context)
            return (
              <li key={task.id} className={`daily-task ${done ? 'is-done' : ''}`}>
                <span className="daily-task-label">{task.label}</span>
                <span className="daily-task-xp">+{task.xpReward} XP</span>
                {done && <span className="daily-task-check">✓</span>}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
