import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import {
  WORD_CARD_CATEGORY_LABELS,
  WORD_CARD_CATEGORY_ORDER,
} from '../lib/wordCardCategory'
import { groupCollectedWordCards, listCollectedWordCards } from '../lib/wordCards'
import type { WordCardCategory } from '../types'

const BACKPACK_MIN_SLOTS = 12
const CATEGORY_SLOT_CLASS: Record<WordCardCategory, string> = {
  phrase: 'slot-phrase',
  noun: 'slot-noun',
  verb: 'slot-verb',
  adjective: 'slot-adjective',
  particle: 'slot-particle',
}

function getBackpackSlotCount(cardCount: number): number {
  return Math.max(BACKPACK_MIN_SLOTS, cardCount)
}

export function CardCollectionPage() {
  const { progress } = useProgress()
  const [activeCategory, setActiveCategory] = useState<WordCardCategory | 'all'>('all')
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [backpackOpen, setBackpackOpen] = useState(true)

  const cards = useMemo(() => listCollectedWordCards(progress), [progress])
  const grouped = useMemo(() => groupCollectedWordCards(cards), [cards])

  const visibleCards =
    activeCategory === 'all' ? cards : grouped[activeCategory]

  const slotCount = getBackpackSlotCount(visibleCards.length)
  const emptySlotCount = Math.max(0, slotCount - visibleCards.length)

  const selectedCard = useMemo(
    () => visibleCards.find((card) => card.id === selectedCardId) ?? null,
    [visibleCards, selectedCardId],
  )

  return (
    <div className="page card-collection-page">
      <nav className="breadcrumb">
        <Link to="/">首页</Link>
        <span aria-hidden> / </span>
        <Link to="/relationships">角色羁绊</Link>
        <span aria-hidden> / </span>
        <span>卡牌背包</span>
      </nav>

      <header className="page-header">
        <p className="unit-kicker">羁绊系统 · 词卡背包</p>
        <h1>卡牌背包</h1>
        <p className="page-sub">
          在课程里点击词汇即可收入背包。后续造句玩法会从这里抽取你收集的表达卡片。
        </p>
      </header>

      <section className="card-collection-summary">
        <div>
          <strong>{cards.length}</strong>
          <span>已收集卡牌</span>
        </div>
        <div>
          <strong>{slotCount}</strong>
          <span>背包格位</span>
        </div>
        <Link className="btn btn-secondary" to="/lessons">
          去课程收集 →
        </Link>
      </section>

      {cards.length === 0 ? (
        <section className="card-collection-empty">
          <h2>背包还是空的</h2>
          <p>进入任意课程，在「本单元词汇」里点击词卡，就能把记忆卡收入这里。</p>
          <Link className="btn btn-primary" to="/lessons">
            开始收集
          </Link>
        </section>
      ) : (
        <section
          className={`card-backpack-panel${backpackOpen ? '' : ' is-collapsed'}`}
          aria-label="卡牌背包"
        >
          {backpackOpen ? (
            <>
              <div className="card-backpack-panel-head">
                <span>背包</span>
                <div className="card-backpack-panel-actions">
                  <em>
                    {visibleCards.length}/{slotCount} 格已占用
                  </em>
                  <button
                    type="button"
                    className="card-backpack-toggle"
                    aria-expanded
                    onClick={() => {
                      setBackpackOpen(false)
                      setSelectedCardId(null)
                    }}
                  >
                    收起
                  </button>
                </div>
              </div>

              <div
                className="card-backpack-filters card-collection-filters"
                role="tablist"
                aria-label="词性筛选"
              >
                <button
                  type="button"
                  className={activeCategory === 'all' ? 'is-active' : ''}
                  onClick={() => {
                    setActiveCategory('all')
                    setSelectedCardId(null)
                  }}
                >
                  全部 ({cards.length})
                </button>
                {WORD_CARD_CATEGORY_ORDER.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={activeCategory === category ? 'is-active' : ''}
                    onClick={() => {
                      setActiveCategory(category)
                      setSelectedCardId(null)
                    }}
                  >
                    {WORD_CARD_CATEGORY_LABELS[category].title} ({grouped[category].length})
                  </button>
                ))}
              </div>

              {visibleCards.length === 0 ? (
                <p className="card-backpack-filter-empty">这一类还没有卡牌</p>
              ) : (
                <div className="card-backpack-grid">
                  {visibleCards.map((card) => (
                    <div
                      key={card.id}
                      className={[
                        'card-backpack-slot',
                        CATEGORY_SLOT_CLASS[card.category],
                        selectedCardId === card.id ? 'is-selected' : '',
                      ].join(' ')}
                    >
                      <button
                        type="button"
                        className="card-backpack-card"
                        aria-pressed={selectedCardId === card.id}
                        aria-label={`${card.word}，${card.meaning}`}
                        onClick={() =>
                          setSelectedCardId((current) => (current === card.id ? null : card.id))
                        }
                      >
                        <span className="card-backpack-card-badge">
                          {WORD_CARD_CATEGORY_LABELS[card.category].title}
                        </span>
                        <span className="card-backpack-card-word">{card.word}</span>
                      </button>
                    </div>
                  ))}
                  {Array.from({ length: emptySlotCount }, (_, index) => (
                    <div key={`empty-${index}`} className="card-backpack-slot is-empty" aria-hidden>
                      <div className="card-backpack-empty-slot" />
                    </div>
                  ))}
                </div>
              )}

              {selectedCard && (
                <section className="card-backpack-detail" aria-label="卡牌详情">
                  <div className="card-backpack-detail-card">
                    <span className="card-backpack-detail-badge">
                      {WORD_CARD_CATEGORY_LABELS[selectedCard.category].title}
                    </span>
                    <h2>{selectedCard.word}</h2>
                    <p className="card-backpack-detail-reading">
                      {selectedCard.reading || '—'}
                    </p>
                    <p className="card-backpack-detail-meaning">{selectedCard.meaning}</p>
                    <p className="card-backpack-detail-source">来自：{selectedCard.lessonTitle}</p>
                  </div>
                </section>
              )}
            </>
          ) : (
            <button
              type="button"
              className="card-backpack-fab"
              aria-expanded={false}
              aria-label={`背包，已收集 ${cards.length} 张卡牌，点击展开`}
              onClick={() => setBackpackOpen(true)}
            >
              <span className="card-backpack-fab-icon" aria-hidden="true">
                <span className="card-backpack-fab-body" />
                <span className="card-backpack-fab-flap" />
                <span className="card-backpack-fab-strap" />
              </span>
              <span className="card-backpack-fab-count">{cards.length}</span>
            </button>
          )}
        </section>
      )}
    </div>
  )
}
