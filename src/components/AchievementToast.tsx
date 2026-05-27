import { useEffect, useState } from 'react'
import type { Achievement } from '../lib/achievements'
import { playAchievement } from '../lib/soundEffects'

let listeners: Array<(achievement: Achievement) => void> = []

export function triggerAchievementToast(achievement: Achievement) {
  listeners.forEach((fn) => fn(achievement))
}

export function AchievementToastContainer() {
  const [toasts, setToasts] = useState<Array<{ id: string; achievement: Achievement }>>([])

  useEffect(() => {
    const handler = (achievement: Achievement) => {
      const entry = { id: `${achievement.id}-${Date.now()}`, achievement }
      setToasts((prev) => [...prev, entry])
      playAchievement()
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== entry.id))
      }, 4000)
    }
    listeners.push(handler)
    return () => {
      listeners = listeners.filter((l) => l !== handler)
    }
  }, [])

  return (
    <div className="achievement-toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="achievement-toast">
          <span className="achievement-toast-icon">{t.achievement.icon}</span>
          <div className="achievement-toast-body">
            <strong>成就解锁!</strong>
            <span>{t.achievement.name}</span>
            <span className="achievement-toast-xp">+{t.achievement.xpReward} XP</span>
          </div>
        </div>
      ))}
    </div>
  )
}
