import { useEffect, useState } from 'react'

export function JapaneseInputGuide() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hasSeenBefore = localStorage.getItem('japanese-input-guide-seen')
    if (!hasSeenBefore) {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    setVisible(false)
    localStorage.setItem('japanese-input-guide-seen', 'true')
  }

  if (!visible) return null

  return (
    <div className="japanese-input-guide-overlay">
      <div className="japanese-input-guide-card">
        <button
          className="japanese-input-guide-close"
          onClick={dismiss}
          aria-label="关闭"
        >
          ×
        </button>

        <div className="japanese-input-guide-header">
          <span className="japanese-input-guide-icon">あ</span>
          <h2>推荐安装日语输入法</h2>
          <p>为了更好的输入体验，建议安装系统日语输入法</p>
        </div>

        <div className="japanese-input-guide-platforms">
          <div className="japanese-input-guide-platform">
            <h3>🍎 macOS</h3>
            <ol>
              <li>打开「系统设置」→「键盘」→「输入法」</li>
              <li>点击「+」，添加「日文」→「Hiragana」</li>
              <li>使用 <code>⌘ + 空格</code> 切换输入法</li>
            </ol>
          </div>

          <div className="japanese-input-guide-platform">
            <h3>🪟 Windows</h3>
            <ol>
              <li>打开「设置」→「时间和语言」→「语言」</li>
              <li>添加「日语」语言包</li>
              <li>安装后使用 <code>Win + 空格</code> 切换</li>
            </ol>
          </div>

          <div className="japanese-input-guide-platform">
            <h3>📱 iPhone / Android</h3>
            <ol>
              <li>打开「设置」→「通用」→「键盘」</li>
              <li>添加「日语」→「假名」键盘</li>
              <li>输入时点击「🌐」图标切换</li>
            </ol>
          </div>
        </div>

        <div className="japanese-input-guide-footer">
          <p className="japanese-input-guide-note">
            💡 安装后输入更快，也可以使用下方假名键盘辅助
          </p>
          <button className="japanese-input-guide-dismiss-btn" onClick={dismiss}>
            知道了，不再提醒
          </button>
        </div>
      </div>
    </div>
  )
}
