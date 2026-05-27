import type { MoatVocabEntry } from '../types'

/**
 * 高考日语单词（护城河模块）——逐条与马哈鱼大人共建。
 * 当前为示例 + 占位结构，测验会从本列表抽题。
 */
export const gaokaoMoatVocab: MoatVocabEntry[] = [
  {
    id: 'wasureru',
    word: '忘れる',
    reading: 'わすれる',
    meaning: '忘记',
    elements: [
      {
        element: 'わす',
        method: 'B2 谐音故事',
        bridgeC: '「瓦肆」（古代歌舞娱乐场所）',
      },
      {
        element: '忘',
        method: 'B5 语义象形',
        bridgeC: '汉字「忘」字义直接表示遗忘',
      },
      {
        element: 'れる',
        method: '语法',
        bridgeC: '动词活用助词，无需额外联想',
      },
    ],
    mergedScene:
      '去勾栏瓦肆看戏，节目精彩到完全忘我——散场后才发现手机、钱包全忘在座位上了。「忘」字刻在门口牌子上，提醒你别遗忘。',
    sceneQuality: '具体化 ✓ · 情绪化 ✓ · 个性化可替换「瓦肆」为亲身经历地点',
    reviewHint: '重走「瓦肆看戏忘东西」这条路径即可激活记忆',
    confusionNote: '与「忘れた」（过去式）场景不同：前者是动词原形表遗忘行为。',
    relatedWords: [
      {
        word: '忘れ物',
        reading: 'わすれもの',
        meaning: '遗失物',
        note: '忘れる 的名词形式',
      },
      {
        word: '覚える',
        reading: 'おぼえる',
        meaning: '记住',
        note: '反义词，可成对复习',
      },
    ],
    difficultyStars: 2,
  },
  {
    id: 'shinpai',
    word: '心配',
    reading: 'しんぱい',
    meaning: '担心',
    elements: [
      {
        element: '心',
        method: 'A1 单字音读',
        bridgeC: '心（しん）',
      },
      {
        element: '配',
        method: 'A3 浊音便',
        bridgeC: '配（はい）在复合词中浊化为ぱい → しんぱい',
      },
    ],
    mergedScene:
      '心里装着分配出去的任务清单，怕哪一环掉链子——那种悬着的感觉就是「心配」。',
    sceneQuality: '具体化 ✓ · 情绪化 ✓',
    reviewHint: '先想「心=しん」，再想「配」浊化成ぱい',
    relatedWords: [
      {
        word: '安心',
        reading: 'あんしん',
        meaning: '放心',
        note: '反义情绪对照记',
      },
    ],
    difficultyStars: 2,
  },
  {
    id: 'warui',
    word: '悪い',
    reading: 'わるい',
    meaning: '坏的；不好',
    elements: [
      {
        element: 'わる',
        method: 'B2 谐音故事',
        bridgeC: '「挖路」——路被挖得坑坑洼洼',
      },
      {
        element: '悪',
        method: 'B5 语义象形',
        bridgeC: '汉字「悪」= 坏，直接透明',
      },
      {
        element: 'い',
        method: '语法',
        bridgeC: '形容词词尾',
      },
    ],
    mergedScene:
      '这条路质量真（悪）坏：挖了又填、填了又挖，像「わるい」路况一样糟。',
    sceneQuality: '具体化 ✓ · 谐音 + 汉字双重锁定',
    reviewHint: '「挖路」路况坏 + 汉字悪',
    confusionNote: '口语里常作轻微道歉「すみません、悪い」= 不好意思。',
    difficultyStars: 1,
  },
]
