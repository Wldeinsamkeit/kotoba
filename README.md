# 日语实用练习（MVP）

面向高中生的日常场景日语学习站：场景课、随堂测、错题本与本地进度（`localStorage`）。

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开终端里提示的本地地址（一般为 `http://localhost:5173`）。

## 构建

```bash
npm run build
npm run preview
```

## Vercel 发布

Vercel 项目配置：

- Framework Preset: `Vite`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

建议在 Vercel 环境变量里设置：

- `VITE_SITE_URL`: 正式站点域名，例如 `https://example.com`
- `VITE_ENABLE_SUPERTONIC`: 默认 `false`；如果后续把 Supertonic 模型放到 LFS/CDN，再改成 `true`
- `VITE_SUPABASE_URL`: Supabase Project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key

如果绑定了正式域名，发布前生成 sitemap：

```bash
SITE_URL=https://你的正式域名 npm run seo:sitemap
```

## 内容扩展

在 `src/data/lessons.ts` 中按 `Lesson` 类型追加课程即可。
