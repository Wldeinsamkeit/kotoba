import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { lessons } from '../data/lessons'
import { useProgress } from '../context/ProgressContext'

export function ReviewPage() {
  const { progress, registerQuizResult } = useProgress()
  const [choices, setChoices] = useState<Record<string, number | undefined>>({})
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})

  const items = useMemo(() => {
    const out: {
      lessonId: string
      lessonTitle: string
      questionId: string
    }[] = []
    for (const [lessonId, ids] of Object.entries(progress.wrongByLesson)) {
      const lesson = lessons.find((l) => l.id === lessonId)
      if (!lesson) continue
      for (const qid of ids) {
        out.push({ lessonId, lessonTitle: lesson.title, questionId: qid })
      }
    }
    return out
  }, [progress.wrongByLesson])

  if (items.length === 0) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>错题</h1>
          <p className="page-sub">目前暂无错题，做完测验后错题会自动出现在这里。</p>
        </header>
        <Link className="btn btn-primary" to="/lessons">
          去上课
        </Link>
      </div>
    )
  }

  function keyFor(lessonId: string, qid: string) {
    return `${lessonId}::${qid}`
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>错题</h1>
        <p className="page-sub">
          从测验中做错的题目会汇总在此。重新作答并提交后，若答对将从错题本移除。
        </p>
      </header>

      <ul className="review-list">
        {items.map(({ lessonId, lessonTitle, questionId }) => {
          const lesson = lessons.find((l) => l.id === lessonId)
          const q = lesson?.quizzes.find((x) => x.id === questionId)
          if (!q) return null
          const k = keyFor(lessonId, questionId)
          const picked = choices[k]
          const isSubmitted = submitted[k]
          const correct = picked === q.correctIndex

          return (
            <li key={k} className="review-card">
              <div className="review-card-head">
                <span className="badge badge-soft">{lessonTitle}</span>
                <Link to={`/lessons/${lessonId}`} className="link-inline">
                  查看整课
                </Link>
              </div>
              <p className="quiz-prompt">{q.prompt}</p>
              <div className="options">
                {q.options.map((opt, i) => {
                  const selected = picked === i
                  let cls = 'option'
                  if (selected) cls += ' option-selected'
                  if (isSubmitted) {
                    if (i === q.correctIndex) cls += ' option-correct'
                    else if (selected && !correct) cls += ' option-wrong'
                  }
                  return (
                    <label key={i} className={cls}>
                      <input
                        type="radio"
                        name={k}
                        checked={selected}
                        disabled={isSubmitted}
                        onChange={() =>
                          setChoices((c) => ({ ...c, [k]: i }))
                        }
                      />
                      <span>{opt}</span>
                    </label>
                  )
                })}
              </div>
              {!isSubmitted ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={picked === undefined}
                  onClick={() => {
                    registerQuizResult(lessonId, [
                      { questionId, correct: picked === q.correctIndex },
                    ])
                    setSubmitted((s) => ({ ...s, [k]: true }))
                  }}
                >
                  提交本题
                </button>
              ) : (
                <p className="review-feedback">
                  {correct ? (
                    <span className="text-ok">答对了，已从错题本移除。</span>
                  ) : (
                    <span className="text-bad">再想想看，或回到课程复习原文。</span>
                  )}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
