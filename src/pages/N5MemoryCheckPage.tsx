import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { n5MemoryMethods } from '../data/n5MemoryMethods'
import type { MoatVocabEntry } from '../types'

type CheckMode = 'setup' | 'checking' | 'result'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type CheckResult = {
  entry: MoatVocabEntry
  knewMeaning: boolean | null
  knewReading: boolean | null
}

function loadCheckHistory(): Record<string, { total: number; passed: number }> {
  try {
    const raw = localStorage.getItem('n5-memory-check-history')
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {}
}

function saveCheckHistory(history: Record<string, { total: number; passed: number }>) {
  localStorage.setItem('n5-memory-check-history', JSON.stringify(history))
}

export function N5MemoryCheckPage() {
  const [mode, setMode] = useState<CheckMode>('setup')
  const [count, setCount] = useState(20)
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 1 | 2 | 3>('all')
  const [batchFilter, setBatchFilter] = useState<string>('all')
  const [pool, setPool] = useState<MoatVocabEntry[]>([])
  const [results, setResults] = useState<CheckResult[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  // Batch options
  const batchOptions = useMemo(() => {
    const batches: { label: string; value: string }[] = [{ label: '全部', value: 'all' }]
    const batchSize = 40
    for (let i = 0; i < n5MemoryMethods.length; i += batchSize) {
      const start = i + 1
      const end = Math.min(i + batchSize, n5MemoryMethods.length)
      const batchNum = Math.floor(i / batchSize) + 1
      batches.push({ label: `第${batchNum}批 (${start}-${end})`, value: String(batchNum) })
    }
    return batches
  }, [])

  const filteredPool = useMemo(() => {
    return n5MemoryMethods.filter((e) => {
      if (difficultyFilter !== 'all' && e.difficultyStars !== difficultyFilter) return false
      if (batchFilter !== 'all') {
        const batchSize = 40
        const idx = n5MemoryMethods.indexOf(e)
        const batchNum = Math.floor(idx / batchSize) + 1
        if (String(batchNum) !== batchFilter) return false
      }
      return true
    })
  }, [difficultyFilter, batchFilter])

  const startCheck = useCallback(() => {
    const shuffled = shuffle(filteredPool)
    const selected = shuffled.slice(0, Math.min(count, shuffled.length))
    setPool(selected)
    setResults(selected.map((e) => ({ entry: e, knewMeaning: null, knewReading: null })))
    setCurrentIdx(0)
    setShowAnswer(false)
    setMode('checking')
  }, [filteredPool, count])

  const handleSelfEval = useCallback((knewMeaning: boolean, knewReading: boolean) => {
    const newResults = [...results]
    newResults[currentIdx] = { ...newResults[currentIdx], knewMeaning, knewReading }
    setResults(newResults)

    if (currentIdx + 1 >= pool.length) {
      // Save history
      const history = loadCheckHistory()
      for (const r of newResults) {
        const key = r.entry.id
        if (!history[key]) history[key] = { total: 0, passed: 0 }
        history[key].total++
        if (r.knewMeaning) history[key].passed++
      }
      saveCheckHistory(history)
      setMode('result')
    } else {
      setCurrentIdx((i) => i + 1)
      setShowAnswer(false)
    }
  }, [results, currentIdx, pool])

  // Setup screen
  if (mode === 'setup') {
    return (
      <div className="page word-moat-page">
        <header className="page-header moat-page-header">
          <h1>记忆方法 · 抽查检验</h1>
          <p className="page-sub moat-page-sub">
            随机抽取单词检验记忆效果，共 {n5MemoryMethods.length} 词可抽查
          </p>
        </header>

        <nav className="breadcrumb">
          <Link to="/n5-vocab">N5 词汇</Link>
          <span aria-hidden> / </span>
          <span>抽查检验</span>
        </nav>

        <section className="section-block moat-check-setup">
          <h2>抽查设置</h2>

          <div className="moat-check-field">
            <label>抽查数量</label>
            <div className="moat-check-count-btns">
              {[10, 20, 30, 50].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`moat-filter-btn ${count === n ? 'active' : ''}`}
                  onClick={() => setCount(n)}
                >
                  {n} 词
                </button>
              ))}
            </div>
          </div>

          <div className="moat-check-field">
            <label>难度筛选</label>
            <div className="moat-filter-group">
              {(['all', 1, 2, 3] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`moat-filter-btn ${difficultyFilter === d ? 'active' : ''}`}
                  onClick={() => setDifficultyFilter(d)}
                >
                  {d === 'all' ? '全部' : `${d} 星`}
                </button>
              ))}
            </div>
          </div>

          <div className="moat-check-field">
            <label>批次筛选</label>
            <select
              className="moat-check-select"
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
            >
              {batchOptions.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          <p className="moat-check-pool-info">
            符合条件：{filteredPool.length} 词
          </p>

          <button
            type="button"
            className="moat-nav-btn primary"
            onClick={startCheck}
            disabled={filteredPool.length === 0}
          >
            开始抽查（{Math.min(count, filteredPool.length)} 词）
          </button>
        </section>

        <style>{`
          .moat-check-setup {
            max-width: 480px;
            margin: 0 auto;
            text-align: center;
          }
          .moat-check-setup h2 { margin-bottom: 1.5rem; }
          .moat-check-field {
            margin-bottom: 1.2rem;
          }
          .moat-check-field label {
            display: block;
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
          }
          .moat-check-count-btns {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
          }
          .moat-check-select {
            padding: 0.5rem 1rem;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--bg);
            color: var(--text);
            font-size: 0.95rem;
          }
          .moat-check-pool-info {
            color: var(--text-secondary);
            font-size: 0.85rem;
            margin: 1rem 0;
          }
        `}</style>
      </div>
    )
  }

  // Result screen
  if (mode === 'result') {
    const meaningPass = results.filter((r) => r.knewMeaning === true).length
    const readingPass = results.filter((r) => r.knewReading === true).length
    const total = results.length
    const meaningPct = Math.round((meaningPass / total) * 100)
    const readingPct = Math.round((readingPass / total) * 100)

    const weakWords = results.filter((r) => r.knewMeaning === false || r.knewReading === false)

    return (
      <div className="page word-moat-page">
        <header className="page-header moat-page-header">
          <h1>抽查结果</h1>
        </header>

        <section className="section-block moat-check-result" style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="moat-check-score-grid">
            <div className="moat-check-score-card">
              <div className="moat-check-score-num">{meaningPass}/{total}</div>
              <div className="moat-check-score-label">词义记忆</div>
              <div className="moat-check-score-pct">{meaningPct}%</div>
            </div>
            <div className="moat-check-score-card">
              <div className="moat-check-score-num">{readingPass}/{total}</div>
              <div className="moat-check-score-label">读音记忆</div>
              <div className="moat-check-score-pct">{readingPct}%</div>
            </div>
          </div>

          <p className="moat-check-summary">
            {meaningPct >= 90
              ? '非常棒！记忆方法效果显著！'
              : meaningPct >= 70
                ? '不错！大部分已经记住了。'
                : meaningPct >= 50
                  ? '继续加油，多复习薄弱词汇。'
                  : '建议重新学习记忆方法，加强印象。'}
          </p>

          {weakWords.length > 0 && (
            <div className="moat-check-weak">
              <h3>薄弱词汇（{weakWords.length} 词）</h3>
              <div className="moat-check-weak-list">
                {weakWords.map((r) => (
                  <div key={r.entry.id} className="moat-check-weak-item">
                    <span className="moat-check-weak-word">{r.entry.word}</span>
                    <span className="moat-check-weak-reading">{r.entry.reading}</span>
                    <span className="moat-check-weak-meaning">{r.entry.meaning}</span>
                    <span className="moat-check-weak-tags">
                      {!r.knewMeaning && <span className="tag-wrong">词义</span>}
                      {!r.knewReading && <span className="tag-wrong">读音</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="moat-card-nav" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="moat-nav-btn" onClick={() => setMode('setup')}>
              重新抽查
            </button>
            <button
              type="button"
              className="moat-nav-btn primary"
              onClick={() => {
                // Restart with only weak words
                const weakPool = weakWords.map((r) => r.entry)
                setPool(shuffle(weakPool))
                setResults(weakPool.map((e) => ({ entry: e, knewMeaning: null, knewReading: null })))
                setCurrentIdx(0)
                setShowAnswer(false)
                setMode('checking')
              }}
              disabled={weakWords.length === 0}
            >
              只测薄弱词（{weakWords.length}）
            </button>
          </div>
        </section>

        <style>{`
          .moat-check-score-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }
          .moat-check-score-card {
            background: var(--bg-alt);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
          }
          .moat-check-score-num {
            font-size: 2rem;
            font-weight: 700;
            color: var(--terracotta);
          }
          .moat-check-score-label {
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin: 0.25rem 0;
          }
          .moat-check-score-pct {
            font-size: 1.1rem;
            font-weight: 600;
          }
          .moat-check-summary {
            text-align: center;
            font-size: 1.05rem;
            margin: 1rem 0;
          }
          .moat-check-weak h3 {
            margin-bottom: 0.75rem;
            font-size: 1rem;
          }
          .moat-check-weak-list {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            max-height: 300px;
            overflow-y: auto;
          }
          .moat-check-weak-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 0.75rem;
            background: var(--bg-alt);
            border-radius: 8px;
            font-size: 0.9rem;
          }
          .moat-check-weak-word {
            font-weight: 600;
            min-width: 60px;
          }
          .moat-check-weak-reading {
            color: var(--text-secondary);
            min-width: 80px;
          }
          .moat-check-weak-meaning {
            flex: 1;
          }
          .moat-check-weak-tags {
            display: flex;
            gap: 0.3rem;
          }
          .tag-wrong {
            background: #fee2e2;
            color: #dc2626;
            padding: 0.1rem 0.4rem;
            border-radius: 4px;
            font-size: 0.75rem;
          }
        `}</style>
      </div>
    )
  }

  // Checking screen
  const current = pool[currentIdx]
  if (!current) return null

  return (
    <div className="page word-moat-page">
      <header className="page-header moat-page-header">
        <h1>抽查检验</h1>
        <p className="page-sub moat-page-sub">
          {currentIdx + 1} / {pool.length}
        </p>
      </header>

      <section className="section-block moat-check-section" style={{ maxWidth: 600, margin: '0 auto' }}>
        {!showAnswer ? (
          <div className="moat-check-prompt">
            <div className="moat-quiz-word">{current.word}</div>
            <div className="moat-quiz-reading">{current.reading}</div>
            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
              先回忆这个词的意思和记忆方法，然后点击按钮查看答案
            </p>
            <button
              type="button"
              className="moat-nav-btn primary"
              onClick={() => setShowAnswer(true)}
              style={{ width: '100%' }}
            >
              显示答案
            </button>
          </div>
        ) : (
          <div className="moat-check-answer">
            <div className="moat-card-meaning">{current.meaning}</div>

            <ul className="moat-element-list">
              {current.elements.map((el) => (
                <li key={el.element + el.method}>
                  <strong>{el.element}</strong>
                  <span className="moat-el-method">{el.method}</span>
                  <div className="moat-el-bridge">C：{el.bridgeC}</div>
                </li>
              ))}
            </ul>

            <p className="moat-scene">
              <span className="moat-scene-title">合并场景</span>
              {current.mergedScene}
            </p>

            {current.reviewHint && (
              <p className="moat-review-hint">
                <span className="moat-scene-title">复习要点</span>
                {current.reviewHint}
              </p>
            )}

            <div className="moat-difficulty" style={{ marginBottom: '1.5rem' }}>
              难度：{'★'.repeat(current.difficultyStars)}
            </div>

            <div className="moat-check-eval">
              <p style={{ marginBottom: '0.75rem', fontWeight: 600 }}>自评：你记住了吗？</p>
              <div className="moat-check-eval-grid">
                <button
                  type="button"
                  className="moat-eval-btn pass"
                  onClick={() => handleSelfEval(true, true)}
                >
                  全记住了
                </button>
                <button
                  type="button"
                  className="moat-eval-btn partial"
                  onClick={() => handleSelfEval(true, false)}
                >
                  记住意思<br />忘了读音
                </button>
                <button
                  type="button"
                  className="moat-eval-btn fail"
                  onClick={() => handleSelfEval(false, false)}
                >
                  都没记住
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="moat-check-progress">
          <div
            className="moat-check-progress-bar"
            style={{ width: `${((currentIdx + (showAnswer ? 1 : 0)) / pool.length) * 100}%` }}
          />
        </div>
      </section>

      <style>{`
        .moat-check-prompt {
          text-align: center;
          padding: 2rem 0;
        }
        .moat-check-answer {
          animation: fadeIn 0.3s ease;
        }
        .moat-check-eval-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.5rem;
        }
        .moat-eval-btn {
          padding: 0.75rem 0.5rem;
          border: 2px solid var(--border);
          border-radius: 10px;
          background: var(--bg);
          cursor: pointer;
          font-size: 0.85rem;
          line-height: 1.3;
          transition: all 0.15s;
        }
        .moat-eval-btn:hover { transform: scale(1.03); }
        .moat-eval-btn.pass {
          border-color: #22c55e;
          color: #22c55e;
        }
        .moat-eval-btn.pass:hover { background: #f0fdf4; }
        .moat-eval-btn.partial {
          border-color: #f59e0b;
          color: #f59e0b;
        }
        .moat-eval-btn.partial:hover { background: #fffbeb; }
        .moat-eval-btn.fail {
          border-color: #ef4444;
          color: #ef4444;
        }
        .moat-eval-btn.fail:hover { background: #fef2f2; }
        .moat-check-progress {
          height: 4px;
          background: var(--border);
          border-radius: 2px;
          margin-top: 1.5rem;
          overflow: hidden;
        }
        .moat-check-progress-bar {
          height: 100%;
          background: var(--terracotta);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
