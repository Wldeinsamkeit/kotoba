import { Link } from 'react-router-dom'

type WordSet = {
  id: string
  title: string
  subtitle: string
  description: string
  icon: string
  path: string
  count?: number
  tag?: string
  level: number
  disabled?: boolean
  statusText?: string
}

export const wordSets: WordSet[] = [
  {
    id: 'n5',
    title: 'N5 词汇',
    subtitle: '入门基础',
    description: 'JLPT最低级别，适合零基础初学者',
    icon: '五',
    path: '/lessons/words/n5',
    count: 673,
    tag: '热门',
    level: 1,
  },
  {
    id: 'n4',
    title: 'N4 词汇',
    subtitle: '日常会话',
    description: '掌握基本日常交流所需的词汇',
    icon: '四',
    path: '/lessons/words/n4',
    count: 1175,
    tag: '新增',
    level: 2,
  },
  {
    id: 'n3',
    title: 'N3 词汇',
    subtitle: '中级进阶',
    description: '从初级到中级的过渡词汇',
    icon: '三',
    path: '/lessons/words/n3',
    count: 2691,
    tag: '新增',
    level: 3,
  },
  {
    id: 'n2',
    title: 'N2 词汇',
    subtitle: '商务水平',
    description: '能够理解日常场景和商务用语',
    icon: '二',
    path: '/lessons/words/n2',
    count: 0,
    tag: '待添加',
    level: 4,
  },
  {
    id: 'n1',
    title: 'N1 词汇',
    subtitle: '精通级别',
    description: '日语能力最高级别，深度理解',
    icon: '一',
    path: '/lessons/words/n1',
    count: 0,
    tag: '待添加',
    level: 5,
  },
  {
    id: 'gaokao',
    title: '高考单词',
    subtitle: 'Gaokao',
    description: '日语高考必备词汇，针对性学习',
    icon: '高',
    path: '/lessons/words/gaokao',
    count: 50,
    tag: '更新中',
    level: 3,
    disabled: true,
    statusText: '暂不可用',
  },
]

export function WordSetsPage() {
  return (
    <div className="page word-sets-page">
      <header className="page-header ws-header">
        <Link to="/lessons" className="back-link">← 返回每日课程</Link>
        <h1>单词库</h1>
        <p className="page-sub">课程页右上角的词汇副交互，选择适合你水平的词汇集开始学习</p>
      </header>

      <WordSetsList />
    </div>
  )
}

export function WordSetsList({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'word-sets-list compact' : 'word-sets-list'}>
      {wordSets.map((set) => {
        const isDisabled = Boolean(set.disabled || set.count === 0)
        const cardContent = (
          <>
          <div className="wsc-left">
            <span className="wsc-icon">{set.icon}</span>
            <div className="wsc-level-dots">
              {[1, 2, 3, 4, 5].map((d) => (
                <span key={d} className={`wsc-dot ${d <= set.level ? 'active' : ''}`} />
              ))}
            </div>
          </div>

          <div className="wsc-center">
            <div className="wsc-title-row">
              <h2 className="wsc-title">{set.title}</h2>
              <span className="wsc-subtitle">{set.subtitle}</span>
            </div>
            <p className="wsc-desc">{set.description}</p>
          </div>

          <div className="wsc-right">
            <span className={`wsc-tag ${isDisabled ? 'tag-locked' : 'tag-active'}`}>
              {set.tag}
            </span>
            <span className="wsc-count">
              {set.statusText ?? (set.count && set.count > 0 ? `${set.count} 词` : '暂无数据')}
            </span>
            <span className="wsc-arrow">→</span>
          </div>
          </>
        )

        return isDisabled ? (
          <div
            key={set.id}
            className="word-set-card disabled"
            aria-disabled="true"
          >
            {cardContent}
          </div>
        ) : (
          <Link
            key={set.id}
            to={set.path}
            className="word-set-card"
          >
            {cardContent}
          </Link>
        )
      })}
    </div>
  )
}
