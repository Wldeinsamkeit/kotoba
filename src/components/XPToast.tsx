import { useEffect, useState } from 'react'

type XPPopup = {
  id: number
  amount: number
  source: string
  x: number
  y: number
}

let popupId = 0
let listeners: Array<(popup: XPPopup) => void> = []

export function triggerXPToast(amount: number, source: string, x?: number, y?: number) {
  const popup: XPPopup = {
    id: ++popupId,
    amount,
    source,
    x: x ?? window.innerWidth / 2,
    y: y ?? window.innerHeight / 3,
  }
  listeners.forEach((fn) => fn(popup))
}

export function XPToastContainer() {
  const [popups, setPopups] = useState<XPPopup[]>([])

  useEffect(() => {
    const handler = (popup: XPPopup) => {
      setPopups((prev) => [...prev, popup])
      setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== popup.id))
      }, 1200)
    }
    listeners.push(handler)
    return () => {
      listeners = listeners.filter((l) => l !== handler)
    }
  }, [])

  return (
    <div className="xp-toast-container" aria-live="polite">
      {popups.map((p) => (
        <div
          key={p.id}
          className="xp-toast-popup"
          style={{ left: p.x, top: p.y }}
        >
          +{p.amount} XP
        </div>
      ))}
    </div>
  )
}
