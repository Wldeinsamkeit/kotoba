import { useCallback, useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useStreamingDialogue } from '../hooks/useStreamingDialogue'
import { getLesson, lessonLifeOrder, lessons } from '../data/lessons'
import { useProgress } from '../context/ProgressContext'
import { getCharacterProfile, getCoreCharacterRoster, AFFINITY_GREETINGS, type CharacterProfile } from '../data/characters'
import type { CharacterAffinity, DialogueChoice, Lesson, VocabItem } from '../types'
import { getLessonMemory, type LessonMemory } from '../lib/lessonMemory'
import { findVocabSpansInSentence, getLessonVocabulary } from '../lib/lessonVocabulary'
import { getLessonVocabGroupId } from '../lib/wordCardCategory'
import { hasCollectedWordCard } from '../lib/wordCards'
import { getLessonStory, getStorySpeakerName, type LessonStory } from '../lib/lessonStory'
import { parseLessonTitle } from '../lib/lessonTitle'
import { useLessonCheckMode } from '../lib/lessonCheckMode'
import { hasLessonPassed } from '../lib/progress'
import { toDialogueRomaji } from '../lib/romaji'
import { anchorFromElement } from '../lib/vocabPopupPosition'
import { ShadowingButton } from '../components/ShadowingButton'
import { AffinityBar } from '../components/AffinityBar'
import { DialogueChoicePanel } from '../components/DialogueChoice'
import { triggerXPToast } from '../components/XPToast'

const ROMAJI_STORAGE_KEY = 'nihongo-dialogue-romaji'
const ROMAJI_DEFAULT_LESSON_COUNT = 5

type VocabAnchor = {
  x: number
  y: number
  placement: 'below' | 'above'
}

type VocabGroup = {
  id: string
  title: string
  hint: string
  items: VocabItem[]
}

function groupVocabulary(items: VocabItem[]): VocabGroup[] {
  const meta: Record<string, Omit<VocabGroup, 'items'>> = {
    'core-phrases': {
      id: 'core-phrases',
      title: '核心表达',
      hint: '寒暄、固定搭配和对话里可直接整块使用的表达',
    },
    'people-places': {
      id: 'people-places',
      title: '人物地点与名词',
      hint: '人物、身份、地点和场景名词',
    },
    actions: {
      id: 'actions',
      title: '动作与动词',
      hint: '对话中真正发生的动作、状态变化',
    },
    descriptors: {
      id: 'descriptors',
      title: '描述与副词',
      hint: '描述感受、程度和方式的词',
    },
    'grammar-particles': {
      id: 'grammar-particles',
      title: '语法助词与句尾',
      hint: '助词、礼貌结尾、语气词和基础语法碎片',
    },
  }

  const grouped = new Map<string, VocabItem[]>()
  items.forEach((item) => {
    const id = getLessonVocabGroupId(item)
    grouped.set(id, [...(grouped.get(id) ?? []), item])
  })

  return Object.keys(meta)
    .map((id) => ({ ...meta[id], items: grouped.get(id) ?? [] }))
    .filter((group) => group.items.length > 0)
}

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const [searchParams] = useSearchParams()
  const [checkMode] = useLessonCheckMode()
  const lesson = lessonId ? getLesson(lessonId) : undefined
  const { progress: storedProgress, addAffinity, completeDailyTask, collectLessonWordCard } = useProgress()

  const [selectedVocab, setSelectedVocab] = useState<VocabItem | null>(null)
  const [vocabAnchor, setVocabAnchor] = useState<VocabAnchor | null>(null)
  const [expandedVocabWord, setExpandedVocabWord] = useState<string | null>(null)
  const [sessionCollectedCount, setSessionCollectedCount] = useState(0)
  const [shadowCount, setShadowCount] = useState(0)
  const [dialogueCompleted, setDialogueCompleted] = useState(false)
  const [pendingChoice, setPendingChoice] = useState<number | null>(null)
  const [choiceResults, setChoiceResults] = useState<Record<number, string>>({})
  const [openVocabGroups, setOpenVocabGroups] = useState<Set<string>>(
    () => new Set(['core-phrases']),
  )

  // 使用预定义的学习顺序来获取上一课和下一课，而不是依赖数组索引
  const currentOrderIndex = lesson ? lessonLifeOrder.indexOf(lesson.id as (typeof lessonLifeOrder)[number]) : -1
  const previousLessonId = currentOrderIndex > 0 ? lessonLifeOrder[currentOrderIndex - 1] : null
  const nextLessonId = currentOrderIndex >= 0 && currentOrderIndex < lessonLifeOrder.length - 1
    ? lessonLifeOrder[currentOrderIndex + 1]
    : null
  const previousLesson = previousLessonId ? getLesson(previousLessonId) : null
  const nextLesson = nextLessonId ? getLesson(nextLessonId) : null
  const currentLessonPassed = lesson ? hasLessonPassed(storedProgress, lesson.id) : false
  const previousLessonPassed = previousLesson ? hasLessonPassed(storedProgress, previousLesson.id) : true
  const [romajiPreference, setRomajiPreference] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = window.localStorage.getItem(ROMAJI_STORAGE_KEY)
    if (saved === 'on') return true
    if (saved === 'off') return false
    return null
  })
  const romajiDefaultOn =
    currentOrderIndex >= 0 && currentOrderIndex < ROMAJI_DEFAULT_LESSON_COUNT
  const showRomaji = romajiPreference ?? romajiDefaultOn

  const isUnlocked =
    checkMode ||
    searchParams.get('check') === '1' ||
    currentOrderIndex <= 0 ||
    currentLessonPassed ||
    previousLessonPassed

  const dialogue = lesson?.dialogue ?? []
  const lessonVocabulary = useMemo(() => getLessonVocabulary(lesson), [lesson])
  const vocabGroups = useMemo(() => groupVocabulary(lessonVocabulary), [lessonVocabulary])
  const collectedInLessonCount = useMemo(
    () =>
      lesson && lessonVocabulary.length > 0
        ? lessonVocabulary.filter((item) =>
            hasCollectedWordCard(storedProgress, lesson.id, item.word),
          ).length
        : 0,
    [lesson, lessonVocabulary, storedProgress.collectedWordCards],
  )
  const {
    visibleLines,
    playState,
    start: startDialogue,
    resume: resumeDialogue,
    pause: pauseDialogue,
    replayLine,
    lineCount,
  } = useStreamingDialogue(dialogue)

  const closeVocab = useCallback(() => {
    setSelectedVocab(null)
    setVocabAnchor(null)
  }, [])

  const collectVocabCard = useCallback(
    (vocab: VocabItem) => {
      if (!lesson) return
      const isNew = collectLessonWordCard(lesson.id, lesson.title, vocab)
      if (isNew) {
        setSessionCollectedCount((count) => count + 1)
      }
    },
    [lesson, collectLessonWordCard],
  )

  const toggleVocabCard = useCallback(
    (vocab: VocabItem) => {
      collectVocabCard(vocab)
      setExpandedVocabWord((current) => (current === vocab.word ? null : vocab.word))
      closeVocab()
    },
    [collectVocabCard, closeVocab],
  )

  const openVocab = useCallback(
    (vocab: VocabItem, target: HTMLElement) => {
      if (selectedVocab?.word === vocab.word && vocabAnchor) {
        closeVocab()
        return
      }
      collectVocabCard(vocab)
      setExpandedVocabWord(null)
      // Add affinity to the current speaker
      if (pendingChoice !== null || visibleLines > 0) {
        const currentLine = dialogue[Math.min(visibleLines - 1, dialogue.length - 1)]
        if (currentLine) {
          const speaker = getCharacterProfile(currentLine.speaker)
          if (speaker.id !== 'oda' && speaker.id !== 'guest') {
            addAffinity(speaker.id, 2)
          }
        }
      }
      setSelectedVocab(vocab)
      const anchor = anchorFromElement(target.getBoundingClientRect())
      setVocabAnchor(anchor)
    },
    [
      selectedVocab,
      vocabAnchor,
      closeVocab,
      collectVocabCard,
      dialogue,
      visibleLines,
      pendingChoice,
      addAffinity,
    ],
  )

  useEffect(() => {
    closeVocab()
    setExpandedVocabWord(null)
    setSessionCollectedCount(0)
    setShadowCount(0)
    setDialogueCompleted(false)
    setPendingChoice(null)
    setChoiceResults({})
  }, [lesson?.id, closeVocab])

  useEffect(() => {
    if (!selectedVocab) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeVocab()
    }
    const onScroll = () => closeVocab()
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [selectedVocab, closeVocab])

  // Track dialogue completion
  useEffect(() => {
    if (playState === 'finished' && !dialogueCompleted) {
      setDialogueCompleted(true)
      completeDailyTask('daily-dialogue')
      // Add affinity to all characters in this lesson
      const speakers = new Set(dialogue.map((l) => getCharacterProfile(l.speaker).id))
      speakers.forEach((id) => {
        if (id !== 'oda' && id !== 'guest') {
          addAffinity(id, 20)
        }
      })
    }
  }, [playState, dialogueCompleted, dialogue, addAffinity, completeDailyTask])

  // Track vocab collection daily task
  useEffect(() => {
    if (sessionCollectedCount >= 5) {
      completeDailyTask('daily-vocab')
    }
  }, [sessionCollectedCount, completeDailyTask])

  // Track shadow daily task
  useEffect(() => {
    if (shadowCount >= 3) {
      completeDailyTask('daily-shadow')
    }
  }, [shadowCount, completeDailyTask])

  const selectedMemory = selectedVocab ? getLessonMemory(selectedVocab) : null
  const story = lesson ? getLessonStory(lesson, currentOrderIndex + 1) : null
  const lessonTitleParts = lesson ? parseLessonTitle(lesson.title) : null
  const lessonGoal =
    lesson && lessonTitleParts
      ? lessonTitleParts.topicJa !== lessonTitleParts.topicZh
        ? lessonTitleParts.topicJa
        : lesson.grammar.split(/[；。]/)[0] || lesson.title
      : ''
  const coreRoster = getCoreCharacterRoster()
  const coreRosterIds = useMemo(() => new Set(coreRoster.map((character) => character.id)), [coreRoster])
  const episodeCharacterIds = useMemo(() => {
    const ids = new Set<string>()
    dialogue.forEach((line) => {
      const speaker = getCharacterProfile(line.speaker)
      if (coreRosterIds.has(speaker.id)) ids.add(speaker.id)
    })
    return ids
  }, [dialogue, coreRosterIds])
  const unlockedCharacterIds = useMemo(() => {
    const ids = new Set<string>(['oda'])
    coreRoster.forEach((character) => {
      const affinity = storedProgress.characterAffinity[character.id]
      const unlockIndex = character.unlockLessonId
        ? lessons.findIndex((candidate) => candidate.id === character.unlockLessonId)
        : -1

      if (!character.unlockLessonId || episodeCharacterIds.has(character.id) || (affinity?.points ?? 0) > 0) {
        ids.add(character.id)
        return
      }

      if (unlockIndex >= 0 && currentOrderIndex >= unlockIndex) {
        ids.add(character.id)
      }
    })
    return ids
  }, [coreRoster, episodeCharacterIds, currentOrderIndex, storedProgress.characterAffinity])
  const questProgress = lineCount > 0 ? Math.round((visibleLines / lineCount) * 100) : 0

  const handleShadowComplete = useCallback((speakerId: string) => {
    setShadowCount((c) => c + 1)
    addAffinity(speakerId, 5)
    triggerXPToast(5, 'shadow')
    addAffinity
  }, [addAffinity])

  const toggleRomaji = useCallback(() => {
    setRomajiPreference((previous) => {
      const next = !(previous ?? romajiDefaultOn)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ROMAJI_STORAGE_KEY, next ? 'on' : 'off')
      }
      return next
    })
  }, [romajiDefaultOn])

  const toggleVocabGroup = useCallback((groupId: string) => {
    setOpenVocabGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }, [])

  const handleChoiceSelect = useCallback((choice: DialogueChoice, lineIndex: number) => {
    setChoiceResults((prev) => ({ ...prev, [lineIndex]: choice.textZh }))
    setPendingChoice(null)
    // Apply affinity changes
    Object.entries(choice.affinityChange).forEach(([charId, points]) => {
      addAffinity(charId, points)
    })
  }, [addAffinity])

  if (!lesson) {
    return (
      <div className="page">
        <p>找不到该课程。</p>
        <Link to="/lessons">返回列表</Link>
      </div>
    )
  }

  if (!isUnlocked) {
    return (
      <div className="page lesson-detail">
        <Link className="back-link lesson-back-link" to="/lessons">
          ← 返回课程
        </Link>
        <nav className="breadcrumb">
          <Link to="/lessons">每日课程</Link>
          <span aria-hidden> / </span>
          <span>{lesson.title}</span>
        </nav>
        <section className="lesson-locked-panel">
          <span className="lesson-locked-icon">锁</span>
          <h1>该对话单元尚未解锁</h1>
          <p>
            请先通过上一单元「{previousLesson?.title}」，再进入本单元学习。
          </p>
          <Link className="btn btn-primary" to={`/lessons/${previousLesson?.id ?? ''}`}>
            去上一单元
          </Link>
        </section>
      </div>
    )
  }

  function renderInteractiveSentence(sentence: string) {
    if (!lesson) return sentence
    const spans = findVocabSpansInSentence(sentence, lessonVocabulary)
    if (spans.length === 0) return sentence

    const nodes: Array<string | ReactNode> = []
    let cursor = 0
    spans.forEach((span, index) => {
      if (span.start > cursor) {
        nodes.push(sentence.slice(cursor, span.start))
      }
      const isActive = selectedVocab?.word === span.item.word
      nodes.push(
        <button
          key={`${span.item.word}-${span.start}-${index}`}
          type="button"
          className={`dialogue-word-hit${isActive ? ' is-active' : ''}`}
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation()
            openVocab(span.item, e.currentTarget)
          }}
          aria-expanded={isActive}
          aria-label={`查看「${span.item.word}」释义`}
        >
          {span.text}
        </button>,
      )
      cursor = span.end
    })
    if (cursor < sentence.length) {
      nodes.push(sentence.slice(cursor))
    }
    return nodes
  }

  // Get a greeting based on highest affinity character
  function getAffinityGreeting(): string | null {
    let bestChar: string | null = null
    let bestPoints = 0
    Object.entries(storedProgress.characterAffinity).forEach(([id, aff]) => {
      if (aff.points > bestPoints) {
        bestPoints = aff.points
        bestChar = id
      }
    })
    if (!bestChar || bestPoints < 50) return null
    const charAff = storedProgress.characterAffinity[bestChar]
    const greetings = AFFINITY_GREETINGS[bestChar]
    if (!greetings) return null
    const levelGreetings = greetings[charAff.level]
    if (!levelGreetings) return null
    return levelGreetings[Math.floor(Math.random() * levelGreetings.length)]
  }

  const affinityGreeting = getAffinityGreeting()

  return (
    <div className="page lesson-detail">
      <Link className="back-link lesson-back-link" to="/lessons">
        ← 返回课程
      </Link>
      <nav className="breadcrumb">
        <Link to="/lessons">每日课程</Link>
        <span aria-hidden> / </span>
        <span>{lesson.title}</span>
      </nav>

      <header className="page-header">
        <div className="title-row">
          <div>
            <p className="unit-kicker">第 {currentOrderIndex + 1} 集 · {story?.arc}</p>
            <h1>{lesson.title}</h1>
          </div>
          <div className="unit-status-stack">
            <span className={`badge badge-level-${lesson.level}`}>
              {lesson.level}
            </span>
            {currentLessonPassed && (
              <span className="badge badge-done">✓ 已通过</span>
            )}
          </div>
        </div>
        {story && (
          <PixelEpisodeIntro
            lesson={lesson}
            story={story}
            roster={coreRoster}
            unlockedCharacterIds={unlockedCharacterIds}
            episodeCharacterIds={episodeCharacterIds}
            characterAffinity={storedProgress.characterAffinity}
            level={storedProgress.level}
            totalXP={storedProgress.totalXP}
            questProgress={questProgress}
            collectedCount={collectedInLessonCount}
            vocabularyCount={lessonVocabulary.length}
            affinityGreeting={affinityGreeting}
          />
        )}
        <div className="tag-row">
          {lesson.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      </header>

      {story && lessonTitleParts && (
        <section className="lesson-goal-card" aria-label="本课目标句型">
          <div>
            <span className="unit-section-label">目标句型</span>
            <h2>{lessonGoal}</h2>
            <p>{story.mission}</p>
          </div>
          <div className="lesson-goal-meter" aria-label="本课反馈">
            <div>
              <span>对话</span>
              <strong>{visibleLines}/{lineCount}</strong>
            </div>
            <div>
              <span>词卡</span>
              <strong>{collectedInLessonCount}/{lessonVocabulary.length}</strong>
            </div>
            <div>
              <span>跟读</span>
              <strong>{shadowCount}</strong>
            </div>
          </div>
        </section>
      )}

      <section className="section-block unit-section" aria-labelledby="dialogue-heading">
        <div className="unit-section-head">
          <div>
            <span className="unit-section-label">基础会话</span>
            <h2 id="dialogue-heading">流式对话</h2>
          </div>
          <div className="dialogue-play-actions">
            <button
              type="button"
              className={`dialogue-romaji-toggle${showRomaji ? ' is-on' : ''}`}
              onClick={toggleRomaji}
              aria-pressed={showRomaji}
            >
              ローマ字 {showRomaji ? '开' : '关'}
            </button>
            {playState === 'idle' && (
              <button type="button" className="btn btn-primary" onClick={startDialogue}>
                开始本集任务
              </button>
            )}
            {playState === 'playing' && (
              <>
                <span className="dialogue-playing-badge" aria-live="polite">
                  <span className="dialogue-playing-dot" />
                  剧情推进 {visibleLines}/{lineCount}
                </span>
                <button type="button" className="btn btn-secondary" onClick={pauseDialogue}>
                  暂停
                </button>
              </>
            )}
            {playState === 'paused' && (
              <>
                <button type="button" className="btn btn-primary" onClick={resumeDialogue}>
                  继续播放
                </button>
                <button type="button" className="btn btn-secondary" onClick={startDialogue}>
                  从头开始
                </button>
              </>
            )}
            {playState === 'finished' && (
              <>
                <span className="dialogue-finished-badge">本集对话完成</span>
                <button type="button" className="btn btn-secondary" onClick={startDialogue}>
                  再听一遍
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dialogue progress bar */}
        <div className="dialogue-progress-bar">
          <div className="dialogue-progress-fill" style={{ width: `${questProgress}%` }} />
          <div className="dialogue-progress-markers">
            {[25, 50, 75, 100].map((mark) => (
              <span
                key={mark}
                className={`progress-marker ${questProgress >= mark ? 'reached' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="dialogue chat-dialogue" aria-live="polite">
          {dialogue.slice(0, visibleLines).map((line, i) => {
            const speakerName = getStorySpeakerName(line.speaker)
            const speaker = getCharacterProfile(line.speaker)
            const hasChoice = line.choices && line.choices.length > 0
            const choiceMade = choiceResults[i] !== undefined
            const romaji = showRomaji ? toDialogueRomaji(line.ja, lessonVocabulary) : ''

            return (
              <div key={i}>
                <div
                  role="button"
                  tabIndex={0}
                  className={`dialogue-line chat-bubble ${i % 2 === 0 ? 'from-left' : 'from-right'} palette-${speaker.palette} ${playState === 'playing' && i === visibleLines - 1 ? 'is-speaking' : ''}`}
                  onClick={() => replayLine(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      replayLine(i)
                    }
                  }}
                  aria-label={`${speakerName}：${line.ja}，点击重听`}
                >
                  <div className="pixel-speaker-frame" aria-hidden="true">
                    {speaker.avatar ? (
                      <img src={speaker.avatar} alt="" />
                    ) : (
                      <span>{speaker.glyph}</span>
                    )}
                  </div>
                  <div className="chat-bubble-body">
                    <div className="chat-bubble-top">
                      <span className="speaker">{speakerName}</span>
                      <span className="speaker-role">{speaker.role}</span>
                    </div>
                    <p className="ja">{renderInteractiveSentence(line.ja)}</p>
                    {showRomaji && romaji && (
                      <p className="romaji" lang="en-Latn">{romaji}</p>
                    )}
                    <p className="zh">{line.zh}</p>
                  </div>
                </div>

                {/* Shadowing button */}
                {speaker.id !== 'oda' && speaker.id !== 'guest' && (
                  <div className="dialogue-line-actions">
                    <ShadowingButton
                      jaText={line.ja}
                      speakerName={speakerName}
                      onComplete={() => handleShadowComplete(speaker.id)}
                    />
                    <AffinityBar
                      affinity={storedProgress.characterAffinity[speaker.id]}
                      characterName={speakerName}
                      compact
                    />
                  </div>
                )}

                {/* Dialogue choice */}
                {hasChoice && !choiceMade && pendingChoice === i && (
                  <DialogueChoicePanel
                    choices={line.choices!}
                    onSelect={(choice) => handleChoiceSelect(choice, i)}
                  />
                )}
                {hasChoice && choiceMade && (
                  <div className="dialogue-choice-result">
                    你选择了：{choiceResults[i]}
                  </div>
                )}
                {hasChoice && !choiceMade && pendingChoice !== i && playState === 'playing' && i === visibleLines - 1 && (
                  <button
                    type="button"
                    className="btn btn-secondary dialogue-choice-trigger"
                    onClick={() => setPendingChoice(i)}
                  >
                    选择回应...
                  </button>
                )}
              </div>
            )
          })}
          {visibleLines === 0 && playState === 'idle' && (
            <div className="dialogue-empty">
              点击「开始本集任务」，小田会像 RPG 对话一样逐句推进并自动发音。
            </div>
          )}
        </div>
      </section>

      <section className="section-block unit-section" aria-labelledby="vocab-heading">
        <div className="unit-section-head">
          <div>
            <span className="unit-section-label">教学板块</span>
            <h2 id="vocab-heading">本单元词汇</h2>
          </div>
          <div className="vocab-collection-status">
            卡牌背包 {collectedInLessonCount}/{lessonVocabulary.length}
            <Link className="vocab-collection-link" to="/relationships/cards">
              查看全部 →
            </Link>
          </div>
        </div>
        <div className="vocab-group-stack" aria-label="本课词汇分类">
          {vocabGroups.map((group) => {
            const isOpen = openVocabGroups.has(group.id)
            const collectedInGroup = lesson
              ? group.items.filter((v) => hasCollectedWordCard(storedProgress, lesson.id, v.word)).length
              : 0
            return (
              <section
                key={group.id}
                className={`vocab-group${isOpen ? ' is-open' : ' is-closed'}`}
              >
                <button
                  type="button"
                  className="vocab-group-toggle"
                  aria-expanded={isOpen}
                  aria-controls={`vocab-group-${group.id}`}
                  onClick={() => toggleVocabGroup(group.id)}
                >
                  <span className="vocab-group-copy">
                    <strong>{group.title}</strong>
                    <small>{group.hint}</small>
                  </span>
                  <span className="vocab-group-meta">
                    <span>{collectedInGroup}/{group.items.length}</span>
                    <em>{isOpen ? '收起' : '展开'}</em>
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={`vocab-group-${group.id}`}
                    className="vocab-grid"
                    aria-label={`${group.title}词卡`}
                  >
                    {group.items.map((v) => {
                      const collected = lesson
                        ? hasCollectedWordCard(storedProgress, lesson.id, v.word)
                        : false
                      const isExpanded = expandedVocabWord === v.word
                      const memory = getLessonMemory(v)
                      return (
                        <article
                          key={v.word + v.meaning}
                          className={[
                            'vocab-card',
                            isExpanded ? 'is-expanded' : '',
                            collected ? 'is-collected' : '',
                          ].filter(Boolean).join(' ')}
                        >
                          <button
                            type="button"
                            className="vocab-card-hit"
                            aria-expanded={isExpanded}
                            onClick={() => toggleVocabCard(v)}
                          >
                            <span className="vocab-card-token">
                              {collected ? '已入卡牌' : '收入卡牌'}
                            </span>
                            <div className="vocab-ja">{v.word}</div>
                            <div className="vocab-reading">{v.reading || '—'}</div>
                            <p className="vocab-meaning">{v.meaning}</p>
                            <span className="vocab-card-expand-hint">
                              {isExpanded ? '点击收起' : '点击展开记忆法'}
                            </span>
                          </button>
                          {isExpanded && (
                            <div className="vocab-card-detail">
                              <p className="vocab-card-detail-label">单词意思</p>
                              <p className="vocab-card-detail-meaning">{v.meaning}</p>
                              <VocabMemoryBlock memory={memory} />
                              <p className="vocab-card-collected">
                                已收入羁绊「卡牌背包」。
                                <Link to="/relationships/cards">去查看 →</Link>
                              </p>
                            </div>
                          )}
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      </section>

      <section className="section-block unit-section">
        <div className="unit-section-head">
          <div>
            <span className="unit-section-label">教学板块</span>
            <h2>语法要点</h2>
          </div>
        </div>
        <p className="prose">{lesson.grammar}</p>
        <h3 className="mt-1">考试提示</h3>
        <p className="prose exam-tip">{lesson.examTip}</p>
      </section>

      <section className="section-block smart-quiz-intro">
        <div className="smart-quiz-card">
          <div className="smart-quiz-card-main">
            <span className="unit-section-label">智能测试</span>
            <h2>用核心句检验掌握程度</h2>
            <p>
              题目全部来自本课对话：先考单词拼写，再考语法意思与运用，最后用排序和填空还原句子。
            </p>
            <ul className="smart-quiz-types">
              <li><strong>单词·拼写</strong> — 根据中文意思输入日语单词或读音</li>
              <li><strong>语法·运用</strong> — 判断语法点的意思和使用场景</li>
              <li><strong>句子·排序/填空</strong> — 点击词块听音排序，再补全缺失部分</li>
            </ul>
          </div>
          <Link to={`/lessons/${lesson.id}/quiz`} className="btn btn-primary btn-large">
            开始智能测试
          </Link>
        </div>
      </section>

      {/* Next lesson navigation */}
      {nextLesson && (
        <section className="section-block next-lesson-nav">
          <div className="next-lesson-card">
            <div className="next-lesson-info">
              <span className="unit-section-label">继续学习</span>
              <p>准备好进入下一课了吗？</p>
            </div>
            <Link
              className="btn btn-primary btn-large"
              to={`/lessons/${nextLesson.id}`}
            >
              下一课：{nextLesson.title}
            </Link>
          </div>
        </section>
      )}

      {selectedVocab && vocabAnchor && (
        <>
          <button
            type="button"
            className="dialogue-vocab-backdrop"
            aria-label="关闭单词释义"
            onClick={closeVocab}
          />
          <div
            className={`dialogue-vocab-popover placement-${vocabAnchor.placement}`}
            role="dialog"
            aria-label="单词释义"
            style={{
              left: `${vocabAnchor.x}px`,
              top: `${vocabAnchor.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="vocab-popover-close"
              onClick={closeVocab}
              aria-label="关闭"
            >
              ×
            </button>
            <div className="vocab-popover-word">{selectedVocab.word}</div>
            <div className="vocab-popover-reading">
              {selectedVocab.reading || '读音待补充'}
            </div>
            <p className="vocab-popover-meaning">{selectedVocab.meaning}</p>
            <p className="vocab-popover-collected">
              已收入羁绊「卡牌背包」。
              <Link to="/relationships/cards">去查看 →</Link>
            </p>
            {selectedMemory && <VocabMemoryBlock memory={selectedMemory} compact />}
          </div>
        </>
      )}
    </div>
  )
}

function PixelEpisodeIntro({
  lesson,
  story,
  roster,
  unlockedCharacterIds,
  episodeCharacterIds,
  characterAffinity,
  level,
  totalXP,
  questProgress,
  collectedCount,
  vocabularyCount,
  affinityGreeting,
}: {
  lesson: Lesson
  story: LessonStory
  roster: CharacterProfile[]
  unlockedCharacterIds: Set<string>
  episodeCharacterIds: Set<string>
  characterAffinity: Record<string, CharacterAffinity>
  level: number
  totalXP: number
  questProgress: number
  collectedCount: number
  vocabularyCount: number
  affinityGreeting: string | null
}) {
  const oda = roster[0]
  const [isStoryOpen, setIsStoryOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }
    return !window.matchMedia('(max-width: 768px)').matches
  })
  const [isCastOpen, setIsCastOpen] = useState(false)
  const unlockedCount = roster.filter((character) => unlockedCharacterIds.has(character.id)).length

  return (
    <section
      className={`pixel-episode-card${isStoryOpen ? ' is-open' : ' is-closed'}`}
      aria-label="像素剧情开场"
    >
      <button
        type="button"
        className="pixel-episode-toggle"
        aria-expanded={isStoryOpen}
        aria-controls="pixel-episode-content"
        onClick={() => setIsStoryOpen((open) => !open)}
      >
        <span>
          <strong>{story.episodeTitle}</strong>
          <small>{story.location} · Lv.{level} · {questProgress}%</small>
        </span>
        <span className="pixel-episode-toggle-action">
          {isStoryOpen ? '收起' : '展开'}
        </span>
      </button>

      {affinityGreeting && (
        <div className="affinity-greeting-banner">
          {affinityGreeting}
        </div>
      )}
      <div id="pixel-episode-content" className="pixel-episode-content">
        <div className="pixel-episode-grid">
          <div className="pixel-hero-portrait">
            {oda.avatar ? <img src={oda.avatar} alt="小田像素头像" /> : <span>{oda.glyph}</span>}
          </div>
          <div className="pixel-episode-main">
            <div className="pixel-episode-topline">
              <span>{story.location}</span>
              <span>Lv.{level}</span>
              <span>{totalXP} XP</span>
            </div>
            <h2>{story.episodeTitle}</h2>
            <p>{story.intro}</p>
            <div className="pixel-quest-box">
              <span>本集任务</span>
              <p>{story.mission}</p>
            </div>
            {story.nextHook && <p className="lesson-story-next">{story.nextHook}</p>}
          </div>
        </div>

        <div className="pixel-episode-footer">
          <div className="pixel-quest-stats" aria-label="本集进度">
            <div>
              <span>对话推进</span>
              <strong>{questProgress}%</strong>
            </div>
            <div>
              <span>词卡收集</span>
              <strong>{collectedCount}/{vocabularyCount}</strong>
            </div>
            <div>
              <span>测试关卡</span>
              <strong>{lesson.quizzes.length} 题</strong>
            </div>
          </div>

          <div className="pixel-cast-panel">
            <button
              type="button"
              className="pixel-cast-toggle"
              onClick={() => setIsCastOpen((open) => !open)}
              aria-expanded={isCastOpen}
              aria-controls="pixel-cast-drawer"
            >
              <span>人物图鉴</span>
              <strong>{unlockedCount}/{roster.length} 已解锁</strong>
            </button>

            {isCastOpen && (
              <div id="pixel-cast-drawer" className="pixel-cast-drawer" aria-label="人物解锁卡片">
                {roster.map((character) => {
                  const unlocked = unlockedCharacterIds.has(character.id)
                  const appearsThisEpisode = episodeCharacterIds.has(character.id)
                  const affinity = characterAffinity[character.id]

                  return (
                    <article
                      key={character.id}
                      className={[
                        'pixel-party-member',
                        'pixel-cast-card',
                        `palette-${character.palette}`,
                        unlocked ? 'is-unlocked' : 'is-locked',
                      ].join(' ')}
                    >
                      <div className="pixel-party-avatar" aria-hidden="true">
                        {unlocked && character.avatar ? <img src={character.avatar} alt="" /> : <span>?</span>}
                      </div>
                      <div className="pixel-cast-copy">
                        <div className="pixel-cast-title-row">
                          <strong>{unlocked ? character.displayName : '未解锁角色'}</strong>
                          <span className="pixel-cast-status">
                            {unlocked ? `好感 Lv.${affinity?.level ?? 1}` : '锁定'}
                          </span>
                        </div>
                        <span>{unlocked ? character.relationship : character.unlockHint}</span>
                        <p>{unlocked ? character.profile : '继续通过每日课程，在小田的故事里遇见这个角色。'}</p>
                        {unlocked && appearsThisEpisode && <em>本集登场</em>}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function VocabMemoryBlock({ memory, compact = false }: {
  memory: LessonMemory
  compact?: boolean
}) {
  return (
    <div className={`vocab-memory-block ${compact ? 'compact' : ''}`}>
      <div className="vocab-memory-meta">
        <span>{memory.source}记忆法</span>
        <span>{'⭐'.repeat(memory.difficultyStars)}</span>
      </div>
      <div className="vocab-memory-section">
        <strong>拆分</strong>
        <ul>
          {memory.elements.map((element, index) => (
            <li key={`${element.element}-${index}`}>
              <span>{element.element}</span>
              <p>{element.bridgeC}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="vocab-memory-section">
        <strong>联想场景</strong>
        <p>{memory.mergedScene}</p>
      </div>
      <div className="vocab-memory-section">
        <strong>复习提示</strong>
        <p>{memory.reviewHint}</p>
      </div>
    </div>
  )
}
