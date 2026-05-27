import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  loadDictionaries,
  addDictionary,
  removeDictionary,
  toggleDictionary,
  updateDictionaryPriority,
  importDictionary,
  createBuiltinDictionary,
  saveDictionaries,
} from '../lib/dictionary'

type ImportError = string | null

export function DictionaryPage() {
  const navigate = useNavigate()
  const [dictionaries, setDictionaries] = useState(() => {
    const dicts = loadDictionaries()
    if (dicts.length === 0) {
      // 如果没有词典，初始化内置词典
      const builtin = createBuiltinDictionary()
      saveDictionaries([builtin])
      return [builtin]
    }
    return dicts
  })
  const [importError, setImportError] = useState<ImportError>(null)
  const [importSuccess, setImportSuccess] = useState(false)

  const totalEntries = useMemo(() => {
    return dictionaries.reduce((sum, d) => sum + d.entries.length, 0)
  }, [dictionaries])

  const enabledCount = dictionaries.filter(d => d.isEnabled).length

  async function handleImportFile(file: File) {
    setImportError(null)
    setImportSuccess(false)

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const result = importDictionary(data)
      if (!result.success) {
        setImportError(result.error || '导入失败')
        return
      }

      const updated = addDictionary(result.dict!)
      setDictionaries(updated)
      saveDictionaries(updated)
      setImportSuccess(true)
      setTimeout(() => setImportSuccess(false), 3000)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : '文件解析失败')
    }
  }

  function handleToggle(id: string) {
    const updated = toggleDictionary(id)
    setDictionaries(updated)
    saveDictionaries(updated)
  }

  function handleDelete(id: string) {
    if (window.confirm('确定要删除这个词典吗？')) {
      const updated = removeDictionary(id)
      setDictionaries(updated)
    }
  }

  function handlePriorityChange(id: string, change: number) {
    const dict = dictionaries.find(d => d.id === id)
    if (!dict) return

    const newPriority = dict.priority + change
    const updated = updateDictionaryPriority(id, newPriority)
    setDictionaries(updated)
    saveDictionaries(updated)
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>日语辞书管理</h1>
        <p className="page-sub">
          导入和管理您的日语词典。支持JSON格式，可从EPWING等格式转换。
        </p>
      </header>

      <section className="stats-row" aria-label="词典概览">
        <div className="stat-card">
          <span className="stat-value">{dictionaries.length}</span>
          <span className="stat-label">已安装词典</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{enabledCount}</span>
          <span className="stat-label">已启用</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalEntries.toLocaleString()}</span>
          <span className="stat-label">总词条数</span>
        </div>
      </section>

      <section className="section-block">
        <h2>导入新词典</h2>

        <div className="import-card">
          <h3>支持格式</h3>
          <p className="page-sub small">
            请上传JSON格式的词典文件。格式示例：
          </p>
          <pre className="format-example">
{`{
  "id": "my-dict",
  "name": "我的词典",
  "description": "自定义词典",
  "priority": 100,
  "entries": [
    {
      "word": "単語",
      "reading": "たんご",
      "meanings": ["单词", "词汇"],
      "partOfSpeech": "名词",
      "example": "単語を覚える（记单词）"
    }
  ]
}`}
          </pre>

          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            选择JSON文件
            <input
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                void handleImportFile(f)
                e.target.value = ''
              }}
            />
          </label>

          {importError && <p className="import-error">{importError}</p>}
          {importSuccess && (
            <p className="import-success">✓ 词典导入成功！</p>
          )}
        </div>
      </section>

      <section className="section-block">
        <h2>已安装的词典</h2>

        {dictionaries.length === 0 ? (
          <div className="empty-state">
            <p>还没有安装任何词典。</p>
          </div>
        ) : (
          <div className="dictionary-list">
            {dictionaries.map((dict, index) => (
              <div key={dict.id} className="dictionary-card">
                <div className="dictionary-card-header">
                  <div className="dictionary-info">
                    <h3>{dict.name}</h3>
                    {dict.description && (
                      <p className="page-sub small">{dict.description}</p>
                    )}
                    <p className="dictionary-meta">
                      {dict.entries.length.toLocaleString()} 个词条 · 优先级 {dict.priority}
                    </p>
                  </div>

                  <div className="dictionary-controls">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={dict.isEnabled}
                        onChange={() => handleToggle(dict.id)}
                      />
                      <span>启用</span>
                    </label>
                  </div>
                </div>

                <div className="dictionary-actions">
                  <div className="priority-controls">
                    <span>优先级：</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={index === 0}
                      onClick={() => handlePriorityChange(dict.id, -1)}
                      title="提高优先级"
                    >
                      ↑ 提升
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={index === dictionaries.length - 1}
                      onClick={() => handlePriorityChange(dict.id, 1)}
                      title="降低优先级"
                    >
                      ↓ 降低
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDelete(dict.id)}
                  >
                    删除
                  </button>
                </div>

                {dict.entries.length > 0 && dict.entries.length <= 5 && (
                  <div className="dictionary-preview">
                    <h4>词条预览：</h4>
                    <ul>
                      {dict.entries.slice(0, 5).map((entry, i) => (
                        <li key={i}>
                          <strong>{entry.word}</strong>（{entry.reading}）
                          ：{entry.meanings.join('、')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section-block">
        <h2>使用说明</h2>
        <ul className="feature-list">
          <li>
            <strong>查询优先级</strong>：系统会按优先级顺序查询词典，优先级数值越小越优先。
          </li>
          <li>
            <strong>EPWING转换</strong>：您可以使用工具将EPWING格式转换为JSON后导入。
          </li>
          <li>
            <strong>实时标注</strong>：阅读时，词典中存在的词汇会自动高亮显示。
          </li>
          <li>
            <strong>按需查询</strong>：点击词汇会显示所有词典中的释义。
          </li>
        </ul>
      </section>

      <section className="section-block">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/reading')}
        >
          返回阅读
        </button>
      </section>
    </div>
  )
}
