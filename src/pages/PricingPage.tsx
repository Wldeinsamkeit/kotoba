import { Link } from 'react-router-dom'
import { getMemoryMethodCount } from '../data/memoryMethods'
import { isIosNativeApp } from '../lib/platform'

type PricingTier = {
  id: string
  name: string
  price: string
  originalPrice?: string
  description: string
  features: string[]
  badge?: string
  status: 'available' | 'coming-soon' | 'maintenance'
  highlight?: boolean
  link?: string
}

const FREE_TIER: PricingTier = {
  id: 'free',
  name: 'N5 词汇记忆法',
  price: '免费',
  description: '完整体验"记忆法真的有用"',
  features: [
    `N5 全部 ${getMemoryMethodCount('n5')} 词 · 谐音联想记忆法`,
    '前 10 课免费体验（故事线 + 练习闭环）',
    '间隔重复复习系统',
    '假名学习 + 基础阅读',
  ],
  badge: '入门推荐',
  status: 'available',
  link: '/lessons/words/n5',
}

const MEMORY_PACKS: PricingTier[] = [
  {
    id: 'n4-pack',
    name: 'N4 记忆法包',
    price: '¥28',
    description: `日常会话词汇 · ${getMemoryMethodCount('n4')} 词`,
    features: [
      `N4 全部 ${getMemoryMethodCount('n4')} 词 · 谐音联想记忆法`,
      'N4 课程全部解锁',
      '词汇测验 + 错词强化',
    ],
    status: 'coming-soon',
  },
  {
    id: 'n3-pack',
    name: 'N3 记忆法包',
    price: '¥38',
    description: `中级进阶词汇 · ${getMemoryMethodCount('n3')} 词`,
    features: [
      `N3 全部 ${getMemoryMethodCount('n3')} 词 · 谐音联想记忆法`,
      'N3 课程全部解锁',
      '词汇测验 + 错词强化',
    ],
    status: 'coming-soon',
  },
  {
    id: 'all-pass',
    name: '全部通行证',
    price: '¥58',
    originalPrice: '¥66',
    description: 'N5 + N4 + N3 全部解锁',
    features: [
      'N5 + N4 + N3 全部词汇记忆法',
      '全部课程解锁',
      '后续更新免费获取',
    ],
    badge: '最划算',
    highlight: true,
    status: 'coming-soon',
  },
]

const MEMBERSHIP_TIERS: PricingTier[] = [
  {
    id: 'monthly',
    name: '月卡',
    price: '¥15/月',
    description: '灵活体验全部功能',
    features: [
      '全部词库无限学习',
      '每日智能复习计划',
      '错词强化训练',
      'AI 个性化联想',
      '云端同步',
    ],
    status: 'coming-soon',
  },
  {
    id: 'yearly',
    name: '年卡',
    price: '¥108/年',
    originalPrice: '¥180',
    description: '省 40%，长期学习首选',
    badge: '推荐',
    features: [
      '月卡全部权益',
      '后续新课程优先解锁',
      '专属学习报告',
      '优先客服支持',
    ],
    highlight: true,
    status: 'coming-soon',
  },
]

export function PricingPage() {
  const isIOS = isIosNativeApp()

  return (
    <div className="page pricing-page">
      <nav className="breadcrumb">
        <Link to="/account">账户</Link>
        <span aria-hidden> / </span>
        <span>会员中心</span>
      </nav>

      <header className="pricing-hero">
        <h1>会员中心</h1>
        <p className="page-sub">用谐音联想让单词过目不忘</p>
      </header>

      {/* 免费层 */}
      <section className="pricing-section">
        <h2 className="pricing-section-title">免费体验</h2>
        <TierCard tier={FREE_TIER} isIOS={isIOS} />
      </section>

      {/* 记忆法包 */}
      <section className="pricing-section">
        <h2 className="pricing-section-title">记忆法包 · 一次性购买</h2>
        <div className="pricing-grid">
          {MEMORY_PACKS.map((tier) => (
            <TierCard key={tier.id} tier={tier} isIOS={isIOS} />
          ))}
        </div>
      </section>

      {/* 会员 */}
      <section className="pricing-section">
        <h2 className="pricing-section-title">
          会员
          <span className="pricing-coming-badge">即将推出</span>
        </h2>
        <div className="pricing-grid">
          {MEMBERSHIP_TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} isIOS={isIOS} />
          ))}
        </div>
      </section>

      {/* 课程说明 */}
      <section className="pricing-note">
        <h3>课程说明</h3>
        <ul>
          <li>N5 课程完全免费，完整体验故事线和练习闭环</li>
          <li>N4 课程前几课免费，后续随 N4 词汇包解锁</li>
          <li>高级剧情课程将作为会员权益陆续开放</li>
        </ul>
      </section>
    </div>
  )
}

function TierCard({ tier, isIOS }: { tier: PricingTier; isIOS: boolean }) {
  const isMaintenance = isIOS && tier.status === 'coming-soon'
  const isDisabled = isMaintenance || tier.status === 'coming-soon'
  const btnLabel = tier.status === 'available'
    ? '免费开始'
    : isMaintenance
      ? '维护更新中'
      : '即将开放'

  return (
    <div
      className={[
        'pricing-tier',
        tier.highlight ? 'highlight' : '',
        isDisabled ? 'disabled' : '',
      ].filter(Boolean).join(' ')}
    >
      {tier.badge && <span className="pricing-badge">{tier.badge}</span>}
      {isMaintenance && <span className="pricing-maintenance-tag">维护中</span>}

      <div className="pricing-tier-header">
        <h3 className="pricing-tier-name">{tier.name}</h3>
        <p className="pricing-tier-desc">{tier.description}</p>
      </div>

      <div className="pricing-price-row">
        {tier.originalPrice && (
          <span className="pricing-original-price">{tier.originalPrice}</span>
        )}
        <span className="pricing-price">{tier.price}</span>
      </div>

      <ul className="pricing-features">
        {tier.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      {tier.link && !isDisabled ? (
        <Link className="pricing-btn" to={tier.link}>
          {btnLabel}
        </Link>
      ) : (
        <button className="pricing-btn disabled" disabled>
          {btnLabel}
        </button>
      )}
    </div>
  )
}
