import type { Book } from '../data/books'

const KEY = 'nihongo-reading-custom-books-v1'

export function loadCustomBooks(): Book[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    // 轻量校验：只要有 chapters 数组就认为可用
    return (parsed as Book[]).filter(
      (b) => typeof b?.id === 'string' && Array.isArray(b?.chapters),
    )
  } catch {
    return []
  }
}

export function saveCustomBooks(books: Book[]): void {
  localStorage.setItem(KEY, JSON.stringify(books))
}

export function upsertCustomBook(book: Book): void {
  const list = loadCustomBooks()
  const idx = list.findIndex((b) => b.id === book.id)
  if (idx >= 0) list[idx] = book
  else list.push(book)
  saveCustomBooks(list)
}

export function clearCustomBooks(): void {
  localStorage.removeItem(KEY)
}

// 添加或更新书籍词汇表中的词汇
export function upsertBookVocabulary(
  bookId: string,
  vocabItem: { word: string; reading?: string; meaning: string }
): boolean {
  const list = loadCustomBooks()
  const book = list.find((b) => b.id === bookId)

  if (!book) {
    // 如果是内置书籍，创建自定义副本
    return false // 需要先将内置书籍复制为自定义书籍
  }

  // 查找是否已存在该词汇
  const existingIndex = book.vocabulary.findIndex((v) => v.word === vocabItem.word)

  if (existingIndex >= 0) {
    // 更新现有词汇
    book.vocabulary[existingIndex] = vocabItem
  } else {
    // 添加新词汇
    book.vocabulary.push(vocabItem)
  }

  upsertCustomBook(book)
  return true
}

// 从书籍词汇表中删除词汇
export function removeBookVocabulary(bookId: string, word: string): boolean {
  const list = loadCustomBooks()
  const book = list.find((b) => b.id === bookId)

  if (!book) return false

  book.vocabulary = book.vocabulary.filter((v) => v.word !== word)
  upsertCustomBook(book)
  return true
}

// 复制内置书籍为自定义书籍
export function cloneBuiltinBook(bookId: string, originalBook: Book): void {
  const list = loadCustomBooks()
  const exists = list.find((b) => b.id === bookId)

  if (exists) return // 已存在自定义副本

  // 创建副本，标记为自定义
  const customBook: Book = {
    ...originalBook,
    id: `${bookId}-custom`, // 使用不同的ID
    title: `${originalBook.title} (自定义版)`,
    vocabulary: [...originalBook.vocabulary], // 复制词汇表
  }

  list.push(customBook)
  saveCustomBooks(list)
}

