/**
 * 临时解锁全部课程（仅写入浏览器 localStorage，不改源码逻辑）
 *
 * 用法：
 *   npm run lesson:unlock-all
 *   然后在本机 dev 服务器打开 http://localhost:5173/unlock-all-lessons.html
 *
 * 可选：node scripts/unlock_all_lessons.cjs --no-check-mode
 *       只写入通过记录，不开启「检查模式」
 */
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const lessonsPath = path.join(root, 'src/data/lessons.ts')
const outputPath = path.join(root, 'public/unlock-all-lessons.html')

const PROGRESS_KEY = 'nihongo-daily-progress-v1'
const CHECK_MODE_KEY = 'nihongo-lesson-check-mode'
const enableCheckMode = !process.argv.includes('--no-check-mode')

function extractLessonLifeOrder(text) {
  const match = text.match(/export const lessonLifeOrder = \[([\s\S]*?)\] as const/)
  if (!match) {
    throw new Error('export const lessonLifeOrder not found in src/data/lessons.ts')
  }
  return Array.from(match[1].matchAll(/'([^']+)'/g), (item) => item[1])
}

function extractAllLessonIds(text) {
  return Array.from(text.matchAll(/^    id: '([^']+)',/gm), (match) => match[1])
}

const source = fs.readFileSync(lessonsPath, 'utf8')
const lifeOrderIds = extractLessonLifeOrder(source)
const allIds = extractAllLessonIds(source)

const missingInLifeOrder = allIds.filter((id) => !lifeOrderIds.includes(id))
const missingInPool = lifeOrderIds.filter((id) => !allIds.includes(id))

if (missingInPool.length > 0) {
  throw new Error(
    `lessonLifeOrder 中有无效 id：${missingInPool.join(', ')}`,
  )
}

const lessonIds = [
  ...lifeOrderIds,
  ...missingInLifeOrder.filter((id) => !lifeOrderIds.includes(id)),
]

if (lessonIds.length === 0) {
  throw new Error('No lesson ids found')
}

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>临时解锁全部课程</title>
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
        width: min(560px, calc(100% - 48px));
        padding: 28px;
        border: 1px solid #e3ded2;
        border-radius: 18px;
        background: #fffdfa;
        box-shadow: 0 18px 50px #00000012;
      }
      h1 { margin: 0 0 8px; font-size: 28px; }
      .meta { color: #68645c; line-height: 1.7; margin: 0 0 16px; }
      #status {
        padding: 12px 14px;
        border-radius: 12px;
        background: #f0ebe0;
        color: #3f3b33;
        line-height: 1.6;
        margin-bottom: 16px;
      }
      .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
      button, a.btn {
        appearance: none;
        border: 0;
        border-radius: 999px;
        padding: 10px 16px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
      }
      button.primary, a.btn.primary { background: #c96442; color: #fff; }
      button.secondary, a.btn.secondary {
        background: #fff;
        color: #171713;
        border: 1px solid #e3ded2;
      }
      ul { margin: 0; padding-left: 18px; color: #68645c; line-height: 1.7; }
      code { background: #f0ebe0; padding: 2px 6px; border-radius: 6px; }
    </style>
  </head>
  <body>
    <main>
      <h1>临时解锁全部课程</h1>
      <p class="meta">共 ${lessonIds.length} 课。仅在当前浏览器写入 localStorage，刷新后生效。</p>
      <p id="status">点击下方按钮写入解锁记录。</p>
      <div class="actions">
        <button type="button" class="primary" id="unlock-btn">解锁全部课程</button>
        <button type="button" class="secondary" id="check-mode-btn">仅开启检查模式</button>
        <button type="button" class="secondary" id="reset-btn">清除解锁记录</button>
        <a class="btn secondary" href="/lessons">课程列表</a>
        <a class="btn secondary" href="/lesson-check">检查台</a>
      </div>
      <ul>
        <li>写入键：<code>${PROGRESS_KEY}</code></li>
        <li>检查模式键：<code>${CHECK_MODE_KEY}</code></li>
        <li>默认同时写入「全部通过」${enableCheckMode ? '并开启检查模式' : '（生成时关闭了检查模式）'}</li>
      </ul>
    </main>
    <script>
      const lessonIds = ${JSON.stringify(lessonIds, null, 2)};
      const progressKey = ${JSON.stringify(PROGRESS_KEY)};
      const checkModeKey = ${JSON.stringify(CHECK_MODE_KEY)};
      const defaultCheckMode = ${enableCheckMode ? 'true' : 'false'};
      const statusEl = document.getElementById('status');

      function readProgress() {
        try {
          return JSON.parse(localStorage.getItem(progressKey) || '{}');
        } catch {
          return {};
        }
      }

      function unlockAll(options = {}) {
        const withCheckMode = options.withCheckMode ?? defaultCheckMode;
        const current = readProgress();
        const completedLessonIds = Array.from(new Set([
          ...(Array.isArray(current.completedLessonIds) ? current.completedLessonIds : []),
          ...lessonIds,
        ]));
        const quizStats = { ...(current.quizStats || {}) };
        for (const id of lessonIds) {
          quizStats[id] = { correct: 3, total: 3 };
        }
        localStorage.setItem(progressKey, JSON.stringify({
          ...current,
          completedLessonIds,
          quizStats,
        }));
        if (withCheckMode) {
          localStorage.setItem(checkModeKey, '1');
        }
        window.dispatchEvent(new Event('nihongo-lesson-check-mode-change'));
        statusEl.textContent =
          '已解锁 ' + lessonIds.length + ' 课' +
          (withCheckMode ? '，并已开启检查模式。' : '。') +
          ' 可返回课程列表任意进入。';
      }

      function enableCheckModeOnly() {
        localStorage.setItem(checkModeKey, '1');
        window.dispatchEvent(new Event('nihongo-lesson-check-mode-change'));
        statusEl.textContent = '已开启检查模式：课程入口不再按顺序锁定（不清除原有进度）。';
      }

      function resetUnlock() {
        const current = readProgress();
        const completedLessonIds = (current.completedLessonIds || [])
          .filter((id) => !lessonIds.includes(id));
        const quizStats = { ...(current.quizStats || {}) };
        for (const id of lessonIds) {
          delete quizStats[id];
        }
        localStorage.setItem(progressKey, JSON.stringify({
          ...current,
          completedLessonIds,
          quizStats,
        }));
        localStorage.removeItem(checkModeKey);
        window.dispatchEvent(new Event('nihongo-lesson-check-mode-change'));
        statusEl.textContent = '已清除全部课程的临时通过记录，并关闭检查模式。';
      }

      document.getElementById('unlock-btn').addEventListener('click', () => unlockAll());
      document.getElementById('check-mode-btn').addEventListener('click', enableCheckModeOnly);
      document.getElementById('reset-btn').addEventListener('click', resetUnlock);

      if (new URLSearchParams(location.search).get('auto') === '1') {
        unlockAll();
        setTimeout(() => location.replace('/lessons?review=unlocked'), 700);
      }
    </script>
  </body>
</html>
`

fs.writeFileSync(outputPath, html)

console.log(`Generated ${path.relative(root, outputPath)}`)
console.log(`Lessons: ${lessonIds.length}`)
if (missingInLifeOrder.length > 0) {
  console.log(`Also unlocked ids outside life order: ${missingInLifeOrder.join(', ')}`)
}
console.log('')
console.log('Next steps:')
console.log('  1. npm run dev')
console.log('  2. open http://localhost:5173/unlock-all-lessons.html')
console.log('  3. click「解锁全部课程」')
console.log('')
console.log('Auto unlock + redirect:')
console.log('  http://localhost:5173/unlock-all-lessons.html?auto=1')
