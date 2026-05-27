const fs = require('fs');
const path = require('path');

// 读取原始JSON文件
const inputPath = path.join(__dirname, '..', '嫌われる勇気-reader-clean.json');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'kiraware-no-yuki.json');

const rawData = fs.readFileSync(inputPath, 'utf8');
const bookData = JSON.parse(rawData);

// 计算总字数
let totalWords = 0;
bookData.chapters.forEach(ch => {
  ch.paragraphs.forEach(p => {
    totalWords += p.length;
  });
});

// 估算阅读时间（假设每分钟阅读400字）
const estimatedReadTime = Math.ceil(totalWords / 400);

// 生成词汇表
const commonVocabulary = [
  { word: '哲学者', reading: 'てつがくしゃ', meaning: '哲学家' },
  { word: '青年', reading: 'せいねん', meaning: '青年、年轻人' },
  { word: '幸福', reading: 'こうふく', meaning: '幸福' },
  { word: '世界', reading: 'せかい', meaning: '世界' },
  { word: 'シンプル', reading: 'しんぷる', meaning: '简单' },
  { word: '真理', reading: 'しんり', meaning: '真理' },
  { word: 'アドラー', reading: 'あどらー', meaning: '阿德勒（心理学家）' },
  { word: '心理学', reading: 'しんりがく', meaning: '心理学' },
  { word: '目的論', reading: 'もくろんろん', meaning: '目的论' },
  { word: '原因論', reading: 'げんいんろん', meaning: '原因论' },
  { word: 'トラウマ', reading: 'とらうま', meaning: '创伤、精神创伤' },
  { word: '劣等感', reading: 'れっとうかん', meaning: '自卑感' },
  { word: '対人関係', reading: 'たいじんかんけい', meaning: '人际关系' },
  { word: '課題', reading: 'かだい', meaning: '课题、任务' },
  { word: '承認', reading: 'しょうにん', meaning: '认可、承认' },
  { word: '勇気', reading: 'ゆうき', meaning: '勇气' },
  { word: '自己受容', reading: 'じこじゅよう', meaning: '自我接纳' },
  { word: '他者貢献', reading: 'たしゃこうけん', meaning: '他人贡献、贡献他人' },
  { word: '共同体感覚', reading: 'きょうどうたいかんかく', meaning: '共同体感觉' },
  { word: '主体性', reading: 'しゅたいせい', meaning: '主体性' },
  { word: '変化', reading: 'へんか', meaning: '变化' },
  { word: '生きる', reading: 'いきる', meaning: '活着、生存' },
  { word: '関係', reading: 'かんけい', meaning: '关系' },
  { word: '問題', reading: 'もんだい', meaning: '问题' },
  { word: '過去', reading: 'かこ', meaning: '过去' },
  { word: '怒り', reading: 'いかり', meaning: '愤怒' },
  { word: '幸せ', reading: 'しあわせ', meaning: '幸福' },
  { word: '自分', reading: 'じぶん', meaning: '自己、自己' },
  { word: '他人', reading: 'たにん', meaning: '他人' },
  { word: '人生', reading: 'じんせい', meaning: '人生' },
];

// 创建书籍数据
const processedBook = {
  id: bookData.id,
  title: bookData.title,
  author: '岸見一郎・古賀史健',
  description: '「嫌われる勇気」は、アルフレッド・アドラーの心理学（アドラー心理学）を、青年と哲人の対話形式で解説したベストセラー書籍の日文版です。',
  level: bookData.level,
  tags: [...bookData.tags, '哲学', '心理学', '自己啓発'],
  totalWords,
  estimatedReadTime,
  vocabulary: commonVocabulary,
  chapters: bookData.chapters
};

// 保存处理后的数据
fs.writeFileSync(outputPath, JSON.stringify(processedBook, null, 2), 'utf8');

console.log(`书籍数据处理完成！`);
console.log(`总字数: ${totalWords}`);
console.log(`预计阅读时间: ${estimatedReadTime} 分钟`);
console.log(`章节数: ${bookData.chapters.length}`);
console.log(`输出路径: ${outputPath}`);
