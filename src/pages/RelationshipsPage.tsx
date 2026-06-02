import { Link } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { getCoreCharacterRoster, AFFINITY_GREETINGS } from '../data/characters'
import { getAffinityLevel, AFFINITY_LEVELS } from '../lib/progress'

export function RelationshipsPage() {
  const { progress } = useProgress()
  const roster = getCoreCharacterRoster()
  const oda = roster[0]

  // Merge the two 小珍 variants (index 1 & 2) into one, keep only unique characters
  const uniqueCharacters = roster.filter((_char, index) => {
    // Skip the second 小珍 variant (index 2)
    if (index === 2) return false
    // Skip oda (index 0) since it's the center
    if (index === 0) return false
    return true
  })

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
        <p className="page-sub">随着旅程推进，你会遇到不同的伙伴</p>
      </header>

      <section className="relationship-graph">
        <div className="relationship-center">
          <div className="relationship-center-avatar">
            {oda.avatar ? <img src={oda.avatar} alt="小田" /> : <span>{oda.glyph}</span>}
          </div>
          <span className="relationship-center-name">小田</span>
        </div>

        <div className="relationship-orbit">
          {uniqueCharacters.map((char) => {
            const affinity = progress.characterAffinity[char.id]
            const isUnlocked = affinity && affinity.points > 0
            const isMainCharacter = char.id === 'xiao-zhen-loose'

            if (!isUnlocked) {
              return (
                <div key={char.id} className="mystery-locked-node">
                  <div className="mystery-locked-icon">？</div>
                  <span className="mystery-locked-label">旅途中的伙伴</span>
                </div>
              )
            }

            // For 小珍, show merged version
            const displayName = isMainCharacter ? '小真' : char.displayName
            const greetings = AFFINITY_GREETINGS[char.id]
            const { level, title, nextThreshold } = getAffinityLevel(affinity.points)
            const prevThreshold = level > 1 ? getAffinityLevel(affinity.points - 1).nextThreshold : 0
            const progressPct = nextThreshold > prevThreshold
              ? Math.min(100, Math.round(((affinity.points - prevThreshold) / (nextThreshold - prevThreshold)) * 100))
              : 100
            const levelGreeting = greetings?.[level]?.[0]

            return (
              <div key={char.id} className={`relationship-node palette-${char.palette}`}>
                <div className="relationship-node-avatar">
                  {char.avatar ? (
                    <img src={char.avatar} alt={displayName} />
                  ) : (
                    <span className="relationship-node-glyph">{char.glyph}</span>
                  )}
                  {level >= 3 && <span className="relationship-node-emotion">{char.emotionIcons.happy}</span>}
                </div>

                <div className="relationship-node-info">
                  <strong>{displayName}</strong>
                  <span className="relationship-node-role">{char.role}</span>

                  <div className="affinity-bar">
                    <div className="affinity-header">
                      <span className="affinity-title">{title}</span>
                      <span className="affinity-points">Lv.{level}</span>
                    </div>
                    <div className="affinity-track">
                      <div className="affinity-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                    <span className="affinity-detail">{affinity.points} / {nextThreshold} 点</span>
                  </div>

                  <div className="relationship-node-stats">
                    <span>互动 {affinity.interactions} 次</span>
                    <span>最后: {affinity.lastInteraction || '—'}</span>
                  </div>

                  {levelGreeting && (
                    <p className="relationship-node-greeting">「{levelGreeting}」</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mystery-hint">
        <span className="mystery-icon">🔮</span>
        <p>更多的羁绊等待你在旅途中发现……</p>
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
