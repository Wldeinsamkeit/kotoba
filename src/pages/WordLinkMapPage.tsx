import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { WordLinkMapCanvas } from '../components/wordLinkMap/WordLinkMapCanvas'
import {
  DENSITY_LABEL,
  LEVEL_COLOR,
  LEVEL_TABS,
  RELATION_STYLE,
  RELATION_TYPE_LABEL,
} from '../lib/wordLinkMap/constants'
import { buildFocusedGraph, filterRelationsForView } from '../lib/wordLinkMap/graphEngine'
import { loadWordLinkCatalog, type WordLinkCatalogIndex } from '../lib/wordLinkMap/loadCatalog'
import { resolveWordKey, searchWords } from '../lib/wordLinkMap/query'
import type {
  DensityFilter,
  GraphState,
  WordLinkItem,
  WordLinkLevelFilter,
} from '../lib/wordLinkMap/types'
import '../styles/wordLinkMap.css'

const TYPE_OPTIONS = Object.entries(RELATION_TYPE_LABEL)
const DENSITY_OPTIONS: Array<{ value: DensityFilter; label: string }> = [
  { value: 'compact', label: '清爽' },
  { value: 'balanced', label: '标准' },
  { value: 'full', label: '更多' },
]

type DrawerSnap = 'peek' | 'expanded'

function getDrawerBottomReserve(drawerOpen: boolean, snap: DrawerSnap) {
  if (typeof window === 'undefined' || !drawerOpen) return 96
  return snap === 'expanded'
    ? Math.max(320, window.innerHeight * 0.86)
    : Math.max(260, window.innerHeight * 0.44)
}

export function WordLinkMapPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [catalog, setCatalog] = useState<WordLinkCatalogIndex | null>(null)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState(searchParams.get('q') || searchParams.get('word') || '')
  const [level, setLevel] = useState<WordLinkLevelFilter>(
    (searchParams.get('level')?.toUpperCase() as WordLinkLevelFilter) || '',
  )
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '')
  const [density, setDensity] = useState<DensityFilter>(
    (searchParams.get('density') as DensityFilter) || 'compact',
  )
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [graph, setGraph] = useState<GraphState | null>(null)
  const [hoverKey, setHoverKey] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerSnap, setDrawerSnap] = useState<DrawerSnap>('peek')
  const [fitToken, setFitToken] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [typeMenuOpen, setTypeMenuOpen] = useState(false)
  const [levelMenuOpen, setLevelMenuOpen] = useState(false)
  const [densityMenuOpen, setDensityMenuOpen] = useState(false)
  const topbarRef = useRef<HTMLElement | null>(null)
  const drawerDragRef = useRef<{ startY: number; snap: DrawerSnap } | null>(null)
  const [viewportTick, setViewportTick] = useState(0)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const onResize = () => setViewportTick((value) => value + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    let cancelled = false
    loadWordLinkCatalog()
      .then((payload) => {
        if (cancelled) return
        setCatalog(payload)
      })
      .catch((error: Error) => {
        if (!cancelled) setLoadError(error.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!catalog) return
    const word = searchParams.get('word') || ''
    const reading = searchParams.get('reading') || ''
    if (word && reading) {
      const key = resolveWordKey(catalog.byKey, word, reading)
      if (key) {
        setSelectedKey(key)
        setDrawerOpen(true)
      }
    }
  }, [catalog, searchParams])

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      if (!topbarRef.current?.contains(event.target as Node)) {
        setTypeMenuOpen(false)
        setLevelMenuOpen(false)
        setDensityMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', closeMenus)
    return () => document.removeEventListener('pointerdown', closeMenus)
  }, [])

  const searchResults = useMemo(() => {
    if (!catalog || !query.trim()) return [] as WordLinkItem[]
    return searchWords(catalog.words, query, level, 8)
  }, [catalog, query, level])

  const selectedItem = selectedKey && catalog ? catalog.byKey.get(selectedKey) ?? null : null

  useEffect(() => {
    if (!catalog || !selectedKey) {
      setGraph(null)
      return
    }
    setGraph(buildFocusedGraph(catalog.byKey, catalog.words, selectedKey, level, typeFilter, density))
  }, [catalog, selectedKey, level, typeFilter, density])

  const visibleRelations = useMemo(() => {
    if (!catalog || !selectedItem) return []
    return filterRelationsForView(selectedItem, catalog.byKey, level, typeFilter)
  }, [catalog, selectedItem, level, typeFilter])

  const typeLabel = typeFilter ? RELATION_TYPE_LABEL[typeFilter] || typeFilter : '全部关系'
  const densityLabel = DENSITY_LABEL[density] || '清爽'
  const drawerBottomReserve = useMemo(
    () => getDrawerBottomReserve(Boolean(drawerOpen && selectedItem), drawerSnap),
    [drawerOpen, selectedItem, drawerSnap, viewportTick],
  )

  const selectWord = (item: WordLinkItem) => {
    setSelectedKey(item.key)
    setQuery(item.word)
    setDrawerOpen(true)
    setDrawerSnap('peek')
    setSearchOpen(false)
    setSearchParams({
      word: item.word,
      reading: item.reading,
      ...(level ? { level } : {}),
      ...(typeFilter ? { type: typeFilter } : {}),
      ...(density !== 'compact' ? { density } : {}),
    })
  }

  const handleFit = () => {
    if (graph) graph.needsFit = true
    setFitToken((value) => value + 1)
  }

  const handleDrawerHandlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    drawerDragRef.current = { startY: event.clientY, snap: drawerSnap }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleDrawerHandlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drawerDragRef.current) return
    const delta = event.clientY - drawerDragRef.current.startY
    if (delta < -36) setDrawerSnap('expanded')
    else if (delta > 36) setDrawerSnap('peek')
  }

  const handleDrawerHandlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drawerDragRef.current) {
      const delta = event.clientY - drawerDragRef.current.startY
      if (Math.abs(delta) < 8) {
        setDrawerSnap((snap) => (snap === 'peek' ? 'expanded' : 'peek'))
      }
    }
    drawerDragRef.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
    setFitToken((value) => value + 1)
  }

  if (loadError) {
    return (
      <div className="page word-link-map-page">
        <p className="word-link-map-error">{loadError}</p>
      </div>
    )
  }

  if (!catalog) {
    return (
      <div className="page word-link-map-page">
        <p className="word-link-map-loading">链路图数据加载中…</p>
      </div>
    )
  }

  return (
    <div className="page word-link-map-page">
      <main className="word-link-map-shell">
        <section className="word-link-map-stage" aria-label="关系子图">
          {graph && graph.nodes.length > 0 ? (
            <WordLinkMapCanvas
              graph={graph}
              hoverKey={hoverKey}
              drawerOpen={drawerOpen}
              drawerBottomReserve={drawerBottomReserve}
              fitToken={fitToken}
              onSelectKey={(key) => {
                const item = catalog.byKey.get(key)
                if (item) selectWord(item)
              }}
              onHoverKey={setHoverKey}
            />
          ) : (
            <div className="word-link-map-empty-stage">
              <p>搜索 N5 / N4 / N3 单词，选中后即可查看关联子图。</p>
            </div>
          )}

          <section ref={topbarRef} className="word-link-map-topbar" aria-label="链路图控制台">
            <div className="word-link-map-search-bar">
              <button
                type="button"
                className="word-link-map-back"
                aria-label="返回单词库"
                onClick={() => navigate('/lessons/words')}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M15 18l-6-6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <label className="word-link-map-search">
                <span className="sr-only">搜索单词</span>
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setSearchOpen(true)
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="输入单词、读音或中文…"
                  autoComplete="off"
                />
              </label>

              <div className="word-link-map-orbs">
                <div className="word-link-map-orb-wrap">
                  <button
                    type="button"
                    className={`word-link-map-orb${typeFilter ? ' active' : ''}`}
                    aria-label="关系类型"
                    aria-expanded={typeMenuOpen}
                    title={typeLabel}
                    onClick={() => {
                      setTypeMenuOpen((open) => !open)
                      setLevelMenuOpen(false)
                      setDensityMenuOpen(false)
                    }}
                  >
                    关
                  </button>
                  {typeMenuOpen ? (
                    <div className="word-link-map-orb-menu" role="menu" aria-label="关系类型">
                      <button
                        type="button"
                        role="menuitem"
                        className={!typeFilter ? 'active' : ''}
                        onClick={() => {
                          setTypeFilter('')
                          setTypeMenuOpen(false)
                        }}
                      >
                        全部关系
                      </button>
                      {TYPE_OPTIONS.map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          role="menuitem"
                          className={typeFilter === value ? 'active' : ''}
                          onClick={() => {
                            setTypeFilter(value)
                            setTypeMenuOpen(false)
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="word-link-map-orb-wrap">
                  <button
                    type="button"
                    className={`word-link-map-orb${level ? ' active' : ''}`}
                    aria-label="级别筛选"
                    aria-expanded={levelMenuOpen}
                    title={level || 'ALL'}
                    onClick={() => {
                      setLevelMenuOpen((open) => !open)
                      setTypeMenuOpen(false)
                      setDensityMenuOpen(false)
                    }}
                  >
                    级
                  </button>
                  {levelMenuOpen ? (
                    <div className="word-link-map-orb-menu" role="menu" aria-label="级别筛选">
                      {LEVEL_TABS.map((tab) => (
                        <button
                          key={tab.value || 'all'}
                          type="button"
                          role="menuitem"
                          className={level === tab.value ? 'active' : ''}
                          onClick={() => {
                            setLevel(tab.value)
                            setLevelMenuOpen(false)
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="word-link-map-orb-wrap">
                  <button
                    type="button"
                    className={`word-link-map-orb${density !== 'compact' ? ' active' : ''}`}
                    aria-label="节点密度"
                    aria-expanded={densityMenuOpen}
                    title={densityLabel}
                    onClick={() => {
                      setDensityMenuOpen((open) => !open)
                      setTypeMenuOpen(false)
                      setLevelMenuOpen(false)
                    }}
                  >
                    密
                  </button>
                  {densityMenuOpen ? (
                    <div className="word-link-map-orb-menu" role="menu" aria-label="节点密度">
                      {DENSITY_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          role="menuitem"
                          className={density === option.value ? 'active' : ''}
                          onClick={() => {
                            setDensity(option.value)
                            setDensityMenuOpen(false)
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  className="word-link-map-orb word-link-map-orb-accent"
                  aria-label="归位"
                  title="归位"
                  onClick={handleFit}
                >
                  位
                </button>
              </div>
            </div>
          </section>

          {query.trim() && searchOpen && searchResults.length > 0 ? (
            <div className="word-link-map-search-results open" role="listbox" aria-label="搜索结果">
              {searchResults.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="option"
                  className={selectedKey === item.key ? 'active' : ''}
                  onClick={() => selectWord(item)}
                >
                  <span>
                    <strong>{item.word}</strong>
                    <small>
                      {item.reading} · {item.meaning}
                    </small>
                  </span>
                  <span className="word-link-map-level-badge">{item.levels.join('/')}</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="word-link-map-legend" aria-hidden="true">
            <span><i style={{ background: LEVEL_COLOR.N5 }} />N5</span>
            <span><i style={{ background: LEVEL_COLOR.N4 }} />N4</span>
            <span><i style={{ background: LEVEL_COLOR.N3 }} />N3</span>
            <span className="word-link-map-legend-hint">点击切换 · 长按拖动 · 滚轮缩放</span>
          </div>

          <aside
            className={`word-link-map-drawer${drawerOpen && selectedItem ? ' open' : ''}${drawerSnap === 'expanded' ? ' expanded' : ''}`}
            aria-label="关联词详情"
          >
            {selectedItem ? (
              <>
                <div
                  className="word-link-map-drawer-handle"
                  role="button"
                  tabIndex={0}
                  aria-label={drawerSnap === 'expanded' ? '下拉收起详情' : '上拉展开详情'}
                  onPointerDown={handleDrawerHandlePointerDown}
                  onPointerMove={handleDrawerHandlePointerMove}
                  onPointerUp={handleDrawerHandlePointerUp}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setDrawerSnap((snap) => (snap === 'peek' ? 'expanded' : 'peek'))
                      setFitToken((value) => value + 1)
                    }
                  }}
                >
                  <span />
                </div>
                <div className="word-link-map-drawer-head">
                  <div>
                    <span className="word-link-map-panel-level">{selectedItem.levels.join(' / ')}</span>
                    <h2>{selectedItem.word}</h2>
                    <p className="word-link-map-drawer-reading">
                      {selectedItem.reading} · {selectedItem.meaning}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="word-link-map-drawer-close"
                    aria-label="关闭详情"
                    onClick={() => setDrawerOpen(false)}
                  >
                    ×
                  </button>
                </div>

                <div className="word-link-map-drawer-body">
                  {selectedItem.memoryMethod && !selectedItem.levels.includes('N3') ? (
                    <section className="word-link-map-memory">
                      <h3>已编写记忆法</h3>
                      <p>{selectedItem.memoryMethod.mergedScene || selectedItem.memoryMethod.reviewTip}</p>
                    </section>
                  ) : null}

                  <div className="word-link-map-summary">
                    <div>
                      <span>关联词</span>
                      <strong>{visibleRelations.length}</strong>
                    </div>
                    <div>
                      <span>高价值</span>
                      <strong>{selectedItem.relationSummary.highValue}</strong>
                    </div>
                  </div>

                  <h3 className="word-link-map-relations-title">关联词列表</h3>
                  <div className="word-link-map-relations">
                    {visibleRelations.length === 0 ? (
                      <p className="word-link-map-empty">当前筛选下没有 N5/N4/N3 关联词。</p>
                    ) : (
                      visibleRelations.map((rel) => {
                        const style = RELATION_STYLE[rel.type] || RELATION_STYLE.kana_similarity
                        const target = catalog.byKey.get(rel.targetKey)
                        return (
                          <article key={`${rel.type}-${rel.targetKey}`} className="word-link-map-relation-card">
                            <div className="word-link-map-relation-type">
                              {style.symbol} · {RELATION_TYPE_LABEL[rel.type] || rel.type}
                            </div>
                            <h4>{rel.targetWord}</h4>
                            <p className="word-link-map-relation-reading">
                              {rel.targetReading}
                              {target ? ` · ${target.levels.join('/')}` : ''}
                            </p>
                            <p className="word-link-map-relation-meaning">{rel.targetMeaning}</p>
                            {rel.note ? <p className="word-link-map-relation-note">{rel.note}</p> : null}
                            {target ? (
                              <button type="button" onClick={() => selectWord(target)}>
                                查看这个词
                              </button>
                            ) : null}
                          </article>
                        )
                      })
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </aside>
        </section>
      </main>
    </div>
  )
}
