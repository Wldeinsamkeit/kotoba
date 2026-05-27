import { useCallback, useEffect, useRef, useState } from 'react'
import type { DialogueLine } from '../types'
import {
  DIALOGUE_LINE_PAUSE_MS,
  speakJapaneseAsync,
  stopJapaneseSpeech,
} from '../lib/japaneseSpeech'

export type DialoguePlayState = 'idle' | 'playing' | 'paused' | 'finished'

export function useStreamingDialogue(lines: DialogueLine[]) {
  const [visibleLines, setVisibleLines] = useState(0)
  const [playState, setPlayState] = useState<DialoguePlayState>('idle')
  const abortRef = useRef(false)
  const lineCount = lines.length

  useEffect(() => {
    abortRef.current = true
    stopJapaneseSpeech()
    setVisibleLines(0)
    setPlayState('idle')
    abortRef.current = false
  }, [lines])

  useEffect(() => {
    return () => {
      abortRef.current = true
      stopJapaneseSpeech()
    }
  }, [])

  const runPlayback = useCallback(
    async (fromIndex: number) => {
      abortRef.current = false
      setPlayState('playing')

      for (let i = fromIndex; i < lineCount; i++) {
        if (abortRef.current) {
          setPlayState('paused')
          return
        }

        const line = lines[i]
        setVisibleLines(i + 1)

        try {
          await speakJapaneseAsync(line.ja)
        } catch {
          /* 静音继续，避免卡死 */
        }

        if (abortRef.current) {
          setPlayState('paused')
          return
        }

        if (i < lineCount - 1) {
          await new Promise((r) => setTimeout(r, DIALOGUE_LINE_PAUSE_MS))
        }
      }

      if (!abortRef.current) {
        setPlayState('finished')
      }
    },
    [lines, lineCount],
  )

  const start = useCallback(() => {
    stopJapaneseSpeech()
    setVisibleLines(0)
    void runPlayback(0)
  }, [runPlayback])

  const resume = useCallback(() => {
    if (playState === 'finished') {
      start()
      return
    }
    void runPlayback(visibleLines)
  }, [playState, start, visibleLines, runPlayback])

  const pause = useCallback(() => {
    abortRef.current = true
    stopJapaneseSpeech()
    setPlayState('paused')
  }, [])

  const replayLine = useCallback((index: number) => {
    const line = lines[index]
    if (!line) return
    void speakJapaneseAsync(line.ja)
  }, [lines])

  return {
    visibleLines,
    playState,
    start,
    resume,
    pause,
    replayLine,
    lineCount,
  }
}
