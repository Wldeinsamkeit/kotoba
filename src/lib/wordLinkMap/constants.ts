export const RELATION_TYPE_LABEL: Record<string, string> = {
  same_kanji_different_reading: '同字不同音',
  kana_similarity: '假名相近',
  same_reading_different_writing: '同音不同字',
  dakuten_or_handakuten_difference: '浊音变化',
  transitive_intransitive_pair: '自他动词',
  same_kanji_same_reading: '同字同音',
  adjective_derivation: '形容词派生',
  reading_prefix_chunk: '读音前缀',
}

export const RELATION_STYLE: Record<
  string,
  { symbol: string; color: string; alpha: number; width: number; distance: number }
> = {
  same_kanji_different_reading: { symbol: '字', color: '#86b7dc', alpha: 0.34, width: 1.05, distance: 205 },
  same_reading_different_writing: { symbol: '音', color: '#8fc9a6', alpha: 0.42, width: 1.25, distance: 178 },
  kana_similarity: { symbol: '仮', color: '#e0bd6f', alpha: 0.44, width: 1.18, distance: 170 },
  dakuten_or_handakuten_difference: { symbol: '゛', color: '#dd8066', alpha: 0.48, width: 1.35, distance: 162 },
  transitive_intransitive_pair: { symbol: '自', color: '#b99add', alpha: 0.54, width: 1.45, distance: 150 },
  same_kanji_same_reading: { symbol: '同', color: '#9fc0cf', alpha: 0.42, width: 1.2, distance: 160 },
  adjective_derivation: { symbol: 'い', color: '#d7a1b8', alpha: 0.5, width: 1.35, distance: 145 },
  reading_prefix_chunk: { symbol: '前', color: '#9fc0cf', alpha: 0.42, width: 1.2, distance: 165 },
}

export const LEVEL_COLOR: Record<string, string> = {
  N5: '#74a889',
  N4: '#d28c5c',
  N3: '#9b83c9',
}

export const LEVEL_TABS: Array<{ value: '' | 'N5' | 'N4' | 'N3'; label: string }> = [
  { value: '', label: 'ALL' },
  { value: 'N5', label: 'N5' },
  { value: 'N4', label: 'N4' },
  { value: 'N3', label: 'N3' },
]

export const DENSITY_LABEL: Record<string, string> = {
  compact: '清爽',
  balanced: '标准',
  full: '更多',
}

export const DENSITY_CONFIG = {
  compact: { maxNeighbors: 28, maxNodes: 36, linkDensity: 0.58 },
  balanced: { maxNeighbors: 56, maxNodes: 64, linkDensity: 0.82 },
  full: { maxNeighbors: 96, maxNodes: 96, linkDensity: 1.05 },
} as const

export const LINK_MAP_DATA_URL = '/word-relations/n5_n4_n3_link_map.json'
