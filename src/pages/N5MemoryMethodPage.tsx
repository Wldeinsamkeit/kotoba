import { useState, useCallback, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { speakJapaneseAsync, stopJapaneseSpeech } from '../lib/japaneseSpeech'
import { getSRS } from '../lib/srs'

type MemoryMethodEntry = {
  word: string
  reading: string
  meaning: string
  elements: Array<{
    element: string
    method: string
    bridgeC: string
  }>
  mergedScene: string
  sceneScore: {
    specific: boolean
    emotional: boolean
    personal: boolean
    total: number
  }
  reviewTip: string
  difficultyStars: number
  exampleSentences?: Array<{
    ja: string
    zh: string
  }>
}

type TabId = 'list' | 'cards'

// 读取 batch_12 记忆方法数据
async function loadBatchMemoryMethods(batchNum: number): Promise<MemoryMethodEntry[]> {
  try {
    const response = await fetch(`/data/memory_methods/batch_${batchNum}_methods.json`)
    if (!response.ok) throw new Error('Failed to load')
    const data = await response.json()
    return data
  } catch {
    return []
  }
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="difficulty-stars">
      {[1, 2, 3].map((s) => (
        <span key={s} className={s <= stars ? 'star-filled' : 'star-empty'}>
          {s <= stars ? '★' : '☆'}
        </span>
      ))}
    </div>
  )
}

function PlayButton({ text, size = 'md' }: { text: string; size?: 'sm' | 'md' | 'lg' }) {
  const [playing, setPlaying] = useState(false)

  const handlePlay = useCallback(async () => {
    if (playing) {
      stopJapaneseSpeech()
      setPlaying(false)
      return
    }
    setPlaying(true)
    try {
      await speakJapaneseAsync(text)
    } catch {
      // 播放失败时静默处理
    } finally {
      setPlaying(false)
    }
  }, [text, playing])

  const sizeClass = size === 'sm' ? 'play-btn-sm' : size === 'lg' ? 'play-btn-lg' : ''

  return (
    <button
      className={`memory-play-btn ${sizeClass} ${playing ? 'playing' : ''}`}
      onClick={handlePlay}
      disabled={playing}
      title="播放发音"
    >
      {playing ? '⏸' : '🔊'}
    </button>
  )
}

export function N5MemoryMethodPage() {
  const [batchNum, setBatchNum] = useState(12)
  const [allWords, setAllWords] = useState<MemoryMethodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabId>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [reviewFeedback, setReviewFeedback] = useState('先看日语，回忆意思，再选择你的掌握程度。')
  const [showAll, setShowAll] = useState(false)
  const [tick, setTick] = useState(0)

  const srs = useMemo(() => getSRS(), [tick])

  // 加载批次数据
  const loadBatch = useCallback(async (num: number) => {
    setLoading(true)
    const data = await loadBatchMemoryMethods(num)
    setAllWords(data)
    setLoading(false)
  }, [])

  // 初始加载
  useEffect(() => {
    loadBatch(batchNum)
  }, [batchNum, loadBatch])

  // 筛选需要背诵的单词
  const words = useMemo(() => {
    if (showAll) return allWords

    const allIds = allWords.map((w) => w.word)
    const dueIds = srs.getDueCards(allIds)
    const newIds = allIds.filter((id) => srs.isNew(id))
    const dueSet = new Set([...dueIds, ...newIds])

    return allWords.filter((w) => dueSet.has(w.word))
  }, [allWords, showAll, srs])

  // 搜索过滤
  const filteredWords = useMemo(() => {
    if (!searchQuery) return words
    const q = searchQuery.toLowerCase()
    return words.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.reading.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q)
    )
  }, [words, searchQuery])

  const currentReviewWord =
    filteredWords.length > 0
      ? filteredWords[currentCardIndex % filteredWords.length]
      : null

  useEffect(() => {
    if (currentCardIndex >= filteredWords.length) {
      setCurrentCardIndex(0)
    }
  }, [currentCardIndex, filteredWords.length])

  const handleSrsReview = useCallback((nextHint: string) => {
    setReviewFeedback(nextHint)
    setCurrentCardIndex((index) => {
      if (filteredWords.length === 0) return 0
      return (index + 1) % filteredWords.length
    })
  }, [filteredWords.length])

  // 展开/收起卡片
  const toggleCard = useCallback((word: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(word)) {
        next.delete(word)
      } else {
        next.add(word)
      }
      return next
    })
  }, [])

  // 全部展开/收起
  const expandAll = useCallback(() => {
    setExpandedCards(new Set(filteredWords.map((w) => w.word)))
  }, [filteredWords])

  const collapseAll = useCallback(() => {
    setExpandedCards(new Set())
  }, [])

  return (
    <div className="page memory-method-page">
      <header className="page-header">
        <Link to="/lessons/words" className="back-link">
          ← 返回单词库
        </Link>
        <h1>单词记忆方法</h1>
        <p className="page-sub">
          带发音的N5单词记忆方法 - 批次 {batchNum} ({filteredWords.length} 词)
        </p>
        <div className="memory-filter-toggle">
          <button
            className={`filter-toggle-btn ${!showAll ? 'active' : ''}`}
            onClick={() => { setShowAll(false); setTick((n) => n + 1) }}
          >
            只看背诵词
          </button>
          <button
            className={`filter-toggle-btn ${showAll ? 'active' : ''}`}
            onClick={() => { setShowAll(true); setTick((n) => n + 1) }}
          >
            查看全部
          </button>
        </div>
      </header>

      {/* 批次选择 */}
      <section className="memory-batch-selector">
        <label>选择批次：</label>
        <div className="batch-buttons">
          {[12, 13, 14, 15, 16, 17].map((n) => (
            <button
              key={n}
              className={`batch-btn ${batchNum === n ? 'active' : ''}`}
              onClick={() => {
                setBatchNum(n)
                loadBatch(n)
                setExpandedCards(new Set())
              }}
            >
              批次 {n}
            </button>
          ))}
        </div>
      </section>

      {/* 搜索和控制 */}
      <section className="memory-controls">
        <input
          type="text"
          className="memory-search-input"
          placeholder="搜索单词、读音或含义..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="memory-action-buttons">
          <button className="control-btn" onClick={expandAll}>
            全部展开
          </button>
          <button className="control-btn" onClick={collapseAll}>
            全部收起
          </button>
        </div>
        <div className="tab-buttons">
          <button
            className={`tab-btn ${tab === 'cards' ? 'active' : ''}`}
            onClick={() => setTab('cards')}
          >
            卡片视图
          </button>
          <button
            className={`tab-btn ${tab === 'list' ? 'active' : ''}`}
            onClick={() => setTab('list')}
          >
            列表视图
          </button>
        </div>
      </section>

      {!loading && currentReviewWord && (
        <section className="memory-srs-stage" aria-label="今日单词复习卡">
          <div className="memory-srs-card">
            <div className="memory-srs-top">
              <span className="tag">SRS 复习卡</span>
              <span className="meta">
                {(currentCardIndex % filteredWords.length) + 1}/{filteredWords.length}
              </span>
            </div>
            <div className="memory-srs-word">
              <span className="memory-srs-reading">{currentReviewWord.reading}</span>
              <strong>{currentReviewWord.word}</strong>
              <PlayButton text={currentReviewWord.reading} size="lg" />
            </div>
            <p className="memory-srs-meaning">{currentReviewWord.meaning}</p>
            <p className="memory-srs-scene">{currentReviewWord.mergedScene}</p>
            <div className="memory-srs-actions">
              <button
                type="button"
                onClick={() => handleSrsReview('已放回队列：等会儿再遇见它。')}
              >
                再来一次
              </button>
              <button
                type="button"
                onClick={() => handleSrsReview('已标记迷糊：明天优先复习。')}
              >
                有点迷糊
              </button>
              <button
                type="button"
                onClick={() => handleSrsReview('不错，已切到下一张。')}
              >
                记住了
              </button>
            </div>
            <p className="memory-srs-feedback">{reviewFeedback}</p>
          </div>

          <aside className="memory-srs-method">
            <span className="unit-section-label">记忆方法</span>
            <h2>{currentReviewWord.reviewTip}</h2>
            <ul>
              {currentReviewWord.elements.slice(0, 3).map((element, index) => (
                <li key={`${element.element}-${index}`}>
                  <strong>{element.element}</strong>
                  <span>{element.bridgeC}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      )}

      {/* 加载状态 */}
      {loading && <div className="memory-loading">加载中...</div>}

      {/* 卡片视图 */}
      {!loading && tab === 'cards' && (
        <div className="memory-cards-grid">
          {filteredWords.map((entry) => {
            const isExpanded = expandedCards.has(entry.word)
            return (
              <div
                key={entry.word}
                className={`memory-card ${isExpanded ? 'expanded' : ''}`}
              >
                {/* 卡片头部 */}
                <div className="memory-card-header" onClick={() => toggleCard(entry.word)}>
                  <div className="memory-word-main">
                    <span className="memory-word-kanji">{entry.word}</span>
                    <PlayButton text={entry.reading} size="sm" />
                    <span className="memory-word-reading">{entry.reading}</span>
                    <StarRating stars={entry.difficultyStars} />
                  </div>
                  <span className="memory-card-toggle">{isExpanded ? '▼' : '▶'}</span>
                </div>

                {/* 含义 */}
                <div className="memory-meaning">{entry.meaning}</div>

                {/* 展开内容 */}
                {isExpanded && (
                  <div className="memory-card-body">
                    {/* 记忆点 */}
                    <div className="memory-section">
                      <h4>🧠 记忆点</h4>
                      <ul className="memory-elements">
                        {entry.elements.map((el, idx) => (
                          <li key={idx}>
                            <span className="element-method">[{el.method}]</span>
                            <span className="element-target">{el.element}</span>
                            <span className="element-bridge">{el.bridgeC}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 融合场景 */}
                    <div className="memory-section">
                      <h4>🎬 记忆场景</h4>
                      <p className="memory-scene">{entry.mergedScene}</p>
                    </div>

                    {/* 复习提示 */}
                    <div className="memory-section">
                      <h4>💡 复习提示</h4>
                      <p className="memory-tip">{entry.reviewTip}</p>
                    </div>

                    {/* 例句 */}
                    {entry.exampleSentences && entry.exampleSentences.length > 0 && (
                      <div className="memory-section">
                        <h4>📝 例句</h4>
                        <div className="memory-examples">
                          {entry.exampleSentences.map((ex, idx) => (
                            <div key={idx} className="memory-example-item">
                              <div className="example-ja">
                                    <PlayButton text={ex.ja} size="sm" />
                                    <span>{ex.ja}</span>
                              </div>
                              <div className="example-zh">{ex.zh}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 列表视图 */}
      {!loading && tab === 'list' && (
        <div className="memory-list-view">
          <table className="memory-table">
            <thead>
              <tr>
                <th>单词</th>
                <th>读音</th>
                <th>含义</th>
                <th>难度</th>
                <th>记忆法</th>
              </tr>
            </thead>
            <tbody>
              {filteredWords.map((entry) => (
                <tr key={entry.word}>
                  <td className="list-word">{entry.word}</td>
                  <td className="list-reading">
                    <PlayButton text={entry.reading} size="sm" />
                    {entry.reading}
                  </td>
                  <td className="list-meaning">{entry.meaning}</td>
                  <td className="list-difficulty">
                    <StarRating stars={entry.difficultyStars} />
                  </td>
                  <td className="list-tip">
                    <div className="tip-preview">{entry.reviewTip.split('\n')[0]}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 空状态 */}
      {!loading && filteredWords.length === 0 && (
        <div className="memory-empty">没有找到匹配的单词</div>
      )}
    </div>
  )
}
