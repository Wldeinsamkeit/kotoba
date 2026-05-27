import { useState } from 'react'
import { speakJapaneseAsync } from '../lib/japaneseSpeech'
import { playRecordStart, playRecordStop } from '../lib/soundEffects'

export function ShadowingButton({
  jaText,
  speakerName,
  onComplete,
}: {
  jaText: string
  speakerName: string
  onComplete: () => void
}) {
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle')

  const handleShadow = async () => {
    if (state === 'done') return
    setState('playing')
    playRecordStart()
    try {
      await speakJapaneseAsync(jaText)
    } catch { /* ignore */ }
    playRecordStop()
    setState('done')
    onComplete()
  }

  if (state === 'done') {
    return (
      <span className="shadowing-done">
        跟读完成 +5 XP
      </span>
    )
  }

  return (
    <button
      type="button"
      className={`shadowing-btn ${state === 'playing' ? 'is-playing' : ''}`}
      onClick={handleShadow}
      disabled={state === 'playing'}
      data-sound-skip
    >
      {state === 'playing' ? '🔊 跟读中...' : `🎤 跟读${speakerName}`}
    </button>
  )
}
