import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DialogueFlipCard } from '../components/DialogueFlipCard'
import { DailyTasksCard } from '../components/DailyTasks'
import { lessons } from '../data/lessons'
import { useProgress } from '../context/ProgressContext'
import { getLessonStory } from '../lib/lessonStory'
import { parseLessonTitle } from '../lib/lessonTitle'
import { isIosNativeApp } from '../lib/platform'
import { hasLessonPassed } from '../lib/progress'
import type { LessonLevel } from '../types'
import { IosHome } from './IosHome'

type DialogueFilter = 'all' | 'N5' | 'N4'

const DAILY_LEVELS: LessonLevel[] = ['N5', 'N4']

export function Home() {
  if (isIosNativeApp()) {
    return <IosHome />
  }

  return <WebHome />
}

function WebHome() {
  const { progress } = useProgress()
  const [dialogueFilter, setDialogueFilter] = useState<DialogueFilter>('all')
  const [dashboardOpen, setDashboardOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }
    return !window.matchMedia('(max-width: 768px)').matches
  })
  const [pathOpen, setPathOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }
    return !window.matchMedia('(max-width: 768px)').matches
  })

  const dailyDialogues = lessons.filter((l) => DAILY_LEVELS.includes(l.level))
  const filteredDialogues =
    dialogueFilter === 'all'
      ? dailyDialogues
      : dailyDialogues.filter((l) => l.level === dialogueFilter)

  const n5Count = dailyDialogues.filter((l) => l.level === 'N5').length
  const n4Count = dailyDialogues.filter((l) => l.level === 'N4').length
  const completedLessonCount = lessons.filter((lesson) =>
    hasLessonPassed(progress, lesson.id),
  ).length

  const firstIncomplete = lessons.find(
    (l) => !hasLessonPassed(progress, l.id),
  )
  const suggest = firstIncomplete ?? lessons[0]
  const suggestIndex = Math.max(0, lessons.findIndex((l) => l.id === suggest.id))
  const suggestStory = getLessonStory(suggest, suggestIndex + 1)
  const suggestTitle = parseLessonTitle(suggest.title)
  const upcomingLessons = useMemo(
    () => lessons.slice(suggestIndex, suggestIndex + 4),
    [suggestIndex],
  )
  const wrongQueueCount = Object.values(progress.wrongByLesson).reduce(
    (total, ids) => total + ids.length,
    0,
  )
  const vocabularyCount = Object.keys(progress.vocabularyBook).length

  return (
    <div className="page home-page">
      <section
        className={`oda-dashboard${dashboardOpen ? ' is-open' : ' is-closed'}`}
        aria-label="小田线今日任务"
      >
        <button
          type="button"
          className="oda-dashboard-toggle"
          aria-expanded={dashboardOpen}
          aria-controls="today-dashboard-panel"
          onClick={() => setDashboardOpen((open) => !open)}
        >
          <span className="oda-dashboard-toggle-copy">
            <span className="oda-dashboard-kicker">小田线 · 第 {suggestIndex + 1} 集</span>
            <strong>今天：{suggestTitle.topicZh}</strong>
          </span>
          <span className="oda-dashboard-toggle-action">
            {dashboardOpen ? '收起' : '展开'}
          </span>
        </button>

        <div id="today-dashboard-panel" className="oda-dashboard-content">
          <div className="oda-dashboard-main">
            <h1 id="today-dashboard-heading">今天：{suggestTitle.topicZh}</h1>
            <p>
              先听一段生活剧情，收集本课词卡，再用小测解锁后续对话。
            </p>
            <div className="oda-dashboard-actions">
              <Link className="hero-btn-primary" to={`/lessons/${suggest.id}`}>
                <span>进入今日任务</span>
                <span className="btn-arrow">→</span>
              </Link>
              <Link className="hero-btn-secondary" to="/lessons?words=open">
                <span>复习单词</span>
                <span className="btn-arrow">→</span>
              </Link>
            </div>
          </div>

          <aside className="oda-today-card" aria-label="今日推荐剧情">
            <div className="oda-today-top">
              <span className="tag">{suggest.level}</span>
              <span className="meta">第 {suggestIndex + 1} 集</span>
            </div>
            <h2>{suggest.title}</h2>
            <p>{suggestStory.intro}</p>
            <div className="oda-quest-line">
              <span>本集任务</span>
              <strong>{suggestStory.mission}</strong>
            </div>
          </aside>
        </div>
      </section>

      <section className="quick-stats-modern oda-kpi-grid" aria-label="学习指标">
        <div className="stat-card-modern">
          <span className="stat-icon-bg">復</span>
          <div className="stat-content">
            <div className="stat-value">{wrongQueueCount}</div>
            <div className="stat-label">弱项队列</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <span className="stat-icon-bg">連</span>
          <div className="stat-content">
            <div className="stat-value">{progress.streak}</div>
            <div className="stat-label">连续学习天数</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <span className="stat-icon-bg">課</span>
          <div className="stat-content">
            <div className="stat-value">
              {completedLessonCount}/{lessons.length}
            </div>
            <div className="stat-label">课程进度</div>
          </div>
        </div>
        <div className="stat-card-modern">
          <span className="stat-icon-bg">語</span>
          <div className="stat-content">
            <div className="stat-value">{vocabularyCount}</div>
            <div className="stat-label">生词本</div>
          </div>
        </div>
      </section>

      {/* 单词背诵 - 移动端优先入口 */}
      <section className="vocab-mvp-card" aria-label="单词背诵">
        <Link to="/lessons/words/n5" className="vocab-mvp-link">
          <div className="vocab-mvp-left">
            <span className="vocab-mvp-icon">単</span>
            <div>
              <h2>单词背诵</h2>
              <p>N5 → N4 → 高考，谐音联想记得牢</p>
            </div>
          </div>
          <span className="vocab-mvp-arrow">→</span>
        </Link>
      </section>

      {/* 每日任务 */}
      <DailyTasksCard progress={progress} />

      <section
        className={`oda-path-panel${pathOpen ? ' is-open' : ' is-closed'}`}
        aria-labelledby="oda-path-heading"
      >
        <button
          type="button"
          className="oda-path-toggle"
          aria-expanded={pathOpen}
          aria-controls="oda-path-panel-content"
          onClick={() => setPathOpen((open) => !open)}
        >
          <span>
            <strong id="oda-path-heading">剧情路径</strong>
            <small>当前：{suggestTitle.topicZh} · 后续 {Math.max(upcomingLessons.length - 1, 0)} 集</small>
          </span>
          <span className="oda-path-toggle-action">
            {pathOpen ? '收起' : '展开'}
          </span>
        </button>

        <div id="oda-path-panel-content" className="oda-path-content">
          <div className="section-header-modern">
            <div>
              <h2>小田今天的剧情路径</h2>
              <p className="section-desc-modern">
                路径按生活逻辑解锁：先完成当前单元，再进入下一段东京日常。
              </p>
            </div>
            <Link className="view-all-link" to="/lessons">
              查看全部课程 →
            </Link>
          </div>
          <div className="oda-route-list">
            {upcomingLessons.map((lesson, index) => {
              const absoluteIndex = suggestIndex + index
              const parsed = parseLessonTitle(lesson.title)
              const story = getLessonStory(lesson, absoluteIndex + 1)
              const isCurrent = index === 0
              return (
                <Link
                  key={lesson.id}
                  to={`/lessons/${lesson.id}`}
                  className={`oda-route-step${isCurrent ? ' is-current' : ''}`}
                >
                  <span className="oda-route-node">{absoluteIndex + 1}</span>
                  <div>
                    <strong>{parsed.topicZh}</strong>
                    <p>{story.arc} · {story.location}</p>
                  </div>
                  <span className="tag">{isCurrent ? 'Now' : lesson.level}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* 日常会话 */}
      <section className="daily-dialogues" aria-labelledby="daily-dialogues-heading">
        <div className="section-header-modern">
          <div>
            <h2 id="daily-dialogues-heading">日常会话</h2>
            <p className="section-desc-modern">
              N5 入门 {n5Count} 课 · N4 进阶 {n4Count} 课 — 寒暄、餐厅、出行、健康等基础场景
            </p>
          </div>
          <Link className="view-all-link" to="/lessons?level=N5">
            全部课程 →
          </Link>
        </div>

        <div className="dialogue-filter" role="tablist" aria-label="会话等级筛选">
          {(
            [
              { key: 'all' as const, label: `全部 (${dailyDialogues.length})` },
              { key: 'N5' as const, label: `N5 (${n5Count})` },
              { key: 'N4' as const, label: `N4 (${n4Count})` },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={dialogueFilter === key}
              className={
                dialogueFilter === key
                  ? 'dialogue-filter-btn active'
                  : 'dialogue-filter-btn'
              }
              onClick={() => setDialogueFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <ul className="dialogue-flip-grid">
          {filteredDialogues.map((lesson) => {
            const done = hasLessonPassed(progress, lesson.id)
            return (
              <li key={lesson.id}>
                <DialogueFlipCard
                  lesson={lesson}
                  done={done}
                  href={`/lessons/${lesson.id}`}
                  compact
                />
              </li>
            )
          })}
        </ul>
      </section>

      {/* 快速开始卡片 */}
      <section className="quick-start-grid">
        <h2 className="section-title-modern">快速开始</h2>
        <div className="quick-start-cards">
          <Link to="/lessons" className="quick-start-card card-type-1">
            <div className="quick-start-icon">課</div>
            <div className="quick-start-content">
              <h3>每日课程</h3>
            </div>
            <div className="quick-start-arrow">→</div>
          </Link>

          <Link to="/kana?tab=katakana" className="quick-start-card card-type-4">
            <div className="quick-start-icon">カ</div>
            <div className="quick-start-content">
              <h3>片假名</h3>
            </div>
            <div className="quick-start-arrow">→</div>
          </Link>

          <Link to="/reading" className="quick-start-card card-type-2">
            <div className="quick-start-icon">読</div>
            <div className="quick-start-content">
              <h3>阅读</h3>
            </div>
            <div className="quick-start-arrow">→</div>
          </Link>

          <Link to="/lessons?words=open" className="quick-start-card card-type-3">
            <div className="quick-start-icon">記</div>
            <div className="quick-start-content">
              <h3>单词</h3>
            </div>
            <div className="quick-start-arrow">→</div>
          </Link>
        </div>
      </section>

      {/* 学习路径 */}
      <section className="learning-path">
        <h2 className="section-title-modern">学习路径</h2>
        <div className="path-preview">
          {lessons.slice(0, 5).map((lesson, index) => {
            const isCompleted = hasLessonPassed(progress, lesson.id)
            const isCurrent = !isCompleted && (
              index === 0 ||
              hasLessonPassed(progress, lessons[index - 1].id)
            )
            return (
              <Link
                key={lesson.id}
                to={`/lessons/${lesson.id}`}
                className={`path-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              >
                <div className="path-node-icon">
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span className="path-node-label">{lesson.title}</span>
              </Link>
            )
          })}
          {lessons.length > 5 && (
            <Link to="/lessons" className="path-node path-more">
              <span>查看全部 {lessons.length} 课</span>
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
