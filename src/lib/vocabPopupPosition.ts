/** 根据点击元素计算浮动释义卡的位置（视口坐标） */
export function anchorFromElement(rect: DOMRect, popoverHeight = 280): {
  x: number
  y: number
  placement: 'below' | 'above'
} {
  const margin = 12
  const maxX = window.innerWidth - margin
  const x = Math.min(
    Math.max(rect.left + rect.width / 2, margin + 160),
    maxX - 160,
  )

  const spaceBelow = window.innerHeight - rect.bottom
  const placeAbove = spaceBelow < popoverHeight + 24 && rect.top > popoverHeight + 24
  const y = placeAbove ? rect.top - 8 : rect.bottom + 8

  return { x, y, placement: placeAbove ? 'above' : 'below' }
}
