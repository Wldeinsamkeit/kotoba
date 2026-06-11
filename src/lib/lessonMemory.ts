import { n3MoatVocab, n4MoatVocab, n5MoatVocab } from '../data/memoryMethods'
import type { MoatMemoryElement, MoatVocabEntry, VocabItem } from '../types'

export type LessonMemorySource = 'N5' | 'N4' | 'N3' | '课程补充' | '课程生成'

export type LessonMemory = {
  source: LessonMemorySource
  word: string
  reading: string
  meaning: string
  elements: MoatMemoryElement[]
  mergedScene: string
  reviewHint: string
  difficultyStars: 1 | 2 | 3
  matchedEntry?: MoatVocabEntry
}

const memoryEntries = [
  ...n5MoatVocab.map((entry) => ({ entry, source: 'N5' as const })),
  ...n4MoatVocab.map((entry) => ({ entry, source: 'N4' as const })),
  ...n3MoatVocab.map((entry) => ({ entry, source: 'N3' as const })),
]

const exactIndex = new Map<string, (typeof memoryEntries)[number]>()
const wordIndex = new Map<string, (typeof memoryEntries)[number]>()
const normalizedIndex = new Map<string, (typeof memoryEntries)[number]>()

function normalizeWord(value: string): string {
  return value
    .replace(/[～〜]/g, '')
    .replace(/[。、，,./・\s]/g, '')
    .trim()
}

function hasKanji(value: string): boolean {
  return /[\u4e00-\u9fff]/.test(value)
}

function isKanaOnly(value: string): boolean {
  return /^[ぁ-ゟ゠-ヿー]+$/.test(normalizeWord(value))
}

type CourseMemoryPreset = {
  reading: string
  elements: MoatMemoryElement[]
  mergedScene: string
  reviewHint: string
  difficultyStars?: 1 | 2 | 3
}

const courseMemoryPresets: Record<string, CourseMemoryPreset> = {
  は: {
    reading: 'は',
    elements: [
      { element: 'は', method: '语法记忆', bridgeC: '助词 は 在主题后面，读作 wa，不按普通假名读 ha。' },
      { element: '话题牌', method: '联想记忆', bridgeC: '把前面的词举成“今天要聊的主角牌”，后面都围绕它说。' },
    ],
    mergedScene: '小田自我介绍时把「小田」举到话题牌上：小田は…。这一句后面讲的都是“小田”这个主题。',
    reviewHint: 'は - 读作 wa - 把前面的词举成话题牌 - 主题助词。',
  },
  が: {
    reading: 'が',
    elements: [
      { element: 'が', method: '语法记忆', bridgeC: 'が 常把真正出现、真正发生动作的主语推到前台。' },
      { element: '主角登场', method: '联想记忆', bridgeC: '像剧情里“咔”一下聚光灯打到主角身上。' },
    ],
    mergedScene: '教室里大家都在说话，老师一说「小田が」，聚光灯马上打到小田身上：这就是主语登场。',
    reviewHint: 'が - 主角登场 - 聚光灯指向动作/状态的主语 - 主语助词。',
  },
  を: {
    reading: 'を',
    elements: [
      { element: 'を', method: '语法记忆', bridgeC: 'を 常放在被动作处理的对象后面。' },
      { element: '动作靶子', method: '联想记忆', bridgeC: '像给动作画一个靶心：本を読む，读的对象是书。' },
    ],
    mergedScene: '小田拿笔圈住「本を読む」里的本：读这个动作打中的靶子就是本。',
    reviewHint: 'を - 动作靶子 - 标出动作处理的对象 - 宾语/动作对象助词。',
  },
  に: {
    reading: 'に',
    elements: [
      { element: 'に', method: '语法记忆', bridgeC: 'に 常指向时间、地点、方向或动作对象。' },
      { element: '钉子', method: '谐音联想', bridgeC: 'に 像“钉”，把动作钉到某个点上。' },
    ],
    mergedScene: '小田把地图上的车站、时间表上的十点都用钉子钉住：駅に行く、十時に会う。',
    reviewHint: 'に - 像“钉” - 把动作钉到时间/地点/方向/对象 - に 的核心功能。',
  },
  で: {
    reading: 'で',
    elements: [
      { element: 'で', method: '语法记忆', bridgeC: 'で 常表示动作发生的场所、使用的工具或方式。' },
      { element: '舞台', method: '联想记忆', bridgeC: '动作要有舞台，也要有道具，で 就把舞台和道具标出来。' },
    ],
    mergedScene: '小田在图书馆写作业，用笔记本查单词：図書館で、ノートで，で 负责把场所和工具亮出来。',
    reviewHint: 'で - 动作舞台/工具 - 在哪里做、用什么做 - 场所/手段助词。',
  },
  と: {
    reading: 'と',
    elements: [
      { element: 'と', method: '语法记忆', bridgeC: 'と 表示“和”，也能把说的话、想法引用出来。' },
      { element: '牵手', method: '联想记忆', bridgeC: '两个词被 と 牵在一起，一起出场。' },
    ],
    mergedScene: '小田と田中一起去图书馆，と 像两个人中间牵着的一根线。',
    reviewHint: 'と - 牵手 - 把两个人/两个词连起来，也能引用说的话 - 和/与/引用。',
  },
  から: {
    reading: 'から',
    elements: [
      { element: 'から', method: '语法记忆', bridgeC: 'から 有两个高频方向：从某处开始；因为某个理由。' },
      { element: '起点箭头', method: '联想记忆', bridgeC: '像从起点拉出一支箭，也能从原因拉到结果。' },
    ],
    mergedScene: '小田说「中国から来ました」，箭头从中国射到东京；他说「初めてだから」，箭头从理由射到结果。',
    reviewHint: 'から - 起点箭头 - 从哪里来/因为这个理由 - 从…；因为…',
  },
  まで: {
    reading: 'まで',
    elements: [
      { element: 'まで', method: '语法记忆', bridgeC: 'まで 标出范围的终点：到这里为止。' },
      { element: '马到终点', method: '谐音联想', bridgeC: 'まで 像“马得”，马终于得到终点牌。' },
    ],
    mergedScene: '小田看浴场时间「七時から九時まで」，九点就是终点牌，过了就不能进。',
    reviewHint: 'まで - 终点牌 - 范围到这里为止 - 到…为止。',
  },
  より: {
    reading: 'より',
    elements: [
      { element: 'より', method: '对比记忆', bridgeC: '比较句里 より 把被比较的一方放出来。' },
      { element: '比较尺', method: '联想记忆', bridgeC: 'より 像拿尺子比高低，另一边更突出。' },
    ],
    mergedScene: '小田比较室内和室外时，より 像一把尺子，帮他量出「外のほうがいい」。',
    reviewHint: 'より - 比较尺 - 拿来和另一方比较 - 比…',
  },
  も: {
    reading: 'も',
    elements: [
      { element: 'も', method: '语法记忆', bridgeC: 'も 表示“也”，把另一个成员也拉进队伍。' },
      { element: '也加入', method: '联想记忆', bridgeC: '像有人举手说：我也来。' },
    ],
    mergedScene: '田中去图书馆，小田也举手加入：小田も行きます。',
    reviewHint: 'も - 我也加入 - 把同类对象一起拉进来 - 也。',
  },
  の: {
    reading: 'の',
    elements: [
      { element: 'の', method: '语法记忆', bridgeC: 'の 常表示所属或把前面的词拿来修饰后面的词。' },
      { element: '连接扣', method: '字形联想', bridgeC: 'の 像一个小圈扣，把两个词扣在一起。' },
    ],
    mergedScene: '小田把「日本」和「生活」用 の 这个小圈扣扣住：日本の生活。',
    reviewHint: 'の - 小圈扣 - 扣住所属/修饰关系 - 的、所属、连接。',
  },
  か: {
    reading: 'か',
    elements: [
      { element: 'か', method: '语法记忆', bridgeC: 'か 放在句尾，常把陈述句变成疑问句。' },
      { element: '问号开关', method: '联想记忆', bridgeC: '句尾一按 か，整句话就亮起问号。' },
    ],
    mergedScene: '小田说「行きます」是陈述；句尾加 か 变成「行きますか」，问号灯立刻亮起来。',
    reviewHint: 'か - 问号开关 - 放句尾让句子变疑问 - 疑问句结尾。',
  },
  ね: {
    reading: 'ね',
    elements: [
      { element: 'ね', method: '语气记忆', bridgeC: 'ね 常用于确认、共鸣，像中文“对吧/呢”。' },
      { element: '点头', method: '联想记忆', bridgeC: '说完 ね，就像看着对方等一个点头。' },
    ],
    mergedScene: '田中说「いいですね」，说完看着小田等他点头：一起确认“不错吧”。',
    reviewHint: 'ね - 等对方点头 - 确认、共鸣语气 - 呢/对吧。',
  },
  よ: {
    reading: 'よ',
    elements: [
      { element: 'よ', method: '语气记忆', bridgeC: 'よ 常用于提醒、强调，把信息推给对方。' },
      { element: '提示牌', method: '联想记忆', bridgeC: '像举起一块提示牌：这个信息你要知道。' },
    ],
    mergedScene: '小师提醒小田「大丈夫だよ」，よ 像把安心提示牌推到小田面前。',
    reviewHint: 'よ - 提示牌 - 把信息强调给对方 - 提示/强调语气。',
  },
  です: {
    reading: 'です',
    elements: [
      { element: 'です', method: '语法记忆', bridgeC: 'です 是礼貌判断句尾，给“是…”这句话穿上礼貌外套。' },
      { element: '礼貌外套', method: '联想记忆', bridgeC: '裸句子后面加 です，就像上课前穿好校服。' },
    ],
    mergedScene: '小田说「留学生です」，です 像一件礼貌外套，让自我介绍听起来稳稳当当。',
    reviewHint: 'です - 礼貌外套 - 放在名词/形容词后面礼貌判断 - 是…',
  },
  ます: {
    reading: 'ます',
    elements: [
      { element: 'ます', method: '语法记忆', bridgeC: 'ます 是礼貌动词结尾，让动作表达更客气。' },
      { element: '动作礼貌化', method: '联想记忆', bridgeC: '动词穿上 ます，就从随口说变成课堂礼貌表达。' },
    ],
    mergedScene: '小田把「行く」换成「行きます」，像给动作穿上礼貌校服。',
    reviewHint: 'ます - 动词礼貌校服 - 礼貌地说一个动作 - 礼貌动词结尾。',
  },
  ました: {
    reading: 'ました',
    elements: [
      { element: 'ました', method: '语法记忆', bridgeC: 'ました 是 ます 的过去式，表示礼貌地说“已经做了”。' },
      { element: '过去盖章', method: '联想记忆', bridgeC: '动作完成后盖上“已完成”的章。' },
    ],
    mergedScene: '小田说「来ました」时，像在入学表上盖了“已经来了”的章。',
    reviewHint: 'ました - 过去盖章 - 礼貌地表示动作已经发生 - 礼貌过去式。',
  },
  ません: {
    reading: 'ません',
    elements: [
      { element: 'ません', method: '语法记忆', bridgeC: 'ません 是 ます 的礼貌否定，表示不做/没有。' },
      { element: '礼貌刹车', method: '联想记忆', bridgeC: '想做的动作被礼貌地踩下刹车。' },
    ],
    mergedScene: '小田说「まだ慣れていません」，ません 像刹车，告诉别人“还没有习惯”。',
    reviewHint: 'ません - 礼貌刹车 - 礼貌地否定动作或状态 - 不…/没有…',
  },
  ください: {
    reading: 'ください',
    elements: [
      { element: 'ください', method: '固定表达', bridgeC: 'ください 是“请给我/请做”的高频请求表达。' },
      { element: '请求按钮', method: '联想记忆', bridgeC: '点一下请求按钮，请对方把东西或动作递过来。' },
    ],
    mergedScene: '小田在便利店说「これをください」，像按下请求按钮，请店员把东西递给他。',
    reviewHint: 'ください - 请求按钮 - 请给我/请做这个动作 - 请。',
  },
  はじめまして: {
    reading: 'はじめまして',
    elements: [
      { element: 'はじめ', method: '关联记忆', bridgeC: 'はじめ 表示开始/初次，和“开始组”放在一起记。' },
      { element: 'まして', method: '固定寒暄', bridgeC: '第一次见面时整块说 はじめまして。' },
    ],
    mergedScene: '小田第一次走进教室，见到田中时先说「はじめまして」：关系从这一句话开始。',
    reviewHint: 'はじめまして - はじめ=开始/初次 - 第一次见面关系开始 - 初次见面。',
  },
  よろしくお願いします: {
    reading: 'よろしくおねがいします',
    elements: [
      { element: 'よろしく', method: '固定表达', bridgeC: 'よろしく 是拜托对方以后多照顾的固定寒暄。' },
      { element: 'お願いします', method: '固定表达', bridgeC: 'お願いします 表示拜托/麻烦您，礼貌度更高。' },
    ],
    mergedScene: '小田自我介绍结束后，把“以后请照顾我”的请求郑重交给全班：よろしくお願いします。',
    reviewHint: 'よろしくお願いします - 固定寒暄 - 初次见面把未来关系交给对方照顾 - 请多关照。',
  },
  ありがとうございます: {
    reading: 'ありがとうございます',
    elements: [
      { element: 'ありがとう', method: '固定表达', bridgeC: 'ありがとう 是谢谢，ございます 让它更礼貌。' },
      { element: '感谢升级', method: '联想记忆', bridgeC: '普通感谢穿上正式外套，变成课堂和店里都能用的谢谢。' },
    ],
    mergedScene: '小田被别人帮忙后，不只说ありがとう，而是认真鞠躬说ありがとうございます。',
    reviewHint: 'ありがとうございます - ありがとう + 礼貌外套 - 更礼貌地感谢 - 谢谢。',
  },
  すみません: {
    reading: 'すみません',
    elements: [
      { element: 'すみません', method: '固定表达', bridgeC: '既能道歉，也能搭话请求帮助，是日本生活开门句。' },
      { element: '打扰开关', method: '联想记忆', bridgeC: '开口前先轻轻按一下“打扰一下”的开关。' },
    ],
    mergedScene: '小田问路、借笔、买东西前都先说「すみません」，像给对方一个礼貌提醒。',
    reviewHint: 'すみません - 打扰开关 - 开口请求/道歉前先礼貌提示 - 不好意思。',
  },
  わかりました: {
    reading: 'わかりました',
    elements: [
      { element: 'わかる', method: '关联记忆', bridgeC: 'わかる 是明白，ました 是过去/完成的礼貌结尾。' },
      { element: '明白盖章', method: '联想记忆', bridgeC: '听懂说明后在脑子里盖上“明白了”的章。' },
    ],
    mergedScene: '老师讲完操作步骤，小田在脑子里盖章：わかりました，明白了。',
    reviewHint: 'わかりました - わかる + ました - 已经明白并礼貌回应 - 明白了。',
  },
  ある: {
    reading: 'ある',
    elements: [
      { element: 'ある', method: '语法记忆', bridgeC: 'ある 表示无生命事物“有/存在”，也可用于活动“会有/会举行”。' },
      { element: '有一件事', method: '联想记忆', bridgeC: '看见日程表上有一个活动，就说 コンサートがある。' },
    ],
    mergedScene: '学校公告栏上贴着演唱会海报，小田看到“有这件事发生”：コンサートがある。',
    reviewHint: 'ある - 有一件事存在 - 东西存在或活动会举行 - 有/举行。',
  },
  あります: {
    reading: 'あります',
    elements: [
      { element: 'ある', method: '语法记忆', bridgeC: 'ある 是“有/存在”。' },
      { element: 'ます', method: '礼貌结尾', bridgeC: 'ます 让表达变成礼貌形。' },
    ],
    mergedScene: '店员回答「あります」时，就是礼貌地告诉小田：有货。',
    reviewHint: 'あります - ある + ます - 礼貌地说“有” - 有。',
  },
  ありますか: {
    reading: 'ありますか',
    elements: [
      { element: 'あります', method: '语法记忆', bridgeC: 'あります 是礼貌地说“有”。' },
      { element: 'か', method: '疑问结尾', bridgeC: '句尾加 か，变成“有吗？”' },
    ],
    mergedScene: '小田在店里找护身符，句尾按下问号开关：お守りはありますか。',
    reviewHint: 'ありますか - あります + か - 礼貌询问有没有 - 有吗？',
  },
  ありません: {
    reading: 'ありません',
    elements: [
      { element: 'ある', method: '语法记忆', bridgeC: 'ある 是有/存在。' },
      { element: 'ません', method: '礼貌否定', bridgeC: 'ません 像礼貌刹车，表示没有。' },
    ],
    mergedScene: '药店店员摇摇头，说「ありません」，像给“有”踩下刹车：没有。',
    reviewHint: 'ありません - ある + ません - 礼貌否定“有” - 没有。',
  },
  なるほど: {
    reading: 'なるほど',
    elements: [
      { element: 'なるほど', method: '固定表达', bridgeC: '听懂解释后说 なるほど，表示“原来如此”。' },
      { element: '脑中灯亮', method: '联想记忆', bridgeC: '一听懂操作步骤，脑袋里的灯突然亮起来。' },
    ],
    mergedScene: '老师讲完复印机步骤，小田脑袋里灯一亮：なるほど，原来是这样。',
    reviewHint: 'なるほど - 脑中灯亮 - 听懂解释后的反应 - 原来如此。',
  },
  どうやって: {
    reading: 'どうやって',
    elements: [
      { element: 'どう', method: '固定疑问', bridgeC: 'どう 问“怎么样/如何”。' },
      { element: 'やって', method: '动作方式', bridgeC: 'やって 来自动作“做”，合起来问“怎么做”。' },
    ],
    mergedScene: '小田站在复印机前不会操作，只能问：どうやって？到底怎么做？',
    reviewHint: 'どうやって - どう=如何 + やって=做 - 问做法 - 怎么/如何。',
  },
  どうですか: {
    reading: 'どうですか',
    elements: [
      { element: 'どう', method: '固定疑问', bridgeC: 'どう 问状态或意见：怎么样。' },
      { element: 'ですか', method: '礼貌疑问', bridgeC: 'です 加 か，礼貌地询问。' },
    ],
    mergedScene: '田中提出周六见面，问小田「土曜日はどうですか」：这个方案怎么样？',
    reviewHint: 'どうですか - どう + 礼貌疑问 - 问对方觉得怎么样 - 怎么样？',
  },
  どうぞ: {
    reading: 'どうぞ',
    elements: [
      { element: 'どうぞ', method: '固定表达', bridgeC: '让对方先做、请对方拿、请对方进入时都可用。' },
      { element: '让路手势', method: '联想记忆', bridgeC: '像侧身伸手让对方先走。' },
    ],
    mergedScene: '前台要护照，小田递过去说「はい、どうぞ」，手势就是“请”。',
    reviewHint: 'どうぞ - 让路/递出手势 - 请对方做或拿 - 请。',
  },
  どういたしまして: {
    reading: 'どういたしまして',
    elements: [
      { element: 'どういたしまして', method: '固定寒暄', bridgeC: '别人道谢后整块回答，表示“不客气”。' },
      { element: '把感谢推回去', method: '联想记忆', bridgeC: '像轻轻把感谢推回去：不用谢。' },
    ],
    mergedScene: '路人帮小田指完路，小田道谢，对方摆摆手：どういたしまして。',
    reviewHint: 'どういたしまして - 固定回应 - 别人说谢谢后回答 - 不客气。',
  },
  お願いします: {
    reading: 'おねがいします',
    elements: [
      { element: '願い', method: '汉字直觉', bridgeC: '願い 有愿望、请求的意思。' },
      { element: 'します', method: '固定礼貌', bridgeC: '整块表达“拜托/麻烦您”。' },
    ],
    mergedScene: '小田把请求认真递给对方：お願いします，麻烦您了。',
    reviewHint: 'お願いします - 願い=请求 + 礼貌表达 - 把事情拜托给对方 - 拜托/麻烦。',
  },
  よろしく: {
    reading: 'よろしく',
    elements: [
      { element: 'よろしく', method: '固定表达', bridgeC: 'よろしく 是よろしくお願いします的口语简略版。' },
      { element: '关系交给你', method: '联想记忆', bridgeC: '把以后相处这件事交给对方照顾。' },
    ],
    mergedScene: '田中熟悉一点后不说完整长句，只说「よろしく」，意思仍是请多关照。',
    reviewHint: 'よろしく - 简略寒暄 - 把未来关系交给对方照顾 - 请多关照。',
  },
  円: {
    reading: 'えん',
    elements: [
      { element: '円', method: '汉字直觉', bridgeC: '价格场景里 円 是日元单位，不按“圆形/圆周”理解。' },
      { element: 'えん', method: '固定读音', bridgeC: '看到价格数字后面的 円，读作 えん。' },
    ],
    mergedScene: '店员说「三千円です」，小田脑中立刻把 円 当成钱包里的日元单位。',
    reviewHint: '円 - 价格单位 + 固定读音 えん - 钱包里的日元 - 日元。',
  },
  入れます: {
    reading: 'はいれます',
    elements: [
      { element: '入る', method: '语法记忆', bridgeC: '这里来自 入る 的可能形，表示能进入、能排进班。' },
      { element: 'ます', method: '礼貌结尾', bridgeC: '面试时用礼貌形回答店长。' },
    ],
    mergedScene: '店长问一周能来几次班，小田把自己的周末时间排进班表：週末なら入れます。',
    reviewHint: '入れます - 入る的可能礼貌形 - 能排进班表/能上班 - 能来上班。',
  },
  受付: {
    reading: 'うけつけ',
    elements: [
      { element: '受', method: '汉字直觉', bridgeC: '受 表示接收、受理。' },
      { element: '付', method: '汉字直觉', bridgeC: '付 有交付、附上的感觉，合起来就是接待/受理窗口。' },
    ],
    mergedScene: '小田到酒店前台，把护照交给工作人员；对方接收并受理，这个窗口就是受付。',
    reviewHint: '受付 - 受=接收 + 付=交付 - 接收并处理事务的地方 - 前台/接待处。',
  },
}

function key(word: string, reading?: string): string {
  return `${normalizeWord(word)}|${normalizeWord(reading ?? '')}`
}

for (const item of memoryEntries) {
  const word = normalizeWord(item.entry.word)
  const reading = normalizeWord(item.entry.reading)
  const exactKey = key(item.entry.word, item.entry.reading)
  if (!exactIndex.has(exactKey)) exactIndex.set(exactKey, item)
  if (!wordIndex.has(word)) wordIndex.set(word, item)
  if (reading && !normalizedIndex.has(reading)) normalizedIndex.set(reading, item)
}

function getCourseMemoryOverride(vocab: VocabItem): LessonMemory | null {
  const preset = courseMemoryPresets[normalizeWord(vocab.word)]
  if (!preset) return null

  return {
    source: '课程补充',
    word: vocab.word,
    reading: vocab.reading || preset.reading,
    meaning: vocab.meaning,
    elements: preset.elements,
    mergedScene: preset.mergedScene,
    reviewHint: preset.reviewHint,
    difficultyStars: preset.difficultyStars ?? 1,
  }
}

function isGrammarLike(vocab: VocabItem): boolean {
  const word = normalizeWord(vocab.word)
  return (
    Boolean(courseMemoryPresets[word]) ||
    /^[～〜]/.test(vocab.word) ||
    /提示|表示|礼貌|疑问|语气|判断|助词|结尾|过去式|否定式|请求|邀请|提议|说明情况|原因|比较|对象|方向|起点|来源/.test(vocab.meaning)
  )
}

function shouldUseReadingFallback(vocab: VocabItem): boolean {
  if (!vocab.reading) return false
  if (isGrammarLike(vocab)) return false
  if (isKanaOnly(vocab.word)) return false
  return true
}

function buildFallbackMemory(vocab: VocabItem): LessonMemory {
  const reading = vocab.reading || vocab.word
  const grammarLike = isGrammarLike(vocab)
  const wordHasKanji = hasKanji(vocab.word)
  const elements: MoatMemoryElement[] = grammarLike
    ? [
        {
          element: vocab.word,
          method: '语法记忆',
          bridgeC: `${vocab.word} 是本课句子里的功能零件，重点看它在句中负责“${vocab.meaning}”。`,
        },
        {
          element: reading,
          method: '课堂语境',
          bridgeC: `把 ${reading} 放回本课原句多读几遍，用语法功能锁定意思。`,
        },
      ]
    : wordHasKanji
    ? [
        {
          element: vocab.word,
          method: 'TYPE A1',
          bridgeC: `${vocab.word} 含汉字，先用汉字直觉绑定核心意思“${vocab.meaning}”。`,
        },
        {
          element: reading,
          method: 'TYPE B2',
          bridgeC: `${reading} 先按课堂原句多读几遍，再把读音钉到“${vocab.meaning}”这个场景上。`,
        },
      ]
    : [
        {
          element: reading,
          method: 'TYPE B2',
          bridgeC: `${reading} 先整块听读，再和本课对话里的“${vocab.meaning}”场景绑定。`,
        },
      ]

  return {
    source: '课程生成',
    word: vocab.word,
    reading,
    meaning: vocab.meaning,
    elements,
    mergedScene: `在本课对话里遇到「${vocab.word}」时，先读作 ${reading}，再把它和“${vocab.meaning}”这个具体课堂场景绑定起来。`,
    reviewHint: `${reading} - 课堂语境绑定 - 在本单元中表示“${vocab.meaning}”。`,
    difficultyStars: wordHasKanji ? 2 : 1,
  }
}

export function getLessonMemory(vocab: VocabItem): LessonMemory {
  const courseOverride = getCourseMemoryOverride(vocab)
  if (courseOverride) return courseOverride

  const exact = exactIndex.get(key(vocab.word, vocab.reading))
  const word = wordIndex.get(normalizeWord(vocab.word))
  const reading = shouldUseReadingFallback(vocab) && vocab.reading
    ? normalizedIndex.get(normalizeWord(vocab.reading ?? ''))
    : undefined
  const hit = exact ?? word ?? reading

  if (!hit) return buildFallbackMemory(vocab)

  return {
    source: hit.source,
    word: hit.entry.word,
    reading: hit.entry.reading,
    meaning: hit.entry.meaning,
    elements: hit.entry.elements,
    mergedScene: hit.entry.mergedScene,
    reviewHint: hit.entry.reviewHint,
    difficultyStars: hit.entry.difficultyStars,
    matchedEntry: hit.entry,
  }
}
