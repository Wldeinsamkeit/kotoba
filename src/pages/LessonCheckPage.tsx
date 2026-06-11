import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getLesson, lessonLifeOrder } from '../data/lessons'
import { getLessonStory } from '../lib/lessonStory'
import { useLessonCheckMode } from '../lib/lessonCheckMode'
import { parseLessonTitle } from '../lib/lessonTitle'

export function LessonCheckPage() {
  const [checkMode, setCheckMode] = useLessonCheckMode()

  useEffect(() => {
    setCheckMode(true)
  }, [setCheckMode])

  const rows = useMemo(
    () =>
      lessonLifeOrder.map((lessonId, index) => {
        const lesson = getLesson(lessonId)
        const title = lesson ? parseLessonTitle(lesson.title) : null
        const story = lesson ? getLessonStory(lesson, index + 1) : null
        return {
          episode: index + 1,
          lessonId,
          lesson,
          title,
          story,
        }
      }),
    [],
  )

  const missingCount = rows.filter((row) => !row.lesson).length

  return (
    <div className="page">
      <header className="page-header">
        <h1>课程检查台</h1>
        <p className="page-sub">
          临时入口，按小田故事线顺序列出全部 {lessonLifeOrder.length} 课，方便逐课检查对话与内容。
        </p>
      </header>

      <section className="lesson-check-panel">
        <label className="lesson-check-toggle">
          <input
            type="checkbox"
            checked={checkMode}
            onChange={(event) => setCheckMode(event.target.checked)}
          />
          <span>开启检查模式（跳过课程锁，可直接打开任意一课）</span>
        </label>
        <p className="lesson-check-hint">
          {checkMode
            ? '已开启。进入本页会自动打开检查模式；从下方链接进入课程也会带上 ?check=1。'
            : '正在开启检查模式…'}
        </p>
        <div className="lesson-check-actions">
          <Link className="btn btn-primary" to="/lessons">
            回到课程列表
          </Link>
          <a className="btn btn-secondary" href="/review-unlock-lessons.html">
            一键写入全部通过记录
          </a>
        </div>
      </section>

      {missingCount > 0 && (
        <p className="lesson-check-warning">
          警告：有 {missingCount} 个 lessonId 在 lessons.ts 里找不到对应课程，请先核对数据。
        </p>
      )}

      <ul className="lesson-check-list">
        {rows.map(({ episode, lessonId, lesson, title, story }) => (
          <li key={lessonId} className="lesson-check-item">
            <div className="lesson-check-index">{episode}</div>
            <div className="lesson-check-body">
              <div className="lesson-check-head">
                <strong>{title?.topicZh ?? lessonId}</strong>
                {lesson && <span className="badge badge-soft">{lesson.level}</span>}
                {!lesson && <span className="badge">缺失</span>}
              </div>
              {title && title.topicJa !== title.topicZh && (
                <p className="lesson-check-ja">{title.topicJa}</p>
              )}
              {story && <p className="lesson-check-arc">{story.arc}</p>}
              {lesson && (
                <p className="lesson-check-meta">
                  对话 {lesson.dialogue.length} 句 · 词汇 {lesson.vocabulary.length} 个 · 测验{' '}
                  {lesson.quizzes.length} 题
                </p>
              )}
              <div className="lesson-check-links">
                {lesson ? (
                  <>
                    <Link to={`/lessons/${lesson.id}?check=1`}>打开课程</Link>
                    <Link to={`/lessons/${lesson.id}/quiz`}>打开测验</Link>
                  </>
                ) : (
                  <span>无课程数据</span>
                )}
                <code>{lessonId}</code>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
