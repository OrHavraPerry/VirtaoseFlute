export class DrumMachine {
    private noiseBuffer: AudioBuffer | null = null;

    constructor(private ctx: AudioContext, private output: AudioNode) {
        // Pre-create noise buffer for better performance
        this.noiseBuffer = this.createNoiseBuffer();
    }

    playKick(time: number, velocity: number = 1.0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        // Click transient for punch
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.frequency.setValueAtTime(1500, time);
        clickOsc.frequency.exponentialRampToValueAtTime(500, time + 0.02);
        clickGain.gain.setValueAtTime(0.3 * velocity, time);
        clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
        clickOsc.connect(clickGain);
        clickGain.connect(this.output);
        clickOsc.start(time);
        clickOsc.stop(time + 0.03);
        
        // Main body - tighter and punchier
        osc.frequency.setValueAtTime(180, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.08);
        osc.frequency.exponentialRampToValueAtTime(20, time + 0.25);
        
        gain.gain.setValueAtTime(0.9 * velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        
        osc.connect(gain);
        gain.connect(this.output);
        
        osc.start(time);
        osc.stop(time + 0.35);
    }

    playSnare(time: number, velocity: number = 1.0) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        
        // Noise through bandpass for body
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 3000;
        noiseFilter.Q.value = 0.8;
        
        const noiseEnvelope = this.ctx.createGain();
        noiseEnvelope.gain.setValueAtTime(0.6 * velocity, time);
        noiseEnvelope.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseEnvelope);
        noiseEnvelope.connect(this.output);
        
        // Snap oscillator with pitch bend
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, time);
        osc.frequency.exponentialRampToValueAtTime(80, time + 0.05);
        
        const oscEnv = this.ctx.createGain();
        oscEnv.gain.setValueAtTime(0.4 * velocity, time);
        oscEnv.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        
        osc.connect(oscEnv);
        oscEnv.connect(this.output);

        noise.start(time);
        osc.start(time);
        noise.stop(time + 0.2);
        osc.stop(time + 0.1);
    }

    playHiHat(time: number, open: boolean = false, velocity: number = 1.0) {
        const ratio = [2, 3, 4.16, 5.43, 6.79, 8.21];
        const fundamental = 40;
        const gain = this.ctx.createGain();

        // Bandpass for metallic character
        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.value = 10000;
        bandpass.Q.value = 1.2;

        // Highpass to remove low rumble
        const highpass = this.ctx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 7000;

        const duration = open ? 0.22 : 0.04;
        // Slight velocity variation for humanization
        const humanize = 0.9 + Math.random() * 0.2;

        ratio.forEach(r => {
            const osc = this.ctx.createOscillator();
            osc.type = "square";
            osc.frequency.value = fundamental * r;
            osc.connect(bandpass);
            osc.start(time);
            osc.stop(time + duration + 0.01);
        });

        bandpass.connect(highpass);
        highpass.connect(gain);
        gain.connect(this.output);

        gain.gain.setValueAtTime(0.25 * velocity * humanize, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    }

    // Clave - essential for Latin rhythms (Son Clave, Rumba Clave)
    playClave(time: number, velocity: number = 1.0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // High-pitched wooden stick sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2500, time);
        osc.frequency.exponentialRampToValueAtTime(1800, time + 0.01);

        filter.type = 'bandpass';
        filter.frequency.value = 2200;
        filter.Q.value = 8;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.output);

        gain.gain.setValueAtTime(0.4 * velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

        osc.start(time);
        osc.stop(time + 0.08);
    }

    // Cowbell - disco, funk, Latin
    playCowbell(time: number, velocity: number = 1.0) {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Two detuned oscillators for metallic character
        osc1.type = 'square';
        osc1.frequency.value = 560;
        osc2.type = 'square';
        osc2.frequency.value = 845;

        filter.type = 'bandpass';
        filter.frequency.value = 700;
        filter.Q.value = 3;

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.output);

        gain.gain.setValueAtTime(0.3 * velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.18);
        osc2.stop(time + 0.18);
    }

    // Shaker - Bossa Nova, Samba, Afrobeat
    playShaker(time: number, velocity: number = 1.0) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;

        const gain = this.ctx.createGain();
        const humanize = 0.85 + Math.random() * 0.3;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.output);

        gain.gain.setValueAtTime(0.15 * velocity * humanize, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        noise.start(time);
        noise.stop(time + 0.06);
    }

    // Conga (high/low) - Latin, Afrobeat
    playConga(time: number, high: boolean = true, velocity: number = 1.0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        const baseFreq = high ? 350 : 200;
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * 1.5, time);
        osc.frequency.exponentialRampToValueAtTime(baseFreq, time + 0.02);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, time + 0.1);

        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 1;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.output);

        gain.gain.setValueAtTime(0.35 * velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

        osc.start(time);
        osc.stop(time + 0.25);
    }

    // Rimshot / Sidestick - Reggae, Ballads
    playRimshot(time: number, velocity: number = 1.0) {
        const osc = this.ctx.createOscillator();
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;

        const oscGain = this.ctx.createGain();
        const noiseGain = this.ctx.createGain();
        const noiseFilter = this.ctx.createBiquadFilter();

        // High-pitched click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, time);
        osc.frequency.exponentialRampToValueAtTime(400, time + 0.01);

        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 4000;
        noiseFilter.Q.value = 2;

        osc.connect(oscGain);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        oscGain.connect(this.output);
        noiseGain.connect(this.output);

        oscGain.gain.setValueAtTime(0.3 * velocity, time);
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

        noiseGain.gain.setValueAtTime(0.2 * velocity, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        osc.start(time);
        noise.start(time);
        osc.stop(time + 0.05);
        noise.stop(time + 0.06);
    }

    // Clap - Disco, Techno, Hip Hop
    playClap(time: number, velocity: number = 1.0) {
        // Multiple noise bursts for realistic clap
        const delays = [0, 0.01, 0.02];
        
        delays.forEach((delay, i) => {
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.noiseBuffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 2500;
            filter.Q.value = 1.5;

            const gain = this.ctx.createGain();
            const vol = (i === delays.length - 1) ? 0.5 : 0.25;

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.output);

            gain.gain.setValueAtTime(vol * velocity, time + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, time + delay + 0.08);

            noise.start(time + delay);
            noise.stop(time + delay + 0.1);
        });
    }

    // Ghost note (very quiet snare hit for groove)
    playGhostNote(time: number, velocity: number = 0.3) {
        this.playSnare(time, velocity * 0.4);
    }

    private createNoiseBuffer(): AudioBuffer {
        const bufferSize = this.ctx.sampleRate; // 1 second is enough
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }
}

export class PolySynth {
    constructor(private ctx: AudioContext, private output: AudioNode) {}

    playChord(frequencies: number[], time: number, duration: number, velocity: number = 1.0) {
        // Shared filter for warmth
        const masterFilter = this.ctx.createBiquadFilter();
        masterFilter.type = 'lowpass';
        masterFilter.frequency.value = 6000;
        masterFilter.Q.value = 0.5;
        masterFilter.connect(this.output);

        frequencies.forEach((freq, i) => {
            // Main oscillator
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            // Slight detune for richness (spread voices)
            const detuneAmount = (i - frequencies.length / 2) * 4;
            osc.detune.value = detuneAmount;
            
            // Second oscillator for thickness (subtle)
            const osc2 = this.ctx.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.value = freq;
            osc2.detune.value = -detuneAmount + 2;
            
            const gain2 = this.ctx.createGain();
            gain2.gain.value = 0.3; // Blend level
            
            osc.connect(gain);
            osc2.connect(gain2);
            gain2.connect(gain);
            gain.connect(masterFilter);
            
            // Smooth ADSR envelope
            const attackTime = 0.02;
            const sustainLevel = 0.12 * velocity;
            
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(sustainLevel, time + attackTime);
            gain.gain.setValueAtTime(sustainLevel, time + duration - 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration + 0.15);
            
            osc.start(time);
            osc2.start(time);
            osc.stop(time + duration + 0.3);
            osc2.stop(time + duration + 0.3);
        });
    }
}

export class MonoSynth {
    constructor(private ctx: AudioContext, private output: AudioNode) {}

    playBass(freq: number, time: number, duration: number, velocity: number = 1.0) {
        // Main oscillator
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        // Sub oscillator for depth (one octave below)
        const subOsc = this.ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.value = freq / 2;
        
        const subGain = this.ctx.createGain();
        subGain.gain.value = 0.4; // Sub blend

        // Filter with resonance
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, time);
        filter.frequency.exponentialRampToValueAtTime(150, time + 0.15);
        filter.Q.value = 2;

        osc.connect(filter);
        subOsc.connect(subGain);
        subGain.connect(filter);
        filter.connect(gain);
        gain.connect(this.output);

        // Punchy envelope
        const peakGain = 0.35 * velocity;
        gain.gain.setValueAtTime(peakGain, time);
        gain.gain.linearRampToValueAtTime(peakGain * 0.7, time + 0.08);
        gain.gain.setValueAtTime(peakGain * 0.7, time + duration - 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration + 0.08);

        osc.start(time);
        subOsc.start(time);
        osc.stop(time + duration + 0.15);
        subOsc.stop(time + duration + 0.15);
    }
}
