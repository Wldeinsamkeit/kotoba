import { useState } from 'react'
import { speakWordAsync, speakJapaneseAsync } from '../lib/japaneseSpeech'

type SpeechState = 'idle' | 'loading' | 'playing' | 'error'

export function SpeechButton({
  text,
  type = 'word',
  size = 'normal',
  className = '',
  onComplete,
}: {
  text: string
  type?: 'word' | 'sentence'
  size?: 'small' | 'normal' | 'large'
  className?: string
  onComplete?: () => void
}) {
  const [state, setState] = useState<SpeechState>('idle')

  const handleClick = async () => {
    if (state === 'loading' || state === 'playing') return

    setState('loading')
    try {
      if (type === 'word') {
        await speakWordAsync(text)
      } else {
        await speakJapaneseAsync(text)
      }
      setState('idle')
      onComplete?.()
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 1500)
    }
  }

  const sizeClass = size === 'small' ? 'speech-btn-sm' : size === 'large' ? 'speech-btn-lg' : ''
  const stateClass = state === 'playing' ? 'is-playing' : state === 'error' ? 'is-error' : state === 'loading' ? 'is-loading' : ''

  return (
    <button
      type="button"
      className={`speech-btn ${sizeClass} ${stateClass} ${className}`.trim()}
      onClick={handleClick}
      disabled={state === 'loading' || state === 'playing'}
      aria-label={state === 'playing' ? '播放中...' : '播放发音'}
      title={state === 'error' ? '播放失败，请重试' : '播放发音'}
    >
      {state === 'loading' && <span className="speech-icon">⏳</span>}
      {state === 'playing' && <span className="speech-icon">🔊</span>}
      {state === 'error' && <span className="speech-icon">❌</span>}
      {state === 'idle' && <span className="speech-icon">🔈</span>}
    </button>
  )
}

/**
 * 迷你发音按钮，用于单词卡片内嵌
 */
export function MiniSpeechButton({
  word,
  reading,
  className = '',
}: {
  word: string
  reading?: string
  className?: string
}) {
  const [state, setState] = useState<SpeechState>('idle')

  const handleClick = async () => {
    if (state === 'loading' || state === 'playing') return

    setState('loading')
    try {
      // 优先读单词，如果单词太短（如单个假名）则读带读音的版本
      const textToSpeak = word.length >= 2 || !reading ? word : `${word}(${reading})`
      await speakWordAsync(textToSpeak)
      setState('idle')
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 1500)
    }
  }

  return (
    <button
      type="button"
      className={`mini-speech-btn ${state === 'playing' ? 'is-playing' : ''} ${className}`.trim()}
      onClick={handleClick}
      disabled={state === 'loading' || state === 'playing'}
      aria-label="播放发音"
    >
      {state === 'idle' && '🔈'}
      {state === 'playing' && '🔊'}
    </button>
  )
}
