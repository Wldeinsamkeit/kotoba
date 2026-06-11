import type { VocabItem, WordCardCategory } from '../types'

const GRAMMAR_TOKENS = new Set([
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
  'から',
  'まで',
  'より',
  '～です',
])

export const WORD_CARD_CATEGORY_ORDER: WordCardCategory[] = [
  'phrase',
  'noun',
  'verb',
  'adjective',
  'particle',
]

export const WORD_CARD_CATEGORY_LABELS: Record<
  WordCardCategory,
  { title: string; hint: string }
> = {
  phrase: { title: '表达', hint: '寒暄、固定搭配和可直接使用的短语' },
  noun: { title: '名词', hint: '人物、身份、地点和场景名词' },
  verb: { title: '动词', hint: '对话里发生的动作与状态变化' },
  adjective: { title: '形容·副词', hint: '描述感受、程度和方式' },
  particle: { title: '助词·语法', hint: '助词、礼貌结尾和语法碎片' },
}

export function getWordCardCategory(vocab: VocabItem): WordCardCategory {
  const word = vocab.word
  const meaning = vocab.meaning

  if (
    /初次见面|请多关照|一起加油|当然|谢谢|不好意思|没关系|明白|固定|口语/.test(meaning)
  ) {
    return 'phrase'
  }
  if (/来|学习|正在|做|说|住|习惯|见面|帮助|休息|使用|到达|加油/.test(meaning)) {
    return 'verb'
  }
  if (/姓|中国|日本|东京|教室|图书馆|学生|留学生|老师|地点|时间|哪里|几点/.test(meaning)) {
    return 'noun'
  }
  if (
    GRAMMAR_TOKENS.has(word) ||
    /提示|表示|礼貌|疑问|语气|判断|主题|主语|对象|所属|连接|过去式|结尾/.test(meaning)
  ) {
    return 'particle'
  }
  return 'adjective'
}

export function getLessonVocabGroupId(vocab: VocabItem): string {
  const category = getWordCardCategory(vocab)
  if (category === 'phrase') return 'core-phrases'
  if (category === 'noun') return 'people-places'
  if (category === 'verb') return 'actions'
  if (category === 'particle') return 'grammar-particles'
  return 'descriptors'
}
