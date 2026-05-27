import { useState, useRef } from 'react'

const HIRAGANA_KEYS = [
  'あ', 'い', 'う', 'え', 'お',
  'か', 'き', 'く', 'け', 'こ',
  'さ', 'し', 'す', 'せ', 'そ',
  'た', 'ち', 'つ', 'て', 'と',
  'な', 'に', 'ぬ', 'ね', 'の',
  'は', 'ひ', 'ふ', 'へ', 'ほ',
  'ま', 'み', 'む', 'め', 'も',
  'や', 'ゆ', 'よ',
  'ら', 'り', 'る', 'れ', 'ろ',
  'わ', 'を', 'ん',
  'ー', 'っ', '・',
]

type JapaneseInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  showKanaPad?: boolean
}

export function JapaneseInput({
  value,
  onChange,
  placeholder = '用日语输入（可切换系统日语输入法）',
  disabled = false,
  id,
  showKanaPad = true,
}: JapaneseInputProps) {
  const [keyboardVisible, setKeyboardVisible] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  function insertKana(kana: string) {
    const el = inputRef.current
    if (!el) {
      onChange(value + kana)
      return
    }
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const next = value.slice(0, start) + kana + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + kana.length
      el.setSelectionRange(pos, pos)
    })
  }

  return (
    <div className="japanese-input-wrap">
      <input
        ref={inputRef}
        id={id}
        type="text"
        className="japanese-input-field"
        lang="ja"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />

      {showKanaPad && !disabled && (
        <>
          <button
            type="button"
            className="japanese-keyboard-toggle"
            onClick={() => setKeyboardVisible(!keyboardVisible)}
            aria-expanded={keyboardVisible}
            aria-label={keyboardVisible ? '隐藏假名键盘' : '显示假名键盘'}
          >
            <span className="japanese-keyboard-toggle-icon">
              {keyboardVisible ? '▼' : '▲'}
            </span>
            <span className="japanese-keyboard-toggle-text">
              {keyboardVisible ? '隐藏假名键盘' : '显示假名键盘'}
            </span>
          </button>

          {keyboardVisible && (
            <div className="japanese-kana-pad" role="group" aria-label="假名输入面板">
              <div className="japanese-kana-keys">
                {HIRAGANA_KEYS.map((kana) => (
                  <button
                    key={kana}
                    type="button"
                    className="japanese-kana-key"
                    onClick={() => insertKana(kana)}
                    aria-label={`插入${kana}`}
                  >
                    {kana}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
