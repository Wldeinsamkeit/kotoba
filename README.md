# 日语实用练习（MVP）

面向高中生的日常场景日语学习站：场景课、随堂测、错题本与本地进度（`localStorage`）。

React + Vite 前端在 `src/`；单词记忆法正式数据在 `data/memory_methods/`；Capacitor 打包 iOS 见下文。

---

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

---

## 项目文档（Markdown）

### 工程协作与运行

| 文件 | 作用 |
|------|------|
| [`AGENTS.md`](AGENTS.md) | 多 AI 协作总纲：项目结构、源文件优先级、核心文件保护、CSS/iOS/记忆法规则、验证命令 |
| `README.md` | 本文件：运行、部署、代码链路、文档索引 |

### 单词记忆法（编写 / 审阅 / 数据）

| 文件 | 作用 |
|------|------|
| [`data/skill/日语所有单词记忆方法规则.md`](data/skill/日语所有单词记忆方法规则.md) | 核心规则：滚雪球机制、JSON 字段、融合记忆法、写作范围、覆盖写入、固定读音、同音对照表、各 Batch 沉淀示例 |
| [`data/skill/日语单词记忆方法流程图.md`](data/skill/日语单词记忆方法流程图.md) | 流程图：9 步工作流、决策树、五道质量关卡、JSON 字段说明、常见错误 |
| [`data/skill/修改规则.md`](data/skill/修改规则.md) | 用户批改前缀：`e` 替换、`p` 新增、`d` 删除、`c` 部分改 |
| [`src/content/jp-vocab-memory-system.md`](src/content/jp-vocab-memory-system.md) | 早期 AI 技能文档：A→C→B 框架、TYPE A/B 分类（与 rules 互补） |

### 单词关系图 / 链路图（数据说明）

| 文件 | 作用 |
|------|------|
| [`data/word_relations/all_relations_summary.md`](data/word_relations/all_relations_summary.md) | 全级别关系图统计（由脚本生成） |
| [`data/word_relations/n5_relations_summary.md`](data/word_relations/n5_relations_summary.md) | N5 关系图摘要 |
| [`data/word_relations/n4_relations_summary.md`](data/word_relations/n4_relations_summary.md) | N4 关系图摘要 |
| [`data/word_relations/n3_relations_summary.md`](data/word_relations/n3_relations_summary.md) | N3 关系图摘要 |
| [`data/word_relations/n2_relations_summary.md`](data/word_relations/n2_relations_summary.md) | N2 关系图摘要 |

实际图数据在 `data/word_relations/*.json`，上述 MD 为统计说明。

### iOS / 设计

| 文件 | 作用 |
|------|------|
| [`ios/App/CapApp-SPM/README.md`](ios/App/CapApp-SPM/README.md) | Capacitor SPM 依赖包（不要手改） |
| [`design/logo-generator/README.md`](design/logo-generator/README.md) | App Logo 方案与 SVG 资源 |

---

## Web 应用启动链路

```
index.html
    ↓
src/main.tsx              ← React 挂载、引入 index.css
    ↓
src/App.tsx               ← 路由、Intro 首屏、ProgressProvider
    ↓
src/components/Layout.tsx + src/pages/*
```

**`App.tsx` 要点：**

- 非 iOS 原生且首次访问 `/` → 显示 `Intro`（`sessionStorage` 控制）
- iOS 原生 App（`src/lib/platform.ts`）→ 跳过 Intro
- 主要路由：课程、假名、阅读、N5/N4/N3 词表、角色羁绊、进度、账户等

**核心入口文件：**

| 模块 | 路径 |
|------|------|
| 课程数据 | `src/data/lessons.ts`、`lessonDialogues.ts` |
| 小田故事线 | `src/lib/lessonStory.ts` |
| 课程记忆法匹配 | `src/lib/lessonMemory.ts` |
| 全局布局 / 样式 | `src/components/Layout.tsx`、`src/index.css` |

---

## iOS 更新链路（Capacitor）

```
改 src/ 或 Web 资源
    ↓
npm run build                 → 产出 dist/
    ↓
npm run ios:sync              → build + cap sync ios
    ↓
ios/App/App/public/           → 同步产物（不要日常手改）
    ↓
Xcode 打开 ios/App/App.xcodeproj 运行 / 打包
```

**配置：** [`capacitor.config.ts`](capacitor.config.ts)

- `appId`: `com.tiantian.nihongodaily`
- `appName`: `麻瓜日语`
- `webDir`: `dist`

**常用命令：**

```bash
npm run ios:sync    # 构建并同步到 iOS
npm run ios:open    # 用 Capacitor 打开 Xcode
```

正确 Xcode 工程是 **`ios/App/App.xcodeproj`**，不要把根目录其他实验工程当成网站 App。

---

## 记忆法数据链路

```
data/memory_methods/{n5|n4|n3}/batch_XX_methods.json   ← 正式源（批改确认后写入）
    ↓ merge
data/memory_methods/{level}/all_*_memory_methods.json   ← 汇总 JSON
    ↓ 运行时 import
src/data/memoryMethods.ts                               ← 读 JSON，映射 reviewTip 等
    ↓
src/data/n5MoatVocab.ts / n4MoatVocab.ts / n3MoatVocab.ts   ← 展示层（Auto-generated）
src/data/n5MemoryMethods.ts 等
    ↓
src/lib/lessonMemory.ts → 各词汇页面
```

**记忆法编写流程（详见 `data/skill/` 下 MD）：**

1. 读规则 + 流程图
2. `npm run memory:writing-scope -- --level n4 --batch 15` → 读 `data/word_relations/writing_scope/*`
3. 编 40 词 → 审阅（审阅阶段不改 JSON、对话不展示例句）
4. 用户说「可以覆盖」→ 写入 `batch_XX_methods.json` → 合并 all → 更新规则沉淀

**源文件优先级：** 正式批次以 `data/memory_methods/` 为准；`dist/`、`ios/App/App/public/` 是构建产物，不作为日常手改源。

---

## 单词关系图 / 链路图数据链路

```
词表源 data/word_relations/sources/*_vocab.json
    ↓
scripts/build_word_relations.cjs
    ↓
data/word_relations/all_relation_edges.json           ← 边列表
data/word_relations/all_word_relation_index.json      ← 按词索引
    ↓
scripts/build_writing_scope_relations.cjs             ← 过滤已编写词 → 本批可用关系
    ↓
data/word_relations/writing_scope/{level}_batch_{NN}_writing_relations.json
```

---

## 常用 npm 脚本

| 命令 | 作用 |
|------|------|
| `npm run dev` | 本地开发（Vite） |
| `npm run build` | TypeScript 检查 + 生产构建 |
| `npm run ios:sync` | 构建并同步到 iOS |
| `npm run ios:open` | 打开 Xcode |
| `npm run memory:writing-scope -- --level n4 --batch 15` | 生成本批写作范围关系 |
| `npm run memory:merge-n5` | 合并 N5 batch → `all_n5_memory_methods.json` |
| `npm run memory:merge-n4` | 合并 N4 batch → `all_n4_memory_methods.json` |
| `npm run lesson:check` | 课程检查 |
| `npm run seo:sitemap` | 生成 sitemap |

**记忆法生成脚本（初版批次）：**

- `scripts/build_n4_memory_methods.cjs`
- `scripts/build_n3_memory_methods.cjs`
- `scripts/merge_memory_batches.cjs`

---

## 读文档推荐顺序

**改 Web / iOS：** `AGENTS.md` → 本 README → 对应 `src/` 文件

**写 / 改记忆法：** `AGENTS.md` → `日语所有单词记忆方法规则.md` → `流程图.md` → `修改规则.md` → 当前 `batch_XX_methods.json`

**查关系图：** `all_relations_summary.md` → `data/word_relations/*.json` → 相关 `scripts/*.cjs`

**发 iOS：** Web 验证 → `npm run ios:sync` → Xcode `App.xcodeproj`

---

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

---

## 内容扩展

在 [`src/data/lessons.ts`](src/data/lessons.ts) 中按 `Lesson` 类型追加课程即可。
