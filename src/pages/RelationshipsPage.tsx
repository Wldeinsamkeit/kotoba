import { Link } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { getCoreCharacterRoster, AFFINITY_GREETINGS, type CharacterProfile } from '../data/characters'
import { getAffinityLevel, AFFINITY_LEVELS } from '../lib/progress'
import type { CharacterAffinity } from '../types'

export function RelationshipsPage() {
  const { progress } = useProgress()
  const roster = getCoreCharacterRoster()
  const oda = roster[0]
  const friends = roster.slice(1)

  return (
    <div className="page relationships-page">
      <nav className="breadcrumb">
        <Link to="/">首页</Link>
        <span aria-hidden> / </span>
        <span>角色羁绊</span>
      </nav>

      <header className="page-header">
        <p className="unit-kicker">小田的东京人际关系</p>
        <h1>角色羁绊</h1>
        <p className="page-sub">与角色互动可以提升好感度，解锁专属对话和故事</p>
      </header>

      <section className="relationship-graph">
        <div className="relationship-center">
          <div className="relationship-center-avatar">
            {oda.avatar ? <img src={oda.avatar} alt="小田" /> : <span>{oda.glyph}</span>}
          </div>
          <span className="relationship-center-name">小田</span>
        </div>

        <div className="relationship-orbit">
          {friends.map((char) => {
            const affinity = progress.characterAffinity[char.id]
            return (
              <RelationshipNode
                key={char.id}
                character={char}
                affinity={affinity}
              />
            )
          })}
        </div>
      </section>

      <section className="affinity-legend">
        <h3>好感度等级</h3>
        <div className="affinity-levels-grid">
          {AFFINITY_LEVELS.map((l) => (
            <div key={l.level} className="affinity-level-item">
              <span className="affinity-level-num">Lv.{l.level}</span>
              <span className="affinity-level-name">{l.title}</span>
              <span className="affinity-level-pts">{l.threshold} 点</span>
            </div>
          ))}
        </div>
      </section>

      <section className="relationship-details">
        <h3>好感度获取方式</h3>
        <ul className="affinity-sources-list">
          <li>完成角色参与的课程对话 <strong>+20 点</strong></li>
          <li>在对话中点击角色说的词汇 <strong>+2 点/词</strong></li>
          <li>跟读角色的台词 <strong>+5 点/次</strong></li>
          <li>每日首次互动 <strong>+5 点</strong></li>
        </ul>
      </section>
    </div>
  )
}

function RelationshipNode({
  character,
  affinity,
}: {
  character: CharacterProfile
  affinity: CharacterAffinity | undefined
}) {
  const points = affinity?.points ?? 0
  const { level, title, nextThreshold } = getAffinityLevel(points)
  const prevThreshold = level > 1 ? getAffinityLevel(points - 1).nextThreshold : 0
  const progressPct = nextThreshold > prevThreshold
    ? Math.min(100, Math.round(((points - prevThreshold) / (nextThreshold - prevThreshold)) * 100))
    : 100

  const greetings = AFFINITY_GREETINGS[character.id]
  const levelGreeting = greetings?.[level]?.[0]

  return (
    <div className={`relationship-node palette-${character.palette}`}>
      <div className="relationship-node-avatar">
        {character.avatar ? (
          <img src={character.avatar} alt={character.displayName} />
        ) : (
          <span className="relationship-node-glyph">{character.glyph}</span>
        )}
        {level >= 3 && <span className="relationship-node-emotion">{character.emotionIcons.happy}</span>}
      </div>

      <div className="relationship-node-info">
        <strong>{character.displayName}</strong>
        <span className="relationship-node-role">{character.role}</span>

        <div className="affinity-bar">
          <div className="affinity-header">
            <span className="affinity-title">{title}</span>
            <span className="affinity-points">Lv.{level}</span>
          </div>
          <div className="affinity-track">
            <div className="affinity-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="affinity-detail">{points} / {nextThreshold} 点</span>
        </div>

        {affinity && (
          <div className="relationship-node-stats">
            <span>互动 {affinity.interactions} 次</span>
            <span>最后: {affinity.lastInteraction || '—'}</span>
          </div>
        )}

        {levelGreeting && (
          <p className="relationship-node-greeting">「{levelGreeting}」</p>
        )}

        {level >= 4 && (
          <div className="relationship-node-unlock">
            <span className="unlock-badge">已解锁</span>
            <span>角色背景故事</span>
          </div>
        )}
        {level >= 6 && (
          <div className="relationship-node-unlock">
            <span className="unlock-badge">已解锁</span>
            <span>专属小剧情</span>
          </div>
        )}
        {level >= 8 && (
          <div className="relationship-node-unlock">
            <span className="unlock-badge">已解锁</span>
            <span>隐藏对话</span>
          </div>
        )}
      </div>
    </div>
  )
}
