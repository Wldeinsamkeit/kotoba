import type { Dictionary, DictEntry } from '../types'

const DICT_KEY = 'nihongo-dictionaries-v1'

export function loadDictionaries(): Dictionary[] {
  try {
    const raw = localStorage.getItem(DICT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Dictionary[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function saveDictionaries(dicts: Dictionary[]): void {
  localStorage.setItem(DICT_KEY, JSON.stringify(dicts))
}

export function addDictionary(dict: Dictionary): Dictionary[] {
  const dicts = loadDictionaries()
  const existing = dicts.find(d => d.id === dict.id)
  if (existing) {
    // 更新现有词典
    return dicts.map(d => d.id === dict.id ? dict : d)
  }
  // 添加新词典
  return [...dicts, dict].sort((a, b) => a.priority - b.priority)
}

export function removeDictionary(id: string): Dictionary[] {
  const dicts = loadDictionaries()
  const filtered = dicts.filter(d => d.id !== id)
  saveDictionaries(filtered)
  return filtered
}

export function toggleDictionary(id: string): Dictionary[] {
  const dicts = loadDictionaries()
  return dicts.map(d => {
    if (d.id === id) {
      return { ...d, isEnabled: !d.isEnabled }
    }
    return d
  })
}

export function updateDictionaryPriority(id: string, newPriority: number): Dictionary[] {
  const dicts = loadDictionaries()
  const updated = dicts.map(d => {
    if (d.id === id) {
      return { ...d, priority: newPriority }
    }
    return d
  })
  return updated.sort((a, b) => a.priority - b.priority)
}

// 查询所有启用的词典
export function lookupWord(word: string): DictEntry[] {
  const dicts = loadDictionaries()
  const enabledDicts = dicts.filter(d => d.isEnabled).sort((a, b) => a.priority - b.priority)

  const results: DictEntry[] = []
  for (const dict of enabledDicts) {
    const entry = dict.entries.find(e => e.word === word || e.word === word.toLowerCase())
    if (entry) {
      results.push({ ...entry, source: entry.source || dict.name })
    }
  }
  return results
}

// 导入词典数据
export function importDictionary(data: unknown): { success: boolean; error?: string; dict?: Dictionary } {
  if (!data || typeof data !== 'object') {
    return { success: false, error: '无效的数据格式' }
  }

  const dict = data as Dictionary

  // 验证必需字段
  if (!dict.id || !dict.name || !Array.isArray(dict.entries)) {
    return { success: false, error: '词典必须包含 id, name 和 entries 字段' }
  }

  // 验证条目格式
  const validEntries = dict.entries.filter((e: unknown) => {
    const entry = e as DictEntry
    return typeof entry?.word === 'string' && Array.isArray(entry?.meanings)
  })

  if (validEntries.length === 0) {
    return { success: false, error: '没有找到有效的词汇条目' }
  }

  // 设置默认值
  const newDict: Dictionary = {
    id: dict.id,
    name: dict.name,
    description: dict.description || '',
    language: dict.language || 'ja',
    entries: validEntries,
    isEnabled: dict.isEnabled ?? true,
    priority: dict.priority ?? Date.now(),
  }

  return { success: true, dict: newDict }
}

// 创建示例基础词典
export function createBuiltinDictionary(): Dictionary {
  return {
    id: 'builtin-basic',
    name: '基础日语词汇',
    description: '内置的常用日语词汇表',
    language: 'ja',
    isEnabled: true,
    priority: 1000,
    entries: [
      {
        word: '私',
        reading: 'わたし',
        meanings: ['我（第一人称代词）'],
        partOfSpeech: '代词',
      },
      {
        word: 'あなた',
        reading: 'あなた',
        meanings: ['你（第二人称代词）', '您'],
        partOfSpeech: '代词',
      },
      {
        word: '行く',
        reading: 'いく',
        meanings: ['去', '走'],
        partOfSpeech: '动词',
        example: '学校へ行きます（去学校）',
      },
      {
        word: '来る',
        reading: 'くる',
        meanings: ['来', '来到'],
        partOfSpeech: '动词',
      },
      {
        word: '食べる',
        reading: 'たべる',
        meanings: ['吃'],
        partOfSpeech: '动词',
      },
      {
        word: '見る',
        reading: 'みる',
        meanings: ['看', '看见'],
        partOfSpeech: '动词',
      },
      {
        word: '聞く',
        reading: 'きく',
        meanings: ['听', '询问'],
        partOfSpeech: '动词',
      },
      {
        word: '話す',
        reading: 'はなす',
        meanings: ['说', '讲话'],
        partOfSpeech: '动词',
      },
      {
        word: '読む',
        reading: 'よむ',
        meanings: ['读', '阅读'],
        partOfSpeech: '动词',
      },
      {
        word: '書く',
        reading: 'かく',
        meanings: ['写', '书写'],
        partOfSpeech: '动词',
      },
      {
        word: '買う',
        reading: 'かう',
        meanings: ['买'],
        partOfSpeech: '动词',
      },
      {
        word: '売る',
        reading: 'うる',
        meanings: ['卖'],
        partOfSpeech: '动词',
      },
      {
        word: 'ある',
        reading: 'ある',
        meanings: ['有（非生物）', '存在'],
        partOfSpeech: '动词',
      },
      {
        word: 'いる',
        reading: 'いる',
        meanings: ['有（生物）', '在'],
        partOfSpeech: '动词',
      },
      {
        word: '良い',
        reading: 'よい',
        meanings: ['好', '优秀'],
        partOfSpeech: '形容词',
      },
      {
        word: '悪い',
        reading: 'わるい',
        meanings: ['坏', '糟糕'],
        partOfSpeech: '形容词',
      },
      {
        word: '大きい',
        reading: 'おおきい',
        meanings: ['大'],
        partOfSpeech: '形容词',
      },
      {
        word: '小さい',
        reading: 'ちいさい',
        meanings: ['小'],
        partOfSpeech: '形容词',
      },
      {
        word: '新しい',
        reading: 'あたらしい',
        meanings: ['新的'],
        partOfSpeech: '形容词',
      },
      {
        word: '古い',
        reading: 'ふるい',
        meanings: ['旧的', '老的'],
        partOfSpeech: '形容词',
      },
      {
        word: '多い',
        reading: 'おおい',
        meanings: ['多'],
        partOfSpeech: '形容词',
      },
      {
        word: '少ない',
        reading: 'すくない',
        meanings: ['少'],
        partOfSpeech: '形容词',
      },
      {
        word: '先生',
        reading: 'せんせい',
        meanings: ['老师', '医生'],
        partOfSpeech: '名词',
      },
      {
        word: '学生',
        reading: 'がくせい',
        meanings: ['学生'],
        partOfSpeech: '名词',
      },
      {
        word: '会社',
        reading: 'かいしゃ',
        meanings: ['公司'],
        partOfSpeech: '名词',
      },
      {
        word: '電車',
        reading: 'でんしゃ',
        meanings: ['电车'],
        partOfSpeech: '名词',
      },
    ],
  }
}
