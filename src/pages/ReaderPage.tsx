import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { VocabItem, DictEntry } from '../types'
import { getBook, getChapter } from '../lib/booksIndex'
import { loadCoreWords, toggleCoreWord } from '../lib/coreWords'
import { upsertBookVocabulary, cloneBuiltinBook } from '../lib/customBooks'
import { useProgress } from '../context/ProgressContext'
import { todayLocal } from '../lib/dates'
import { lookupWord } from '../lib/dictionary'
import { playStar, playUnstar } from '../lib/soundEffects'

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function ReaderPage() {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>()

  const book = bookId ? getBook(bookId) : undefined
  const chapter = bookId && chapterId ? getChapter(bookId, chapterId) : undefined
  const { progress, completeChapter, setChapterReadPosition, toggleBookmark, addVocabulary, addReadingTime } = useProgress()
  const chapterKey = book && chapter ? `${book.id}::${chapter.id}` : null

  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0)
  const [selectedVocab, setSelectedVocab] = useState<VocabItem | null>(null)
  const [dictEntries, setDictEntries] = useState<DictEntry[]>([])
  const [vocabPopupPosition, setVocabPopupPosition] = useState<{ x: number; y: number } | null>(null)
  const [isEditingVocab, setIsEditingVocab] = useState(false)
  const [editWord, setEditWord] = useState('')
  const [editReading, setEditReading] = useState('')
  const [editMeaning, setEditMeaning] = useState('')
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [fontScale, setFontScale] = useState(1)
  const [lineHeight, setLineHeight] = useState(2.0)
  const [focusMode, setFocusMode] = useState(false)
  const [immersiveMode, setImmersiveMode] = useState(false)
  const [eyeMode, setEyeMode] = useState(() => {
    try {
      return localStorage.getItem('nihongo-reading-eye-mode-v1') === '1'
    } catch {
      return false
    }
  })
  const [readingStartTime] = useState<Date>(() => new Date())
  const [totalReadingTime, setTotalReadingTime] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [spreadMode, setSpreadMode] = useState(false)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  const paragraphRefs = useRef<Array<HTMLParagraphElement | null>>([])
  const currentBookmark = chapterKey ? progress.bookmarks[chapterKey] : undefined

  const [coreWordsState, setCoreWordsState] = useState(() => {
    try {
      return loadCoreWords()
    } catch {
      return {}
    }
  })
  const coreWords = book ? new Set(coreWordsState[book.id] ?? []) : new Set<string>()

  useEffect(() => {
    if (!chapter) return
    if (!chapterKey) return
    const saved = progress.lastReadByChapter[chapterKey]?.lastParagraphIndex
    setActiveParagraphIndex(saved ?? 0)
  }, [chapter?.id, chapterKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!chapter) return
    if (!chapterKey) return
    // 滚动时可能高频触发，这里做一个轻微 debounce，减少 localStorage 写入
    const t = window.setTimeout(() => {
      setChapterReadPosition(chapterKey, activeParagraphIndex)
    }, 450)
    return () => window.clearTimeout(t)
  }, [activeParagraphIndex, chapterKey, setChapterReadPosition])

  useEffect(() => {
    try {
      localStorage.setItem('nihongo-reading-eye-mode-v1', eyeMode ? '1' : '0')
    } catch {
      // ignore
    }
  }, [eyeMode])

  // 预计算分页所需的变量（需要在 useEffect 之前定义）
  const paragraphs = chapter?.paragraphs ?? []
  const totalParagraphs = paragraphs.length

  // Spread mode pagination - 双页翻页模式
  const PARAGRAPHS_PER_PAGE = useMemo(() => {
    return spreadMode ? 10 : totalParagraphs
  }, [spreadMode, totalParagraphs])

  const totalPages = useMemo(() => {
    return Math.ceil(totalParagraphs / PARAGRAPHS_PER_PAGE)
  }, [totalParagraphs, PARAGRAPHS_PER_PAGE])

  // 获取当前页的所有段落
  const currentPageParagraphs = useMemo(() => {
    if (!spreadMode) return []
    const start = currentPageIndex * PARAGRAPHS_PER_PAGE
    const end = start + PARAGRAPHS_PER_PAGE
    return paragraphs.slice(start, end)
  }, [spreadMode, currentPageIndex, paragraphs, PARAGRAPHS_PER_PAGE])

  // 将当前页的段落分成左右两栏（左栏优先）
  const leftPageParagraphs = useMemo(() => {
    if (!spreadMode) return []
    const midPoint = Math.ceil(currentPageParagraphs.length / 2)
    return currentPageParagraphs.slice(0, midPoint)
  }, [spreadMode, currentPageParagraphs])

  const rightPageParagraphs = useMemo(() => {
    if (!spreadMode) return []
    const midPoint = Math.ceil(currentPageParagraphs.length / 2)
    return currentPageParagraphs.slice(midPoint)
  }, [spreadMode, currentPageParagraphs])

  // 追踪阅读时间
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const elapsedMinutes = (now.getTime() - readingStartTime.getTime()) / (1000 * 60)
      setTotalReadingTime(elapsedMinutes)
    }, 1000)

    return () => clearInterval(interval)
  }, [readingStartTime])

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果正在编辑词汇，不处理快捷键
      if (isEditingVocab) return

      // ESC: 关闭弹窗或退出沉浸模式
      if (e.key === 'Escape') {
        if (selectedVocab) {
          closeVocabPopup()
        } else if (immersiveMode) {
          setImmersiveMode(false)
        }
        return
      }

      // 如果有弹窗打开，不处理其他快捷键
      if (selectedVocab) return

      const paragraphs = chapter?.paragraphs ?? []
      const totalPara = paragraphs.length
      const currentIdx = Math.min(Math.max(activeParagraphIndex, 0), totalPara - 1)

      // 上/下箭头：翻段
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        const direction = e.key === 'ArrowUp' ? -1 : 1
        goToParagraph(currentIdx + direction)
        return
      }

      // 空格：翻到下一段
      if (e.key === ' ' && !focusMode) {
        e.preventDefault()
        if (currentIdx < totalPara - 1) {
          goToParagraph(currentIdx + 1)
        }
        return
      }

      // F: 切换专注模式
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        setFocusMode(prev => !prev)
        return
      }

      // B: 切换当前段落书签
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault()
        if (chapterKey) {
          toggleBookmark(chapterKey, currentIdx)
        }
        return
      }

      // G: 跳转到书签位置
      if ((e.key === 'g' || e.key === 'G') && currentBookmark !== undefined) {
        e.preventDefault()
        goToParagraph(currentBookmark)
        return
      }

      // Home: 回到开头
      if (e.key === 'Home') {
        e.preventDefault()
        goToParagraph(0)
        return
      }

      // End: 跳到最后
      if (e.key === 'End') {
        e.preventDefault()
        goToParagraph(totalPara - 1)
        return
      }

      // Left/Right arrow: spread mode pagination
      if (spreadMode && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault()
        if (e.key === 'ArrowLeft') {
          goToPrevPage()
        } else {
          goToNextPage()
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedVocab, isEditingVocab, immersiveMode, focusMode, activeParagraphIndex, chapter?.paragraphs, chapterKey, currentBookmark, spreadMode, currentPageIndex, totalPages])

  // 页面卸载时保存阅读时间
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (totalReadingTime >= 0.5) { // 至少阅读30秒才记录
        const today = todayLocal()
        const minutes = Math.round(totalReadingTime)
        addReadingTime(today, minutes)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [totalReadingTime, addReadingTime])

  // 定期保存阅读时间（每分钟）
  useEffect(() => {
    const interval = setInterval(() => {
      if (totalReadingTime >= 1) {
        const today = todayLocal()
        const minutes = Math.floor(totalReadingTime)
        addReadingTime(today, minutes)
      }
    }, 60000) // 每分钟检查一次

    return () => clearInterval(interval)
  }, [totalReadingTime, addReadingTime])

  const vocabByWord = useMemo(() => {
    if (!book) return {}
    return Object.fromEntries(book.vocabulary.map((v) => [v.word, v])) as Record<
      string,
      VocabItem
    >
  }, [book])

  const vocabWordRegex = useMemo(() => {
    const words = Object.keys(vocabByWord)
    if (words.length === 0) return null
    const sorted = [...words].sort((a, b) => b.length - a.length)
    return new RegExp(`(${sorted.map(escapeRegExp).join('|')})`, 'g')
  }, [vocabByWord])

  const done = chapterKey ? progress.completedChapterIds.includes(chapterKey) : false
  const showIndex = Math.min(Math.max(activeParagraphIndex, 0), totalParagraphs - 1)

  useEffect(() => {
    if (!chapter) return
    if (focusMode) return
    const elements = paragraphRefs.current.filter(Boolean) as HTMLParagraphElement[]
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))
        const best = intersecting[0]
        if (!best) return
        const idx = Number((best.target as HTMLElement).dataset.index ?? '0')
        setActiveParagraphIndex(idx)
      },
      { threshold: [0.35, 0.5, 0.7] },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [chapter?.id, focusMode])

  function renderParagraph(text: string) {
    if (!vocabWordRegex) return text
    const parts = text.split(vocabWordRegex)
    return parts.map((part, i) => {
      const v = vocabByWord[part]
      if (!v) return <span key={i}>{part}</span>
      const isCore = coreWords.has(v.word)
      return (
        <button
          key={i}
          type="button"
          className={isCore ? 'vocab-hit vocab-hit-core' : 'vocab-hit'}
          onClick={(e) => {
            setSelectedVocab(v)
            // 查询词典
            const dictResults = lookupWord(v.word)
            setDictEntries(dictResults)
            const rect = e.currentTarget.getBoundingClientRect()
            setVocabPopupPosition({
              x: rect.left + rect.width / 2,
              y: rect.bottom + 8,
            })
          }}
          aria-label={`词汇：${v.word} - ${v.meaning}`}
        >
          {part}
        </button>
      )
    })
  }

  function closeVocabPopup() {
    setSelectedVocab(null)
    setDictEntries([])
    setVocabPopupPosition(null)
    setIsEditingVocab(false)
    setSaveMessage(null)
  }

  function startEditing() {
    if (!selectedVocab) return
    setEditWord(selectedVocab.word)
    setEditReading(selectedVocab.reading || '')
    setEditMeaning(selectedVocab.meaning)
    setIsEditingVocab(true)
    setSaveMessage(null)
  }

  function handleSaveVocab() {
    if (!book || !selectedVocab) return

    // 检查是否是自定义书籍
    const isCustomBook = book.id.endsWith('-custom')

    if (!isCustomBook) {
      // 如果是内置书籍，需要先创建副本
      if (window.confirm(
        '这是内置书籍，需要先创建自定义副本才能编辑词汇。是否现在创建？\n\n' +
        '创建后，您将拥有一本可以自由编辑词汇的自定义书籍。'
      )) {
        cloneBuiltinBook(book.id, book)
        setSaveMessage({
          type: 'success',
          text: '已创建自定义副本！请刷新页面后再进行编辑。'
        })
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
      return
    }

    // 保存到自定义书籍
    const success = upsertBookVocabulary(book.id, {
      word: editWord,
      reading: editReading || undefined,
      meaning: editMeaning
    })

    if (success) {
      setSaveMessage({ type: 'success', text: '✓ 词汇已更新' })
      // 更新当前选中的词汇
      setSelectedVocab({
        word: editWord,
        reading: editReading || undefined,
        meaning: editMeaning
      })
      setTimeout(() => {
        setIsEditingVocab(false)
        setSaveMessage(null)
      }, 1500)
    } else {
      setSaveMessage({ type: 'error', text: '保存失败，请重试' })
    }
  }

  if (!book || !chapter) {
    return (
      <div className="page">
        <p>找不到该阅读内容。</p>
        <Link to="/reading">返回目录</Link>
      </div>
    )
  }

  function goToParagraph(nextIndex: number) {
    const idx = Math.min(Math.max(nextIndex, 0), totalParagraphs - 1)
    setActiveParagraphIndex(idx)
    // 连续模式下自动定位到段落中间
    if (!focusMode && !spreadMode) {
      paragraphRefs.current[idx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }

  function goToNextPage() {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function goToPrevPage() {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className={`page reader-page ${immersiveMode ? 'fullscreen-mode' : ''}`}>
      <header className={`page-header reader-header ${immersiveMode ? 'fullscreen-header' : ''}`}>
        <nav className="breadcrumb">
          <Link to="/reading">阅读</Link>
          <span aria-hidden> / </span>
          <span>{book.title}</span>
          <span aria-hidden> / </span>
          <span>{chapter.title}</span>
        </nav>

        <div className="reader-title-row">
          <div>
            <h1>{chapter.title}</h1>
            <p className="page-sub">
              {book.level} · {totalParagraphs} 段 · {done ? '已读' : '未读'}
            </p>
          </div>

          <div className="reader-actions">
            {!immersiveMode && (
              <>
                <Link className="btn btn-secondary" to="/reading">
                  目录
                </Link>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (!chapterKey) return
                    completeChapter(chapterKey)
                  }}
                >
                  标记本章已读
                </button>
              </>
            )}

            <div className="reader-controls">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowShortcuts(!showShortcuts)}
                title="快捷键帮助"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 9h16M4 15h16M10 3L8 21M14 3L12 21"></path>
                </svg>
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowSettings(!showSettings)}
                title="阅读设置"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243 4.243M9.879 9.879L5.636 5.636m12.728 12.728l-4.243 4.243m-4.243-4.243l-4.243-4.243"></path>
                </svg>
              </button>

              <button
                type="button"
                className={`btn ${immersiveMode ? 'btn-secondary' : 'btn-ghost'} btn-sm`}
                onClick={() => setImmersiveMode(!immersiveMode)}
                title={immersiveMode ? '退出全屏' : '全屏阅读'}
              >
                {immersiveMode ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                  </svg>
                )}
              </button>
            </div>

            {showShortcuts && (
              <div className="reader-shortcuts-panel">
                <h3>⌨️ 快捷键</h3>
                <div className="shortcuts-list">
                  {spreadMode ? (
                    <>
                      <div className="shortcut-item">
                        <kbd>←</kbd> <kbd>→</kbd>
                        <span>上一页/下一页</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="shortcut-item">
                        <kbd>↑</kbd> <kbd>↓</kbd>
                        <span>上/下一段</span>
                      </div>
                      <div className="shortcut-item">
                        <kbd>空格</kbd>
                        <span>下一段</span>
                      </div>
                    </>
                  )}
                  <div className="shortcut-item">
                    <kbd>Home</kbd> <kbd>End</kbd>
                    <span>首/末段</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>F</kbd>
                    <span>专注模式</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>B</kbd>
                    <span>书签</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>G</kbd>
                    <span>跳转书签</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Esc</kbd>
                    <span>关闭/退出</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowShortcuts(false)}
                >
                  关闭
                </button>
              </div>
            )}

            {showSettings && (
              <div className="reader-settings-panel">
                <h3>阅读设置</h3>

                <div className="setting-group">
                  <label>字号</label>
                  <div className="setting-row">
                    <input
                      type="range"
                      min={0.85}
                      max={1.4}
                      step={0.05}
                      value={fontScale}
                      onChange={(e) => setFontScale(Number(e.target.value))}
                    />
                    <span className="setting-value">{Math.round(fontScale * 100)}%</span>
                  </div>
                </div>

                <div className="setting-group">
                  <label>行距</label>
                  <div className="setting-row">
                    <input
                      type="range"
                      min={1.5}
                      max={3.0}
                      step={0.1}
                      value={lineHeight}
                      onChange={(e) => setLineHeight(Number(e.target.value))}
                    />
                    <span className="setting-value">{lineHeight.toFixed(1)}</span>
                  </div>
                </div>

                <div className="setting-group">
                  <label className="setting-row">
                    <input
                      type="checkbox"
                      checked={focusMode}
                      onChange={(e) => setFocusMode(e.target.checked)}
                    />
                    专注模式（一次只看一段）
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-row">
                    <input
                      type="checkbox"
                      checked={eyeMode}
                      onChange={(e) => setEyeMode(e.target.checked)}
                    />
                    护眼模式（米黄色背景）
                  </label>
                </div>

                <div className="setting-group">
                  <label className="setting-row">
                    <input
                      type="checkbox"
                      checked={spreadMode}
                      onChange={(e) => setSpreadMode(e.target.checked)}
                    />
                    翻页模式（双页）
                  </label>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowSettings(false)}
                >
                  关闭设置
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className={`reader-layout ${immersiveMode ? 'fullscreen-layout' : ''}`}>
        <div
          className={`reader-content ${eyeMode ? 'reader-eye-mode' : ''} ${spreadMode ? 'spread-mode' : ''} reader-content-full`}
          style={
            {
              ['--reader-font-scale' as any]: fontScale,
              ['--reader-line-height' as any]: lineHeight,
            } as CSSProperties
          }
          onClick={() => {
            if (selectedVocab) closeVocabPopup()
          }}
        >
          {spreadMode ? (
            <>
              {/* 双页翻页模式 - Spread Mode */}
              <div className="spread-page spread-page-left" aria-label="左页">
                {leftPageParagraphs.map((p, idx) => {
                  const originalIdx = currentPageIndex * PARAGRAPHS_PER_PAGE + idx
                  const isBookmarked = currentBookmark === originalIdx
                  return (
                    <div key={idx} className="reading-paragraph-wrapper">
                      <button
                        type="button"
                        className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
                        onClick={() => {
                          if (!chapterKey) return
                          isBookmarked ? playUnstar() : playStar()
                          toggleBookmark(chapterKey, originalIdx)
                        }}
                        aria-label={isBookmarked ? '移除书签' : '添加书签'}
                        title={isBookmarked ? '移除书签' : '添加书签'}
                      >
                        <svg
                          className="bookmark-icon"
                          viewBox="0 0 24 24"
                          fill={isBookmarked ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </button>
                      <p
                        data-index={originalIdx}
                        className="reading-paragraph"
                      >
                        {renderParagraph(p)}
                      </p>
                    </div>
                  )
                })}
              </div>
              <div className="spread-page spread-page-right" aria-label="右页">
                {rightPageParagraphs.map((p, idx) => {
                  const originalIdx = currentPageIndex * PARAGRAPHS_PER_PAGE + leftPageParagraphs.length + idx
                  const isBookmarked = currentBookmark === originalIdx
                  return (
                    <div key={idx} className="reading-paragraph-wrapper">
                      <button
                        type="button"
                        className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
                        onClick={() => {
                          if (!chapterKey) return
                          isBookmarked ? playUnstar() : playStar()
                          toggleBookmark(chapterKey, originalIdx)
                        }}
                        aria-label={isBookmarked ? '移除书签' : '添加书签'}
                        title={isBookmarked ? '移除书签' : '添加书签'}
                      >
                        <svg
                          className="bookmark-icon"
                          viewBox="0 0 24 24"
                          fill={isBookmarked ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </button>
                      <p
                        data-index={originalIdx}
                        className="reading-paragraph"
                      >
                        {renderParagraph(p)}
                      </p>
                    </div>
                  )
                })}
              </div>
              {/* 页码显示 */}
              <div className="spread-page-number">
                {currentPageIndex + 1} / {totalPages}
              </div>
            </>
          ) : (
            /* Normal Mode - Single Column */
            <div className="reader-paragraphs" aria-label="阅读内容">
              {paragraphs.map((p, idx) => {
                const isBookmarked = currentBookmark === idx
                return (
                  <div key={idx} className="reading-paragraph-wrapper">
                    <button
                      type="button"
                      className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
                      onClick={() => {
                        if (!chapterKey) return
                        isBookmarked ? playUnstar() : playStar()
                        toggleBookmark(chapterKey, idx)
                      }}
                      aria-label={isBookmarked ? '移除书签' : '添加书签'}
                      title={isBookmarked ? '移除书签' : '添加书签'}
                    >
                      <svg
                        className="bookmark-icon"
                        viewBox="0 0 24 24"
                        fill={isBookmarked ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </button>
                    <p
                      ref={(el) => {
                        paragraphRefs.current[idx] = el
                      }}
                      data-index={idx}
                      className={
                        idx === showIndex
                          ? 'reading-paragraph reading-paragraph-active'
                          : 'reading-paragraph'
                      }
                      style={{ display: focusMode && idx !== showIndex ? 'none' : 'block' }}
                    >
                      {renderParagraph(p)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          <div className="reader-bottom-controls">
            {spreadMode ? (
              <>
                {/* Spread Mode Controls */}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={currentPageIndex === 0}
                  onClick={goToPrevPage}
                >
                  ← 上一页
                </button>
                <div className="reader-progress-info">
                  <span className="reader-progress-text">
                    第 <strong>{currentPageIndex + 1}</strong> 页 / 共 {totalPages} 页
                  </span>
                  <div className="reader-progress-bar-mini">
                    <div
                      className="reader-progress-fill-mini"
                      style={{ width: `${((currentPageIndex + 1) / totalPages) * 100}%` }}
                    />
                  </div>
                  <span className="reader-progress-percent">
                    {Math.round(((currentPageIndex + 1) / totalPages) * 100)}%
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={currentPageIndex >= totalPages - 1}
                  onClick={goToNextPage}
                >
                  下一页 →
                </button>
              </>
            ) : (
              <>
                {/* Normal Mode Controls */}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={showIndex === 0}
                  onClick={() => goToParagraph(showIndex - 1)}
                >
                  上一段
                </button>
                <div className="reader-progress-info">
                  <span className="reader-progress-text">
                    当前第 <strong>{showIndex + 1}</strong> 段 / 共 {totalParagraphs} 段
                  </span>
                  <div className="reader-progress-bar-mini">
                    <div
                      className="reader-progress-fill-mini"
                      style={{ width: `${((showIndex + 1) / totalParagraphs) * 100}%` }}
                    />
                  </div>
                  <span className="reader-progress-percent">
                    {Math.round(((showIndex + 1) / totalParagraphs) * 100)}%
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={showIndex >= totalParagraphs - 1}
                  onClick={() => goToParagraph(showIndex + 1)}
                >
                  下一段
                </button>
              </>
            )}
            {totalReadingTime > 0 && (
              <span className="reading-time-badge">
                {Math.floor(totalReadingTime)} 分钟
              </span>
            )}
          </div>
        </div>

        {/* 词汇浮动弹窗 */}
        {selectedVocab && vocabPopupPosition && (
          <div
            className="vocab-popup"
            style={{
              left: `${vocabPopupPosition.x}px`,
              top: `${vocabPopupPosition.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="vocab-popup-close"
              onClick={closeVocabPopup}
              aria-label="关闭"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="vocab-popup-content">
              {/* 书籍词汇表中的信息 */}
              <div className="vocab-book-info">
                {isEditingVocab ? (
                  <div className="vocab-edit-form">
                    <div className="form-group">
                      <label>单词</label>
                      <input
                        type="text"
                        value={editWord}
                        onChange={(e) => setEditWord(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>读音（假名）</label>
                      <input
                        type="text"
                        value={editReading}
                        onChange={(e) => setEditReading(e.target.value)}
                        className="form-input"
                        placeholder="例如：たんご"
                      />
                    </div>
                    <div className="form-group">
                      <label>释义</label>
                      <textarea
                        value={editMeaning}
                        onChange={(e) => setEditMeaning(e.target.value)}
                        className="form-input"
                        rows={2}
                      />
                    </div>
                    <div className="vocab-edit-actions">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleSaveVocab}
                      >
                        保存修改
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setIsEditingVocab(false)}
                      >
                        取消
                      </button>
                    </div>
                    {saveMessage && (
                      <p className={`save-message save-message-${saveMessage.type}`}>
                        {saveMessage.text}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="vocab-detail-word">
                      <span className="vocab-detail-ja">{selectedVocab.word}</span>
                      {selectedVocab.reading && (
                        <span className="vocab-detail-reading">
                          {selectedVocab.reading}
                        </span>
                      )}
                    </div>
                    <p className="vocab-detail-meaning">{selectedVocab.meaning}</p>
                  </>
                )}
              </div>

              {/* 词典查询结果 */}
              {!isEditingVocab && dictEntries.length > 0 && (
                <div className="vocab-dict-results">
                  <h4>词典释义</h4>
                  {dictEntries.map((entry, idx) => (
                    <div key={idx} className="dict-entry">
                      <div className="dict-entry-word">
                        <strong>{entry.word}</strong>
                        {entry.reading && <span>（{entry.reading}）</span>}
                        {entry.partOfSpeech && (
                          <span className="dict-pos">【{entry.partOfSpeech}】</span>
                        )}
                      </div>
                      <ul className="dict-meanings">
                        {entry.meanings.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                      {entry.example && (
                        <p className="dict-example">例：{entry.example}</p>
                      )}
                      {entry.source && (
                        <p className="dict-source">来源：{entry.source}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!isEditingVocab && (
                <div className="vocab-detail-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={startEditing}
                    title="编辑词汇的读音和释义"
                  >
                    编辑词汇
                  </button>
                  {book && chapter && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        const context = paragraphs.find((p) =>
                          p.includes(selectedVocab.word),
                        ) || ''
                        addVocabulary(
                          selectedVocab.word,
                          selectedVocab.reading || '',
                          selectedVocab.meaning,
                          context.substring(0, 50),
                          book.id,
                          chapter.id,
                        )
                        playStar()
                      }}
                    >
                      加入生词本
                    </button>
                  )}
                  {book && (
                    <button
                      type="button"
                      className={
                        coreWords.has(selectedVocab.word)
                          ? 'btn btn-secondary btn-sm'
                          : 'btn btn-ghost btn-sm'
                      }
                      onClick={() => {
                        const next = toggleCoreWord(book.id, selectedVocab.word)
                        setCoreWordsState(next)
                      }}
                    >
                      {coreWords.has(selectedVocab.word) ? '取消重点' : '设为重点'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
