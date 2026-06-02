import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Link, useNavigate } from 'react-router-dom'
import { lessons } from '../data/lessons'
import { useProgress } from '../context/ProgressContext'
import { getUnlockedAchievements, getLockedAchievements, ACHIEVEMENTS } from '../lib/achievements'
import { getLevelProgress, getXPToNextLevel, getLevelTitle } from '../lib/xpSystem'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type AchievementModal = {
  achievement: any
  onClose: () => void
}

type AuthMessage = {
  type: 'info' | 'success' | 'error'
  text: string
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
  const [session, setSession] = useState<Session | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState<AuthMessage | null>(null)

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

  useEffect(() => {
    if (!supabase) return undefined

    let isMounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleAchievementClick = (achievement: any) => {
    setSelectedAchievement(achievement)
  }

  const handleAuth = async (mode: 'signIn' | 'signUp') => {
    if (!supabase) {
      setAuthMessage({
        type: 'error',
        text: '还没有配置 Supabase 环境变量，先在 .env.local 或 Vercel 环境变量里填写 URL 和 publishable key。',
      })
      return
    }

    const email = authEmail.trim()
    if (!email || authPassword.length < 6) {
      setAuthMessage({
        type: 'error',
        text: '请输入邮箱和至少 6 位密码。',
      })
      return
    }

    setAuthLoading(true)
    setAuthMessage(null)
    const { error } =
      mode === 'signIn'
        ? await supabase.auth.signInWithPassword({ email, password: authPassword })
        : await supabase.auth.signUp({ email, password: authPassword })
    setAuthLoading(false)

    if (error) {
      setAuthMessage({ type: 'error', text: error.message })
      return
    }

    setAuthMessage({
      type: 'success',
      text: mode === 'signIn' ? '登录成功，后续可以同步学习进度。' : '注册成功，请按 Supabase 邮箱策略完成确认。',
    })
  }

  const handleSignOut = async () => {
    if (!supabase) return
    setAuthLoading(true)
    const { error } = await supabase.auth.signOut()
    setAuthLoading(false)
    setAuthMessage(error ? { type: 'error', text: error.message } : { type: 'success', text: '已退出登录。' })
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

      {/* 会员中心入口 */}
      <Link className="membership-entry-card" to="/pricing">
        <div className="membership-entry-icon">会</div>
        <div className="membership-entry-text">
          <h3>会员中心</h3>
          <p>N5 免费 · N4/N3 记忆法包 · 全部通行证</p>
        </div>
        <span className="membership-entry-arrow">→</span>
      </Link>

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
              <h3>{session ? '账户已连接' : '登录账户'}</h3>
              <p className="login-subtitle">
                {isSupabaseConfigured ? 'Supabase 已配置，可用于同步学习进度' : '等待配置 Supabase 环境变量'}
              </p>
              <div className={`supabase-status-pill ${isSupabaseConfigured ? 'ready' : 'missing'}`}>
                {isSupabaseConfigured ? 'Supabase ready' : 'Supabase missing'}
              </div>
              {session ? (
                <div className="login-session-card">
                  <span>当前邮箱</span>
                  <strong>{session.user.email ?? '已登录用户'}</strong>
                  <button className="login-button secondary" onClick={handleSignOut} disabled={authLoading}>
                    {authLoading ? '处理中...' : '退出登录'}
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    placeholder="邮箱地址"
                    className="login-input"
                    value={authEmail}
                    onChange={(event) => setAuthEmail(event.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="密码（至少 6 位）"
                    className="login-input"
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                  />
                  <div className="login-action-row">
                    <button className="login-button" onClick={() => handleAuth('signIn')} disabled={authLoading}>
                      {authLoading ? '处理中...' : '登录'}
                    </button>
                    <button className="login-button secondary" onClick={() => handleAuth('signUp')} disabled={authLoading}>
                      注册
                    </button>
                  </div>
                </>
              )}
              {authMessage && (
                <p className={`login-message ${authMessage.type}`}>{authMessage.text}</p>
              )}
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
