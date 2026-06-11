import { useCallback, useEffect, useState } from 'react'

const LESSON_CHECK_MODE_KEY = 'nihongo-lesson-check-mode'
const LESSON_CHECK_MODE_EVENT = 'nihongo-lesson-check-mode-change'

export function isLessonCheckMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(LESSON_CHECK_MODE_KEY) === '1'
}

export function setLessonCheckMode(enabled: boolean): void {
  if (typeof window === 'undefined') return
  if (enabled) {
    window.localStorage.setItem(LESSON_CHECK_MODE_KEY, '1')
  } else {
    window.localStorage.removeItem(LESSON_CHECK_MODE_KEY)
  }
  window.dispatchEvent(new Event(LESSON_CHECK_MODE_EVENT))
}

export function useLessonCheckMode(): [boolean, (enabled: boolean) => void] {
  const [enabled, setEnabled] = useState(() => isLessonCheckMode())

  useEffect(() => {
    const sync = () => setEnabled(isLessonCheckMode())
    window.addEventListener(LESSON_CHECK_MODE_EVENT, sync)
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    return () => {
      window.removeEventListener(LESSON_CHECK_MODE_EVENT, sync)
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  const update = useCallback((next: boolean) => {
    setLessonCheckMode(next)
    setEnabled(next)
  }, [])

  return [enabled, update]
}
