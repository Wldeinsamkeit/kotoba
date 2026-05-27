const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const PDFS = [
  { text: path.join(ROOT, 'tmp/pdfs/n3_1_1000.txt'), startIdx: 1 },
  { text: path.join(ROOT, 'tmp/pdfs/n3_1001_2000.txt'), startIdx: 1001 },
  { text: path.join(ROOT, 'tmp/pdfs/n3_2001_2771.txt'), startIdx: 2001 },
];

const VOCAB_OUT = path.join(ROOT, 'data/n3/n3_vocab.json');
const MEMORY_DIR = path.join(ROOT, 'data/memory_methods/n3');
const ALL_MEMORY_OUT = path.join(MEMORY_DIR, 'all_n3_memory_methods.json');
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

  // 首先找到所有序号行及其位置
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
        tail: numMatch[5] || '', // 序号行剩余部分（可能是释义）
      });
    }
  }

  const entries = [];

  // 对每个序号行，收集属于它的所有行
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
      if (/^\d{1,4}\s+/.test(line)) break; // 遇到下一个序号行停止
      if (/^词单[:：]/.test(line) || /^序号/.test(line) || /^MOJi/.test(line)) break;
      afterLines.push(line);
    }

    // 合并
    const allLines = [...beforeLines, ...afterLines];

    // 提取释义
    let meaningLines = [];

    // 如果序号行有剩余部分（tail），添加到释义
    if (current.tail && current.tail.trim()) {
      meaningLines.push(current.tail.trim());
    }

    for (const line of allLines) {
      // 跳过序号行本身（已经提取过单词和读音）
      if (line === current.line) continue;

      // 跳过纯音调行
      if (/^[①②③④⑤⑥⑦⑧⑨⓪⓿①-⑳\s]+$/.test(line)) continue;

      // 含中文或英文的行是释义
      if (hasKanji(line) || /[a-zA-Z]/.test(line)) {
        meaningLines.push(line);
      }
    }

    // 合并释义
    let meaningRaw = meaningLines.join(' ').replace(/\s+/g, ' ').trim();

    // 从meaningRaw中移除单词和读音
    if (current.word) {
      const escaped = current.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      meaningRaw = meaningRaw.replace(new RegExp(escaped, 'g'), '');
    }
    if (current.reading) {
      const escaped = current.reading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      meaningRaw = meaningRaw.replace(new RegExp(escaped, 'g'), '');
    }

    // 验证必须有word和reading
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
    .replace(/^(名|形|动|副|他动|自动|サ变|段|形动|名·形动|名·他动|名·自动|名·サ变|他动·五|他动·一|自动·五|自动·一|自動·五|他動·五|い|動詞|形容詞|名詞|サ変|·サ変|·自他|自他|·サ变|他动|自動|他動|自他|名·他动|名·自動)\s*/g, '')
    .replace(/^・?\s*(名|形|动|副|他动|自动|サ变|段|形动|名·形动|名·他动|名·自动|名·サ变|他动·五|他动·一|自动·五|自动·一|自動·五|他動·五|い|動詞|形容詞|名詞|サ変|·サ変|·自他|自他|·サ变|他动|自動|他動|自他|名·他动|名·自動)\s*/g, '')
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
  const match = raw.match(/^(名|形|动|副|接尾|形动|名·形动|名·他动|名·自动|名·サ变|名·副词|他动·五|他动·一|自动·五|自动·一|自动·サ变)/);
  return match ? match[1] : '';
}

// ============ 记忆方法生成 ============
function buildMemoryMethod(vocab) {
  const { word, reading, meaning, meaningRaw } = vocab;

  let elements = [];
  let mergedScene = '';
  let reviewTip = '';

  // 外来语
  if (isKatakana(word)) {
    const source = guessLoanword(word);
    mergedScene = `${word}是外来语，来自${source}，意思是${meaning}。`;
    reviewTip = `${word} - 外来语${source} - ${meaning}`;
    elements = [{ element: word, method: '外来语', bridgeC: `${word}来自${source}，意思是${meaning}` }];
  }
  // 纯假名
  else if (isPureKana(word)) {
    const result = generateKanaMemory(reading, meaning);
    elements = result.elements;
    mergedScene = result.scene;
    reviewTip = result.tip;
  }
  // 汉字词
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
    'デザート': 'dessert', 'デザイン': 'design', 'デパート': 'department',
    'カード': 'card', 'ニュース': 'news', 'コンビニ': 'convenience store',
    'スーパー': 'supermarket', 'テーブル': 'table', 'ドア': 'door',
    'ページ': 'page', 'ホテル': 'hotel', 'メモ': 'memo', 'ラジオ': 'radio',
    'ロビー': 'lobby', 'カーブ': 'curve', 'テント': 'tent',
  };
  return map[word] || '英语';
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

// 谐音联想
function trySoundAssociation(reading, meaning) {
  const preset = {
    'あいず': { sound: '爱子', story: '两人见面用暗号"爱子"对上 - 信号' },
    'てくび': { sound: '磕臂', story: '手腕累了想"磕臂"休息 - 手腕' },
    'あさい': { sound: '浅', story: '"浅"一点，别太深 - 浅的' },
    'てきど': { sound: '适度', story: '"适度"运动很重要 - 适度' },
    'あつめる': { sound: '发热', story: '大家聚在一起"发热" - 集合' },
    'でこぼこ': { sound: '磕磕碰碰', story: '路面不平，走路"磕磕碰碰" - 凹凸不平' },
    'ゆきさき': { sound: '行き先', story: '不知道"行き先"去哪 - 目的地' },
    'いこう': { sound: '以后', story: '"以后"再说 - 以后' },
    'いる': { sound: '要', story: '真的"要"这个东西 - 需要' },
    'うえる': { sound: '挖', story: '种树要先"挖"坑 - 种植' },
    'うけいれる': { sound: '接收', story: '"接收"别人给的东西 - 接收' },
    'てちょう': { sound: '手账', story: '记录在"手账"上 - 笔记本' },
    'うごき': { sound: '动', story: '"动"一下 - 动向' },
    'てつ': { sound: '铁', story: '像"铁"一样硬 - 铁' },
    'うつる': { sound: '搬家', story: '"搬家"到别的地方 - 移动' },
    'てづくり': { sound: '手作', story: '"手作"的东西 - 手工制作' },
    'うわさ': { sound: '八卦', story: '这就是"八卦"传闻 - 传闻' },
    'てつづき': { sound: '手续', story: '办理"手续" - 手续' },
    'えがお': { sound: '笑颜', story: '一脸"笑颜" - 笑脸' },
    'てはい': { sound: '调配', story: '"调配"人员 - 安排' },
    'おうぼう': { sound: '横暴', story: '太"横暴"了 - 横暴' },
    'おもに': { sound: '主に', story: '"主要"是 - 主要' },
    'てぶくろ': { sound: '手袋', story: '戴"手套" - 手套' },
    'おる': { sound: '折', story: '"折"断 - 折断' },
    'てま': { sound: '手间', story: '花费"时间工夫" - 工夫' },
    'かーぶ': { sound: 'curve', story: '英语curve"弯曲" - 弯曲' },
    'てまえ': { sound: '手前', story: '自己"面前" - 面前' },
    'がいか': { sound: '外货', story: '"外国货币" - 外币' },
    'でむかえ': { sound: '出迎え', story: '"出去迎接" - 迎接' },
    'かたほう': { sound: '片方', story: '"一方" - 一边' },
    'でんげん': { sound: '电源', story: '"电源" - 电源' },
    'がっかり': { sound: '失望声', story: '一声失望叹气 - 颓丧' },
    'てんこう': { sound: '天候', story: '"天气气候" - 天候' },
    'かっと': { sound: 'cut', story: '英语cut"切" - 切' },
    'でんし': { sound: '电子', story: '"电子" - 电子' },
    'から': { sound: '空', story: '"空"的 - 空' },
    'からから': { sound: '空空', story: '"空空"如也 - 干透' },
    'てんじょう': { sound: '天花板', story: '"天花板" - 顶棚' },
    'かわく': { sound: '渇く', story: '"干渴" - 渴' },
    'かんさつ': { sound: '观察', story: '"观察" - 观察' },
    'かんじ': { sound: '感觉', story: '"感觉" - 感觉' },
    'てんそう': { sound: '转送', story: '"转送" - 转送' },
    'きそく': { sound: '规则', story: '"规则" - 规则' },
    'てんちょう': { sound: '店长', story: '"店长" - 店长' },
    'きぶん': { sound: '気分', story: '"心情" - 心情' },
    'てんと': { sound: 'tent', story: '英语tent"帐篷" - 帐篷' },
    'きょうそう': { sound: '竞争', story: '"竞争" - 竞争' },
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

// ============ 主函数 ============
function main() {
  console.log('Parsing N3 vocabulary...');

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

  // 去重
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
    meaning: shortMeaning(e.meaningRaw || ''),
  }));

  const memory = vocab.map(v => buildMemoryMethod(v));

  fs.mkdirSync(path.dirname(VOCAB_OUT), { recursive: true });
  fs.mkdirSync(MEMORY_DIR, { recursive: true });

  fs.writeFileSync(VOCAB_OUT, JSON.stringify(vocab, null, 2) + '\n');
  fs.writeFileSync(ALL_MEMORY_OUT, JSON.stringify(memory, null, 2) + '\n');

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
  console.log(`✓ Batches: ${Math.ceil(memory.length / BATCH_SIZE)}`);
}

main();
