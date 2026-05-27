# 日语学习网站多 AI 协作准则

任何 AI 在读取、生成、修改、删除本项目文件之前，必须先完整读取本文件。  
开始工作时先明确说明“已读 `AGENTS.md`”，再按任务读取相关源文件和规则文件；如果没有读到本文件，不要修改项目。

## 项目概览

- 这是一个 React + Vite 的日语学习 MVP，前端源码在 `src/`。
- 课程主入口在 `src/pages/LessonsPage.tsx` 和 `src/pages/LessonPage.tsx`。
- 课程原始数据在 `src/data/lessons.ts`，对话覆盖在 `src/data/lessonDialogues.ts`，小田故事线在 `src/lib/lessonStory.ts`。
- 全局布局和导航在 `src/components/Layout.tsx`，主要页面样式集中在 `src/index.css`。
- 单词记忆法正式数据主要在 `data/memory_methods/`，记忆法核心规则在 `data/skill/日语所有单词记忆方法规则.md`。
- `资源汇总/` 是词表、PDF、音频等参考资源；`tmp/` 多为 OCR 或处理中间产物。
- Capacitor Web 包从 `dist/` 同步到 iOS，配置见 `capacitor.config.ts`。

## 修改前必读

所有任务先读：

1. 本文件 `AGENTS.md`。
2. 用户当前需求直接涉及的源文件。
3. `git status --short` 的当前结果，确认工作区是否已有其他 AI 或用户改动。

词汇、批次、记忆方法任务还必须读：

1. `data/skill/日语所有单词记忆方法规则.md`。
2. 用户在逐批批改时，再读 `data/skill/修改规则.md`。
3. 当前批次 JSON 及相邻已确认批次，先复用已经确认的记忆规律。

课程、对话、故事线任务优先读：

1. `src/data/lessons.ts`。
2. `src/data/lessonDialogues.ts`。
3. `src/lib/lessonStory.ts`。
4. 对应页面文件，如 `src/pages/LessonPage.tsx`、`src/pages/LessonsPage.tsx`。

页面布局、导航、样式任务优先读：

1. 目标组件源码。
2. `src/components/Layout.tsx`。
3. `src/index.css` 中目标选择器的现状。

## 源文件优先级

先确认“源文件”再改，不要把生成结果当源头。

- Web 源码以 `src/` 为准。
- 正式记忆方法批次以 `data/memory_methods/` 为准；不要因为 `data/batches/` 或旧草稿同名就覆盖正式批次。
- N4 记忆法词表来源、批次和生成说明遵守 `data/skill/日语所有单词记忆方法规则.md` 与 `scripts/build_n4_memory_methods.cjs`。
- `src/data/n5MoatVocab.ts`、`src/data/n4MoatVocab.ts` 文件头标明为生成或汇总展示数据；修改词汇记忆法前先追溯对应 `data/memory_methods/` 与生成脚本。
- `dist/`、`ios/App/App/public/` 是构建或同步产物，不作为日常手改源文件。
- `src/index.css.bak`、`src/index.css.backup`、构建产物 CSS 都不是默认恢复源；只有在明确做故障恢复并说明依据时才能参考。

## 核心文件保护

以下文件和目录被多个功能共享，修改前必须先读，修改时必须保持范围小：

- `src/index.css`
- `src/components/Layout.tsx`
- `src/App.tsx`
- `src/data/lessons.ts`
- `src/data/lessonDialogues.ts`
- `src/lib/lessonStory.ts`
- `src/lib/lessonMemory.ts`
- `src/data/n5MoatVocab.ts`
- `src/data/n4MoatVocab.ts`
- `data/skill/日语所有单词记忆方法规则.md`
- `data/skill/修改规则.md`
- `data/memory_methods/`
- `scripts/build_n4_memory_methods.cjs`
- `scripts/build_n3_memory_methods.cjs`

对这些文件执行小任务时，不允许无解释地整文件覆盖、整文件回退、批量重排或全量格式化。

## 多 AI 协作守则

1. 工作区可能已有用户或其他 AI 的修改。不要回退、覆盖、清理自己没有做的改动。
2. 如果目标文件在工作中发生变化，先重新读取它，再在当前版本上继续工作。
3. 一个小需求只改相关模块和相关选择器；不要顺手重构无关页面、数据或路由。
4. 对核心文件尽量一次只让一个 AI 修改。要并行时按模块分工，不要让多个 AI 同时改 `src/index.css`、课程数据或记忆法规则文件。
5. 风险较高的修改前，先向用户建议保存一个 Git checkpoint；没有用户要求时不要擅自提交。
6. 不使用破坏性 Git 操作去“恢复页面”，除非用户明确要求并已说明会丢掉哪些改动。

## CSS 与页面布局特别规则

本项目曾出现“组件仍是新版本，但 `src/index.css` 被旧样式整份覆盖”导致页面整体变样的问题。以后必须避免：

1. 小的 UI 需求只编辑目标 CSS 选择器，不整份替换 `src/index.css`。
2. 不要把旧备份 CSS、`dist` CSS 或 iOS 同步 CSS 直接当日常源码覆盖回来。
3. 修改组件 className 时，同步检查 CSS 是否存在对应选择器；修改 CSS 时，确认目标 class 仍被组件使用。
4. 若小 UI 需求导致 CSS 改动成百上千行，先停下说明原因，再继续。
5. 前端变更后，除了构建，还要在目标路由做可见页面验证，重点检查首屏、导航、弹层、移动端断点和控制台错误。

## 词汇记忆法特别规则

1. `data/skill/日语所有单词记忆方法规则.md` 是本平台记忆法核心文件，词汇任务必须服从它。
2. 用户批改过一组后，不只改该词条，还要复盘新规律并更新核心记忆规则。
3. 未经确认的新批次优先放草稿目录；正式批次不删词、不乱换顺序、不随意改 JSON 字段。
4. 记忆法优先保留用户给出的谐音、拆分、故事、固定读音和易混词对比。
5. 修改正式批次前先确认编号、词表来源和展示数据链路，避免把 N5、N4、N3 批次互相覆盖。

## iOS 与生成产物

1. Web 改动先在本地 Web 页面验证。
2. 需要 iOS 模拟器看到 Web 最新内容时，再运行 `npm run ios:sync`。
3. 正确 Capacitor Xcode 工程是 `ios/App/App.xcodeproj`；不要把根目录下其他实验性 Xcode 工程当成网站 App。
4. 除非任务就是修 iOS 工程文件，否则不要手改 `ios/App/App/public/` 里的同步资源。

## 命令、编辑与验证

- 如果需要运行命令，先告诉用户要运行的准确命令和原因。
- 搜索文件和文本优先使用 `rg`、`rg --files`。
- 手工修改文件用补丁式编辑；不要为小改动整文件重写。
- 当修改可能影响构建时，先跑最快相关检查。前端默认先跑：

```bash
npm run build
```

- 视觉或交互修改需要在目标页面验证；本地开发页通常是 `http://localhost:5173`。
- 构建通过不等于页面正确；布局类问题必须补可见页面检查。

## 输出要求

- 默认用中文说明。
- 代码改动回执必须包含：简短总结、验证结果、文件变更列表。
- 调试回执必须包含：假设、实验、最小修复。
- 只在意图不明显时添加代码注释，不写空注释。

