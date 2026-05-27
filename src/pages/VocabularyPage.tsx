import { useMemo, useState } from 'react'
import { useProgress } from '../context/ProgressContext'
import { getAllBooks } from '../lib/booksIndex'
import { MiniSpeechButton } from '../components/SpeechButton'

type FilterType = 'all' | 'book' | 'recent'

export function VocabularyPage() {
  const { progress, removeVocabulary } = useProgress()
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedBookId, setSelectedBookId] = useState<string>('')

  const vocabularyEntries = useMemo(() => {
    const entries = Object.entries(progress.vocabularyBook).map(([word, data]) => ({
      word,
      ...data,
    }))

    switch (filter) {
      case 'book':
        if (!selectedBookId) return entries
        return entries.filter((e) => e.bookId === selectedBookId)
      case 'recent':
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        return entries.filter((e) => new Date(e.addedAt).getTime() > weekAgo)
      default:
        return entries
    }
  }, [progress.vocabularyBook, filter, selectedBookId])

  const books = useMemo(() => getAllBooks(), [])

  const totalCount = vocabularyEntries.length

  return (
    <div className="page">
      <header className="page-header">
        <h1>生词本</h1>
        <p className="page-sub">
          共 {totalCount} 个生词
        </p>
      </header>

      {/* 过滤器 */}
      <section className="section-block">
        <div className="vocabulary-controls">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button
            className={`filter-btn ${filter === 'recent' ? 'active' : ''}`}
            onClick={() => setFilter('recent')}
          >
            最近7天
          </button>
          <button
            className={`filter-btn ${filter === 'book' ? 'active' : ''}`}
            onClick={() => setFilter('book')}
          >
            按书籍筛选
          </button>
        </div>

        {filter === 'book' && (
          <select
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            className="book-filter-select"
          >
            <option value="">选择书籍</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        )}
      </section>

      {/* 生词列表 */}
      {totalCount === 0 ? (
        <div className="empty-state">
          <p>还没有收集任何生词</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            在阅读时点击词汇即可添加到生词本
          </p>
        </div>
      ) : (
        <div className="vocabulary-grid">
          {vocabularyEntries.map((entry) => (
            <div key={entry.word} className="vocabulary-card">
              <div className="vocabulary-word-header">
                <span className="vocabulary-word-ja">{entry.word}</span>
                <MiniSpeechButton word={entry.word} reading={entry.reading} className="vocabulary-speech-btn" />
                <button
                  className="remove-btn"
                  onClick={() => {
                    if (window.confirm(`确定要删除"${entry.word}"吗？`)) {
                      removeVocabulary(entry.word)
                    }
                  }}
                  title="删除"
                >
                  ×
                </button>
              </div>
              {entry.reading && (
                <div className="vocabulary-reading">{entry.reading}</div>
              )}
              <div className="vocabulary-meaning">{entry.meaning}</div>
              {entry.context && (
                <div className="vocabulary-context">
                  "{entry.context}"
                </div>
              )}
              <div className="vocabulary-meta">
                <span className="vocabulary-date">
                  {new Date(entry.addedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
