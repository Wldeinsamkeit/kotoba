/** 标准化日语书写答案（去空格、全角转半角等） */
export function normalizeJapaneseAnswer(value: string): string {
  return value
    .trim()
    .replace(/\s/g, '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
    )
}

export function isJapaneseAnswerCorrect(
  user: string,
  accepted: string[],
): boolean {
  const normalized = normalizeJapaneseAnswer(user)
  if (!normalized) return false
  return accepted.some(
    (a) => normalizeJapaneseAnswer(a) === normalized,
  )
}
