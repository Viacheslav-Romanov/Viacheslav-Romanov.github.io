class AudioManager {
    constructor() {
        this.audioContext = null;
        this.bubbleSoundBuffer = null;
        this.bubbleGain = null;
        this.bubblePanner = null;
        this.isInitialized = false;
    }

    initialize() {
        if (!this.isInitialized) {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain node for volume control
            this.bubbleGain = this.audioContext.createGain();
            this.bubbleGain.gain.value = 0.15; // Slightly increased volume
            
            // Create lowpass filter for underwater effect
            this.lowpassFilter = this.audioContext.createBiquadFilter();
            this.lowpassFilter.type = 'lowpass';
            this.lowpassFilter.frequency.value = 400; // Cut high frequencies
            this.lowpassFilter.Q.value = 2; // Add some resonance
            
            // Create stereo panner
            this.bubblePanner = this.audioContext.createStereoPanner();
            this.bubblePanner.pan.value = 0;
            
            // Connect nodes: source -> gain -> lowpass -> panner -> destination
            this.bubbleGain.connect(this.lowpassFilter);
            this.lowpassFilter.connect(this.bubblePanner);
            this.bubblePanner.connect(this.audioContext.destination);
            
            // Create and load bubble sound
            this.createBubbleSound();
            
            this.isInitialized = true;
            console.log('Audio system initialized');
        }
    }

    createBubbleSound() {
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.2; // Longer duration for more natural sound
        this.bubbleSoundBuffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const channelData = this.bubbleSoundBuffer.getChannelData(0);
        
        // Generate bubble sound using multiple frequency components
        for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            
            // Main bubble resonance (even lower frequency)
            const mainFreq = 80 - 50 * t; // Sweep from 80Hz to 30Hz
            
            // Secondary frequencies for underwater character
            const harmonic1 = (120 - 70 * t) * 0.3; // Mid harmonic
            const harmonic2 = (40 - 20 * t) * 0.5; // Deep harmonic
            
            // More complex envelopes for natural bubble formation
            const mainEnvelope = Math.exp(-8 * t); // Slower decay
            const harmonicEnvelope = Math.exp(-6 * t); // Even slower decay for harmonics
            
            // Filtered noise for water movement
            const noise = (Math.random() * 2 - 1) * 0.15 * Math.exp(-15 * t);
            
            // Add subtle frequency modulation for more organic sound
            const modulation = Math.sin(2 * Math.PI * 3 * t) * 10;
            
            channelData[i] = (
                Math.sin(2 * Math.PI * (mainFreq + modulation) * t) * mainEnvelope * 0.5 +
                Math.sin(2 * Math.PI * harmonic1 * t) * harmonicEnvelope * 0.25 +
                Math.sin(2 * Math.PI * harmonic2 * t) * harmonicEnvelope * 0.35 +
                noise
            ) * (1 - Math.exp(-30 * t)) * 0.8; // Softer attack and overall volume
        }
    }

    playBubbleSound(x = 0) {
        if (!this.isInitialized || !this.audioContext) {
            return;
        }

        // Create and configure sound source
        const source = this.audioContext.createBufferSource();
        source.buffer = this.bubbleSoundBuffer;
        
        // Calculate stereo position based on x coordinate
        // Clamp the value between -1 and 1
        const panValue = Math.max(-1, Math.min(1, x / 50));
        this.bubblePanner.pan.value = panValue;
        
        // Connect and play
        source.connect(this.bubbleGain);
        source.start();
        
        // Clean up after sound finishes
        source.onended = () => {
            source.disconnect();
        };
    }

    // Call this method to resume audio context after user interaction
    async resumeAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            console.log('Audio context resumed');
        }
    }
}

export const audioManager = new AudioManager();