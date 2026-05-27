import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  hiraganaBasicGroups,
  hiraganaDakutenGroups,
  hiraganaYouonGroups,
  katakanaBasicGroups,
  katakanaDakutenGroups,
  katakanaYouonGroups,
  type KanaCharacter,
} from '../data/kanaData'
import { playFlip } from '../lib/soundEffects'

type TabType = 'hiragana' | 'katakana' | 'quiz'
type KanaSubType = 'basic' | 'dakuten' | 'youon'

export function KanaPage() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('hiragana')
  const [subTab, setSubTab] = useState<KanaSubType>('basic')
  const [selectedGroup, setSelectedGroup] = useState<number>(0)
  const [selectedKana, setSelectedKana] = useState<KanaCharacter | null>(null)
  const [quizMode, setQuizMode] = useState<'basic' | 'dakuten' | 'youon'>('basic')
  const [quizKanaType, setQuizKanaType] = useState<'hiragana' | 'katakana'>('hiragana')
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [showQuizResults, setShowQuizResults] = useState(false)

  useEffect(() => {
    const tab = (searchParams.get('tab') || '').toLowerCase()
    const sub = (searchParams.get('sub') || '').toLowerCase()
    const quizKana = (searchParams.get('quizKana') || '').toLowerCase()

    if (tab === 'katakana' || tab === 'hiragana' || tab === 'quiz') {
      setActiveTab(tab as TabType)
      setSelectedGroup(0)
      setSelectedKana(null)
    }
    if (sub === 'basic' || sub === 'dakuten' || sub === 'youon') {
      setSubTab(sub as KanaSubType)
      setSelectedGroup(0)
      setSelectedKana(null)
    }
    if (quizKana === 'katakana' || quizKana === 'hiragana') {
      setQuizKanaType(quizKana as 'hiragana' | 'katakana')
    }
  }, [searchParams])

  const currentGroups = useMemo(() => {
    if (activeTab === 'hiragana') {
      return subTab === 'basic'
        ? hiraganaBasicGroups
        : subTab === 'dakuten'
          ? hiraganaDakutenGroups
          : hiraganaYouonGroups
    }
    return subTab === 'basic'
      ? katakanaBasicGroups
      : subTab === 'dakuten'
        ? katakanaDakutenGroups
        : katakanaYouonGroups
  }, [activeTab, subTab])

  const currentGroup = currentGroups[selectedGroup]

  const handleQuizAnswer = (kanaChar: string, answer: string) => {
    setQuizAnswers(prev => ({ ...prev, [kanaChar]: answer }))
  }

  const getQuizScore = () => {
    let correct = 0
    let total = 0

    const groupsToQuiz =
      quizKanaType === 'hiragana'
        ? quizMode === 'basic'
          ? hiraganaBasicGroups
          : quizMode === 'dakuten'
            ? hiraganaDakutenGroups
            : hiraganaYouonGroups
        : quizMode === 'basic'
          ? katakanaBasicGroups
          : quizMode === 'dakuten'
            ? katakanaDakutenGroups
            : katakanaYouonGroups

    groupsToQuiz.forEach(group => {
      group.kana.forEach(kana => {
        total++
        if (quizAnswers[kana.character] === kana.romaji) {
          correct++
        }
      })
    })

    return { correct, total }
  }

  return (
    <div className="page kana-page">
      <nav className="breadcrumb">
        <Link to="/">首页</Link>
        <span aria-hidden> / </span>
        <span>假名学习</span>
      </nav>

      <header className="page-header-editorial">
        <h1>日语假名学习</h1>
        <p className="page-sub-lead">
          掌握平假名和片假名，是日语学习的基石
        </p>
      </header>

      {/* 标签页切换 - 端庄的编辑风格 */}
      <div className="editorial-tabs">
        <button
          className={`editorial-tab ${activeTab === 'hiragana' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('hiragana')
            setSubTab('basic')
            setSelectedGroup(0)
            setSelectedKana(null)
          }}
        >
          平假名
        </button>
        <button
          className={`editorial-tab ${activeTab === 'katakana' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('katakana')
            setSubTab('basic')
            setSelectedGroup(0)
            setSelectedKana(null)
          }}
        >
          片假名
        </button>
        <button
          className={`editorial-tab ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveTab('quiz')}
        >
          测试练习
        </button>
      </div>

      {/* 子标签页 - 清音/浊音/拗音 */}
      {activeTab !== 'quiz' && (
        <div className="kana-subtabs">
          <button
            className={`kana-subtab ${subTab === 'basic' ? 'active' : ''}`}
            onClick={() => {
              setSubTab('basic')
              setSelectedGroup(0)
              setSelectedKana(null)
            }}
          >
            清音
          </button>
          <button
            className={`kana-subtab ${subTab === 'dakuten' ? 'active' : ''}`}
            onClick={() => {
              setSubTab('dakuten')
              setSelectedGroup(0)
              setSelectedKana(null)
            }}
          >
            浊音
          </button>
          <button
            className={`kana-subtab ${subTab === 'youon' ? 'active' : ''}`}
            onClick={() => {
              setSubTab('youon')
              setSelectedGroup(0)
              setSelectedKana(null)
            }}
          >
            拗音
          </button>
        </div>
      )}

      {/* 学习内容 */}
      {activeTab !== 'quiz' && (
        <>
          {/* 分组选择 - 极简设计 */}
          <section className="kana-section-editorial">
            <div className="section-overline">学习分组</div>
            <h2 className="section-title-serif">{currentGroup?.name}</h2>
            <p className="section-description">{currentGroup?.description}</p>

            {/* 简洁的分组导航 */}
            <div className="group-indicators">
              {currentGroups.map((group, index) => (
                <button
                  key={index}
                  className={`group-indicator ${selectedGroup === index ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedGroup(index)
                    setSelectedKana(null)
                  }}
                  aria-label={group.name}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </section>

          {/* 假名列表 - 编辑风格的网格 */}
          <section className="kana-grid-section">
            <div className="kana-display-grid">
              {currentGroup?.kana.map((kana, index) => (
                <div
                  key={index}
                  className={`kana-tile ${selectedKana === kana ? 'selected' : ''}`}
                  onClick={() => { setSelectedKana(kana); playFlip() }}
                >
                  <div className="kana-character-large">{kana.character}</div>
                  <div className="kana-romaji-small">{kana.romaji}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 假名详情 - 优雅的详情展示 */}
          {selectedKana && (
            <section className="kana-detail-section">
              <div className="kana-detail-card">
                <div className="kana-detail-header">
                  <div className="kana-character-display">{selectedKana.character}</div>
                  <div className="kana-metadata">
                    <div className="metadata-item">
                      <span className="metadata-label">罗马音</span>
                      <span className="metadata-value">{selectedKana.romaji}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">发音</span>
                      <span className="metadata-value">{selectedKana.pronunciation}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">笔画</span>
                      <span className="metadata-value">{selectedKana.strokes} 画</span>
                    </div>
                  </div>
                </div>

                <div className="kana-detail-content">
                  <div className="detail-block">
                    <h3>书写技巧</h3>
                    <p>{selectedKana.writingTip}</p>
                  </div>
                  <div className="detail-block">
                    <h3>记忆技巧</h3>
                    <p>{selectedKana.memoryTip}</p>
                  </div>
                  {selectedKana.exampleWord && (
                    <div className="detail-block">
                      <h3>示例单词</h3>
                      <div className="example-display">
                        <span className="example-text">{selectedKana.exampleWord.word}</span>
                        <span className="example-reading">({selectedKana.exampleWord.reading})</span>
                        <span className="example-meaning">{selectedKana.exampleWord.meaning}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* 测试模式 - 端庄的测试界面 */}
      {activeTab === 'quiz' && (
        <>
          <section className="quiz-mode-section">
            <h2>选择测试类型</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              <button
                type="button"
                className={`btn ${quizKanaType === 'hiragana' ? 'btn-terracotta' : 'btn-warm-sand'}`}
                onClick={() => {
                  setQuizKanaType('hiragana')
                  setQuizAnswers({})
                  setShowQuizResults(false)
                }}
              >
                平假名
              </button>
              <button
                type="button"
                className={`btn ${quizKanaType === 'katakana' ? 'btn-terracotta' : 'btn-warm-sand'}`}
                onClick={() => {
                  setQuizKanaType('katakana')
                  setQuizAnswers({})
                  setShowQuizResults(false)
                }}
              >
                片假名
              </button>
            </div>
            <div className="quiz-mode-grid">
              <button
                className={`quiz-mode-card ${quizMode === 'basic' ? 'active' : ''}`}
                onClick={() => {
                  setQuizMode('basic')
                  setQuizAnswers({})
                  setShowQuizResults(false)
                }}
              >
                <h3>基础假名</h3>
                <p>あいうえお等基本假名</p>
              </button>
              <button
                className={`quiz-mode-card ${quizMode === 'dakuten' ? 'active' : ''}`}
                onClick={() => {
                  setQuizMode('dakuten')
                  setQuizAnswers({})
                  setShowQuizResults(false)
                }}
              >
                <h3>浊音半浊音</h3>
                <p>がぎぐげご、ぱぴぷぺぽ</p>
              </button>
              <button
                className={`quiz-mode-card ${quizMode === 'youon' ? 'active' : ''}`}
                onClick={() => {
                  setQuizMode('youon')
                  setQuizAnswers({})
                  setShowQuizResults(false)
                }}
              >
                <h3>拗音</h3>
                <p>きゃきゅきょ等</p>
              </button>
            </div>
          </section>

          {/* 测试区域 */}
          <section className="quiz-section">
            <div className="quiz-header-editorial">
              <h3>
                {quizMode === 'basic' ? '基础假名' :
                  quizMode === 'dakuten' ? '浊音半浊音' : '拗音'}测试
              </h3>
              <p>输入每个假名的罗马音</p>
            </div>

            {!showQuizResults ? (
              <>
                <div className="quiz-grid-editorial">
                  {(
                    quizKanaType === 'hiragana'
                      ? quizMode === 'basic'
                        ? hiraganaBasicGroups
                        : quizMode === 'dakuten'
                          ? hiraganaDakutenGroups
                          : hiraganaYouonGroups
                      : quizMode === 'basic'
                        ? katakanaBasicGroups
                        : quizMode === 'dakuten'
                          ? katakanaDakutenGroups
                          : katakanaYouonGroups
                  ).map((group, groupIndex) => (
                    <div key={groupIndex} className="quiz-group-editorial">
                      <h4>{group.name}</h4>
                      <div className="quiz-items-editorial">
                        {group.kana.map((kana, kanaIndex) => (
                          <div key={kanaIndex} className="quiz-item-editorial">
                            <span className="quiz-kana-editorial">{kana.character}</span>
                            <input
                              type="text"
                              className="quiz-input-editorial"
                              placeholder="罗马音"
                              value={quizAnswers[kana.character] || ''}
                              onChange={(e) => handleQuizAnswer(kana.character, e.target.value.toLowerCase())}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="quiz-actions">
                  <button
                    className="btn btn-terracotta"
                    onClick={() => setShowQuizResults(true)}
                    disabled={Object.keys(quizAnswers).length === 0}
                  >
                    提交答案
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* 测试结果 */}
                <div className="quiz-results-editorial">
                  {(() => {
                    const { correct, total } = getQuizScore()
                    const percentage = Math.round((correct / total) * 100)

                    return (
                      <div className="result-summary-editorial">
                        <div className="result-score">
                          <span className="score-number">{correct}</span>
                          <span className="score-divider">/</span>
                          <span className="score-total">{total}</span>
                          <span className="score-percentage">{percentage}%</span>
                        </div>
                        <div className="result-message">
                          {percentage === 100 ? '全部正确' :
                            percentage >= 80 ? '优秀' :
                            percentage >= 60 ? '良好' :
                            '需要继续练习'}
                        </div>
                      </div>
                    )
                  })()}

                  {/* 详细结果 */}
                  <div className="result-details-editorial">
                    {(
                      quizKanaType === 'hiragana'
                        ? quizMode === 'basic'
                          ? hiraganaBasicGroups
                          : quizMode === 'dakuten'
                            ? hiraganaDakutenGroups
                            : hiraganaYouonGroups
                        : quizMode === 'basic'
                          ? katakanaBasicGroups
                          : quizMode === 'dakuten'
                            ? katakanaDakutenGroups
                            : katakanaYouonGroups
                    ).map((group, groupIndex) => (
                      <div key={groupIndex} className="result-group-editorial">
                        <h4>{group.name}</h4>
                        <div className="result-items-editorial">
                          {group.kana.map((kana, kanaIndex) => {
                            const userAnswer = quizAnswers[kana.character]
                            const isCorrect = userAnswer === kana.romaji
                            const hasAnswered = userAnswer !== undefined

                            return (
                              <div
                                key={kanaIndex}
                                className={`result-item-editorial ${hasAnswered ? (isCorrect ? 'correct' : 'wrong') : 'unanswered'}`}
                              >
                                <span className="result-kana">{kana.character}</span>
                                <span className="result-answer">{userAnswer || '-'}</span>
                                {!isCorrect && hasAnswered && (
                                  <span className="result-correct">{kana.romaji}</span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="result-actions">
                    <button
                      className="btn btn-terracotta"
                      onClick={() => {
                        setQuizAnswers({})
                        setShowQuizResults(false)
                      }}
                    >
                      重新测试
                    </button>
                    <button
                      className="btn btn-warm-sand"
                      onClick={() => setActiveTab('hiragana')}
                    >
                      返回学习
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  )
}
