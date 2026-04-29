class SoundManager {
    constructor() {
        this.audioContext = null;
        this.volume = 0.5;
        this.sounds = {};
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    generateTone(frequency, duration, type = 'sine', volumeMultiplier = 1) {
        if (!this.audioContext || this.volume === 0) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        const adjustedVolume = this.volume * volumeMultiplier;
        gainNode.gain.setValueAtTime(adjustedVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playDig() {
        if (!this.audioContext) return;
        
        this.generateTone(150, 0.08, 'square', 0.3);
        
        setTimeout(() => {
            this.generateTone(100, 0.05, 'sawtooth', 0.2);
        }, 30);
    }

    playCollect() {
        if (!this.audioContext) return;
        
        this.generateTone(880, 0.1, 'sine', 0.4);
        
        setTimeout(() => {
            this.generateTone(1100, 0.15, 'sine', 0.3);
        }, 50);
    }

    playUpgrade() {
        if (!this.audioContext) return;
        
        const notes = [262, 330, 392, 523];
        
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.generateTone(freq, 0.2, 'sine', 0.4);
            }, index * 100);
        });
    }

    playAchievement() {
        if (!this.audioContext) return;
        
        const melody = [
            { freq: 523, delay: 0 },
            { freq: 659, delay: 100 },
            { freq: 784, delay: 200 },
            { freq: 1047, delay: 300 },
            { freq: 784, delay: 400 },
            { freq: 1047, delay: 500 }
        ];
        
        melody.forEach(note => {
            setTimeout(() => {
                this.generateTone(note.freq, 0.25, 'sine', 0.4);
            }, note.delay);
        });
    }

    playSell() {
        if (!this.audioContext) return;
        
        this.generateTone(600, 0.08, 'sine', 0.3);
        
        setTimeout(() => {
            this.generateTone(800, 0.08, 'sine', 0.3);
        }, 60);
        
        setTimeout(() => {
            this.generateTone(1000, 0.12, 'sine', 0.35);
        }, 120);
    }

    playError() {
        if (!this.audioContext) return;
        
        this.generateTone(200, 0.15, 'sawtooth', 0.3);
        
        setTimeout(() => {
            this.generateTone(150, 0.2, 'sawtooth', 0.25);
        }, 100);
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

const soundManager = new SoundManager();
