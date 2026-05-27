import { useEffect, useState } from 'react'
import { getLevelTitle } from '../lib/xpSystem'

let listeners: Array<(level: number) => void> = []

export function triggerLevelUpCelebration(level: number) {
  listeners.forEach((fn) => fn(level))
}

export function LevelUpCelebration() {
  const [level, setLevel] = useState<number | null>(null)

  useEffect(() => {
    const handler = (newLevel: number) => {
      setLevel(newLevel)
      setTimeout(() => setLevel(null), 2500)
    }
    listeners.push(handler)
    return () => {
      listeners = listeners.filter((l) => l !== handler)
    }
  }, [])

  if (level === null) return null

  return (
    <div className="level-up-overlay" role="dialog" aria-label="升级庆祝">
      <div className="level-up-particles">
        {Array.from({ length: 20 }, (_, i) => (
          <span key={i} className="level-up-particle" style={{
            '--delay': `${Math.random() * 0.5}s`,
            '--x': `${(Math.random() - 0.5) * 300}px`,
            '--y': `${-100 - Math.random() * 200}px`,
            '--rotation': `${Math.random() * 360}deg`,
          } as React.CSSProperties} />
        ))}
      </div>
      <div className="level-up-content">
        <div className="level-up-badge">Lv.{level}</div>
        <h2>升级!</h2>
        <p>{getLevelTitle(level)}</p>
      </div>
    </div>
  )
}
