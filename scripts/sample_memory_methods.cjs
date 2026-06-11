#!/usr/bin/env node

/**
 * 单词记忆法交互式抽样测试
 *
 * 用法：
 *   node scripts/sample_memory_methods.cjs --level n4 --count 10
 *   node scripts/sample_memory_methods.cjs --level n5 --batch 3
 *   node scripts/sample_memory_methods.cjs --level all          # N4+N5 全量
 *   npm run memory:sample -- --level n4 --count 10
 *
 * 操作：
 *   回车 = 翻卡揭晓  |  n = 下一个  |  p = 上一个
 *   1/2/3 = 标记质量(好/一般/差)  |  q = 退出
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

// ── 参数解析 ──────────────────────────────────────────────
const args = process.argv.slice(2)
function getArg(name) {
  const idx = args.indexOf(`--${name}`)
  if (idx === -1) return undefined
  return args[idx + 1]
}

const level = (getArg('level') || '').toLowerCase()
const count = parseInt(getArg('count') || '10', 10)
const batchArg = getArg('batch') ? parseInt(getArg('batch'), 10) : undefined
const seedArg = getArg('seed') ? parseInt(getArg('seed'), 10) : undefined
const modeArg = (getArg('mode') || 'word').toLowerCase() // word | mnemonic

if (!['n4', 'n5', 'all'].includes(level)) {
  console.error('❌ 请指定 --level n4、--level n5 或 --level all')
  process.exit(1)
}

// ── 读取批次文件 ──────────────────────────────────────────
const levelsToLoad = level === 'all' ? ['n4', 'n5'] : [level]
const allBatches = []

for (const lv of levelsToLoad) {
  const baseDir = path.join(__dirname, '..', 'data', 'memory_methods', lv)
  const batchFiles = fs.readdirSync(baseDir)
    .filter(f => /^batch_\d+_methods\.json$/.test(f))
    .sort()

  if (batchFiles.length === 0) {
    console.error(`⚠️  在 data/memory_methods/${lv}/ 下未找到批次文件，跳过`)
    continue
  }

  for (const file of batchFiles) {
    const batchNum = parseInt(file.match(/batch_(\d+)_methods/)[1], 10)
    const words = JSON.parse(fs.readFileSync(path.join(baseDir, file), 'utf-8'))
    allBatches.push({ batchNum, words, file, level: lv })
  }
}

if (allBatches.length === 0) {
  console.error('❌ 未找到任何批次文件')
  process.exit(1)
}

// ── 过滤批次 ──────────────────────────────────────────────
let targetBatches = allBatches
if (batchArg !== undefined) {
  targetBatches = allBatches.filter(b => b.batchNum === batchArg)
  if (targetBatches.length === 0) {
    console.error(`❌ 未找到第 ${batchArg} 组`)
    process.exit(1)
  }
}

// ── 构建词池 ──────────────────────────────────────────────
const pool = []
for (const batch of targetBatches) {
  for (const word of batch.words) {
    pool.push({ ...word, _batch: batch.batchNum, _level: batch.level })
  }
}

// ── 伪随机 ────────────────────────────────────────────────
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = seedArg !== undefined ? mulberry32(seedArg) : Math.random

function sample(arr, n) {
  const copy = [...arr]
  const m = Math.min(n, copy.length)
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, m)
}

const sampled = sample(pool, count)

// ── 工具函数 ──────────────────────────────────────────────
function isPlaceholder(scene) {
  if (!scene) return true
  return scene.includes('在便利店门口') ||
    (scene.includes('读音') && scene.includes('作为固定读法记住'))
}

function stripEmoji(s) {
  return s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '').trim()
}

function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(3 - n)
}

function sceneTags(sc) {
  if (!sc) return ''
  const tags = []
  if (sc.specific) tags.push('具体')
  if (sc.emotional) tags.push('情绪')
  if (sc.personal) tags.push('贴近')
  return `${tags.join('+')} (${sc.total || 0}/3)`
}

// ── 交互状态 ──────────────────────────────────────────────
let cursor = 0
let revealed = false
const ratings = {} // index → 'good' | 'ok' | 'bad'
const LEVEL = level.toUpperCase()
const SEP = '═'.repeat(60)
const SEP2 = '─'.repeat(60)

// ── 清屏 ──────────────────────────────────────────────────
function clear() {
  process.stdout.write('\x1B[2J\x1B[H')
}

// ── 渲染 ──────────────────────────────────────────────────
function render() {
  clear()
  const w = sampled[cursor]
  const total = sampled.length
  const placeholder = isPlaceholder(w.mergedScene)
  const rating = ratings[cursor]

  const levelTag = level === 'all' ? w._level.toUpperCase() : LEVEL
  console.log(SEP)
  console.log(`  📝 ${LEVEL} 记忆法抽样测试  |  ${cursor + 1}/${total}  |  ${levelTag} 第${w._batch}组`)
  console.log(SEP)

  if (modeArg === 'word') {
    // ── 模式A：显示单词，猜记忆法 ──
    console.log(`\n  单词：${w.word}`)
    console.log(`  读音：${w.reading}`)
    console.log(`  词性：${w.partOfSpeech || '—'}`)
    console.log('')
    console.log(`  意思：${w.meaning}`)
    console.log('')

    if (!revealed) {
      console.log(SEP2)
      console.log('  💭 回忆一下这个单词的记忆法...')
      console.log('     按 【回车】 揭晓')
    } else {
      console.log(SEP2)
      if (placeholder) {
        console.log('  ⚠️  mergedScene 仍为占位场景，未完成重写！')
      }
      if (w.reviewTip) {
        console.log(`  💡 记忆法：${w.reviewTip}`)
      }
      if (w.mergedScene && !placeholder) {
        console.log(`  🎬 ${w.mergedScene}`)
      }
      if (w.elements && w.elements.length > 0) {
        for (const e of w.elements) {
          const m = e.method || ''
          const b = e.bridgeC || ''
          console.log(`  🧩 ${e.element}[${m}]: ${b}`)
        }
      }
      if (w.difficultyStars) {
        console.log(`  ⭐ 难度：${stars(w.difficultyStars)}`)
      }
      if (w.sceneScore) {
        console.log(`  📊 ${sceneTags(w.sceneScore)}`)
      }
      if (w.exampleSentences && w.exampleSentences.length > 0) {
        for (const ex of w.exampleSentences) {
          console.log(`  📖 ${ex.ja}  →  ${ex.zh}`)
        }
      }
    }
  } else {
    // ── 模式B：显示记忆法，猜单词 ──
    console.log('')
    if (w.reviewTip) {
      console.log(`  💡 记忆法：${w.reviewTip}`)
    }
    if (w.mergedScene && !placeholder) {
      console.log(`  🎬 ${w.mergedScene}`)
    }
    console.log('')

    if (!revealed) {
      console.log(SEP2)
      console.log('  💭 这是哪个单词？回忆一下...')
      console.log('     按 【回车】 揭晓')
    } else {
      console.log(SEP2)
      console.log(`  答案：${w.word}（${w.reading}）`)
      console.log(`  意思：${w.meaning}`)
      if (w.elements && w.elements.length > 0) {
        for (const e of w.elements) {
          const m = e.method || ''
          const b = e.bridgeC || ''
          console.log(`  🧩 ${e.element}[${m}]: ${b}`)
        }
      }
      if (w.difficultyStars) {
        console.log(`  ⭐ 难度：${stars(w.difficultyStars)}`)
      }
      if (w.sceneScore) {
        console.log(`  📊 ${sceneTags(w.sceneScore)}`)
      }
    }
  }

  console.log('')
  console.log(SEP2)

  // ── 状态栏 ──
  const ratingStr = rating === 'good' ? '✅ 好' : rating === 'ok' ? '➖ 一般' : rating === 'bad' ? '❌ 差' : '未评'
  console.log(`  评分：${ratingStr}`)

  if (revealed) {
    console.log('  操作：【回车】下一个  |  p=上一个  |  1=好  2=一般  3=差  |  q=退出')
  } else {
    console.log('  操作：【回车】揭晓  |  n=跳过  |  p=上一个  |  q=退出')
  }
  console.log('')
}

// ── 结束统计 ──────────────────────────────────────────────
function showSummary() {
  clear()
  const total = sampled.length
  const rated = Object.keys(ratings).length
  const good = Object.values(ratings).filter(r => r === 'good').length
  const ok = Object.values(ratings).filter(r => r === 'ok').length
  const bad = Object.values(ratings).filter(r => r === 'bad').length
  const placeholderCount = sampled.filter(w => isPlaceholder(w.mergedScene)).length

  console.log(SEP)
  console.log(`  📊 测试结束 — ${LEVEL} 抽样统计`)
  console.log(SEP)
  console.log(`  总抽样：${total} 词`)
  console.log(`  已评分：${rated} 词`)
  console.log(`    ✅ 好：${good}`)
  console.log(`    ➖ 一般：${ok}`)
  console.log(`    ❌ 差：${bad}`)
  console.log(`  未评分：${total - rated} 词`)
  console.log(`  占位场景：${placeholderCount} 词 ${placeholderCount > 0 ? '⚠️' : '✅'}`)

  // 按批次统计
  console.log('')
  console.log('  按批次：')
  const byBatch = {}
  for (let i = 0; i < sampled.length; i++) {
    const w = sampled[i]
    const key = level === 'all' ? `${w._level}_${w._batch}` : `${w._batch}`
    if (!byBatch[key]) byBatch[key] = { total: 0, good: 0, ok: 0, bad: 0, placeholder: 0, level: w._level, batch: w._batch }
    byBatch[key].total++
    if (ratings[i] === 'good') byBatch[key].good++
    if (ratings[i] === 'ok') byBatch[key].ok++
    if (ratings[i] === 'bad') byBatch[key].bad++
    if (isPlaceholder(w.mergedScene)) byBatch[key].placeholder++
  }
  for (const key of Object.keys(byBatch).sort()) {
    const info = byBatch[key]
    const done = info.total - info.placeholder
    const r = info.good + info.ok + info.bad
    const tag = level === 'all' ? `${info.level.toUpperCase()} ` : ''
    console.log(`    ${tag}第${String(info.batch).padStart(2, '0')}组：${done}/${info.total}已完成  评分${r}/${info.total}  (✅${info.good} ➖${info.ok} ❌${info.bad})`)
  }

  // 列出差评词
  const badWords = Object.entries(ratings)
    .filter(([, r]) => r === 'bad')
    .map(([i]) => sampled[parseInt(i)])
  if (badWords.length > 0) {
    console.log('')
    console.log('  ❌ 差评词清单：')
    for (const w of badWords) {
      const tag = level === 'all' ? `${w._level.toUpperCase()} ` : ''
      console.log(`    ${w.word}（${w.reading}，${w.meaning}）— ${tag}第${w._batch}组`)
    }
  }

  console.log('')
  console.log(SEP)
}

// ── 主循环 ────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function ask() {
  render()
  rl.question('> ', (answer) => {
    const cmd = answer.trim().toLowerCase()

    if (cmd === 'q' || cmd === 'quit' || cmd === 'exit') {
      showSummary()
      rl.close()
      return
    }

    if (cmd === 'n' || cmd === 'next') {
      revealed = false
      if (cursor < sampled.length - 1) cursor++
      ask()
      return
    }

    if (cmd === 'p' || cmd === 'prev' || cmd === 'back') {
      revealed = false
      if (cursor > 0) cursor--
      ask()
      return
    }

    // 数字：1/2/3 在已揭晓状态下是评分，否则是跳转
    if (/^\d+$/.test(cmd)) {
      const num = parseInt(cmd, 10)
      if (revealed && num >= 1 && num <= 3) {
        if (num === 1) ratings[cursor] = 'good'
        else if (num === 2) ratings[cursor] = 'ok'
        else if (num === 3) ratings[cursor] = 'bad'
        if (cursor < sampled.length - 1) { cursor++; revealed = false }
        ask()
        return
      }
      if (num >= 1 && num <= sampled.length) {
        cursor = num - 1
        revealed = false
        ask()
        return
      }
    }

    // 回车
    if (cmd === '' || cmd === 'y' || cmd === 'reveal') {
      if (!revealed) {
        revealed = true
      } else {
        // 已揭晓状态下回车 = 下一个
        if (cursor < sampled.length - 1) {
          cursor++
          revealed = false
        } else {
          showSummary()
          rl.close()
          return
        }
      }
      ask()
      return
    }

    ask()
  })
}

// ── 启动 ──────────────────────────────────────────────────
const batchRange = [...new Set(sampled.map(w => w._batch))].sort((a, b) => a - b)
console.log(`\n  🚀 ${level === 'all' ? 'N4+N5 全量' : LEVEL} 记忆法抽样测试`)
console.log(`  共 ${pool.length} 词中抽取 ${sampled.length} 词`)
if (level === 'all') {
  const n4Count = pool.filter(w => w._level === 'n4').length
  const n5Count = pool.filter(w => w._level === 'n5').length
  console.log(`  N4: ${n4Count} 词  |  N5: ${n5Count} 词`)
}
if (batchArg !== undefined) {
  console.log(`  指定批次：第 ${batchArg} 组`)
} else {
  console.log(`  抽样批次：${batchRange.map(b => `第${b}组`).join('、')}`)
}
console.log(`  模式：${modeArg === 'word' ? '看单词→猜记忆法' : '看记忆法→猜单词'}`)
console.log(`  按回车开始...\n`)

rl.question('', () => {
  ask()
})
