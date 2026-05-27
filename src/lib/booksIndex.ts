import { books as builtinBooks, type Book, type Chapter } from '../data/books'
import { loadCustomBooks } from './customBooks'

export function getAllBooks(): Book[] {
  return [...builtinBooks, ...loadCustomBooks()]
}

export function getBook(bookId: string): Book | undefined {
  return getAllBooks().find((b) => b.id === bookId)
}

export function getChapter(
  bookId: string,
  chapterId: string,
): Chapter | undefined {
  const book = getBook(bookId)
  return book?.chapters.find((c) => c.id === chapterId)
}

