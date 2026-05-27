const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MEMORY_DATA = path.join(ROOT, 'data/memory_methods/n3/all_n3_memory_methods.json');
const OUTPUT_DIR = path.join(ROOT, 'skills/vocab/n3');
const BATCH_SIZE = 40;

function generateSkillMarkdown(entries, batchNum) {
  const lines = [];
  const startIdx = batchNum * BATCH_SIZE + 1;
  const endIdx = Math.min((batchNum + 1) * BATCH_SIZE, entries.length);

  lines.push(`# N3词汇记忆方法 - 第${batchNum + 1}组 (${startIdx}-${endIdx})`);
  lines.push('');
  lines.push(`> 本组包含 ${entries.length} 个词汇`);
  lines.push('> 生成时间: ' + new Date().toLocaleString('zh-CN'));
  lines.push('');
  lines.push('---');
  lines.push('');

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const idx = startIdx + i;

    lines.push(`## ${idx}. ${entry.word}（${entry.reading}）`);
    lines.push('');
    lines.push(`**中文释义**: ${entry.meaning}`);
    lines.push('');
    lines.push(`**词性**: ${entry.partOfSpeech || '未标注'}`);
    lines.push('');
    lines.push(`**难度**: ${'⭐'.repeat(entry.difficultyStars)}`);
    lines.push('');

    lines.push(`### 记忆元素`);
    lines.push('');
    for (const el of entry.elements) {
      lines.push(`- **${el.element}**: ${el.method} - ${el.bridgeC}`);
    }
    lines.push('');

    lines.push(`### 场景记忆`);
    lines.push('');
    lines.push(entry.mergedScene);
    lines.push('');

    lines.push(`### 复习提示`);
    lines.push('');
    lines.push(`> ${entry.reviewTip}`);
    lines.push('');

    if (entry.exampleSentences && entry.exampleSentences.length > 0) {
      lines.push(`### 例句`);
      lines.push('');
      for (const ex of entry.exampleSentences) {
        lines.push(`- **日**: ${ex.ja}`);
        lines.push(`- **中**: ${ex.zh}`);
      }
      lines.push('');
    }

    lines.push(`---`);
    lines.push('');
  }

  return lines.join('\n');
}

function main() {
  const memoryData = JSON.parse(fs.readFileSync(MEMORY_DATA, 'utf8'));

  // 清空输出目录
  if (fs.existsSync(OUTPUT_DIR)) {
    for (const file of fs.readdirSync(OUTPUT_DIR)) {
      if (file.endsWith('.md')) {
        fs.unlinkSync(path.join(OUTPUT_DIR, file));
      }
    }
  } else {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 创建索引文件
  const indexLines = [];
  indexLines.push('# N3词汇记忆方法 - 总索引');
  indexLines.push('');
  indexLines.push(`> 总计: ${memoryData.length} 个词汇`);
  indexLines.push(`> 分组: ${Math.ceil(memoryData.length / BATCH_SIZE)} 组`);
  indexLines.push('');
  indexLines.push('## 分组列表');
  indexLines.push('');

  // 生成分组文件
  for (let i = 0; i < memoryData.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE);
    const batch = memoryData.slice(i, i + BATCH_SIZE);
    const startIdx = i + 1;
    const endIdx = Math.min(i + BATCH_SIZE, memoryData.length);
    const fileName = `n3_group_${String(batchNum + 1).padStart(2, '0')}.md`;

    const markdown = generateSkillMarkdown(batch, batchNum);
    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), markdown);

    indexLines.push(`### [第${batchNum + 1}组](${fileName}) - ${startIdx}-${endIdx} (${batch.length}词)`);
    indexLines.push('');

    // 添加本组词汇列表
    for (let j = 0; j < Math.min(5, batch.length); j++) {
      const entry = batch[j];
      indexLines.push(`- ${startIdx + j}. ${entry.word}（${entry.reading}）`);
    }
    if (batch.length > 5) {
      indexLines.push(`- ... (共${batch.length}词)`);
    }
    indexLines.push('');
  }

  // 写入索引文件
  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), indexLines.join('\n'));

  console.log(`Generated ${Math.ceil(memoryData.length / BATCH_SIZE)} skill files`);
  console.log(`Output directory: ${path.relative(ROOT, OUTPUT_DIR)}`);
  console.log(`Index file: ${path.join(OUTPUT_DIR, 'README.md')}`);
}

main();
