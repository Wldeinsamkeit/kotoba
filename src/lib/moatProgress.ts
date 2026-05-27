const KEY = 'nihongo-word-moat-progress-v1'

export type MoatStoredProgress = {
  /** 背诵卡片当前索引（循环） */
  cardIndex: number
}

const defaultState: MoatStoredProgress = {
  cardIndex: 0,
}

export function loadMoatProgress(): MoatStoredProgress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaultState }
    const parsed = JSON.parse(raw) as MoatStoredProgress
    return { ...defaultState, ...parsed }
  } catch {
    return { ...defaultState }
  }
}

export function saveMoatProgress(state: MoatStoredProgress): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}
