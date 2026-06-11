const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const lessonsPath = path.join(root, 'src/data/lessons.ts')
const source = fs.readFileSync(lessonsPath, 'utf8')

const allowlist = new Set([
  '留学生|学生',
  '週末|週',
  'また明日|明日',
  '外にする|外',
  'だそうです|そうです',
  'ありますか|あります',
  '風邪薬|薬',
])

function extractLessonLifeOrder(text) {
  const match = text.match(/export const lessonLifeOrder = \[([\s\S]*?)\] as const/)
  return Array.from(match[1].matchAll(/'([^']+)'/g), (item) => item[1])
}

function extractLessons(text) {
  const pool = text.slice(text.indexOf('const lessonPool'))
  const ids = [...pool.matchAll(/\{\s*\n\s*id: '([^']+)',\s*\n\s*title: '([^']+)',/g)].map((m) => ({
    id: m[1],
    title: m[2],
    index: m.index,
  }))
  const lessons = []
  for (let i = 0; i < ids.length; i += 1) {
    const block = pool.slice(ids[i].index, ids[i + 1]?.index ?? pool.length)
    const vocabulary = [
      ...((block.match(/vocabulary:\s*\[([\s\S]*?)\],\s*\n\s*grammar:/) || ['', ''])[1].matchAll(
        /\{\s*word:\s*'([^']*)',\s*reading:\s*'([^']*)',\s*meaning:\s*'([^']*)'\s*\}/g,
      )),
    ].map((m) => ({ word: m[1], reading: m[2], meaning: m[3] }))
    lessons.push({ id: ids[i].id, title: ids[i].title, vocabulary })
  }
  return lessons
}

function dedupe(items) {
  const kept = []
  for (const item of items) {
    const redundant = kept.some((existing) => {
      if (existing.word === item.word) return true
      if (existing.word.includes(item.word)) {
        return !allowlist.has(`${existing.word}|${item.word}`)
      }
      if (item.word.includes(existing.word)) {
        return !allowlist.has(`${item.word}|${existing.word}`)
      }
      return false
    })
    if (!redundant) kept.push(item)
  }
  return kept
}

const lessonLifeOrder = extractLessonLifeOrder(source)
const lessons = extractLessons(source)
const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]))

let issueCount = 0
console.log(`检查主线 ${lessonLifeOrder.length} 课词汇重复...\n`)

for (const [index, lessonId] of lessonLifeOrder.entries()) {
  const lesson = byId.get(lessonId)
  if (!lesson) {
    console.log(`${index + 1}. ${lessonId} — 缺失课程数据`)
    issueCount += 1
    continue
  }

  const rawDupes = []
  const seen = new Set()
  for (const item of lesson.vocabulary) {
    if (seen.has(item.word)) rawDupes.push(item.word)
    seen.add(item.word)
  }

  const deduped = dedupe(lesson.vocabulary)
  const removed = lesson.vocabulary
    .filter((item) => !deduped.some((kept) => kept.word === item.word))
    .map((item) => item.word)

  if (rawDupes.length || removed.length) {
    issueCount += 1
    console.log(`${index + 1}. ${lessonId} (${lesson.title})`)
    if (rawDupes.length) console.log(`   同词重复: ${[...new Set(rawDupes)].join(', ')}`)
    if (removed.length) console.log(`   子串重复: ${removed.join(', ')}`)
  }
}

if (issueCount === 0) {
  console.log('未发现重复词条。')
} else {
  console.log(`\n共 ${issueCount} 课仍有问题。`)
  process.exitCode = 1
}
