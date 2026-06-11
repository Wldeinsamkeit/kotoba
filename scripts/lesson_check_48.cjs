const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const lessonsPath = path.join(root, 'src/data/lessons.ts')
const unlockHtmlPath = path.join(root, 'public/review-unlock-lessons.html')
const reportPath = path.join(root, 'tmp/lesson-check-48-report.md')

const source = fs.readFileSync(lessonsPath, 'utf8')

function extractLessonLifeOrder(text) {
  const match = text.match(/export const lessonLifeOrder = \[([\s\S]*?)\] as const/)
  if (!match) {
    throw new Error('export const lessonLifeOrder not found in src/data/lessons.ts')
  }
  return Array.from(match[1].matchAll(/'([^']+)'/g), (item) => item[1])
}

function extractLessonMeta(text) {
  const blocks = text.split(/\n  \{\n/)
  const meta = new Map()

  for (const block of blocks) {
    const idMatch = block.match(/^\s*id: '([^']+)',/m)
    if (!idMatch) continue
    const titleMatch = block.match(/^\s*title: '([^']+)',/m)
    const levelMatch = block.match(/^\s*level: '([^']+)',/m)
    meta.set(idMatch[1], {
      title: titleMatch?.[1] ?? idMatch[1],
      level: levelMatch?.[1] ?? '未知',
    })
  }

  return meta
}

const lessonLifeOrder = extractLessonLifeOrder(source)
const lessonMeta = extractLessonMeta(source)

if (lessonLifeOrder.length !== 48) {
  console.warn(`Warning: lessonLifeOrder has ${lessonLifeOrder.length} items, expected 48.`)
}

const missing = lessonLifeOrder.filter((id) => !lessonMeta.has(id))
const lines = [
  '# 48 课检查报告',
  '',
  `生成时间：${new Date().toLocaleString('zh-CN')}`,
  '',
  '## 使用方式',
  '',
  '1. 启动开发服：`npm run dev`',
  '2. 打开检查台：`http://localhost:5173/lesson-check`',
  '3. 勾选「开启检查模式」后，可逐课打开全部 48 课',
  '4. 或访问 `http://localhost:5173/review-unlock-lessons.html` 写入全部通过记录',
  '',
  '## 课程清单',
  '',
  '| 集数 | 等级 | 中文主题 | lessonId |',
  '| --- | --- | --- | --- |',
]

lessonLifeOrder.forEach((lessonId, index) => {
  const meta = lessonMeta.get(lessonId)
  const topic = meta?.title?.split(/[:：]/)[0]?.trim() ?? '（缺失）'
  const level = meta?.level ?? '缺失'
  lines.push(`| ${index + 1} | ${level} | ${topic} | \`${lessonId}\` |`)
})

if (missing.length > 0) {
  lines.push('', '## 缺失课程', '', ...missing.map((id) => `- \`${id}\``))
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${lines.join('\n')}\n`)

const unlockHtml = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>48 课检查解锁</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #f5f3ec;
        color: #171713;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(520px, calc(100% - 48px));
        padding: 28px;
        border: 1px solid #e3ded2;
        border-radius: 18px;
        background: #fffdfa;
        box-shadow: 0 18px 50px #00000012;
      }
      h1 { margin: 0 0 12px; font-size: 28px; }
      p { color: #68645c; line-height: 1.7; }
      a { color: #c96442; font-weight: 700; }
    </style>
  </head>
  <body>
    <main>
      <h1>48 课已临时全部通过</h1>
      <p id="status">正在写入本地学习进度...</p>
      <p><a href="/lesson-check">打开 48 课检查台</a></p>
      <p><a href="/lessons">回到课程列表</a></p>
    </main>
    <script>
      const lessonIds = ${JSON.stringify(lessonLifeOrder, null, 2)};
      const progressKey = 'nihongo-daily-progress-v1';
      const checkModeKey = 'nihongo-lesson-check-mode';
      const current = JSON.parse(localStorage.getItem(progressKey) || '{}');
      const completedLessonIds = Array.from(new Set([
        ...(Array.isArray(current.completedLessonIds) ? current.completedLessonIds : []),
        ...lessonIds,
      ]));
      const quizStats = { ...(current.quizStats || {}) };
      for (const id of lessonIds) {
        quizStats[id] = quizStats[id] || { correct: 3, total: 3 };
      }
      localStorage.setItem(progressKey, JSON.stringify({
        ...current,
        completedLessonIds,
        quizStats,
      }));
      localStorage.setItem(checkModeKey, '1');
      document.getElementById('status').textContent =
        '已写入 ' + lessonIds.length + ' 课通过记录，并开启检查模式。';
      setTimeout(() => {
        location.replace('/lesson-check');
      }, 700);
    </script>
  </body>
</html>
`

fs.writeFileSync(unlockHtmlPath, unlockHtml)

console.log(`48-lesson check ready (${lessonLifeOrder.length} lessons).`)
console.log(`Report: ${path.relative(root, reportPath)}`)
console.log(`Unlock page: ${path.relative(root, unlockHtmlPath)}`)
console.log('')
console.log('Next steps:')
console.log('  npm run dev')
console.log('  open http://localhost:5173/lesson-check')

if (missing.length > 0) {
  console.log('')
  console.log(`Missing lesson data for ${missing.length} ids:`)
  missing.forEach((id) => console.log(`  - ${id}`))
  process.exitCode = 1
}
