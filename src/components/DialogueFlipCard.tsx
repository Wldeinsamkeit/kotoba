import { Link } from 'react-router-dom'
import { parseLessonTitle } from '../lib/lessonTitle'
import { getLessonStory } from '../lib/lessonStory'
import type { Lesson } from '../types'

type DialogueFlipCardProps = {
  lesson: Lesson
  done?: boolean
  locked?: boolean
  unitIndex?: number
  href?: string
  lockHint?: string
  compact?: boolean
}

export function DialogueFlipCard({
  lesson,
  done = false,
  locked = false,
  unitIndex,
  href,
  lockHint,
  compact = false,
}: DialogueFlipCardProps) {
  const title = parseLessonTitle(lesson.title)
  const story = getLessonStory(lesson, unitIndex ?? 0)
  const card = (
    <article
      className={[
        'dialogue-flip-card',
        compact ? 'dialogue-flip-card--compact' : '',
        locked ? 'is-locked' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="dialogue-flip-badges">
        <span className={`badge badge-level-${lesson.level}`}>{lesson.level}</span>
        {typeof unitIndex === 'number' && <span className="badge badge-soft">单元 {unitIndex}</span>}
        {done && <span className="badge badge-done">✓ 已通过</span>}
        {locked && <span className="badge badge-locked">未解锁</span>}
      </div>

      <div className="dialogue-flip-scene" aria-hidden="true">
        <div className="dialogue-flip-inner">
          <div className="dialogue-flip-face dialogue-flip-front">
            <p className="dialogue-flip-topic">{story.episodeTitle}</p>
            <span className="dialogue-flip-hint">{story.arc}</span>
          </div>
          <div className="dialogue-flip-face dialogue-flip-back">
            <p className="dialogue-flip-ja">{title.topicJa || lesson.title}</p>
            <span className="dialogue-flip-hint">{story.location}</span>
          </div>
        </div>
      </div>

      <p className="dialogue-flip-scenario">{story.intro}</p>
      <div className="dialogue-flip-meta">
        <span>{lesson.dialogue.length} 句对话</span>
        <span>{lesson.vocabulary.length} 个词</span>
        <span>{lesson.quizzes.length} 题</span>
      </div>
      {locked && lockHint && <p className="dialogue-flip-lock-hint">{lockHint}</p>}
    </article>
  )

  if (href && !locked) {
    return (
      <Link className="dialogue-flip-link" to={href}>
        {card}
      </Link>
    )
  }

  return (
    <div className="dialogue-flip-link dialogue-flip-link--static" aria-disabled={locked || undefined}>
      {card}
    </div>
  )
}
