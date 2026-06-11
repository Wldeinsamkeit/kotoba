const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const lessonsPath = path.join(root, 'src/data/lessons.ts')
const outputPath = path.join(root, 'public/review-unlock-lessons.html')

const source = fs.readFileSync(lessonsPath, 'utf8')
const lessonIds = Array.from(
  source.matchAll(/^    id: '([^']+)',/gm),
  (match) => match[1],
)

if (lessonIds.length === 0) {
  throw new Error('No lesson ids found in src/data/lessons.ts')
}

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>课程检查解锁</title>
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
      h1 {
        margin: 0 0 12px;
        font-size: 28px;
      }
      p {
        color: #68645c;
        line-height: 1.7;
      }
      a {
        color: #c96442;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>课程已临时全部通过</h1>
      <p id="status">正在写入本地学习进度...</p>
      <p><a href="/lessons">如果没有自动跳转，点这里回到课程列表</a></p>
    </main>
    <script>
      const lessonIds = ${JSON.stringify(lessonIds, null, 2)};
      const key = 'nihongo-daily-progress-v1';
      const current = JSON.parse(localStorage.getItem(key) || '{}');
      const completedLessonIds = Array.from(new Set([
        ...(Array.isArray(current.completedLessonIds) ? current.completedLessonIds : []),
        ...lessonIds,
      ]));
      const quizStats = { ...(current.quizStats || {}) };
      for (const id of lessonIds) {
        quizStats[id] = quizStats[id] || { correct: 3, total: 3 };
      }
      localStorage.setItem(key, JSON.stringify({
        ...current,
        completedLessonIds,
        quizStats,
      }));
      document.getElementById('status').textContent =
        '已写入 ' + lessonIds.length + ' 个课程通过记录，马上回到课程列表。';
      setTimeout(() => {
        location.replace('/lessons?review=unlocked');
      }, 700);
    </script>
  </body>
</html>
`

fs.writeFileSync(outputPath, html)
console.log(`Generated ${path.relative(root, outputPath)} for ${lessonIds.length} lessons.`)
console.log('Open /review-unlock-lessons.html on the same dev server origin.')
