const KEY = 'nihongo-reading-core-words-v1'

export type CoreWordsState = Record<string, string[]>

export function loadCoreWords(): CoreWordsState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as CoreWordsState
  } catch {
    return {}
  }
}

export function saveCoreWords(state: CoreWordsState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function toggleCoreWord(bookId: string, word: string): CoreWordsState {
  const state = loadCoreWords()
  const list = state[bookId] ?? []
  const idx = list.indexOf(word)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(word)

  const next = { ...state, [bookId]: list }
  if (next[bookId].length === 0) delete next[bookId]
  saveCoreWords(next)
  return next
}

export function isCoreWord(bookId: string, word: string): boolean {
  const state = loadCoreWords()
  return (state[bookId] ?? []).includes(word)
}

