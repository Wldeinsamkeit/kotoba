export type CharacterPalette =
  | 'oda'
  | 'zhen'
  | 'shi'
  | 'zhang'
  | 'teacher'
  | 'town'
  | 'neutral'

export type CharacterEmotion = 'neutral' | 'happy' | 'thinking' | 'encouraging' | 'surprised' | 'worried'

export const AFFINITY_GREETINGS: Record<string, Record<number, string[]>> = {
  'xiao-zhen-loose': {
    5: ['今天也要加油哦~', '学习辛苦了，记得休息。'],
    8: ['又见面了，好想你。', '今天学得怎么样？说给我听听。'],
  },
  'xiao-zhen-tied': {
    5: ['今天也要加油哦~', '学习辛苦了，记得休息。'],
    8: ['又见面了，好想你。', '今天学得怎么样？说给我听听。'],
  },
  'xiao-shi': {
    5: ['走，一起去学习！', '今天有什么新单词？教教我。'],
    8: ['好久不见！你日语越来越好了。', '下次考试一起加油啊！'],
  },
  'xiao-zhang': {
    5: ['又在学日语？不错的毅力。', '有什么不懂的可以问我。'],
    8: ['你这学习劲头，我服了。', '要不要一起看动漫练听力？'],
  },
  'tanaka': {
    5: ['小田さん、今日も頑張ろう！', '日本語、上手になってるね。'],
    8: ['小田さんとはいい友達だね。', '一緒に勉強できて嬉しいよ。'],
  },
  'teacher': {
    5: ['很好，继续保持。', '你的进步很明显。'],
    8: ['你是我最努力的学生之一。', '有你在课堂上，气氛都变好了。'],
  },
}

export type CharacterProfile = {
  id: string
  name: string
  displayName: string
  role: string
  relationship: string
  profile: string
  unlockLessonId?: string
  unlockHint: string
  avatar?: string
  glyph: string
  palette: CharacterPalette
  aliases: string[]
  emotionIcons: Record<CharacterEmotion, string>
}

const characterProfiles: CharacterProfile[] = [
  {
    id: 'oda',
    name: '小田',
    displayName: '小田',
    role: '在日留学生',
    relationship: '主人公',
    profile: '刚到东京的年轻留学生。认真、容易紧张，但遇到问题会硬着头皮把日语说出去。',
    unlockHint: '故事一开始就同行',
    avatar: '/characters/oda-pixel-avatar-v1.png',
    glyph: '田',
    palette: 'oda',
    aliases: ['小田', '小田さん', '你'],
    emotionIcons: { neutral: '😐', happy: '😄', thinking: '🤔', encouraging: '💪', surprised: '😲', worried: '😟' },
  },
  {
    id: 'xiao-zhen-loose',
    name: '小真',
    displayName: '小真 · 散发',
    role: '书店偶遇的读书同伴',
    relationship: '和小田都喜欢读书，后来慢慢变成异地恋女友',
    profile: '小田在东京书店偶遇的女孩。两个人都喜欢读书，从同一本书开始聊起来，后来成了小田最重要的远程支援。',
    unlockLessonId: 'library-books',
    unlockHint: '在书店偶遇后解锁',
    avatar: '/characters/xiao-zhen-loose-pixel-v1.png',
    glyph: '真',
    palette: 'zhen',
    aliases: ['小真', '真真', '小真（散发）'],
    emotionIcons: { neutral: '😊', happy: '🥰', thinking: '💭', encouraging: '💕', surprised: '😳', worried: '🥺' },
  },
  {
    id: 'xiao-zhen-tied',
    name: '小真',
    displayName: '小真 · 扎发',
    role: '异地恋女友',
    relationship: '日常生活版形象',
    profile: '视频通话里更生活化的小真形象。扎起头发时通常在认真做自己的事，却还是会惦记小田。',
    unlockLessonId: 'post-office-package',
    unlockHint: '寄出第一份礼物后解锁',
    avatar: '/characters/xiao-zhen-tied-pixel-v1.png',
    glyph: '真',
    palette: 'zhen',
    aliases: ['小真（扎发）', '扎发小真'],
    emotionIcons: { neutral: '😊', happy: '🥰', thinking: '💭', encouraging: '💕', surprised: '😳', worried: '🥺' },
  },
  {
    id: 'xiao-shi',
    name: '小师',
    displayName: '小师',
    role: '不同班好朋友',
    relationship: '小田在学校认识的同伴',
    profile: '不同班但总能碰上的好朋友。外向、行动派，负责把小田从“只敢想”推到“真的开口”。',
    unlockLessonId: 'language-school-registration',
    unlockHint: '来语言学校报到时解锁',
    avatar: '/characters/xiao-shi-pixel-v1.png',
    glyph: '师',
    palette: 'shi',
    aliases: ['小师', '小师师'],
    emotionIcons: { neutral: '😎', happy: '😆', thinking: '🧐', encouraging: '👊', surprised: '😮', worried: '😅' },
  },
  {
    id: 'xiao-zhang',
    name: '小张',
    displayName: '小张',
    role: '室友',
    relationship: '看透世俗的宅男室友',
    profile: '宿舍里的现实主义吐槽役。看起来佛系，其实懂很多生活规则，关键时刻很可靠。',
    unlockLessonId: 'laundry-machine-how-to-use',
    unlockHint: '进入宿舍生活线后解锁',
    avatar: '/characters/xiao-zhang-pixel-v1.png',
    glyph: '张',
    palette: 'zhang',
    aliases: ['小张'],
    emotionIcons: { neutral: '😑', happy: '😏', thinking: '🤓', encouraging: '👍', surprised: '😮', worried: '😬' },
  },
  {
    id: 'tanaka',
    name: '田中',
    displayName: '田中',
    role: '语言学校同学',
    relationship: '东京新生活的第一个本地朋友',
    profile: '小田在语言学校认识的同学，会把课本句子拉回真实生活。',
    unlockHint: '完成第一课后解锁',
    glyph: '友',
    palette: 'neutral',
    aliases: ['田中', '田中くん'],
    emotionIcons: { neutral: '😊', happy: '😄', thinking: '🤔', encouraging: '💪', surprised: '😮', worried: '😅' },
  },
  {
    id: 'teacher',
    name: '老师',
    displayName: '老师',
    role: '课堂引导者',
    relationship: '帮助小田拆解日语规则',
    profile: '语言学校老师，负责把小田的每次卡壳变成可练习的表达。',
    unlockHint: '课堂剧情中出现',
    glyph: '先',
    palette: 'teacher',
    aliases: ['山本先生', '先生', '老师'],
    emotionIcons: { neutral: '🙂', happy: '😊', thinking: '🧐', encouraging: '👏', surprised: '😮', worried: '😟' },
  },
  {
    id: 'shop',
    name: '店员',
    displayName: '店员',
    role: '生活场景 NPC',
    relationship: '便利店、餐厅和商店里的关键对话对象',
    profile: '城市里的各种生活角色，是小田把日语真正用出去的关卡。',
    unlockHint: '进入城市探索后出现',
    glyph: '店',
    palette: 'town',
    aliases: [
      '佐藤店员',
      '店员',
      '工作人员',
      '车站员',
      '路人',
      '旁边同学',
      '图书馆职员',
      '旅馆工作人员',
      '高桥邻居',
      '邮局职员',
      '配送客服',
      '前台',
      '理发师',
      '店长',
    ],
    emotionIcons: { neutral: '🙂', happy: '😊', thinking: '🤔', encouraging: '👍', surprised: '😮', worried: '😅' },
  },
]

export function getCoreCharacterRoster(): CharacterProfile[] {
  return characterProfiles.slice(0, 5)
}

export function getCharacterProfile(speaker: string): CharacterProfile {
  const exactProfile = characterProfiles.find((character) =>
    [character.name, character.displayName, ...character.aliases].some((alias) => speaker === alias),
  )

  if (exactProfile) return exactProfile

  const profile = characterProfiles.find((character) =>
    character.aliases.some((alias) => speaker.includes(alias)),
  )

  if (profile) return profile

  return {
    id: 'guest',
    name: speaker,
    displayName: speaker,
    role: '临时登场人物',
    relationship: '本集生活场景里的对话对象',
    profile: '临时登场的生活场景角色。',
    unlockHint: '在对应剧情中出现',
    glyph: speaker.slice(0, 1) || '人',
    palette: 'neutral',
    aliases: [speaker],
    emotionIcons: { neutral: '🙂', happy: '😊', thinking: '🤔', encouraging: '👍', surprised: '😮', worried: '😅' },
  }
}
