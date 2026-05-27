const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const publicDir = path.join(rootDir, 'public')
const lessonsPath = path.join(rootDir, 'src/data/lessons.ts')
const sitemapPath = path.join(publicDir, 'sitemap.xml')
const robotsPath = path.join(publicDir, 'robots.txt')

const rawSiteUrl = process.env.SITE_URL || process.env.VITE_SITE_URL

if (!rawSiteUrl) {
  console.error('请提供正式域名，例如：SITE_URL=https://example.com npm run seo:sitemap')
  process.exit(1)
}

const siteUrl = rawSiteUrl.replace(/\/+$/, '')
const today = new Date().toISOString().slice(0, 10)
const lessonsSource = fs.readFileSync(lessonsPath, 'utf8')
const lessonIds = Array.from(
  new Set(
    Array.from(lessonsSource.matchAll(/^    id: '([^']+)',/gm)).map(
      (match) => match[1],
    ),
  ),
)

const staticRoutes = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/lessons', changefreq: 'weekly', priority: '0.9' },
  { path: '/lessons/words', changefreq: 'weekly', priority: '0.9' },
  { path: '/lessons/words/n5', changefreq: 'weekly', priority: '0.8' },
  { path: '/lessons/words/n4', changefreq: 'weekly', priority: '0.8' },
  { path: '/lessons/words/n3', changefreq: 'weekly', priority: '0.7' },
  { path: '/lessons/words/memory', changefreq: 'weekly', priority: '0.8' },
  { path: '/reading', changefreq: 'weekly', priority: '0.7' },
  { path: '/kana', changefreq: 'monthly', priority: '0.7' },
]

const lessonRoutes = lessonIds.map((lessonId) => ({
  path: `/lessons/${lessonId}`,
  changefreq: 'weekly',
  priority: '0.8',
}))

const routeEntries = [...staticRoutes, ...lessonRoutes]
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routeEntries}
</urlset>
`

fs.writeFileSync(sitemapPath, sitemap)

const currentRobots = fs.existsSync(robotsPath)
  ? fs.readFileSync(robotsPath, 'utf8')
  : 'User-agent: *\nAllow: /\n'
const robotsWithoutSitemap = currentRobots
  .split('\n')
  .filter((line) => !line.toLowerCase().startsWith('sitemap:'))
  .join('\n')
  .trim()
const robots = `${robotsWithoutSitemap}\nSitemap: ${siteUrl}/sitemap.xml\n`

fs.writeFileSync(robotsPath, robots)

console.log(`已生成 ${path.relative(rootDir, sitemapPath)}`)
console.log(`已更新 ${path.relative(rootDir, robotsPath)}`)
