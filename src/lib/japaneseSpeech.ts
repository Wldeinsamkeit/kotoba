/**
 * 日语朗读：默认使用浏览器/在线语音；Supertonic 本地模型需显式开启。
 */

export type SpeechEngine = 'auto' | 'browser' | 'online' | 'supertonic'

/** TTS 引擎描述 */
export const ENGINE_LABELS: Record<SpeechEngine, string> = {
  auto: '自动选择',
  browser: '浏览器语音',
  online: '在线 TTS',
  supertonic: 'Supertonic AI',
}

const PREFERRED_VOICE_HINTS = [
  'google',
  'microsoft',
  'kyoko',
  'o-ren',
  'oren',
  'haruka',
  'naoko',
  'nanami',
  'ichiro',
  'sakura',
  'yuki',
  '日本語',
  'japanese',
]

let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null
let cachedEngine: SpeechEngine = 'auto'
let preferBrowser = false
let supertonicModule: typeof import('./supertonicTts') | null = null
let supertonicModulePromise: Promise<typeof import('./supertonicTts')> | null = null

function isSupertonicEnabled() {
  return import.meta.env.VITE_ENABLE_SUPERTONIC === 'true'
}

function loadSupertonicModule() {
  if (supertonicModule) return Promise.resolve(supertonicModule)
  if (!supertonicModulePromise) {
    supertonicModulePromise = import('./supertonicTts').then((module) => {
      supertonicModule = module
      return module
    })
  }
  return supertonicModulePromise
}

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!('speechSynthesis' in window)) {
    return Promise.resolve([])
  }
  if (voicesReady) return voicesReady

  voicesReady = new Promise((resolve) => {
    const pick = () => {
      const list = window.speechSynthesis.getVoices()
      if (list.length > 0) {
        resolve(list)
        return true
      }
      return false
    }
    if (pick()) return
    window.speechSynthesis.onvoiceschanged = () => {
      if (pick()) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 400)
  })

  return voicesReady
}

function pickJapaneseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const ja = voices.filter(
    (v) => v.lang === 'ja-JP' || v.lang.startsWith('ja'),
  )
  if (ja.length === 0) return null

  for (const hint of PREFERRED_VOICE_HINTS) {
    const hit = ja.find((v) => v.name.toLowerCase().includes(hint))
    if (hit) return hit
  }

  const local = ja.find((v) => v.localService)
  return local ?? ja[0]
}

function speakWithBrowser(
  text: string,
  voice: SpeechSynthesisVoice | null,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('no speech synthesis'))
      return
    }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ja-JP'
    u.rate = 0.92
    u.pitch = 1
    if (voice) u.voice = voice
    u.onend = () => resolve()
    u.onerror = () => reject(new Error('speech error'))
    window.speechSynthesis.speak(u)
  })
}

/** Google 翻译 TTS（无需 API Key，音质通常优于 Windows 默认日语） */
async function speakWithOnlineTts(text: string): Promise<void> {
  const q = encodeURIComponent(text.slice(0, 200))
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=ja&q=${q}`

  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.onended = () => resolve()
    audio.onerror = () => reject(new Error('online tts failed'))
    audio.src = url
    audio.play().catch(reject)
  })
}

/** Supertonic TTS（预留接口 - 需要后端服务或 WASM 集成） */
async function speakWithSupertonic(
  text: string,
  type: 'word' | 'sentence' = 'sentence',
): Promise<void> {
  const { speakWithSupertonicTts } = await loadSupertonicModule()
  return speakWithSupertonicTts(text, type)
}

export function setSpeechEngine(engine: SpeechEngine) {
  const nextEngine = engine === 'supertonic' && !isSupertonicEnabled() ? 'auto' : engine
  preferBrowser = engine === 'browser'
  cachedEngine = nextEngine
  try {
    localStorage.setItem('nihongo-speech-engine', nextEngine)
  } catch {
    /* ignore */
  }
}

export function getSpeechEngine(): SpeechEngine {
  try {
    const saved = localStorage.getItem('nihongo-speech-engine') as SpeechEngine | null
    if (saved) {
      cachedEngine = saved === 'supertonic' && !isSupertonicEnabled() ? 'auto' : saved
    }
  } catch {
    /* ignore */
  }
  return cachedEngine
}

/**
 * 朗读日语并等待结束（用于流式对话自动连播）
 */
export async function speakJapaneseAsync(
  text: string,
  engine: SpeechEngine = getSpeechEngine(),
): Promise<void> {
  const trimmed = text.trim()
  if (!trimmed) return

  if (engine === 'supertonic') {
    try {
      await speakWithSupertonic(trimmed)
      return
    } catch {
      // Supertonic 不可用时，回退到浏览器语音
    }
  }

  if (engine === 'online') {
    await speakWithOnlineTts(trimmed)
    return
  }

  if (engine === 'browser') {
    const voices = await loadVoices()
    await speakWithBrowser(trimmed, pickJapaneseVoice(voices))
    return
  }

  // auto: 优先浏览器系统语音，避免在线 TTS 跨域失败影响对话推进。
  const voices = await loadVoices()
  const voice = pickJapaneseVoice(voices)
  if ('speechSynthesis' in window) {
    await speakWithBrowser(trimmed, voice)
    return
  }

  if (!preferBrowser) {
    try {
      await speakWithOnlineTts(trimmed)
      return
    } catch {
      preferBrowser = true
    }
  }

  throw new Error('no tts available')
}

export function stopJapaneseSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  supertonicModule?.stopSupertonicSpeech()
}

/** 句间停顿（毫秒） */
export const DIALOGUE_LINE_PAUSE_MS = 700

/**
 * 单词发音（快速模式，适合点击即播）
 * 与句子朗读的区别：更快的语速、更短的停顿、即时响应
 */
export async function speakWordAsync(
  word: string,
  engine: SpeechEngine = getSpeechEngine(),
): Promise<void> {
  const trimmed = word.trim()
  if (!trimmed) return

  if (engine === 'supertonic') {
    try {
      await speakWithSupertonic(trimmed, 'word')
      return
    } catch {
      // 回退
    }
  }

  if (engine === 'online' || engine === 'auto') {
    try {
      await speakWithOnlineTts(trimmed)
      return
    } catch {
      // 继续尝试浏览器语音
    }
  }

  // 浏览器语音作为最终回退
  const voices = await loadVoices()
  const voice = pickJapaneseVoice(voices)
  if (voice && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(trimmed)
    u.lang = 'ja-JP'
    u.voice = voice
    u.rate = 1.0 // 单词用正常语速
    u.pitch = 1
    return new Promise((resolve, reject) => {
      u.onend = () => resolve()
      u.onerror = () => reject(new Error('speech error'))
      window.speechSynthesis.speak(u)
    })
  }

  throw new Error('no tts available')
}

/**
 * 获取可用的 TTS 引擎列表
 */
export function getAvailableEngines(): SpeechEngine[] {
  const engines: SpeechEngine[] = ['auto', 'browser']
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    engines.push('online')
  }
  if (isSupertonicEnabled()) {
    engines.push('supertonic')
  }
  return engines
}
