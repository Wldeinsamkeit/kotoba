/**
 * 假名学习数据 - 平假名和片假名
 */

export type KanaType = 'hiragana' | 'katakana'

export type KanaCharacter = {
  /** 假名字符 */
  character: string
  /** 罗马音 */
  romaji: string
  /** 发音描述 */
  pronunciation: string
  /** 书写笔画数 */
  strokes: number
  /** 书写技巧 */
  writingTip: string
  /** 记忆技巧 */
  memoryTip: string
  /** 示例单词 */
  exampleWord?: {
    word: string
    reading: string
    meaning: string
  }
}

export type KanaGroup = {
  /** 分组名称 (如: 清音、浊音、拗音等) */
  name: string
  /** 描述 */
  description: string
  /** 假名列表 */
  kana: KanaCharacter[]
}

// 平假名 - 清音 (あ行)
export const hiraganaBasicGroups: KanaGroup[] = [
  {
    name: 'あ行 (元音)',
    description: '日语的基础元音，相当于中文的韵母',
    kana: [
      {
        character: 'あ',
        romaji: 'a',
        pronunciation: '啊',
        strokes: 3,
        writingTip: '先写一点，再写一横，最后写下面的汉字"安"的下半部分',
        memoryTip: '联想"啊"的张嘴形状，像"あ"的形状',
        exampleWord: { word: 'あい', reading: 'ai', meaning: '爱' }
      },
      {
        character: 'い',
        romaji: 'i',
        pronunciation: '衣',
        strokes: 2,
        writingTip: '先写左边的短竖，再写右边"以"的简化版',
        memoryTip: '像"衣"的部首，两点像衣服的扣子',
        exampleWord: { word: 'いえ', reading: 'ie', meaning: '家' }
      },
      {
        character: 'う',
        romaji: 'u',
        pronunciation: '乌',
        strokes: 2,
        writingTip: '先写左边的点，再写右边的部分，类似"宇"的上部',
        memoryTip: '发音像"乌"，形状像鸟窝',
        exampleWord: { word: 'うえ', reading: 'ue', meaning: '上面' }
      },
      {
        character: 'え',
        romaji: 'e',
        pronunciation: '诶',
        strokes: 2,
        writingTip: '类似汉字"元"的右边，或者"工"字加一笔',
        memoryTip: '发音像英语"E"，形状像汉字"元"',
        exampleWord: { word: 'えんぴつ', reading: 'enpitsu', meaning: '铅笔' }
      },
      {
        character: 'お',
        romaji: 'o',
        pronunciation: '哦',
        strokes: 4,
        writingTip: '先写左边的点，再写右边的部分，类似"於"的简化',
        memoryTip: '像"哦"的张嘴圆形，里面有东西',
        exampleWord: { word: 'おかあさん', reading: 'okaasan', meaning: '妈妈' }
      }
    ]
  },
  {
    name: 'か行 (k行)',
    description: '由k与五个元音组合而成',
    kana: [
      {
        character: 'か',
        romaji: 'ka',
        pronunciation: '卡',
        strokes: 3,
        writingTip: '类似汉字"加"的左上部分',
        memoryTip: '发音"卡"，左边部分看起来像力（加点）',
        exampleWord: { word: 'かさ', reading: 'kasa', meaning: '伞' }
      },
      {
        character: 'き',
        romaji: 'ki',
        pronunciation: 'ki',
        strokes: 4,
        writingTip: '上面的点很重要，下面是类似"ke"的部分',
        memoryTip: '记住"ki"上面的那个小点！像个人戴帽子',
        exampleWord: { word: 'き', reading: 'ki', meaning: '树' }
      },
      {
        character: 'く',
        romaji: 'ku',
        pronunciation: '库',
        strokes: 2,
        writingTip: '先写左边的点，再写右边的部分',
        memoryTip: '像"8"或"∞"的一半，发音"库"',
        exampleWord: { word: 'くも', reading: 'kumo', meaning: '云' }
      },
      {
        character: 'け',
        romaji: 'ke',
        pronunciation: 'ke',
        strokes: 3,
        writingTip: '像汉字"计"的右边，注意起笔',
        memoryTip: '想象"ke"这个音，形状像钥匙',
        exampleWord: { word: 'けいたい', reading: 'keitai', meaning: '手机' }
      },
      {
        character: 'こ',
        romaji: 'ko',
        pronunciation: 'ko',
        strokes: 2,
        writingTip: '两笔，先左后右',
        memoryTip: '两个"こ"组成"ここ"（这里）',
        exampleWord: { word: 'ここ', reading: 'koko', meaning: '这里' }
      }
    ]
  },
  {
    name: 'さ行 (s行)',
    description: '由s与五个元音组合而成',
    kana: [
      {
        character: 'さ',
        romaji: 'sa',
        pronunciation: '撒',
        strokes: 3,
        writingTip: '上面类似"才"的上部，下面类似"散"的左下',
        memoryTip: '"sa"联想"撒"，上面是人，下面是散开的东西',
        exampleWord: { word: 'さくら', reading: 'sakura', meaning: '樱花' }
      },
      {
        character: 'し',
        romaji: 'shi',
        pronunciation: 'xi',
        strokes: 1,
        writingTip: '一笔写完，类似汉字"之"',
        memoryTip: '"shi"是最简单的假名之一，像微笑的嘴',
        exampleWord: { word: 'しごと', reading: 'shigoto', meaning: '工作' }
      },
      {
        character: 'す',
        romaji: 'su',
        pronunciation: 'si',
        strokes: 2,
        writingTip: '先写横线，再写下面部分',
        memoryTip: '"su"像一个人蹲着，注意那个弯',
        exampleWord: { word: 'すし', reading: 'sushi', meaning: '寿司' }
      },
      {
        character: 'せ',
        romaji: 'se',
        pronunciation: 'sei',
        strokes: 3,
        writingTip: '左边三点水，右边类似"世"',
        memoryTip: '"se"像"世"字，发音也像',
        exampleWord: { word: 'せんせい', reading: 'sensei', meaning: '老师' }
      },
      {
        character: 'そ',
        romaji: 'so',
        pronunciation: 'so',
        strokes: 2,
        writingTip: '先写左边的点，再写右边',
        memoryTip: '"so"像"曾"字的上半部分',
        exampleWord: { word: 'そこ', reading: 'soko', meaning: '那里' }
      }
    ]
  },
  {
    name: 'た行 (t行)',
    description: '由t与五个元音组合而成',
    kana: [
      {
        character: 'た',
        romaji: 'ta',
        pronunciation: 'ta',
        strokes: 4,
        writingTip: '类似汉字"太"的简化',
        memoryTip: '"ta"像"太"字，发音也像',
        exampleWord: { word: 'たなか', reading: 'tanaka', meaning: '田中（姓氏）' }
      },
      {
        character: 'ち',
        romaji: 'chi',
        pronunciation: 'qi',
        strokes: 2,
        writingTip: '上面一横，下面类似"千"',
        memoryTip: '"chi"记住发音是"qi"不是"ti"！',
        exampleWord: { word: 'ちち', reading: 'chichi', meaning: '父亲' }
      },
      {
        character: 'つ',
        romaji: 'tsu',
        pronunciation: 'ci',
        strokes: 2,
        writingTip: '类似汉字"川"但中间不连',
        memoryTip: '"tsu"的发音很难，注意它是促音符号！',
        exampleWord: { word: 'つくえ', reading: 'tsukue', meaning: '桌子' }
      },
      {
        character: 'て',
        romaji: 'te',
        pronunciation: 'te',
        strokes: 2,
        writingTip: '类似汉字"天"的上半部分',
        memoryTip: '"te"像"天"字上面，发音也像',
        exampleWord: { word: 'て', reading: 'te', meaning: '手' }
      },
      {
        character: 'と',
        romaji: 'to',
        pronunciation: 'to',
        strokes: 2,
        writingTip: '类似"乜"或"と"的写法',
        memoryTip: '"to"像"t"加"o"的组合',
        exampleWord: { word: 'ともだち', reading: 'tomodachi', meaning: '朋友' }
      }
    ]
  },
  {
    name: 'な行 (n行)',
    description: '由n与五个元音组合而成',
    kana: [
      {
        character: 'な',
        romaji: 'na',
        pronunciation: 'na',
        strokes: 5,
        writingTip: '类似汉字"奈"的简化',
        memoryTip: '"na"像"奈"，去掉大',
        exampleWord: { word: 'なまえ', reading: 'namae', meaning: '名字' }
      },
      {
        character: 'に',
        romaji: 'ni',
        pronunciation: 'ni',
        strokes: 3,
        writingTip: '类似汉字"仁"的简化',
        memoryTip: '"ni"像"仁"或"二"',
        exampleWord: { word: 'にほん', reading: 'nihon', meaning: '日本' }
      },
      {
        character: 'ぬ',
        romaji: 'nu',
        pronunciation: 'nu',
        strokes: 2,
        writingTip: '上面类似"奴"的上部',
        memoryTip: '"nu"像"奴"字的上面，发音也像',
        exampleWord: { word: 'ぬの', reading: 'nuno', meaning: '布' }
      },
      {
        character: 'ね',
        romaji: 'ne',
        pronunciation: 'ne',
        strokes: 2,
        writingTip: '类似汉字"祢"的左边',
        memoryTip: '"ne"像"姐"的部首，发音像"呢"',
        exampleWord: { word: 'ねこ', reading: 'neko', meaning: '猫' }
      },
      {
        character: 'の',
        romaji: 'no',
        pronunciation: 'no',
        strokes: 1,
        writingTip: '一笔写成',
        memoryTip: '"no"是最特殊的假名，像残月',
        exampleWord: { word: 'の', reading: 'no', meaning: '的' }
      }
    ]
  },
  {
    name: 'は行 (h行)',
    description: '由h与五个元音组合而成',
    kana: [
      {
        character: 'は',
        romaji: 'ha',
        pronunciation: 'ha',
        strokes: 4,
        writingTip: '左边是"心"的简化，右边像"た"',
        memoryTip: '"ha"是助词，读作wa但不写作わ',
        exampleWord: { word: 'はな', reading: 'hana', meaning: '花' }
      },
      {
        character: 'ひ',
        romaji: 'hi',
        pronunciation: 'hi',
        strokes: 1,
        writingTip: '一笔写成，向左弯曲',
        memoryTip: '"hi"像微笑的嘴',
        exampleWord: { word: 'ひと', reading: 'hito', meaning: '人' }
      },
      {
        character: 'ふ',
        romaji: 'fu',
        pronunciation: 'fu',
        strokes: 4,
        writingTip: '类似汉字"不"的变形',
        memoryTip: '"fu"像"不"，注意发音是fu不是hu',
        exampleWord: { word: 'ふうとう', reading: 'fuutou', meaning: '信封' }
      },
      {
        character: 'へ',
        romaji: 'he',
        pronunciation: 'he',
        strokes: 1,
        writingTip: '一笔写成，像汉字"へ"（方向）',
        memoryTip: '"he"也像"he"的英语形状',
        exampleWord: { word: 'へや', reading: 'heya', meaning: '房间' }
      },
      {
        character: 'ほ',
        romaji: 'ho',
        pronunciation: 'ho',
        strokes: 4,
        writingTip: '左边是"保"的左部，右边是"ほ"',
        memoryTip: '"ho"像"保"或"ほ"的左部',
        exampleWord: { word: 'ほん', reading: 'hon', meaning: '书' }
      }
    ]
  },
  {
    name: 'ま行 (m行)',
    description: '由m与五个元音组合而成',
    kana: [
      {
        character: 'ま',
        romaji: 'ma',
        pronunciation: 'ma',
        strokes: 3,
        writingTip: '类似汉字"ま"（日语"ma"的汉字）',
        memoryTip: '"ma"像"马"的上半部分',
        exampleWord: { word: 'まち', reading: 'machi', meaning: '城镇' }
      },
      {
        character: 'み',
        romaji: 'mi',
        pronunciation: 'mi',
        strokes: 2,
        writingTip: '类似汉字"ミ"（片假名）',
        memoryTip: '"mi"像"三"的变形',
        exampleWord: { word: 'みみ', reading: 'mimi', meaning: '耳朵' }
      },
      {
        character: 'む',
        romaji: 'mu',
        pronunciation: 'mu',
        strokes: 3,
        writingTip: '上面是横，下面类似"牟"的上部',
        memoryTip: '"mu"像"牟"或"梦"的一部分',
        exampleWord: { word: 'むすめ', reading: 'musume', meaning: '女儿' }
      },
      {
        character: 'め',
        romaji: 'me',
        pronunciation: 'me',
        strokes: 2,
        writingTip: '像汉字"女"的简化',
        memoryTip: '"me"像"女"或"目"（眼睛）',
        exampleWord: { word: 'め', reading: 'me', meaning: '眼睛' }
      },
      {
        character: 'も',
        romaji: 'mo',
        pronunciation: 'mo',
        strokes: 3,
        writingTip: '类似汉字"毛"的简化',
        memoryTip: '"mo"像"毛"字',
        exampleWord: { word: 'もん', reading: 'mon', meaning: '门' }
      }
    ]
  },
  {
    name: 'や行 (y行)',
    description: '由y与五个元音组合而成（やゆよ + あいうえお）',
    kana: [
      {
        character: 'や',
        romaji: 'ya',
        pronunciation: 'ya',
        strokes: 2,
        writingTip: '类似汉字"也"的简化',
        memoryTip: '"ya"像"也"或"丫"',
        exampleWord: { word: 'やま', reading: 'yama', meaning: '山' }
      },
      {
        character: 'ゆ',
        romaji: 'yu',
        pronunciation: 'yu',
        strokes: 2,
        writingTip: '类似汉字"由"的简化',
        memoryTip: '"yu"像"由"字',
        exampleWord: { word: 'ゆき', reading: 'yuki', meaning: '雪' }
      },
      {
        character: 'よ',
        romaji: 'yo',
        pronunciation: 'yo',
        strokes: 2,
        writingTip: '类似汉字"与"的简化',
        memoryTip: '"yo"像"与"或"よ"',
        exampleWord: { word: 'よむ', reading: 'yomu', meaning: '读' }
      }
    ]
  },
  {
    name: 'ら行 (r行)',
    description: '由r与五个元音组合而成',
    kana: [
      {
        character: 'ら',
        romaji: 'ra',
        pronunciation: 'la',
        strokes: 2,
        writingTip: '类似汉字"良"的上部',
        memoryTip: '"ra"像"良"的上面',
        exampleWord: { word: 'らくご', reading: 'rakugo', meaning: '落语' }
      },
      {
        character: 'り',
        romaji: 'ri',
        pronunciation: 'li',
        strokes: 2,
        writingTip: '类似汉字"利"的左边',
        memoryTip: '"ri"像"利"的部首，注意竖弯钩',
        exampleWord: { word: 'りんご', reading: 'ringo', meaning: '苹果' }
      },
      {
        character: 'る',
        romaji: 'ru',
        pronunciation: 'lu',
        strokes: 2,
        writingTip: '类似汉字"る"（日语"ru"的汉字）',
        memoryTip: '"ru"像"る"，注意右下的弯',
        exampleWord: { word: 'るす', reading: 'rusu', meaning: '不在' }
      },
      {
        character: 'れ',
        romaji: 're',
        pronunciation: 'le',
        strokes: 2,
        writingTip: '类似汉字"礼"的左边',
        memoryTip: '"re"像"礼"或"れ"',
        exampleWord: { word: 'れい', reading: 'rei', meaning: '零' }
      },
      {
        character: 'ろ',
        romaji: 'ro',
        pronunciation: 'lo',
        strokes: 3,
        writingTip: '类似汉字"呂"的简化',
        memoryTip: '"ro"像"呂"字的两个口',
        exampleWord: { word: 'ろく', reading: 'roku', meaning: '六' }
      }
    ]
  },
  {
    name: 'わ行 (w行)',
    description: '由w与五个元音组合而成（主要是わ和を）',
    kana: [
      {
        character: 'わ',
        romaji: 'wa',
        pronunciation: 'wa',
        strokes: 2,
        writingTip: '类似汉字"和"的左边',
        memoryTip: '"wa"像"和"的部首，发音也像',
        exampleWord: { word: 'わたし', reading: 'watashi', meaning: '我' }
      },
      {
        character: 'を',
        romaji: 'wo',
        pronunciation: 'o',
        strokes: 1,
        writingTip: '一笔写成',
        memoryTip: '"を"是助词，读作o！像"乎"字',
        exampleWord: { word: 'を', reading: 'wo', meaning: '助词（表示宾语）' }
      }
    ]
  },
  {
    name: 'ん (n)',
    description: '拨音，单独作为一个音节',
    kana: [
      {
        character: 'ん',
        romaji: 'n',
        pronunciation: 'n',
        strokes: 2,
        writingTip: '类似汉字"ん"（日语"n"的汉字）',
        memoryTip: '"ん"像"n"，注意发音只在单词末尾或辅音前',
        exampleWord: { word: 'にほん', reading: 'nihon', meaning: '日本' }
      }
    ]
  }
]

// 片假名 - 清音
export const katakanaBasicGroups: KanaGroup[] = [
  {
    name: 'ア行 (元音)',
    description: '片假名的元音，对应平假名あ行',
    kana: [
      {
        character: 'ア',
        romaji: 'a',
        pronunciation: '啊',
        strokes: 3,
        writingTip: '类似汉字"阿"的左部',
        memoryTip: '"ア"像"阿"字左边，发音"啊"',
        exampleWord: { word: 'アイ', reading: 'ai', meaning: '爱' }
      },
      {
        character: 'イ',
        romaji: 'i',
        pronunciation: '衣',
        strokes: 2,
        writingTip: '类似汉字"以"的左部',
        memoryTip: '"イ"像"以"字左边',
        exampleWord: { word: 'イエ', reading: 'ie', meaning: '家' }
      },
      {
        character: 'ウ',
        romaji: 'u',
        pronunciation: '乌',
        strokes: 3,
        writingTip: '类似汉字"宇"的上部',
        memoryTip: '"ウ"像"宇"上面',
        exampleWord: { word: 'ウエ', reading: 'ue', meaning: '上面' }
      },
      {
        character: 'エ',
        romaji: 'e',
        pronunciation: '诶',
        strokes: 3,
        writingTip: '类似汉字"工"加一撇',
        memoryTip: '"エ"像"工"字',
        exampleWord: { word: 'エンピツ', reading: 'enpitsu', meaning: '铅笔' }
      },
      {
        character: 'オ',
        romaji: 'o',
        pronunciation: '哦',
        strokes: 4,
        writingTip: '类似汉字"於"的上部',
        memoryTip: '"オ"像"於"字上面',
        exampleWord: { word: 'オカアサン', reading: 'okaasan', meaning: '妈妈' }
      }
    ]
  },
  {
    name: 'カ行 (k行)',
    description: '片假名k行，对应平假名か行',
    kana: [
      {
        character: 'カ',
        romaji: 'ka',
        pronunciation: '卡',
        strokes: 2,
        writingTip: '类似汉字"加"的左部',
        memoryTip: '"カ"像"加"字左边',
        exampleWord: { word: 'カサ', reading: 'kasa', meaning: '伞' }
      },
      {
        character: 'キ',
        romaji: 'ki',
        pronunciation: 'ki',
        strokes: 3,
        writingTip: '类似汉字"キ"',
        memoryTip: '"キ"上面的部分很重要',
        exampleWord: { word: 'キ', reading: 'ki', meaning: '树' }
      },
      {
        character: 'ク',
        romaji: 'ku',
        pronunciation: '库',
        strokes: 2,
        writingTip: '类似汉字"久"',
        memoryTip: '"ク"像"久"字',
        exampleWord: { word: 'クモ', reading: 'kumo', meaning: '云' }
      },
      {
        character: 'ケ',
        romaji: 'ke',
        pronunciation: 'ke',
        strokes: 3,
        writingTip: '类似汉字"ケ"（日语ke的汉字）',
        memoryTip: '"ケ"像"ケ"字',
        exampleWord: { word: 'ケイタイ', reading: 'keitai', meaning: '手机' }
      },
      {
        character: 'コ',
        romaji: 'ko',
        pronunciation: 'ko',
        strokes: 2,
        writingTip: '类似汉字"コ"（日语ko的汉字）',
        memoryTip: '"コ"像"コ"字',
        exampleWord: { word: 'ココ', reading: 'koko', meaning: '这里' }
      }
    ]
  },
  {
    name: 'サ行 (s行)',
    description: '片假名s行，对应平假名さ行',
    kana: [
      {
        character: 'サ',
        romaji: 'sa',
        pronunciation: '撒',
        strokes: 3,
        writingTip: '三笔，注意第二笔的斜线角度',
        memoryTip: '像把“才”拆开，读作sa',
        exampleWord: { word: 'サクラ', reading: 'sakura', meaning: '樱花' }
      },
      {
        character: 'シ',
        romaji: 'shi',
        pronunciation: 'xi',
        strokes: 3,
        writingTip: '三点的方向要统一（从左上到右下）',
        memoryTip: '“シ”三点像笑脸，读shi',
        exampleWord: { word: 'シゴト', reading: 'shigoto', meaning: '工作' }
      },
      {
        character: 'ス',
        romaji: 'su',
        pronunciation: 'si',
        strokes: 2,
        writingTip: '先写上面一笔，再写下方长弯钩',
        memoryTip: '像一把钩子，读su',
        exampleWord: { word: 'スシ', reading: 'sushi', meaning: '寿司' }
      },
      {
        character: 'セ',
        romaji: 'se',
        pronunciation: 'sei',
        strokes: 2,
        writingTip: '两笔，第二笔从上到下贯穿',
        memoryTip: '像“世”的一部分，读se',
        exampleWord: { word: 'センセイ', reading: 'sensei', meaning: '老师' }
      },
      {
        character: 'ソ',
        romaji: 'so',
        pronunciation: 'so',
        strokes: 2,
        writingTip: '两笔，第二笔写得更长更利落',
        memoryTip: '“ソ”与“ン”容易混，记住更“直”的是ソ',
        exampleWord: { word: 'ソラ', reading: 'sora', meaning: '天空' }
      }
    ]
  },
  {
    name: 'タ行 (t行)',
    description: '片假名t行，对应平假名た行',
    kana: [
      {
        character: 'タ',
        romaji: 'ta',
        pronunciation: 'ta',
        strokes: 3,
        writingTip: '第一笔短，第二笔横，第三笔斜下长笔',
        memoryTip: '像“夕”，读ta',
        exampleWord: { word: 'タベモノ', reading: 'tabemono', meaning: '食物' }
      },
      {
        character: 'チ',
        romaji: 'chi',
        pronunciation: 'qi',
        strokes: 3,
        writingTip: '注意最后一笔的弯钩',
        memoryTip: '像“千”变形，读chi（发音接近qi）',
        exampleWord: { word: 'チカテツ', reading: 'chikatetsu', meaning: '地铁' }
      },
      {
        character: 'ツ',
        romaji: 'tsu',
        pronunciation: 'ci',
        strokes: 3,
        writingTip: '三点方向一致（从左上到右下），最后一笔向右下收',
        memoryTip: '“ツ”与“シ”容易混，ツ的点更“竖”',
        exampleWord: { word: 'ツキ', reading: 'tsuki', meaning: '月亮' }
      },
      {
        character: 'テ',
        romaji: 'te',
        pronunciation: 'te',
        strokes: 3,
        writingTip: '上面两横之间距离更近，下面一竖略向左倾',
        memoryTip: '像“丁”的拆分，读te',
        exampleWord: { word: 'テガミ', reading: 'tegami', meaning: '信' }
      },
      {
        character: 'ト',
        romaji: 'to',
        pronunciation: 'to',
        strokes: 2,
        writingTip: '一竖加一点，点要落在右侧',
        memoryTip: '像“卜”，读to',
        exampleWord: { word: 'トモダチ', reading: 'tomodachi', meaning: '朋友' }
      }
    ]
  },
  {
    name: 'ナ行 (n行)',
    description: '片假名n行，对应平假名な行',
    kana: [
      {
        character: 'ナ',
        romaji: 'na',
        pronunciation: 'na',
        strokes: 2,
        writingTip: '两笔交叉，第一笔短斜，第二笔长竖',
        memoryTip: '像“ナ”本身，读na',
        exampleWord: { word: 'ナマエ', reading: 'namae', meaning: '名字' }
      },
      {
        character: 'ニ',
        romaji: 'ni',
        pronunciation: 'ni',
        strokes: 2,
        writingTip: '两横，上短下长',
        memoryTip: '就是汉字“二”，读ni',
        exampleWord: { word: 'ニホン', reading: 'nihon', meaning: '日本' }
      },
      {
        character: 'ヌ',
        romaji: 'nu',
        pronunciation: 'nu',
        strokes: 2,
        writingTip: '第一笔横折，第二笔绕一圈后出钩',
        memoryTip: '像“又”加一圈，读nu',
        exampleWord: { word: 'ヌノ', reading: 'nuno', meaning: '布' }
      },
      {
        character: 'ネ',
        romaji: 'ne',
        pronunciation: 'ne',
        strokes: 4,
        writingTip: '像“衣”变形，最后一笔向右伸展',
        memoryTip: '像一把钥匙，读ne',
        exampleWord: { word: 'ネコ', reading: 'neko', meaning: '猫' }
      },
      {
        character: 'ノ',
        romaji: 'no',
        pronunciation: 'no',
        strokes: 1,
        writingTip: '一笔斜下',
        memoryTip: '一撇就是ノ，读no',
        exampleWord: { word: 'ノート', reading: 'nooto', meaning: '笔记本' }
      }
    ]
  },
  {
    name: 'ハ行 (h行)',
    description: '片假名h行，对应平假名は行',
    kana: [
      {
        character: 'ハ',
        romaji: 'ha',
        pronunciation: 'ha',
        strokes: 2,
        writingTip: '两笔分开写，像“八”',
        memoryTip: '像汉字“八”，读ha',
        exampleWord: { word: 'ハナ', reading: 'hana', meaning: '花' }
      },
      {
        character: 'ヒ',
        romaji: 'hi',
        pronunciation: 'hi',
        strokes: 2,
        writingTip: '第一笔短竖，第二笔长弯钩',
        memoryTip: '像一把钩子挂住东西，读hi',
        exampleWord: { word: 'ヒト', reading: 'hito', meaning: '人' }
      },
      {
        character: 'フ',
        romaji: 'fu',
        pronunciation: 'fu',
        strokes: 1,
        writingTip: '一笔写成，像小风车',
        memoryTip: '像吹风“フー”，读fu',
        exampleWord: { word: 'フユ', reading: 'fuyu', meaning: '冬天' }
      },
      {
        character: 'ヘ',
        romaji: 'he',
        pronunciation: 'he',
        strokes: 1,
        writingTip: '一笔写成，像“人”的上半',
        memoryTip: '像山谷的“へ”，读he',
        exampleWord: { word: 'ヘヤ', reading: 'heya', meaning: '房间' }
      },
      {
        character: 'ホ',
        romaji: 'ho',
        pronunciation: 'ho',
        strokes: 4,
        writingTip: '像“木”加一点，注意点的位置',
        memoryTip: '像“本”的骨架，读ho',
        exampleWord: { word: 'ホン', reading: 'hon', meaning: '书' }
      }
    ]
  },
  {
    name: 'マ行 (m行)',
    description: '片假名m行，对应平假名ま行',
    kana: [
      {
        character: 'マ',
        romaji: 'ma',
        pronunciation: 'ma',
        strokes: 2,
        writingTip: '像“マ”，第二笔折角要清晰',
        memoryTip: '像“马”的轮廓，读ma',
        exampleWord: { word: 'マド', reading: 'mado', meaning: '窗户' }
      },
      {
        character: 'ミ',
        romaji: 'mi',
        pronunciation: 'mi',
        strokes: 3,
        writingTip: '三横，从上到下逐渐变长',
        memoryTip: '三横就是ミ，读mi',
        exampleWord: { word: 'ミミ', reading: 'mimi', meaning: '耳朵' }
      },
      {
        character: 'ム',
        romaji: 'mu',
        pronunciation: 'mu',
        strokes: 2,
        writingTip: '像“ム”，第二笔向右上回勾',
        memoryTip: '像“牟”的一部分，读mu',
        exampleWord: { word: 'ムシ', reading: 'mushi', meaning: '虫' }
      },
      {
        character: 'メ',
        romaji: 'me',
        pronunciation: 'me',
        strokes: 2,
        writingTip: '交叉两笔，像“メ”',
        memoryTip: '像英语“X”的变体，读me',
        exampleWord: { word: 'メガネ', reading: 'megane', meaning: '眼镜' }
      },
      {
        character: 'モ',
        romaji: 'mo',
        pronunciation: 'mo',
        strokes: 3,
        writingTip: '三笔，最后一竖要略长',
        memoryTip: '像“毛”的骨架，读mo',
        exampleWord: { word: 'モリ', reading: 'mori', meaning: '森林' }
      }
    ]
  },
  {
    name: 'ヤ行 (y行)',
    description: '片假名y行（ヤ・ユ・ヨ），对应平假名や行',
    kana: [
      {
        character: 'ヤ',
        romaji: 'ya',
        pronunciation: 'ya',
        strokes: 2,
        writingTip: '两笔，第二笔要写出明显的折角',
        memoryTip: '像“也”的变体，读ya',
        exampleWord: { word: 'ヤマ', reading: 'yama', meaning: '山' }
      },
      {
        character: 'ユ',
        romaji: 'yu',
        pronunciation: 'yu',
        strokes: 2,
        writingTip: '两笔，像“コ”加一竖',
        memoryTip: '像一个盒子加支撑，读yu',
        exampleWord: { word: 'ユキ', reading: 'yuki', meaning: '雪' }
      },
      {
        character: 'ヨ',
        romaji: 'yo',
        pronunciation: 'yo',
        strokes: 3,
        writingTip: '三横一竖的组合，注意上短下长',
        memoryTip: '像汉字“ヨ”，读yo',
        exampleWord: { word: 'ヨル', reading: 'yoru', meaning: '夜晚' }
      }
    ]
  },
  {
    name: 'ラ行 (r行)',
    description: '片假名r行，对应平假名ら行',
    kana: [
      {
        character: 'ラ',
        romaji: 'ra',
        pronunciation: 'la',
        strokes: 2,
        writingTip: '第一笔短斜，第二笔长折',
        memoryTip: '像“ラ”本身，读ra',
        exampleWord: { word: 'ラーメン', reading: 'raamen', meaning: '拉面' }
      },
      {
        character: 'リ',
        romaji: 'ri',
        pronunciation: 'li',
        strokes: 2,
        writingTip: '两条竖线，左短右长',
        memoryTip: '两根“リ”，读ri',
        exampleWord: { word: 'リンゴ', reading: 'ringo', meaning: '苹果' }
      },
      {
        character: 'ル',
        romaji: 'ru',
        pronunciation: 'lu',
        strokes: 2,
        writingTip: '第一笔竖，第二笔弯出尾巴',
        memoryTip: '像“ル”尾巴，读ru',
        exampleWord: { word: 'ルール', reading: 'ruuru', meaning: '规则' }
      },
      {
        character: 'レ',
        romaji: 're',
        pronunciation: 'le',
        strokes: 1,
        writingTip: '一笔写成，像“レ”',
        memoryTip: '像一个“勾”，读re',
        exampleWord: { word: 'レイ', reading: 'rei', meaning: '零' }
      },
      {
        character: 'ロ',
        romaji: 'ro',
        pronunciation: 'lo',
        strokes: 3,
        writingTip: '像一个方框，三笔封口',
        memoryTip: '像“口”，读ro',
        exampleWord: { word: 'ロボット', reading: 'robotto', meaning: '机器人' }
      }
    ]
  },
  {
    name: 'ワ行 (w行)',
    description: '片假名w行（ワ・ヲ）与拨音ン',
    kana: [
      {
        character: 'ワ',
        romaji: 'wa',
        pronunciation: 'wa',
        strokes: 2,
        writingTip: '两笔，第二笔弯钩要有力度',
        memoryTip: '像“ワ”的钩，读wa',
        exampleWord: { word: 'ワタシ', reading: 'watashi', meaning: '我' }
      },
      {
        character: 'ヲ',
        romaji: 'wo',
        pronunciation: 'o',
        strokes: 3,
        writingTip: '先写“コ”，再加一笔',
        memoryTip: '常作助词，读作o（wo只是罗马字记法）',
        exampleWord: { word: 'ヲ', reading: 'wo', meaning: '助词（表示宾语）' }
      },
      {
        character: 'ン',
        romaji: 'n',
        pronunciation: 'n',
        strokes: 2,
        writingTip: '两笔，第二笔更“斜”更长',
        memoryTip: '“ン”与“ソ”易混，记住ン更“斜”',
        exampleWord: { word: 'ニホン', reading: 'nihon', meaning: '日本' }
      }
    ]
  }
]

// 浊音和半浊音
export const hiraganaDakutenGroups: KanaGroup[] = [
  {
    name: 'が行 (ga行)',
    description: '浊音，在か行假名右上角加浊点（゛）',
    kana: [
      { character: 'が', romaji: 'ga', pronunciation: '嘎', strokes: 4, writingTip: 'か+浊点', memoryTip: 'か右上加两点', exampleWord: { word: 'がいこく', reading: 'gaikoku', meaning: '外国' } },
      { character: 'ぎ', romaji: 'gi', pronunciation: 'gi', strokes: 5, writingTip: 'き+浊点', memoryTip: 'き右上加两点', exampleWord: { word: 'ぎんこう', reading: 'ginkou', meaning: '银行' } },
      { character: 'ぐ', romaji: 'gu', pronunciation: 'gu', strokes: 4, writingTip: 'く+浊点', memoryTip: 'く右上加两点', exampleWord: { word: 'ぐらい', reading: 'gurai', meaning: '大约' } },
      { character: 'げ', romaji: 'ge', pronunciation: 'ge', strokes: 4, writingTip: 'け+浊点', memoryTip: 'け右上加两点', exampleWord: { word: 'げんき', reading: 'genki', meaning: '精神' } },
      { character: 'ご', romaji: 'go', pronunciation: 'go', strokes: 4, writingTip: 'こ+浊点', memoryTip: 'こ右上加两点', exampleWord: { word: 'ごご', reading: 'gogo', meaning: '午后' } }
    ]
  },
  {
    name: 'ざ行 (za行)',
    description: '浊音，在さ行假名右上角加浊点',
    kana: [
      { character: 'ざ', romaji: 'za', pronunciation: 'za', strokes: 4, writingTip: 'さ+浊点', memoryTip: 'さ右上加两点', exampleWord: { word: 'ざっし', reading: 'zasshi', meaning: '杂志' } },
      { character: 'じ', romaji: 'ji', pronunciation: 'ji', strokes: 3, writingTip: 'し+浊点', memoryTip: 'し右上加两点', exampleWord: { word: 'じかん', reading: 'jikan', meaning: '时间' } },
      { character: 'ず', romaji: 'zu', pronunciation: 'zu', strokes: 4, writingTip: 'す+浊点', memoryTip: 'す右上加两点', exampleWord: { word: 'ずっと', reading: 'zutto', meaning: '一直' } },
      { character: 'ぜ', romaji: 'ze', pronunciation: 'ze', strokes: 4, writingTip: 'せ+浊点', memoryTip: 'せ右上加两点', exampleWord: { word: 'ぜんぶ', reading: 'zenbu', meaning: '全部' } },
      { character: 'ぞ', romaji: 'zo', pronunciation: 'zo', strokes: 4, writingTip: 'そ+浊点', memoryTip: 'そ右上加两点', exampleWord: { word: 'ぞう', reading: 'zou', meaning: '大象' } }
    ]
  },
  {
    name: 'だ行 (da行)',
    description: '浊音，在た行假名右上角加浊点',
    kana: [
      { character: 'だ', romaji: 'da', pronunciation: 'da', strokes: 5, writingTip: 'た+浊点', memoryTip: 'た右上加两点', exampleWord: { word: 'だいすき', reading: 'daisuki', meaning: '很喜欢' } },
      { character: 'ぢ', romaji: 'ji', pronunciation: 'ji', strokes: 3, writingTip: 'ち+浊点', memoryTip: 'ち右上加两点', exampleWord: { word: 'ぢ', reading: 'ji', meaning: '地（同じ）' } },
      { character: 'づ', romaji: 'zu', pronunciation: 'zu', strokes: 3, writingTip: 'つ+浊点', memoryTip: 'つ右上加两点', exampleWord: { word: 'づかい', reading: 'zukai', meaning: '用法' } },
      { character: 'で', romaji: 'de', pronunciation: 'de', strokes: 3, writingTip: 'て+浊点', memoryTip: 'て右上加两点', exampleWord: { word: 'でんわ', reading: 'denwa', meaning: '电话' } },
      { character: 'ど', romaji: 'do', pronunciation: 'do', strokes: 3, writingTip: 'と+浊点', memoryTip: 'と右上加两点', exampleWord: { word: 'どこ', reading: 'doko', meaning: '哪里' } }
    ]
  },
  {
    name: 'ば行 (ba行)',
    description: '浊音，在は行假名右上角加浊点',
    kana: [
      { character: 'ば', romaji: 'ba', pronunciation: 'ba', strokes: 5, writingTip: 'は+浊点', memoryTip: 'は右上加两点', exampleWord: { word: 'ばんごはん', reading: 'bangohan', meaning: '晚饭' } },
      { character: 'び', romaji: 'bi', pronunciation: 'bi', strokes: 2, writingTip: 'ひ+浊点', memoryTip: 'ひ右上加两点', exampleWord: { word: 'びょういん', reading: 'byouin', meaning: '医院' } },
      { character: 'ぶ', romaji: 'bu', pronunciation: 'bu', strokes: 5, writingTip: 'ふ+浊点', memoryTip: 'ふ右上加两点', exampleWord: { word: 'ぶた', reading: 'buta', meaning: '猪' } },
      { character: 'べ', romaji: 'be', pronunciation: 'be', strokes: 2, writingTip: 'へ+浊点', memoryTip: 'へ右上加两点', exampleWord: { word: 'べんきょう', reading: 'benkyou', meaning: '学习' } },
      { character: 'ぼ', romaji: 'bo', pronunciation: 'bo', strokes: 5, writingTip: 'ほ+浊点', memoryTip: 'ほ右上加两点', exampleWord: { word: 'ぼうし', reading: 'boushi', meaning: '帽子' } }
    ]
  },
  {
    name: 'ぱ行 (pa行)',
    description: '半浊音，在は行假名右上角加半浊点（゜）',
    kana: [
      { character: 'ぱ', romaji: 'pa', pronunciation: 'pa', strokes: 5, writingTip: 'は+半浊点', memoryTip: 'は右上加小圈', exampleWord: { word: 'ぱん', reading: 'pan', meaning: '面包' } },
      { character: 'ぴ', romaji: 'pi', pronunciation: 'pi', strokes: 2, writingTip: 'ひ+半浊点', memoryTip: 'ひ右上加小圈', exampleWord: { word: 'ぴあの', reading: 'piano', meaning: '钢琴' } },
      { character: 'ぷ', romaji: 'pu', pronunciation: 'pu', strokes: 5, writingTip: 'ふ+半浊点', memoryTip: 'ふ右上加小圈', exampleWord: { word: 'ぷろ', reading: 'puro', meaning: '职业' } },
      { character: 'ぺ', romaji: 'pe', pronunciation: 'pe', strokes: 2, writingTip: 'へ+半浊点', memoryTip: 'へ右上加小圈', exampleWord: { word: 'ぺん', reading: 'pen', meaning: '笔' } },
      { character: 'ぽ', romaji: 'po', pronunciation: 'po', strokes: 5, writingTip: 'ほ+半浊点', memoryTip: 'ほ右上加小圈', exampleWord: { word: 'ぽけっと', reading: 'poketto', meaning: '口袋' } }
    ]
  }
]

// 拗音
export const hiraganaYouonGroups: KanaGroup[] = [
  {
    name: 'きゃ・きゅ・きょ行',
    description: '拗音，由き、し、ち、に、ひ、み、り、り、ぎ、じ、び、び与ゃ、ゅ、ょ组合',
    kana: [
      { character: 'きゃ', romaji: 'kya', pronunciation: 'kia', strokes: 5, writingTip: 'き+小ゃ', memoryTip: 'き后面跟小ゃ', exampleWord: { word: 'きゃく', reading: 'kyaku', meaning: '客人' } },
      { character: 'きゅ', romaji: 'kyu', pronunciation: 'kiu', strokes: 5, writingTip: 'き+小ゅ', memoryTip: 'き后面跟小ゅ', exampleWord: { word: 'きゅう', reading: 'kyuu', meaning: '九' } },
      { character: 'きょ', romaji: 'kyo', pronunciation: 'kio', strokes: 5, writingTip: 'き+小ょ', memoryTip: 'き后面跟小ょ', exampleWord: { word: 'きょう', reading: 'kyou', meaning: '今天' } }
    ]
  },
  {
    name: 'しゃ・しゅ・しょ行',
    description: 'し与ゃ、ゅ、ょ的拗音组合',
    kana: [
      { character: 'しゃ', romaji: 'sha', pronunciation: 'xia', strokes: 4, writingTip: 'し+小ゃ', memoryTip: 'し后面跟小ゃ', exampleWord: { word: 'しゃしん', reading: 'shashin', meaning: '照片' } },
      { character: 'しゅ', romaji: 'shu', pronunciation: 'xiu', strokes: 4, writingTip: 'し+小ゅ', memoryTip: 'し后面跟小ゅ', exampleWord: { word: 'しゅみ', reading: 'shumi', meaning: '兴趣' } },
      { character: 'しょ', romaji: 'sho', pronunciation: 'xio', strokes: 4, writingTip: 'し+小ょ', memoryTip: 'し后面跟小ょ', exampleWord: { word: 'しょくじ', reading: 'shokuji', meaning: '吃饭' } }
    ]
  },
  {
    name: 'ちゃ・ちゅ・ちょ行',
    description: 'ち与ゃ、ゅ、ょ的拗音组合',
    kana: [
      { character: 'ちゃ', romaji: 'cha', pronunciation: 'qia', strokes: 5, writingTip: 'ち+小ゃ', memoryTip: 'ち后面跟小ゃ', exampleWord: { word: 'ちゃ', reading: 'cha', meaning: '茶' } },
      { character: 'ちゅ', romaji: 'chu', pronunciation: 'qiu', strokes: 5, writingTip: 'ち+小ゅ', memoryTip: 'ち后面跟小ゅ', exampleWord: { word: 'ちゅうごく', reading: 'chuugoku', meaning: '中国' } },
      { character: 'ちょ', romaji: 'cho', pronunciation: 'qio', strokes: 5, writingTip: 'ち+小ょ', memoryTip: 'ち后面跟小ょ', exampleWord: { word: 'ちょう', reading: 'chou', meaning: '蝴蝶' } }
    ]
  },
  {
    name: 'にゃ・にゅ・にょ行',
    description: 'に与ゃ、ゅ、ょ的拗音组合',
    kana: [
      { character: 'にゃ', romaji: 'nya', pronunciation: 'nia', strokes: 7, writingTip: 'に+小ゃ', memoryTip: 'に后面跟小ゃ', exampleWord: { word: 'にゃあ', reading: 'nya', meaning: '喵' } },
      { character: 'にゅ', romaji: 'nyu', pronunciation: 'niu', strokes: 7, writingTip: 'に+小ゅ', memoryTip: 'に后面跟小ゅ', exampleWord: { word: 'にゅう', reading: 'nyuu', meaning: '入' } },
      { character: 'にょ', romaji: 'nyo', pronunciation: 'nio', strokes: 7, writingTip: 'に+小ょ', memoryTip: 'に后面跟小ょ', exampleWord: { word: 'にょらい', reading: 'nyorai', meaning: '如来' } }
    ]
  },
  {
    name: 'ひゃ・ひゅ・ひょ行',
    description: 'ひ与ゃ、ゅ、ょ的拗音组合',
    kana: [
      { character: 'ひゃ', romaji: 'hya', pronunciation: 'hia', strokes: 5, writingTip: 'ひ+小ゃ', memoryTip: 'ひ后面跟小ゃ', exampleWord: { word: 'ひゃく', reading: 'hyaku', meaning: '一百' } },
      { character: 'ひゅ', romaji: 'hyu', pronunciation: 'hiu', strokes: 5, writingTip: 'ひ+小ゅ', memoryTip: 'ひ后面跟小ゅ', exampleWord: { word: 'ひょうじ', reading: 'hyouji', meaning: '杂志' } },
      { character: 'ひょ', romaji: 'hyo', pronunciation: 'hio', strokes: 5, writingTip: 'ひ+小ょ', memoryTip: 'ひ后面跟小ょ', exampleWord: { word: 'ひょう', reading: 'hyou', meaning: '评价' } }
    ]
  },
  {
    name: 'みゃ・みゅ・みょ行',
    description: 'み与ゃ、ゅ、ょ的拗音组合',
    kana: [
      { character: 'みゃ', romaji: 'mya', pronunciation: 'mia', strokes: 6, writingTip: 'み+小ゃ', memoryTip: 'み后面跟小ゃ', exampleWord: { word: 'みゃく', reading: 'myaku', meaning: '脉' } },
      { character: 'みゅ', romaji: 'myu', pronunciation: 'miu', strokes: 6, writingTip: 'み+小ゅ', memoryTip: 'み后面跟小ゅ', exampleWord: { word: 'みゅうじく', reading: 'myuujiro', meaning: '星座' } },
      { character: 'みょ', romaji: 'myo', pronunciation: 'mio', strokes: 6, writingTip: 'み+小ょ', memoryTip: 'み后面跟小ょ', exampleWord: { word: 'みょうじ', reading: 'myouji', meaning: '名字' } }
    ]
  },
  {
    name: 'りゃ・りゅ・りょ行',
    description: 'り与ゃ、ゅ、ょ的拗音组合',
    kana: [
      { character: 'りゃ', romaji: 'rya', pronunciation: 'lia', strokes: 8, writingTip: 'り+小ゃ', memoryTip: 'り后面跟小ゃ', exampleWord: { word: 'りゃく', reading: 'ryaku', meaning: '略' } },
      { character: 'りゅ', romaji: 'ryu', pronunciation: 'liu', strokes: 8, writingTip: 'り+小ゅ', memoryTip: 'り后面跟小ゅ', exampleWord: { word: 'りゅう', reading: 'ryuu', meaning: '龙' } },
      { character: 'りょ', romaji: 'ryo', pronunciation: 'lio', strokes: 8, writingTip: 'り+小ょ', memoryTip: 'り后面跟小ょ', exampleWord: { word: 'りょこう', reading: 'ryokou', meaning: '旅行' } }
    ]
  }
]

// 片假名 - 浊音和半浊音
export const katakanaDakutenGroups: KanaGroup[] = [
  {
    name: 'ガ行 (ga行)',
    description: '片假名浊音，在カ行假名右上角加浊点（゛）',
    kana: [
      { character: 'ガ', romaji: 'ga', pronunciation: '嘎', strokes: 4, writingTip: 'カ+浊点', memoryTip: 'カ右上加两点', exampleWord: { word: 'ガイコク', reading: 'gaikoku', meaning: '外国' } },
      { character: 'ギ', romaji: 'gi', pronunciation: 'gi', strokes: 5, writingTip: 'キ+浊点', memoryTip: 'キ右上加两点', exampleWord: { word: 'ギンコウ', reading: 'ginkou', meaning: '银行' } },
      { character: 'グ', romaji: 'gu', pronunciation: 'gu', strokes: 4, writingTip: 'ク+浊点', memoryTip: 'ク右上加两点', exampleWord: { word: 'グライ', reading: 'gurai', meaning: '大约' } },
      { character: 'ゲ', romaji: 'ge', pronunciation: 'ge', strokes: 4, writingTip: 'ケ+浊点', memoryTip: 'ケ右上加两点', exampleWord: { word: 'ゲンキ', reading: 'genki', meaning: '精神' } },
      { character: 'ゴ', romaji: 'go', pronunciation: 'go', strokes: 4, writingTip: 'コ+浊点', memoryTip: 'コ右上加两点', exampleWord: { word: 'ゴゴ', reading: 'gogo', meaning: '午后' } }
    ]
  },
  {
    name: 'ザ行 (za行)',
    description: '片假名浊音，在サ行假名右上角加浊点',
    kana: [
      { character: 'ザ', romaji: 'za', pronunciation: 'za', strokes: 4, writingTip: 'サ+浊点', memoryTip: 'サ右上加两点', exampleWord: { word: 'ザッシ', reading: 'zasshi', meaning: '杂志' } },
      { character: 'ジ', romaji: 'ji', pronunciation: 'ji', strokes: 3, writingTip: 'シ+浊点', memoryTip: 'シ右上加两点', exampleWord: { word: 'ジカン', reading: 'jikan', meaning: '时间' } },
      { character: 'ズ', romaji: 'zu', pronunciation: 'zu', strokes: 4, writingTip: 'ス+浊点', memoryTip: 'ス右上加两点', exampleWord: { word: 'ズット', reading: 'zutto', meaning: '一直' } },
      { character: 'ゼ', romaji: 'ze', pronunciation: 'ze', strokes: 4, writingTip: 'セ+浊点', memoryTip: 'セ右上加两点', exampleWord: { word: 'ゼンブ', reading: 'zenbu', meaning: '全部' } },
      { character: 'ゾ', romaji: 'zo', pronunciation: 'zo', strokes: 4, writingTip: 'ソ+浊点', memoryTip: 'ソ右上加两点', exampleWord: { word: 'ゾウ', reading: 'zou', meaning: '大象' } }
    ]
  },
  {
    name: 'ダ行 (da行)',
    description: '片假名浊音，在タ行假名右上角加浊点',
    kana: [
      { character: 'ダ', romaji: 'da', pronunciation: 'da', strokes: 5, writingTip: 'タ+浊点', memoryTip: 'タ右上加两点', exampleWord: { word: 'ダイスキ', reading: 'daisuki', meaning: '很喜欢' } },
      { character: 'ヂ', romaji: 'ji', pronunciation: 'ji', strokes: 3, writingTip: 'チ+浊点', memoryTip: 'チ右上加两点', exampleWord: { word: 'ヂ', reading: 'ji', meaning: '地（同じ）' } },
      { character: 'ヅ', romaji: 'zu', pronunciation: 'zu', strokes: 3, writingTip: 'ツ+浊点', memoryTip: 'ツ右上加两点', exampleWord: { word: 'ヅカイ', reading: 'zukai', meaning: '用法' } },
      { character: 'デ', romaji: 'de', pronunciation: 'de', strokes: 3, writingTip: 'テ+浊点', memoryTip: 'テ右上加两点', exampleWord: { word: 'デンワ', reading: 'denwa', meaning: '电话' } },
      { character: 'ド', romaji: 'do', pronunciation: 'do', strokes: 3, writingTip: 'ト+浊点', memoryTip: 'ト右上加两点', exampleWord: { word: 'ドコ', reading: 'doko', meaning: '哪里' } }
    ]
  },
  {
    name: 'バ行 (ba行)',
    description: '片假名浊音，在ハ行假名右上角加浊点',
    kana: [
      { character: 'バ', romaji: 'ba', pronunciation: 'ba', strokes: 5, writingTip: 'ハ+浊点', memoryTip: 'ハ右上加两点', exampleWord: { word: 'バンゴハン', reading: 'bangohan', meaning: '晚饭' } },
      { character: 'ビ', romaji: 'bi', pronunciation: 'bi', strokes: 2, writingTip: 'ヒ+浊点', memoryTip: 'ヒ右上加两点', exampleWord: { word: 'ビョウイン', reading: 'byouin', meaning: '医院' } },
      { character: 'ブ', romaji: 'bu', pronunciation: 'bu', strokes: 5, writingTip: 'フ+浊点', memoryTip: 'フ右上加两点', exampleWord: { word: 'ブタ', reading: 'buta', meaning: '猪' } },
      { character: 'ベ', romaji: 'be', pronunciation: 'be', strokes: 2, writingTip: 'ヘ+浊点', memoryTip: 'ヘ右上加两点', exampleWord: { word: 'ベンキョウ', reading: 'benkyou', meaning: '学习' } },
      { character: 'ボ', romaji: 'bo', pronunciation: 'bo', strokes: 5, writingTip: 'ホ+浊点', memoryTip: 'ホ右上加两点', exampleWord: { word: 'ボール', reading: 'booru', meaning: '球' } }
    ]
  },
  {
    name: 'パ行 (pa行)',
    description: '片假名半浊音，在ハ行假名右上角加半浊点（゜）',
    kana: [
      { character: 'パ', romaji: 'pa', pronunciation: 'pa', strokes: 5, writingTip: 'ハ+半浊点', memoryTip: 'ハ右上加小圈', exampleWord: { word: 'パン', reading: 'pan', meaning: '面包' } },
      { character: 'ピ', romaji: 'pi', pronunciation: 'pi', strokes: 2, writingTip: 'ヒ+半浊点', memoryTip: 'ヒ右上加小圈', exampleWord: { word: 'ピアノ', reading: 'piano', meaning: '钢琴' } },
      { character: 'プ', romaji: 'pu', pronunciation: 'pu', strokes: 5, writingTip: 'フ+半浊点', memoryTip: 'フ右上加小圈', exampleWord: { word: 'プロ', reading: 'puro', meaning: '职业' } },
      { character: 'ペ', romaji: 'pe', pronunciation: 'pe', strokes: 2, writingTip: 'ヘ+半浊点', memoryTip: 'ヘ右上加小圈', exampleWord: { word: 'ペン', reading: 'pen', meaning: '笔' } },
      { character: 'ポ', romaji: 'po', pronunciation: 'po', strokes: 5, writingTip: 'ホ+半浊点', memoryTip: 'ホ右上加小圈', exampleWord: { word: 'ポケット', reading: 'poketto', meaning: '口袋' } }
    ]
  }
]

// 片假名 - 拗音
export const katakanaYouonGroups: KanaGroup[] = [
  {
    name: 'キャ・キュ・キョ行',
    description: '片假名拗音，由キ、シ、チ、ニ、ヒ、ミ、リ与ゃ、ゅ、ょ组合',
    kana: [
      { character: 'キャ', romaji: 'kya', pronunciation: 'kia', strokes: 5, writingTip: 'キ+小ャ', memoryTip: 'キ后面跟小ャ', exampleWord: { word: 'キャク', reading: 'kyaku', meaning: '客人' } },
      { character: 'キュ', romaji: 'kyu', pronunciation: 'kiu', strokes: 5, writingTip: 'キ+小ュ', memoryTip: 'キ后面跟小ュ', exampleWord: { word: 'キュウ', reading: 'kyuu', meaning: '九' } },
      { character: 'キョ', romaji: 'kyo', pronunciation: 'kio', strokes: 5, writingTip: 'キ+小ョ', memoryTip: 'キ后面跟小ョ', exampleWord: { word: 'キョウ', reading: 'kyou', meaning: '今天' } }
    ]
  },
  {
    name: 'シャ・シュ・ショ行',
    description: 'シ与ャ、ュ、ョ的拗音组合',
    kana: [
      { character: 'シャ', romaji: 'sha', pronunciation: 'xia', strokes: 4, writingTip: 'シ+小ャ', memoryTip: 'シ后面跟小ャ', exampleWord: { word: 'シャシン', reading: 'shashin', meaning: '照片' } },
      { character: 'シュ', romaji: 'shu', pronunciation: 'xiu', strokes: 4, writingTip: 'シ+小ュ', memoryTip: 'シ后面跟小ュ', exampleWord: { word: 'シュミ', reading: 'shumi', meaning: '兴趣' } },
      { character: 'ショ', romaji: 'sho', pronunciation: 'xio', strokes: 4, writingTip: 'シ+小ョ', memoryTip: 'シ后面跟小ョ', exampleWord: { word: 'ショクジ', reading: 'shokuji', meaning: '吃饭' } }
    ]
  },
  {
    name: 'チャ・チュ・チョ行',
    description: 'チ与ャ、ュ、ョ的拗音组合',
    kana: [
      { character: 'チャ', romaji: 'cha', pronunciation: 'qia', strokes: 5, writingTip: 'チ+小ャ', memoryTip: 'チ后面跟小ャ', exampleWord: { word: 'チャ', reading: 'cha', meaning: '茶' } },
      { character: 'チュ', romaji: 'chu', pronunciation: 'qiu', strokes: 5, writingTip: 'チ+小ュ', memoryTip: 'チ后面跟小ュ', exampleWord: { word: 'チュウゴク', reading: 'chuugoku', meaning: '中国' } },
      { character: 'チョ', romaji: 'cho', pronunciation: 'qio', strokes: 5, writingTip: 'チ+小ョ', memoryTip: 'チ后面跟小ョ', exampleWord: { word: 'チョウ', reading: 'chou', meaning: '蝴蝶' } }
    ]
  },
  {
    name: 'ニャ・ニュ・ニョ行',
    description: 'ニ与ャ、ュ、ョ的拗音组合',
    kana: [
      { character: 'ニャ', romaji: 'nya', pronunciation: 'nia', strokes: 7, writingTip: 'ニ+小ャ', memoryTip: 'ニ后面跟小ャ', exampleWord: { word: 'ニャア', reading: 'nya', meaning: '喵' } },
      { character: 'ニュ', romaji: 'nyu', pronunciation: 'niu', strokes: 7, writingTip: 'ニ+小ュ', memoryTip: 'ニ后面跟小ュ', exampleWord: { word: 'ニュウ', reading: 'nyuu', meaning: '入' } },
      { character: 'ニョ', romaji: 'nyo', pronunciation: 'nio', strokes: 7, writingTip: 'ニ+小ョ', memoryTip: 'ニ后面跟小ョ', exampleWord: { word: 'ニョライ', reading: 'nyorai', meaning: '如来' } }
    ]
  },
  {
    name: 'ヒャ・ヒュ・ヒョ行',
    description: 'ヒ与ャ、ュ、ョ的拗音组合',
    kana: [
      { character: 'ヒャ', romaji: 'hya', pronunciation: 'hia', strokes: 5, writingTip: 'ヒ+小ャ', memoryTip: 'ヒ后面跟小ャ', exampleWord: { word: 'ヒャッカ', reading: 'hyakka', meaning: '一百' } },
      { character: 'ヒュ', romaji: 'hyu', pronunciation: 'hiu', strokes: 5, writingTip: 'ヒ+小ュ', memoryTip: 'ヒ后面跟小ュ', exampleWord: { word: 'ヒュウマン', reading: 'hyuuman', meaning: '人类' } },
      { character: 'ヒョ', romaji: 'hyo', pronunciation: 'hio', strokes: 5, writingTip: 'ヒ+小ョ', memoryTip: 'ヒ后面跟小ョ', exampleWord: { word: 'ヒョウ', reading: 'hyou', meaning: '评价' } }
    ]
  },
  {
    name: 'ミャ・ミュ・ミョ行',
    description: 'ミ与ャ、ュ、ョ的拗音组合',
    kana: [
      { character: 'ミャ', romaji: 'mya', pronunciation: 'mia', strokes: 6, writingTip: 'ミ+小ャ', memoryTip: 'ミ后面跟小ャ', exampleWord: { word: 'ミャク', reading: 'myaku', meaning: '脉' } },
      { character: 'ミュ', romaji: 'myu', pronunciation: 'miu', strokes: 6, writingTip: 'ミ+小ュ', memoryTip: 'ミ后面跟小ュ', exampleWord: { word: 'ミュージック', reading: 'myuujikku', meaning: '音乐' } },
      { character: 'ミョ', romaji: 'myo', pronunciation: 'mio', strokes: 6, writingTip: 'ミ+小ョ', memoryTip: 'ミ后面跟小ョ', exampleWord: { word: 'ミョウジ', reading: 'myouji', meaning: '名字' } }
    ]
  },
  {
    name: 'リャ・リュ・リョ行',
    description: 'リ与ャ、ュ、ョ的拗音组合',
    kana: [
      { character: 'リャ', romaji: 'rya', pronunciation: 'lia', strokes: 8, writingTip: 'リ+小ャ', memoryTip: 'リ后面跟小ャ', exampleWord: { word: 'リャク', reading: 'ryaku', meaning: '略' } },
      { character: 'リュ', romaji: 'ryu', pronunciation: 'liu', strokes: 8, writingTip: 'リ+小ュ', memoryTip: 'リ后面跟小ュ', exampleWord: { word: 'リュウ', reading: 'ryuu', meaning: '龙' } },
      { character: 'リョ', romaji: 'ryo', pronunciation: 'lio', strokes: 8, writingTip: 'リ+小ョ', memoryTip: 'リ后面跟小ョ', exampleWord: { word: 'リョウ', reading: 'ryou', meaning: '旅行' } }
    ]
  },
  {
    name: 'ギャ・ギュ・ギョ行',
    description: 'ギ与ャ、ュ、ョ的拗音组合（浊音）',
    kana: [
      { character: 'ギャ', romaji: 'gya', pronunciation: 'gia', strokes: 5, writingTip: 'ギ+小ャ', memoryTip: 'ギ后面跟小ャ', exampleWord: { word: 'ギャク', reading: 'gyaku', meaning: '逆' } },
      { character: 'ギュ', romaji: 'gyu', pronunciation: 'giu', strokes: 5, writingTip: 'ギ+小ュ', memoryTip: 'ギ后面跟小ュ', exampleWord: { word: 'ギュウニュー', reading: 'gyuunyuu', meaning: '牛乳' } },
      { character: 'ギョ', romaji: 'gyo', pronunciation: 'gio', strokes: 5, writingTip: 'ギ+小ョ', memoryTip: 'ギ后面跟小ョ', exampleWord: { word: 'ギョウザ', reading: 'gyouza', meaning: '饺子' } }
    ]
  },
  {
    name: 'ジャ・ジュ・ジョ行',
    description: 'ジ与ャ、ュ、ョ的拗音组合（浊音）',
    kana: [
      { character: 'ジャ', romaji: 'ja', pronunciation: 'jia', strokes: 4, writingTip: 'ジ+小ャ', memoryTip: 'ジ后面跟小ャ', exampleWord: { word: 'ジャム', reading: 'jamu', meaning: '果酱' } },
      { character: 'ジュ', romaji: 'ju', pronunciation: 'jiu', strokes: 4, writingTip: 'ジ+小ュ', memoryTip: 'ジ后面跟小ュ', exampleWord: { word: 'ジュース', reading: 'juusu', meaning: '果汁' } },
      { character: 'ジョ', romaji: 'jo', pronunciation: 'jio', strokes: 4, writingTip: 'ジ+小ョ', memoryTip: 'ジ后面跟小ョ', exampleWord: { word: 'ジョウ', reading: 'jou', meaning: '女情' } }
    ]
  },
  {
    name: 'ビャ・ビュ・ビョ行',
    description: 'ビ与ャ、ュ、ョ的拗音组合（浊音）',
    kana: [
      { character: 'ビャ', romaji: 'bya', pronunciation: 'bia', strokes: 5, writingTip: 'ビ+小ャ', memoryTip: 'ビ后面跟小ャ', exampleWord: { word: 'ビャク', reading: 'byaku', meaning: '白' } },
      { character: 'ビュ', romaji: 'byu', pronunciation: 'biu', strokes: 5, writingTip: 'ビ+小ュ', memoryTip: 'ビ后面跟小ュ', exampleWord: { word: 'ビル', reading: 'biru', meaning: '建筑' } },
      { character: 'ビョ', romaji: 'byo', pronunciation: 'bio', strokes: 5, writingTip: 'ビ+小ョ', memoryTip: 'ビ后面跟小ョ', exampleWord: { word: 'ビョウキ', reading: 'byouki', meaning: '病気' } }
    ]
  },
  {
    name: 'ピャ・ピュ・ピョ行',
    description: 'ピ与ャ、ュ、ョ的拗音组合（半浊音）',
    kana: [
      { character: 'ピャ', romaji: 'pya', pronunciation: 'pia', strokes: 5, writingTip: 'ピ+小ャ', memoryTip: 'ピ后面跟小ャ', exampleWord: { word: 'ピャンピング', reading: 'pyanpingu', meaning: '乒乓球' } },
      { character: 'ピュ', romaji: 'pyu', pronunciation: 'piu', strokes: 5, writingTip: 'ピ+小ュ', memoryTip: 'ピ后面跟小ュ', exampleWord: { word: 'ピアノ', reading: 'piano', meaning: '钢琴' } },
      { character: 'ピョ', romaji: 'pyo', pronunciation: 'pio', strokes: 5, writingTip: 'ピ+小ョ', memoryTip: 'ピ后面跟小ョ', exampleWord: { word: 'ピョコ', reading: 'pyoko', meaning: '.firstChild' } }
    ]
  }
]
