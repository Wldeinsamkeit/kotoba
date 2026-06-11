import { useEffect, useRef } from 'react'
import {
  drawGraph,
  fitGraphView,
  hitGraphNode,
  simulationTick,
} from '../../lib/wordLinkMap/graphEngine'
import type { GraphState } from '../../lib/wordLinkMap/types'

type WordLinkMapCanvasProps = {
  graph: GraphState
  hoverKey: string | null
  drawerOpen: boolean
  drawerBottomReserve: number
  fitToken: number
  onSelectKey: (key: string) => void
  onHoverKey: (key: string | null) => void
}

type PointerDragState = {
  mode: 'pending' | 'pan' | 'node'
  nodeKey?: string
  startX: number
  startY: number
  clientX: number
  clientY: number
  tx: number
  ty: number
  moved: boolean
  longPressReady: boolean
}

const LONG_PRESS_MS = 420
const MOVE_THRESHOLD = 10

export function WordLinkMapCanvas({
  graph,
  hoverKey,
  drawerOpen,
  drawerBottomReserve,
  fitToken,
  onSelectKey,
  onHoverKey,
}: WordLinkMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const graphRef = useRef(graph)
  const fitRef = useRef({ drawerOpen, drawerBottomReserve })
  const dragRef = useRef<PointerDragState | null>(null)
  const longPressTimerRef = useRef<number | null>(null)

  graphRef.current = graph
  graphRef.current.hoverKey = hoverKey
  fitRef.current = { drawerOpen, drawerBottomReserve }

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const applyFit = (width: number, height: number) => {
    fitGraphView(graphRef.current, width, height, {
      drawerOpen: fitRef.current.drawerOpen,
      bottomReserve: fitRef.current.drawerBottomReserve,
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    let raf = 0
    let animationTime = 0
    let dpr = 1
    let width = 0
    let height = 0

    const resize = () => {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (graphRef.current.needsFit) {
        applyFit(width, height)
      }
    }

    const frame = () => {
      animationTime += 16
      const state = graphRef.current
      if (state.needsFit) {
        applyFit(width, height)
      }
      simulationTick(state)
      drawGraph(ctx, state, width, height, animationTime)
      raf = window.requestAnimationFrame(frame)
    }

    resize()
    raf = window.requestAnimationFrame(frame)
    window.addEventListener('resize', resize)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      clearLongPressTimer()
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return
    graphRef.current.needsFit = true
  }, [graph, drawerOpen, drawerBottomReserve, fitToken])

  const getLocalPoint = (event: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  const startNodeDrag = (nodeKey: string) => {
    const node = graphRef.current.nodes.find((item) => item.key === nodeKey)
    if (!node) return
    const drag = dragRef.current
    if (!drag) return
    drag.mode = 'node'
    drag.longPressReady = true
    node.fixed = true
  }

  return (
    <canvas
      ref={canvasRef}
      className="word-link-map-canvas"
      aria-label="单词链路子图"
      onPointerDown={(event) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const { x, y } = getLocalPoint(event)
        const node = hitGraphNode(graphRef.current, x, y)
        canvas.setPointerCapture(event.pointerId)
        clearLongPressTimer()

        if (node) {
          dragRef.current = {
            mode: 'pending',
            nodeKey: node.key,
            startX: x,
            startY: y,
            clientX: event.clientX,
            clientY: event.clientY,
            tx: 0,
            ty: 0,
            moved: false,
            longPressReady: false,
          }
          longPressTimerRef.current = window.setTimeout(() => {
            if (dragRef.current?.mode === 'pending' && dragRef.current.nodeKey) {
              startNodeDrag(dragRef.current.nodeKey)
            }
          }, LONG_PRESS_MS)
          return
        }

        dragRef.current = {
          mode: 'pan',
          startX: x,
          startY: y,
          clientX: event.clientX,
          clientY: event.clientY,
          tx: graphRef.current.transform.x,
          ty: graphRef.current.transform.y,
          moved: false,
          longPressReady: false,
        }
      }}
      onPointerMove={(event) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const drag = dragRef.current
        if (!drag) {
          const { x, y } = getLocalPoint(event)
          const hover = hitGraphNode(graphRef.current, x, y)
          onHoverKey(hover?.key ?? null)
          return
        }

        const { x, y } = getLocalPoint(event)
        const deltaX = event.clientX - drag.clientX
        const deltaY = event.clientY - drag.clientY
        const movedDistance = Math.hypot(x - drag.startX, y - drag.startY)
        if (movedDistance > MOVE_THRESHOLD) {
          drag.moved = true
        }

        if (drag.mode === 'pending') {
          if (movedDistance > MOVE_THRESHOLD) {
            clearLongPressTimer()
            drag.mode = 'pan'
            drag.tx = graphRef.current.transform.x
            drag.ty = graphRef.current.transform.y
          } else {
            return
          }
        }

        if (drag.mode === 'pan') {
          graphRef.current.transform.x = drag.tx + deltaX
          graphRef.current.transform.y = drag.ty + deltaY
          graphRef.current.needsFit = false
          onHoverKey(null)
          return
        }

        if (drag.mode === 'node' && drag.nodeKey) {
          const node = graphRef.current.nodes.find((item) => item.key === drag.nodeKey)
          if (node) {
            const world = {
              x: (x - graphRef.current.transform.x) / graphRef.current.transform.k,
              y: (y - graphRef.current.transform.y) / graphRef.current.transform.k,
            }
            node.x = world.x
            node.y = world.y
            node.vx = 0
            node.vy = 0
          }
        }
      }}
      onPointerUp={(event) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const drag = dragRef.current
        clearLongPressTimer()

        if (drag?.mode === 'pending' && drag.nodeKey && !drag.moved && !drag.longPressReady) {
          onSelectKey(drag.nodeKey)
        }

        if (drag?.mode === 'node' && drag.nodeKey) {
          const node = graphRef.current.nodes.find((item) => item.key === drag.nodeKey)
          if (node) {
            node.fixed = node.key === graphRef.current.selectedKey
          }
        }

        dragRef.current = null
        canvas.releasePointerCapture(event.pointerId)

        const { x, y } = getLocalPoint(event)
        const hover = hitGraphNode(graphRef.current, x, y)
        onHoverKey(hover?.key ?? null)
      }}
      onPointerCancel={(event) => {
        clearLongPressTimer()
        dragRef.current = null
        canvasRef.current?.releasePointerCapture(event.pointerId)
      }}
      onWheel={(event) => {
        event.preventDefault()
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        const before = {
          x: (x - graphRef.current.transform.x) / graphRef.current.transform.k,
          y: (y - graphRef.current.transform.y) / graphRef.current.transform.k,
        }
        const factor = Math.exp(-event.deltaY * 0.001)
        graphRef.current.transform.k = Math.max(0.25, Math.min(2.8, graphRef.current.transform.k * factor))
        graphRef.current.transform.x = x - before.x * graphRef.current.transform.k
        graphRef.current.transform.y = y - before.y * graphRef.current.transform.k
        graphRef.current.needsFit = false
      }}
    />
  )
}
