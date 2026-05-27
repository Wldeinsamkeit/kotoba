/**
 * 经验值和等级系统
 */

// 计算升级所需经验值
export function getXPForLevel(level: number): number {
  // 使用递增公式：每级需要更多经验
  // Level 1 -> 0 XP
  // Level 2 -> 100 XP
  // Level 3 -> 250 XP
  // Level 4 -> 450 XP
  // ...
  return Math.floor(50 * level * (level - 1))
}

// 根据总经验值计算当前等级
export function getLevelFromXP(totalXP: number): number {
  let level = 1
  while (totalXP >= getXPForLevel(level + 1)) {
    level++
  }
  return level
}

// 计算当前等级的进度百分比
export function getLevelProgress(totalXP: number): number {
  const currentLevel = getLevelFromXP(totalXP)
  const currentLevelXP = getXPForLevel(currentLevel)
  const nextLevelXP = getXPForLevel(currentLevel + 1)
  const xpInCurrentLevel = totalXP - currentLevelXP
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP

  return Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100)
}

// 计算距离下一级还需要多少经验
export function getXPToNextLevel(totalXP: number): number {
  const currentLevel = getLevelFromXP(totalXP)
  const nextLevelXP = getXPForLevel(currentLevel + 1)
  return nextLevelXP - totalXP
}

// 经验值获取动作
export const XP_REWARDS = {
  COMPLETE_LESSON: 50,        // 完成一课
  QUIZ_CORRECT: 10,           // 每答对一题
  PERFECT_QUIZ: 30,           // 测验满分额外奖励
  DAILY_STREAK: 20,           // 每日打卡
  READING_MINUTE: 1,          // 每阅读一分钟
  COMPLETE_READING_GOAL: 25,  // 完成每日阅读目标
  ADD_VOCABULARY: 5,          // 添加生词
  COMPLETE_CHAPTER: 30,       // 完成一章阅读
  FIRST_DAILY_LOGIN: 15,      // 每日首次登录
}

export type XPRewardType = keyof typeof XP_REWARDS

// 获取经验值奖励
export function getXPReward(type: XPRewardType, multiplier: number = 1): number {
  return Math.floor(XP_REWARDS[type] * multiplier)
}

// 检查是否升级
export function checkLevelUp(oldXP: number, newXP: number): boolean {
  return getLevelFromXP(oldXP) < getLevelFromXP(newXP)
}

// 获取等级称号
export function getLevelTitle(level: number): string {
  if (level < 5) return '初学者'
  if (level < 10) return '入门者'
  if (level < 15) return '进阶者'
  if (level < 20) return '熟练者'
  if (level < 30) return '精通者'
  if (level < 50) return '大师'
  return '传奇'
}
