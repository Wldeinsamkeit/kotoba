import type {
  DialogueLine,
  Lesson,
  SmartQuizQuestion,
  VocabItem,
} from '../types'
import { getLessonVocabulary } from './lessonVocabulary'

type SentenceDrill = {
  ja: string
  zh: string
  speaker: string
  sourceIndex: number
}

type GrammarPattern = {
  id: string
  label: string
  triggers: string[]
  meaning: string
  usage: string
  distractors: string[]
}

const WORD_QUESTION_EXCLUDES = new Set([
  'は',
  'が',
  'を',
  'に',
  'で',
  'と',
  'へ',
  'も',
  'の',
  'か',
  'ね',
  'よ',
  'です',
  'ます',
  'ました',
  'ません',
])

const GRAMMAR_PATTERNS: GrammarPattern[] = [
  {
    id: 'desu',
    label: '～です',
    triggers: ['です', '～です'],
    meaning: '礼貌地说明“是……”或描述状态。',
    usage: '接在名词或形容词后，用来做礼貌陈述或自我介绍。',
    distractors: ['表示正在进行的动作', '表示动作的先后顺序', '表示禁止对方做某事'],
  },
  {
    id: 'ka',
    label: '～か',
    triggers: ['か', 'ですか', 'ますか'],
    meaning: '放在句尾，把陈述句变成疑问句。',
    usage: '句末加「か」，用礼貌语气询问对方信息。',
    distractors: ['放在句首表示命令', '接在名词后表示所属关系', '表示动作已经完成'],
  },
  {
    id: 'kara-source',
    label: '～から',
    triggers: ['から'],
    meaning: '表示起点、来源，也可以表示原因。',
    usage: '接在地点、时间或原因后，说明“从哪里/从什么时候/因为……”',
    distractors: ['表示动作对象', '表示比较对象', '表示“和某人一起”'],
  },
  {
    id: 'te-kudasai',
    label: '～てください',
    triggers: ['てください', 'でください'],
    meaning: '礼貌地请求对方做某事。',
    usage: '动词て形后接「ください」，表示“请……”',
    distractors: ['表示自己想做某事', '表示过去发生的动作', '表示两个名词相等'],
  },
  {
    id: 'te-imasu',
    label: '～ています',
    triggers: ['ています', 'でいます'],
    meaning: '表示正在进行，或持续存在的状态。',
    usage: '动词て形后接「います」，说明“正在……”或“处于……”',
    distractors: ['表示强烈命令', '表示否定过去', '表示比较结果'],
  },
  {
    id: 'mashou',
    label: '～ましょう',
    triggers: ['ましょう'],
    meaning: '表示邀请、提议一起做某事。',
    usage: '接在动词ます形词干后，用来温和地说“一起……吧”。',
    distractors: ['表示对方不能做某事', '表示动作地点', '表示选择其中一个'],
  },
  {
    id: 'o-object',
    label: '～を',
    triggers: ['を'],
    meaning: '提示动作作用的对象。',
    usage: '放在名词后，说明这个名词是动作处理、学习、吃喝等的对象。',
    distractors: ['提示句子的主题', '表示动作起点', '表示“也”的追加'],
  },
  {
    id: 'ni-target',
    label: '～に',
    triggers: ['に'],
    meaning: '表示时间、地点、方向或动作对象。',
    usage: '接在时间、地点或对象后，说明动作落到哪里、何时或给谁。',
    distractors: ['表示从某处开始', '表示并列两个名词', '表示礼貌疑问句结尾'],
  },
  {
    id: 'de-place',
    label: '～で',
    triggers: ['で'],
    meaning: '表示动作发生地点、方式或工具。',
    usage: '接在地点或手段后，说明“在哪里做/用什么做”。',
    distractors: ['表示所属关系', '表示主语', '表示句末疑问'],
  },
  {
    id: 'to-with',
    label: '～と',
    triggers: ['と'],
    meaning: '表示“和、与”，也可引用说话内容。',
    usage: '接在名词或引用内容后，说明一起行动的人或引用的话。',
    distractors: ['表示动作对象', '表示动作终点', '表示否定'],
  },
]

/**
 * 基于每课核心对话句生成智能测试。
 * 设计原则：先给中文意思，再让用户主动还原日语句子。
 */
export class SmartQuizGenerator {
  private lesson: Lesson

  constructor(lesson: Lesson) {
    this.lesson = lesson
  }

  generateAllQuizzes(): SmartQuizQuestion[] {
    const drills = this.getSentenceDrills()
    if (drills.length === 0) return []
    const vocab = this.getQuizVocabulary()

    const quizzes: SmartQuizQuestion[] = [
      ...this.generateVocabSpellingQuizzes(vocab).slice(0, 4),
      ...this.generateGrammarQuizzes().slice(0, 4),
      ...this.generateSentenceOrderQuizzes(drills).slice(0, 4),
      ...this.generateSentenceFillQuizzes(drills).slice(0, 4),
    ]

    const fallback = [
      ...this.generateSentenceOrderQuizzes(drills),
      ...this.generateSentenceFillQuizzes(drills),
      ...this.generateVocabSpellingQuizzes(vocab),
    ]

    return this.dedupeById([...quizzes, ...fallback]).slice(0, 16)
  }

  private getSentenceDrills(): SentenceDrill[] {
    const drills: SentenceDrill[] = []
    this.getCoreSentences().forEach((line, sourceIndex) => {
      const jaUnits = this.splitJapaneseUnits(line.ja)
      const zhUnits = this.splitChineseUnits(line.zh)

      if (jaUnits.length > 1 && jaUnits.length === zhUnits.length) {
        jaUnits.forEach((ja, unitIndex) => {
          drills.push({
            ja,
            zh: zhUnits[unitIndex],
            speaker: line.speaker,
            sourceIndex,
          })
        })
        return
      }

      drills.push({
        ja: line.ja.trim(),
        zh: line.zh.trim(),
        speaker: line.speaker,
        sourceIndex,
      })
    })

    return drills.filter((drill) => this.stripJapanesePunctuation(drill.ja).length >= 3)
  }

  private getCoreSentences(): DialogueLine[] {
    return this.lesson.dialogue.filter((line) => line.ja.replace(/\s/g, '').length >= 4)
  }

  private getQuizVocabulary(): VocabItem[] {
    const dialogueText = this.lesson.dialogue.map((line) => line.ja).join(' ')
    return getLessonVocabulary(this.lesson)
      .filter((item) => {
        const word = this.stripJapanesePunctuation(item.word)
        if (!word || WORD_QUESTION_EXCLUDES.has(word)) return false
        if (word.length <= 1) return false
        return dialogueText.includes(item.word)
      })
      .slice(0, 10)
  }

  private generateVocabSpellingQuizzes(vocab: VocabItem[]): SmartQuizQuestion[] {
    return vocab.map((item, index) => ({
      id: `vocab-spelling-${this.slug(item.word)}-${index}`,
      type: 'vocab_spelling',
      question: '根据中文意思，写出对应的日语单词。',
      coreSentence: item.word,
      coreSentenceZh: item.meaning,
      options: [],
      correctAnswer: -1,
      acceptedAnswers: this.makeAcceptedVocabAnswers(item),
      targetWord: item.word,
      explanation: `${item.word}${item.reading ? `（${item.reading}）` : ''}：${item.meaning}`,
      knowledgePoint: `单词拼写：${item.meaning}`,
      difficulty: index < 4 ? 'easy' : 'medium',
    }))
  }

  private generateGrammarQuizzes(): SmartQuizQuestion[] {
    const source = [
      this.lesson.title,
      this.lesson.grammar,
      ...this.lesson.dialogue.map((line) => line.ja),
    ].join('\n')

    return GRAMMAR_PATTERNS
      .filter((pattern) => pattern.triggers.some((trigger) => source.includes(trigger)))
      .map((pattern, index) => {
        const example = this.findExampleForPattern(pattern)
        const { options, correctAnswer } = this.makeMultipleChoice(
          pattern.usage,
          pattern.distractors,
          `${pattern.id}-${this.lesson.id}`,
        )

        return {
          id: `grammar-${pattern.id}-${index}`,
          type: 'grammar',
          question: `「${pattern.label}」在本课中的语法作用是什么？`,
          coreSentence: example?.ja ?? pattern.label,
          coreSentenceZh: example
            ? `${example.zh}\n\n思考：这个句子里的「${pattern.label}」负责什么语法功能？`
            : `思考：什么时候使用「${pattern.label}」？`,
          options,
          correctAnswer,
          acceptedAnswers: [],
          explanation: `${pattern.label}：${pattern.meaning}\n${pattern.usage}${example ? `\n例句：${example.ja}` : ''}`,
          knowledgePoint: `语法运用：${pattern.label}`,
          difficulty: index < 2 ? 'medium' : 'hard',
        } satisfies SmartQuizQuestion
      })
  }

  private generateSentenceOrderQuizzes(drills: SentenceDrill[]): SmartQuizQuestion[] {
    return drills
      .map((drill, index) => {
        const orderedChunks = this.makeOrderChunks(drill.ja)
        const orderChunks = this.shuffleWithSeed(orderedChunks, `${drill.ja}-${index}`)

        return {
          id: `sentence-order-${drill.sourceIndex}-${index}`,
          type: 'sentence_order',
          question: '根据中文意思，按顺序点击词块拼出日语句子。',
          coreSentence: drill.ja,
          coreSentenceZh: drill.zh,
          orderChunks,
          options: [],
          correctAnswer: -1,
          acceptedAnswers: this.makeAcceptedSentenceAnswers(drill.ja),
          explanation: `中文：${drill.zh}\n日语：${drill.ja}`,
          knowledgePoint: `${drill.speaker}的句子排序`,
          difficulty: index < 5 ? 'easy' : 'medium',
        } satisfies SmartQuizQuestion
      })
      .filter((quiz) => (quiz.orderChunks?.length ?? 0) >= 2)
  }

  private generateSentenceFillQuizzes(drills: SentenceDrill[]): SmartQuizQuestion[] {
    return drills
      .filter((drill) => this.stripJapanesePunctuation(drill.ja).length >= 5)
      .map((drill, index): SmartQuizQuestion | null => {
        const blank = this.pickFillChunk(drill.ja)
        if (!blank) return null

        return {
          id: `sentence-fill-${drill.sourceIndex}-${index}`,
          type: 'sentence_fill',
          question: '根据中文意思，填入横线处缺失的日语。',
          coreSentence: drill.ja,
          coreSentenceZh: drill.zh,
          sentenceWithBlank: drill.ja.replace(blank, '____'),
          options: [],
          correctAnswer: -1,
          acceptedAnswers: this.makeAcceptedFillAnswers(blank),
          targetWord: blank,
          explanation: `完整句：${drill.ja}\n中文：${drill.zh}`,
          knowledgePoint: `句子填空：${blank}`,
          difficulty: 'hard',
        } satisfies SmartQuizQuestion
      })
      .filter((quiz): quiz is SmartQuizQuestion => Boolean(quiz))
  }

  private splitJapaneseUnits(sentence: string): string[] {
    return sentence
      .split(/[。！？!?]+/)
      .map((part) => part.trim())
      .filter(Boolean)
  }

  private splitChineseUnits(sentence: string): string[] {
    return sentence
      .split(/[。！？!?]+/)
      .map((part) => part.trim())
      .filter(Boolean)
  }

  private makeOrderChunks(sentence: string): string[] {
    const units = this.splitJapaneseUnits(sentence)
    const chunks = units.flatMap((unit) => this.splitJapanesePhrase(unit))
    if (chunks.length >= 2) return chunks

    const cleaned = this.stripJapanesePunctuation(sentence)
    return [cleaned]
  }

  private pickFillChunk(sentence: string): string | null {
    const fullSentence = this.stripJapanesePunctuation(sentence)
    const candidates = this.makeOrderChunks(sentence).filter((chunk) => {
      const cleaned = this.stripJapanesePunctuation(chunk)
      if (cleaned.length < 2) return false
      if (cleaned === fullSentence) return false
      return !WORD_QUESTION_EXCLUDES.has(cleaned)
    })
    if (candidates.length === 0) return null

    return candidates.find((chunk) => this.stripJapanesePunctuation(chunk).length >= 4)
      ?? candidates[candidates.length - 1]
  }

  private splitJapanesePhrase(phrase: string): string[] {
    const cleaned = this.stripJapanesePunctuation(phrase)
    const boundaries = [
      'てください',
      'お願いします',
      'はじめまして',
      'よろしく',
      'ませんか',
      'ましたか',
      'ましょう',
      'ています',
      'いました',
      'ください',
      'でした',
      'ですか',
      'ますか',
      'ました',
      'ません',
      'たいです',
      'いいです',
      'ですね',
      'ですよ',
      'さんは',
      'さんが',
      'さん',
      'くんは',
      'くんが',
      'くん',
      '先生',
      'です',
      'ます',
      'した',
      'から',
      'まで',
      'より',
      'には',
      'では',
      'とは',
      'を',
      'に',
      'で',
      'へ',
      'と',
      'は',
      'が',
      'も',
    ]

    const chunks: string[] = []
    let buffer = ''

    for (const char of cleaned) {
      buffer += char
      const shouldBreak = boundaries.some((boundary) => {
        if (!buffer.endsWith(boundary)) return false
        if (boundary.length === 1) {
          const remaining = cleaned.slice(buffer.length)
          if (/^す[ねよか]?/.test(remaining)) return false
          return buffer.length > boundary.length
        }
        return true
      })
      if (shouldBreak) {
        chunks.push(buffer)
        buffer = ''
      }
    }

    if (buffer) chunks.push(buffer)
    return this.mergeTinyChunks(chunks)
  }

  private mergeTinyChunks(chunks: string[]): string[] {
    const merged: string[] = []
    for (const chunk of chunks) {
      if (chunk.length <= 1 && merged.length > 0) {
        merged[merged.length - 1] += chunk
      } else {
        merged.push(chunk)
      }
    }
    return merged
  }

  private makeAcceptedSentenceAnswers(sentence: string): string[] {
    const stripped = this.stripJapanesePunctuation(sentence)
    return Array.from(new Set([sentence.trim(), stripped]))
  }

  private makeAcceptedFillAnswers(answer: string): string[] {
    return Array.from(new Set([
      answer.trim(),
      this.stripJapanesePunctuation(answer),
    ])).filter(Boolean)
  }

  private makeAcceptedVocabAnswers(item: VocabItem): string[] {
    return Array.from(new Set([
      item.word.trim(),
      item.reading?.trim(),
      this.stripJapanesePunctuation(item.word),
      item.reading ? this.stripJapanesePunctuation(item.reading) : undefined,
    ].filter((answer): answer is string => Boolean(answer))))
  }

  private makeMultipleChoice(
    correct: string,
    distractors: string[],
    seed: string,
  ): { options: string[]; correctAnswer: number } {
    const options = this.shuffleWithSeed([correct, ...distractors].slice(0, 4), seed)
    return { options, correctAnswer: options.indexOf(correct) }
  }

  private findExampleForPattern(pattern: GrammarPattern): SentenceDrill | undefined {
    const drills = this.getSentenceDrills()
    return drills.find((drill) =>
      pattern.triggers.some((trigger) => drill.ja.includes(trigger)),
    )
  }

  private slug(value: string): string {
    return Array.from(value)
      .map((char) => char.charCodeAt(0).toString(36))
      .join('-')
  }

  private stripJapanesePunctuation(sentence: string): string {
    return sentence
      .replace(/[。．、，！？!?]/g, '')
      .replace(/\s/g, '')
      .trim()
  }

  private dedupeById(quizzes: SmartQuizQuestion[]): SmartQuizQuestion[] {
    const seen = new Set<string>()
    return quizzes.filter((q) => {
      if (seen.has(q.id)) return false
      seen.add(q.id)
      return true
    })
  }

  private shuffleWithSeed<T>(array: T[], seed: string): T[] {
    const arr = [...array]
    let value = this.hashString(seed)
    for (let i = arr.length - 1; i > 0; i--) {
      value = (value * 1664525 + 1013904223) >>> 0
      const j = value % (i + 1)
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }

    if (arr.length > 1 && arr.every((item, index) => item === array[index])) {
      ;[arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]]
    }

    return arr
  }

  private hashString(value: string): number {
    let hash = 2166136261
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i)
      hash = Math.imul(hash, 16777619)
    }
    return hash >>> 0
  }
}

export function generateSmartQuizzes(lesson: Lesson): SmartQuizQuestion[] {
  return new SmartQuizGenerator(lesson).generateAllQuizzes()
}

export function getSmartQuizCount(lesson: Lesson): number {
  return generateSmartQuizzes(lesson).length
}
