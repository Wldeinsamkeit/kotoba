import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  memoryMethodsByLevel,
  type MemoryMethodEntry,
  type WordLevel,
} from '../data/memoryMethods'
import { getSpeechEngine, speakJapaneseAsync, speakWordAsync } from '../lib/japaneseSpeech'
import { buildRubySegments } from '../lib/wordRuby'
import { getSRS, type SRSReviewResult } from '../lib/srs'
import {
  playCorrect,
  playFlip,
  playScroll,
  playSelect,
  playWordMemorized,
  playWrong,
} from '../lib/soundEffects'

type SupportedWordLevel = Extract<WordLevel, 'n5' | 'n4'>
type StudyMode = 'quiz' | 'recall'
type StudyIntent = 'review' | 'new'
type ViewMode = 'overview' | 'settings' | 'study' | 'detail'
type QuizPhase = 'audio' | 'question' | 'answered'

const GROUP_SIZE_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80]

const LEVEL_META: Record<SupportedWordLevel, {
  title: string
  subtitle: string
  icon: string
  description: string
}> = {
  n5: {
    title: 'N5 词汇',
    subtitle: '入门基础',
    icon: '五',
    description: 'JLPT 最低级别，适合零基础开始背诵',
  },
  n4: {
    title: 'N4 词汇',
    subtitle: '日常会话',
    icon: '四',
    description: '前 23 组日常词汇，配套谐音联想记忆法',
  },
}

function getLevelWords(level: SupportedWordLevel) {
  return memoryMethodsByLevel[level]
}

function hasKanji(text: string) {
  return /[\u4e00-\u9fff]/.test(text)
}

function getSpeechText(entry: MemoryMethodEntry) {
  if (entry.word.length <= 1 && entry.reading) return entry.reading
  return entry.word
}

function speakStudyWord(entry: MemoryMethodEntry) {
  const engine = getSpeechEngine()
  return speakWordAsync(getSpeechText(entry), engine === 'auto' ? 'browser' : engine)
}

async function speakStudyAudio(entry: MemoryMethodEntry) {
  const engine = getSpeechEngine()
  const speechEngine = engine === 'auto' ? 'browser' : engine
  await speakWordAsync(getSpeechText(entry), speechEngine)

  const example = entry.exampleSentences?.[0]?.ja.trim()
  if (example) {
    await new Promise((resolve) => window.setTimeout(resolve, 280))
    await speakJapaneseAsync(example, speechEngine)
  }
}

function WordRuby({ entry, className = '' }: { entry: MemoryMethodEntry; className?: string }) {
  if (entry.reading && hasKanji(entry.word) && entry.reading !== entry.word) {
    const segments = buildRubySegments(entry.word, entry.reading, entry.elements)

    return (
      <span className={`word-ruby-stack ${className}`.trim()}>
        {segments.map((segment, index) => (
          segment.reading ? (
            <ruby key={`${segment.base}-${index}`}>
              {segment.base}
              <rt>{segment.reading}</rt>
            </ruby>
          ) : (
            <span key={`${segment.base}-${index}`} className="word-ruby-plain">
              {segment.base}
            </span>
          )
        ))}
      </span>
    )
  }

  return (
    <span className={className}>
      {entry.word}
    </span>
  )
}

function shuffle<T>(rows: T[]): T[] {
  const copy = [...rows]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function buildMeaningOptions(entry: MemoryMethodEntry, pool: MemoryMethodEntry[]) {
  const wrong = shuffle(pool.filter((item) => item.id !== entry.id))
    .map((item) => item.meaning)
    .filter((meaning, index, rows) => meaning !== entry.meaning && rows.indexOf(meaning) === index)
    .slice(0, 3)

  const fallback = ['合适，适合', '车站', '练习', '安静']
  let fallbackIndex = 0
  while (wrong.length < 3) {
    const next = fallback[fallbackIndex % fallback.length]
    fallbackIndex += 1
    if (next !== entry.meaning && !wrong.includes(next)) wrong.push(next)
  }

  return shuffle([entry.meaning, ...wrong])
}

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0
  return Math.min(Math.max(index, 0), length - 1)
}

function buildLinkMapHref(entry: MemoryMethodEntry) {
  const params = new URLSearchParams({
    word: entry.word,
    reading: entry.reading,
  })
  return `/lessons/words/link-map?${params.toString()}`
}

export function WordStudyPage({ level }: { level: SupportedWordLevel }) {
  const levelMeta = LEVEL_META[level]
  const words = useMemo(() => getLevelWords(level), [level])
  const allIds = useMemo(() => words.map((word) => word.id), [words])
  const [tick, setTick] = useState(0)
  const srs = useMemo(() => getSRS(), [tick])
  const dueIds = useMemo(() => srs.getDueCards(allIds), [srs, allIds])
  const dueReviewIds = useMemo(() => dueIds.filter((id) => !srs.isNew(id)), [dueIds, srs])
  const newIds = useMemo(() => allIds.filter((id) => srs.isNew(id)), [srs, allIds])
  const learnedCount = useMemo(
    () => allIds.filter((id) => srs.getCardState(id)).length,
    [allIds, srs],
  )
  const masteredCount = useMemo(
    () => allIds.filter((id) => (srs.getCardState(id)?.level ?? 0) >= 5).length,
    [allIds, srs],
  )

  const [view, setView] = useState<ViewMode>('overview')
  const [intent, setIntent] = useState<StudyIntent>('new')
  const [mode, setMode] = useState<StudyMode>('quiz')
  const [groupSize, setGroupSize] = useState(40)
  const [sessionWords, setSessionWords] = useState<MemoryMethodEntry[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [quizPhase, setQuizPhase] = useState<QuizPhase>('audio')
  const [options, setOptions] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [detailSource, setDetailSource] = useState<ViewMode>('study')

  const currentWord = sessionWords[currentIndex] ?? words[0] ?? null
  const progressPct = words.length > 0 ? Math.round((learnedCount / words.length) * 100) : 0
  const sessionPct =
    sessionWords.length > 0 ? ((currentIndex + (quizPhase === 'answered' || flipped ? 1 : 0)) / sessionWords.length) * 100 : 0

  const startSession = useCallback((nextIntent = intent) => {
    const candidateIds = nextIntent === 'review' ? dueReviewIds : newIds
    const idSet = new Set(candidateIds.length > 0 ? candidateIds : allIds)
    const pool = words.filter((word) => idSet.has(word.id)).slice(0, groupSize)
    const nextPool = pool.length > 0 ? pool : words.slice(0, groupSize)
    setIntent(nextIntent)
    setSessionWords(nextPool)
    setCurrentIndex(0)
    setQuizPhase('audio')
    setSelectedOption(null)
    setFlipped(false)
    setView('study')
  }, [allIds, dueReviewIds, groupSize, intent, newIds, words])

  const resetForCurrentWord = useCallback((entry: MemoryMethodEntry | null) => {
    setSelectedOption(null)
    setFlipped(false)
    setQuizPhase('audio')
    setOptions(entry ? buildMeaningOptions(entry, words) : [])
  }, [words])

  useEffect(() => {
    if (view !== 'study' || mode !== 'quiz' || !currentWord) return
    resetForCurrentWord(currentWord)
  }, [currentWord, mode, resetForCurrentWord, view])

  useEffect(() => {
    if (view !== 'study' || mode !== 'quiz' || quizPhase !== 'audio' || !currentWord) return
    void speakStudyAudio(currentWord).catch(() => undefined)
  }, [currentIndex, currentWord, mode, quizPhase, view])

  const recordAndAdvance = useCallback((result: SRSReviewResult) => {
    if (!currentWord) return
    getSRS().recordReview(currentWord.id, result)
    setTick((value) => value + 1)
    if (currentIndex + 1 >= sessionWords.length) {
      setView('overview')
      setSessionWords([])
      setCurrentIndex(0)
      return
    }
    setCurrentIndex((index) => clampIndex(index + 1, sessionWords.length))
  }, [currentIndex, currentWord, sessionWords.length])

  const advanceFromDetail = useCallback(() => {
    if (currentIndex + 1 >= sessionWords.length) {
      setView('overview')
      setSessionWords([])
      setCurrentIndex(0)
      return
    }

    setCurrentIndex((index) => clampIndex(index + 1, sessionWords.length))
    setQuizPhase('audio')
    setSelectedOption(null)
    setFlipped(false)
    setView('study')
  }, [currentIndex, sessionWords.length])

  const answerQuiz = (option: string) => {
    if (!currentWord || selectedOption) return
    setSelectedOption(option)
    setQuizPhase('answered')
    if (option === currentWord.meaning) {
      playCorrect()
      getSRS().recordReview(currentWord.id, 'ok')
    } else {
      playWrong()
      getSRS().recordReview(currentWord.id, 'hard')
    }
    setTick((value) => value + 1)
  }

  const openDetail = (source: ViewMode = 'study') => {
    if (!currentWord) return
    setDetailSource(source)
    setView('detail')
  }

  const handleStudyCardClick = () => {
    if (!currentWord) return
    if (mode === 'quiz') {
      if (quizPhase === 'audio') {
        setQuizPhase('question')
        return
      }
      if (quizPhase === 'answered') {
        openDetail('study')
      }
      return
    }

    playFlip()
    setFlipped((value) => !value)
  }

  const saveSettings = () => {
    playSelect()
    setView('overview')
  }

  const changeGroupSize = (size: number) => {
    setGroupSize(size)
    playScroll()
  }

  if (!currentWord && view !== 'overview') {
    return (
      <div className="page word-study-page">
        <Link to="/lessons/words" className="back-link">← 返回单词库</Link>
        <p className="empty-state">当前词库暂无可背诵单词。</p>
      </div>
    )
  }

  return (
    <div className="page word-study-page">
      {view === 'overview' && (
        <OverviewView
          dueCount={dueReviewIds.length}
          groupSize={groupSize}
          learnedCount={learnedCount}
          level={level}
          levelMeta={levelMeta}
          masteredCount={masteredCount}
          mode={mode}
          newCount={newIds.length}
          progressPct={progressPct}
          totalCount={words.length}
          onSettings={() => setView('settings')}
          onStart={startSession}
          selectedIntent={intent}
        />
      )}

      {view === 'settings' && (
        <SettingsView
          groupSize={groupSize}
          intent={intent}
          levelMeta={levelMeta}
          mode={mode}
          onBack={() => setView('overview')}
          onGroupSizeChange={changeGroupSize}
          onIntentChange={(nextIntent) => {
            setIntent(nextIntent)
            playSelect()
          }}
          onModeChange={(nextMode) => {
            setMode(nextMode)
            playSelect()
          }}
          onSave={saveSettings}
        />
      )}

      {view === 'study' && currentWord && (
        <StudyView
          currentIndex={currentIndex}
          entry={currentWord}
          flipped={flipped}
          mode={mode}
          options={options}
          quizPhase={quizPhase}
          selectedOption={selectedOption}
          sessionPct={sessionPct}
          sessionTotal={sessionWords.length}
          onAnswer={answerQuiz}
          onBack={() => setView('overview')}
          onCardClick={handleStudyCardClick}
          onDetail={() => openDetail('study')}
          onRate={recordAndAdvance}
        />
      )}

      {view === 'detail' && currentWord && (
        <DetailView
          entry={currentWord}
          hasNext={currentIndex + 1 < sessionWords.length}
          onBack={() => setView(detailSource === 'settings' ? 'overview' : 'study')}
          onNext={advanceFromDetail}
        />
      )}
    </div>
  )
}

function OverviewView({
  dueCount,
  groupSize,
  learnedCount,
  level,
  levelMeta,
  masteredCount,
  mode,
  newCount,
  progressPct,
  selectedIntent,
  totalCount,
  onSettings,
  onStart,
}: {
  dueCount: number
  groupSize: number
  learnedCount: number
  level: SupportedWordLevel
  levelMeta: typeof LEVEL_META[SupportedWordLevel]
  masteredCount: number
  mode: StudyMode
  newCount: number
  progressPct: number
  selectedIntent: StudyIntent
  totalCount: number
  onSettings: () => void
  onStart: (intent?: StudyIntent) => void
}) {
  return (
    <>
      <header className="word-study-header">
        <Link to="/lessons/words" className="back-link">← 返回单词库</Link>
        <h1>{levelMeta.title}</h1>
      </header>

      <section className="word-study-dashboard" aria-label={`${levelMeta.title} 学习概览`}>
        <div className={`word-study-book word-study-book-${level}`} aria-hidden="true">
          <span>{levelMeta.icon}</span>
        </div>
        <div className="word-study-summary">
          <div className="word-study-title-row">
            <div>
              <h2>{levelMeta.title}</h2>
              <p>{levelMeta.description} · 共 {totalCount} 词</p>
            </div>
            <button
              type="button"
              className="word-study-pen"
              onClick={onSettings}
              aria-label="打开背词设置"
              title="背词设置"
            >
              ✎
            </button>
          </div>

          <div className="word-study-days">
            预计学完还需 <strong>{Math.max(1, Math.ceil(Math.max(totalCount - learnedCount, 0) / Math.max(groupSize, 1)))}</strong> 天
          </div>

          <div className="word-study-progress" aria-label={`已学 ${learnedCount} 个单词`}>
            <span style={{ width: `${progressPct}%` }} />
          </div>

          <div className="word-study-statline">
            <span><i className="dot mastered" />掌握 {masteredCount}</span>
            <span><i className="dot learned" />已学 {learnedCount}</span>
            <span className="word-study-list-note">每组 {groupSize} 词 · {mode === 'quiz' ? '测验式' : '回忆式'}</span>
          </div>

          <div className="word-study-actions" role="group" aria-label="选择学习方向">
            <button
              type="button"
              className={selectedIntent === 'review' ? 'active' : ''}
              onClick={(event) => {
                event.stopPropagation()
                onStart('review')
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onStart('review')
              }}
            >
              <span>复习</span>
              <small>{dueCount} 个待复习</small>
            </button>
            <button
              type="button"
              className={selectedIntent === 'new' ? 'active primary' : 'primary'}
              onClick={(event) => {
                event.stopPropagation()
                onStart('new')
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onStart('new')
              }}
            >
              <span>新学</span>
              <small>{newCount} 个待学习</small>
            </button>
          </div>

          <button
            type="button"
            className="word-study-start"
            onClick={() => onStart(selectedIntent)}
          >
            开始学习
          </button>
        </div>
      </section>
    </>
  )
}

function SettingsView({
  groupSize,
  intent,
  levelMeta,
  mode,
  onBack,
  onGroupSizeChange,
  onIntentChange,
  onModeChange,
  onSave,
}: {
  groupSize: number
  intent: StudyIntent
  levelMeta: typeof LEVEL_META[SupportedWordLevel]
  mode: StudyMode
  onBack: () => void
  onGroupSizeChange: (size: number) => void
  onIntentChange: (intent: StudyIntent) => void
  onModeChange: (mode: StudyMode) => void
  onSave: () => void
}) {
  const wheelRef = useRef<HTMLDivElement | null>(null)

  const scrollToSize = useCallback((size: number, behavior: ScrollBehavior = 'smooth') => {
    const wheel = wheelRef.current
    const target = wheel?.querySelector<HTMLButtonElement>(`button[data-size="${size}"]`)
    target?.scrollIntoView({ block: 'center', behavior })
  }, [])

  const syncGroupSizeFromScroll = useCallback(() => {
    const wheel = wheelRef.current
    if (!wheel) return

    const wheelRect = wheel.getBoundingClientRect()
    const wheelCenter = wheelRect.top + wheelRect.height / 2
    let nextSize = groupSize
    let bestDistance = Number.POSITIVE_INFINITY

    wheel.querySelectorAll<HTMLButtonElement>('button[data-size]').forEach((button) => {
      const rect = button.getBoundingClientRect()
      const buttonCenter = rect.top + rect.height / 2
      const distance = Math.abs(buttonCenter - wheelCenter)
      if (distance < bestDistance) {
        bestDistance = distance
        nextSize = Number(button.dataset.size)
      }
    })

    if (nextSize !== groupSize) {
      onGroupSizeChange(nextSize)
    }
  }, [groupSize, onGroupSizeChange])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => scrollToSize(groupSize, 'auto'))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  return (
    <section className="word-settings-page" aria-label="背词设置">
      <header className="word-settings-header">
        <button type="button" onClick={onBack} aria-label="返回">‹</button>
        <h1>背词设置</h1>
        <button type="button" className="word-settings-save" onClick={onSave}>保存</button>
      </header>

      <div className="word-settings-tabs" role="tablist" aria-label="学习方向">
        <button
          type="button"
          role="tab"
          className={intent === 'new' ? 'active' : ''}
          aria-selected={intent === 'new'}
          onClick={() => onIntentChange('new')}
        >
          新学
        </button>
        <button
          type="button"
          role="tab"
          className={intent === 'review' ? 'active' : ''}
          aria-selected={intent === 'review'}
          onClick={() => onIntentChange('review')}
        >
          复习
        </button>
      </div>

      <div className="word-settings-section">
        <h2>选择每组词数</h2>
        <div className="word-size-picker" aria-label="每组词数">
          <div
            ref={wheelRef}
            className="word-size-wheel"
            onScroll={syncGroupSizeFromScroll}
          >
            {GROUP_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                type="button"
                data-size={size}
                className={groupSize === size ? 'active' : ''}
                onClick={() => {
                  onGroupSizeChange(size)
                  scrollToSize(size)
                }}
              >
                {size}
              </button>
            ))}
          </div>
          <span className="word-size-pointer" aria-hidden="true" />
        </div>
      </div>

      <div className="word-settings-section">
        <h2>单词背诵模式</h2>
        <div className="word-mode-grid">
          <button
            type="button"
            className={mode === 'quiz' ? 'active' : ''}
            onClick={() => onModeChange('quiz')}
          >
            <span className="mode-icon">試</span>
            <strong>测验式</strong>
            <small>先听发音，再四选一判断意思</small>
          </button>
          <button
            type="button"
            className={mode === 'recall' ? 'active' : ''}
            onClick={() => onModeChange('recall')}
          >
            <span className="mode-icon">回</span>
            <strong>回忆式</strong>
            <small>正反面翻转，适合快速复盘</small>
          </button>
        </div>
      </div>

      <p className="word-settings-footnote">{levelMeta.title} · 当前设置会用于下一轮学习。</p>
    </section>
  )
}

function StudyView({
  currentIndex,
  entry,
  flipped,
  mode,
  options,
  quizPhase,
  selectedOption,
  sessionPct,
  sessionTotal,
  onAnswer,
  onBack,
  onCardClick,
  onDetail,
  onRate,
}: {
  currentIndex: number
  entry: MemoryMethodEntry
  flipped: boolean
  mode: StudyMode
  options: string[]
  quizPhase: QuizPhase
  selectedOption: string | null
  sessionPct: number
  sessionTotal: number
  onAnswer: (option: string) => void
  onBack: () => void
  onCardClick: () => void
  onDetail: () => void
  onRate: (result: SRSReviewResult) => void
}) {
  const answeredCorrect = selectedOption === entry.meaning

  return (
    <section className={`word-session-page ${mode === 'quiz' ? 'quiz-mode' : 'recall-mode'}`}>
      <header className="word-session-header">
        <button type="button" onClick={onBack}>←</button>
        <div className="word-session-progress">
          <strong>{currentIndex + 1}/{sessionTotal}</strong>
          <span><i style={{ width: `${Math.min(sessionPct, 100)}%` }} /></span>
        </div>
        <div className="word-session-actions">
          <Link
            to={buildLinkMapHref(entry)}
            className="word-session-linkmap"
            aria-label="查看链路图"
            title="链路图"
          >
            链
          </Link>
          <button type="button" className="word-session-detail" onClick={onDetail}>記</button>
        </div>
      </header>

      <button
        type="button"
        className={`word-study-card ${mode === 'recall' && flipped ? 'is-flipped' : ''}`}
        onClick={onCardClick}
      >
        {mode === 'quiz' ? (
          <QuizCardContent entry={entry} phase={quizPhase} answeredCorrect={answeredCorrect} />
        ) : (
          <RecallCardContent entry={entry} flipped={flipped} />
        )}
      </button>

      {mode === 'quiz' ? (
        <div className="word-quiz-options">
          {quizPhase === 'audio' ? (
            <p>发音已播放，点击卡片查看单词。</p>
          ) : (
            options.map((option) => {
              const isCorrect = option === entry.meaning
              const isPicked = option === selectedOption
              return (
                <button
                  key={option}
                  type="button"
                  disabled={Boolean(selectedOption)}
                  className={[
                    selectedOption && isCorrect ? 'correct' : '',
                    selectedOption && isPicked && !isCorrect ? 'wrong' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => onAnswer(option)}
                >
                  {option}
                </button>
              )
            })
          )}
        </div>
      ) : (
        <div className="word-recall-actions">
          <button type="button" onClick={() => onRate('forgot')}>再来一次</button>
          <button type="button" onClick={() => onRate('hard')}>有点迷糊</button>
          <button
            type="button"
            className="primary"
            onClick={() => {
              playWordMemorized()
              onRate('easy')
            }}
          >
            记住了
          </button>
        </div>
      )}
    </section>
  )
}

function QuizCardContent({
  answeredCorrect,
  entry,
  phase,
}: {
  answeredCorrect: boolean
  entry: MemoryMethodEntry
  phase: QuizPhase
}) {
  if (phase === 'audio') {
    const hasExample = Boolean(entry.exampleSentences?.[0]?.ja.trim())

    return (
      <div className="word-card-face word-card-audio">
        <div className="word-sound-orb">音</div>
        <p>{hasExample ? '先听单词与例句' : '先听单词发音'}</p>
        <small>点击卡片查看单词</small>
      </div>
    )
  }

  return (
    <div className="word-card-face word-card-question">
      <WordRuby entry={entry} className="word-card-main-word" />
      {!hasKanji(entry.word) && <span className="word-card-reading">{entry.reading}</span>}
      {phase === 'answered' && (
        <strong className={answeredCorrect ? 'word-answer-ok' : 'word-answer-ng'}>
          {answeredCorrect ? '答对了' : '再记一次'}
        </strong>
      )}
    </div>
  )
}

function RecallCardContent({ entry, flipped }: { entry: MemoryMethodEntry; flipped: boolean }) {
  if (!flipped) {
    return (
      <div className="word-card-face word-card-front">
        <span className="word-card-pill">回忆式</span>
        <WordRuby entry={entry} className="word-card-main-word" />
        {!hasKanji(entry.word) && <span className="word-card-reading">{entry.reading}</span>}
        <small>点击翻面</small>
      </div>
    )
  }

  return (
    <div className="word-card-face word-card-back">
      <strong>{entry.meaning}</strong>
      <p>{entry.mergedScene}</p>
      <small>{entry.reviewTip}</small>
    </div>
  )
}

function DetailView({
  entry,
  hasNext,
  onBack,
  onNext,
}: {
  entry: MemoryMethodEntry
  hasNext: boolean
  onBack: () => void
  onNext: () => void
}) {
  const examples = entry.exampleSentences ?? []

  return (
    <section className="word-detail-page">
      <header className="word-session-header">
        <button type="button" onClick={onBack}>←</button>
        <strong>单词档案</strong>
        <div className="word-session-actions">
          <Link
            to={buildLinkMapHref(entry)}
            className="word-session-linkmap"
            aria-label="查看链路图"
            title="链路图"
          >
            链
          </Link>
          <button type="button" onClick={() => void speakStudyWord(entry).catch(() => undefined)}>♪</button>
        </div>
      </header>

      <article className="word-detail-card">
        <WordRuby entry={entry} className="word-detail-main-word" />
        {!hasKanji(entry.word) && <span className="word-detail-reading">{entry.reading}</span>}
        <p className="word-detail-meaning">{entry.meaning}</p>

        <section>
          <h2>例句</h2>
          {examples.length > 0 ? (
            <div className="word-example-list">
              {examples.slice(0, 2).map((example) => (
                <div key={example.ja} className="word-example-item">
                  <p>{example.ja}</p>
                  <span>{example.zh}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="word-detail-muted">这个词还没有例句，后续会补上。</p>
          )}
        </section>

        <section className="word-memory-panel">
          <h2>记忆方法</h2>
          {entry.reviewTip && (
            <div className="word-memory-block">
              <h3>记忆技巧</h3>
              <p>{entry.reviewTip}</p>
            </div>
          )}
          {entry.mergedScene && (
            <div className="word-memory-block">
              <h3>场景故事</h3>
              <p>{entry.mergedScene}</p>
            </div>
          )}
        </section>
      </article>

      <button
        type="button"
        className="word-study-start"
        onClick={onNext}
      >
        {hasNext ? '下一个单词' : '完成本轮'}
      </button>
    </section>
  )
}
