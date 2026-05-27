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

type WordLevel = 'n5' | 'n4' | 'n3'

const WORD_LEVELS: Array<{
  id: WordLevel
  title: string
  subtitle: string
  icon: string
  batchCount: number
}> = [
  { id: 'n5', title: 'N5 词汇', subtitle: '入门基础', icon: '五', batchCount: 17 },
  { id: 'n4', title: 'N4 词汇', subtitle: '日常会话', icon: '四', batchCount: 30 },
  { id: 'n3', title: 'N3 词汇', subtitle: '中级进阶', icon: '三', batchCount: 53 },
]

async function loadMemoryMethods(level: WordLevel, batchNum: number): Promise<MemoryMethodEntry[]> {
  try {
    const path = level === 'n5'
      ? `/data/memory_methods/batch_${String(batchNum).padStart(2, '0')}_methods.json`
      : `/data/memory_methods/${level}/batch_${String(batchNum).padStart(2, '0')}_methods.json`
    const response = await fetch(path)
    if (!response.ok) throw new Error('Failed to load')
    return await response.json()
  } catch {
    return []
  }
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
  const [level, setLevel] = useState<WordLevel>('n5')
  const [batchNum, setBatchNum] = useState(1)
  const [allWords, setAllWords] = useState<MemoryMethodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [reviewFeedback, setReviewFeedback] = useState('先看日语，回忆意思，再选择你的掌握程度。')
  const [tick, setTick] = useState(0)

  const srs = useMemo(() => getSRS(), [tick])

  const currentLevel = WORD_LEVELS.find((l) => l.id === level)!

  // 加载批次数据
  const loadBatch = useCallback(async (lv: WordLevel, num: number) => {
    setLoading(true)
    const data = await loadMemoryMethods(lv, num)
    setAllWords(data)
    setLoading(false)
  }, [])

  // 初始加载
  useEffect(() => {
    loadBatch(level, batchNum)
  }, [level, batchNum, loadBatch])

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
              <span className="level-sub">{lv.subtitle}</span>
            </div>
          </button>
        ))}
      </section>

      {/* 批次选择 */}
      <section className="memory-batch-selector">
        <div className="batch-scroll">
          {Array.from({ length: currentLevel.batchCount }, (_, i) => i + 1).map((n) => (
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
        <div className="memory-empty">该批次暂无单词数据</div>
      )}
    </div>
  )
}
