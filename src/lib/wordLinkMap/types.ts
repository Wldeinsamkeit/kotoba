export type RelationType =
  | 'same_kanji_different_reading'
  | 'same_reading_different_writing'
  | 'kana_similarity'
  | 'dakuten_or_handakuten_difference'
  | 'transitive_intransitive_pair'
  | 'same_kanji_same_reading'
  | 'adjective_derivation'
  | 'reading_prefix_chunk'

export type WordLinkRelation = {
  type: RelationType | string
  targetKey: string
  targetWord: string
  targetReading: string
  targetReadingRomaji?: string
  targetMeaning: string
  targetLevels?: string[]
  memoryValue?: number
  confidence?: number
  suggestedStrategy?: string
  note?: string
}

export type WordLinkMemoryMethod = {
  source: string
  batch: number
  index: number
  mergedScene: string
  reviewTip: string
  difficultyStars: number
}

export type WordLinkItem = {
  key: string
  word: string
  reading: string
  readingRomaji: string
  meaning: string
  levels: string[]
  kanji: string[]
  relations: WordLinkRelation[]
  relationSummary: { total: number; highValue: number }
  suggestedPrimaryStrategies: string[]
  searchText: string
  memoryMethod: WordLinkMemoryMethod | null
}

export type WordLinkCatalog = {
  metadata: {
    generatedAt: string
    levels: string[]
    totalWords: number
    description: string
  }
  words: WordLinkItem[]
}

export type WordLinkLevelFilter = '' | 'N5' | 'N4' | 'N3'

export type DensityFilter = 'compact' | 'balanced' | 'full'

export type GraphNode = {
  key: string
  item: WordLinkItem
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
  seed: number
  fixed: boolean
}

export type GraphLink = {
  source: GraphNode
  target: GraphNode
  type: string
  value: number
  seed: number
}

export type GraphTransform = { x: number; y: number; k: number }

export type GraphState = {
  nodes: GraphNode[]
  links: GraphLink[]
  transform: GraphTransform
  needsFit: boolean
  selectedKey: string | null
  hoverKey: string | null
}
