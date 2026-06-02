import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { DialogueFlipCard } from '../components/DialogueFlipCard'
import { lessons } from '../data/lessons'
import { useProgress } from '../context/ProgressContext'
import { parseLessonTitle } from '../lib/lessonTitle'
import { getLessonStory } from '../lib/lessonStory'
import { hasLessonPassed } from '../lib/progress'
import type { LessonLevel } from '../types'
import { WordSetsList } from './WordSetsPage'

export function LessonsPage() {
  const { progress } = useProgress()
  const [searchParams] = useSearchParams()
  const [wordPanelOpen, setWordPanelOpen] = useState(
    searchParams.get('words') === 'open',
  )

  const availableLevels: LessonLevel[] = ['N5', 'N4', 'N3']

  const requestedLevel = (searchParams.get('level') as LessonLevel | null) ?? null
  const selectedLevel =
    requestedLevel && availableLevels.includes(requestedLevel)
      ? requestedLevel
      : null

  const filteredLessons =
    selectedLevel
      ? lessons.filter((l) => l.level === selectedLevel)
      : lessons.filter((lesson) => availableLevels.includes(lesson.level))
  const filteredCompletedCount = filteredLessons.filter((lesson) =>
    hasLessonPassed(progress, lesson.id),
  ).length
  const nextLesson = lessons.find((lesson) => !hasLessonPassed(progress, lesson.id)) ?? lessons[0]
  const nextLessonIndex = Math.max(0, lessons.findIndex((lesson) => lesson.id === nextLesson.id))
  const nextStory = getLessonStory(nextLesson, nextLessonIndex + 1)
  const nextTitle = parseLessonTitle(nextLesson.title)
  const routePreview = lessons.slice(nextLessonIndex, nextLessonIndex + 3)

  useEffect(() => {
    if (searchParams.get('words') === 'open') {
      setWordPanelOpen(true)
    }
  }, [searchParams])

  return (
    <div className="page">
      <header className="page-header lesson-hub-header">
        <div className="lesson-course-column">
          <h1>课程学习</h1>
          <p className="page-sub">
            已完成 {filteredCompletedCount} / {filteredLessons.length} 课
          </p>
        </div>
        <button
          type="button"
          className="lesson-word-trigger lesson-word-trigger-inline"
          onClick={() => setWordPanelOpen((open) => !open)}
          aria-expanded={wordPanelOpen}
          aria-controls="lesson-word-panel"
        >
          <span className="lesson-word-trigger-icon">記</span>
          <span>{wordPanelOpen ? '收起单词' : '单词副交互'}</span>
        </button>
      </header>

      <section className="lesson-command-center" aria-label="今日课程驾驶舱">
        <div className="lesson-command-primary">
          <p className="eyebrow">今日主线 · 小田在日本</p>
          <h2>{nextTitle.topicZh}</h2>
          <p>{nextStory.intro}</p>
          <div className="lesson-command-actions">
            <Link className="hero-btn-primary" to={`/lessons/${nextLesson.id}`}>
              继续第 {nextLessonIndex + 1} 集 →
            </Link>
            <Link className="hero-btn-secondary" to="/lessons/words">
              单词卡复习 →
            </Link>
          </div>
        </div>
        <div className="lesson-mini-path" aria-label="后续解锁路径">
          {routePreview.map((lesson, index) => {
            const parsed = parseLessonTitle(lesson.title)
            const story = getLessonStory(lesson, nextLessonIndex + index + 1)
            return (
              <Link key={lesson.id} to={`/lessons/${lesson.id}`} className="lesson-mini-step">
                <span>{nextLessonIndex + index + 1}</span>
                <div>
                  <strong>{parsed.topicZh}</strong>
                  <p>{story.arc}</p>
                </div>
                <em>{index === 0 ? '当前' : lesson.level}</em>
              </Link>
            )
          })}
        </div>
      </section>

      {wordPanelOpen && (
        <section id="lesson-word-panel" className="lesson-word-panel" aria-label="单词副交互">
          <div className="lesson-word-panel-head">
            <div>
              <h2>单词副交互</h2>
              <p>原背词板块已合并到每日课程中，可从这里进入复习、学新词和测验。</p>
            </div>
            <div className="lesson-word-panel-links">
              <Link to="/lessons/words" className="lesson-word-all-link">
                打开完整单词库 →
              </Link>
              <Link to="/vocabulary" className="lesson-word-all-link">
                生词本 →
              </Link>
            </div>
          </div>
          <WordSetsList compact />
        </section>
      )}

      <ul className="lesson-list">
        {filteredLessons.map((lesson) => {
          const lessonIndex = lessons.findIndex((l) => l.id === lesson.id)
          const previousLesson = lessons[lessonIndex - 1]
          const done = hasLessonPassed(progress, lesson.id)
          const unlocked =
            lessonIndex <= 0 ||
            done ||
            (previousLesson ? hasLessonPassed(progress, previousLesson.id) : true)

          const prevTopic = previousLesson
            ? parseLessonTitle(previousLesson.title).topicZh
            : ''

          return (
            <li key={lesson.id}>
              <DialogueFlipCard
                lesson={lesson}
                done={done}
                locked={!unlocked}
                unitIndex={lessonIndex + 1}
                href={unlocked ? `/lessons/${lesson.id}` : undefined}
                lockHint={
                  !unlocked && prevTopic
                    ? `先完成「${prevTopic}」后解锁`
                    : undefined
                }
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
