import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { n3MoatVocab } from '../data/memoryMethods'
import type { MoatVocabEntry } from '../types'
import { getSRS } from '../lib/srs'
import type { SRSReviewResult } from '../lib/srs'

type TabId = 'review' | 'new' | 'quiz' | 'stats'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type QuizQ = {
  id: string
  promptWord: string
  promptReading: string
  options: string[]
  correctIndex: number
}

const GENERIC_DISTRACTORS = [
  '跑步', '看书', '红色的', '便宜的', '学校',
  '大的', '下雨', '吃鱼', '车站', '白色',
  '写信', '医院', '山', '新', '安静',
]

function buildQuizQuestions(pool: MoatVocabEntry[], count: number): QuizQ[] {
  if (pool.length === 0) return []
  const base = shuffle(pool)
  const out: QuizQ[] = []
  for (let i = 0; i < count; i++) {
    const entry = base[i % base.length]
    const otherMeanings = shuffle(
      pool.filter((e) => e.id !== entry.id).map((e) => e.meaning),
    )
    const wrong: string[] = []
    for (const m of otherMeanings) {
      if (wrong.length >= 3) break
      if (!wrong.includes(m)) wrong.push(m)
    }
    let fillerIdx = 0
    while (wrong.length < 3) {
      const f = GENERIC_DISTRACTORS[fillerIdx % GENERIC_DISTRACTORS.length]
      fillerIdx += 1
      if (!wrong.includes(f) && f !== entry.meaning) wrong.push(f)
    }
    const options = shuffle([entry.meaning, ...wrong.slice(0, 3)])
    const correctIndex = options.indexOf(entry.meaning)
    out.push({
      id: `${entry.id}-${i}`,
      promptWord: entry.word,
      promptReading: entry.reading,
      options,
      correctIndex,
    })
  }
  return out
}

export function N3VocabPage() {
  const [tab, setTab] = useState<TabId>('review')
  const [filter, setFilter] = useState<'all' | 'kanji' | 'kana' | 'kata'>('all')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const srs = useMemo(() => getSRS(), [tick])

  const filtered = useMemo(() => n3MoatVocab.filter((e) => {
    if (filter === 'kanji') return /[一-鿿]/.test(e.word)
    if (filter === 'kana') return /^[぀-ゟ]+$/.test(e.word)
    if (filter === 'kata') return /^[゠-ヿ]+$/.test(e.word)
    return true
  }), [filter])

  const filteredIds = useMemo(() => filtered.map((e) => e.id), [filtered])

  const dueIds = useMemo(() => srs.getDueCards(filteredIds), [srs, filteredIds])
  const newIds = useMemo(() => filteredIds.filter((id) => srs.isNew(id)), [srs, filteredIds])
  const stats = useMemo(() => srs.getStats(), [srs])

  const reviewCount = dueIds.length
  const newCount = newIds.length

  return (
    <div className="page word-moat-page">
      <header className="page-header moat-page-header">
        <Link to="/lessons/words" className="back-link">← 返回单词库</Link>
        <h1>N3 词汇</h1>
        <StatsBar stats={stats} dueCount={reviewCount} newCount={newCount} />
      </header>

      <div className="word-moat-body">
        <nav className="moat-mode-sidebar" aria-label="学习模式">
          <div className="moat-mode-hero" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'review'}
              className={`moat-mode-tile ${tab === 'review' ? 'active' : ''} ${reviewCount === 0 ? 'tile-empty' : ''}`}
              onClick={() => setTab('review')}
            >
              <span className="moat-mode-tile-icon" aria-hidden>復</span>
              <span className="moat-mode-tile-text">
                <span className="moat-mode-tile-title">待复习</span>
                <span className="moat-mode-tile-desc">
                  {reviewCount > 0
                    ? `${reviewCount} 个词需要复习`
                    : '全部复习完毕 ✓'}
                </span>
              </span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'new'}
              className={`moat-mode-tile ${tab === 'new' ? 'active' : ''} ${newCount === 0 ? 'tile-empty' : ''}`}
              onClick={() => setTab('new')}
            >
              <span className="moat-mode-tile-icon" aria-hidden>新</span>
              <span className="moat-mode-tile-text">
                <span className="moat-mode-tile-title">学新词</span>
                <span className="moat-mode-tile-desc">
                  {newCount > 0 ? `${newCount} 个新词待学习` : '已学完所有词 ✓'}
                </span>
              </span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'quiz'}
              className={`moat-mode-tile ${tab === 'quiz' ? 'active' : ''}`}
              onClick={() => setTab('quiz')}
            >
              <span className="moat-mode-tile-icon" aria-hidden>試</span>
              <span className="moat-mode-tile-text">
                <span className="moat-mode-tile-title">测验</span>
                <span className="moat-mode-tile-desc">四选一随机测验</span>
              </span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'stats'}
              className={`moat-mode-tile ${tab === 'stats' ? 'active' : ''}`}
              onClick={() => setTab('stats')}
            >
              <span className="moat-mode-tile-icon" aria-hidden>統</span>
              <span className="moat-mode-tile-text">
                <span className="moat-mode-tile-title">统计</span>
                <span className="moat-mode-tile-desc">学习数据总览</span>
              </span>
            </button>
          </div>
        </nav>

        <div className="moat-panel">
        {tab === 'review' && (
          <FlashcardSession
            ids={dueIds}
            vocabMap={Object.fromEntries(filtered.map((e) => [e.id, e]))}
            filter={filter}
            onFilterChange={(f) => { setFilter(f); }}
            title="复习"
            onDone={() => setTick((n) => n + 1)}
          />
        )}
        {tab === 'new' && (
          <FlashcardSession
            ids={newIds}
            vocabMap={Object.fromEntries(filtered.map((e) => [e.id, e]))}
            filter={filter}
            onFilterChange={(f) => { setFilter(f); }}
            title="学新词"
            onDone={() => setTick((n) => n + 1)}
          />
        )}
        {tab === 'quiz' && <QuizPanel pool={filtered} />}
        {tab === 'stats' && <StatsPanel srs={srs} allIds={filteredIds} vocabMap={Object.fromEntries(n3MoatVocab.map((e) => [e.id, e]))} />}
        </div>
      </div>
    </div>
  )
}

/* ── Stats Bar ── */

function StatsBar({ stats, dueCount, newCount }: {
  stats: ReturnType<ReturnType<typeof getSRS>['getStats']>
  dueCount: number
  newCount: number
}) {
  return (
    <div className="srs-top-bar">
      <div className="srs-stat-chip">
        <span className="srs-stat-num">{dueCount}</span>
        <span className="srs-stat-label">待复习</span>
      </div>
      <div className="srs-stat-chip">
        <span className="srs-stat-num">{newCount}</span>
        <span className="srs-stat-label">待学习</span>
      </div>
      <div className="srs-stat-chip">
        <span className="srs-stat-num">{stats.mastered}</span>
        <span className="srs-stat-label">已掌握</span>
      </div>
      <div className="srs-stat-chip">
        <span className="srs-stat-num">{stats.todayReviewed}</span>
        <span className="srs-stat-label">今日已练</span>
      </div>
      <div className="srs-stat-chip srs-streak-chip">
        <span className="srs-stat-num">{stats.streak}</span>
        <span className="srs-stat-label">天连续</span>
      </div>
    </div>
  )
}

/* ── Shared: Flashcard Session ── */

function FlashcardSession({ ids, vocabMap, filter, onFilterChange, title, onDone }: {
  ids: string[]
  vocabMap: Record<string, MoatVocabEntry>
  filter: string
  onFilterChange: (f: 'all' | 'kanji' | 'kana' | 'kata') => void
  title: string
  onDone: () => void
}) {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const pool = ids.map((id) => vocabMap[id]).filter(Boolean)
  const len = pool.length
  const current = len > 0 ? pool[idx % len] : null
  const progress = idx

  const handleRate = useCallback((result: SRSReviewResult) => {
    if (!current) return
    const srs = getSRS()
    srs.recordReview(current.id, result)
    if (idx + 1 >= len) {
      onDone()
    }
    setFlipped(false)
    setIdx((i) => Math.min(i + 1, len))
  }, [current, idx, len, onDone])

  if (len === 0) {
    return (
      <section className="section-block moat-study-section">
        <div className="srs-session-complete">
          <div className="srs-complete-icon">✓</div>
          <h2>{title}</h2>
          <p>当前没有需要处理的词{filter !== 'all' ? '（当前筛选）' : ''}</p>
          <div className="moat-filter-group" style={{ marginTop: '1rem' }}>
            {(['all', 'kanji', 'kana', 'kata'] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`moat-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => onFilterChange(f)}
              >
                {f === 'all' ? '全部' : f === 'kanji' ? '汉字' : f === 'kana' ? '平假名' : '片假名'}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (progress >= len) {
    return (
      <section className="section-block moat-study-section">
        <div className="srs-session-complete">
          <div className="srs-complete-icon">✓</div>
          <h2>本轮完成！</h2>
          <p>已处理 {len} 个词，继续保持！</p>
          <button
            type="button"
            className="moat-nav-btn primary"
            onClick={() => setIdx(0)}
            style={{ marginTop: '1rem' }}
          >
            再来一轮
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="section-block moat-study-section" aria-label={title}>
      <div className="moat-study-layout">
        <div className="moat-study-toolbar">
          <span className="moat-counter">{progress + 1} / {len}</span>
          <div className="srs-progress-bar-wrap">
            <div className="srs-progress-bar" style={{ width: `${((progress) / len) * 100}%` }} />
          </div>
          <div className="moat-filter-group">
            {(['all', 'kanji', 'kana', 'kata'] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`moat-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => onFilterChange(f)}
              >
                {f === 'all' ? '全部' : f === 'kanji' ? '汉字' : f === 'kana' ? '平假名' : '片假名'}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={`moat-flip-card ${flipped ? 'is-flipped' : ''}`}
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? '显示正面' : '显示背面'}
        >
          {!flipped ? (
            <div className="moat-card-face moat-card-front">
              <span className="moat-card-label">正面</span>
              <div className="moat-card-word">{current!.word}</div>
              <div className="moat-card-reading">{current!.reading}</div>
              <p className="moat-card-hint">点击翻面查看记忆档案</p>
            </div>
          ) : (
            <div className="moat-card-face moat-card-back">
              <span className="moat-card-label">背面 · 记忆档案</span>
              <div className="moat-card-meaning">{current!.meaning}</div>
              <ul className="moat-element-list">
                {current!.elements.map((el) => (
                  <li key={el.element + el.method}>
                    <strong>{el.element}</strong>
                    <span className="moat-el-method">{el.method}</span>
                    <div className="moat-el-bridge">C：{el.bridgeC}</div>
                  </li>
                ))}
              </ul>
              <p className="moat-scene">
                <span className="moat-scene-title">合并场景</span>
                {current!.mergedScene}
              </p>
              <p className="moat-review-hint">
                <span className="moat-scene-title">复习要点</span>
                {current!.reviewHint}
              </p>
              {current!.confusionNote && (
                <p className="moat-confusion">易混：{current!.confusionNote}</p>
              )}
              <div className="moat-difficulty">
                难度：{'⭐'.repeat(current!.difficultyStars)}
              </div>
            </div>
          )}
        </button>

        {flipped && (
          <div className="srs-rate-bar">
            <span className="srs-rate-label">你记住了吗？</span>
            <div className="srs-rate-buttons">
              <button type="button" className="srs-rate-btn srs-rate-forgot" onClick={() => handleRate('forgot')}>
                <span className="srs-rate-icon">✗</span>
                <span>没记住</span>
              </button>
              <button type="button" className="srs-rate-btn srs-rate-hard" onClick={() => handleRate('hard')}>
                <span className="srs-rate-icon">◐</span>
                <span>模糊</span>
              </button>
              <button type="button" className="srs-rate-btn srs-rate-ok" onClick={() => handleRate('ok')}>
                <span className="srs-rate-icon">✓</span>
                <span>记住了</span>
              </button>
              <button type="button" className="srs-rate-btn srs-rate-easy" onClick={() => handleRate('easy')}>
                <span className="srs-rate-icon">★</span>
                <span>太简单</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ── 随机测验 ── */

function QuizPanel({ pool }: { pool: MoatVocabEntry[] }) {
  const [questions, setQuestions] = useState<QuizQ[]>(() =>
    buildQuizQuestions(pool, Math.min(10, Math.max(4, pool.length))),
  )
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const q = questions[step]

  const restart = () => {
    setQuestions(buildQuizQuestions(pool, Math.min(10, Math.max(4, pool.length))))
    setStep(0)
    setScore(0)
    setPicked(null)
    setDone(false)
  }

  if (pool.length === 0) {
    return (
      <section className="section-block">
        <p className="empty-state">词表为空，无法出题。</p>
      </section>
    )
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <section className="section-block moat-quiz-section" aria-live="polite">
        <h2 className="moat-quiz-title">本轮结束</h2>
        <p className="moat-quiz-score">
          得分 {score} / {questions.length}（{pct}%）
        </p>
        <p className="moat-quiz-score-hint">
          {pct >= 80 ? '太棒了！' : pct >= 60 ? '不错，继续加油！' : '还需要多复习哦！'}
        </p>
        <button type="button" className="moat-nav-btn primary" onClick={restart}>
          再测一轮
        </button>
      </section>
    )
  }

  if (!q) return null

  const onPick = (idx: number) => {
    if (picked !== null) return
    setPicked(idx)
    if (idx === q.correctIndex) {
      setScore((s) => s + 1)
    }
    window.setTimeout(() => {
      if (step + 1 >= questions.length) {
        setDone(true)
      } else {
        setStep((s) => s + 1)
        setPicked(null)
      }
    }, 650)
  }

  return (
    <section className="section-block moat-quiz-section" aria-label="四选一测验">
      <div className="moat-quiz-head">
        <span>第 {step + 1} / {questions.length} 题</span>
        <span>当前得分 {score}</span>
      </div>
      <div className="moat-quiz-prompt">
        <div className="moat-quiz-word">{q.promptWord}</div>
        <div className="moat-quiz-reading">{q.promptReading}</div>
        <p className="moat-quiz-instruction">选择正确的中文释义</p>
      </div>
      <div className="moat-quiz-options">
        {q.options.map((opt, idx) => {
          let cls = 'moat-option-btn'
          if (picked !== null) {
            if (idx === q.correctIndex) cls += ' correct'
            else if (idx === picked) cls += ' wrong'
          }
          return (
            <button
              key={opt + idx}
              type="button"
              className={cls}
              disabled={picked !== null}
              onClick={() => onPick(idx)}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </section>
  )
}

/* ── 统计面板 ── */

function StatsPanel({ srs, allIds, vocabMap }: {
  srs: ReturnType<typeof getSRS>
  allIds: string[]
  vocabMap: Record<string, MoatVocabEntry>
}) {
  const stats = srs.getStats()
  const dueIds = srs.getDueCards(allIds)

  const levelDistribution = useMemo(() => {
    const dist: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }
    for (const id of allIds) {
      const card = srs.getCardState(id)
      if (card) {
        dist[card.level] = (dist[card.level] ?? 0) + 1
      } else {
        dist[0] = (dist[0] ?? 0) + 1
      }
    }
    return dist
  }, [srs, allIds])

  const levelLabels = ['未学', '4分钟', '10分钟', '30分钟', '1天', '2天', '4天', '7天', '15天', '30天', '60天']
  const maxDist = Math.max(...Object.values(levelDistribution), 1)

  const upcoming = useMemo(() => {
    return dueIds.slice(0, 15).map((id) => {
      const entry = vocabMap[id]
      const card = srs.getCardState(id)
      if (!entry) return null
      return {
        id,
        word: entry.word,
        reading: entry.reading,
        meaning: entry.meaning,
        level: card?.level ?? 0,
        nextReview: card?.nextReview ?? 0,
        accuracy: card ? (card.totalReviews > 0 ? Math.round((card.correctReviews / card.totalReviews) * 100) : 0) : 0,
      }
    }).filter(Boolean)
  }, [dueIds, srs, vocabMap])

  return (
    <section className="section-block srs-stats-section">
      <div className="srs-stats-grid">
        <div className="srs-stat-card srs-stat-today">
          <h3>今日学习</h3>
          <div className="srs-stat-row">
            <span className="srs-big-num">{stats.todayNew}</span>
            <span>新学单词</span>
          </div>
          <div className="srs-stat-row">
            <span className="srs-big-num">{stats.todayReviewed}</span>
            <span>复习单词</span>
          </div>
          <div className="srs-stat-row">
            <span className="srs-big-num">
              {stats.todayReviewed > 0 ? Math.round((stats.todayCorrect / stats.todayReviewed) * 100) : 0}%
            </span>
            <span>正确率</span>
          </div>
        </div>

        <div className="srs-stat-card srs-stat-overall">
          <h3>总体进度</h3>
          <div className="srs-stat-row">
            <span className="srs-big-num">{stats.total}</span>
            <span>已学单词 / {allIds.length}</span>
          </div>
          <div className="srs-stat-row">
            <span className="srs-big-num">{stats.learning}</span>
            <span>学习中</span>
          </div>
          <div className="srs-stat-row">
            <span className="srs-big-num">{stats.mastered}</span>
            <span>已掌握</span>
          </div>
          <div className="srs-stat-row srs-streak-row">
            <span className="srs-big-num">{stats.streak}</span>
            <span>天连续学习</span>
          </div>
        </div>
      </div>

      <div className="srs-stat-card" style={{ marginTop: '1.5rem' }}>
        <h3>记忆阶段分布</h3>
        <div className="srs-level-bars">
          {Object.entries(levelDistribution).map(([level, count]) => (
            <div key={level} className="srs-level-row">
              <span className="srs-level-label">{levelLabels[Number(level)] ?? `Lv${level}`}</span>
              <div className="srs-level-bar-wrap">
                <div
                  className={`srs-level-bar ${Number(level) === 0 ? 'level-new' : Number(level) >= 5 ? 'level-mastered' : 'level-learning'}`}
                  style={{ width: `${(count / maxDist) * 100}%` }}
                />
              </div>
              <span className="srs-level-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="srs-stat-card" style={{ marginTop: '1.5rem' }}>
          <h3>接下来要复习</h3>
          <div className="srs-upcoming-list">
            {upcoming.map((item) => item && (
              <div key={item.id} className="srs-upcoming-item">
                <strong>{item.word}</strong>
                <span className="srs-upcoming-reading">{item.reading}</span>
                <span className="srs-upcoming-meaning">{item.meaning}</span>
                {item.accuracy > 0 && (
                  <span className={`srs-upcoming-acc ${item.accuracy >= 80 ? 'acc-good' : item.accuracy >= 50 ? 'acc-mid' : 'acc-low'}`}>
                    {item.accuracy}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
