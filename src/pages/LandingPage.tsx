import { useState } from 'react'
import { Link } from 'react-router-dom'
import './LandingPage.css'

type SrsLevel = null | 'again' | 'fuzzy' | 'remember'

const srsData = {
  again: { text: '已加入 10 分钟后复习', remaining: 43, progress: '36%' },
  fuzzy: { text: '已排到明天早晨', remaining: 41, progress: '54%' },
  remember: { text: '已排到 4 天后', remaining: 40, progress: '68%' },
}

export function LandingPage() {
  const [srsChoice, setSrsChoice] = useState<SrsLevel>(null)

  const feedback = srsChoice
    ? `${srsData[srsChoice].text} · 剩余 ${srsData[srsChoice].remaining} 张 · 进度 ${srsData[srsChoice].progress}`
    : '点击一个反馈，查看复习队列变化。'

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link className="landing-brand" to="/">
            <span className="landing-brand-mark">こ</span>
            日语学习
          </Link>
          <ul className="landing-nav-links">
            <li><a href="#path">学习路径</a></li>
            <li><a href="#review">SRS</a></li>
            <li><a href="#features">特色</a></li>
          </ul>
          <Link className="landing-cta" to="/lessons">
            开始学习
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-copy">
          <div>
            <p className="hero-eyebrow">日语学习 · N5-N3 词汇与句型</p>
            <h1 className="hero-title">
              每天一小页，<br />
              把日语单词记成<br />
              能说出口的句子。
            </h1>
          </div>
          <p className="hero-lead">
            为初级学习者安排今日复习、下一节课和连续学习反馈；核心是 SRS 记忆卡片，但每张卡都会回到真实语境。
          </p>
          <div className="hero-actions">
            <Link className="hero-btn-primary" to="/lessons">
              开始学习 →
            </Link>
            <Link className="hero-btn-secondary" to="/lessons/words/n5">
              浏览 N5 词汇
            </Link>
          </div>
          <div className="proof-strip">
            <div className="proof-item">
              <strong className="proof-num">N5-N3</strong>
              <span className="proof-label">覆盖初级到中级高频词、助词和生活场景。</span>
            </div>
            <div className="proof-item">
              <strong className="proof-num">SRS</strong>
              <span className="proof-label">按记忆状态排队，不把所有词都塞进同一天。</span>
            </div>
            <div className="proof-item">
              <strong className="proof-num">日课</strong>
              <span className="proof-label">首页永远显示下一件该做的学习动作。</span>
            </div>
          </div>
        </div>

        <aside className="phone-preview">
          <div className="phone-frame">
            <div className="phone-header">
              <p className="phone-header-eyebrow">今日の復習</p>
              <h2 className="phone-header-title">42 张卡片，先从容易忘的助词开始。</h2>
            </div>
            <div className="phone-path">
              <div className="path-step">
                <div className="path-node-icon now">は</div>
                <div className="path-info">
                  <strong>主题助词 は</strong>
                  <span className="path-meta">复习 · 6 张卡片</span>
                </div>
                <span className="path-tag now">Now</span>
              </div>
              <div className="path-step">
                <div className="path-node-icon next">駅</div>
                <div className="path-info">
                  <strong>车站问路</strong>
                  <span className="path-meta">N5 场景课 · 12 分钟</span>
                </div>
                <span className="path-tag next">Next</span>
              </div>
              <div className="path-step">
                <div className="path-node-icon later">食</div>
                <div className="path-info">
                  <strong>食べます / 飲みます</strong>
                  <span className="path-meta">动词变形 · N4 预习</span>
                </div>
                <span className="path-tag later">Later</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <div className="landing-features-inner">
          <p className="section-eyebrow">学习路径</p>
          <h2 className="section-title">
            不是课程库，而是一条每天能走完的日语小径。
          </h2>
          <div className="feature-grid">
            <article className="feature-card">
              <h3>首页只给一个主任务</h3>
              <p>复习、课程、成就合在同一条路径里；不用判断今天该先背词还是先上课。</p>
            </article>
            <article className="feature-card">
              <h3>卡片回到例句</h3>
              <p>单词、假名、中文释义和短句一起出现，降低只认识卡片、不认识句子的风险。</p>
            </article>
            <article className="feature-card">
              <h3>连续学习有温度</h3>
              <p>成就页不做夸张游戏化，只记录连续日、弱项和最近掌握的表达。</p>
            </article>
          </div>
        </div>
      </section>

      {/* SRS Demo */}
      <section className="landing-srs" id="review">
        <div className="landing-srs-inner">
          <div className="srs-copy">
            <p className="section-eyebrow">SRS 复习</p>
            <h2 className="section-title">
              每一次选择都会改变下一次出现的时间。
            </h2>
            <p className="srs-lead">
              学习卡片提供「再来一次」「有点迷糊」「记住了」三档反馈；复习列表会把低信心的词排在更靠前的位置。
            </p>
          </div>
          <div className="srs-card">
            <div className="srs-word-reading">あした</div>
            <div className="srs-word-kanji">明日</div>
            <p className="srs-word-meaning">明天</p>
            <p className="srs-word-example">明日、図書館で会いましょう。</p>
            <div className="srs-buttons">
              <button
                className={`srs-btn ${srsChoice === 'again' ? 'active' : ''}`}
                onClick={() => setSrsChoice('again')}
              >
                <span className="srs-btn-label">再来一次</span>
                <span className="srs-btn-time">10 分钟后再来</span>
              </button>
              <button
                className={`srs-btn ${srsChoice === 'fuzzy' ? 'active' : ''}`}
                onClick={() => setSrsChoice('fuzzy')}
              >
                <span className="srs-btn-label">有点迷糊</span>
                <span className="srs-btn-time">明天早晨复习</span>
              </button>
              <button
                className={`srs-btn ${srsChoice === 'remember' ? 'active' : ''}`}
                onClick={() => setSrsChoice('remember')}
              >
                <span className="srs-btn-label">记住了</span>
                <span className="srs-btn-time">4 天后复习</span>
              </button>
            </div>
            <div className="srs-feedback">{feedback}</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <span className="landing-footer-brand">日语学习 · ことばを毎日少しずつ</span>
          <ul className="landing-footer-links">
            <li><Link to="/lessons">课程</Link></li>
            <li><Link to="/lessons/words/n5">N5 词汇</Link></li>
            <li><Link to="/lessons/words/n4">N4 词汇</Link></li>
          </ul>
        </div>
      </footer>
    </div>
  )
}
