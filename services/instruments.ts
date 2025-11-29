export class DrumMachine {
    constructor(private ctx: AudioContext, private output: AudioNode) {}

    playKick(time: number) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        
        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        
        osc.connect(gain);
        gain.connect(this.output);
        
        osc.start(time);
        osc.stop(time + 0.5);
    }

    playSnare(time: number) {
        const noiseBuffer = this.createNoiseBuffer();
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;
        
        const noiseEnvelope = this.ctx.createGain();
        noiseEnvelope.gain.setValueAtTime(0.7, time);
        noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseEnvelope);
        noiseEnvelope.connect(this.output);
        
        // Snap (Oscillator)
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, time);
        const oscEnv = this.ctx.createGain();
        oscEnv.gain.setValueAtTime(0.5, time);
        oscEnv.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        
        osc.connect(oscEnv);
        oscEnv.connect(this.output);

        noise.start(time);
        osc.start(time);
        noise.stop(time + 0.2);
        osc.stop(time + 0.2);
    }

    playHiHat(time: number, open: boolean = false) {
        const ratio = [2, 3, 4.16, 5.43, 6.79, 8.21];
        const fundamental = 40;
        const gain = this.ctx.createGain();

        // Bandpass
        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.value = 10000;

        // Highpass
        const highpass = this.ctx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 7000;

        ratio.forEach(r => {
            const osc = this.ctx.createOscillator();
            osc.type = "square";
            osc.frequency.value = fundamental * r;
            osc.connect(bandpass);
            osc.start(time);
            osc.stop(time + (open ? 0.3 : 0.05));
        });

        bandpass.connect(highpass);
        highpass.connect(gain);
        gain.connect(this.output);

        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + (open ? 0.3 : 0.05));
    }

    private createNoiseBuffer() {
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
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

    playChord(frequencies: number[], time: number, duration: number) {
        frequencies.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle'; // Smoother chord sound
            osc.frequency.value = freq;
            
            osc.connect(gain);
            gain.connect(this.output);
            
            // Envelope
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.15, time + 0.05); // Attack
            gain.gain.setValueAtTime(0.15, time + duration - 0.05); // Sustain
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration + 0.2); // Release
            
            osc.start(time);
            osc.stop(time + duration + 0.5);
        });
    }
}

export class MonoSynth {
    constructor(private ctx: AudioContext, private output: AudioNode) {}

    playBass(freq: number, time: number, duration: number) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, time);
        filter.frequency.exponentialRampToValueAtTime(100, time + 0.2); // Filter sweep

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.output);

        gain.gain.setValueAtTime(0.4, time);
        gain.gain.linearRampToValueAtTime(0.3, time + 0.1);
        gain.gain.setValueAtTime(0.3, time + duration - 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration + 0.1);

        osc.start(time);
        osc.stop(time + duration + 0.2);
    }
}
