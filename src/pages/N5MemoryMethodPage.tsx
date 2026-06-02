import { useState, useCallback, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { speakJapaneseAsync, stopJapaneseSpeech } from '../lib/japaneseSpeech'
import { getSRS } from '../lib/srs'
import {
  getMemoryMethodBatch,
  getMemoryMethodBatchCount,
  getMemoryMethodCount,
  type MemoryMethodEntry,
  type WordLevel,
} from '../data/memoryMethods'

const MEMORY_LEVEL_STORAGE_KEY = 'kotoba-memory-level'

const WORD_LEVELS: Array<{
  id: WordLevel
  title: string
  subtitle: string
  icon: string
}> = [
  { id: 'n5', title: 'N5 词汇', subtitle: '入门基础', icon: '五' },
  { id: 'n4', title: 'N4 词汇', subtitle: '日常会话', icon: '四' },
  { id: 'n3', title: 'N3 词汇', subtitle: '中级进阶', icon: '三' },
]

function parseWordLevel(value: string | null): WordLevel | null {
  if (value === 'n5' || value === 'n4' || value === 'n3') return value
  return null
}

function readInitialLevel(searchParams: URLSearchParams): WordLevel {
  const fromQuery = parseWordLevel(searchParams.get('level'))
  if (fromQuery) return fromQuery
  if (typeof window !== 'undefined') {
    const stored = parseWordLevel(window.localStorage.getItem(MEMORY_LEVEL_STORAGE_KEY))
    if (stored) return stored
  }
  return 'n5'
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
  const [searchParams] = useSearchParams()
  const [level, setLevel] = useState<WordLevel>(() => readInitialLevel(searchParams))
  const [batchNum, setBatchNum] = useState(1)
  const [allWords, setAllWords] = useState<MemoryMethodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [reviewFeedback, setReviewFeedback] = useState('先看日语，回忆意思，再选择你的掌握程度。')
  const [tick, setTick] = useState(0)

  const srs = useMemo(() => getSRS(), [tick])

  const currentLevel = WORD_LEVELS.find((l) => l.id === level)!
  const batchCount = getMemoryMethodBatchCount(level)
  const levelWordCount = getMemoryMethodCount(level)

  const loadBatch = useCallback((lv: WordLevel, num: number) => {
    setLoading(true)
    setAllWords(getMemoryMethodBatch(lv, num))
    setLoading(false)
  }, [])

  useEffect(() => {
    const fromQuery = parseWordLevel(searchParams.get('level'))
    if (fromQuery) {
      setLevel(fromQuery)
      setBatchNum(1)
      setCurrentCardIndex(0)
    }
  }, [searchParams])

  useEffect(() => {
    loadBatch(level, batchNum)
  }, [level, batchNum, loadBatch])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(MEMORY_LEVEL_STORAGE_KEY, level)
    }
  }, [level])

  // 筛选需要背诵的单词
  const words = useMemo(() => {
    const allIds = allWords.map((w) => w.word)
    const dueIds = srs.getDueCards(allIds)
    const newIds = allIds.filter((id) => srs.isNew(id))
    const dueSet = new Set([...dueIds, ...newIds])

    const filtered = allWords.filter((w) => dueSet.has(w.word))
    return filtered.length > 0 ? filtered : allWords
  }, [allWords, srs])

  const currentReviewWord =
    words.length > 0
      ? words[currentCardIndex % words.length]
      : null

  useEffect(() => {
    if (currentCardIndex >= words.length) {
      setCurrentCardIndex(0)
    }
  }, [currentCardIndex, words.length])

  const handleSrsReview = useCallback((nextHint: string) => {
    setReviewFeedback(nextHint)
    setCurrentCardIndex((index) => {
      if (words.length === 0) return 0
      return (index + 1) % words.length
    })
  }, [words.length])

  const handleLevelChange = (lv: WordLevel) => {
    setLevel(lv)
    setBatchNum(1)
    setCurrentCardIndex(0)
    setTick((n) => n + 1)
  }

  useEffect(() => {
    if (batchNum > batchCount && batchCount > 0) {
      setBatchNum(1)
    }
  }, [batchCount, batchNum])

  return (
    <div className="page memory-method-page">
      <header className="page-header">
        <Link to="/lessons/words" className="back-link">
          ← 返回单词库
        </Link>
        <h1>单词记忆复习</h1>
      </header>

      {/* 单词库选择 */}
      <section className="memory-level-selector">
        {WORD_LEVELS.map((lv) => (
          <button
            key={lv.id}
            className={`level-btn ${level === lv.id ? 'active' : ''}`}
            onClick={() => handleLevelChange(lv.id)}
          >
            <span className="level-icon">{lv.icon}</span>
            <div className="level-info">
              <span className="level-title">{lv.title}</span>
              <span className="level-sub">
                {lv.subtitle} · {getMemoryMethodCount(lv.id)} 词
              </span>
            </div>
          </button>
        ))}
      </section>

      {/* 批次选择 */}
      <section className="memory-batch-selector">
        <div className="batch-scroll">
          {Array.from({ length: batchCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`batch-chip ${batchNum === n ? 'active' : ''}`}
              onClick={() => {
                setBatchNum(n)
                setCurrentCardIndex(0)
                setTick((t) => t + 1)
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      {/* 加载状态 */}
      {loading && <div className="memory-loading">加载中...</div>}

      {/* SRS 复习卡 */}
      {!loading && currentReviewWord && (
        <section className="memory-srs-stage" aria-label="今日单词复习卡">
          <div className="memory-srs-card">
            <div className="memory-srs-top">
              <span className="tag">SRS 复习卡</span>
              <span className="meta">
                {(currentCardIndex % words.length) + 1}/{words.length}
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

      {/* 空状态 */}
      {!loading && words.length === 0 && (
        <div className="memory-empty">
          {levelWordCount === 0
            ? `${currentLevel.title} 暂无记忆法数据`
            : '该批次暂无单词数据'}
        </div>
      )}
    </div>
  )
}
