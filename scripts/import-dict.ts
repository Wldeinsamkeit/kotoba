#!/usr/bin/env tsx
/**
 * 辞书导入脚本
 * 用法: npx tsx scripts/import-dict.ts <源JSON文件路径>
 */

import fs from 'fs'
import path from 'path'

// 源JSON格式（简化格式）
type SimpleDictEntry = {
  [word: string]: string  // word -> meaning
}

// 目标格式
interface DictEntry {
  word: string
  reading?: string
  meanings: string[]
  partOfSpeech?: string
  example?: string
}

interface Dictionary {
  id: string
  name: string
  description?: string
  language?: string
  entries: DictEntry[]
  isEnabled: boolean
  priority: number
}

// 从解释中提取读音（如果有括号标注）
function extractReading(meaning: string): { reading?: string; cleanMeaning: string; partOfSpeech?: string } {
  const cleanMeaning = meaning

  // 提取词性标记，如【接尾】【名词】等
  const posMatch = cleanMeaning.match(/【([^】]+)】/)
  let partOfSpeech: string | undefined
  if (posMatch) {
    partOfSpeech = posMatch[1]
  }

  return {
    cleanMeaning: cleanMeaning.replace(/【[^】]+】/g, '').trim(),
    partOfSpeech,
    reading: undefined
  }
}

// 转换函数
function convertDictionary(sourceData: SimpleDictEntry): Dictionary {
  const entries: DictEntry[] = []

  for (const [word, meaning] of Object.entries(sourceData)) {
    const { cleanMeaning, partOfSpeech } = extractReading(meaning)

    entries.push({
      word,
      meanings: [cleanMeaning],
      ...(partOfSpeech && { partOfSpeech })
    })
  }

  return {
    id: 'imported-' + Date.now(),
    name: '标准日本语辞典',
    description: '从外部导入的日语辞书数据',
    language: 'ja',
    entries,
    isEnabled: true,
    priority: 500  // 设置中等优先级
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('用法: npx tsx scripts/import-dict.ts <源JSON文件路径> [输出文件路径]')
    console.error('示例: npx tsx scripts/import-dict.ts final.json public/dicts/standard.json')
    process.exit(1)
  }

  const sourcePath = args[0]
  const outputPath = args[1] || path.join(process.cwd(), 'public', 'dicts', 'imported-dict.json')

  // 读取源文件
  console.log(`读取源文件: ${sourcePath}`)
  if (!fs.existsSync(sourcePath)) {
    console.error(`错误: 文件不存在 ${sourcePath}`)
    process.exit(1)
  }

  const sourceContent = fs.readFileSync(sourcePath, 'utf-8')
  let sourceData: SimpleDictEntry

  try {
    sourceData = JSON.parse(sourceContent)
  } catch (error) {
    console.error('错误: 无法解析JSON文件')
    process.exit(1)
  }

  // 转换数据
  console.log('转换数据...')
  const dictionary = convertDictionary(sourceData)

  console.log(`转换完成: ${dictionary.entries.length} 个词条`)

  // 确保输出目录存在
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // 写入输出文件
  console.log(`写入文件: ${outputPath}`)
  fs.writeFileSync(outputPath, JSON.stringify(dictionary, null, 2), 'utf-8')

  console.log('\n✅ 导入成功!')
  console.log(`词典ID: ${dictionary.id}`)
  console.log(`词条数量: ${dictionary.entries.length}`)
  console.log(`输出文件: ${outputPath}`)
  console.log('\n接下来可以:')
  console.log('1. 在网站上访问"词典"页面')
  console.log('2. 点击"导入词典"按钮')
  console.log('3. 选择生成的JSON文件进行导入')
}

main()
