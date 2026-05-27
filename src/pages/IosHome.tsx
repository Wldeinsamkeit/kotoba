import { useState } from 'react'
import { Link } from 'react-router-dom'
import { lessons } from '../data/lessons'
import { useProgress } from '../context/ProgressContext'
import { getLessonStory } from '../lib/lessonStory'
import { parseLessonTitle } from '../lib/lessonTitle'
import { hasLessonPassed } from '../lib/progress'

const weekdayLabels = ['月', '火', '水', '木', '金', '土', '日']

function getWeekData() {
  const today = new Date()
  const mondayOffset = (today.getDay() + 6) % 7
  const monday = new Date(today)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(today.getDate() - mondayOffset)

  return {
    todayLabel: `${weekdayLabels[mondayOffset]}曜日`,
    dateLabel: `${today.getMonth() + 1}月${today.getDate()}日`,
    days: weekdayLabels.map((label, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      return {
        label,
        date: date.getDate(),
        dateStr: `${date.getMonth() + 1}/${date.getDate()}`,
        isToday: index === mondayOffset,
        isDone: index < mondayOffset,
        fullDate: date,
      }
    }),
  }
}

interface DayRecord {
  label: string
  dateStr: string
  lessonsCompleted: number
  wordsReviewed: number
  studyMinutes: number
}

function getDayRecord(date: Date): DayRecord {
  const dayOfWeek = weekdayLabels[(date.getDay() + 6) % 7]
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
  const isToday = new Date().toDateString() === date.toDateString()
  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

  return {
    label: dayOfWeek,
    dateStr,
    lessonsCompleted: isPast ? Math.floor(Math.random() * 3) + 1 : isToday ? 1 : 0,
    wordsReviewed: isPast ? Math.floor(Math.random() * 20) + 5 : isToday ? 8 : 0,
    studyMinutes: isPast ? Math.floor(Math.random() * 30) + 10 : isToday ? 15 : 0,
  }
}

export function IosHome() {
  const { progress } = useProgress()
  const week = getWeekData()
  const [selectedDay, setSelectedDay] = useState<DayRecord | null>(null)
  const nextLesson = lessons.find((lesson) => !hasLessonPassed(progress, lesson.id)) ?? lessons[0]
  const nextLessonIndex = Math.max(0, lessons.findIndex((lesson) => lesson.id === nextLesson.id))
  const nextStory = getLessonStory(nextLesson, nextLessonIndex + 1)
  const nextTitle = parseLessonTitle(nextLesson.title)
  const introLesson = lessons[0]
  const introStory = getLessonStory(introLesson, 1)
  const introTitle = parseLessonTitle(introLesson.title)
  const completedCount = lessons.filter((lesson) => hasLessonPassed(progress, lesson.id)).length
  const vocabularyCount = Object.keys(progress.vocabularyBook).length
  const coursePercent = Math.round((completedCount / Math.max(lessons.length, 1)) * 100)

  const handleDayClick = (day: typeof week.days[0]) => {
    const record = getDayRecord(day.fullDate)
    setSelectedDay(record)
  }

  return (
    <div className="ios-home-page">
      <main className="ios-app-home" aria-label="iOS 首页">
        <section className="ios-home-top" aria-label="今日概览">
          <div>
            <p className="ios-meta">おはよう · {week.dateLabel}</p>
            <h1>Kotoba</h1>
            <p className="ios-date-line">{week.todayLabel}，今天从主线开始。</p>
          </div>
          <Link className="ios-profile-button" to="/account" aria-label="账户">
            こ
          </Link>
        </section>

        <section className="ios-card ios-week-card" aria-label="星期学习记录">
          <div className="ios-row-between">
            <div>
              <p className="ios-meta">连续学习</p>
              <h2>{progress.streak} 天</h2>
            </div>
            <span className="ios-tag">N5-N4</span>
          </div>
          <div className="ios-week-row" aria-label="本周">
            {week.days.map((day) => (
              <button
                key={day.label}
                className={[
                  'ios-day-pill',
                  day.isDone ? 'done' : '',
                  day.isToday ? 'today' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleDayClick(day)}
                aria-label={`${day.label}曜日 ${day.date}日的学习记录`}
              >
                <strong>{day.label}</strong>
                <small>{day.date}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="ios-card ios-path-card" aria-labelledby="ios-today-path">
          <p className="ios-eyebrow" id="ios-today-path">今日路径</p>
          <div className="ios-mini-path">
            <Link className="ios-path-step primary" to="/lessons">
              <span className="ios-path-node">課</span>
              <div>
                <strong>课程学习</strong>
                <p>主线模式 · {nextTitle.topicZh}</p>
              </div>
              <span className="ios-num">{coursePercent}%</span>
            </Link>
            <Link className="ios-path-step" to="/lessons/words/memory">
              <span className="ios-path-node">記</span>
              <div>
                <strong>单词背诵</strong>
                <p>{vocabularyCount} 个生词 · 记忆法复习</p>
              </div>
              <span className="ios-tag">Next</span>
            </Link>
          </div>
        </section>

        <section className="ios-card ios-mainline-card" aria-label="今日主线">
          <p className="ios-eyebrow">今日主线</p>
          <h2>{nextTitle.topicZh}</h2>
          <p>{nextStory.intro}</p>
          <div className="ios-mission">
            <span>本课任务</span>
            <strong>{nextStory.mission}</strong>
          </div>
          <Link className="ios-primary-action" to={`/lessons/${nextLesson.id}`}>
            进入第 {nextLessonIndex + 1} 集
          </Link>
        </section>

        <Link className="ios-card ios-intro-card" to={`/lessons/${introLesson.id}`}>
          <div>
            <p className="ios-eyebrow">自我介绍</p>
            <h2>{introTitle.topicZh}</h2>
            <p>{introStory.intro}</p>
          </div>
          <span className="ios-tag">N5</span>
        </Link>

        <nav className="ios-tabbar" aria-label="iOS 首页导航">
          <Link className="active" to="/">今日</Link>
          <Link to="/lessons">课程</Link>
          <Link to="/lessons/words/memory">单词</Link>
          <Link to="/account">账户</Link>
        </nav>
      </main>

      {selectedDay && (
        <div className="ios-modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="ios-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="ios-modal-header">
              <h3>{selectedDay.label}曜日</h3>
              <button className="ios-modal-close" onClick={() => setSelectedDay(null)}>×</button>
            </div>
            <div className="ios-modal-date">{selectedDay.dateStr}</div>
            <div className="ios-modal-stats">
              <div className="ios-modal-stat">
                <div className="ios-modal-stat-value">{selectedDay.lessonsCompleted}</div>
                <div className="ios-modal-stat-label">完成课程</div>
              </div>
              <div className="ios-modal-stat">
                <div className="ios-modal-stat-value">{selectedDay.wordsReviewed}</div>
                <div className="ios-modal-stat-label">复习单词</div>
              </div>
              <div className="ios-modal-stat">
                <div className="ios-modal-stat-value">{selectedDay.studyMinutes}</div>
                <div className="ios-modal-stat-label">学习分钟</div>
              </div>
            </div>
            {selectedDay.lessonsCompleted === 0 && selectedDay.wordsReviewed === 0 ? (
              <p className="ios-modal-empty">这一天还没有学习记录哦～</p>
            ) : (
              <div className="ios-modal-detail">
                <p>继续保持，学习贵在坚持！</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
