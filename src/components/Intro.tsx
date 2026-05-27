import { useEffect, useState } from 'react'
import './Intro.css'

type LandscapeType = 'sakura' | 'fuji' | 'ricefield' | 'temple'

export function Intro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'initial' | 'approach' | 'door' | 'opening' | 'revealing' | 'complete'>('initial')
  const [landscape] = useState<LandscapeType>(() => {
    const landscapes: LandscapeType[] = ['sakura', 'fuji', 'ricefield', 'temple']
    return landscapes[Math.floor(Math.random() * landscapes.length)]
  })

  useEffect(() => {
    // Extended animation sequence for more immersive experience
    const initialDelay = setTimeout(() => setPhase('approach'), 800)
    const doorDelay = setTimeout(() => setPhase('door'), 2500)
    const openingDelay = setTimeout(() => setPhase('opening'), 5500)
    const revealDelay = setTimeout(() => setPhase('revealing'), 9500)
    const completeDelay = setTimeout(() => {
      setPhase('complete')
      setTimeout(onComplete, 3500)
    }, 14000)

    return () => {
      clearTimeout(initialDelay)
      clearTimeout(doorDelay)
      clearTimeout(openingDelay)
      clearTimeout(revealDelay)
      clearTimeout(completeDelay)
    }
  }, [onComplete])

  const getLandscapeTitle = () => {
    switch (landscape) {
      case 'sakura':
        return '桜'
      case 'fuji':
        return '富士山'
      case 'ricefield':
        return '田園'
      case 'temple':
        return '古都'
    }
  }

  const getLandscapeSubtitle = () => {
    switch (landscape) {
      case 'sakura':
        return '春の訪れ'
      case 'fuji':
        return '日本の象徴'
      case 'ricefield':
        return '里山の風景'
      case 'temple':
        return '心の栖'
    }
  }

  return (
    <div className={`intro-container intro-phase-${phase}`}>
      {/* Background gradient that changes with phases */}
      <div className="intro-background" />

      {/* Floating particles */}
      <div className="intro-particles">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      {/* Flowing Japanese subtitles during door opening */}
      <FlowingSubtitles phase={phase} />

      {/* Landscape layer */}
      <div className={`intro-landscape intro-landscape-${landscape}`}>
        <div className="landscape-elements">
          {landscape === 'sakura' && <SakuraElements />}
          {landscape === 'fuji' && <FujiElements />}
          {landscape === 'ricefield' && <RiceFieldElements />}
          {landscape === 'temple' && <TempleElements />}
        </div>
        <div className="landscape-gradient" />
        <div className="landscape-title-group">
          <div className="landscape-title">{getLandscapeTitle()}</div>
          <div className="landscape-subtitle">{getLandscapeSubtitle()}</div>
        </div>
      </div>

      {/* Japanese Door Frame */}
      <div className="intro-door-assembly">
        <div className="door-frame">
          <div className="door-header">
            <div className="door-header-ornament" />
          </div>
          <div className="door-body">
            <div className="door-left">
              <div className="shoji-screen">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="shoji-horizontal" />
                ))}
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="shoji-vertical shoji-vertical-left" />
                ))}
              </div>
              <div className="door-paper-glow" />
            </div>
            <div className="door-right">
              <div className="shoji-screen">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="shoji-horizontal" />
                ))}
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="shoji-vertical shoji-vertical-right" />
                ))}
              </div>
              <div className="door-paper-glow" />
            </div>
            <div className="door-center-post" />
          </div>
          <div className="door-threshold" />
        </div>
        <div className="door-handle-right">
          <div className="handle-ring" />
        </div>
        <div className="door-handle-left">
          <div className="handle-ring" />
        </div>
      </div>

      {/* Text overlays */}
      <div className="intro-text-container">
        <div className={`intro-welcome intro-welcome-${phase}`}>
          <p className="intro-japanese">日本語の世界へようこそ</p>
          <p className="intro-english">Welcome to the World of Japanese</p>
        </div>
        <div className={`intro-instruction intro-instruction-${phase}`}>
          <p>学習の旅を始めましょう</p>
          <p className="instruction-sub">Let's begin the learning journey</p>
        </div>
      </div>

      {/* Skip button */}
      <button
        className="intro-skip"
        onClick={onComplete}
        aria-label="Skip intro animation"
      >
        <span>スキップ</span>
        <span className="skip-en">Skip</span>
      </button>
    </div>
  )
}

// Enhanced Sakura scene
function SakuraElements() {
  return (
    <>
      {/* Multiple sakura trees */}
      <div className="sakura-grove">
        {[...Array(7)].map((_, i) => (
          <div
            key={`tree-${i}`}
            className="sakura-tree"
            style={{
              left: `${-25 + i * 22}%`,
              scale: 0.5 + Math.random() * 0.9,
              opacity: 0.3 + Math.random() * 0.7,
              zIndex: Math.floor(Math.random() * 5),
            }}
          >
            <div className="tree-trunk" />
            <div className="tree-foliage">
              {[...Array(20)].map((_, j) => (
                <div
                  key={j}
                  className="foliage-cluster"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Falling petals with more variety */}
      {[...Array(80)].map((_, i) => (
        <div
          key={i}
          className="sakura-petal"
          style={{
            left: `${Math.random() * 120 - 10}%`,
            animationDelay: `${Math.random() * 12}s`,
            animationDuration: `${5 + Math.random() * 7}s`,
            transform: `scale(${0.4 + Math.random() * 1.2})`,
          }}
        />
      ))}

      {/* Petal swirls */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`swirl-${i}`}
          className="petal-swirl"
          style={{
            left: `${15 + i * 18}%`,
            top: `${25 + (i % 3) * 18}%`,
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}

      {/* Ground petals */}
      <div className="ground-petals" />

      {/* Floating sparkles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${20 + Math.random() * 60}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      {/* Wind effect */}
      <div className="petals-in-wind" />
    </>
  )
}

// Enhanced Fuji scene
function FujiElements() {
  return (
    <>
      {/* Sky gradient elements */}
      <div className="sky-gradient">
        <div className="sky-clouds">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="cloud-element"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${3 + Math.random() * 28}%`,
                scale: 0.4 + Math.random() * 1.8,
                animationDelay: `${Math.random() * 25}s`,
                animationDuration: `${30 + Math.random() * 20}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Mount Fuji with more detail */}
      <div className="fuji-container">
        <div className="fuji-back">
          <div className="fuji-snow-cap-back" />
        </div>
        <div className="fuji-main">
          <div className="fuji-snow-cap">
            <div className="snow-highlight" />
            <div className="snow-shadow" />
          </div>
          <div className="fuji-body-gradient" />
          <div className="fuji-ridge">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="ridge-line"
                style={{
                  left: `${15 + i * 7}%`,
                  height: `${30 + Math.random() * 80}px`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Pine trees in foreground */}
      <div className="pine-forest">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="pine-tree"
            style={{
              left: `${-15 + i * 12}%`,
              scale: 0.4 + Math.random() * 0.9,
            }}
          />
        ))}
      </div>

      {/* Flying birds */}
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="flying-bird"
          style={{
            left: `${-15 + Math.random() * 130}%`,
            top: `${10 + Math.random() * 30}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${10 + Math.random() * 12}s`,
          }}
        />
      ))}

      {/* Lake reflection */}
      <div className="fuji-lake">
        <div className="lake-reflection" />
        <div className="lake-ripples">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="ripple"
              style={{
                animationDelay: `${i * 0.6}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating dust particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={`dust-${i}`}
          className="floating-dust"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${12 + Math.random() * 8}s`,
          }}
        />
      ))}
    </>
  )
}

// Enhanced Rice Field scene
function RiceFieldElements() {
  return (
    <>
      {/* Beautiful sky */}
      <div className="ricefield-sky">
        <div className="sun-glow">
          <div className="sun-core" />
          <div className="sun-rays">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="sun-ray"
                style={{ transform: `rotate(${i * 22.5}deg)` }}
              />
            ))}
          </div>
        </div>

        {/* Atmospheric clouds */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="rice-cloud"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${5 + Math.random() * 35}%`,
              animationDelay: `${Math.random() * 40}s`,
              scale: 0.6 + Math.random() * 1.2,
            }}
          />
        ))}
      </div>

      {/* Rolling hills background */}
      <div className="hills-background">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="hill"
            style={{
              left: `${i * 20 - 15}%`,
              scale: 0.7 + i * 0.12,
              opacity: 0.4 + Math.random() * 0.3,
            }}
          />
        ))}
      </div>

      {/* Rice field with detailed stalks */}
      <div className="ricefield-foreground">
        <div className="ricefield-ground">
          {/* Multiple rows of rice */}
          {[...Array(10)].map((_, row) => (
            <div key={row} className="rice-row">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="rice-stalk"
                  style={{
                    height: `${45 + Math.random() * 55}px`,
                    animationDelay: `${Math.random() * 2.5}s`,
                  }}
                >
                  <div className="rice-grain" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Dragonflies */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="dragonfly"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${25 + Math.random() * 45}%`,
            animationDelay: `${Math.random() * 12}s`,
            animationDuration: `${12 + Math.random() * 8}s`,
          }}
        />
      ))}

      {/* Butterflies */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`butterfly-${i}`}
          className="butterfly"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${30 + Math.random() * 40}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${8 + Math.random() * 6}s`,
          }}
        />
      ))}

      {/* Floating sparkles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${15 + Math.random() * 50}%`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
    </>
  )
}

// Enhanced Temple scene
function TempleElements() {
  return (
    <>
      {/* Atmospheric sky */}
      <div className="temple-sky">
        <div className="temple-sunset" />
      </div>

      {/* Background mountains */}
      <div className="temple-mountains">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="temple-mountain"
            style={{
              left: `${i * 40 - 20}%`,
              opacity: 0.3 + i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Stone path */}
      <div className="stone-path">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="stone-step"
            style={{
              left: `${40 + Math.random() * 20}%`,
              bottom: `${i * 8}%`,
            }}
          />
        ))}
      </div>

      {/* Multiple torii gates */}
      <div className="torii-tunnel">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="torii-gate"
            style={{
              scale: 0.4 + i * 0.2,
              bottom: `${10 + i * 15}%`,
              opacity: 0.4 + i * 0.15,
            }}
          >
            <div className="torii-pillar left" />
            <div className="torii-pillar right" />
            <div className="torii-lower-kasagi" />
            <div className="torii-upper-kasagi" />
          </div>
        ))}
      </div>

      {/* Main temple */}
      <div className="temple-main">
        <div className="temple-roof-main">
          <div className="roof-tiles">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="roof-tile"
                style={{ left: `${i * 5}%` }}
              />
            ))}
          </div>
        </div>
        <div className="temple-body-main">
          <div className="temple-paper-lantern left" />
          <div className="temple-door">
            <div className="temple-shoji" />
          </div>
          <div className="temple-paper-lantern right" />
        </div>
      </div>

      {/* Falling maple leaves */}
      {[...Array(45)].map((_, i) => (
        <div
          key={i}
          className="maple-leaf"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${4 + Math.random() * 6}s`,
            transform: `scale(${0.3 + Math.random() * 1}) rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}

      {/* Bamboo details */}
      <div className="bamboo-grove">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="bamboo"
            style={{
              left: `${-8 + i * 6}%`,
              height: `${120 + Math.random() * 150}px`,
            }}
          />
        ))}
      </div>

      {/* Temple smoke/incense */}
      <div className="temple-smoke" />

      {/* Floating sparkles */}
      {[...Array(18)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${20 + Math.random() * 50}%`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}

      {/* Fireflies */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="firefly"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${35 + Math.random() * 55}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${4 + Math.random() * 4}s`,
          }}
        />
      ))}
    </>
  )
}

// Flowing Japanese Subtitles Component
const welcomePhrases = [
  { ja: 'こんにちは', en: 'Hello', romaji: 'Konnichiwa' },
  { ja: 'いらっしゃいませ', en: 'Welcome', romaji: 'Irasshaimase' },
  { ja: 'ようこそ', en: 'Welcome', romaji: 'Youkoso' },
  { ja: 'Hello World', en: 'Hello World', romaji: 'Hello World' },
  { ja: 'お元気ですか', en: 'How are you?', romaji: 'Ogenki desu ka' },
  { ja: '始めましょう', en: 'Let\'s begin', romaji: 'Hajimemashou' },
  { ja: '学びの旅', en: 'Learning Journey', romaji: 'Manabi no tabi' },
  { ja: '日本語', en: 'Japanese', romaji: 'Nihongo' },
  { ja: '夢', en: 'Dream', romaji: 'Yume' },
  { ja: '希望', en: 'Hope', romaji: 'Kibou' },
  { ja: '絆', en: 'Bond', romaji: 'Kizuna' },
  { ja: '和', en: 'Harmony', romaji: 'Wa' },
  { ja: '心', en: 'Heart', romaji: 'Kokoro' },
  { ja: '道', en: 'Path', romaji: 'Michi' },
  { ja: '空', en: 'Sky', romaji: 'Sora' },
  { ja: '風', en: 'Wind', romaji: 'Kaze' },
  { ja: '花', en: 'Flower', romaji: 'Hana' },
  { ja: '光', en: 'Light', romaji: 'Hikari' },
  { ja: '未来', en: 'Future', romaji: 'Mirai' },
  { ja: '始まり', en: 'Beginning', romaji: 'Hajimari' },
  { ja: '一歩', en: 'One Step', romaji: 'Ippo' },
  { ja: '前へ', en: 'Forward', romaji: 'Mae e' },
  { ja: '継続', en: 'Continue', romaji: 'Keizoku' },
  { ja: '挑戦', en: 'Challenge', romaji: 'Chousen' },
  { ja: '成長', en: 'Growth', romaji: 'Seichou' },
  { ja: 'ありがとう', en: 'Thank you', romaji: 'Arigatou' },
  { ja: 'すみません', en: 'Excuse me', romaji: 'Sumimasen' },
  { ja: 'おはよう', en: 'Good morning', romaji: 'Ohayou' },
  { ja: 'こんばんは', en: 'Good evening', romaji: 'Konbanwa' },
  { ja: 'さようなら', en: 'Goodbye', romaji: 'Sayounara' },
  { ja: 'はい', en: 'Yes', romaji: 'Hai' },
  { ja: 'いいえ', en: 'No', romaji: 'Iie' },
  { ja: '楽しみ', en: 'Enjoy', romaji: 'Tanoshimi' },
  { ja: '頑張って', en: 'Do your best', romaji: 'Ganbatte' },
  { ja: '笑顔', en: 'Smile', romaji: 'Egao' },
  { ja: '幸せ', en: 'Happiness', romaji: 'Shiawase' },
  { ja: '愛', en: 'Love', romaji: 'Ai' },
  { ja: '友情', en: 'Friendship', romaji: 'Yuujou' },
  { ja: '勇気', en: 'Courage', romaji: 'Yuuki' },
  { ja: '平和', en: 'Peace', romaji: 'Heiwa' },
  { ja: '自由', en: 'Freedom', romaji: 'Jiyuu' },
  { ja: '創造', en: 'Creation', romaji: 'Souzou' },
  { ja: '探求', en: 'Exploration', romaji: 'Tankyuu' },
  { ja: '発見', en: 'Discovery', romaji: 'Hakken' },
  { ja: '挑戦', en: 'Challenge', romaji: 'Chousen' },
  { ja: '成功', en: 'Success', romaji: 'Seikou' },
  { ja: '努力', en: 'Effort', romaji: 'Doryoku' },
]

function FlowingSubtitles({ phase }: { phase: string }) {
  const shouldShow = phase === 'door' || phase === 'opening'

  if (!shouldShow) return null

  // Create staggered animation delays for smoother distribution
  const createSubtitles = () => {
    const subtitles = []
    const count = 60 // Reduced from 80 for better performance

    for (let i = 0; i < count; i++) {
      const phrase = welcomePhrases[i % welcomePhrases.length]
      const size = 0.7 + Math.random() * 2.8
      const direction = Math.random() > 0.5 ? 'left' : 'right'
      // Stagger delays more evenly
      const delay = (i / count) * 8 // 0-8s staggered based on index

      subtitles.push(
        <div
          key={i}
          className={`flowing-text flowing-${direction}`}
          style={{
            left: `${-10 + Math.random() * 120}%`,
            top: `${5 + Math.random() * 85}%`,
            fontSize: `${size}rem`,
            animationDelay: `${delay}s`,
            animationDuration: `${7 + Math.random() * 5}s`,
          }}
        >
          {phrase.ja}
          <span className="romaji-text">{phrase.romaji}</span>
        </div>
      )
    }
    return subtitles
  }

  return <div className="flowing-subtitles">{createSubtitles()}</div>
}
