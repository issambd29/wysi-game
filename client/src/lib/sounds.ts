let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function getMaster(): GainNode {
  getCtx();
  return masterGain!;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15, detune = 0) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(getMaster());
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, volume = 0.05, highpass = 3000) {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = highpass;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(getMaster());
  source.start();
}

export const GameSounds = {
  shoot() {
    playTone(880, 0.08, "square", 0.06);
    playTone(1200, 0.05, "sine", 0.04, 10);
  },

  collectGarbage() {
    playTone(523, 0.1, "sine", 0.12);
    setTimeout(() => playTone(659, 0.1, "sine", 0.1), 50);
    setTimeout(() => playTone(784, 0.08, "sine", 0.08), 100);
  },

  destroyGarbage() {
    playTone(440, 0.12, "triangle", 0.1);
    playNoise(0.08, 0.04, 4000);
  },

  playerDamage() {
    playTone(180, 0.2, "sawtooth", 0.1);
    playTone(120, 0.3, "sawtooth", 0.08);
    playNoise(0.15, 0.06, 2000);
  },

  powerUp() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, "sine", 0.1), i * 60);
    });
  },

  seedBurst() {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        playTone(600 + i * 100, 0.2, "sine", 0.08);
        playTone(300 + i * 50, 0.15, "triangle", 0.05);
      }, i * 40);
    }
  },

  levelUp() {
    const melody = [523, 659, 784, 1047, 1319];
    melody.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.25, "sine", 0.12), i * 80);
    });
    setTimeout(() => playTone(1047, 0.4, "triangle", 0.08), 400);
  },

  combo5() {
    playTone(660, 0.12, "sine", 0.1);
    setTimeout(() => playTone(880, 0.15, "sine", 0.1), 60);
  },

  combo10() {
    const notes = [660, 880, 1100];
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.15, "sine", 0.1), i * 50));
  },

  combo20() {
    const notes = [660, 880, 1100, 1320];
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.18, "sine", 0.12), i * 50));
    setTimeout(() => playNoise(0.1, 0.03, 5000), 200);
  },

  combo30() {
    const notes = [660, 880, 1100, 1320, 1540];
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.2, "sine", 0.14), i * 45));
    setTimeout(() => {
      playTone(1320, 0.4, "triangle", 0.1);
      playNoise(0.15, 0.04, 5000);
    }, 250);
  },

  nearMiss() {
    playTone(600, 0.08, "sine", 0.06);
    playTone(750, 0.06, "sine", 0.04);
  },

  gameOver() {
    const notes = [440, 370, 311, 261];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.4, "sine", 0.12), i * 200);
    });
    setTimeout(() => playTone(196, 0.8, "sawtooth", 0.06), 800);
  },

  victory() {
    const melody = [523, 659, 784, 1047, 784, 1047, 1319];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, 0.3, "sine", 0.12);
        playTone(freq * 0.5, 0.3, "triangle", 0.06);
      }, i * 120);
    });
    setTimeout(() => {
      playTone(1319, 0.6, "sine", 0.1);
      playTone(1047, 0.6, "triangle", 0.08);
    }, 840);
  },

  buttonClick() {
    playTone(800, 0.06, "sine", 0.06);
  },

  quizCorrect() {
    playTone(523, 0.12, "sine", 0.1);
    setTimeout(() => playTone(659, 0.12, "sine", 0.1), 80);
    setTimeout(() => playTone(784, 0.15, "sine", 0.1), 160);
  },

  quizWrong() {
    playTone(300, 0.2, "sawtooth", 0.08);
    setTimeout(() => playTone(250, 0.3, "sawtooth", 0.06), 120);
  },

  quizPass() {
    const melody = [523, 659, 784, 1047, 1319, 1568];
    melody.forEach((f, i) => {
      setTimeout(() => playTone(f, 0.25, "sine", 0.1), i * 100);
    });
  },

  quizFail() {
    const notes = [400, 350, 300, 250, 200];
    notes.forEach((f, i) => {
      setTimeout(() => playTone(f, 0.3, "sawtooth", 0.08), i * 150);
    });
  },
};

let ambientOsc1: OscillatorNode | null = null;
let ambientOsc2: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

export function startAmbient() {
  const ctx = getCtx();
  if (ambientGain) return;

  ambientGain = ctx.createGain();
  ambientGain.gain.value = 0.02;
  ambientGain.connect(getMaster());

  ambientOsc1 = ctx.createOscillator();
  ambientOsc1.type = "sine";
  ambientOsc1.frequency.value = 110;
  ambientOsc1.connect(ambientGain);
  ambientOsc1.start();

  ambientOsc2 = ctx.createOscillator();
  ambientOsc2.type = "sine";
  ambientOsc2.frequency.value = 165;
  const g2 = ctx.createGain();
  g2.gain.value = 0.5;
  ambientOsc2.connect(g2);
  g2.connect(ambientGain);
  ambientOsc2.start();

  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.1;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 5;
  lfo.connect(lfoGain);
  lfoGain.connect(ambientOsc1.frequency);
  lfo.start();
}

export function stopAmbient() {
  if (ambientOsc1) { try { ambientOsc1.stop(); } catch {} ambientOsc1 = null; }
  if (ambientOsc2) { try { ambientOsc2.stop(); } catch {} ambientOsc2 = null; }
  ambientGain = null;
}

export function speakVillain(text: string, onEnd?: () => void): SpeechSynthesisUtterance | null {
  if (!window.speechSynthesis) return null;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.85;
  utterance.pitch = 0.6;
  utterance.volume = 0.8;

  const voices = window.speechSynthesis.getVoices();
  const maleVoice = voices.find(v =>
    v.lang.startsWith("en") && (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("daniel") || v.name.toLowerCase().includes("james") || v.name.toLowerCase().includes("david"))
  ) || voices.find(v => v.lang.startsWith("en"));

  if (maleVoice) {
    utterance.voice = maleVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopVillainSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
