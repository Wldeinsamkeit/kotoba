import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { JapaneseInput } from '../components/JapaneseInput'
import { JapaneseInputGuide } from '../components/JapaneseInputGuide'
import { useProgress } from '../context/ProgressContext'
import { getLesson } from '../data/lessons'
import { isJapaneseAnswerCorrect } from '../lib/japaneseAnswer'
import { generateSmartQuizzes } from '../lib/smartQuizGenerator'
import {
  playClick,
  playSelect,
  playCorrect,
  playWrong,
  playXPGain,
  playCombo,
  playQuizComplete,
  playDifficultyUp,
  setSoundMuted,
  isSoundMuted,
} from '../lib/soundEffects'
import { XP_REWARDS } from '../lib/xpSystem'
import { triggerXPToast } from '../components/XPToast'
import { hasLessonPassed } from '../lib/progress'
import { speakWordAsync } from '../lib/japaneseSpeech'
import type { SmartQuizQuestion } from '../types'

// 导入课程学习顺序，用于正确获取下一课
const LESSON_LIFE_ORDER = [
  'self-introduction',
  'where-are-you-from',
  'please-speak-slowly',
  'language-school-registration',
  'campus-greeting',
  'borrow-pen-in-class',
  'morning-combini-breakfast',
  'how-to-do-it',
  'cafeteria-find-seat',
  'what-is-this',
  'asking-directions',
  'which-train-to-ikebukuro',
  'train-transfer',
  'n4_wait_how_long',
  'restaurant-order-lunch',
  'restaurant-waiting-list',
  'dont-put-wasabi',
  'how-much-is-it',
  'pay-by-card',
  'atm-withdraw-cash',
  'i-want-gloves',
  'exchange-size',
  'hair-salon-cut',
  'do-you-have-omamori',
  'can-i-take-a-photo',
  'invite-photo',
  'invite-go-together',
  'meet-at-what-time',
  'late-apology',
  'library-books',
  'i-have-read-it',
  'n4_reason_because_first_time',
  'n4_compare_outside_better',
  'weather-plan-change',
  'what-time-is-the-bath',
  'hotel-check-in',
  'laundry-machine-how-to-use',
  'garbage-sorting',
  'post-office-package',
  'delivery-redelivery',
  'throat-hurts',
  'pharmacy-cold-medicine',
  'clinic-reception',
  'lost-wallet',
  'absence-note',
  'refuse-invitation',
  'n3_hearsay_concert',
  'n3_plan_intend_to_give',
  'part-time-interview',
  'n2_polite_request_check_japanese',
] as const

const DIFFICULTY_META = {
  easy: { label: '入门', color: '#6b9080', icon: '🌱' },
  medium: { label: '进阶', color: '#c96442', icon: '🔥' },
  hard: { label: '挑战', color: '#5a4a78', icon: '⚡' },
} as const

const TYPE_LABELS = {
  vocab_meaning: '词汇·意思',
  vocab_spelling: '单词·拼写',
  grammar: '语法·运用',
  sentence_order: '句子·排序',
  sentence_fill: '句子·填空',
  sentence_spelling: '句子·拼写',
} as const

type Phase = 'answering' | 'feedback' | 'done'

function QuizBackLink({ lessonId }: { lessonId: string }) {
  return (
    <Link className="back-link lesson-back-link quiz-back-link" to={`/lessons/${lessonId}`}>
      ← 返回课程
    </Link>
  )
}

export function SmartQuizPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const lesson = lessonId ? getLesson(lessonId) : undefined
  const { registerQuizResult, completeLesson, completeDailyTask, progress, addXP } =
    useProgress()

  const quizzes = useMemo(
    () => (lesson ? generateSmartQuizzes(lesson) : []),
    [lesson],
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('answering')
  const [selectedChoice, setSelectedChoice] = useState<number | undefined>()
  const [selectedOrderIndexes, setSelectedOrderIndexes] = useState<number[]>([])
  const [textValue, setTextValue] = useState('')
  const [currentCorrect, setCurrentCorrect] = useState(false)
  const [results, setResults] = useState<Array<{ questionId: string; correct: boolean }>>([])
  const [showTransition, setShowTransition] = useState(false)
  const [soundOn, setSoundOn] = useState(!isSoundMuted())
  const comboRef = useRef(0)

  const currentQuiz = quizzes[currentIndex]
  const total = quizzes.length

  if (!lesson) {
    return (
      <div className="page">
        <p>找不到该课程。</p>
        <Link to="/lessons">返回列表</Link>
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="page smart-quiz-page">
        <QuizBackLink lessonId={lesson.id} />
        <nav className="breadcrumb">
          <Link to="/lessons">每日课程</Link>
          <span aria-hidden> / </span>
          <Link to={`/lessons/${lesson.id}`}>{lesson.title}</Link>
          <span aria-hidden> / </span>
          <span>智能测试</span>
        </nav>
        <div className="empty-state">
          <p>本课暂无可生成的题目，请返回课程。</p>
        </div>
      </div>
    )
  }

  function handleConfirm() {
    if (!currentQuiz) return

    let correct = false
    if (currentQuiz.type === 'sentence_order') {
      correct = isJapaneseAnswerCorrect(
        getOrderAnswer(currentQuiz, selectedOrderIndexes),
        currentQuiz.acceptedAnswers ?? [currentQuiz.coreSentence],
      )
    } else if (
      currentQuiz.type === 'vocab_spelling' ||
      currentQuiz.type === 'sentence_fill' ||
      currentQuiz.type === 'sentence_spelling'
    ) {
      correct = isJapaneseAnswerCorrect(textValue, currentQuiz.acceptedAnswers ?? [])
    } else {
      correct = selectedChoice === currentQuiz.correctAnswer
    }

    setCurrentCorrect(correct)
    setResults((prev) => [...prev, { questionId: currentQuiz.id, correct }])
    setPhase('feedback')

    if (correct) {
      comboRef.current++
      playCorrect()
      // Per-question XP reward
      const xp = XP_REWARDS.QUIZ_CORRECT
      addXP(xp, 'quiz-question')
      triggerXPToast(xp, 'quiz')
      playXPGain()
      if (comboRef.current >= 3) {
        playCombo(comboRef.current)
      }
    } else {
      comboRef.current = 0
      playWrong()
    }
  }

  function handleNext() {
    playClick()
    const nextIndex = currentIndex + 1
    if (nextIndex >= total) {
      finishQuiz()
      return
    }

    // Check if difficulty changes
    const nextQuiz = quizzes[nextIndex]
    if (nextQuiz.difficulty !== currentQuiz!.difficulty) {
      playDifficultyUp()
      setShowTransition(true)
      setTimeout(() => {
        setShowTransition(false)
        advanceTo(nextIndex)
      }, 1200)
    } else {
      advanceTo(nextIndex)
    }
  }

  function advanceTo(index: number) {
    setCurrentIndex(index)
    setSelectedChoice(undefined)
    setSelectedOrderIndexes([])
    setTextValue('')
    setCurrentCorrect(false)
    setPhase('answering')
  }

  function finishQuiz() {
    playQuizComplete()
    const allResults = [...results]
    registerQuizResult(lesson!.id, allResults)

    let maxCombo = 0
    let currentCombo = 0
    for (const r of allResults) {
      if (r.correct) {
        currentCombo++
        maxCombo = Math.max(maxCombo, currentCombo)
      } else {
        currentCombo = 0
      }
    }

    completeDailyTask('daily-quiz')
    setPhase('done')
  }

  // --- Difficulty transition overlay ---
  if (showTransition && currentQuiz) {
    const nextQuiz = quizzes[currentIndex + (phase === 'feedback' ? 1 : 0)]
    const meta = nextQuiz ? DIFFICULTY_META[nextQuiz.difficulty] : DIFFICULTY_META[currentQuiz.difficulty]
    return (
      <div className="page smart-quiz-page">
        <QuizBackLink lessonId={lesson.id} />
        <div className="quiz-phase-transition">
          <div className="phase-transition-content">
            <span className="phase-transition-icon">{meta.icon}</span>
            <h2 className="phase-transition-title">难度提升</h2>
            <p className="phase-transition-label" style={{ color: meta.color }}>
              {meta.label}阶段
            </p>
            <p className="phase-transition-hint">
              {nextQuiz?.difficulty === 'medium'
                ? '准备好了吗？接下来会更有挑战性。'
                : '终极挑战来了！展示你的实力。'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // --- Done phase: results summary ---
  if (phase === 'done') {
    const correctCount = results.filter((r) => r.correct).length
    const passRate = total > 0 ? correctCount / total : 0
    const isPassingScore = passRate >= 0.6
    const lessonDone = hasLessonPassed(progress, lesson.id) || isPassingScore

    // 使用预定义的学习顺序来获取下一课，而不是依赖数组索引
    const currentOrderIndex = LESSON_LIFE_ORDER.indexOf(lesson.id as any)
    const nextLessonId = currentOrderIndex >= 0 && currentOrderIndex < LESSON_LIFE_ORDER.length - 1
      ? LESSON_LIFE_ORDER[currentOrderIndex + 1]
      : null
    const nextLesson = nextLessonId ? getLesson(nextLessonId) : null

    let maxCombo = 0
    let currentCombo = 0
    for (const r of results) {
      if (r.correct) {
        currentCombo++
        maxCombo = Math.max(maxCombo, currentCombo)
      } else {
        currentCombo = 0
      }
    }

    // Group results by difficulty
    const byDifficulty = { easy: { c: 0, t: 0 }, medium: { c: 0, t: 0 }, hard: { c: 0, t: 0 } }
    results.forEach((r, i) => {
      const d = quizzes[i].difficulty
      byDifficulty[d].t++
      if (r.correct) byDifficulty[d].c++
    })

    return (
      <div className="page smart-quiz-page">
        <QuizBackLink lessonId={lesson.id} />
        <nav className="breadcrumb">
          <Link to="/lessons">每日课程</Link>
          <span aria-hidden> / </span>
          <Link to={`/lessons/${lesson.id}`}>{lesson.title}</Link>
          <span aria-hidden> / </span>
          <span>智能测试</span>
        </nav>

        {/* Sound toggle */}
        <button
          type="button"
          className="quiz-sound-toggle"
          data-sound-skip
          onClick={() => {
            const next = !soundOn
            setSoundOn(next)
            setSoundMuted(!next)
            if (next) playClick()
          }}
          title={soundOn ? '关闭音效' : '开启音效'}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>

        <section className="quiz-result-summary">
          <div className="result-card">
            <div className="result-score">
              <div className="score-circle">
                <span className="score-number">{correctCount}</span>
                <span className="score-total">/ {total}</span>
              </div>
            </div>
            <div className="result-details">
              <h3>测试完成</h3>
              <p className="result-accuracy">
                正确率：<strong>{Math.round(passRate * 100)}%</strong>
              </p>

              <div className="result-breakdown">
                {(['easy', 'medium', 'hard'] as const).map((d) => {
                  const s = byDifficulty[d]
                  if (s.t === 0) return null
                  const meta = DIFFICULTY_META[d]
                  return (
                    <div key={d} className="result-breakdown-row">
                      <span className="result-breakdown-label" style={{ color: meta.color }}>
                        {meta.icon} {meta.label}
                      </span>
                      <span className="result-breakdown-score">
                        {s.c}/{s.t}
                      </span>
                    </div>
                  )
                })}
              </div>

              <p className="result-message">
                {passRate === 1
                  ? '全部正确，太厉害了！本课已通过，下一单元已解锁。'
                  : passRate >= 0.8
                    ? '掌握不错，本课已通过，下一单元已解锁。'
                    : passRate >= 0.6
                      ? '已达到通过线，下一单元已解锁。建议回头复习错题。'
                    : '建议回到课程复习核心句与词汇后再测一次。'}
              </p>
              {maxCombo >= 3 && (
                <p className="result-combo">最大连击 x{maxCombo}! 额外 XP 已获得</p>
              )}
              {passRate === 1 && (
                <div className="result-perfect">
                  <span className="perfect-text">Perfect!</span>
                </div>
              )}
            </div>
          </div>
          <div className="result-actions">
            <button
              type="button"
              className="btn btn-secondary"
              data-sound-skip
              onClick={() => {
                playClick()
                setCurrentIndex(0)
                setSelectedChoice(undefined)
                setSelectedOrderIndexes([])
                setTextValue('')
                setCurrentCorrect(false)
                setResults([])
                setPhase('answering')
              }}
            >
              重新测试
            </button>
            {!lessonDone && passRate >= 0.6 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => completeLesson(lesson.id)}
              >
                标记本课已学完
              </button>
            )}
            <Link className="btn btn-ghost" to={`/lessons/${lesson.id}`}>
              返回课程
            </Link>
            {nextLesson && (
              <Link className="btn btn-primary" to={`/lessons/${nextLesson.id}`}>
                下一个课程：{nextLesson.title}
              </Link>
            )}
          </div>
        </section>
      </div>
    )
  }

  // --- Answering / Feedback phase ---
  const diffMeta = DIFFICULTY_META[currentQuiz.difficulty]
  const isOrder = currentQuiz.type === 'sentence_order'
  const isSpelling =
    currentQuiz.type === 'vocab_spelling' ||
    currentQuiz.type === 'sentence_fill' ||
    currentQuiz.type === 'sentence_spelling'
  const answeredCorrectly = phase === 'feedback' && currentCorrect
  const orderReady =
    isOrder &&
    (currentQuiz.orderChunks?.length ?? 0) > 0 &&
    selectedOrderIndexes.length === currentQuiz.orderChunks?.length

  return (
    <div className="page smart-quiz-page">
      <JapaneseInputGuide />
      <QuizBackLink lessonId={lesson.id} />
      <nav className="breadcrumb">
        <Link to="/lessons">每日课程</Link>
        <span aria-hidden> / </span>
        <Link to={`/lessons/${lesson.id}`}>{lesson.title}</Link>
        <span aria-hidden> / </span>
        <span>智能测试</span>
      </nav>

      {/* Sound toggle */}
      <button
        type="button"
        className="quiz-sound-toggle"
        onClick={() => {
          const next = !soundOn
          setSoundOn(next)
          setSoundMuted(!next)
          if (next) playClick()
        }}
        title={soundOn ? '关闭音效' : '开启音效'}
      >
        {soundOn ? '🔊' : '🔇'}
      </button>

      {/* Progress bar */}
      <div className="quiz-step-progress">
        <div className="quiz-step-info">
          <span className="quiz-step-count">
            {currentIndex + 1} / {total}
          </span>
          <span
            className="quiz-difficulty-badge"
            style={{ backgroundColor: diffMeta.color + '1f', color: diffMeta.color }}
          >
            {diffMeta.icon} {diffMeta.label}
          </span>
        </div>
        <div className="quiz-step-track">
          {quizzes.map((q, i) => {
            let segClass = 'quiz-step-seg'
            if (i < currentIndex) {
              segClass += results[i]?.correct ? ' seg-correct' : ' seg-wrong'
            } else if (i === currentIndex) {
              segClass += ' seg-current'
            }
            return <div key={q.id} className={segClass} />
          })}
        </div>
      </div>

      {/* Question card */}
      <article
        className={`quiz-single-card ${phase === 'feedback' ? (answeredCorrectly ? 'card-correct' : 'card-wrong') : ''}`}
      >
        <div className="quiz-item-header">
          <span className="quiz-number">第 {currentIndex + 1} 题</span>
          <span className={`quiz-type-tag type-${currentQuiz.type}`}>
            {TYPE_LABELS[currentQuiz.type]}
          </span>
        </div>

        <div className="quiz-question">
          <h3>{currentQuiz.question}</h3>
          <QuestionMeaningBlock quiz={currentQuiz} showAnswer={phase === 'feedback'} />
        </div>

        {isOrder ? (
          <OrderAnswerBlock
            quiz={currentQuiz}
            selectedIndexes={selectedOrderIndexes}
            disabled={phase === 'feedback'}
            correct={currentCorrect}
            onSelect={(index, chunk) => {
              setSelectedOrderIndexes((prev) => [...prev, index])
              void speakWordAsync(chunk).catch(() => undefined)
              playSelect()
            }}
            onRemove={(index) => {
              setSelectedOrderIndexes((prev) => prev.filter((item) => item !== index))
              playSelect()
            }}
            onClear={() => {
              setSelectedOrderIndexes([])
              playSelect()
            }}
          />
        ) : isSpelling ? (
          <div className="quiz-spelling-block">
            <p className="quiz-spelling-prompt">{getSpellingPrompt(currentQuiz)}</p>
            <JapaneseInput
              value={textValue}
              onChange={setTextValue}
              placeholder={getSpellingPlaceholder(currentQuiz)}
              disabled={phase === 'feedback'}
              id={`spell-${currentQuiz.id}`}
            />
            {phase === 'feedback' && (
              <p className={`spell-result ${currentCorrect ? 'ok' : 'ng'}`}>
                {currentCorrect
                  ? '拼写正确!'
                  : `参考答案：${getPrimaryAnswer(currentQuiz)}`}
              </p>
            )}
          </div>
        ) : (
          <div className="quiz-options">
            {currentQuiz.options.map((option, i) => {
              const selected = selectedChoice === i
              const isRight = i === currentQuiz.correctAnswer
              let cls = 'quiz-option'
              if (selected) cls += ' selected'
              if (phase === 'feedback') {
                if (isRight) cls += ' correct-answer'
                else if (selected) cls += ' wrong-answer'
              }
              return (
                <label key={i} className={cls}>
                  <input
                    type="radio"
                    name={currentQuiz.id}
                    checked={selected}
                    disabled={phase === 'feedback'}
                    onChange={() => { setSelectedChoice(i); playSelect() }}
                  />
                  <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                  <span className="option-text">{option}</span>
                </label>
              )
            })}
          </div>
        )}

        {/* Feedback section */}
        {phase === 'feedback' && (
          <div className={`quiz-feedback ${currentCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
            <div className="quiz-feedback-header">
              <span className="quiz-feedback-icon">{currentCorrect ? '✓' : '✗'}</span>
              <span className="quiz-feedback-status">
                {currentCorrect ? '答对了!' : '答错了'}
              </span>
            </div>
            <div className="quiz-explanation">
              <p>{currentQuiz.explanation}</p>
            </div>
          </div>
        )}
      </article>

      {/* Bottom buttons */}
      <div className="quiz-nav-buttons">
        {phase === 'answering' ? (
          <button
            type="button"
            className="btn btn-primary btn-large quiz-confirm-btn"
            disabled={
              isOrder
                ? !orderReady
                : isSpelling
                ? textValue.trim().length === 0
                : selectedChoice === undefined
            }
            onClick={handleConfirm}
          >
            确认答案
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-large quiz-next-btn"
            data-sound-skip
            onClick={handleNext}
          >
            {currentIndex + 1 >= total ? '查看结果' : '下一题'}
          </button>
        )}
      </div>
    </div>
  )
}

function QuestionMeaningBlock({
  quiz,
  showAnswer,
}: {
  quiz: SmartQuizQuestion
  showAnswer: boolean
}) {
  return (
    <div className="quiz-meaning-card">
      <p className="quiz-core-label">
        {quiz.type === 'grammar' ? '语法语境' : '中文意思'}
      </p>
      <p className="quiz-zh-main">{quiz.coreSentenceZh ?? '请根据课程语境还原日语。'}</p>
      {quiz.sentenceWithBlank && (
        <div className="quiz-fill-preview">
          <p className="quiz-core-label">填空句</p>
          <p className="quiz-fill-sentence">{quiz.sentenceWithBlank}</p>
        </div>
      )}
      {showAnswer && (
        <p className="quiz-answer-ja">
          <span>参考句</span>
          {quiz.coreSentence}
        </p>
      )}
    </div>
  )
}

function getSpellingPrompt(quiz: SmartQuizQuestion): string {
  if (quiz.type === 'vocab_spelling') return '请写出对应的日语单词。'
  if (quiz.type === 'sentence_fill') return '请填入横线处缺失的日语。'
  return '请用日语写出上面的中文意思。'
}

function getSpellingPlaceholder(quiz: SmartQuizQuestion): string {
  if (quiz.type === 'vocab_spelling') return '输入日语单词或读音'
  if (quiz.type === 'sentence_fill') return '输入横线处内容'
  return '写出完整日语句子'
}

function getPrimaryAnswer(quiz: SmartQuizQuestion): string {
  if (quiz.type === 'vocab_spelling' || quiz.type === 'sentence_fill') {
    return quiz.acceptedAnswers?.[0] ?? quiz.targetWord ?? quiz.coreSentence
  }
  return quiz.coreSentence
}

function OrderAnswerBlock({
  quiz,
  selectedIndexes,
  disabled,
  correct,
  onSelect,
  onRemove,
  onClear,
}: {
  quiz: SmartQuizQuestion
  selectedIndexes: number[]
  disabled: boolean
  correct: boolean
  onSelect: (index: number, chunk: string) => void
  onRemove: (index: number) => void
  onClear: () => void
}) {
  const chunks = quiz.orderChunks ?? []
  const selectedChunks = selectedIndexes
    .map((index) => chunks[index])
    .filter((chunk): chunk is string => Boolean(chunk))

  return (
    <div className="quiz-order-block">
      <div className="quiz-order-answer" aria-label="当前排序答案">
        {selectedChunks.length === 0 ? (
          <span className="quiz-order-placeholder">按顺序点击下方词块</span>
        ) : (
          selectedIndexes.map((index, order) => (
            <button
              key={`${index}-${order}`}
              type="button"
              className="quiz-order-selected"
              disabled={disabled}
              onClick={() => onRemove(index)}
            >
              {chunks[index]}
            </button>
          ))
        )}
      </div>

      <div className="quiz-order-pool" aria-label="可选词块">
        {chunks.map((chunk, index) => {
          const used = selectedIndexes.includes(index)
          return (
            <button
              key={`${chunk}-${index}`}
              type="button"
              className={`quiz-order-chip ${used ? 'is-used' : ''}`}
              disabled={disabled || used}
              onClick={() => onSelect(index, chunk)}
              title="点击发音并加入答案"
            >
              {chunk}
            </button>
          )
        })}
      </div>

      {!disabled && selectedIndexes.length > 0 && (
        <button type="button" className="quiz-order-clear" onClick={onClear}>
          清空重排
        </button>
      )}

      {disabled && (
        <p className={`spell-result ${correct ? 'ok' : 'ng'}`}>
          {correct ? '排序正确!' : `参考答案：${quiz.coreSentence}`}
        </p>
      )}
    </div>
  )
}

function getOrderAnswer(quiz: SmartQuizQuestion, selectedIndexes: number[]): string {
  const chunks = quiz.orderChunks ?? []
  return selectedIndexes
    .map((index) => chunks[index] ?? '')
    .join('')
}
