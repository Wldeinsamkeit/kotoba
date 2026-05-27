import * as ort from 'onnxruntime-web'

type NestedNumberArray = number | NestedNumberArray[]

type VoiceStyleJson = {
  style_ttl: {
    dims: number[]
    data: NestedNumberArray[]
  }
  style_dp: {
    dims: number[]
    data: NestedNumberArray[]
  }
}

type SupertonicCfgs = {
  ae: {
    sample_rate: number
    base_chunk_size: number
  }
  ttl: {
    chunk_compress_factor: number
    latent_dim: number
  }
}

type SupertonicRuntime = {
  textToSpeech: TextToSpeech
  style: Style
  backend: 'webgpu' | 'wasm'
}

const ASSET_BASE = '/supertonic/assets'
const ONNX_DIR = `${ASSET_BASE}/onnx`
const DEFAULT_VOICE_STYLE = `${ASSET_BASE}/voice_styles/M1.json`
const AVAILABLE_LANGS = [
  'en',
  'ko',
  'ja',
  'ar',
  'bg',
  'cs',
  'da',
  'de',
  'el',
  'es',
  'et',
  'fi',
  'fr',
  'hi',
  'hr',
  'hu',
  'id',
  'it',
  'lt',
  'lv',
  'nl',
  'pl',
  'pt',
  'ro',
  'ru',
  'sk',
  'sl',
  'sv',
  'tr',
  'uk',
  'vi',
  'na',
]

let runtimePromise: Promise<SupertonicRuntime> | null = null
let activeAudio: HTMLAudioElement | null = null
let activeUrl: string | null = null

function isValidLang(lang: string) {
  return AVAILABLE_LANGS.includes(lang)
}

function flattenNumbers(value: NestedNumberArray): number[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenNumbers)
  }
  return [value]
}

class UnicodeProcessor {
  indexer: number[]

  constructor(indexer: number[]) {
    this.indexer = indexer
  }

  call(textList: string[], langList: string[]) {
    const processedTexts = textList.map((text, i) => this.preprocessText(text, langList[i]))
    const textIdsLengths = processedTexts.map((text) => Array.from(text).length)
    const maxLen = Math.max(...textIdsLengths)

    const textIds = processedTexts.map((text) => {
      const row = new Array<number>(maxLen).fill(0)
      Array.from(text).forEach((char, index) => {
        const codePoint = char.codePointAt(0) ?? 0
        row[index] = codePoint < this.indexer.length ? this.indexer[codePoint] : -1
      })
      return row
    })

    const textMask = this.getTextMask(textIdsLengths)
    return { textIds, textMask }
  }

  preprocessText(text: string, lang: string) {
    let normalized = text.normalize('NFKD')

    const emojiPattern =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]+/gu
    normalized = normalized.replace(emojiPattern, '')

    const replacements: Record<string, string> = {
      '–': '-',
      '‑': '-',
      '—': '-',
      _: ' ',
      '\u201C': '"',
      '\u201D': '"',
      '\u2018': "'",
      '\u2019': "'",
      '´': "'",
      '`': "'",
      '[': ' ',
      ']': ' ',
      '|': ' ',
      '/': ' ',
      '#': ' ',
      '→': ' ',
      '←': ' ',
    }

    for (const [from, to] of Object.entries(replacements)) {
      normalized = normalized.replaceAll(from, to)
    }

    normalized = normalized.replace(/[♥☆♡©\\]/g, '')

    const expressionReplacements: Record<string, string> = {
      '@': ' at ',
      'e.g.,': 'for example, ',
      'i.e.,': 'that is, ',
    }

    for (const [from, to] of Object.entries(expressionReplacements)) {
      normalized = normalized.replaceAll(from, to)
    }

    normalized = normalized
      .replace(/ ,/g, ',')
      .replace(/ \./g, '.')
      .replace(/ !/g, '!')
      .replace(/ \?/g, '?')
      .replace(/ ;/g, ';')
      .replace(/ :/g, ':')
      .replace(/ '/g, "'")
      .replace(/\s+/g, ' ')
      .trim()

    while (normalized.includes('""')) normalized = normalized.replace('""', '"')
    while (normalized.includes("''")) normalized = normalized.replace("''", "'")
    while (normalized.includes('``')) normalized = normalized.replace('``', '`')

    if (!/[.!?;:,'\"')\]}…。」』】〉》›»！？。]$/.test(normalized)) {
      normalized += lang === 'ja' ? '。' : '.'
    }

    if (!isValidLang(lang)) {
      throw new Error(`Invalid Supertonic language: ${lang}`)
    }

    return `<${lang}>${normalized}</${lang}>`
  }

  getTextMask(lengths: number[]) {
    const maxLen = Math.max(...lengths)
    return lengths.map((len) => {
      const row = new Array<number>(maxLen).fill(0)
      for (let i = 0; i < Math.min(len, maxLen); i += 1) row[i] = 1
      return [row]
    })
  }
}

class Style {
  ttl: ort.Tensor
  dp: ort.Tensor

  constructor(ttlTensor: ort.Tensor, dpTensor: ort.Tensor) {
    this.ttl = ttlTensor
    this.dp = dpTensor
  }
}

class TextToSpeech {
  cfgs: SupertonicCfgs
  textProcessor: UnicodeProcessor
  dpOrt: ort.InferenceSession
  textEncOrt: ort.InferenceSession
  vectorEstOrt: ort.InferenceSession
  vocoderOrt: ort.InferenceSession
  sampleRate: number

  constructor(
    cfgs: SupertonicCfgs,
    textProcessor: UnicodeProcessor,
    dpOrt: ort.InferenceSession,
    textEncOrt: ort.InferenceSession,
    vectorEstOrt: ort.InferenceSession,
    vocoderOrt: ort.InferenceSession,
  ) {
    this.cfgs = cfgs
    this.textProcessor = textProcessor
    this.dpOrt = dpOrt
    this.textEncOrt = textEncOrt
    this.vectorEstOrt = vectorEstOrt
    this.vocoderOrt = vocoderOrt
    this.sampleRate = cfgs.ae.sample_rate
  }

  async infer(
    textList: string[],
    langList: string[],
    style: Style,
    totalStep: number,
    speed = 1.05,
  ) {
    const batchSize = textList.length
    const { textIds, textMask } = this.textProcessor.call(textList, langList)

    const textIdsFlat = new BigInt64Array(textIds.flat().map((id) => BigInt(id)))
    const textIdsTensor = new ort.Tensor('int64', textIdsFlat, [batchSize, textIds[0].length])

    const textMaskFlat = new Float32Array(textMask.flat(2))
    const textMaskTensor = new ort.Tensor('float32', textMaskFlat, [
      batchSize,
      1,
      textMask[0][0].length,
    ])

    const dpOutputs = await this.dpOrt.run({
      text_ids: textIdsTensor,
      style_dp: style.dp,
      text_mask: textMaskTensor,
    })
    const duration = Array.from(dpOutputs.duration.data as Float32Array)

    for (let i = 0; i < duration.length; i += 1) {
      duration[i] /= speed
    }

    const textEncOutputs = await this.textEncOrt.run({
      text_ids: textIdsTensor,
      style_ttl: style.ttl,
      text_mask: textMaskTensor,
    })
    const textEmb = textEncOutputs.text_emb

    let { xt, latentMask } = this.sampleNoisyLatent(
      duration,
      this.sampleRate,
      this.cfgs.ae.base_chunk_size,
      this.cfgs.ttl.chunk_compress_factor,
      this.cfgs.ttl.latent_dim,
    )

    const latentMaskFlat = new Float32Array(latentMask.flat(2))
    const latentMaskTensor = new ort.Tensor('float32', latentMaskFlat, [
      batchSize,
      1,
      latentMask[0][0].length,
    ])
    const totalStepTensor = new ort.Tensor('float32', new Float32Array(batchSize).fill(totalStep), [
      batchSize,
    ])

    for (let step = 0; step < totalStep; step += 1) {
      const currentStepTensor = new ort.Tensor('float32', new Float32Array(batchSize).fill(step), [
        batchSize,
      ])
      const xtTensor = new ort.Tensor('float32', new Float32Array(xt.flat(2)), [
        batchSize,
        xt[0].length,
        xt[0][0].length,
      ])

      const vectorEstOutputs = await this.vectorEstOrt.run({
        noisy_latent: xtTensor,
        text_emb: textEmb,
        style_ttl: style.ttl,
        latent_mask: latentMaskTensor,
        text_mask: textMaskTensor,
        current_step: currentStepTensor,
        total_step: totalStepTensor,
      })

      const denoised = Array.from(vectorEstOutputs.denoised_latent.data as Float32Array)
      const latentDim = xt[0].length
      const latentLen = xt[0][0].length
      xt = []
      let index = 0

      for (let batch = 0; batch < batchSize; batch += 1) {
        const batchRows: number[][] = []
        for (let dim = 0; dim < latentDim; dim += 1) {
          const row: number[] = []
          for (let pos = 0; pos < latentLen; pos += 1) {
            row.push(denoised[index])
            index += 1
          }
          batchRows.push(row)
        }
        xt.push(batchRows)
      }
    }

    const finalXtTensor = new ort.Tensor('float32', new Float32Array(xt.flat(2)), [
      batchSize,
      xt[0].length,
      xt[0][0].length,
    ])

    const vocoderOutputs = await this.vocoderOrt.run({ latent: finalXtTensor })
    return {
      wav: Array.from(vocoderOutputs.wav_tts.data as Float32Array),
      duration,
    }
  }

  async call(text: string, lang: string, style: Style, totalStep: number, speed = 1.05) {
    if (style.ttl.dims[0] !== 1) {
      throw new Error('Supertonic single speaker mode requires one voice style')
    }

    const textList = chunkText(text, lang === 'ja' || lang === 'ko' ? 120 : 300)
    const langList = new Array<string>(textList.length).fill(lang)
    let wavCat: number[] = []
    let durationCat = 0

    for (let i = 0; i < textList.length; i += 1) {
      const { wav, duration } = await this.infer([textList[i]], [langList[i]], style, totalStep, speed)
      if (wavCat.length === 0) {
        wavCat = wav
        durationCat = duration[0]
      } else {
        const silenceLen = Math.floor(0.25 * this.sampleRate)
        wavCat = [...wavCat, ...new Array<number>(silenceLen).fill(0), ...wav]
        durationCat += duration[0] + 0.25
      }
    }

    return { wav: wavCat, duration: [durationCat] }
  }

  sampleNoisyLatent(
    duration: number[],
    sampleRate: number,
    baseChunkSize: number,
    chunkCompress: number,
    latentDim: number,
  ) {
    const batchSize = duration.length
    const maxDuration = Math.max(...duration)
    const wavLenMax = Math.floor(maxDuration * sampleRate)
    const wavLengths = duration.map((value) => Math.floor(value * sampleRate))
    const chunkSize = baseChunkSize * chunkCompress
    const latentLen = Math.floor((wavLenMax + chunkSize - 1) / chunkSize)
    const latentDimValue = latentDim * chunkCompress
    const latentLengths = wavLengths.map((len) => Math.floor((len + chunkSize - 1) / chunkSize))
    const latentMask = this.lengthToMask(latentLengths, latentLen)
    const xt: number[][][] = []

    for (let batch = 0; batch < batchSize; batch += 1) {
      const batchRows: number[][] = []
      for (let dim = 0; dim < latentDimValue; dim += 1) {
        const row: number[] = []
        for (let pos = 0; pos < latentLen; pos += 1) {
          const u1 = Math.max(0.0001, Math.random())
          const u2 = Math.random()
          const value = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
          row.push(value * latentMask[batch][0][pos])
        }
        batchRows.push(row)
      }
      xt.push(batchRows)
    }

    return { xt, latentMask }
  }

  lengthToMask(lengths: number[], maxLen: number) {
    return lengths.map((len) => {
      const row = new Array<number>(maxLen).fill(0)
      for (let i = 0; i < Math.min(len, maxLen); i += 1) row[i] = 1
      return [row]
    })
  }
}

async function loadJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Supertonic asset missing: ${url}`)
  }
  return response.json() as Promise<T>
}

async function loadVoiceStyle(voiceStylePath: string) {
  const voiceStyle = await loadJson<VoiceStyleJson>(voiceStylePath)
  const ttlDims = voiceStyle.style_ttl.dims
  const dpDims = voiceStyle.style_dp.dims
  const ttlTensor = new ort.Tensor('float32', new Float32Array(flattenNumbers(voiceStyle.style_ttl.data)), [
    1,
    ttlDims[1],
    ttlDims[2],
  ])
  const dpTensor = new ort.Tensor('float32', new Float32Array(flattenNumbers(voiceStyle.style_dp.data)), [
    1,
    dpDims[1],
    dpDims[2],
  ])

  return new Style(ttlTensor, dpTensor)
}

async function loadTextToSpeech(onnxDir: string, sessionOptions: ort.InferenceSession.SessionOptions) {
  const cfgs = await loadJson<SupertonicCfgs>(`${onnxDir}/tts.json`)
  const textProcessor = new UnicodeProcessor(await loadJson<number[]>(`${onnxDir}/unicode_indexer.json`))
  const dpOrt = await ort.InferenceSession.create(`${onnxDir}/duration_predictor.onnx`, sessionOptions)
  const textEncOrt = await ort.InferenceSession.create(`${onnxDir}/text_encoder.onnx`, sessionOptions)
  const vectorEstOrt = await ort.InferenceSession.create(`${onnxDir}/vector_estimator.onnx`, sessionOptions)
  const vocoderOrt = await ort.InferenceSession.create(`${onnxDir}/vocoder.onnx`, sessionOptions)

  return new TextToSpeech(cfgs, textProcessor, dpOrt, textEncOrt, vectorEstOrt, vocoderOrt)
}

function configureOrt() {
  ort.env.wasm.numThreads = 1
}

async function loadRuntime(): Promise<SupertonicRuntime> {
  configureOrt()

  const stylePromise = loadVoiceStyle(DEFAULT_VOICE_STYLE)
  try {
    const textToSpeech = await loadTextToSpeech(ONNX_DIR, {
      executionProviders: ['webgpu'],
      graphOptimizationLevel: 'all',
    })
    return { textToSpeech, style: await stylePromise, backend: 'webgpu' }
  } catch (webgpuError) {
    console.info('Supertonic WebGPU unavailable; using WASM fallback.', webgpuError)
    const textToSpeech = await loadTextToSpeech(ONNX_DIR, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    })
    return { textToSpeech, style: await stylePromise, backend: 'wasm' }
  }
}

function getRuntime() {
  if (!runtimePromise) {
    runtimePromise = loadRuntime().catch((error) => {
      runtimePromise = null
      throw error
    })
  }
  return runtimePromise
}

function chunkText(text: string, maxLen: number) {
  const normalized = text.trim()
  if (!normalized) return []

  const sentences = normalized
    .split(/(?<=[。！？!?])\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
  const chunks: string[] = []

  for (const sentence of sentences.length > 0 ? sentences : [normalized]) {
    if (sentence.length <= maxLen) {
      chunks.push(sentence)
      continue
    }

    for (let i = 0; i < sentence.length; i += maxLen) {
      chunks.push(sentence.slice(i, i + maxLen))
    }
  }

  return chunks
}

function writeWavFile(audioData: number[], sampleRate: number) {
  const numChannels = 1
  const bitsPerSample = 16
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8
  const blockAlign = (numChannels * bitsPerSample) / 8
  const dataSize = audioData.length * 2
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)

  const int16Data = new Int16Array(audioData.length)
  for (let i = 0; i < audioData.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, audioData[i]))
    int16Data[i] = Math.floor(clamped * 32767)
  }

  new Uint8Array(buffer, 44).set(new Uint8Array(int16Data.buffer))
  return buffer
}

export function stopSupertonicSpeech() {
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.src = ''
    activeAudio = null
  }

  if (activeUrl) {
    URL.revokeObjectURL(activeUrl)
    activeUrl = null
  }
}

export async function speakWithSupertonicTts(text: string, type: 'word' | 'sentence' = 'sentence') {
  stopSupertonicSpeech()
  const runtime = await getRuntime()
  const { wav, duration } = await runtime.textToSpeech.call(
    text,
    'ja',
    runtime.style,
    type === 'word' ? 5 : 6,
    type === 'word' ? 1.0 : 0.92,
  )
  const wavLen = Math.floor(runtime.textToSpeech.sampleRate * duration[0])
  const wavBuffer = writeWavFile(wav.slice(0, wavLen), runtime.textToSpeech.sampleRate)
  activeUrl = URL.createObjectURL(new Blob([wavBuffer], { type: 'audio/wav' }))
  activeAudio = new Audio(activeUrl)

  await new Promise<void>((resolve, reject) => {
    const audio = activeAudio
    if (!audio) {
      reject(new Error('Supertonic audio unavailable'))
      return
    }

    audio.onended = () => resolve()
    audio.onerror = () => reject(new Error(`Supertonic playback failed on ${runtime.backend}`))
    audio.play().catch(reject)
  })
}
