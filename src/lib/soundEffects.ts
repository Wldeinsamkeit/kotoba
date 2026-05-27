/**
 * 8-bit chiptune sound effects using Web Audio API.
 * No external audio files needed — all sounds are synthesized in real time.
 */

let audioCtx: AudioContext | null = null
let _muted = false

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function setSoundMuted(muted: boolean) {
  _muted = muted
}

export function isSoundMuted(): boolean {
  return _muted
}

/** Play a tone with the given frequency, duration, and waveform */
function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.15,
  startDelay = 0,
) {
  if (_muted) return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, ctx.currentTime + startDelay)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime + startDelay)
  osc.stop(ctx.currentTime + startDelay + duration)
}

/** Short noise burst (for wrong answer buzz) */
function playNoise(duration: number, volume = 0.08, startDelay = 0) {
  if (_muted) return
  const ctx = getCtx()
  const bufferSize = ctx.sampleRate * duration
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(volume, ctx.currentTime + startDelay)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration)
  source.connect(gain)
  gain.connect(ctx.destination)
  source.start(ctx.currentTime + startDelay)
}

// ── Public sound API ──

/** Soft button click — short high tap */
export function playClick() {
  playTone(800, 0.06, 'sine', 0.1)
}

/** Select an option — slightly fuller click */
export function playSelect() {
  playTone(600, 0.05, 'square', 0.08)
  playTone(900, 0.05, 'square', 0.06, 0.03)
}

/** Correct answer — happy ascending arpeggio */
export function playCorrect() {
  playTone(523, 0.12, 'square', 0.12)       // C5
  playTone(659, 0.12, 'square', 0.12, 0.1)  // E5
  playTone(784, 0.15, 'square', 0.14, 0.2)  // G5
  playTone(1047, 0.2, 'sine', 0.1, 0.3)     // C6
}

/** Wrong answer — descending buzz */
export function playWrong() {
  playTone(300, 0.15, 'sawtooth', 0.1)
  playTone(200, 0.2, 'sawtooth', 0.08, 0.1)
  playNoise(0.15, 0.05, 0.2)
}

/** XP gain — coin ding */
export function playXPGain() {
  playTone(988, 0.08, 'square', 0.1)        // B5
  playTone(1319, 0.15, 'sine', 0.08, 0.07) // E6
}

/** Level up — triumphant fanfare */
export function playLevelUp() {
  const notes = [523, 659, 784, 1047, 784, 1047, 1319] // C G C E G C E
  notes.forEach((freq, i) => {
    playTone(freq, 0.15, 'square', 0.1, i * 0.1)
  })
  playTone(1319, 0.4, 'sine', 0.08, 0.7) // hold last note
}

/** Quiz complete — victory jingle */
export function playQuizComplete() {
  playTone(523, 0.1, 'square', 0.1)         // C
  playTone(659, 0.1, 'square', 0.1, 0.08)  // E
  playTone(784, 0.1, 'square', 0.1, 0.16)  // G
  playTone(1047, 0.25, 'square', 0.12, 0.24) // C
  playTone(784, 0.1, 'square', 0.08, 0.45)  // G
  playTone(1047, 0.35, 'sine', 0.1, 0.52)   // C hold
}

/** Difficulty transition — ascending sweep */
export function playDifficultyUp() {
  if (_muted) return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(400, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3)
  gain.gain.setValueAtTime(0.1, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.4)
}

/** Combo increment — quick blip that gets higher with combo count */
export function playCombo(comboCount: number) {
  const baseFreq = 600 + Math.min(comboCount, 10) * 80
  playTone(baseFreq, 0.08, 'square', 0.1)
  playTone(baseFreq * 1.5, 0.06, 'square', 0.07, 0.05)
}

// ── New expanded sounds ──

/** Achievement unlock — magical sparkle arpeggio */
export function playAchievement() {
  playTone(784, 0.1, 'sine', 0.1)          // G4
  playTone(988, 0.1, 'sine', 0.1, 0.08)   // B4
  playTone(1175, 0.1, 'sine', 0.1, 0.16)  // D5
  playTone(1568, 0.25, 'sine', 0.12, 0.24) // G5
  playTone(1568, 0.08, 'triangle', 0.06, 0.45) // shimmer
  playTone(2093, 0.15, 'sine', 0.06, 0.5)  // C6 sparkle
}

/** Page navigation / route change — gentle whoosh */
export function playNavigate() {
  if (_muted) return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(300, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12)
  gain.gain.setValueAtTime(0.06, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.15)
}

/** Dialogue line reveal — typewriter tick */
export function playDialogueTick() {
  playTone(1200, 0.03, 'square', 0.04)
}

/** Dialogue complete — gentle chime */
export function playDialogueComplete() {
  playTone(659, 0.12, 'triangle', 0.08)     // E4
  playTone(784, 0.12, 'triangle', 0.08, 0.1) // G4
  playTone(988, 0.2, 'sine', 0.1, 0.2)     // B4
}

/** Kana card flip — quick snap */
export function playFlip() {
  playTone(1000, 0.04, 'square', 0.06)
  playTone(600, 0.04, 'square', 0.04, 0.03)
}

/** Kana practice correct — rising chirp */
export function playKanaCorrect() {
  playTone(800, 0.08, 'triangle', 0.1)
  playTone(1200, 0.12, 'triangle', 0.1, 0.06)
}

/** Vocabulary starred / added to vocab book — bookmark snap */
export function playStar() {
  playTone(1175, 0.06, 'sine', 0.1)        // D5
  playTone(1568, 0.1, 'sine', 0.08, 0.05)  // G5
}

/** Vocabulary unstarred — soft descending pop */
export function playUnstar() {
  playTone(1000, 0.06, 'sine', 0.06)
  playTone(700, 0.08, 'sine', 0.04, 0.04)
}

/** Streak / daily login — fire whoosh */
export function playStreak() {
  if (_muted) return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(200, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15)
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3)
  gain.gain.setValueAtTime(0.06, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.35)
  playTone(800, 0.15, 'triangle', 0.05, 0.2)
}

/** Affinity / relationship up — warm two-note bloom */
export function playAffinityUp() {
  playTone(523, 0.15, 'sine', 0.08)         // C4
  playTone(659, 0.2, 'triangle', 0.1, 0.12) // E4
  playTone(784, 0.25, 'sine', 0.06, 0.25)   // G4
}

/** Affinity down — soft sad descending */
export function playAffinityDown() {
  playTone(659, 0.12, 'sine', 0.06)         // E4
  playTone(523, 0.15, 'sine', 0.05, 0.1)   // C4
  playTone(392, 0.2, 'triangle', 0.04, 0.2) // G3
}

/** Error / invalid action — soft thud */
export function playError() {
  playTone(200, 0.12, 'square', 0.08)
  playTone(150, 0.15, 'square', 0.06, 0.08)
}

/** Shadowing / recording start — rising beep */
export function playRecordStart() {
  playTone(440, 0.08, 'sine', 0.08)
  playTone(660, 0.1, 'sine', 0.1, 0.06)
}

/** Shadowing / recording stop — descending beep */
export function playRecordStop() {
  playTone(660, 0.08, 'sine', 0.08)
  playTone(440, 0.1, 'sine', 0.06, 0.06)
}

/** Reading progress — page turn rustle */
export function playPageTurn() {
  playNoise(0.06, 0.04)
  playTone(900, 0.04, 'sine', 0.03, 0.04)
}

/** Daily task complete — checkbox tick */
export function playTaskComplete() {
  playTone(880, 0.06, 'triangle', 0.08)
  playTone(1320, 0.1, 'triangle', 0.1, 0.05)
}

/** All daily tasks done — celebration fanfare */
export function playAllTasksDone() {
  const notes = [523, 659, 784, 1047, 1319]
  notes.forEach((freq, i) => {
    playTone(freq, 0.12, 'triangle', 0.08, i * 0.08)
  })
  playTone(1319, 0.3, 'sine', 0.1, 0.4)
}

/** Button hover — very subtle soft tick */
export function playHover() {
  playTone(1400, 0.02, 'sine', 0.03)
}

/** Unlock / reveal — ascending mystery chime */
export function playUnlock() {
  playTone(440, 0.15, 'triangle', 0.06)
  playTone(554, 0.15, 'triangle', 0.07, 0.1)
  playTone(659, 0.15, 'triangle', 0.08, 0.2)
  playTone(880, 0.25, 'sine', 0.1, 0.3)
}

/** Quiz wrong streak — warning double buzz */
export function playWarning() {
  playTone(250, 0.1, 'sawtooth', 0.06)
  playTone(200, 0.1, 'sawtooth', 0.05, 0.12)
  playTone(250, 0.1, 'sawtooth', 0.06, 0.24)
}

/** Timer tick (for timed quizzes) — soft clock */
export function playTimerTick() {
  playTone(1000, 0.02, 'sine', 0.03)
}

/** Timer urgency (last few seconds) — fast beeps */
export function playTimerUrgent() {
  playTone(800, 0.05, 'square', 0.08)
  playTone(800, 0.05, 'square', 0.08, 0.1)
  playTone(800, 0.05, 'square', 0.08, 0.2)
}

/** SRS review due — gentle reminder chime */
export function playReviewDue() {
  playTone(784, 0.1, 'triangle', 0.06)
  playTone(988, 0.15, 'triangle', 0.05, 0.08)
}

// ── Expanded game sounds ──

/** Combo streak milestone (5x, 10x, etc.) — escalating power-up */
export function playComboMilestone(comboCount: number) {
  const base = 500 + Math.min(comboCount, 15) * 60
  playTone(base, 0.08, 'square', 0.1)
  playTone(base * 1.25, 0.08, 'square', 0.1, 0.06)
  playTone(base * 1.5, 0.08, 'square', 0.12, 0.12)
  playTone(base * 2, 0.2, 'sine', 0.1, 0.18)
}

/** Critical hit (perfect answer, fast response) — punchy impact */
export function playCriticalHit() {
  playTone(200, 0.06, 'sawtooth', 0.12)
  playTone(800, 0.08, 'square', 0.15, 0.03)
  playTone(1200, 0.12, 'sine', 0.1, 0.08)
  playTone(1600, 0.2, 'sine', 0.08, 0.15)
}

/** Near miss (close but wrong) — encouraging sympathetic tone */
export function playNearMiss() {
  playTone(440, 0.1, 'triangle', 0.07)
  playTone(415, 0.15, 'triangle', 0.06, 0.08)
  playTone(440, 0.1, 'sine', 0.05, 0.2)
}

/** Vocabulary mastery level up — knowledge crystal */
export function playVocabMastery() {
  playTone(659, 0.1, 'sine', 0.08)          // E4
  playTone(784, 0.1, 'sine', 0.08, 0.08)   // G4
  playTone(988, 0.1, 'sine', 0.08, 0.16)   // B4
  playTone(1319, 0.15, 'triangle', 0.1, 0.24) // E5
  playTone(1568, 0.25, 'sine', 0.08, 0.35)  // G5 sustain
}

/** Flashcard swipe left (know it) — confident swoosh */
export function playSwipeKnow() {
  if (_muted) return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)
  gain.gain.setValueAtTime(0.08, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.12)
}

/** Flashcard swipe right (don't know) — gentle reminder */
export function playSwipeDunno() {
  playTone(400, 0.1, 'triangle', 0.06)
  playTone(350, 0.12, 'triangle', 0.05, 0.08)
}

/** Character greeting / affinity interaction — warm bell */
export function playCharacterGreeting() {
  playTone(784, 0.12, 'sine', 0.07)         // G4
  playTone(988, 0.15, 'triangle', 0.08, 0.1) // B4
  playTone(1175, 0.2, 'sine', 0.06, 0.2)   // D5
}

/** New content unlocked — discovery shimmer */
export function playDiscovery() {
  playTone(523, 0.08, 'sine', 0.06)
  playTone(659, 0.08, 'sine', 0.06, 0.06)
  playTone(784, 0.08, 'sine', 0.06, 0.12)
  playTone(1047, 0.08, 'sine', 0.07, 0.18)
  playTone(1319, 0.08, 'sine', 0.07, 0.24)
  playTone(1568, 0.25, 'triangle', 0.08, 0.3)
  playNoise(0.08, 0.02, 0.3) // sparkle noise
}

/** Chapter / section complete — grander achievement */
export function playChapterComplete() {
  const melody = [523, 659, 784, 659, 784, 1047, 1319, 1568]
  melody.forEach((freq, i) => {
    playTone(freq, 0.12, i < 4 ? 'square' : 'sine', 0.08 + i * 0.01, i * 0.1)
  })
  playTone(1568, 0.5, 'sine', 0.1, 0.8)
}

/** Boss question incoming — dramatic buildup */
export function playBossIncoming() {
  if (_muted) return
  const ctx = getCtx()
  // Low rumble
  const osc1 = ctx.createOscillator()
  const gain1 = ctx.createGain()
  osc1.type = 'sawtooth'
  osc1.frequency.setValueAtTime(80, ctx.currentTime)
  osc1.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.4)
  gain1.gain.setValueAtTime(0.06, ctx.currentTime)
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
  osc1.connect(gain1)
  gain1.connect(ctx.destination)
  osc1.start(ctx.currentTime)
  osc1.stop(ctx.currentTime + 0.5)
  // Rising tension
  playTone(200, 0.15, 'square', 0.08, 0.2)
  playTone(300, 0.15, 'square', 0.08, 0.35)
  playTone(400, 0.2, 'square', 0.1, 0.5)
}

/** Boss defeated — epic victory */
export function playBossDefeated() {
  const fanfare = [523, 659, 784, 1047, 784, 1047, 1319, 1568, 2093]
  fanfare.forEach((freq, i) => {
    playTone(freq, 0.15, i < 5 ? 'square' : 'sine', 0.1, i * 0.1)
  })
  playTone(2093, 0.6, 'sine', 0.12, 0.9)
}

/** Toggle switch (dark mode, settings) — crisp snap */
export function playToggle() {
  playTone(1200, 0.03, 'square', 0.08)
  playTone(800, 0.04, 'square', 0.06, 0.02)
}

/** Slider / progress bar fill — continuous soft tick */
export function playProgressFill() {
  playTone(1100, 0.02, 'sine', 0.04)
}

/** Badge / sticker collected — pop + sparkle */
export function playBadgeCollect() {
  playTone(880, 0.06, 'square', 0.1)
  playTone(1175, 0.06, 'square', 0.08, 0.04)
  playTone(1568, 0.12, 'sine', 0.1, 0.08)
  playNoise(0.04, 0.02, 0.15) // sparkle
}

/** Daily login reward — slot machine style */
export function playDailyReward() {
  const spins = [800, 900, 1000, 1100, 1000, 900, 800, 1000, 1200]
  spins.forEach((freq, i) => {
    playTone(freq, 0.04, 'square', 0.06, i * 0.04)
  })
  playTone(1568, 0.2, 'sine', 0.1, 0.4) // jackpot ding
}

/** Perfect score celebration — rainbow arpeggio */
export function playPerfectScore() {
  const scale = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319, 1568, 2093]
  scale.forEach((freq, i) => {
    playTone(freq, 0.1, i < 6 ? 'square' : 'sine', 0.06 + i * 0.005, i * 0.06)
  })
  playTone(2093, 0.4, 'sine', 0.12, 0.72)
}

/** Encourage after wrong streak — gentle motivational nudge */
export function playEncourage() {
  playTone(392, 0.15, 'triangle', 0.06)     // G3
  playTone(440, 0.15, 'triangle', 0.06, 0.12) // A3
  playTone(523, 0.25, 'sine', 0.08, 0.24)   // C4
}

/** Skip / fast forward — quick whoosh down */
export function playSkip() {
  if (_muted) return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(800, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1)
  gain.gain.setValueAtTime(0.06, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.12)
}

/** Dialogue choice selected — decisive click + chime */
export function playChoiceMade() {
  playTone(600, 0.05, 'square', 0.1)
  playTone(900, 0.08, 'sine', 0.08, 0.04)
  playTone(1200, 0.12, 'sine', 0.06, 0.1)
}

/** Heart / affinity gained — soft heartbeat double tap */
export function playHeartbeat() {
  playTone(120, 0.08, 'sine', 0.12)
  playTone(120, 0.08, 'sine', 0.1, 0.12)
  playTone(180, 0.15, 'sine', 0.06, 0.25)
}

/** Streak broken — glass crack */
export function playStreakBroken() {
  playNoise(0.12, 0.1)
  playTone(300, 0.15, 'sawtooth', 0.08, 0.05)
  playTone(150, 0.2, 'sawtooth', 0.06, 0.15)
}

/** New lesson available — notification ding-dong */
export function playNewLesson() {
  playTone(880, 0.15, 'sine', 0.08)
  playTone(660, 0.2, 'sine', 0.08, 0.15)
}

/** Vocabulary word memorized — knowledge absorbed swoosh */
export function playWordMemorized() {
  playTone(440, 0.06, 'triangle', 0.06)
  playTone(660, 0.06, 'triangle', 0.06, 0.04)
  playTone(880, 0.06, 'triangle', 0.06, 0.08)
  playTone(1320, 0.15, 'sine', 0.08, 0.12)
}

/** Scroll / pagination — soft bump */
export function playScroll() {
  playTone(600, 0.03, 'sine', 0.04)
}

/** Shake / reset — spring boing */
export function playReset() {
  if (_muted) return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(800, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15)
  osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.25)
  gain.gain.setValueAtTime(0.08, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.3)
}

/** Typing / input focus — subtle glass tap */
export function playInputFocus() {
  playTone(1400, 0.02, 'sine', 0.04)
  playTone(1600, 0.02, 'sine', 0.03, 0.02)
}

/** Speed bonus — rapid ascending blips */
export function playSpeedBonus() {
  for (let i = 0; i < 5; i++) {
    playTone(600 + i * 200, 0.04, 'square', 0.06, i * 0.03)
  }
  playTone(2000, 0.15, 'sine', 0.08, 0.15)
}

// ── Extended game sounds ──

/** Shield / protection activated (streak freeze, wrong-answer protection) */
export function playShield() {
  playTone(440, 0.08, 'sine', 0.08)
  playTone(660, 0.08, 'sine', 0.08, 0.06)
  playTone(880, 0.12, 'triangle', 0.1, 0.12)
  playTone(880, 0.06, 'sine', 0.06, 0.22)
}

/** Time bonus / extra time gained — clock wind-up */
export function playTimeBonus() {
  for (let i = 0; i < 4; i++) {
    playTone(800 + i * 100, 0.05, 'triangle', 0.06, i * 0.05)
  }
  playTone(1200, 0.12, 'sine', 0.08, 0.2)
}

/** Penalty / time lost — descending alarm */
export function playPenalty() {
  playTone(600, 0.1, 'sawtooth', 0.08)
  playTone(400, 0.15, 'sawtooth', 0.06, 0.08)
  playTone(300, 0.2, 'sawtooth', 0.05, 0.18)
}

/** Double XP activated — power surge */
export function playDoubleXP() {
  playTone(523, 0.06, 'square', 0.1)
  playTone(784, 0.06, 'square', 0.1, 0.04)
  playTone(1047, 0.06, 'square', 0.1, 0.08)
  playTone(1568, 0.15, 'sine', 0.12, 0.12)
  playTone(2093, 0.2, 'sine', 0.08, 0.22)
}

/** Rare item / rare vocab discovered — ethereal shimmer */
export function playRare() {
  playTone(1047, 0.1, 'sine', 0.06)
  playTone(1175, 0.1, 'sine', 0.06, 0.08)
  playTone(1319, 0.1, 'sine', 0.07, 0.16)
  playTone(1568, 0.1, 'sine', 0.07, 0.24)
  playTone(2093, 0.3, 'triangle', 0.1, 0.32)
  playNoise(0.06, 0.03, 0.35)
}

/** Combo broken — sad descending whistle */
export function playComboBreak() {
  playTone(800, 0.1, 'sine', 0.08)
  playTone(600, 0.12, 'sine', 0.06, 0.06)
  playTone(400, 0.15, 'triangle', 0.05, 0.12)
  playTone(300, 0.2, 'triangle', 0.04, 0.2)
}

/** Boss encounter incoming — dramatic drumroll */
export function playDrumRoll() {
  for (let i = 0; i < 12; i++) {
    const freq = 100 + i * 5
    const vol = 0.04 + i * 0.008
    playTone(freq, 0.04, 'sine', vol, i * 0.04)
  }
  playTone(200, 0.2, 'sawtooth', 0.12, 0.5)
  playNoise(0.08, 0.06, 0.5)
}

/** Block / defend (wrong answer shield absorbs) — metallic clang */
export function playBlock() {
  playTone(300, 0.06, 'square', 0.12)
  playTone(500, 0.08, 'square', 0.1, 0.03)
  playTone(200, 0.15, 'sawtooth', 0.06, 0.08)
  playNoise(0.06, 0.04, 0.1)
}

/** Notification / reminder pop — two-tone doorbell */
export function playNotification() {
  playTone(880, 0.12, 'sine', 0.08)
  playTone(1175, 0.18, 'sine', 0.08, 0.12)
}

/** Confetti burst (visual celebration paired sound) — paper explosion */
export function playConfetti() {
  for (let i = 0; i < 8; i++) {
    const freq = 800 + Math.random() * 1200
    playTone(freq, 0.04, 'sine', 0.04, i * 0.03)
  }
  playNoise(0.1, 0.03, 0.05)
}

/** Mystery box / random reward — suspense build + reveal */
export function playMysteryBox() {
  if (_muted) return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(200, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5)
  gain.gain.setValueAtTime(0.06, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.55)
  // Reveal chime
  playTone(1047, 0.1, 'sine', 0.1, 0.5)
  playTone(1319, 0.1, 'sine', 0.1, 0.58)
  playTone(1568, 0.2, 'sine', 0.12, 0.66)
}

/** Health / life lost — heartbeat slowdown */
export function playLifeLost() {
  playTone(100, 0.1, 'sine', 0.1)
  playTone(90, 0.12, 'sine', 0.08, 0.15)
  playTone(70, 0.2, 'sine', 0.06, 0.3)
}

/** Health / life gained — heartbeat speedup */
export function playLifeGained() {
  playTone(100, 0.08, 'sine', 0.08)
  playTone(120, 0.06, 'sine', 0.08, 0.08)
  playTone(150, 0.06, 'sine', 0.1, 0.14)
  playTone(200, 0.12, 'triangle', 0.08, 0.2)
}

/** Streak milestone (7-day, 30-day, etc.) — fireworks sequence */
export function playStreakMilestone(days: number) {
  const base = 500 + Math.min(days, 30) * 20
  // Firework pops
  for (let i = 0; i < 3; i++) {
    playNoise(0.04, 0.06, i * 0.15)
    playTone(base + i * 200, 0.08, 'sine', 0.08, i * 0.15)
  }
  // Fanfare
  playTone(784, 0.1, 'square', 0.1, 0.5)
  playTone(1047, 0.1, 'square', 0.1, 0.58)
  playTone(1319, 0.2, 'sine', 0.12, 0.66)
}

/** Item equip / change setting — mechanical click */
export function playEquip() {
  playTone(1000, 0.02, 'square', 0.08)
  playTone(800, 0.02, 'square', 0.06, 0.02)
  playTone(1200, 0.04, 'sine', 0.04, 0.04)
}

/** Drag / move — rubber band stretch */
export function playDrag() {
  if (_muted) return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(300, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.08)
  osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.15)
  gain.gain.setValueAtTime(0.04, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.18)
}

/** Drop / release — satisfying snap */
export function playDrop() {
  playTone(600, 0.04, 'square', 0.08)
  playTone(400, 0.06, 'sine', 0.06, 0.03)
}

/** Power-up collected — ascending electric zap */
export function playPowerUp() {
  if (_muted) return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(200, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.2)
  gain.gain.setValueAtTime(0.06, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.25)
  playTone(1600, 0.15, 'sine', 0.08, 0.2)
}

/** Knowledge point mastered — wisdom bell */
export function playWisdomBell() {
  playTone(659, 0.15, 'sine', 0.06)          // E4
  playTone(784, 0.15, 'sine', 0.06, 0.12)   // G4
  playTone(988, 0.15, 'sine', 0.07, 0.24)   // B4
  playTone(1319, 0.3, 'triangle', 0.1, 0.36) // E5 bell ring
  playTone(1319, 0.08, 'sine', 0.04, 0.55)   // E5 echo
}

/** Enemy defeated / quiz streak ended — satisfying thud */
export function playDefeat() {
  playTone(300, 0.08, 'sawtooth', 0.1)
  playTone(200, 0.1, 'sawtooth', 0.08, 0.06)
  playNoise(0.08, 0.05, 0.1)
  playTone(150, 0.2, 'sine', 0.06, 0.15)
}

/** Chat message sent — soft pop */
export function playMessageSent() {
  playTone(900, 0.04, 'sine', 0.06)
  playTone(1200, 0.06, 'sine', 0.05, 0.03)
}

/** Chat message received — incoming ding */
export function playMessageReceived() {
  playTone(660, 0.06, 'triangle', 0.06)
  playTone(880, 0.1, 'triangle', 0.07, 0.05)
}

/** Loading / processing — rhythmic pulse */
export function playLoading() {
  for (let i = 0; i < 3; i++) {
    playTone(400, 0.06, 'sine', 0.04, i * 0.15)
  }
}

/** Error shake — rapid alternating tones */
export function playErrorShake() {
  for (let i = 0; i < 4; i++) {
    playTone(i % 2 === 0 ? 300 : 250, 0.04, 'square', 0.08, i * 0.05)
  }
}

/** Pull-to-refresh — spring stretch */
export function playPullRefresh() {
  if (_muted) return
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(400, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15)
  gain.gain.setValueAtTime(0.04, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.2)
  playTone(800, 0.08, 'triangle', 0.06, 0.15)
}

/** Tab switch — quick chirp */
export function playTabSwitch() {
  playTone(1000, 0.03, 'sine', 0.05)
  playTone(1200, 0.03, 'sine', 0.04, 0.02)
}

/** Search found results — ascending confirmation */
export function playSearchFound() {
  playTone(600, 0.06, 'sine', 0.05)
  playTone(800, 0.06, 'sine', 0.05, 0.04)
  playTone(1000, 0.1, 'sine', 0.06, 0.08)
}

/** Search no results — descending disappointment */
export function playSearchEmpty() {
  playTone(600, 0.08, 'triangle', 0.05)
  playTone(400, 0.12, 'triangle', 0.04, 0.06)
}

/** Modal open — expanding circle */
export function playModalOpen() {
  playTone(500, 0.06, 'sine', 0.06)
  playTone(700, 0.08, 'sine', 0.05, 0.04)
  playTone(900, 0.1, 'sine', 0.04, 0.1)
}

/** Modal close — contracting circle */
export function playModalClose() {
  playTone(900, 0.06, 'sine', 0.06)
  playTone(700, 0.08, 'sine', 0.05, 0.04)
  playTone(500, 0.1, 'sine', 0.04, 0.1)
}
