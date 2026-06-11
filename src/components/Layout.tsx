import { type FormEvent, useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { XPToastContainer } from './XPToast'
import { AchievementToastContainer } from './AchievementToast'
import { LevelUpCelebration } from './LevelUpCelebration'
import { playClick, playNavigate, isSoundMuted } from '../lib/soundEffects'
import {
  ENGINE_LABELS,
  getAvailableEngines,
  getSpeechEngine,
  setSpeechEngine,
  type SpeechEngine,
} from '../lib/japaneseSpeech'
import { isIosNativeApp } from '../lib/platform'

type NavItem = {
  to: string
  label: string
  icon: string
  nested?: 'courses' | 'words'
}

const nav: NavItem[] = [
  { to: '/lessons', label: '课程学习', icon: '課', nested: 'courses' },
  { to: '/lessons?words=open', label: '单词', icon: '記', nested: 'words' },
  { to: '/reading', label: '阅读', icon: '読' },
  { to: '/kana', label: '假名', icon: '仮' },
  { to: '/relationships', label: '羁绊', icon: '絆' },
]

type CourseLevelOption =
  | { label: string; to: string; value: string | null; disabled?: false }
  | { label: string; value: string; disabled: true }

const courseLevels: CourseLevelOption[] = [
  { label: '全部', to: '/lessons', value: null },
  { label: 'N5', to: '/lessons?level=N5', value: 'N5' },
  { label: 'N4', to: '/lessons?level=N4', value: 'N4' },
  { label: 'N3', to: '/lessons?level=N3', value: 'N3' },
  { label: 'N2', value: 'N2', disabled: true },
  { label: 'N1', value: 'N1', disabled: true },
  { label: '高考日语', value: '高考日语', disabled: true },
]

export function Layout() {
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const [coursesOpen, setCoursesOpen] = useState(false)
  const [wordsOpen, setWordsOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [docksHidden, setDocksHidden] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authMessage, setAuthMessage] = useState('')
  const [speechMode, setSpeechMode] = useState<SpeechEngine>(() => getSpeechEngine())
  const isIosNative = isIosNativeApp()
  const isIosHome = isIosNative && location.pathname === '/'
  const isLinkMapPage = location.pathname === '/lessons/words/link-map'
  const isWordStudyPage = /^\/lessons\/words\/(n5|n4|n3)$/.test(location.pathname)
  const isLessonFlowPage =
    /^\/lessons\/[^/]+$/.test(location.pathname) &&
    !location.pathname.startsWith('/lessons/words')
  const isLessonQuizPage = /^\/lessons\/[^/]+\/quiz$/.test(location.pathname)
  const isImmersiveShell =
    isLinkMapPage || isWordStudyPage || isLessonFlowPage || isLessonQuizPage

  const wordsActive =
    location.pathname === '/vocabulary' ||
    location.pathname.startsWith('/lessons/words') ||
    location.search.includes('words=open')
  const courseLevel = new URLSearchParams(location.search).get('level')
  const coursesActive =
    location.pathname === '/lessons' ||
    (location.pathname.startsWith('/lessons/') &&
      !location.pathname.startsWith('/lessons/words'))

  // Global click sound — any button/link/interactive element plays a tap sound
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (isSoundMuted()) return
      const target = e.target as HTMLElement
      const interactive = target.closest('button:not([data-sound-skip]), a, [role="tab"], label.quiz-option, input[type="radio"]')
      if (interactive) playClick()
    }
    document.addEventListener('click', handler, { capture: true })
    return () => document.removeEventListener('click', handler, { capture: true })
  }, [])

  useEffect(() => {
    setNavOpen(false)
    setUserOpen(false)
    setDocksHidden(false)
    playNavigate()
  }, [location.pathname, location.search])

  useEffect(() => {
    let settleTimer = 0

    const syncDockVisibility = () => {
      const edgeOffset = 12
      const atTop = window.scrollY <= edgeOffset
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - edgeOffset

      setDocksHidden(!atTop && !atBottom)
    }

    const hideDocksBetweenPageEdges = () => {
      syncDockVisibility()
      window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(syncDockVisibility, 120)
    }

    syncDockVisibility()
    window.addEventListener('scroll', hideDocksBetweenPageEdges, { passive: true })
    window.addEventListener('resize', syncDockVisibility)

    return () => {
      window.clearTimeout(settleTimer)
      window.removeEventListener('scroll', hideDocksBetweenPageEdges)
      window.removeEventListener('resize', syncDockVisibility)
    }
  }, [location.pathname, location.search])

  const submitAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthMessage(
      authMode === 'login'
        ? '登录服务接入后可同步学习进度。'
        : '注册入口已准备，后续可接入云端账户。',
    )
  }

  return (
    <div
      className={[
        'app-shell',
        isIosNative ? 'ios-native-shell' : '',
        isIosHome ? 'ios-home-shell' : '',
        isLinkMapPage ? 'link-map-immersive-shell' : '',
        !isLinkMapPage && isImmersiveShell ? 'immersive-dock-hidden-shell' : '',
      ].filter(Boolean).join(' ')}
    >
      <XPToastContainer />
      <AchievementToastContainer />
      <LevelUpCelebration />
      <header className={docksHidden && !navOpen ? 'site-header dock-hidden' : 'site-header'}>
        <div className="nav-shelf">
          <button
            type="button"
            className={navOpen ? 'nav-shelf-trigger open' : 'nav-shelf-trigger'}
            aria-label={navOpen ? '收起导航' : '展开导航'}
            aria-controls="primary-navigation"
            aria-expanded={navOpen}
            onClick={() => {
              setDocksHidden(false)
              setNavOpen((open) => !open)
            }}
          >
            <span className="brand-icon">言</span>
            <span className="brand-text">列表</span>
            <span className="nav-shelf-mark" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>

          {navOpen ? (
            <div id="primary-navigation" className="nav-collection">
              <Link to="/" className="nav-home-link">
                首页
              </Link>
              <nav className="site-nav" aria-label="主导航">
                {nav.map(({ to, label, icon, nested }) =>
                  nested === 'courses' ? (
                    <div key={to} className="nav-word-item">
                      <button
                        type="button"
                        className={
                          coursesActive || coursesOpen
                            ? 'nav-link nav-word-trigger nav-link-active'
                            : 'nav-link nav-word-trigger'
                        }
                        aria-expanded={coursesOpen}
                        aria-controls="course-navigation"
                        onClick={() => setCoursesOpen((open) => !open)}
                      >
                        <span className="nav-icon">{icon}</span>
                        <span className="nav-label">{label}</span>
                        <span className="nav-caret" aria-hidden="true" />
                      </button>
                      {coursesOpen ? (
                        <div id="course-navigation" className="nav-course-links">
                          {courseLevels.map((level) =>
                            level.disabled ? (
                              <button key={level.value} type="button" disabled>
                                <span>{level.label}</span>
                                <small>维护更新</small>
                              </button>
                            ) : (
                              <Link
                                key={level.label}
                                to={level.to}
                                className={
                                  coursesActive && courseLevel === level.value
                                    ? 'active'
                                    : undefined
                                }
                              >
                                {level.label}
                              </Link>
                            ),
                          )}
                        </div>
                      ) : null}
                    </div>
                  ) : nested === 'words' ? (
                    <div key={to} className="nav-word-item">
                      <button
                        type="button"
                        className={
                          wordsActive || wordsOpen
                            ? 'nav-link nav-word-trigger nav-link-active'
                            : 'nav-link nav-word-trigger'
                        }
                        aria-expanded={wordsOpen}
                        aria-controls="word-navigation"
                        onClick={() => setWordsOpen((open) => !open)}
                      >
                        <span className="lesson-word-trigger-icon">{icon}</span>
                        <span className="nav-label">{label}</span>
                        <span className="nav-caret" aria-hidden="true" />
                      </button>
                      {wordsOpen ? (
                        <div id="word-navigation" className="nav-word-links">
                          <NavLink to={to}>单词库</NavLink>
                          <NavLink to="/lessons/words/link-map">链路图</NavLink>
                          <NavLink to="/vocabulary">生词本</NavLink>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        isActive ? 'nav-link nav-link-active' : 'nav-link'
                      }
                    >
                      <span className="nav-icon">{icon}</span>
                      <span className="nav-label">{label}</span>
                    </NavLink>
                  ),
                )}
              </nav>
            </div>
          ) : null}
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <div className={docksHidden && !userOpen ? 'user-dock dock-hidden' : 'user-dock'}>
        {userOpen ? (
          <section className="user-panel" aria-label="用户登录">
            <div className="user-panel-head">
              <div>
                <strong>用户登录</strong>
                <span>同步课程与单词进度</span>
              </div>
              <button
                type="button"
                className="user-panel-close"
                aria-label="关闭用户登录"
                onClick={() => setUserOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="auth-mode-tabs" role="tablist" aria-label="账户方式">
              <button
                type="button"
                className={authMode === 'login' ? 'active' : ''}
                role="tab"
                aria-selected={authMode === 'login'}
                onClick={() => {
                  setAuthMode('login')
                  setAuthMessage('')
                }}
              >
                登录
              </button>
              <button
                type="button"
                className={authMode === 'signup' ? 'active' : ''}
                role="tab"
                aria-selected={authMode === 'signup'}
                onClick={() => {
                  setAuthMode('signup')
                  setAuthMessage('')
                }}
              >
                注册
              </button>
            </div>
            <form className="auth-form" onSubmit={submitAuth}>
              <label>
                邮箱
                <input type="email" autoComplete="email" placeholder="name@example.com" required />
              </label>
              <label>
                密码
                <input
                  type="password"
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  placeholder={authMode === 'login' ? '输入密码' : '设置密码'}
                  minLength={6}
                  required
                />
              </label>
              <button type="submit" className="auth-submit">
                {authMode === 'login' ? '登录' : '创建账户'}
              </button>
            </form>
            {authMessage ? <p className="auth-message">{authMessage}</p> : null}
            <label className="speech-mode-control">
              发音模式
              <select
                value={speechMode}
                onChange={(event) => {
                  const nextMode = event.target.value as SpeechEngine
                  setSpeechMode(nextMode)
                  setSpeechEngine(nextMode)
                }}
              >
                {getAvailableEngines().map((engine) => (
                  <option key={engine} value={engine}>
                    {ENGINE_LABELS[engine]}
                  </option>
                ))}
              </select>
            </label>
            <div className="user-quick-links">
              <Link to="/account">账户概览</Link>
              <Link to="/progress">学习进度</Link>
            </div>
          </section>
        ) : null}
        <button
          type="button"
          className={userOpen ? 'user-dock-trigger active' : 'user-dock-trigger'}
          aria-label={userOpen ? '收起用户登录' : '打开用户登录'}
          aria-expanded={userOpen}
          onClick={() => {
            setDocksHidden(false)
            setUserOpen((open) => !open)
          }}
        >
          <span className="user-dock-icon" aria-hidden="true">戶</span>
          <span>登录</span>
        </button>
      </div>
    </div>
  )
}
