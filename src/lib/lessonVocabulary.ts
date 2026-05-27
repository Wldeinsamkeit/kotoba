import type { Lesson, VocabItem } from '../types'

const dialogueLexicon: VocabItem[] = [
  { word: 'は', reading: 'は', meaning: '提示主题：…是/关于…' },
  { word: 'が', reading: 'が', meaning: '提示主语、对象或转折' },
  { word: 'を', reading: 'を', meaning: '提示动作对象' },
  { word: 'に', reading: 'に', meaning: '表示时间、地点、方向或对象' },
  { word: 'で', reading: 'で', meaning: '表示地点、方式、手段' },
  { word: 'と', reading: 'と', meaning: '和、与；引用内容' },
  { word: 'から', reading: 'から', meaning: '从…；因为…' },
  { word: 'まで', reading: 'まで', meaning: '到…为止' },
  { word: 'より', reading: 'より', meaning: '比…' },
  { word: 'も', reading: 'も', meaning: '也；连…都' },
  { word: 'です', reading: 'です', meaning: '是…（礼貌判断）' },
  { word: 'ます', reading: 'ます', meaning: '礼貌动词结尾' },
  { word: 'ました', reading: 'ました', meaning: '礼貌过去式' },
  { word: 'ません', reading: 'ません', meaning: '礼貌否定式' },
  { word: 'か', reading: 'か', meaning: '疑问句结尾' },
  { word: 'ね', reading: 'ね', meaning: '确认、共鸣语气' },
  { word: 'よ', reading: 'よ', meaning: '提示、强调语气' },
  { word: 'の', reading: 'の', meaning: '所属、修饰、名词连接' },
  { word: 'はじめまして', reading: 'はじめまして', meaning: '初次见面' },
  { word: '小田', reading: 'おだ', meaning: '小田（姓）' },
  { word: '田中', reading: 'たなか', meaning: '田中（姓）' },
  { word: '中国', reading: 'ちゅうごく', meaning: '中国' },
  { word: '来ました', reading: 'きました', meaning: '来了、来自（来る的过去礼貌形）' },
  { word: '来る', reading: 'くる', meaning: '来' },
  { word: '留学生', reading: 'りゅうがくせい', meaning: '留学生' },
  { word: '日本語', reading: 'にほんご', meaning: '日语' },
  { word: '勉強', reading: 'べんきょう', meaning: '学习' },
  { word: 'しています', reading: 'しています', meaning: '正在做…' },
  { word: 'いい', reading: 'いい', meaning: '好、可以' },
  { word: '一緒に', reading: 'いっしょに', meaning: '一起' },
  { word: '頑張りましょう', reading: 'がんばりましょう', meaning: '一起加油吧' },
  { word: 'よろしくお願いします', reading: 'よろしくおねがいします', meaning: '请多关照' },
  { word: 'どちら', reading: 'どちら', meaning: '哪里、哪位（礼貌）' },
  { word: '今', reading: 'いま', meaning: '现在' },
  { word: '東京', reading: 'とうきょう', meaning: '东京' },
  { word: '住んでいます', reading: 'すんでいます', meaning: '住在…' },
  { word: 'そうですか', reading: 'そうですか', meaning: '这样啊、是吗' },
  { word: '日本', reading: 'にほん', meaning: '日本' },
  { word: '生活', reading: 'せいかつ', meaning: '生活' },
  { word: 'どう', reading: 'どう', meaning: '怎么样、如何' },
  { word: 'まだ', reading: 'まだ', meaning: '还、仍然' },
  { word: '慣れていません', reading: 'なれていません', meaning: '还没习惯' },
  { word: '慣れる', reading: 'なれる', meaning: '习惯' },
  { word: '楽しい', reading: 'たのしい', meaning: '开心、有意思' },
  { word: 'じゃあ', reading: 'じゃあ', meaning: '那么、那就' },
  { word: '昼休み', reading: 'ひるやすみ', meaning: '午休' },
  { word: '教室', reading: 'きょうしつ', meaning: '教室' },
  { word: '前', reading: 'まえ', meaning: '前面、之前' },
  { word: '会おう', reading: 'あおう', meaning: '见面吧' },
  { word: '会う', reading: 'あう', meaning: '见面' },
  { word: 'すみません', reading: 'すみません', meaning: '不好意思、对不起' },
  { word: 'もう一度', reading: 'もういちど', meaning: '再一次' },
  { word: 'ゆっくり', reading: 'ゆっくり', meaning: '慢慢地' },
  { word: '話してください', reading: 'はなしてください', meaning: '请说' },
  { word: '話す', reading: 'はなす', meaning: '说话' },
  { word: 'もちろん', reading: 'もちろん', meaning: '当然' },
  { word: 'ありがとうございます', reading: 'ありがとうございます', meaning: '谢谢' },
  { word: '助かります', reading: 'たすかります', meaning: '帮大忙了' },
  { word: 'この', reading: 'この', meaning: '这个…' },
  { word: 'その', reading: 'その', meaning: '那个…' },
  { word: 'これ', reading: 'これ', meaning: '这个' },
  { word: 'それ', reading: 'それ', meaning: '那个' },
  { word: 'ここ', reading: 'ここ', meaning: '这里' },
  { word: 'どこ', reading: 'どこ', meaning: '哪里' },
  { word: '何', reading: 'なん', meaning: '什么' },
  { word: '何時', reading: 'なんじ', meaning: '几点' },
  { word: 'ください', reading: 'ください', meaning: '请给我、请做…' },
  { word: '大丈夫', reading: 'だいじょうぶ', meaning: '没关系、没问题' },
  { word: 'わかりました', reading: 'わかりました', meaning: '明白了' },
]

export function getLessonVocabulary(lesson: Lesson | undefined): VocabItem[] {
  if (!lesson) return []
  const dialogueText = lesson.dialogue.map((line) => line.ja).join(' ')
  const merged = new Map<string, VocabItem>()

  lesson.vocabulary.forEach((item) => {
    if (item.word) merged.set(item.word, item)
  })

  dialogueLexicon.forEach((item) => {
    if (dialogueText.includes(item.word) && !merged.has(item.word)) {
      merged.set(item.word, item)
    }
  })

  return [...merged.values()].sort((a, b) => {
    const aInDialogue = dialogueText.includes(a.word) ? 0 : 1
    const bInDialogue = dialogueText.includes(b.word) ? 0 : 1
    if (aInDialogue !== bInDialogue) return aInDialogue - bInDialogue
    return b.word.length - a.word.length
  })
}
