export type LessonLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | '高考日语'

export type DictEntry = {
  word: string
  reading: string
  meanings: string[]
  source?: string  // 词典来源
  partOfSpeech?: string  // 词性
  example?: string  // 例句
}

export type Dictionary = {
  id: string
  name: string
  description?: string
  language?: string  // 'ja', 'zh', 'en' 等
  entries: DictEntry[]
  isEnabled: boolean
  priority: number  // 优先级，数字越小优先级越高
}

export type QuizQuestion = {
  id: string
  prompt: string
  /** 题干里可附带一句日语，用「」标出 */
  jaHint?: string
  options: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
}

/** 智能测试题型：从中文意思反推日语输出 */
export type SmartQuizType =
  | 'vocab_meaning'
  | 'vocab_spelling'
  | 'grammar'
  | 'sentence_order'
  | 'sentence_fill'
  | 'sentence_spelling'

export type SmartQuizQuestion = {
  id: string
  type: SmartQuizType
  question: string
  /** 本课核心句（完整日文） */
  coreSentence: string
  coreSentenceZh?: string
  /** 挖空后的日文句子（拼写题） */
  sentenceWithBlank?: string
  /** 句子排序题：可点击的日语词块 */
  orderChunks?: string[]
  /** 被考查的词 */
  targetWord?: string
  /** 选择题选项；拼写题为空 */
  options: string[]
  /** 选择题正确索引 */
  correctAnswer: number
  /** 拼写题：可接受的日文答案 */
  acceptedAnswers?: string[]
  explanation: string
  knowledgePoint?: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export type DialogueChoice = {
  text: string
  textZh: string
  affinityChange: Record<string, number>
}

export type DialogueLine = {
  speaker: string
  ja: string
  zh: string
  choices?: DialogueChoice[]
}

export type VocabItem = {
  word: string
  reading?: string
  meaning: string
}

/** 课程词卡背包：按词性分类，供羁绊系统与后续造句玩法使用 */
export type WordCardCategory = 'phrase' | 'noun' | 'verb' | 'adjective' | 'particle'

export type CollectedWordCard = {
  id: string
  word: string
  reading: string
  meaning: string
  category: WordCardCategory
  lessonId: string
  lessonTitle: string
  collectedAt: string
}

/** 高考单词护城河：单条记忆档案里的元素拆分 */
export type MoatMemoryElement = {
  element: string
  method: string
  bridgeC: string
}

/** 高考单词护城河：带记忆法的词条（后续逐词扩充） */
export type MoatVocabEntry = {
  id: string
  word: string
  reading: string
  meaning: string
  elements: MoatMemoryElement[]
  mergedScene: string
  sceneQuality: string
  reviewHint: string
  confusionNote?: string
  relatedWords?: { word: string; reading: string; meaning: string; note: string }[]
  difficultyStars: 1 | 2 | 3
}

export type Lesson = {
  id: string
  title: string
  level: LessonLevel
  tags: string[]
  scenario: string
  dialogue: DialogueLine[]
  vocabulary: VocabItem[]
  grammar: string
  examTip: string
  quizzes: QuizQuestion[]
}

export type CharacterAffinity = {
  points: number
  level: number
  interactions: number
  lastInteraction: string
}

export type StoredProgress = {
  completedLessonIds: string[]
  /** lessonId -> 错题 questionId 列表 */
  wrongByLesson: Record<string, string[]>
  /** chapterId 列表（阅读模块不影响错题/学习进度的核心逻辑） */
  completedChapterIds: string[]
  /** chapterId -> 当前位置（例如段落索引） */
  lastReadByChapter: Record<string, { lastParagraphIndex: number }>
  lastActiveDate: string | null
  streak: number
  /** lessonId -> 最近一次测验统计 */
  quizStats: Record<string, { correct: number; total: number }>
  /** 阅读时间追踪 (YYYY-MM-DD -> 分钟数) */
  readingTimeByDate: Record<string, number>
  /** 每日阅读目标（分钟） */
  dailyReadingGoal: number
  /** 书签 (chapterId -> 段落索引) */
  bookmarks: Record<string, number>
  /** 生词本 (word -> {reading, meaning, context, bookId, chapterId, addedAt}) */
  vocabularyBook: Record<string, {
    reading: string
    meaning: string
    context?: string
    bookId: string
    chapterId: string
    addedAt: string
  }>
  /** 经验值系统 */
  totalXP: number
  level: number
  /** 成就系统 */
  unlockedAchievements: string[]
  /** 每日任务完成情况 (YYYY-MM-DD -> 任务ID列表) */
  completedDailyTasks: Record<string, string[]>
  /** 角色好感度 */
  characterAffinity: Record<string, CharacterAffinity>
  /** 课程词卡背包（lessonId::word -> 卡牌） */
  collectedWordCards: Record<string, CollectedWordCard>
}
