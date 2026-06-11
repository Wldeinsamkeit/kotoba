import { DENSITY_CONFIG, LEVEL_COLOR, RELATION_STYLE } from './constants'
import type {
  DensityFilter,
  GraphLink,
  GraphNode,
  GraphState,
  WordLinkItem,
  WordLinkLevelFilter,
} from './types'

function hash(value: string) {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

function primaryLevel(item: WordLinkItem) {
  return item.levels[0] || 'N5'
}

function nodeColor(item: WordLinkItem) {
  return LEVEL_COLOR[primaryLevel(item)] || '#c9b17b'
}

function scoreWord(item: WordLinkItem) {
  return item.relationSummary.highValue * 8 + item.relationSummary.total + item.relations.length
}

function initialPosition(
  item: WordLinkItem,
  index: number,
  centerKey: string,
  levelFilter: WordLinkLevelFilter,
) {
  const level = primaryLevel(item)
  const isCenter = item.key === centerKey
  const anchors: Record<string, { x: number; y: number }> = {
    N5: { x: -420, y: -280 },
    N4: { x: 420, y: -260 },
    N3: { x: -360, y: 320 },
  }
  const anchor = isCenter ? { x: 0, y: 0 } : levelFilter ? { x: 0, y: 0 } : anchors[level] || { x: 0, y: 0 }
  const seed = hash(item.key)
  const angle = index * 2.399963 + seed * 0.85
  const spread = levelFilter ? 1.45 : 1.1
  const radius = isCenter ? 0 : 110 + Math.sqrt(index + 1) * (levelFilter ? 26 : 18) + seed * 110
  return {
    x: anchor.x + Math.cos(angle) * radius * spread,
    y: anchor.y + Math.sin(angle) * radius * spread,
    vx: (hash(`${item.key}vx`) - 0.5) * 0.6,
    vy: (hash(`${item.key}vy`) - 0.5) * 0.6,
  }
}

function relationAllowed(
  rel: WordLinkItem['relations'][number],
  typeFilter: string,
  byKey: Map<string, WordLinkItem>,
  levelFilter: WordLinkLevelFilter,
) {
  if (typeFilter && rel.type !== typeFilter) return false
  const target = byKey.get(rel.targetKey)
  if (!target) return false
  if (levelFilter && !target.levels.includes(levelFilter)) return false
  return true
}

function expandNeighborKeys(
  seedKeys: Set<string>,
  byKey: Map<string, WordLinkItem>,
  levelFilter: WordLinkLevelFilter,
  typeFilter: string,
  maxNeighbors: number,
) {
  const keys = new Set(seedKeys)
  let added = 0
  for (const key of seedKeys) {
    const item = byKey.get(key)
    if (!item) continue
    for (const rel of item.relations) {
      if (added >= maxNeighbors) return keys
      if (!relationAllowed(rel, typeFilter, byKey, levelFilter)) continue
      if (!keys.has(rel.targetKey)) {
        keys.add(rel.targetKey)
        added += 1
      }
    }
  }
  return keys
}

export function createGraphState(): GraphState {
  return {
    nodes: [],
    links: [],
    transform: { x: 0, y: 0, k: 1 },
    needsFit: true,
    selectedKey: null,
    hoverKey: null,
  }
}

export function buildFocusedGraph(
  byKey: Map<string, WordLinkItem>,
  words: WordLinkItem[],
  centerKey: string,
  levelFilter: WordLinkLevelFilter,
  typeFilter: string,
  density: DensityFilter = 'compact',
): GraphState {
  const center = byKey.get(centerKey)
  const state = createGraphState()
  if (!center) return state

  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.compact
  const keys = expandNeighborKeys(
    new Set<string>([centerKey]),
    byKey,
    levelFilter,
    typeFilter,
    densityConfig.maxNeighbors,
  )

  for (const item of words) {
    if (keys.has(item.key)) continue
    if (levelFilter && !item.levels.includes(levelFilter)) continue
    for (const rel of item.relations) {
      if (rel.targetKey !== centerKey) continue
      if (!relationAllowed(rel, typeFilter, byKey, levelFilter)) continue
      keys.add(item.key)
    }
  }

  const candidates = Array.from(keys)
    .map((key) => byKey.get(key)!)
    .filter(Boolean)
    .sort((a, b) => {
      if (a.key === centerKey) return -1
      if (b.key === centerKey) return 1
      return scoreWord(b) - scoreWord(a) || a.reading.localeCompare(b.reading)
    })
    .slice(0, densityConfig.maxNodes)

  const nodes: GraphNode[] = candidates.map((item, index) => {
    const pos = initialPosition(item, index, centerKey, levelFilter)
    return {
      key: item.key,
      item,
      x: pos.x,
      y: pos.y,
      vx: pos.vx,
      vy: pos.vy,
      r: item.key === centerKey ? 14 : 7 + Math.min(12, Math.sqrt(scoreWord(item)) * 0.48),
      color: nodeColor(item),
      seed: hash(`${item.key}seed`),
      fixed: item.key === centerKey,
    }
  })

  const nodeMap = new Map(nodes.map((node) => [node.key, node]))
  const visibleKeys = new Set(nodes.map((node) => node.key))
  const linkMap = new Map<string, GraphLink>()
  for (const node of nodes) {
    for (const rel of node.item.relations) {
      if (!relationAllowed(rel, typeFilter, byKey, levelFilter)) continue
      if (!visibleKeys.has(rel.targetKey)) continue
      const target = nodeMap.get(rel.targetKey)
      if (!target || target.key === node.key) continue
      const pair = [node.key, target.key].sort().join('~~') + `::${rel.type}`
      if (linkMap.has(pair)) continue
      linkMap.set(pair, {
        source: node,
        target,
        type: rel.type,
        value: rel.memoryValue || 0.5,
        seed: hash(pair),
      })
    }
  }

  state.nodes = nodes
  state.links = Array.from(linkMap.values())
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, Math.max(12, Math.floor(nodes.length * densityConfig.linkDensity)))
  state.selectedKey = centerKey
  state.needsFit = true
  return state
}

export function fitGraphView(
  state: GraphState,
  width: number,
  height: number,
  options: { drawerOpen?: boolean; bottomReserve?: number } = {},
) {
  if (!state.nodes.length) return
  const { drawerOpen = false, bottomReserve: bottomOverride } = options
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const node of state.nodes) {
    minX = Math.min(minX, node.x - node.r - 40)
    minY = Math.min(minY, node.y - node.r - 20)
    maxX = Math.max(maxX, node.x + node.r + 120)
    maxY = Math.max(maxY, node.y + node.r + 20)
  }
  const graphW = Math.max(1, maxX - minX)
  const graphH = Math.max(1, maxY - minY)
  const mobile = width < 900
  const sideReserve = 28
  const topReserve = mobile ? 108 : 84
  const bottomReserve =
    bottomOverride ??
    (drawerOpen ? Math.max(260, height * 0.44) : mobile ? 96 : 72)
  const availableW = Math.max(240, width - sideReserve)
  const availableH = Math.max(200, height - topReserve - bottomReserve)
  const scale = Math.max(0.35, Math.min(1.5, Math.min(availableW / graphW, availableH / graphH) * 0.84))
  state.transform.k = scale
  state.transform.x = availableW / 2 - ((minX + graphW / 2) * scale) + 12
  state.transform.y = topReserve + availableH / 2 - ((minY + graphH / 2) * scale)
  state.needsFit = false
}

export function simulationTick(state: GraphState) {
  const { nodes, links } = state
  if (!nodes.length) return

  const grid = new Map<string, GraphNode[]>()
  const cellSize = 140
  for (const node of nodes) {
    const cx = Math.floor(node.x / cellSize)
    const cy = Math.floor(node.y / cellSize)
    const key = `${cx},${cy}`
    if (!grid.has(key)) grid.set(key, [])
    grid.get(key)!.push(node)
  }

  for (const link of links) {
    const source = link.source
    const target = link.target
    const dx = target.x - source.x
    const dy = target.y - source.y
    const dist = Math.sqrt(dx * dx + dy * dy) || 1
    const style = RELATION_STYLE[link.type] || RELATION_STYLE.kana_similarity
    const preferred = style.distance * 0.72
    const strength = 0.0032 + Math.min(0.007, (link.value || 0.4) * 0.007)
    const force = (dist - preferred) * strength
    const fx = (dx / dist) * force
    const fy = (dy / dist) * force
    if (!source.fixed) {
      source.vx += fx
      source.vy += fy
    }
    if (!target.fixed) {
      target.vx -= fx
      target.vy -= fy
    }
  }

  for (const node of nodes) {
    const cx = Math.floor(node.x / cellSize)
    const cy = Math.floor(node.y / cellSize)
    for (let gx = cx - 1; gx <= cx + 1; gx += 1) {
      for (let gy = cy - 1; gy <= cy + 1; gy += 1) {
        const bucket = grid.get(`${gx},${gy}`)
        if (!bucket) continue
        for (const other of bucket) {
          if (other === node) continue
          const dx = node.x - other.x
          const dy = node.y - other.y
          const dist2 = dx * dx + dy * dy
          if (dist2 <= 0.01 || dist2 > 22500) continue
          const dist = Math.sqrt(dist2)
          const minDist = node.r + other.r + 42
          if (dist < minDist) {
            const push = (minDist - dist) * 0.028
            if (!node.fixed) {
              node.vx += (dx / dist) * push
              node.vy += (dy / dist) * push
            }
          }
        }
      }
    }
    if (!node.fixed) {
      node.vx *= 0.86
      node.vy *= 0.86
      node.x += node.vx
      node.y += node.vy
    }
  }
}

function worldToScreen(state: GraphState, x: number, y: number) {
  return {
    x: x * state.transform.k + state.transform.x,
    y: y * state.transform.k + state.transform.y,
  }
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  const value = Number.parseInt(normalized, 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255
  return `rgba(${r},${g},${b},${alpha})`
}

export function drawGraph(
  ctx: CanvasRenderingContext2D,
  state: GraphState,
  width: number,
  height: number,
  animationTime: number,
) {
  ctx.clearRect(0, 0, width, height)
  const glow = ctx.createRadialGradient(width * 0.5, height * 0.42, 20, width * 0.5, height * 0.42, Math.max(width, height) * 0.75)
  glow.addColorStop(0, 'rgba(255,255,255,0.05)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)

  const selectedKey = state.selectedKey
  const phase = animationTime / 1150
  ctx.lineCap = 'round'

  for (const link of state.links) {
    const a = worldToScreen(state, link.source.x, link.source.y)
    const b = worldToScreen(state, link.target.x, link.target.y)
    const style = RELATION_STYLE[link.type] || RELATION_STYLE.kana_similarity
    const active =
      selectedKey &&
      (link.source.key === selectedKey || link.target.key === selectedKey)
    ctx.strokeStyle = hexToRgba(style.color, active ? 0.72 : style.alpha)
    ctx.lineWidth = (active ? style.width + 0.6 : style.width) * Math.max(0.8, state.transform.k * 0.55)
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }

  for (const node of state.nodes) {
    const p = worldToScreen(state, node.x, node.y)
    const radius = Math.max(5, node.r * state.transform.k * 0.82)
    const isSelected = node.key === selectedKey
    const isHover = node.key === state.hoverKey
    const glowRadius = radius + (isSelected ? 6 : isHover ? 4 : 2)
    ctx.beginPath()
    ctx.fillStyle = hexToRgba(node.color, isSelected ? 0.28 : isHover ? 0.22 : 0.16)
    ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.fillStyle = hexToRgba(node.color, isSelected ? 0.98 : isHover ? 0.92 : 0.82)
    ctx.arc(p.x, p.y, radius + (isSelected ? 2 : 0), 0, Math.PI * 2)
    ctx.fill()
    if (isSelected || isHover) {
      ctx.strokeStyle = 'rgba(255,255,255,0.88)'
      ctx.lineWidth = 2
      ctx.stroke()
    }
    const label = node.item.word.length > 8 ? `${node.item.word.slice(0, 7)}…` : node.item.word
    const fontSize = Math.max(11, Math.min(15, 12 * Math.max(0.85, state.transform.k)))
    ctx.font = `600 ${fontSize}px "Hiragino Sans", "PingFang SC", sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(247,243,234,0.94)'
    ctx.shadowColor = 'rgba(0,0,0,0.45)'
    ctx.shadowBlur = 6
    ctx.fillText(label, p.x + radius + 6, p.y)
    ctx.shadowBlur = 0
    if (isSelected) {
      ctx.strokeStyle = hexToRgba(node.color, 0.35 + Math.sin(phase + node.seed * 6) * 0.08)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(p.x, p.y, radius + 8, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
}

export function hitGraphNode(
  state: GraphState,
  screenX: number,
  screenY: number,
): GraphNode | null {
  let best: GraphNode | null = null
  let bestDist = Infinity
  for (const node of state.nodes) {
    const p = worldToScreen(state, node.x, node.y)
    const dx = screenX - p.x
    const dy = screenY - p.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const radius = Math.max(10, node.r * state.transform.k * 0.9 + 8)
    if (dist <= radius && dist < bestDist) {
      best = node
      bestDist = dist
    }
  }
  return best
}

export function screenToWorld(state: GraphState, screenX: number, screenY: number) {
  return {
    x: (screenX - state.transform.x) / state.transform.k,
    y: (screenY - state.transform.y) / state.transform.k,
  }
}

export function filterRelationsForView(
  item: WordLinkItem,
  byKey: Map<string, WordLinkItem>,
  levelFilter: WordLinkLevelFilter,
  typeFilter: string,
) {
  return item.relations.filter((rel) => {
    if (typeFilter && rel.type !== typeFilter) return false
    const target = byKey.get(rel.targetKey)
    if (!target) return false
    if (levelFilter && !target.levels.includes(levelFilter)) return false
    return true
  })
}
