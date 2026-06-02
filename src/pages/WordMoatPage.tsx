import { useCallback, useEffect, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { gaokaoMoatVocab } from '../data/gaokaoMoatVocab'
import type { MoatVocabEntry } from '../types'
import { loadMoatProgress, saveMoatProgress } from '../lib/moatProgress'
import { MiniSpeechButton } from '../components/SpeechButton'

type TabId = 'study' | 'quiz'

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
  '著名的',
  '遥远的',
  '柔软的',
  '灰色的',
  '吵闹的',
  '光滑的',
  '古老的',
]

function shouldToggleCard(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== 'Enter' && event.key !== ' ') return false
  event.preventDefault()
  return true
}

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

export function WordMoatPage() {
  const [tab, setTab] = useState<TabId>('study')
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const s = loadMoatProgress()
    setCardIndex(s.cardIndex % Math.max(gaokaoMoatVocab.length, 1))
  }, [])

  useEffect(() => {
    if (gaokaoMoatVocab.length === 0) return
    saveMoatProgress({ cardIndex: cardIndex % gaokaoMoatVocab.length })
  }, [cardIndex])

  const total = gaokaoMoatVocab.length
  const current = total > 0 ? gaokaoMoatVocab[cardIndex % total] : null

  const goPrev = useCallback(() => {
    if (total === 0) return
    setFlipped(false)
    setCardIndex((i) => (i - 1 + total) % total)
  }, [total])

  const goNext = useCallback(() => {
    if (total === 0) return
    setFlipped(false)
    setCardIndex((i) => (i + 1) % total)
  }, [total])

  return (
    <div className="page word-moat-page">
      <header className="page-header moat-page-header">
        <Link to="/lessons/words" className="back-link">
          ← 返回单词库
        </Link>
        <h1>高考单词</h1>
        <p className="page-sub moat-page-sub">
          先选一个模式——背熟了再测，或直接进入测验检验。
        </p>
      </header>

      <div
        className="moat-mode-hero"
        role="tablist"
        aria-label="学习模式"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'study'}
          className={`moat-mode-tile ${tab === 'study' ? 'active' : ''}`}
          onClick={() => {
            setTab('study')
            setFlipped(false)
          }}
        >
          <span className="moat-mode-tile-icon" aria-hidden>
            記
          </span>
          <span className="moat-mode-tile-title">背诵卡片</span>
          <span className="moat-mode-tile-desc">
            正面单词与读音，翻面查看完整记忆档案
          </span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'quiz'}
          className={`moat-mode-tile ${tab === 'quiz' ? 'active' : ''}`}
          onClick={() => setTab('quiz')}
        >
          <span className="moat-mode-tile-icon" aria-hidden>
            試
          </span>
          <span className="moat-mode-tile-title">测验</span>
          <span className="moat-mode-tile-desc">
            根据日语单词选择正确中文释义
          </span>
        </button>
      </div>

      <div className="moat-panel">
        {tab === 'study' && (
          <section className="section-block moat-study-section" aria-label="背诵卡片">
            {total === 0 ? (
              <p className="empty-state">词表还是空的，先在数据文件里加第一条词吧。</p>
            ) : (
              <div className="moat-study-layout">
                <div className="moat-study-toolbar">
                  <span className="moat-counter">
                    {cardIndex + 1} / {total}
                  </span>
                  <Link className="moat-inline-link" to="/vocabulary">
                    打开生词本
                  </Link>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  className={`moat-flip-card ${flipped ? 'is-flipped' : ''}`}
                  onClick={() => setFlipped((f) => !f)}
                  onKeyDown={(event) => {
                    if (shouldToggleCard(event)) setFlipped((f) => !f)
                  }}
                  aria-label={flipped ? '显示正面' : '显示背面'}
                >
                  {!flipped ? (
                    <div className="moat-card-face moat-card-front">
                      <span className="moat-card-label">正面</span>
                      <div className="moat-card-word-with-sound">
                        <div className="moat-card-word">{current!.word}</div>
                        <MiniSpeechButton word={current!.word} reading={current!.reading} />
                      </div>
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
                    </div>
                  )}
                </div>
                <div className="moat-card-nav">
                  <button type="button" className="moat-nav-btn" onClick={goPrev}>
                    上一词
                  </button>
                  <button type="button" className="moat-nav-btn primary" onClick={goNext}>
                    下一词
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {tab === 'quiz' && <QuizPanel pool={gaokaoMoatVocab} />}
      </div>
    </div>
  )
}

function QuizPanel({ pool }: { pool: MoatVocabEntry[] }) {
  const [questions, setQuestions] = useState<QuizQ[]>(() =>
    buildQuizQuestions(pool, Math.min(8, Math.max(4, pool.length * 2))),
  )
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const q = questions[step]

  const restart = () => {
    setQuestions(buildQuizQuestions(pool, Math.min(8, Math.max(4, pool.length * 2))))
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
    return (
      <section className="section-block moat-quiz-section" aria-live="polite">
        <h2 className="moat-quiz-title">本轮结束</h2>
        <p className="moat-quiz-score">
          得分 {score} / {questions.length}
        </p>
        <button type="button" className="moat-nav-btn primary" onClick={restart}>
          再测一轮
        </button>
      </section>
    )
  }

  if (!q) {
    return null
  }

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
        <span>
          第 {step + 1} / {questions.length} 题
        </span>
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
