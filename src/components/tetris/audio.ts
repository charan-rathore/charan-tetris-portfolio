/**
 * Synthesized game SFX via Web Audio · no audio files to load.
 * Every sound is a short envelope on oscillators/noise, slightly detuned
 * per trigger so rapid repeats never sound machine-gun identical.
 */

let context: AudioContext | null = null;
let master: GainNode | null = null;

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    try {
      context = new Ctor();
    } catch {
      return null;
    }
    master = context.createGain();
    master.gain.value = 0.32;
    master.connect(context.destination);
  }
  if (context.state === "suspended") void context.resume().catch(() => {});
  return context;
}

function detune(base: number, cents = 30): number {
  return base * Math.pow(2, ((Math.random() - 0.5) * cents) / 1200);
}

function tone(
  frequency: number,
  duration: number,
  options: {
    type?: OscillatorType;
    volume?: number;
    delay?: number;
    slide?: number;
  } = {},
) {
  const ctx = ensureContext();
  if (!ctx || !master) return;
  const { type = "square", volume = 0.5, delay = 0, slide = 0 } = options;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (slide !== 0) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(frequency + slide, 20),
      start + duration,
    );
  }
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Filtered noise burst for percussive impacts. */
function thud(duration: number, volume: number, cutoff: number) {
  const ctx = ensureContext();
  if (!ctx || !master) return;
  const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = cutoff;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  source.connect(filter).connect(gain).connect(master);
  source.start();
}

export const sfx = {
  /** Call from a user gesture to unlock audio on iOS/Safari. */
  unlock() {
    ensureContext();
  },

  start() {
    tone(330, 0.09, { type: "square", volume: 0.4 });
    tone(440, 0.09, { type: "square", volume: 0.4, delay: 0.09 });
    tone(660, 0.16, { type: "square", volume: 0.45, delay: 0.18 });
  },

  move() {
    tone(detune(520), 0.03, { type: "square", volume: 0.16 });
  },

  rotate(kicked: boolean) {
    tone(detune(kicked ? 700 : 620), 0.05, { type: "triangle", volume: 0.3 });
    if (kicked) tone(detune(880), 0.04, { type: "triangle", volume: 0.2, delay: 0.03 });
  },

  hold() {
    tone(detune(400), 0.05, { type: "sine", volume: 0.3 });
    tone(detune(560), 0.06, { type: "sine", volume: 0.25, delay: 0.04 });
  },

  softStep() {
    tone(detune(240, 60), 0.025, { type: "square", volume: 0.1 });
  },

  hardDrop() {
    thud(0.14, 0.7, 900);
    tone(detune(140), 0.1, { type: "square", volume: 0.35, slide: -80 });
  },

  lock() {
    thud(0.08, 0.4, 1400);
    tone(detune(200), 0.05, { type: "square", volume: 0.2 });
  },

  clear(lines: number, backToBack: boolean) {
    const base = lines >= 4 ? 523.25 : 392;
    const steps = lines >= 4 ? [0, 4, 7, 12, 16] : [0, 4, 7].slice(0, lines + 1);
    steps.forEach((semitones, index) => {
      tone(base * Math.pow(2, semitones / 12), 0.12, {
        type: "square",
        volume: 0.35,
        delay: index * 0.055,
      });
    });
    if (lines >= 4) thud(0.25, 0.8, 700);
    if (backToBack) {
      tone(base * 2, 0.2, { type: "sawtooth", volume: 0.2, delay: 0.3 });
    }
  },

  levelUp() {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      tone(frequency, 0.11, { type: "triangle", volume: 0.35, delay: index * 0.07 });
    });
  },

  /** Intel decrypted: a low "data" tick ramping into a bright resolve. */
  intel() {
    [220, 277.18, 329.63].forEach((frequency, index) => {
      tone(frequency, 0.06, { type: "square", volume: 0.22, delay: index * 0.05 });
    });
    tone(880, 0.22, { type: "triangle", volume: 0.35, delay: 0.18 });
    tone(1108.73, 0.28, { type: "sine", volume: 0.25, delay: 0.26 });
  },

  /** Soft UI click for portfolio links / chips (keeps the Tetris timbre). */
  ui() {
    tone(detune(660), 0.035, { type: "square", volume: 0.14 });
    tone(detune(880), 0.04, { type: "triangle", volume: 0.1, delay: 0.02 });
  },

  gameOver() {
    [392, 329.63, 261.63, 196].forEach((frequency, index) => {
      tone(frequency, 0.22, { type: "sawtooth", volume: 0.3, delay: index * 0.16 });
    });
    thud(0.4, 0.5, 500);
  },
};
