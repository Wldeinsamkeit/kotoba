import type { LessonLevel, VocabItem } from '../types'

export type Chapter = {
  id: string
  title: string
  paragraphs: string[]
  /** 章节描述或简介 */
  description?: string
}

export type Book = {
  id: string
  title: string
  /** 书籍作者 */
  author?: string
  /** 书籍描述 */
  description?: string
  level: LessonLevel
  tags: string[]
  /** 总字数估算 */
  totalWords?: number
  /** 预计阅读时长（分钟） */
  estimatedReadTime?: number
  vocabulary: VocabItem[]
  chapters: Chapter[]
}

import kirawareNoYukiData from './kiraware-no-yuki.json'

export const books: Book[] = [
  kirawareNoYukiData as Book,
  {
    id: 'campus-mini',
    title: '校园小阅读',
    level: 'N5',
    tags: ['校园', '分段阅读'],
    vocabulary: [
      { word: 'おはよう', reading: 'おはよう', meaning: '早上好' },
      { word: '宿題', reading: 'しゅくだい', meaning: '作业' },
      { word: '終わった', reading: 'おわった', meaning: '已经做完了' },
      { word: '図書館', reading: 'としょかん', meaning: '图书馆' },
      { word: '借りる', reading: 'かりる', meaning: '借入/借用' },
      { word: '返却', reading: 'へんきゃく', meaning: '归还' },
      { word: '延長', reading: 'えんちょう', meaning: '续借/延长' },
      { word: '風邪', reading: 'かぜ', meaning: '感冒' },
      { word: 'ため', reading: 'ため', meaning: '因为…（原因）' },
      { word: '休む', reading: 'やすむ', meaning: '休息/缺席' },
      { word: '授業', reading: 'じゅぎょう', meaning: '上课/课程' },
    ],
    chapters: [
      {
        id: 'ch1-morning',
        title: '早晨的问候',
        paragraphs: [
          'おはよう。田中くん、昨日の宿題、やった？',
          'うん、終わったよ。でも、ちょっと難しかった。',
          '放課後、図書館で一緒に勉強しよう。いい？',
        ],
      },
      {
        id: 'ch2-library',
        title: '图书馆借书',
        paragraphs: [
          '図書館で本を借りるときは、何日までかを確認します。',
          '返却の前に、必要なら延長もできます。',
          'わからないときは、職員さんに聞いてください。',
        ],
      },
      {
        id: 'ch3-absence',
        title: '身体不舒服请假',
        paragraphs: [
          '風邪のため、今日、授業を休むことにします。',
          '先生、すみません。明日は元気になったら来ます。',
          'この連絡は、昨日から準備していました。',
        ],
      },
    ],
  },
]

export function getBook(bookId: string) {
  return books.find((b) => b.id === bookId)
}

export function getChapter(bookId: string, chapterId: string) {
  const book = getBook(bookId)
  return book?.chapters.find((c) => c.id === chapterId)
}

