/**
 * 为「正在编写的批次」生成写作范围关系图：
 * 1) 汇总允许级别内、已编写记忆法的单词键 written_keys
 * 2) 从 n5/n4/... 关系索引取出当前批目标词的关系，去掉 target 尚未编写的边
 *
 * 用法：
 *   node scripts/build_writing_scope_relations.cjs --level n4 --batch 15
 *   npm run memory:writing-scope -- --level n4 --batch 15
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const MEMORY_ROOT = path.join(ROOT, 'data/memory_methods')
const REL_ROOT = path.join(ROOT, 'data/word_relations')
const SCOPE_OUT = path.join(REL_ROOT, 'writing_scope')

const LEVEL_SCOPE = {
  n5: ['n5'],
  n4: ['n5', 'n4'],
  n3: ['n5', 'n4', 'n3'],
  n2: ['n5', 'n4', 'n3', 'n2'],
}

const PLACEHOLDER_MARKERS = [
  '在便利店门口，小田和朋友把刚发生的小事演了一遍',
]

function parseArgs(argv) {
  const args = { level: '', batch: 0, includeSameBatch: true }
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--level' || token === '-l') {
      args.level = String(argv[i + 1] || '').toLowerCase()
      i += 1
      continue
    }
    if (token === '--batch' || token === '-b') {
      args.batch = Number(argv[i + 1])
      i += 1
      continue
    }
    if (token === '--no-same-batch') {
      args.includeSameBatch = false
      continue
    }
    if (!args.level && /^n[2-5]$/i.test(token)) {
      args.level = token.toLowerCase()
      continue
    }
    if (!args.batch && /^\d+$/.test(token)) {
      args.batch = Number(token)
    }
  }
  return args
}

function normalize(value) {
  return String(value || '').trim()
}

function keyOf(word, reading) {
  return `${normalize(word)}::${normalize(reading)}`
}

function isPlaceholderMergedScene(mergedScene) {
  const scene = normalize(mergedScene)
  if (!scene) return true
  return PLACEHOLDER_MARKERS.some((marker) => scene.includes(marker))
}

function listBatchFiles(levelDir) {
  if (!fs.existsSync(levelDir)) return []
  return fs.readdirSync(levelDir)
    .filter((name) => /^batch_(\d+)_methods\.json$/i.test(name))
    .map((name) => {
      const match = name.match(/^batch_(\d+)_methods\.json$/i)
      return { batchNum: Number(match[1]), path: path.join(levelDir, name) }
    })
    .sort((a, b) => a.batchNum - b.batchNum)
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function collectWrittenKeys({ writingLevel, writingBatch, allowedLevels }) {
  const writtenKeys = new Set()
  const batchSummary = []

  for (const level of allowedLevels) {
    const levelDir = path.join(MEMORY_ROOT, level)
    const batches = listBatchFiles(levelDir)
    const maxBatch = level === writingLevel ? writingBatch - 1 : Infinity

    for (const item of batches) {
      if (item.batchNum > maxBatch) continue
      const entries = loadJson(item.path)
      if (!Array.isArray(entries)) continue
      let written = 0
      for (const entry of entries) {
        const key = keyOf(entry.word, entry.reading)
        if (!key || key === '::') continue
        if (isPlaceholderMergedScene(entry.mergedScene)) continue
        writtenKeys.add(key)
        written += 1
      }
      batchSummary.push({
        level,
        batchNum: item.batchNum,
        path: path.relative(ROOT, item.path),
        total: entries.length,
        written,
      })
    }
  }

  return { writtenKeys, batchSummary }
}

function loadRelationIndexes(allowedLevels) {
  const allIndexPath = path.join(REL_ROOT, 'all_word_relation_index.json')
  if (allowedLevels.length > 1 && fs.existsSync(allIndexPath)) {
    const data = loadJson(allIndexPath)
    return [{ level: 'all', filePath: allIndexPath, words: data.words || {}, allowedLevels }]
  }

  const indexes = []
  for (const level of allowedLevels) {
    const filePath = path.join(REL_ROOT, `${level}_word_relation_index.json`)
    if (!fs.existsSync(filePath)) continue
    const data = loadJson(filePath)
    indexes.push({ level, filePath, words: data.words || {} })
  }
  return indexes
}

function normalizeLevelLabel(level) {
  return String(level || '').trim().toLowerCase()
}

function targetLevelsAllowed(targetLevels, allowedLevels) {
  if (!Array.isArray(targetLevels) || targetLevels.length === 0) return true
  const allowed = new Set(allowedLevels.map(normalizeLevelLabel))
  return targetLevels.some((level) => allowed.has(normalizeLevelLabel(level)))
}

function mergeRelationsForKey(indexes, wordKey) {
  const merged = []
  const seen = new Set()
  for (const index of indexes) {
    const item = index.words[wordKey]
    if (!item || !Array.isArray(item.relations)) continue
    for (const rel of item.relations) {
      if (index.allowedLevels && !targetLevelsAllowed(rel.targetLevels, index.allowedLevels)) continue
      const targetKey = keyOf(rel.targetWord, rel.targetReading)
      const dedupe = `${rel.type}::${targetKey}`
      if (seen.has(dedupe)) continue
      seen.add(dedupe)
      merged.push(rel)
    }
  }
  merged.sort((a, b) => (b.memoryValue || 0) - (a.memoryValue || 0) || (b.confidence || 0) - (a.confidence || 0))
  return merged
}

function buildTargetBatchKeys(writingLevel, writingBatch) {
  const batchPath = path.join(MEMORY_ROOT, writingLevel, `batch_${String(writingBatch).padStart(2, '0')}_methods.json`)
  if (!fs.existsSync(batchPath)) {
    throw new Error(`找不到目标批次词表：${path.relative(ROOT, batchPath)}`)
  }
  const entries = loadJson(batchPath)
  if (!Array.isArray(entries)) throw new Error(`批次文件不是数组：${batchPath}`)
  const keys = entries.map((entry) => keyOf(entry.word, entry.reading)).filter((key) => key && key !== '::')
  return { batchPath, keys, entries }
}

function filterRelations(rawRelations, { writtenKeys, currentBatchKeys, includeSameBatch }) {
  const kept = []
  let dropped = 0
  for (const rel of rawRelations) {
    const targetKey = keyOf(rel.targetWord, rel.targetReading)
    const targetWritten = writtenKeys.has(targetKey)
      || (includeSameBatch && currentBatchKeys.has(targetKey))
    if (!targetWritten) {
      dropped += 1
      continue
    }
    kept.push({
      ...rel,
      targetWritten: true,
    })
  }
  return { kept, dropped }
}

function buildWritingRelations({
  writingLevel,
  writingBatch,
  allowedLevels,
  writtenKeys,
  writtenKeysFile,
  includeSameBatch,
  targetEntries,
  targetKeys,
  indexes,
}) {
  const words = {}
  let relationsRawTotal = 0
  let relationsFilteredTotal = 0
  let relationsDroppedTotal = 0
  const currentBatchKeys = new Set(targetKeys)

  for (const entry of targetEntries) {
    const wordKey = keyOf(entry.word, entry.reading)
    const rawRelations = mergeRelationsForKey(indexes, wordKey)
    relationsRawTotal += rawRelations.length
    const { kept, dropped } = filterRelations(rawRelations, {
      writtenKeys,
      currentBatchKeys,
      includeSameBatch,
    })
    relationsFilteredTotal += kept.length
    relationsDroppedTotal += dropped

    const highValue = kept.filter((rel) => (rel.memoryValue || 0) >= 0.85).length
    words[wordKey] = {
      id: `${writingLevel}-word-${String(entry.sourceIndex || 0).padStart(4, '0')}`,
      word: entry.word,
      reading: entry.reading,
      meaning: entry.meaning,
      sourceLevels: [writingLevel],
      relationsRaw: rawRelations.length,
      relations: kept,
      relationSummary: {
        total: kept.length,
        dropped,
        highValue,
      },
      suggestedPrimaryStrategies: Array.from(new Set(
        kept
          .filter((rel) => (rel.memoryValue || 0) >= 0.84)
          .map((rel) => rel.suggestedStrategy)
          .filter(Boolean),
      )).slice(0, 4),
    }
  }

  return {
    metadata: {
      description: '当前待编写批次的按词关系（已去掉尚未编写记忆法的目标词）。',
      writingLevel,
      writingBatch,
      allowedLevels,
      relationIndexes: indexes.map((index) => path.relative(ROOT, index.filePath)),
      writtenKeysFile: path.relative(ROOT, writtenKeysFile),
      writtenKeyCount: writtenKeys.size,
      includeSameBatchTargets: includeSameBatch,
      generatedAt: new Date().toISOString(),
      targetWordCount: targetKeys.length,
      relationsRawTotal,
      relationsFilteredTotal,
      relationsDroppedTotal,
    },
    words,
  }
}

function main() {
  const args = parseArgs(process.argv)
  const writingLevel = args.level
  const writingBatch = args.batch

  if (!writingLevel || !LEVEL_SCOPE[writingLevel]) {
    console.error('请指定级别：--level n5|n4|n3|n2')
    process.exit(1)
  }
  if (!writingBatch || writingBatch < 1) {
    console.error('请指定批次号：--batch <数字>')
    process.exit(1)
  }

  const allowedLevels = LEVEL_SCOPE[writingLevel]
  const throughBatchSameLevel = writingBatch - 1

  const { writtenKeys, batchSummary } = collectWrittenKeys({
    writingLevel,
    writingBatch,
    allowedLevels,
  })

  const writtenKeysFile = path.join(
    SCOPE_OUT,
    `${writingLevel}_through_batch_${String(throughBatchSameLevel).padStart(2, '0')}_written_keys.json`,
  )
  const writtenKeysPayload = {
    metadata: {
      description: '已编写记忆法、可作为关系锚点的单词键（单词::读音）。编写新批前更新。',
      writingLevel,
      writingBatch,
      throughBatchSameLevel,
      allowedLevels,
      generatedAt: new Date().toISOString(),
      totalKeys: writtenKeys.size,
      batchSummary,
    },
    keys: Array.from(writtenKeys).sort(),
  }

  const { batchPath, keys: targetKeys, entries: targetEntries } = buildTargetBatchKeys(writingLevel, writingBatch)
  const indexes = loadRelationIndexes(allowedLevels)
  const writingRelations = buildWritingRelations({
    writingLevel,
    writingBatch,
    allowedLevels,
    writtenKeys,
    writtenKeysFile,
    includeSameBatch: args.includeSameBatch,
    targetEntries,
    targetKeys,
    indexes,
  })

  fs.mkdirSync(SCOPE_OUT, { recursive: true })
  fs.writeFileSync(writtenKeysFile, `${JSON.stringify(writtenKeysPayload, null, 2)}\n`, 'utf8')

  const writingRelationsFile = path.join(
    SCOPE_OUT,
    `${writingLevel}_batch_${String(writingBatch).padStart(2, '0')}_writing_relations.json`,
  )
  fs.writeFileSync(writingRelationsFile, `${JSON.stringify(writingRelations, null, 2)}\n`, 'utf8')

  console.log(`[memory:writing-scope] level=${writingLevel} batch=${writingBatch}`)
  console.log(`  written keys: ${writtenKeys.size} -> ${path.relative(ROOT, writtenKeysFile)}`)
  console.log(`  target words: ${targetKeys.length} from ${path.relative(ROOT, batchPath)}`)
  console.log(`  relations: raw=${writingRelations.metadata.relationsRawTotal} kept=${writingRelations.metadata.relationsFilteredTotal} dropped=${writingRelations.metadata.relationsDroppedTotal}`)
  console.log(`  output: ${path.relative(ROOT, writingRelationsFile)}`)
}

main()
