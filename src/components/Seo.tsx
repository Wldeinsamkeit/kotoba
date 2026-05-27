import { useEffect } from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import { getLesson } from '../data/lessons'

const SITE_NAME = '日语实用练习'
const DEFAULT_TITLE = `${SITE_NAME}｜跟小田用剧情闯关学日语`
const DEFAULT_DESCRIPTION =
  '剧情闯关式日语学习网站，跟随在日留学生小田完成每日课程、基础会话、N5/N4 单词记忆、跟读和智能测试。'
const DEFAULT_IMAGE = '/seo-cover.svg'
const DEFAULT_KEYWORDS =
  '日语学习,N5单词,N4单词,JLPT,日语会话,日语背词,日语课程,日语语法,日语测试,罗马音'

type SeoConfig = {
  title: string
  description: string
  keywords?: string
  image?: string
  type?: 'website' | 'article'
  noindex?: boolean
}

function getSiteOrigin() {
  const configuredOrigin = import.meta.env.VITE_SITE_URL?.trim()
  if (configuredOrigin) return configuredOrigin.replace(/\/+$/, '')
  return window.location.origin
}

function absoluteUrl(path: string) {
  return new URL(path, `${getSiteOrigin()}/`).toString()
}

function setMeta(attribute: 'name' | 'property', key: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  )

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.content = value
}

function setCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.appendChild(element)
  }

  element.href = url
}

function setStructuredData(config: SeoConfig, currentUrl: string) {
  let element = document.head.querySelector<HTMLScriptElement>(
    'script[data-seo-json-ld="route"]',
  )

  if (!element) {
    element = document.createElement('script')
    element.type = 'application/ld+json'
    element.dataset.seoJsonLd = 'route'
    document.head.appendChild(element)
  }

  element.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: config.title,
    description: config.description,
    url: currentUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: absoluteUrl('/'),
    },
    inLanguage: ['zh-CN', 'ja'],
  })
}

function getSeoConfig(pathname: string): SeoConfig {
  if (pathname === '/') {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    }
  }

  if (pathname === '/lessons') {
    return {
      title: `每日课程｜${SITE_NAME}`,
      description:
        '按东京生活故事线解锁日语课程，从基础会话、教学板块、词卡收集到智能测试，一课一集推进小田的日语学习。',
      keywords: '日语每日课程,日语对话,N5课程,N4课程,日语学习路线',
    }
  }

  if (pathname === '/reading') {
    return {
      title: `日语阅读｜${SITE_NAME}`,
      description: '用分段阅读、生词记录和进度追踪练习日语阅读，把阅读材料变成可持续推进的学习任务。',
      keywords: '日语阅读,日语分级阅读,日语生词本',
    }
  }

  if (pathname === '/kana') {
    return {
      title: `假名练习｜${SITE_NAME}`,
      description: '用快速识别、发音反馈和小测验练习平假名与片假名，打牢日语入门基础。',
      keywords: '平假名,片假名,五十音,日语假名练习',
    }
  }

  if (pathname === '/lessons/words') {
    return {
      title: `单词库｜${SITE_NAME}`,
      description: '选择 N5、N4、N3 和高考日语词库，用联想记忆、例句和测试巩固单词。',
      keywords: '日语单词库,N5词汇,N4词汇,N3词汇,高考日语单词',
    }
  }

  if (pathname === '/lessons/words/n5') {
    return {
      title: `N5 词汇｜${SITE_NAME}`,
      description: 'N5 入门词汇学习，结合中文记忆法、读音、释义和复习进度，适合零基础日语学习者。',
      keywords: 'N5单词,N5词汇,日语入门单词,JLPT N5',
    }
  }

  if (pathname === '/lessons/words/n4') {
    return {
      title: `N4 词汇｜${SITE_NAME}`,
      description: 'N4 日常会话词汇学习，覆盖常见生活场景，用记忆法和分组复习推进词汇量。',
      keywords: 'N4单词,N4词汇,JLPT N4,日语日常词汇',
    }
  }

  if (pathname === '/lessons/words/n3') {
    return {
      title: `N3 词汇｜${SITE_NAME}`,
      description: 'N3 进阶词汇学习入口，承接初级日语到中级表达的词汇积累。',
      keywords: 'N3单词,N3词汇,JLPT N3,日语中级词汇',
    }
  }

  if (pathname === '/lessons/words/memory') {
    return {
      title: `日语单词记忆法｜${SITE_NAME}`,
      description: '用谐音、拆分、字形联想、固定读音和易混词对比，建立适合中文学习者的日语单词记忆方法。',
      keywords: '日语单词记忆法,日语谐音记忆,N5记忆法,N4记忆法',
    }
  }

  const quizMatch = matchPath('/lessons/:lessonId/quiz', pathname)
  if (quizMatch?.params.lessonId) {
    const lesson = getLesson(quizMatch.params.lessonId)
    return {
      title: `${lesson ? `${lesson.title}｜` : ''}智能测试｜${SITE_NAME}`,
      description: lesson
        ? `围绕「${lesson.title}」进行词汇拼写、语法理解、句子排序和日语输出测试。`
        : '通过词汇、语法和句子题检验本课日语学习成果。',
      keywords: '日语测试,日语语法题,日语句子排序,日语拼写练习',
    }
  }

  const lessonMatch = matchPath('/lessons/:lessonId', pathname)
  if (lessonMatch?.params.lessonId) {
    const lesson = getLesson(lessonMatch.params.lessonId)
    if (lesson) {
      return {
        title: `${lesson.title}｜${lesson.level} 每日课程｜${SITE_NAME}`,
        description: `${lesson.scenario} 本课包含基础对话、词卡、语法讲解、跟读和智能测试。`,
        keywords: `${lesson.level},${lesson.title},日语对话,日语课程,${lesson.tags.join(',')}`,
        type: 'article',
      }
    }
  }

  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  }
}

export function Seo() {
  const location = useLocation()

  useEffect(() => {
    const config = getSeoConfig(location.pathname)
    const currentUrl = absoluteUrl(`${location.pathname}${location.search}`)
    const imageUrl = absoluteUrl(config.image ?? DEFAULT_IMAGE)

    document.title = config.title
    setCanonical(currentUrl)
    setMeta('name', 'description', config.description)
    setMeta('name', 'keywords', config.keywords ?? DEFAULT_KEYWORDS)
    setMeta('name', 'robots', config.noindex ? 'noindex, nofollow' : 'index, follow')
    setMeta('property', 'og:title', config.title)
    setMeta('property', 'og:description', config.description)
    setMeta('property', 'og:url', currentUrl)
    setMeta('property', 'og:type', config.type ?? 'website')
    setMeta('property', 'og:image', imageUrl)
    setMeta('name', 'twitter:title', config.title)
    setMeta('name', 'twitter:description', config.description)
    setMeta('name', 'twitter:image', imageUrl)
    setStructuredData(config, currentUrl)
  }, [location.pathname, location.search])

  return null
}
