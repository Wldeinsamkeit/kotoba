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
  name: '免费层',
  price: '免费',
  description: '零门槛体验记忆法与 N5 核心内容',
  features: [
    `N5 记忆法免费（${getMemoryMethodCount('n5')} 词 · 谐音联想）`,
    'N5 课程免费',
    'N5 链路图免费',
    'N5 前 25 课',
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
      'N4 链路图',
      '阅读功能',
      'N5 + N4 全部课程',
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
      'N3 链路图',
      'N3 课程全部解锁',
      '词汇测验 + 错词强化',
    ],
    status: 'coming-soon',
  },
  {
    id: 'all-pass',
    name: '全部词库通行证',
    price: '¥88',
    originalPrice: '¥98',
    description: '一次买断 N5 + N4 + N3，最适合长期学习者',
    features: [
      'N5 + N4 + N3 全部词汇记忆法',
      '全部链路图 + 阅读功能',
      '全部课程解锁',
      '后续词库更新免费获取',
    ],
    badge: '核心卖点',
    highlight: true,
    status: 'coming-soon',
  },
]

const MEMBERSHIP_TIERS: PricingTier[] = [
  {
    id: 'monthly',
    name: '月卡',
    price: '¥15/月',
    description: '灵活订阅，随时取消',
    features: [
      '全部词库无限学习',
      '每日复习计划',
      '错词强化训练',
      '云同步进度',
      'AI 个性化记忆法',
      '后续新增内容',
    ],
    status: 'coming-soon',
  },
  {
    id: 'yearly',
    name: '年卡',
    price: '¥118/年',
    originalPrice: '¥180',
    description: '长期学习首选，折合约 ¥10/月',
    badge: '推荐',
    features: [
      '月卡全部权益',
      '支持 7 天或 14 天免费试用（以 App Store 配置为准）',
      '后续新课程优先解锁',
      '专属学习报告',
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

      <section className="pricing-section">
        <h2 className="pricing-section-title">免费层</h2>
        <p className="pricing-section-lead">零门槛体验，确认「记忆法真的有用」</p>
        <TierCard tier={FREE_TIER} isIOS={isIOS} />
      </section>

      <section className="pricing-section">
        <h2 className="pricing-section-title">记忆法包 · 一次性购买</h2>
        <p className="pricing-section-lead">买断层，作为主收入</p>
        <div className="pricing-grid">
          {MEMORY_PACKS.map((tier) => (
            <TierCard key={tier.id} tier={tier} isIOS={isIOS} />
          ))}
        </div>
      </section>

      <section className="pricing-section">
        <h2 className="pricing-section-title">
          会员 · 高级入口
          <span className="pricing-coming-badge">即将推出</span>
        </h2>
        <p className="pricing-section-lead">
          订阅解锁全部词库与 AI 能力；免费试用时长可在 App Store Connect 设为 7 天或 14 天
        </p>
        <div className="pricing-grid">
          {MEMBERSHIP_TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} isIOS={isIOS} />
          ))}
        </div>
      </section>

      <section className="pricing-note">
        <h3>权益说明</h3>
        <ul>
          <li>免费层含 N5 记忆法、N5 链路图与前 25 课，足够完整体验记忆法闭环</li>
          <li>N4 记忆法包解锁 N4 链路图、阅读功能，以及 N5 + N4 全部课程</li>
          <li>全部词库通行证适合想一次买断 N5–N3 的学习者，是平台核心卖点</li>
          <li>会员在买断包之上提供云同步、AI 个性化记忆法与后续新增内容</li>
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
