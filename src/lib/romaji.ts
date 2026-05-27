import type { VocabItem } from '../types'

const commonReadings: Record<string, string> = {
  小田: 'おだ',
  田中: 'たなか',
  山本先生: 'やまもとせんせい',
  山本: 'やまもと',
  先生: 'せんせい',
  中国: 'ちゅうごく',
  日本: 'にほん',
  日本語: 'にほんご',
  東京: 'とうきょう',
  留学生: 'りゅうがくせい',
  学生: 'がくせい',
  勉強: 'べんきょう',
  一緒: 'いっしょ',
  頑張りましょう: 'がんばりましょう',
  頑張: 'がんば',
  よろしくお願いします: 'よろしくおねがいします',
  来ました: 'きました',
  来まし: 'きまし',
  来た: 'きた',
  来: 'き',
  住んで: 'すんで',
  慣れて: 'なれて',
  楽しい: 'たのしい',
  昼休み: 'ひるやすみ',
  教室: 'きょうしつ',
  前: 'まえ',
  会おう: 'あおう',
  一度: 'いちど',
  話してください: 'はなしてください',
  話して: 'はなして',
  話: 'はな',
  助かります: 'たすかります',
}

const kanaMap: Record<string, string> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', を: 'o', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o',
}

const digraphMap: Record<string, string> = {
  きゃ: 'kya', きゅ: 'kyu', きょ: 'kyo',
  しゃ: 'sha', しゅ: 'shu', しょ: 'sho',
  ちゃ: 'cha', ちゅ: 'chu', ちょ: 'cho',
  にゃ: 'nya', にゅ: 'nyu', にょ: 'nyo',
  ひゃ: 'hya', ひゅ: 'hyu', ひょ: 'hyo',
  みゃ: 'mya', みゅ: 'myu', みょ: 'myo',
  りゃ: 'rya', りゅ: 'ryu', りょ: 'ryo',
  ぎゃ: 'gya', ぎゅ: 'gyu', ぎょ: 'gyo',
  じゃ: 'ja', じゅ: 'ju', じょ: 'jo',
  びゃ: 'bya', びゅ: 'byu', びょ: 'byo',
  ぴゃ: 'pya', ぴゅ: 'pyu', ぴょ: 'pyo',
}

export function toDialogueRomaji(sentence: string, vocabulary: VocabItem[] = []): string {
  const reading = applyReadings(sentence, vocabulary)
  return kanaToRomaji(reading)
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function applyReadings(sentence: string, vocabulary: VocabItem[]): string {
  const readings = new Map<string, string>(Object.entries(commonReadings))
  vocabulary.forEach((item) => {
    const word = item.word.replace(/^～/, '')
    const reading = item.reading?.replace(/^～/, '')
    if (
      word.length > 1 &&
      reading &&
      reading !== '—' &&
      !(isKanaOnly(word) && word === reading)
    ) {
      readings.set(word, reading)
    }
  })

  let result = sentence
  const entries = [...readings.entries()].sort((a, b) => b[0].length - a[0].length)
  entries.forEach(([word, reading]) => {
    result = result.replaceAll(word, ` ${reading} `)
  })
  return result
}

function isKanaOnly(value: string): boolean {
  return /^[\u3040-\u30ffー]+$/.test(value)
}

function kanaToRomaji(value: string): string {
  const hiragana = toHiragana(value)
  let result = ''
  let doubleNext = false

  for (let i = 0; i < hiragana.length; i++) {
    const char = hiragana[i]

    if (char === 'っ') {
      doubleNext = true
      continue
    }

    if (char === 'ー') {
      result += getLastVowel(result)
      continue
    }

    const pair = hiragana.slice(i, i + 2)
    let roma = digraphMap[pair]
    if (roma) {
      i++
    } else {
      roma = kanaMap[char]
    }

    if (!roma) {
      result += punctuationToRomajiSpace(char)
      doubleNext = false
      continue
    }

    if (doubleNext) {
      roma = `${roma[0]}${roma}`
      doubleNext = false
    }
    result += roma
  }

  return result
}

function toHiragana(value: string): string {
  return value.replace(/[ァ-ン]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0x60),
  )
}

function getLastVowel(value: string): string {
  const match = value.match(/[aeiou](?!.*[aeiou])/)
  return match ? match[0] : ''
}

function punctuationToRomajiSpace(char: string): string {
  if (/[。．]/.test(char)) return '. '
  if (/[、，]/.test(char)) return ', '
  if (/[！？]/.test(char)) return '! '
  if (/\s/.test(char)) return ' '
  if (/[\u4e00-\u9faf]/.test(char)) return ''
  return char
}
