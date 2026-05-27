import { lessons } from '../data/lessons'
import { useProgress } from '../context/ProgressContext'
import { hasLessonPassed } from '../lib/progress'

export function ProgressPage() {
  const { progress } = useProgress()

  return (
    <div className="page">
      <header className="page-header">
        <h1>学习进度</h1>
        <p className="page-sub">
          数据保存在本机浏览器。清除站点数据会丢失进度。后续若需要账号同步，可再接入后端。
        </p>
      </header>

      <section className="stats-row" aria-label="总览">
        <div className="stat-card">
          <span className="stat-value">{progress.streak}</span>
          <span className="stat-label">连续学习天数</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {lessons.filter((lesson) => hasLessonPassed(progress, lesson.id)).length}/{lessons.length}
          </span>
          <span className="stat-label">已完成课程</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {progress.lastActiveDate ?? '—'}
          </span>
          <span className="stat-label">最近活跃日</span>
        </div>
      </section>

      <section className="section-block">
        <h2>各课测验记录</h2>
        <p className="page-sub small">
          仅记录最近一次提交的答对题数。
        </p>
        <table className="progress-table">
          <thead>
            <tr>
              <th>课程</th>
              <th>最近答对</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((l) => {
              const stat = progress.quizStats[l.id]
              const done = hasLessonPassed(progress, l.id)
              return (
                <tr key={l.id}>
                  <td>{l.title}</td>
                  <td>
                    {stat ? `${stat.correct}/${stat.total}` : '—'}
                  </td>
                  <td>{done ? '已标记学完' : '进行中'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}
