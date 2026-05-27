import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { lessons } from '../data/lessons'
import { useProgress } from '../context/ProgressContext'
import { getUnlockedAchievements, getLockedAchievements, ACHIEVEMENTS } from '../lib/achievements'
import { getLevelProgress, getXPToNextLevel, getLevelTitle } from '../lib/xpSystem'

type AchievementModal = {
  achievement: any
  onClose: () => void
}

function AchievementModal({ achievement, onClose }: AchievementModal) {
  return (
    <div className="achievement-modal-overlay" onClick={onClose}>
      <div className="achievement-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="achievement-modal-close" onClick={onClose}>×</button>
        <div className="achievement-modal-icon">{achievement.icon}</div>
        <h2 className="achievement-modal-name">{achievement.name}</h2>
        <p className="achievement-modal-description">{achievement.description}</p>
        <div className="achievement-modal-stats">
          <div className="achievement-modal-reward">
            <span className="reward-label">奖励</span>
            <span className="reward-value">+{achievement.xpReward} XP</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AccountPage() {
  const { progress } = useProgress()
  const navigate = useNavigate()
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null)
  const [showLoginCard, setShowLoginCard] = useState(false)

  const level = progress.level ?? 1
  const totalXP = progress.totalXP ?? 0
  const levelProgress = getLevelProgress(totalXP)
  const xpToNext = getXPToNextLevel(totalXP)
  const levelTitle = getLevelTitle(level)

  const unlockedAchievements = useMemo(() => getUnlockedAchievements(progress), [progress])
  const lockedAchievements = useMemo(() => getLockedAchievements(progress), [progress])

  const completedLessons = progress.completedLessonIds.length
  const totalLessons = lessons.length
  const completionRate = Math.round((completedLessons / totalLessons) * 100)

  const streakDays = progress.streak
  const vocabCount = Object.keys(progress.vocabularyBook).length
  const totalAchievements = ACHIEVEMENTS.length
  const unlockedCount = unlockedAchievements.length
  const achievementPercent = Math.round((unlockedCount / totalAchievements) * 100)

  const handleAchievementClick = (achievement: any) => {
    setSelectedAchievement(achievement)
  }

  return (
    <div className="account-hall-page">
      {/* 左上角返回按钮 */}
      <button className="account-back-button" onClick={() => navigate(-1)} aria-label="返回">
        <span>←</span>
      </button>

      {/* 荣誉榜头部 */}
      <header className="hall-header">
        <div className="hall-avatar">
          <span className="avatar-text">こ</span>
          <div className="avatar-level-badge">{level}</div>
        </div>
        <div className="hall-title">
          <h1>荣誉殿堂</h1>
          <p className="hall-subtitle">你的日语学习成就</p>
        </div>
      </header>

      {/* 等级进度卡片 */}
      <section className="hall-level-section">
        <div className="level-card-main">
          <div className="level-card-header">
            <div className="level-info-compact">
              <span className="level-title-text">{levelTitle}</span>
              <span className="level-number">{level}级</span>
            </div>
            <div className="level-xp-compact">{totalXP} XP</div>
          </div>
          <div className="level-progress-card">
            <div className="progress-info">
              <span className="progress-label">升级进度</span>
              <span className="progress-percent">{levelProgress}%</span>
            </div>
            <div className="progress-bar-card">
              <div className="progress-fill-card" style={{ width: `${levelProgress}%` }} />
            </div>
            <div className="progress-remaining">还需 {xpToNext} XP</div>
          </div>
        </div>
      </section>

      {/* 成就统计概览 */}
      <section className="hall-stats-overview">
        <div className="stat-overview-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{unlockedCount}/{totalAchievements}</div>
          <div className="stat-label">成就解锁</div>
        </div>
        <div className="stat-overview-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{streakDays}</div>
          <div className="stat-label">连续天数</div>
        </div>
        <div className="stat-overview-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{completionRate}%</div>
          <div className="stat-label">课程完成</div>
        </div>
        <div className="stat-overview-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{vocabCount}</div>
          <div className="stat-label">生词收集</div>
        </div>
      </section>

      {/* 成就展示墙 */}
      <section className="hall-achievements-section">
        <div className="hall-section-header">
          <h2>成就徽章</h2>
          <span className="achievement-progress">{achievementPercent}%</span>
        </div>

        {/* 已解锁成就 - 奖杯展示 */}
        {unlockedAchievements.length > 0 && (
          <div className="achievements-trophy-case">
            <h3 className="trophy-case-title">已获得 ({unlockedCount})</h3>
            <div className="trophy-grid">
              {unlockedAchievements.map((achievement) => (
                <button
                  key={achievement.id}
                  className="trophy-item unlocked"
                  onClick={() => handleAchievementClick(achievement)}
                >
                  <div className="trophy-icon">{achievement.icon}</div>
                  <div className="trophy-shine" />
                  <span className="trophy-name">{achievement.name}</span>
                  <div className="trophy-glow" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 待解锁成就 - 灰色展示 */}
        {lockedAchievements.length > 0 && (
          <div className="achievements-trophy-case">
            <h3 className="trophy-case-title">待解锁 ({lockedAchievements.length})</h3>
            <div className="trophy-grid">
              {lockedAchievements.map((achievement) => (
                <button
                  key={achievement.id}
                  className="trophy-item locked"
                  onClick={() => handleAchievementClick(achievement)}
                >
                  <div className="trophy-icon">{achievement.icon}</div>
                  <span className="trophy-name">{achievement.name}</span>
                  <div className="trophy-lock">🔒</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {unlockedAchievements.length === 0 && lockedAchievements.length === 0 && (
          <div className="hall-empty-state">
            <p>暂无成就</p>
          </div>
        )}
      </section>

      {/* 可折叠登录卡片 - 横版 */}
      <div className={`login-card-container ${showLoginCard ? 'expanded' : ''}`}>
        <button
          className="login-card-toggle"
          onClick={() => setShowLoginCard(!showLoginCard)}
        >
          <div className="login-card-preview">
            <div className="login-preview-icon">👤</div>
            <div className="login-preview-text">
              <strong>账户登录</strong>
              <p>同步学习进度到云端</p>
            </div>
          </div>
          <span className="login-toggle-arrow">{showLoginCard ? '▼' : '▶'}</span>
        </button>

        {showLoginCard && (
          <div className="login-card-content">
            <div className="login-form">
              <h3>登录账户</h3>
              <p className="login-subtitle">同步你的学习进度</p>
              <input type="email" placeholder="邮箱地址" className="login-input" />
              <input type="password" placeholder="密码" className="login-input" />
              <button className="login-button">登录</button>
              <p className="login-register-link">
                还没有账户？<Link to="/register">立即注册</Link>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 成就详情模态框 */}
      {selectedAchievement && (
        <AchievementModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  )
}
