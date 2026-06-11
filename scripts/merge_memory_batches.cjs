/**
 * 将正式 batch_*_methods.json 按顺序合并进 all_*_memory_methods.json。
 * 不修改批次内词条内容，只做顺序拼接并写回汇总文件。
 *
 * 用法：
 *   node scripts/merge_memory_batches.cjs --level n5 --through 17
 *   npm run memory:merge-n5
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const MEMORY_ROOT = path.join(ROOT, 'data/memory_methods')

function parseArgs(argv) {
  const args = { level: 'n5', through: 17, from: 1 }
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--level' || token === '-l') {
      args.level = String(argv[i + 1] || '').toLowerCase()
      i += 1
      continue
    }
    if (token === '--through' || token === '-t') {
      args.through = Number(argv[i + 1])
      i += 1
      continue
    }
    if (token === '--from' || token === '-f') {
      args.from = Number(argv[i + 1])
      i += 1
      continue
    }
  }
  return args
}

function loadJson(filePath) {
  const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (!Array.isArray(rows)) {
    throw new Error(`批次文件必须是 JSON 数组：${filePath}`)
  }
  return rows
}

function main() {
  const args = parseArgs(process.argv)
  const { level, through, from } = args

  if (!level || !/^n[1-5]$/.test(level)) {
    console.error('请指定级别：--level n5|n4|n3|n2|n1')
    process.exit(1)
  }
  if (!Number.isFinite(through) || through < from || from < 1) {
    console.error('请指定有效批次范围：--from 1 --through 17')
    process.exit(1)
  }

  const levelDir = path.join(MEMORY_ROOT, level)
  const allOut = path.join(levelDir, `all_${level}_memory_methods.json`)
  if (!fs.existsSync(levelDir)) {
    console.error(`找不到目录：${path.relative(ROOT, levelDir)}`)
    process.exit(1)
  }

  const merged = []
  const batchSummary = []

  for (let batchNum = from; batchNum <= through; batchNum += 1) {
    const batchPath = path.join(levelDir, `batch_${String(batchNum).padStart(2, '0')}_methods.json`)
    if (!fs.existsSync(batchPath)) {
      console.error(`缺少批次文件：${path.relative(ROOT, batchPath)}`)
      process.exit(1)
    }
    const entries = loadJson(batchPath)
    merged.push(...entries)
    batchSummary.push({
      batchNum,
      path: path.relative(ROOT, batchPath),
      count: entries.length,
    })
  }

  let previousCount = 0
  if (fs.existsSync(allOut)) {
    previousCount = loadJson(allOut).length
  }

  fs.writeFileSync(allOut, `${JSON.stringify(merged, null, 2)}\n`, 'utf8')

  console.log(`[memory:merge-${level}] batch ${String(from).padStart(2, '0')}–${String(through).padStart(2, '0')}`)
  for (const item of batchSummary) {
    console.log(`  batch_${String(item.batchNum).padStart(2, '0')}: ${item.count} 词`)
  }
  console.log(`  merged total: ${merged.length} 词`)
  console.log(`  previous all: ${previousCount} 词`)
  console.log(`  output: ${path.relative(ROOT, allOut)}`)
}

main()
