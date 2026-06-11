import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProgressProvider } from './context/ProgressContext'
import { Intro } from './components/Intro'
import { Layout } from './components/Layout'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { Home } from './pages/Home'
import { LessonsPage } from './pages/LessonsPage'
import { LessonPage } from './pages/LessonPage'
import { ProgressPage } from './pages/ProgressPage'
import { ReadingPage } from './pages/ReadingPage'
import { ReaderPage } from './pages/ReaderPage'
import { VocabularyPage } from './pages/VocabularyPage'
import { AccountPage } from './pages/AccountPage'
import { SmartQuizPage } from './pages/SmartQuizPage'
import { KanaPage } from './pages/KanaPage'
import { WordMoatPage } from './pages/WordMoatPage'
import { N5VocabPage } from './pages/N5VocabPage'
import { N4VocabPage } from './pages/N4VocabPage'
import { N3VocabPage } from './pages/N3VocabPage'
import { WordSetsPage } from './pages/WordSetsPage'
import { RelationshipsPage } from './pages/RelationshipsPage'
import { PricingPage } from './pages/PricingPage'
import { LandingPage } from './pages/LandingPage'
import { LessonCheckPage } from './pages/LessonCheckPage'
import { CardCollectionPage } from './pages/CardCollectionPage'
import { WordLinkMapPage } from './pages/WordLinkMapPage'
import { isIosNativeApp } from './lib/platform'
import { Seo } from './components/Seo'

const INTRO_SEEN_KEY = 'nihongo-intro-seen'

function shouldShowIntro() {
  if (isIosNativeApp()) {
    return false
  }

  if (window.location.pathname !== '/') {
    return false
  }

  try {
    return window.sessionStorage.getItem(INTRO_SEEN_KEY) !== 'true'
  } catch {
    return true
  }
}

export default function App() {
  const [showIntro, setShowIntro] = useState(shouldShowIntro)

  const completeIntro = () => {
    try {
      window.sessionStorage.setItem(INTRO_SEEN_KEY, 'true')
    } catch {
      // Ignore storage failures so the learning app can still open.
    }
    setShowIntro(false)
  }

  if (showIntro) {
    return <Intro onComplete={completeIntro} />
  }

  return (
    <BrowserRouter>
      <ProgressProvider>
        <Seo />
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="lesson-check" element={<LessonCheckPage />} />
            <Route path="lessons" element={<LessonsPage />} />
            <Route path="lessons/:lessonId" element={<LessonPage />} />
            <Route path="lessons/:lessonId/quiz" element={<SmartQuizPage />} />
            <Route path="kana" element={<KanaPage />} />
            <Route path="reading" element={<ReadingPage />} />
            <Route
              path="reading/:bookId/:chapterId"
              element={<ReaderPage />}
            />
            <Route path="vocabulary" element={<VocabularyPage />} />
            <Route path="lessons/words" element={<WordSetsPage />} />
            <Route path="lessons/words/n5" element={<N5VocabPage />} />
            <Route path="lessons/words/n4" element={<N4VocabPage />} />
            <Route path="lessons/words/link-map" element={<WordLinkMapPage />} />
            <Route path="lessons/words/n3" element={<N3VocabPage />} />
            <Route path="lessons/words/memory" element={<Navigate to="/lessons/words" replace />} />
            <Route path="lessons/words/gaokao" element={<WordMoatPage />} />
            <Route path="word-moat" element={<Navigate to="/lessons/words" replace />} />
            <Route path="word-moat/n5" element={<Navigate to="/lessons/words/n5" replace />} />
            <Route path="word-moat/n4" element={<Navigate to="/lessons/words/n4" replace />} />
            <Route path="word-moat/n3" element={<Navigate to="/lessons/words/n3" replace />} />
            <Route path="word-moat/gaokao" element={<Navigate to="/lessons/words/gaokao" replace />} />
            <Route path="relationships" element={<RelationshipsPage />} />
            <Route path="relationships/cards" element={<CardCollectionPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <PWAInstallPrompt />
      </ProgressProvider>
    </BrowserRouter>
  )
}
