const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'data/word_relations/sources')
const LEVEL = String(process.argv[2] || 'n2').toLowerCase()
const CONFIGS = {
  n1: {
    sourceDir: path.join(ROOT, '闲置文件夹/n2/n1'),
    outFile: path.join(OUT_DIR, 'n1_vocab.json'),
    expectedCount: 3527,
  },
  n2: {
    sourceDir: path.join(ROOT, '闲置文件夹/n2'),
    outFile: path.join(OUT_DIR, 'n2_vocab.json'),
    expectedCount: 3070,
  },
}

const CONFIG = CONFIGS[LEVEL]
if (!CONFIG) throw new Error(`Unsupported level "${LEVEL}". Use one of: ${Object.keys(CONFIGS).join(', ')}`)

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function getRangeStart(filePath) {
  const name = path.basename(filePath)
  const match = name.match(/(\d+)~(\d+)/)
  if (!match) throw new Error(`Cannot read range from filename: ${name}`)
  return Number(match[1])
}

function cleanText(text) {
  const lines = text
    .replace(/\f/g, '\n')
    .split(/\r?\n/)
    .map((line) => line.trim())
  const cleaned = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line || line.startsWith('词单：') || line === '序号 发音 单词 释义') continue
    const nextMeaningful = lines.slice(i + 1).find((item) => item && !item.startsWith('词单：'))
    if (/^\d+$/.test(line) && nextMeaningful === '序号 发音 单词 释义') continue
    cleaned.push(line)
  }
  return cleaned
}

function splitMeaning(rawMeaning) {
  const meaningRaw = normalize(rawMeaning)
  const match = meaningRaw.match(/^\[([^\]]+)\]\s*(.*)$/)
  if (!match) return { partOfSpeech: '', meaning: meaningRaw, sourceMeaningRaw: meaningRaw }
  return {
    partOfSpeech: match[1],
    meaning: normalize(match[2]),
    sourceMeaningRaw: meaningRaw,
  }
}

function isReadingFragment(value) {
  return /^[ぁ-ゟー～〜]+$/.test(normalize(value))
}

function splitLongEntryFragments(fragments) {
  const readingFragments = []
  const wordFragments = []
  let foundWord = false

  for (const fragment of fragments) {
    if (!foundWord && isReadingFragment(fragment)) {
      readingFragments.push(fragment)
      continue
    }
    foundWord = true
    wordFragments.push(fragment)
  }

  return {
    reading: normalize(readingFragments.join('')),
    word: normalize(wordFragments.join('')),
  }
}

function parsePdf(filePath) {
  const rangeStart = getRangeStart(filePath)
  const rawText = execFileSync('pdftotext', ['-raw', filePath, '-'], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  const lines = cleanText(rawText)
  const entries = []
  let current = null

  function flushCurrent() {
    if (!current) return
    const meaningParts = splitMeaning(current.meaningParts.join(' '))
    entries.push({
      sourceIndex: rangeStart + current.localIndex - 1,
      sourceLocalIndex: current.localIndex,
      level: LEVEL.toUpperCase(),
      word: current.word,
      reading: current.reading,
      ...meaningParts,
      sourceFile: path.relative(ROOT, filePath),
    })
    current = null
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const match = line.match(/^(\d{1,4})\s+(\S+)\s+(\S+)(?:\s+(.*))?$/)
    if (match) {
      flushCurrent()
      current = {
        localIndex: Number(match[1]),
        reading: normalize(match[2]),
        word: normalize(match[3]),
        meaningParts: match[4] ? [match[4]] : [],
      }
      continue
    }
    const indexOnlyMatch = line.match(/^(\d{1,4})$/)
    if (indexOnlyMatch) {
      flushCurrent()
      const fragments = []
      const meaningParts = []
      let sawMeaning = false
      while (i + 1 < lines.length) {
        const next = lines[i + 1]
        if (/^\d{1,4}(?:\s+|$)/.test(next)) break
        i += 1
        const bracketIndex = next.indexOf('[')
        if (bracketIndex >= 0) {
          const wordPart = normalize(next.slice(0, bracketIndex))
          const meaningPart = normalize(next.slice(bracketIndex))
          if (wordPart) fragments.push(wordPart)
          if (meaningPart) meaningParts.push(meaningPart)
          sawMeaning = true
          continue
        }
        if (sawMeaning) {
          meaningParts.push(next)
        } else {
          fragments.push(next)
        }
      }
      const splitEntry = splitLongEntryFragments(fragments)
      if (!splitEntry.reading && !splitEntry.word && !meaningParts.length) continue
      current = {
        localIndex: Number(indexOnlyMatch[1]),
        reading: splitEntry.reading,
        word: splitEntry.word,
        meaningParts,
      }
      continue
    }
    if (current) current.meaningParts.push(line)
  }
  flushCurrent()
  return entries
}

const pdfFiles = fs.readdirSync(CONFIG.sourceDir)
  .filter((name) => name.endsWith('.pdf'))
  .map((name) => path.join(CONFIG.sourceDir, name))
  .sort((a, b) => getRangeStart(a) - getRangeStart(b))

if (!pdfFiles.length) throw new Error(`No ${LEVEL.toUpperCase()} PDFs found in ${path.relative(ROOT, CONFIG.sourceDir)}`)

const entries = pdfFiles.flatMap(parsePdf)
const missingMeanings = entries.filter((entry) => !entry.meaning)
const duplicateKeys = new Map()
for (const entry of entries) {
  const key = `${entry.word}::${entry.reading}::${entry.sourceIndex}`
  duplicateKeys.set(key, (duplicateKeys.get(key) || 0) + 1)
}
const duplicateCount = Array.from(duplicateKeys.values()).filter((count) => count > 1).length

fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(CONFIG.outFile, `${JSON.stringify(entries, null, 2)}\n`)

console.log(`wrote ${path.relative(ROOT, CONFIG.outFile)} (${entries.length} entries)`)
console.log(`source pdfs: ${pdfFiles.length}`)
console.log(`missing meanings: ${missingMeanings.length}`)
console.log(`duplicate source keys: ${duplicateCount}`)

if (entries.length !== CONFIG.expectedCount) {
  throw new Error(`Expected ${CONFIG.expectedCount} ${LEVEL.toUpperCase()} entries, got ${entries.length}`)
}
