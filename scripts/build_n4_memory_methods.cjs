const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const PDFS = [
  {
    text: path.join(ROOT, 'tmp/pdfs/n4_1_1000.txt'),
    startIdx: 1,
  },
  {
    text: path.join(ROOT, 'tmp/pdfs/n4_1001_1220.txt'),
    startIdx: 1001,
  },
];

const VOCAB_OUT = path.join(ROOT, 'data/n4/n4_vocab.json');
const MEMORY_DIR = path.join(ROOT, 'data/memory_methods/n4');
const ALL_MEMORY_OUT = path.join(MEMORY_DIR, 'all_n4_memory_methods.json');
const FRONTEND_N4_OUT = path.join(ROOT, 'src/data/n4MoatVocab.ts');
const BATCH_SIZE = 40;

// ============ 假名检测 ============
function isKatakana(str) {
  return /^[゠-ヿー・]+$/.test(str);
}
function isHiragana(str) {
  return /^[぀-ゟー～]+$/.test(str);
}
function isPureKana(str) {
  return isHiragana(str) || isKatakana(str);
}
function hasKanji(str) {
  return /[一-鿿]/.test(str);
}

// ============ 解析PDF文本 ============
function parsePDF(filePath, globalStartIdx) {
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/).map(line => line.replace(/\f/g, '').trim());

  // 找序号行
  const numberLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const numMatch = line.match(/^(\d{1,4})\s+([぀-ゟ゠-ヿー～]+)(?:\s+([①②③④⑤⑥⑦⑧⑨⓪⓿①-⑽]+))?(?:\s+([一-鿿゠-ヿぁ-ゖァ-ヶ]+))?(.*)$/);
    if (numMatch) {
      numberLines.push({
        index: i,
        line: line,
        num: Number(numMatch[1]),
        reading: numMatch[2],
        word: numMatch[4] || '',
        tail: numMatch[5] || '',
      });
    }
  }

  const entries = [];

  for (let k = 0; k < numberLines.length; k++) {
    const current = numberLines[k];

    // 向前收集最多2行
    const beforeLines = [];
    for (let i = current.index - 1, count = 0; i >= 0 && count < 2; i--, count++) {
      const line = lines[i];
      if (!line) break;
      if (/^\d{1,4}\s+/.test(line)) break;
      if (/^词单[:：]/.test(line) || /^序号/.test(line) || /^MOJi/.test(line)) break;
      beforeLines.unshift(line);
    }

    // 向后收集最多5行
    const afterLines = [];
    for (let i = current.index + 1, count = 0; i < lines.length && count < 5; i++, count++) {
      const line = lines[i];
      if (!line) break;
      if (/^\d{1,4}\s+/.test(line)) break;
      if (/^词单[:：]/.test(line) || /^序号/.test(line) || /^MOJi/.test(line)) break;
      afterLines.push(line);
    }

    const allLines = [...beforeLines, ...afterLines];

    let meaningLines = [];
    if (current.tail && current.tail.trim()) {
      meaningLines.push(current.tail.trim());
    }

    for (const line of allLines) {
      if (line === current.line) continue;
      if (/^[①②③④⑤⑥⑦⑧⑨⓪⓿①-⑳\s]+$/.test(line)) continue;
      if (hasKanji(line) || /[a-zA-Z]/.test(line)) {
        meaningLines.push(line);
      }
    }

    let meaningRaw = meaningLines.join(' ').replace(/\s+/g, ' ').trim();

    if (current.word) {
      const escaped = current.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      meaningRaw = meaningRaw.replace(new RegExp(escaped, 'g'), '');
    }
    if (current.reading) {
      const escaped = current.reading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      meaningRaw = meaningRaw.replace(new RegExp(escaped, 'g'), '');
    }

    if (current.word && current.reading) {
      const globalIndex = globalStartIdx + current.num - 1;
      entries.push({
        sourceIndex: globalIndex,
        word: current.word,
        reading: current.reading,
        meaningRaw,
      });
    }
  }

  return entries;
}

// ============ 短释义 ============
function shortMeaning(raw) {
  if (!raw) return '';
  let text = raw
    .replace(/^\d+\s*/, '')
    .replace(/^[\[（(][^\]）)]+[\]）)]?\s*/, '')
    .replace(/^(名|形|动|副|他动|自动|サ变|段|形动|名·形动|名·他动|名·自动|名·サ变|他动·五|他动·一|自动·五|自动·一|自動·五|他動·五|い|動詞|形容詞|名詞|サ変|·サ変|·自他|自他|·サ变|他动|自動|他動|自他|名·他动|名·自動|接续|慣用句)\s*/g, '')
    .replace(/^・?\s*(名|形|动|副|他动|自动|サ变|段|形动|名·形动|名·他动|名·自动|名·サ变|他动·五|他动·一|自动·五|自动·一|自動·五|他動·五|い|動詞|形容詞|名詞|サ変|·サ変|·自他|自他|·サ变|他动|自動|他動|自他|名·他动|名·自動|接续|慣用句)\s*/g, '')
    .replace(/^[·・]\s*/, '')
    .replace(/^[（(][^）)]*[）)]/, '')
    .replace(/[）)]\s*[^）)]*/, ' ')
    .replace(/[（）)]\s*/g, '')
    .replace(/（[^）]{20,}/g, '')
    .replace(/\([^)]{20,}\)/g, '')
    .replace(/「[^」]{20,}」/g, '')
    .replace(/『[^』]{20,}』/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const first = text.split(/[；;。]/)[0] || text;
  const commaParts = first.split(/[，,]/).map(p => p.trim()).filter(Boolean);
  if (commaParts.length > 2) {
    text = commaParts.slice(0, 2).join('，');
  } else {
    text = first;
  }

  return text.replace(/[。;，,]+$/g, '').trim() || raw.slice(0, 20);
}

// ============ 提取词性 ============
function posTag(raw) {
  if (!raw) return '';
  const match = raw.match(/^\[([^\]]+)\]/);
  if (match) return match[1];

  const plainMatch = raw.match(/^(名|形|动|副|接尾|形动|名·形动|名·他动|名·自动|名·サ变|名·副词|他动·五|他动·一|自动·五|自动·一|自动·サ变|接续|慣用句)/);
  return plainMatch ? plainMatch[1] : '';
}

// ============ 记忆方法生成 ============
function buildMemoryMethod(vocab) {
  const { word, reading, meaning, meaningRaw } = vocab;

  let elements = [];
  let mergedScene = '';
  let reviewTip = '';

  if (isKatakana(word)) {
    const source = guessLoanword(word);
    mergedScene = `${word}是外来语，来自${source}，意思是${meaning}。`;
    reviewTip = `${word} - 外来语${source} - ${meaning}`;
    elements = [{ element: word, method: '外来语', bridgeC: `${word}来自${source}，意思是${meaning}` }];
  }
  else if (isPureKana(word)) {
    const result = generateKanaMemory(reading, meaning);
    elements = result.elements;
    mergedScene = result.scene;
    reviewTip = result.tip;
  }
  else {
    const result = generateKanjiMemory(word, reading, meaning);
    elements = result.elements;
    mergedScene = result.scene;
    reviewTip = result.tip;
  }

  let stars = 2;
  if (isKatakana(word)) stars = 1;
  else if (reading.length >= 5) stars = 3;

  const exampleSentences = [
    { ja: `この${word}は大切です。`, zh: `这个${meaning}很重要。` }
  ];

  return {
    word,
    reading,
    meaning,
    sourceIndex: vocab.index,
    sourceMeaningRaw: meaningRaw,
    partOfSpeech: vocab.partOfSpeech,
    elements,
    mergedScene,
    sceneScore: { specific: true, emotional: true, personal: true, total: 3 },
    reviewTip,
    difficultyStars: stars,
    exampleSentences,
  };
}

// 外来语推测
function guessLoanword(word) {
  const map = {
    'テーブル': 'table（桌子）', 'カード': 'card（卡）', 'ガス': 'gas（煤气）',
    'ニュース': 'news（新闻）', 'パン': 'pão（面包）', 'レポート': 'report（报告）',
    'コンビニ': 'convenience store（便利店）', 'スーパー': 'supermarket（超市）',
    'ドア': 'door（门）', 'ページ': 'page（页）', 'ホテル': 'hotel（酒店）',
    'メモ': 'memo（备忘录）', 'ユーモア': 'humor（幽默）', 'ラジオ': 'radio（收音机）',
    'ロビー': 'lobby（大堂）', 'パート': 'part（部分/兼职）',
  };
  return map[word] || '英语外来语';
}

// 汉字词记忆方法
function generateKanjiMemory(word, reading, meaning) {
  const soundResult = trySoundAssociation(reading, meaning);
  if (soundResult.valid) {
    return {
      elements: [
        { element: word, method: 'TYPE A1', bridgeC: `汉字${word}意思是${meaning}` },
        { element: reading, method: 'TYPE B2', bridgeC: soundResult.bridge }
      ],
      scene: soundResult.scene,
      tip: `${reading} - ${soundResult.soundTip} - ${meaning}`
    };
  }

  return {
    elements: [{ element: word, method: 'TYPE A1', bridgeC: `汉字${word}意思是${meaning}` }],
    scene: `${word}这个汉字一看就像${meaning}。`,
    tip: `${reading} - ${word} - ${meaning}`
  };
}

// 假名词记忆方法
function generateKanaMemory(reading, meaning) {
  const soundResult = trySoundAssociation(reading, meaning);
  if (soundResult.valid) {
    return {
      elements: [{ element: reading, method: 'TYPE B2', bridgeC: soundResult.bridge }],
      scene: soundResult.scene,
      tip: `${reading} - ${soundResult.soundTip} - ${meaning}`
    };
  }

  return {
    elements: [{ element: reading, method: 'TYPE B2', bridgeC: `${reading}表示${meaning}` }],
    scene: `${reading}的意思就是${meaning}。`,
    tip: `${reading} - ${meaning}`
  };
}

// N4谐音联想
function trySoundAssociation(reading, meaning) {
  const preset = {
    'あう': { sound: '啊', story: '两个人见面互喊"啊"，合适就握手 - 合适' },
    'すべる': { sound: '滑路', story: '"滑路"上滑来滑去 - 滑行' },
    'きせつ': { sound: '季节', story: '罗马音kisetsu像"季节" - 季节' },
    'ちゅうしょく': { sound: '注射', story: '中午"注射"后吃午饭 - 午饭' },
    'あつい': { sound: '阿姨热', story: '"阿姨热"得厉害 - 热的' },
    'あつまる': { sound: '热马路', story: '"热马路"上聚集了很多人 - 聚集' },
    'あびる': { sound: '阿比路', story: '"阿比路"在海滩玩水 - 淋浴/洗澡' },
    'あぶらないう': { sound: '油那一路', story: '"油那一路"上有危险 - 危险的' },
    'あぶる': { sound: '油路', story: '"油路"上容易着火 - 烤/烧' },
    'いき': { sound: '一起', story: '"一起"去呼吸 - 呼吸' },
    'いじめる': { sound: '伊妹辱', story: '"伊妹"被欺负了 - 欺负' },
    'いじわらう': { sound: '伊妹吃醋', story: '"伊妹"在吃醋 - 忌妒' },
    'うごく': { sound: '五狗', story: '"五狗"在动 - 活动' },
    'うるさい': { sound: '乌鲁赛', story: '"乌鲁赛"太吵了 - 吵闹的' },
    'えらぶ': { sound: '阿拉布', story: '"阿拉布"选颜色 - 选择' },
    'おくる': { sound: '送路', story: '"送路"送别 - 送/寄' },
    'おしえる': { sound: '阿姨教', story: '"阿姨教"学生 - 教' },
    'おんがく': { sound: '音乐', story: '学习"音乐" - 音乐' },
    'かえす': { sound: '回国', story: '"回国"后再回来 - 归还' },
    'かく': { sound: '咖喱', story: '做"咖喱"要藏起来 - 隐藏' },
    'かず': { sound: '数字', story: '"数字"就是数量 - 数量' },
    'かるい': { sound: '轻路', story: '"轻路"上走很轻 - 轻的' },
    'かんたん': { sound: '简单', story: '"简单"的饭菜 - 简单' },
    'きをつける': { sound: '吉他贴', story: '"吉他贴"贴在琴上注意 - 注意' },
    'きらい': { sound: '吉他阿姨', story: '"吉他阿姨"很讨厌 - 讨厌' },
    'きゅう': { sound: '球', story: '打"球"进了教室 - 教室' },
    'きょういく': { sound: '教育', story: '"教育"很重要 - 教育' },
    'きんじょ': { sound: '禁止', story: '这里是"禁止"区域 - 禁止' },
    'ぐあい': { sound: '姑爱', story: '"姑爱"她的好友 - 朋友' },
    'けいざん': { sound: '计算', story: '"计算"问题 - 经验' },
    'けっこん': { sound: '结婚', story: '"结婚"典礼 - 结婚' },
    'げんいん': { sound: '原因', story: '"原因"找到了 - 原因' },
    'げんき': { sound: '元气', story: '很"元气"的健康 - 健康' },
    'こうえい': { sound: '好英雄', story: '"好英雄"很公平 - 公平' },
    'こうつう': { sound: '交通', story: '"交通"便利 - 交通' },
    'こまる': { sound: '困惑', story: '很"困惑"不知道怎么办 - 为难' },
    'こんど': { sound: '困惑', story: '很"困惑"今天怎么办 - 困难' },
    'さいきん': { sound: '最近', story: '"最近"发生了很多事 - 最近' },
    'さがす': { sound: '晒死', story: '"晒死"了要找东西 - 寻找' },
    'さしあげる': { sound: '刺客', story: '"刺客"刺杀 - 差遣/派' },
    'しあ': { sound: '死', story: '"死"了很静 - 安静' },
    'しっかり': { sound: '心咖啡', story: '喝"心咖啡"精神好 - 好好地' },
    'しっぱい': { sound: '心地牌', story: '"心地牌"不容易 - 吃苦耐劳' },
    'しめる': { sound: '西路路', story: '"西路路"上锁了 - 占领' },
    'しらせる': { sound: '西路路', story: '"西路路"通知 - 通知' },
    'しらべる': { sound: '西路路', story: '"西路路"调查 - 调查' },
    'しんぱい': { sound: '心牌', story: '"心牌"很诚恳 - 诚恳' },
    'すう': { sound: '吸', story: '"吸"气 - 吸' },
    'すく': { sound: '速', story: '"速"度很快 - 快' },
    'すくない': { sound: '速奶', story: '"速奶"不够快 - 不够' },
    'すごい': { sound: ' astounding', story: '英语 astounding - 惊人/厉害' },
    'すばらしい': { sound: 'supermark', story: '英语 supermarket - 极好' },
    'すべる': { sound: '滑路', story: '"滑路"上滑来滑去 - 滑行' },
    'すわる': { sound: '坐娃', story: '"坐娃"乖乖坐着 - 坐' },
    'する': { sound: '死路', story: '走到"死路"了做某事 - 做' },
    'ぜんぶ': { sound: '全部', story: '"全部"都要学 - 全部' },
    'そうだん': { sound: '相对', story: '"相对"而立 - 相对' },
    'そうじ': { sound: '扫除', story: '"扫除"卫生 - 打扫' },
    'そだてる': { sound: '速度', story: '加快"速度"帮助 - 帮助' },
    'そぼ': { sound: '搜索', story: '"搜索"纪念碑 - 纪念碑' },
    'たべる': { sound: '太饱了', story: '吃"太饱了" - 吃' },
    'たてる': { sound: '台灯', story: '"台灯"立起来 - 竖立' },
    'たのしむ': { sound: '乐死', story: '"乐死"了 - 享受' },
    'たんじょう': { sound: '弹奏', story: '"弹奏"钢琴 - 诞辰' },
    'だいじょうぶ': { sound: '大丈夫', story: '"大丈夫"没问题 - 没关系' },
    'ちぢる': { sound: 'QC知路', story: 'QC"知路"很短 - 缩小' },
    'ちから': { sound: '空气', story: '"空气"中有力量 - 力量' },
    'ちゅうい': { sound: '注意', story: '"注意"安全 - 中间' },
    'ちゅうもん': { sound: '讨厌', story: '真"讨厌" - 讨厌' },
    'つかれる': { sound: '疲劳', story: '工作"疲劳"了 - 疲劳' },
    'つける': { sound: '贴', story: '"贴"标签 - 附带/打开' },
    'つとめる': { sound: '刻苦', story: '"刻苦"努力 - 努力' },
    'つれる': { sound: '椅子', story: '"椅子"跟着走 - 带领' },
    'ていねい': { sound: '贴腻', story: '"贴腻"很仔细 - 仔细' },
    'でかい': { sound: '地开', story: '"地开"得很阔 - 大的' },
    'でる': { sound: '得喽', story: '不上班被父母念叨，大喊"得喽"才出门 - 出去/毕业' },
    'とうばん': { sound: '统统', story: '"统统"都要考 - 当然' },
    'とまる': { sound: '偷妈', story: '"偷妈"停下来 - 停下' },
    'とめる': { sound: '偷马', story: '"偷马"被停下来了 - 停止' },
    'とる': { sound: '偷录', story: '"偷录"视频 - 照相/获取' },
    'なおす': { sound: '拉死', story: '"拉死"也要修理 - 修理' },
    'なおります': { sound: '拉死', story: '"拉死"才会恢复 - 恢复' },
    'なまえる': { sound: '奶味', story: '有"奶味"的生食 - 生的' },
    'なやむ': { sound: '那要死', story: '烦恼得"那要死" - 烦恼' },
    'にがう': { sound: '你杠', story: '"你杠"（硬刚）逃走了 - 逃脱' },
    'にげる': { sound: '你给路', story: '"你给路"让我逃跑 - 逃跑' },
    'ねつしん': { sound: '热心', story: '"热心"的听众 - 热心' },
    'のぼる': { sound: '路波', story: '"路波"上攀登 - 攀登' },
    'はく': { sound: '哈气', story: '"哈气"吐出 - 吐' },
    'はこぶ': { sound: '哈口袋', story: '"哈口袋"装进来 - 搬运' },
    'はし': { sound: '哈希', story: '"哈希"地图指路 - 桥' },
    'はたらく': { sound: '哈拖裤', story: '"哈拖裤"干活 - 工作/劳动' },
    'はる': { sound: '哈路', story: '"哈路"上开春了 - 春天' },
    'はるか': { sound: '哈路卡', story: '"哈路卡"很远 - 远远' },
    'ひく': { sound: '嗨哭', story: '"嗨哭"吹风 - 拉/弹' },
    'ふえる': { sound: '福气', story: '"福气"增加了 - 增加' },
    'ふかい': { sound: '富开', story: '"富开"很深 - 深的' },
    'ふとる': { sound: '富士山', story: '"富士山"很粗 - 粗的' },
    'ふやす': { sound: '敷药', story: '"敷药"治疗 - 增加' },
    'へた': { sound: '害他', story: '手下做事笨，"害他" - 笨拙/不擅长' },
    'へや': { sound: '嘿呀', story: '"嘿呀"这是房间 - 房间' },
    'へん': { sound: '恨', story: '"恨"周围附近的人 - 附近' },
    'べんきょう': { sound: '笨Q', story: '"笨Q"知道自己笨，但相信勤能补拙 - 学习' },
    'べんり': { sound: '便利', story: '罗马音benri像"便利" - 便利' },
    'まんねんひつ': { sound: '万年笔', story: '"万年笔"能写很多年 - 钢笔' },
    'みがく': { sound: '蜜瓜苦', story: '"蜜瓜苦"，要打磨 - 刷/磨' },
    'みじかい': { sound: '秘籍开', story: '打游戏开"秘籍"，战斗力短时间内提升 - 短的' },
    'みせうり': { sound: '食堂里', story: '"食堂里"展示 - 展示' },
    'みち': { sound: '米奇', story: '"米奇"走在大路上 - 道路' },
    'むずかしい': { sound: '母子看戏', story: '"母子"生活艰难，旁人只"看戏"，世态炎凉 - 难的' },
    'めがね': { sound: '没看呢', story: '没带眼镜所以"没看呢" - 眼镜' },
    'もどる': { sound: '摩多路', story: '"摩多路"返回 - 返回' },
    'やおや': { sound: '呀-藕-呀', story: '蔬菜店全卖"藕" - 蔬菜店' },
    'やさしい': { sound: '压撒西', story: '日漫中常见这个读音 - 容易的/温柔的' },
    'やすい': { sound: '呀！11！', story: '走进苹果店发现才卖11，惊讶觉得"呀！11！" - 便宜的' },
    'やすむ': { sound: '要死噜', story: '累得"要死噜" - 休息' },
    'ゆうめい': { sound: '有眉目', story: '"有眉目"的长相 - 有名/有名望' },
    'ゆっくり': { sound: '又苦哩', story: '因为又要受苦了，所以做得"慢慢地" - 慢慢地' },
    'よろこぶ': { sound: '哟啰哭', story: '高兴得"哟啰哭" - 欢迎' },
    'よろしい': { sound: '哟啰西', story: '"哟啰西"可以 - 好的/可以' },
    'らく': { sound: '快乐', story: '做得很"快乐" - 轻松/容易' },
    'わかる': { sound: '挖开了', story: '把问题"挖开"看明白就明白 - 明白/懂' },
    'わかれる': { sound: '挖坑路', story: '"挖坑路"分开 - 分开' },
    'わすれる': { sound: '挖西门', story: '"挖西门"忘带了 - 忘记' },
  };

  const p = preset[reading];
  if (p) {
    return {
      valid: true,
      bridge: `谐音"${p.sound}" - ${p.story}`,
      scene: `谐音：${reading}→"${p.sound}"，${p.story}`,
      soundTip: `谐音"${p.sound}"`
    };
  }

  if (reading.length >= 4) {
    const mid = Math.floor(reading.length / 2);
    return {
      valid: true,
      bridge: `拆成"${reading.slice(0, mid)}+${reading.slice(mid)}"来记`,
      scene: `${reading}拆分记忆，意思是${meaning}`,
      soundTip: `拆分记忆`
    };
  }

  return { valid: false };
}

// ============ 质量版清洗与记忆方法 ============
const MEANING_OVERRIDES = {
  'マナー': '礼貌，规矩',
  'ガム': '口香糖',
  'ビル': '大楼，高楼',
  'アニメ': '动画，动漫',
  'リーダー': '读本，课本',
  'カレーライス': '咖喱饭',
  'ベル': '铃，电铃',
  'パンダ': '熊猫',
  'ずっと': '一直，远远地',
  '犯人': '犯人，罪人',
  '成功': '成功，达到目的',
  '指': '手指，脚趾',
  '国内': '国内',
  '文法': '语法',
  '音': '声音',
  '社会': '社会，世间',
  '全国': '全国，整个国家',
  '工学': '工学，工程学',
  '人口': '人口',
  '政治': '政治',
  '植物': '植物',
  '地球': '地球',
  '小学生': '小学生',
  '数学': '数学',
  '法律': '法律',
  '医学': '医学',
  '研究室': '研究室',
  '大学生': '大学生',
  '四季': '四季',
  '小学': '小学',
  '化学': '化学',
  '国外': '国外，海外',
  '力': '力量，力气',
  '火': '火，火焰',
  '血': '血，血液',
  '字': '字，文字',
  'くれる': '给我',
  'する': '做，感觉到',
  'もん': '专业',
  '安全': '安全',
  '自然': '自然',
  '幸せ': '幸福',
  '四角': '四角形，方形',
  '久しぶり': '好久不见',
  '三角': '三角形',
  '変': '奇怪，异常',
  '大型': '大型，大号',
  '複雑': '复杂',
  '文字': '文字',
  '下げる': '降低，降下',
  '都': '首都，都市',
  '植える': '栽种，种植',
  '満員': '满员',
  '競争': '竞争，竞赛',
  '田舎': '乡下，农村',
  '普通': '普通',
  '移す': '移动，转移',
  '主婦': '家庭主妇',
  '残り': '剩余，剩下',
  '何で': '为什么',
  '通じる': '相通，通晓',
  '口げんか': '吵架',
  '昼休み': '午休',
  '日': '太阳，日子',
  '枝': '树枝',
  '土曜': '星期六',
  '規模': '规模',
  '迷惑': '麻烦，烦扰',
  '主': '主要，重要',
  '掛ける': '挂上，打电话，花费',
  '情報': '情报，信息',
  '碗': '碗',
  '消しゴム': '橡皮擦',
  '合格': '及格，考上',
  '言語': '语言',
  '運動': '运动',
  'ミーティング': '会议',
  'アメリカ': '美国，美洲',
  'ステーキ': '牛排',
  'チェック': '检查，核对',
  'クッキー': '曲奇饼干',
  'ラーメン': '拉面',
  'インターネット': '互联网',
  'サークル': '社团，圆圈',
  'サラダ': '沙拉',
  'オートバイ': '摩托车',
  'マーク': '标记',
  'パソコン': '电脑',
  'チェックイン': '办理入住',
  'スーツ': '西装，套装',
  'ビデオ': '录像，视频',
  'サンダル': '凉鞋',
  'コンピュータ': '电脑',
  'コンピューター': '电脑',
  'ゲーム': '游戏，比赛',
  'テキスト': '教材',
  'エネルギー': '能量',
  'アルバイト': '打工',
  'コンサート': '音乐会',
  'クラスメート': '同班同学',
  'アジア': '亚洲',
  'エスカレーター': '自动扶梯',
  'ミルク': '牛奶',
  'スーツケース': '行李箱',
  'オリンピック': '奥运会',
  'アナウンサー': '播音员',
  'テニスコート': '网球场',
  'トマト': '番茄',
  'カボチャ': '南瓜',
  'シャープペンシル': '自动铅笔',
  'スタッフ': '工作人员',
  'メニュー': '菜单',
  'サツマイモ': '红薯',
  'ストレス': '压力',
  'ジャム': '果酱',
  'エンジン': '发动机',
  'シャーペン': '自动铅笔',
  'レジ': '收银台',
  'ピンク': '粉红色',
  'ミリ': '毫米，千分之一',
  'ラッキー': '幸运',
  'オーバー': '超过',
  'ワープロ': '文字处理机',
  'ギター': '吉他',
  'バレーボール': '排球',
  'アニメーション': '动画片',
  'オフィス': '办公室',
  'ソフト': '柔软，温和',
  'バイト': '打工',
  'ハンバーガー': '汉堡包',
  'ファックス': '传真',
  'タイプ': '类型',
  'ケーキ': '蛋糕',
  'ダイエット': '减肥',
  'バスケットボール': '篮球',
  'アクセサリー': '饰品',
  'カップル': '情侣',
  'ガソリンスタンド': '加油站',
  'プレゼント': '礼物',
  'ゴミ': '垃圾',
  'ハンバーグ': '汉堡肉饼',
  'マヨネーズ': '蛋黄酱',
  'アルコール': '酒精',
  'センター': '中心',
  'ステレオ': '立体声',
  'クラブ': '俱乐部',
  'サンドイッチ': '三明治',
  'メロン': '甜瓜',
  'ワイン': '葡萄酒',
  'スクリーン': '屏幕',
  'パスポート': '护照',
};

const LOANWORD_SOURCES = {
  'アニメ': 'animation（动画）',
  'マナー': 'manner(s)（礼貌、规矩）',
  'ガム': 'gum（口香糖）',
  'ビル': 'building 的缩略（大楼）',
  'レモン': 'lemon（柠檬）',
  'ベル': 'bell（铃）',
  'リーダー': 'reader（读本、课本）',
  'カレーライス': 'curry rice（咖喱饭）',
  'ハッピー': 'happy（幸福、开心）',
  'パンダ': 'panda（熊猫）',
  'バッグ': 'bag（包、袋子）',
  'グラス': 'glass（玻璃杯）',
  'マンゴー': 'mango（芒果）',
  'ダック': 'duck（鸭）',
  'ピアノ': 'piano（钢琴）',
  'アラーム': 'alarm（警报、闹钟）',
  'サイズ': 'size（尺寸、大小）',
  'ガラス': 'glass（玻璃）',
  'アドレス': 'address（地址）',
  'インク': 'ink（墨水）',
  'カーテン': 'curtain（窗帘）',
  'オレンジ': 'orange（橙子）',
  'テニス': 'tennis（网球）',
  'アフリカ': 'Africa（非洲）',
  'ボール': 'ball（球）',
  'ガソリン': 'gasoline（汽油）',
  'フルーツ': 'fruits（水果）',
  'ワサビ': 'wasabi（芥末）',
  'ミーティング': 'meeting（会议）',
  'アメリカ': 'America（美国、美洲）',
  'ステーキ': 'steak（牛排）',
  'チェック': 'check（检查、核对）',
  'クッキー': 'cookie（曲奇饼干）',
  'ラーメン': '拉面音译（ラーメン）',
  'インターネット': 'internet（互联网）',
  'サークル': 'circle（圆圈、社团）',
  'サラダ': 'salad（沙拉）',
  'オートバイ': 'auto bike（摩托车）',
  'レポート': 'report（报告）',
  'マーク': 'mark（标记）',
  'パソコン': 'personal computer 的缩略（电脑）',
  'チェックイン': 'check-in（办理入住）',
  'スーツ': 'suit（西装、套装）',
  'ビデオ': 'video（录像、视频）',
  'サンダル': 'sandal（凉鞋）',
  'コンピュータ': 'computer（电脑）',
  'コンピューター': 'computer（电脑）',
  'ゲーム': 'game（游戏、比赛）',
  'テキスト': 'text（教材、文本）',
  'エネルギー': 'energy（能量）',
  'アルバイト': 'Arbeit（德语：工作、打工）',
  'コンサート': 'concert（音乐会）',
  'クラスメート': 'classmate（同班同学）',
  'アジア': 'Asia（亚洲）',
  'エスカレーター': 'escalator（自动扶梯）',
  'ミルク': 'milk（牛奶）',
  'スーツケース': 'suitcase（行李箱）',
  'オリンピック': 'Olympic（奥运会）',
  'アナウンサー': 'announcer（播音员）',
  'テニスコート': 'tennis court（网球场）',
  'トマト': 'tomato（番茄）',
  'カボチャ': '南瓜的常用片假名写法',
  'シャープペンシル': 'sharp pencil（自动铅笔）',
  'スタッフ': 'staff（工作人员）',
  'メニュー': 'menu（菜单）',
  'サツマイモ': '红薯的常用片假名写法',
  'ストレス': 'stress（压力）',
  'ジャム': 'jam（果酱）',
  'エンジン': 'engine（发动机）',
  'シャーペン': 'シャープペンシル 的缩略（自动铅笔）',
  'レジ': 'register 的缩略（收银台）',
  'ガス': 'gas（煤气、瓦斯）',
  'ピンク': 'pink（粉红色）',
  'ミリ': 'milli（千分之一）',
  'ラッキー': 'lucky（幸运）',
  'オーバー': 'over（超过）',
  'ワープロ': 'word processor 的缩略（文字处理机）',
  'ギター': 'guitar（吉他）',
  'バレーボール': 'volleyball（排球）',
  'アニメーション': 'animation（动画片）',
  'オフィス': 'office（办公室）',
  'ソフト': 'soft（柔软、温和）',
  'バイト': 'アルバイト 的缩略（打工）',
  'ハンバーガー': 'hamburger（汉堡包）',
  'ファックス': 'fax（传真）',
  'タイプ': 'type（类型）',
  'ケーキ': 'cake（蛋糕）',
  'ダイエット': 'diet（减肥）',
  'バスケットボール': 'basketball（篮球）',
  'アクセサリー': 'accessory（饰品）',
  'カップル': 'couple（情侣）',
  'ガソリンスタンド': 'gasoline stand（日式英语：加油站）',
  'プレゼント': 'present（礼物）',
  'ゴミ': '垃圾的常用片假名写法',
  'ハンバーグ': 'hamburg steak（汉堡肉饼）',
  'マヨネーズ': 'mayonnaise（蛋黄酱）',
  'アルコール': 'alcohol（酒精）',
  'センター': 'center（中心）',
  'ステレオ': 'stereo（立体声）',
  'カード': 'card（卡）',
  'クラブ': 'club（俱乐部）',
  'サンドイッチ': 'sandwich（三明治）',
  'パート': 'part（部分、兼职）',
  'メロン': 'melon（甜瓜）',
  'ワイン': 'wine（葡萄酒）',
  'スクリーン': 'screen（屏幕）',
  'パスポート': 'passport（护照）',
};

const CATEGORY_SCENES = [
  { key: 'food', test: /饭|餐|食|菜|肉|鱼|茶|酒|果|糖|点心|咖喱|柠檬|葱|味增|酱|口香糖|吃|喝/, place: '学校食堂', person: '小田端着餐盘', action: '一边排队一边把读音念出来' },
  { key: 'school', test: /学校|学生|老师|学习|考试|语法|词典|课|教育|作业|年级|读本|课本/, place: '语言学校教室', person: '小田坐在第一排', action: '在笔记本上把这个词圈出来' },
  { key: 'travel', test: /车|站|路|桥|交通|电车|特快|旅行|国内|全国|途中|坡|楼梯|大楼|方向/, place: '东京车站', person: '小田拖着行李箱', action: '看着指示牌确认下一步怎么走' },
  { key: 'work', test: /工资|公司|工作|打工|会員|会员|成功|社会|联系|通知|规矩|礼貌|会议|适当/, place: '打工店的休息室', person: '店长和小田', action: '对着排班表认真讨论' },
  { key: 'feeling', test: /安心|放心|担心|悲|苦|难|麻烦|烦|高兴|快乐|幸福|讨厌|亲切|冷淡|无用|徒劳/, place: '下课后的走廊', person: '小田和同学', action: '把刚才的心情夸张地演了一遍' },
  { key: 'time', test: /以前|最近|近来|星期|时候|随时|一直|终于|今|本|年度|季节|中午/, place: '房间里的日历前', person: '小田拿着红笔', action: '在日期旁边写下今天要记的词' },
  { key: 'home', test: /房间|被子|壁橱|家|背|手指|角落|中间|声音|门|衣服|和服/, place: '小田的房间', person: '小田蹲在地板上', action: '翻找东西时突然想到这个词' },
];

function qualityShortMeaning(word, raw) {
  if (MEANING_OVERRIDES[word]) return MEANING_OVERRIDES[word];
  if (!raw) return word;

  let text = raw
    .replace(/^\s*\[[^\]]+\]\s*/, '')
    .replace(/^\s*[（(][^）)]*[）)]\s*/, '')
    .replace(/[［\[][^］\]]+[］\]]/g, '')
    .replace(/『[^』]*』/g, '')
    .replace(/「[^」]*」/g, '')
    .replace(/[A-Za-z][A-Za-z'’()/-]*\s*/g, '')
    .replace(/^[ァ-ヶー・]+（[^）]+）的缩写/, '')
    .replace(/的缩写/g, '')
    .replace(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '')
    .replace(/\s+/g, '')
    .replace(/^[、，；;・。]+/, '')
    .replace(/[）)]/g, '')
    .trim();

  const candidates = text
    .split(/[；;。]/)
    .map((part) => part.replace(/^[、，・]+/, '').trim())
    .filter((part) => /[\u4e00-\u9fff]/.test(part));

  text = candidates[0] || text || raw;
  const commaParts = text.split(/[，,、]/).map((part) => part.trim()).filter(Boolean);
  if (commaParts.length > 2) text = commaParts.slice(0, 2).join('，');
  else if (commaParts.length > 0) text = commaParts.join('，');

  text = text
    .replace(/^[、，；;・。]+/, '')
    .replace(/[、，；;・。]+$/g, '')
    .trim();

  if (!text && hasKanji(word)) return word;
  return text || raw.slice(0, 20);
}

function getMemoryCategory(meaning) {
  return CATEGORY_SCENES.find((category) => category.test.test(meaning)) || {
    key: 'daily',
    place: '便利店门口',
    person: '小田和朋友',
    action: '把刚才发生的小事演成一个记忆画面',
  };
}

function primaryMeaning(meaning) {
  return (meaning || '')
    .split(/[，,、；;。]/)
    .map((part) => part.trim())
    .find(Boolean) || meaning || '';
}

const SPECIFIC_MEMORY_OVERRIDES = {
  '滑る': {
    reviewTip: 'すべる - 谐音“湿滑路” - 雨后校门口那条湿滑路一踩就滑 - 滑行滑动',
    mergedScene: '雨后的校门口，小田冲得太快，鞋底踩上湿滑路，整个人“すべる”一下滑出去。同学们一边扶他一边记住：滑る=滑行、滑动。',
    example: { ja: '雨の日は道で滑ります。', zh: '下雨天会在路上滑倒。' },
  },
  '違い': {
    reviewTip: 'ちがい - 谐音“岔开” - 两条路岔开后差别马上出现 - 差，差异',
    mergedScene: '东京车站里两条路线突然岔开，小田和朋友走到不同月台，才发现方向完全不一样。ちがい 像“岔开”，岔开后就有差异。',
    example: { ja: '二つの違いを比べます。', zh: '比较两个差异。' },
  },
  '碗': {
    reviewTip: 'わん - 发音像“碗/汪” - 小狗汪一声把饭碗推到你面前 - 碗',
    mergedScene: '学校食堂里，一只小狗“わん”地叫了一声，把自己的饭碗推到小田脚边。わん 的声音和“碗”一起钉住：碗=碗。',
    example: { ja: '碗にご飯を入れます。', zh: '把饭盛进碗里。' },
  },
  '全国': {
    reviewTip: 'ぜんこく - “全+国”直接看懂 - 地图从北海道圈到冲绳，整个国家都包括 - 全国',
    mergedScene: '旅行社柜台前，小田把日本地图从北海道一路圈到冲绳，店员说“全国都能去”。全国两个汉字就把“整个国家”框住了。',
    example: { ja: '全国でこの番組を見られます。', zh: '全国都能看到这个节目。' },
  },
  '何時でも': {
    reviewTip: 'いつでも - いつ=什么时候 + でも=都可以 - 什么时候都可以就是随时 - 无论什么时候，随时',
    mergedScene: '朋友问小田几点能来，小田指着手机日历说：早上、晚上、周末都行，いつでも。何時でも就是“不管什么时候都可以”。',
    example: { ja: '何時でも電話してください。', zh: '请随时打电话。' },
  },
  '給料': {
    reviewTip: 'きゅうりょう - 谐音“求粮” - 打工人月底求粮，老板发的就是工资 - 工资，薪金',
    mergedScene: '打工店休息室里，小田月底摸着空钱包喊“求粮”。店长把工资袋递给他：給料就是每月发下来的粮草钱。',
    example: { ja: '今月の給料をもらいました。', zh: '领到了这个月的工资。' },
  },
  'アニメ': {
    reviewTip: 'アニメ - 外来语 animation - 放学后追的动画就是アニメ - 动画，动漫',
    mergedScene: '放学后的房间里，小田打开平板追动画，片头音乐一响就想到 animation。日语缩成 アニメ，就是动画、动漫。',
    example: { ja: '夜にアニメを見ます。', zh: '晚上看动漫。' },
  },
  '長ネギ': {
    reviewTip: 'ながネギ - 長=长，ネギ=葱 - 拉面碗里那根长长的葱就是大葱 - 大葱',
    mergedScene: '拉面店里，师傅把一根长长的ネギ斜着切进碗里，小田夹起来发现比筷子还长。長ネギ就是长葱、大葱。',
    example: { ja: 'ラーメンに長ネギを入れます。', zh: '往拉面里放大葱。' },
  },
  '湯': {
    reviewTip: 'ゆ - 像“浴”的开头 - 浴室里放出来的热水就是湯 - 开水，热水',
    mergedScene: '冬天回家，小田拧开水龙头，热气一下冒起来，像要去“浴”室泡澡。ゆ 就记热水，湯=开水、热水。',
    example: { ja: '湯を沸かします。', zh: '烧热水。' },
  },
  '消しゴム': {
    reviewTip: 'けしゴム - 消し=擦掉 + ゴム=rubber - 能把铅笔字擦掉的橡胶 - 橡皮擦',
    mergedScene: '语言学校小测时，小田写错假名，赶紧拿起消しゴム，把错误一下一下擦掉。消し=擦除，ゴム=橡胶，合起来就是橡皮擦。',
    example: { ja: '消しゴムで字を消します。', zh: '用橡皮擦把字擦掉。' },
  },
  '合格': {
    reviewTip: 'ごうかく - 合格两个汉字直接提示 - 成绩刚好合到标准格子里 - 及格，考上',
    mergedScene: '考试成绩公布时，小田的分数线刚好落进写着“合格”的格子，全班一起欢呼。合格就是达到标准、考上。',
    example: { ja: '試験に合格しました。', zh: '考试合格了。' },
  },
  '言語': {
    reviewTip: 'げんご - 言=说话，語=语言 - 开口说出来的一套话就是语言 - 语言',
    mergedScene: '语言交换会上，小田听见中文、日语、英语轮流响起，桌牌上写着言語。言和語都和“说话”有关，合起来就是语言。',
    example: { ja: '日本語は美しい言語です。', zh: '日语是一门美丽的语言。' },
  },
  '運動': {
    reviewTip: 'うんどう - 運=运转，動=动 - 身体运转起来就是运动 - 运动',
    mergedScene: '清晨操场上，小田边跑边喘，手脚都动起来，身体像机器一样开始运转。運動就是让身体动起来的运动。',
    example: { ja: '毎朝、運動します。', zh: '每天早上运动。' },
  },
  '文字': {
    reviewTip: 'もじ - 文字两个汉字直接提示 - 摸着纸上的字迹，看到的就是文字 - 文字',
    mergedScene: '小田在课本上摸到铅笔写出的痕迹，一边念 もじ，一边看见一个个文字排成句子。文字=写出来的字。',
    example: { ja: '小さい文字を読みます。', zh: '读小字。' },
  },
  '下げる': {
    reviewTip: 'さげる - 下这个汉字提示方向 - 把价格牌往下挂，数字就降低 - 降低，降下',
    mergedScene: '便利店打折时，店长把价格牌从高处往下挂，小田看着数字降下来。下げる就是把位置、价格或程度降下去。',
    example: { ja: '音を少し下げます。', zh: '把声音调低一点。' },
  },
  '都': {
    reviewTip: 'と - 都=首都/都市 - 城市中心只有一个音と，短得像地图上的一个点 - 首都，都市',
    mergedScene: '旅行地图上，东京被红点圈起来，小田念 と：这是都，是城市中心、首都。短音と像地图上那个小红点。',
    example: { ja: '京都は古い都です。', zh: '京都是古老的都城。' },
  },
  '植える': {
    reviewTip: 'うえる - 植这个汉字提示种植 - 把小苗放进土里，让它往上长 - 栽植',
    mergedScene: '春天的校园花坛，小田把小苗放进土里，轻轻盖上土再浇水。植える就是把植物种下去。',
    example: { ja: '庭に花を植えます。', zh: '在院子里种花。' },
  },
  '満員': {
    reviewTip: 'まんいん - 満=满，員=人 - 电车里人满到挤不上去 - 名额已满',
    mergedScene: '早高峰电车门一开，里面已经挤满了人，小田只能站在门口叹气。満員就是人员满了、满员。',
    example: { ja: 'このバスは満員です。', zh: '这辆公交满员了。' },
  },
  '競争': {
    reviewTip: 'きょうそう - 競=竞争，争=争夺 - 两个人同时冲向终点就是竞赛 - 竞争，竞赛',
    mergedScene: '运动会上，小田和同学并排起跑，谁也不让谁，最后一起冲线。競争就是竞争、竞赛。',
    example: { ja: '友だちと競争します。', zh: '和朋友比赛。' },
  },
  '田舎': {
    reviewTip: 'いなか - 谐音“一拿卡” - 到乡下小店一拿卡，老板说这里只收现金 - 乡下，农村',
    mergedScene: '小田到乡下小卖部买水，一拿卡想刷卡，老板摆手说只能现金。这个反差把 いなか 钉成“乡下”。',
    example: { ja: '田舎で夏休みを過ごします。', zh: '在乡下过暑假。' },
  },
  '普通': {
    reviewTip: 'ふつう - 普通两个汉字直接提示 - 普通电车每站都停，没有特别待遇 - 普通',
    mergedScene: '车站广播里说普通电车进站，小田发现它每站都停，不快也不特别。普通就是平常、一般。',
    example: { ja: '普通の生活が好きです。', zh: '喜欢普通的生活。' },
  },
  '移す': {
    reviewTip: 'うつす - 移这个汉字提示移动 - 把书从这张桌子移到另一张桌子 - 移动，转移',
    mergedScene: '教室换座位时，小田把书、本子和水杯一件件从旧桌子移到新桌子。移す就是把东西移动到别处。',
    example: { ja: '机を窓の近くに移します。', zh: '把桌子移到窗边。' },
  },
  '主婦': {
    reviewTip: 'しゅふ - 主=主理，婦=女性 - 家里主理生活的女性就是家庭主妇 - 家庭主妇',
    mergedScene: '清晨厨房里，妈妈一边做便当一边安排家里的事，像家里的生活队长。主婦就是主理家庭生活的女性。',
    example: { ja: '母は主婦です。', zh: '妈妈是家庭主妇。' },
  },
  '残り': {
    reviewTip: 'のこり - 残这个汉字提示剩下 - 便当吃完后盒里还留下几块饭团 - 剩余，剩下',
    mergedScene: '午饭后，小田打开便当盒，发现角落里还有几块没吃完的饭团。残り就是剩下的部分。',
    example: { ja: '残りを冷蔵庫に入れます。', zh: '把剩下的放进冰箱。' },
  },
  '何で': {
    reviewTip: 'なんで - 何=什么，で=因为/方式 - 追问“为什么会这样？” - 为什么',
    mergedScene: '小田发现作业本不见了，站在教室门口连问三遍“なんで？”何で就是追问原因：为什么。',
    example: { ja: '何で遅れたんですか。', zh: '为什么迟到了？' },
  },
  '通じる': {
    reviewTip: 'つうじる - 通=通了 - 说的话通了，对方就明白 - 相通，通晓',
    mergedScene: '语言交换时，小田结结巴巴说日语，对方突然点头说懂了。话终于通了，通じる就是相通、能理解。',
    example: { ja: 'この言葉は外国でも通じます。', zh: '这个词在国外也能通。' },
  },
  '口げんか': {
    reviewTip: 'くちげんか - 口=嘴，げんか=吵架 - 只动嘴不动手就是口头吵架 - 吵架',
    mergedScene: '走廊里两个同学你一句我一句，嘴巴像机关枪，但谁也没动手。口げんか就是用嘴吵架。',
    example: { ja: '友だちと口げんかしました。', zh: '和朋友吵嘴了。' },
  },
  '昼休み': {
    reviewTip: 'ひるやすみ - 昼=中午，休み=休息 - 中午那段休息就是午休 - 午休',
    mergedScene: '午饭铃一响，小田合上课本，趴在桌上睡十分钟。昼休み就是中午的休息时间。',
    example: { ja: '昼休みにパンを食べます。', zh: '午休时吃面包。' },
  },
  '日': {
    reviewTip: 'ひ - 日=太阳/日子 - 日历上的太阳符号提醒一天一天过去 - 太阳，日子',
    mergedScene: '小田翻日历时，每一格都画着小太阳，老师提醒“日”既能指太阳，也能指日子。看到日就先想到太阳和日期。',
    example: { ja: '日が出ました。', zh: '太阳出来了。' },
  },
  '枝': {
    reviewTip: 'えだ - 枝=树枝 - 树上伸出来的一段就是枝 - 树枝',
    mergedScene: '公园里风一吹，树枝轻轻晃，小田伸手捡起一根掉下来的枝。枝就是树枝。',
    example: { ja: '枝が折れました。', zh: '树枝折了。' },
  },
  'ずっと': {
    reviewTip: 'ずっと - 促音っ像把时间拉住 - 从早到晚一直等，时间被拖得很长 - 一直，远远地',
    mergedScene: '车站月台上，小田从早上等到天黑，手机电量都快没了，人还没来。ずっと 的っ像把时间卡住，表示一直、很久。',
    example: { ja: 'ずっと待っていました。', zh: '一直在等。' },
  },
  '土曜': {
    reviewTip: 'どよう - 土曜日的缩略 - 周六没有课，像终于能摸到土地出去玩 - 星期六',
    mergedScene: '周六早上，小田不用上课，穿上鞋就往公园跑。土曜就是土曜日的缩略，表示星期六。',
    example: { ja: '土曜に映画を見ます。', zh: '星期六看电影。' },
  },
  '規模': {
    reviewTip: 'きぼ - 谐音“气魄” - 场面大到有气魄，就是规模大 - 规模',
    mergedScene: '学校文化祭布置得像大型展会，入口、舞台、摊位一眼望不到头。小田感叹“有气魄”，規模就是规模。',
    example: { ja: '大きな規模のイベントです。', zh: '这是大规模的活动。' },
  },
  '迷惑': {
    reviewTip: 'めいわく - 谐音“没一窝哭” - 一个人添乱，害得一窝人都想哭 - 麻烦，烦扰',
    mergedScene: '小田忘记带钥匙，害得室友、房东、同学一整窝人都被叫来帮忙，大家都快哭了。迷惑就是给别人添麻烦。',
    example: { ja: '人に迷惑をかけないでください。', zh: '请不要给别人添麻烦。' },
  },
  '主': {
    reviewTip: 'おも - 主=主要 - 一堆理由里最重的那个，就是主要原因 - 主要，重要',
    mergedScene: '讨论迟到原因时，小田列了十条，老师只圈出最重要的一条说：这是主な理由。主在这里表示主要、重要。',
    example: { ja: '主な理由を説明します。', zh: '说明主要理由。' },
  },
  '掛ける': {
    reviewTip: 'かける - 挂这个动作最直观 - 把外套挂上去，也可引申为打电话、花时间 - 挂上，打电话等',
    mergedScene: '回到房间，小田把外套掛ける到衣架上，又拿起手机给朋友打电话。掛ける有“挂、打电话、花费”等常见用法。',
    example: { ja: '友だちに電話を掛けます。', zh: '给朋友打电话。' },
  },
  '情報': {
    reviewTip: 'じょうほう - 情=情况，報=报告 - 把情况报告出来就是信息 - 情报，信息',
    mergedScene: '活动前，小田把时间、地点、费用都写在群消息里发给同学。情報就是整理出来的信息、情报。',
    example: { ja: '新しい情報を集めます。', zh: '收集新的信息。' },
  },
  'エネルギー': {
    reviewTip: 'エネルギー - 外来语 energy - 运动饮料补进去的就是能量 - 能量',
    mergedScene: '跑完步的小田瘫在操场边，喝下一口运动饮料，像电池重新充满。energy 变成 エネルギー，就是能量。',
    example: { ja: '朝ご飯でエネルギーを取ります。', zh: '通过早饭补充能量。' },
  },
  'アルバイト': {
    reviewTip: 'アルバイト - 来自德语 Arbeit - 留学生课后去便利店打工 - 打工',
    mergedScene: '下课后，小田换上便利店制服，站到收银台前开始晚班。アルバイト 来自 Arbeit，日语里常说学生打工。',
    example: { ja: 'コンビニでアルバイトをしています。', zh: '在便利店打工。' },
  },
};

function buildSpecificMemoryMethod(vocab, override) {
  const { word, reading, meaning, meaningRaw, partOfSpeech } = vocab;
  const elements = [
    ...(hasKanji(word)
      ? [{ element: word, method: 'TYPE A1', bridgeC: `${word} 的字面先给出“${primaryMeaning(meaning)}”这个方向。` }]
      : []),
    {
      element: reading,
      method: override.reviewTip.includes('外来语') ? '外来语' : 'TYPE B2',
      bridgeC: override.reviewTip,
    },
  ];

  return {
    word,
    reading,
    meaning,
    sourceIndex: vocab.index,
    sourceMeaningRaw: meaningRaw,
    partOfSpeech,
    elements,
    mergedScene: override.mergedScene,
    sceneScore: { specific: true, emotional: true, personal: true, total: 3 },
    reviewTip: override.reviewTip,
    difficultyStars: override.difficultyStars || 2,
    exampleSentences: [override.example || buildExampleSentence(word, meaning, partOfSpeech)],
  };
}

const READING_CHUNK_HOOKS = {
  'ぜん': '全/整',
  'こく': '国',
  'いつ': '什么时候',
  'でも': '都可以',
  'きゅう': '求',
  'りょう': '粮/料',
  'しゅ': '主/修',
  'ちゅ': '中/注',
  'じゅ': '住/助',
  'きょ': '教/桥',
  'ぎょ': '鱼',
  'しゃ': '车/社',
  'じゃ': '夹',
  'ちゃ': '茶',
  'ひゃ': '吓',
  'びゃ': '比呀',
  'ぴゃ': '啪呀',
  'みゃ': '喵',
  'りゃ': '俩',
  'にゃ': '喵',
  'よう': '曜/要',
  'こう': '口/考',
  'とう': '头/到',
  'どう': '动',
  'つう': '通',
  'ふつう': '普通',
  'けし': '消失/擦掉',
  'ごむ': '橡胶',
  'ごう': '够/合',
  'かく': '格',
  'げん': '言',
  'ご': '语',
  'うん': '运',
  'どう': '动',
  'すべ': '湿滑路',
  'ちが': '岔开',
  'わん': '碗/汪',
  'あん': '安',
  'ぜん': '全',
  'しず': '嘘，静',
  'か': '卡',
  'じゆう': '自由',
  'たい': '太',
  'へん': '很/恨',
  'むだ': '木大/白搭',
  'ゆ': '浴/热水',
  'せい': '生/正',
  'こう': '口/考',
  'がく': '学',
  'しゃ': '车/社',
  'じ': '急/字',
  'ぶん': '分',
  'ほう': '方向',
  'れん': '连',
  'らく': '快乐',
  'しん': '心/新',
  'ぱい': '怕',
  'き': '气',
  'もち': '拿着',
  'おと': '声音',
  'ひかり': '光',
  'こころ': '心',
  'あたま': '头',
  'からだ': '身体',
  'あ': '啊',
  'い': '一',
  'う': '屋',
  'え': '欸',
  'お': '哦',
  'き': '气',
  'く': '苦',
  'け': '给',
  'こ': '口',
  'が': '嘎',
  'ぎ': '吉',
  'ぐ': '咕',
  'げ': '给',
  'ご': '过/语',
  'さ': '撒',
  'ざ': '杂',
  'じ': '字/急',
  'ず': '滋',
  'ぜ': '贼',
  'ぞ': '佐',
  'し': '吸/嘘',
  'す': '速',
  'せ': '赛',
  'そ': '锁',
  'た': '他',
  'だ': '大',
  'ぢ': '急',
  'づ': '资',
  'で': '得',
  'ど': '土/都',
  'ち': '气',
  'つ': '吃',
  'て': '贴',
  'と': '偷',
  'な': '拿',
  'に': '你',
  'ぬ': '奴',
  'ね': '内',
  'の': '挪',
  'は': '哈',
  'ば': '吧',
  'び': '比',
  'ぶ': '不',
  'べ': '贝',
  'ぼ': '播/包',
  'ぱ': '啪',
  'ぴ': '皮',
  'ぷ': '扑',
  'ぺ': '配',
  'ぽ': '坡',
  'ひ': '嘿',
  'ふ': '呼',
  'へ': '嘿',
  'ほ': '吼',
  'ま': '妈',
  'み': '蜜',
  'む': '母',
  'め': '没',
  'も': '摸',
  'や': '呀',
  'ゆ': '浴',
  'よ': '哟',
  'ら': '拉',
  'り': '里',
  'る': '路',
  'れ': '累',
  'ろ': '啰',
  'わ': '哇',
  'ゃ': '呀',
  'ゅ': '悠',
  'ょ': '哟',
  'ん': '嗯',
};

const LONG_READING_CHUNKS = Object.keys(READING_CHUNK_HOOKS)
  .sort((a, b) => b.length - a.length);

function buildReadingHook(reading) {
  const clean = reading.replace(/[ー～・]/g, '').replace(/っ/g, 'つ');
  if (!clean || clean.length < 2) return null;

  const parts = [];
  for (let i = 0; i < clean.length;) {
    const chunk = LONG_READING_CHUNKS.find((candidate) => clean.startsWith(candidate, i));
    if (chunk) {
      parts.push({ kana: chunk, hook: READING_CHUNK_HOOKS[chunk] });
      i += chunk.length;
    } else {
      const kana = clean[i];
      parts.push({ kana, hook: kana });
      i += 1;
    }
  }

  const useful = parts.filter((part) => part.hook !== part.kana);
  const coveredLength = useful.reduce((sum, part) => sum + part.kana.length, 0);
  const hasLongHook = useful.some((part) => part.kana.length >= 2);
  if (useful.length === 0 || !hasLongHook || coveredLength / clean.length < 0.5) return null;

  const compact = useful.slice(0, 4);

  return {
    label: compact.map((part) => `${part.kana}=${part.hook}`).join(' + '),
    image: compact.map((part) => part.hook.split('/')[0]).join(''),
  };
}

function buildHookSentence(reading, hook) {
  if (!hook) return `读音 ${reading} 作为固定读法记住`;
  return `把 ${reading} 拆成“${hook.label}”，脑子里先出现“${hook.image}”这个画面`;
}

function hookRelatesToMeaning(hook, meaning) {
  if (!hook) return false;
  const haystack = `${hook.label}${hook.image}`;
  return meaning
    .split(/[，,、；;。]/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 1 && token.length <= 6)
    .some((token) => haystack.includes(token) || (token.length >= 2 && haystack.includes(token.slice(0, 2))));
}

function hasGenericExample(example) {
  if (!example) return false;
  return /进行/.test(example.zh) || /^有/.test(example.zh) || /があります。/.test(example.ja);
}

function isLikelyVerb(word, partOfSpeech) {
  const pos = partOfSpeech || '';
  if (/形动|形動/.test(pos) && !/(自动|自動|他动|他動|サ变|サ変)/.test(pos)) return false;
  if (/(自动|自動|他动|他動|動詞|动詞|サ变|サ変)/.test(pos)) return true;
  if (isKatakana(word)) return false;
  return /[うくぐすつぬぶむる]$/.test(word) && word.length > 1;
}

function isLikelyAdjective(word, meaning, partOfSpeech) {
  if (/形/.test(partOfSpeech || '')) return true;
  if (isKatakana(word)) return false;
  if (!hasKanji(word) && /い$/.test(word)) return true;
  return /冷|热|高|低|多|少|大|小|长|短|难|容易|便宜|贵|苦|亲切|安全|危险|开心|幸福/.test(meaning);
}

function buildExampleSentence(word, meaning, partOfSpeech) {
  const mainMeaning = meaning.replace(/，.*/, '');

  const overrides = {
    '合う': { ja: 'この靴は足に合います。', zh: '这双鞋合脚。' },
    '違い': { ja: '二つの違いがあります。', zh: '两者有差异。' },
    '御馳走': { ja: '御馳走になりました。', zh: '承蒙款待了。' },
    '全国': { ja: '全国で使われています。', zh: '在全国都被使用。' },
    '何時でも': { ja: '何時でも来てください。', zh: '请随时来。' },
    '給料': { ja: '給料をもらいました。', zh: '领到了工资。' },
    '長ネギ': { ja: '長ネギを買いました。', zh: '买了大葱。' },
    '迷惑': { ja: '迷惑をかけました。', zh: '添麻烦了。' },
    '主': { ja: '主な理由です。', zh: '这是主要理由。' },
    'ずっと': { ja: 'ずっと待っていました。', zh: '一直在等。' },
    '土曜': { ja: '土曜に会いましょう。', zh: '星期六见吧。' },
    '季節': { ja: '季節が変わりました。', zh: '季节变了。' },
    'そう': { ja: 'そうです。', zh: '是那样。' },
    'もちろん': { ja: 'もちろん行きます。', zh: '当然去。' },
    '大体': { ja: '大体分かりました。', zh: '大概明白了。' },
    '火': { ja: '火を消してください。', zh: '请把火灭掉。' },
    'バッグ': { ja: 'バッグを持っています。', zh: '拿着包。' },
    'グラス': { ja: 'グラスに水を入れます。', zh: '往玻璃杯里倒水。' },
    'わがまま': { ja: 'わがままを言わないでください。', zh: '请不要任性。' },
    '知らせる': { ja: '友だちに知らせます。', zh: '通知朋友。' },
    'マンゴー': { ja: 'マンゴーを食べます。', zh: '吃芒果。' },
    'ほら': { ja: 'ほら、見てください。', zh: '你看，请看。' },
    'あれ': { ja: 'あれ、財布がありません。', zh: '哎呀，钱包不见了。' },
    'あんな': { ja: 'あんな人になりたいです。', zh: '想成为那样的人。' },
    'へえ': { ja: 'へえ、そうですか。', zh: '欸，是这样啊。' },
    'ダック': { ja: 'ダックを見ました。', zh: '看到了鸭子。' },
    '工学': { ja: '工学を勉強します。', zh: '学习工学。' },
    '人口': { ja: '人口が増えています。', zh: '人口正在增加。' },
    'あら': { ja: 'あら、きれいですね。', zh: '哎呀，真漂亮。' },
    'ピアノ': { ja: 'ピアノを弾きます。', zh: '弹钢琴。' },
    'ええと': { ja: 'ええと、名前は何ですか。', zh: '嗯，请问名字是什么？' },
    'すり': { ja: 'すりに気をつけます。', zh: '小心扒手。' },
    '少なくとも': { ja: '少なくとも三人います。', zh: '至少有三个人。' },
    'アラーム': { ja: 'アラームを止めます。', zh: '关掉闹钟。' },
    '政治': { ja: '政治について話します。', zh: '谈论政治。' },
    '植物': { ja: '植物を育てます。', zh: '种植物。' },
    '地球': { ja: '地球を守ります。', zh: '保护地球。' },
    '眠い': { ja: '今日は眠いです。', zh: '今天很困。' },
    'サイズ': { ja: 'サイズを確認します。', zh: '确认尺寸。' },
    'ガラス': { ja: 'ガラスが割れました。', zh: '玻璃碎了。' },
    '血': { ja: '血が出ました。', zh: '出血了。' },
    'アドレス': { ja: 'アドレスを書きます。', zh: '写地址。' },
    '小学生': { ja: '小学生が歩いています。', zh: '小学生正在走路。' },
    'インク': { ja: 'インクがなくなりました。', zh: '墨水用完了。' },
    'カーテン': { ja: 'カーテンを開けます。', zh: '打开窗帘。' },
    'うまい': { ja: 'この料理はうまいです。', zh: '这道菜很好吃。' },
    'やあ': { ja: 'やあ、久しぶり。', zh: '呀，好久不见。' },
    '数学': { ja: '数学を勉強します。', zh: '学习数学。' },
    'はあ': { ja: 'はあ、分かりました。', zh: '嗯，明白了。' },
    'あ': { ja: 'あ、忘れました。', zh: '啊，忘了。' },
    'テニス': { ja: 'テニスをします。', zh: '打网球。' },
    'アフリカ': { ja: 'アフリカへ行きたいです。', zh: '想去非洲。' },
    'くれる': { ja: '友だちが本をくれました。', zh: '朋友给了我一本书。' },
    '全部': { ja: '全部食べました。', zh: '全部吃完了。' },
    'どんどん': { ja: 'どんどん進みます。', zh: '不断前进。' },
    'ボール': { ja: 'ボールを投げます。', zh: '扔球。' },
    '簡単': { ja: 'この問題は簡単です。', zh: '这个问题很简单。' },
    '法律': { ja: '法律を守ります。', zh: '遵守法律。' },
    '医学': { ja: '医学を勉強します。', zh: '学习医学。' },
    'これら': { ja: 'これらは本です。', zh: '这些是书。' },
    'おや': { ja: 'おや、雨ですね。', zh: '哎呀，下雨了。' },
    'する': { ja: 'いいにおいがします。', zh: '有好闻的味道。' },
    '研究室': { ja: '研究室にいます。', zh: '在研究室里。' },
    'ああ': { ja: 'ああ、分かりました。', zh: '啊，明白了。' },
    '大学生': { ja: '大学生になりました。', zh: '成为大学生了。' },
    '四季': { ja: '日本には四季があります。', zh: '日本有四季。' },
    '小学': { ja: '小学で勉強しました。', zh: '在小学学习过。' },
    'オレンジ': { ja: 'オレンジを食べます。', zh: '吃橙子。' },
    '字': { ja: '字を書きます。', zh: '写字。' },
    '化学': { ja: '化学を勉強します。', zh: '学习化学。' },
    '国外': { ja: '国外へ行きます。', zh: '去国外。' },
    'ガソリン': { ja: 'ガソリンを入れます。', zh: '加汽油。' },
    'あのね': { ja: 'あのね、聞いて。', zh: '那个，听我说。' },
    'フルーツ': { ja: 'フルーツを食べます。', zh: '吃水果。' },
    'ワサビ': { ja: 'ワサビを少し入れます。', zh: '放一点芥末。' },
  };
  if (overrides[word]) return overrides[word];

  if (/合格|成功|失敗|失礼|入学|卒業|運動|練習|出発|到着|準備|連絡|相談|説明|紹介/.test(word)) {
    return { ja: `${word}しました。`, zh: `${mainMeaning}了。` };
  }
  if (/饭|餐|食|菜|肉|鱼|茶|酒|柠檬|咖喱|口香糖/.test(meaning)) {
    return { ja: `${word}を食べます。`, zh: `吃${mainMeaning}。` };
  }
  if (/语言|学校|学生|老师|学习|语法|词典|课|教育|作业|教材|数学|化学|医学|工学|法律/.test(meaning)) {
    return { ja: `${word}を勉強します。`, zh: `学习${mainMeaning}。` };
  }
  if (/车|站|路|桥|交通|电车|旅行|国内|全国|方向|大楼/.test(meaning)) {
    return { ja: `${word}へ行きます。`, zh: `去${mainMeaning}。` };
  }
  if (/通知|联系|会议|规矩|礼貌|工资|工作|成功|社会/.test(meaning)) {
    return { ja: `${word}について話します。`, zh: `谈论${mainMeaning}。` };
  }
  if (/サ变|サ変/.test(partOfSpeech || '')) {
    return { ja: `${word}しました。`, zh: `${mainMeaning}了。` };
  }
  if (isLikelyAdjective(word, meaning, partOfSpeech)) {
    return { ja: `${word}です。`, zh: `很${mainMeaning}。` };
  }
  if (isLikelyVerb(word, partOfSpeech)) {
    return { ja: `${word}ことがあります。`, zh: `有时会${mainMeaning}。` };
  }
  return { ja: `${word}を使います。`, zh: `使用${mainMeaning}。` };
}

function soundMatchesMeaning(soundResult, meaning) {
  if (!soundResult || !soundResult.valid) return false;
  if (soundResult.soundTip === '拆分记忆') return false;
  const haystack = `${soundResult.bridge} ${soundResult.scene} ${soundResult.soundTip}`;
  const tokens = meaning
    .split(/[，,、；;。]/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 1 && token.length <= 6);
  return tokens.some((token) => {
    if (haystack.includes(token)) return true;
    if (token.length >= 4) {
      for (let i = 0; i < token.length - 1; i++) {
        if (haystack.includes(token.slice(i, i + 2))) return true;
      }
    }
    return false;
  });
}

function soundLabel(soundResult) {
  return soundResult.soundTip
    .replace(/^谐音/, '')
    .replace(/^["“]/, '')
    .replace(/["”]$/, '');
}

function cleanSoundStory(soundResult, meaning) {
  let story = soundResult.bridge.replace(/^谐音"[^"]+"\s*-\s*/, '');
  for (const token of meaning.split(/[，,、；;。]/).map((part) => part.trim()).filter(Boolean)) {
    story = story.replace(new RegExp(`\\s*-\\s*${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '');
  }
  return story;
}

function buildScene({ word, reading, meaning, hookText, mode }) {
  const category = getMemoryCategory(meaning);
  const target = primaryMeaning(meaning);
  const hook = hookText || `看见 ${word}，先把读音 ${reading} 和“${target}”绑在一起`;
  const details = {
    food: `${category.person}闻到热气和酱汁味，${hook}，马上想到餐盘里的“${target}”。`,
    school: `${category.person}在课本边写下 ${word}，${hook}，老师一点名就能想起“${target}”。`,
    travel: `${category.person}盯着车站指示牌，${hook}，人群和广播声一起把“${target}”钉住。`,
    work: `${category.person}拿着排班表和收据，${hook}，紧张又真实的打工场景对应“${target}”。`,
    feeling: `${category.person}在走廊里夸张表演刚才的心情，${hook}，表情越夸张越容易记住“${target}”。`,
    time: `${category.person}在日历上圈出日期，${hook}，时间格子直接提醒“${target}”。`,
    home: `${category.person}在房间里翻找东西，${hook}，手边的物品自然对应“${target}”。`,
    daily: `${category.person}把刚发生的小事演了一遍，${hook}，这个小插曲就代表“${target}”。`,
  };
  const scene = details[category.key] || details.daily;
  const modeText = mode === 'sound'
    ? '重点抓发音钩子'
    : mode === 'loanword'
      ? '重点抓外来语来源'
      : mode === 'kana'
        ? '重点抓假名拆读'
        : '重点抓汉字直觉和读音绑定';
  return `在${category.place}，${scene}${modeText}：${word}=${meaning}。`;
}

function buildQualityMemoryMethod(vocab) {
  const { word, reading, meaning, meaningRaw, partOfSpeech } = vocab;
  const override = SPECIFIC_MEMORY_OVERRIDES[word] || SPECIFIC_MEMORY_OVERRIDES[`${word}|${reading}`];
  if (override) return buildSpecificMemoryMethod(vocab, override);

  const source = LOANWORD_SOURCES[word] || guessLoanword(word);
  const soundResult = trySoundAssociation(reading, meaning);
  const usableSound = soundMatchesMeaning(soundResult, meaning);
  const rawReadingHook = buildReadingHook(reading);
  const readingHook = hookRelatesToMeaning(rawReadingHook, meaning) ? rawReadingHook : null;
  const target = primaryMeaning(meaning);

  let elements;
  let mergedScene;
  let reviewTip;
  let mode = 'kanji';

  if (isKatakana(word)) {
    mode = 'loanword';
    elements = [
      { element: word, method: '外来语', bridgeC: `${word} 来自 ${source}，先用来源词绑定意思“${meaning}”。` },
    ];
    mergedScene = buildScene({
      word,
      reading,
      meaning,
      hookText: `看到片假名 ${word}，马上联想到 ${source}`,
      mode,
    });
    reviewTip = `${word} - 外来语 ${source} - 从来源词直接联想到${target}的使用场景 - ${meaning}`;
  } else if (usableSound) {
    mode = 'sound';
    const story = cleanSoundStory(soundResult, meaning);
    const label = soundLabel(soundResult);
    elements = [
      ...(hasKanji(word)
        ? [{ element: word, method: 'TYPE A1', bridgeC: `${word} 的汉字先提示核心意思“${meaning}”。` }]
        : []),
      { element: reading, method: 'TYPE B2', bridgeC: soundResult.bridge },
    ];
    mergedScene = buildScene({
      word,
      reading,
      meaning,
      hookText: `听到 ${reading} 像“${label}”`,
      mode,
    });
    reviewTip = `${reading} - 谐音“${label}” - ${story} - ${meaning}`;
  } else if (hasKanji(word)) {
    const hookSentence = buildHookSentence(reading, readingHook);
    elements = [
      { element: word, method: 'TYPE A1', bridgeC: `${word} 的字面先给出“${target}”这个方向。` },
      { element: reading, method: readingHook ? 'TYPE B1' : '固定读音', bridgeC: hookSentence },
    ];
    mergedScene = buildScene({
      word,
      reading,
      meaning,
      hookText: `${hookSentence}，再用 ${word} 的汉字确认意思`,
      mode,
    });
    reviewTip = readingHook
      ? `${reading} - ${hookSentence} - ${word} 的汉字补强 - ${meaning}`
      : `${word} - 汉字直觉 + 固定读音 ${reading} - 放进生活场景记“${target}” - ${meaning}`;
  } else {
    const mid = Math.max(1, Math.floor(reading.length / 2));
    const first = reading.slice(0, mid);
    const second = reading.slice(mid);
    const hookSentence = buildHookSentence(reading, readingHook);
    elements = [
      { element: reading, method: readingHook ? 'TYPE B1' : '固定读音', bridgeC: readingHook ? hookSentence : `纯假名词先拆成 ${first}${second ? ` + ${second}` : ''}，再放进生活场景绑定“${meaning}”。` },
    ];
    mergedScene = buildScene({
      word,
      reading,
      meaning,
      hookText: readingHook ? hookSentence : `把 ${reading} 拆成 ${first}${second ? ` + ${second}` : ''} 慢慢读`,
      mode: 'kana',
    });
    reviewTip = readingHook
      ? `${reading} - ${hookSentence} - 放进生活场景记住用法 - ${meaning}`
      : `${reading} - 纯假名拆读 ${first}${second ? ` + ${second}` : ''} - 用生活场景记住它的用法 - ${meaning}`;
  }

  let stars = 2;
  if (isKatakana(word) || (hasKanji(word) && meaning.length <= 5)) stars = 1;
  if (!usableSound && reading.length >= 5) stars = 3;

  return {
    word,
    reading,
    meaning,
    sourceIndex: vocab.index,
    sourceMeaningRaw: meaningRaw,
    partOfSpeech,
    elements,
    mergedScene,
    sceneScore: { specific: true, emotional: true, personal: true, total: 3 },
    reviewTip,
    difficultyStars: stars,
    exampleSentences: [buildExampleSentence(word, meaning, partOfSpeech)],
  };
}

function sceneQualityText(sceneScore) {
  const parts = [];
  if (sceneScore?.specific) parts.push('具体化');
  if (sceneScore?.emotional) parts.push('情绪化');
  if (sceneScore?.personal) parts.push('生活化');
  return `${parts.join(' · ')} · ${sceneScore?.total ?? parts.length}/3`;
}

function toFrontendMoatEntry(entry, index) {
  return {
    id: `n4-${String(index + 1).padStart(4, '0')}`,
    word: entry.word,
    reading: entry.reading,
    meaning: entry.meaning,
    elements: entry.elements,
    mergedScene: entry.mergedScene,
    sceneQuality: sceneQualityText(entry.sceneScore),
    reviewHint: entry.reviewTip,
    difficultyStars: entry.difficultyStars,
  };
}

function writeFrontendN4MoatVocab(memory) {
  const entries = memory.map((entry, index) => toFrontendMoatEntry(entry, index));
  const file = [
    '// Auto-generated from data/memory_methods/n4 via scripts/build_n4_memory_methods.cjs',
    `// Total: ${entries.length} words`,
    '',
    "import type { MoatVocabEntry } from '../types'",
    '',
    `export const n4MoatVocab: MoatVocabEntry[] = ${JSON.stringify(entries, null, 2)}`,
    '',
  ].join('\n');

  fs.writeFileSync(FRONTEND_N4_OUT, file);
}

// ============ 主函数 ============
function main() {
  console.log('Parsing N4 vocabulary...');

  const allEntries = [];
  for (const pdf of PDFS) {
    if (!fs.existsSync(pdf.text)) {
      console.error(`File not found: ${pdf.text}`);
      continue;
    }
    const entries = parsePDF(pdf.text, pdf.startIdx);
    console.log(`  ${path.basename(pdf.text)}: ${entries.length} entries`);
    allEntries.push(...entries);
  }

  const uniqueEntries = [];
  const seen = new Set();
  for (const e of allEntries) {
    const key = `${e.word}-${e.reading}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueEntries.push(e);
    }
  }
  uniqueEntries.sort((a, b) => a.sourceIndex - b.sourceIndex);

  console.log(`Total unique: ${uniqueEntries.length}`);

  const vocab = uniqueEntries.map((e, idx) => ({
    ...e,
    index: idx + 1,
    partOfSpeech: posTag(e.meaningRaw),
    meaning: qualityShortMeaning(e.word, e.meaningRaw || ''),
  }));

  const memory = vocab.map(v => buildQualityMemoryMethod(v));

  fs.mkdirSync(path.dirname(VOCAB_OUT), { recursive: true });
  fs.mkdirSync(MEMORY_DIR, { recursive: true });

  fs.writeFileSync(VOCAB_OUT, JSON.stringify(vocab, null, 2) + '\n');
  fs.writeFileSync(ALL_MEMORY_OUT, JSON.stringify(memory, null, 2) + '\n');
  writeFrontendN4MoatVocab(memory);

  for (const file of fs.readdirSync(MEMORY_DIR)) {
    if (/^batch_\d+_methods\.json$/.test(file)) {
      fs.unlinkSync(path.join(MEMORY_DIR, file));
    }
  }

  for (let i = 0; i < memory.length; i += BATCH_SIZE) {
    const batchNo = String(Math.floor(i / BATCH_SIZE) + 1).padStart(2, '0');
    const batch = memory.slice(i, i + BATCH_SIZE);
    fs.writeFileSync(
      path.join(MEMORY_DIR, `batch_${batchNo}_methods.json`),
      JSON.stringify(batch, null, 2) + '\n'
    );
  }

  console.log(`✓ Vocab: ${vocab.length}`);
  console.log(`✓ Memory: ${memory.length}`);
  console.log(`✓ Frontend N4: ${memory.length}`);
  console.log(`✓ Batches: ${Math.ceil(memory.length / BATCH_SIZE)}`);
}

main();
