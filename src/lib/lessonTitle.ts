export function parseLessonTitle(title: string): {
  topicZh: string
  topicJa: string
} {
  const parts = title.split(/[:：]/)
  if (parts.length === 1) {
    return { topicZh: title.trim(), topicJa: title.trim() }
  }

  return {
    topicZh: parts[0].trim(),
    topicJa: parts.slice(1).join('：').trim(),
  }
}
