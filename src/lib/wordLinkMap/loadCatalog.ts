import { LINK_MAP_DATA_URL } from './constants'
import type { WordLinkCatalog, WordLinkItem } from './types'

export type WordLinkCatalogIndex = WordLinkCatalog & {
  byKey: Map<string, WordLinkItem>
}

let cached: WordLinkCatalogIndex | null = null

export async function loadWordLinkCatalog(): Promise<WordLinkCatalogIndex> {
  if (cached) return cached
  const response = await fetch(LINK_MAP_DATA_URL)
  if (!response.ok) {
    throw new Error(`无法加载链路图数据（${response.status}）`)
  }
  const payload = (await response.json()) as WordLinkCatalog
  cached = {
    ...payload,
    byKey: new Map(payload.words.map((item) => [item.key, item])),
  }
  return cached
}

export function getWordLinkItem(catalog: WordLinkCatalogIndex, key: string) {
  return catalog.byKey.get(key) ?? null
}
