import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { books as builtinBooks, type Book } from '../data/books'
import { useProgress } from '../context/ProgressContext'
import { clearCustomBooks, loadCustomBooks, upsertCustomBook } from '../lib/customBooks'
import { todayLocal } from '../lib/dates'

type ImportError = string | null

function isValidBookLike(raw: any): raw is Book {
  return typeof raw?.id === 'string' && typeof raw?.title === 'string'
}

export function ReadingPage() {
  const { progress } = useProgress()

  const [customBooks, setCustomBooks] = useState(() => loadCustomBooks())
  const [importError, setImportError] = useState<ImportError>(null)
  const [showGoalSettings, setShowGoalSettings] = useState(false)
  const [tempGoal, setTempGoal] = useState(progress.dailyReadingGoal)
  const [activeBookId, setActiveBookId] = useState<string | null>(null)

  const allBooks = useMemo(
    () => [...builtinBooks, ...customBooks],
    [customBooks],
  )

  const activeBook = useMemo(
    () => (activeBookId ? allBooks.find((b) => b.id === activeBookId) : null),
    [activeBookId, allBooks],
  )

  const completedCount = progress.completedChapterIds.length
  const totalCount = allBooks.reduce((n, b) => n + b.chapters.length, 0)

  const today = todayLocal()
  const todayReadingTime = progress.readingTimeByDate[today] || 0
  const readingGoal = progress.dailyReadingGoal
  const goalProgress = Math.min((todayReadingTime / readingGoal) * 100, 100)
  const goalReached = todayReadingTime >= readingGoal

  async function handleImportFile(file: File) {
    setImportError(null)
    const text = await file.text()

    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      setImportError('JSON 解析失败：请确认文件内容是合法 JSON。')
      return
    }

    const raw = parsed as any
    if (!isValidBookLike(raw) || !Array.isArray(raw?.chapters)) {
      setImportError('JSON 结构不正确：需要至少包含 id/title/chapters。')
      return
    }

    const allowedLevels = new Set(['N5', 'N4', 'N3', 'N2', 'N1', '高考日语'])
    const level =
      typeof raw.level === 'string' && allowedLevels.has(raw.level)
        ? raw.level
        : 'N5'
    const tags = Array.isArray(raw.tags) ? raw.tags.filter((t: any) => typeof t === 'string') : []
    const vocabulary =
      Array.isArray(raw.vocabulary) && raw.vocabulary
        ? raw.vocabulary
            .filter((v: any) => typeof v?.word === 'string' && typeof v?.meaning === 'string')
            .map(
              (v: any) =>
                ({
                  word: v.word,
                  reading: typeof v.reading === 'string' ? v.reading : undefined,
                  meaning: v.meaning,
                }) as Book['vocabulary'][number],
            )
        : []

    const chapters = raw.chapters
      .filter((c: any) => typeof c?.id === 'string' && typeof c?.title === 'string')
      .map(
        (c: any) =>
          ({
            id: c.id,
            title: c.title,
            paragraphs: Array.isArray(c.paragraphs)
              ? c.paragraphs.filter((p: any) => typeof p === 'string')
              : [],
          }) as Book['chapters'][number],
      )
      .filter((c: any) => c.paragraphs.length > 0)

    if (chapters.length === 0) {
      setImportError('章节 chapters 里没有可用段落 paragraphs。')
      return
    }

    upsertCustomBook({
      id: raw.id,
      title: raw.title,
      level,
      tags,
      vocabulary,
      chapters,
    })
    setCustomBooks(loadCustomBooks())
  }

  const { setDailyReadingGoal } = useProgress()

  function handleSaveGoal() {
    setDailyReadingGoal(tempGoal)
    setShowGoalSettings(false)
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>阅读</h1>
        <p className="page-sub">
          已完成 {completedCount} / {totalCount} 章
        </p>
      </header>

      {/* 阅读目标 */}
      <section className="reading-goal-section">
        <div className="reading-goal-header">
          <h2>今日目标</h2>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowGoalSettings(!showGoalSettings)}
          >
            {showGoalSettings ? '取消' : '设置'}
          </button>
        </div>

        {showGoalSettings ? (
          <div className="reading-goal-controls">
            <label>
              每日目标（分钟）：
              <input
                type="number"
                min="5"
                max="120"
                step="5"
                value={tempGoal}
                onChange={(e) => setTempGoal(Number(e.target.value))}
                className="goal-input"
              />
            </label>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveGoal}
            >
              保存
            </button>
          </div>
        ) : (
          <>
            <div className="reading-progress-bar">
              <div
                className="reading-progress-fill"
                style={{ width: `${goalProgress}%` }}
              >
                {goalReached ? '🎉 已达成' : `${Math.round(goalProgress)}%`}
              </div>
            </div>

            <div className="reading-stats-grid">
              <div className="reading-stat-item">
                <div className="reading-stat-value">{Math.round(todayReadingTime)}</div>
                <div className="reading-stat-label">今日（分钟）</div>
              </div>
              <div className="reading-stat-item">
                <div className="reading-stat-value">{readingGoal}</div>
                <div className="reading-stat-label">每日目标</div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* 书籍列表 */}
      <section className="section-block">
        <div className="section-header-modern">
          <h2>书籍</h2>
        </div>

        {/* 导入自定义书籍 */}
        <div className="import-card">
          <h3>导入自定义书籍（JSON）</h3>
          <p className="page-sub">
            适用于你有权使用的日文文本。把每章拆成若干段落 paragraphs。
          </p>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            选择 JSON 文件
            <input
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                void handleImportFile(f)
                e.target.value = ''
              }}
            />
          </label>
          {importError ? <p className="import-error">{importError}</p> : null}
        </div>

        {customBooks.length > 0 ? (
          <div className="read-actions-row">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const ok = window.confirm('确定清除已导入的自定义书籍？')
                if (!ok) return
                clearCustomBooks()
                setCustomBooks([])
              }}
            >
              清除已导入书籍
            </button>
          </div>
        ) : null}

        <div className="bookshelf-wrap" aria-label="书架">
          <div className="bookshelf-covers">
            {allBooks.map((book) => {
              const isBuiltin = builtinBooks.some((b) => b.id === book.id)
              const isActive = activeBookId === book.id
              const completedChapters = book.chapters.reduce((n, ch) => {
                const chapterKey = `${book.id}::${ch.id}`
                return n + (progress.completedChapterIds.includes(chapterKey) ? 1 : 0)
              }, 0)

              const coverSeed = (book.title || book.id).length
              const hue = (coverSeed * 37) % 360

              return (
                <button
                  key={book.id}
                  type="button"
                  className={`bookshelf-book ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveBookId((prev) => (prev === book.id ? null : book.id))}
                >
                  <div
                    className="bookshelf-cover"
                    style={{
                      background: `linear-gradient(135deg, hsl(${hue} 55% 55%), hsl(${(hue + 40) % 360} 55% 45%))`,
                    }}
                    aria-hidden
                  >
                    <div className="bookshelf-cover-title">{book.title}</div>
                    {book.author ? (
                      <div className="bookshelf-cover-author">{book.author}</div>
                    ) : null}
                  </div>

                  <div className="bookshelf-meta">
                    <div className="bookshelf-meta-title">{book.title}</div>
                    <div className="bookshelf-meta-sub">
                      {isBuiltin ? '内置' : '自定义'} · {book.level} · {completedChapters}/{book.chapters.length} 章
                    </div>
                    {book.tags?.length ? (
                      <div className="bookshelf-tags" aria-label="标签">
                        {book.tags.slice(0, 4).map((t) => (
                          <span key={t} className="bookshelf-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {activeBook ? (
          <div className="book-shelf-detail">
            <div className="book-shelf-detail-head">
              <div>
                <h3 className="book-shelf-detail-title">{activeBook.title}</h3>
                <p className="page-sub">
                  {activeBook.author ? `${activeBook.author} · ` : ''}
                  {activeBook.level} · 共 {activeBook.chapters.length} 章
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setActiveBookId(null)}
              >
                收起
              </button>
            </div>

            <div className="chapter-grid chapter-grid-large">
              {activeBook.chapters.map((ch, i) => {
                const chapterKey = `${activeBook.id}::${ch.id}`
                const done = progress.completedChapterIds.includes(chapterKey)
                const hasBookmark = progress.bookmarks[chapterKey] !== undefined
                return (
                  <Link
                    key={ch.id}
                    to={`/reading/${activeBook.id}/${ch.id}`}
                    className="chapter-card chapter-card-shelf"
                  >
                    <div className="chapter-card-top">
                      <span className="badge badge-soft">第{i + 1}章</span>
                      {done && <span className="badge badge-done">✓</span>}
                      {hasBookmark && <span className="badge">🔖</span>}
                    </div>
                    <div className="chapter-card-title">{ch.title}</div>
                    <div className="chapter-card-meta">{ch.paragraphs.length} 段</div>
                  </Link>
                )
              })}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
