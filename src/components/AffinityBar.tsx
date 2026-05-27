import { getAffinityLevel } from '../lib/progress'
import type { CharacterAffinity } from '../types'

export function AffinityBar({
  affinity,
  characterName,
  compact = false,
}: {
  affinity: CharacterAffinity | undefined
  characterName: string
  compact?: boolean
}) {
  const points = affinity?.points ?? 0
  const { level, title, nextThreshold } = getAffinityLevel(points)
  const prevThreshold = level > 1 ? getAffinityLevel(points - 1).nextThreshold : 0
  const progress = nextThreshold > prevThreshold
    ? Math.min(100, Math.round(((points - prevThreshold) / (nextThreshold - prevThreshold)) * 100))
    : 100

  if (compact) {
    return (
      <div className="affinity-bar-compact">
        <span className="affinity-heart">♥</span>
        <span className="affinity-level">Lv.{level}</span>
        <div className="affinity-track">
          <div className="affinity-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    )
  }

  return (
    <div className="affinity-bar">
      <div className="affinity-header">
        <span className="affinity-title">{title}</span>
        <span className="affinity-points">Lv.{level} · {points} 点</span>
      </div>
      <div className="affinity-track">
        <div className="affinity-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="affinity-hint">与{characterName}的好感度</p>
    </div>
  )
}
