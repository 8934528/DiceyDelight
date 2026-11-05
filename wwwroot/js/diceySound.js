(function () {
    let audioCtx = null;
    let masterGain = null;
    let activeRollNode = null;
    let rollTimeoutId = null;
    let rollIntervalId = null;

    const STORAGE_KEY = 'dicey_delight_muted';
    let isMuted = localStorage.getItem(STORAGE_KEY) === 'true';

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
                masterGain = audioCtx.createGain();
                masterGain.gain.setValueAtTime(isMuted ? 0 : 0.85, audioCtx.currentTime);
                masterGain.connect(audioCtx.destination);
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        return audioCtx;
    }

    function unlockAudio() {
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }
    }

    // auto-unlock on first user interaction
    ['pointerdown', 'touchstart', 'keydown'].forEach(eventName => {
        window.addEventListener(eventName, unlockAudio, { once: true, passive: true });
    });

    function setMuted(muted) {
        isMuted = !!muted;
        localStorage.setItem(STORAGE_KEY, isMuted ? 'true' : 'false');
        if (masterGain && audioCtx) {
            masterGain.gain.setValueAtTime(isMuted ? 0 : 0.85, audioCtx.currentTime);
        }
        if (isMuted) {
            stopDiceRoll();
        }
        updateToggleIcons();
    }

    function toggleMute() {
        unlockAudio();
        setMuted(!isMuted);
        return isMuted;
    }

    function updateToggleIcons() {
        const icons = document.querySelectorAll('.sound-toggle-icon');
        icons.forEach(icon => {
            if (isMuted) {
                icon.className = 'bi bi-volume-mute-fill fs-5 sound-toggle-icon text-muted';
                if (icon.parentElement) icon.parentElement.title = 'Unmute Sound';
            } else {
                icon.className = 'bi bi-volume-up-fill fs-5 sound-toggle-icon text-dark';
                if (icon.parentElement) icon.parentElement.title = 'Mute Sound';
            }
        });
    }

    // Realistic 3D Dice Rolling SFX 
    function startDiceRoll() {
        if (isMuted) return;
        stopDiceRoll();

        const ctx = getAudioContext();
        if (!ctx) return;

        const rollGain = ctx.createGain();
        rollGain.gain.setValueAtTime(0.7, ctx.currentTime);
        rollGain.connect(masterGain);
        activeRollNode = rollGain;

        
        const bufferSize = ctx.sampleRate * 1.5;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99 * b0 + white * 0.05;
            b1 = 0.95 * b1 + white * 0.1;
            b2 = 0.85 * b2 + white * 0.15;
            output[i] = (b0 + b1 + b2) * 0.2;
        }

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(450, ctx.currentTime);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.04, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(rollGain);

        try {
            noiseSrc.start();
        } catch (e) {}

        
        let startTime = Date.now();
        const durationMs = 1220;

        function triggerDieImpact(timeOffset, pan, intensity, pitch) {
            if (!activeRollNode) return;
            const now = ctx.currentTime + timeOffset;

            // resonant die body impact
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(pitch, now);
            osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, now + 0.035);

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(pitch * 1.2, now);
            filter.Q.setValueAtTime(8, now);

            oscGain.gain.setValueAtTime(0, now);
            oscGain.gain.linearRampToValueAtTime(0.28 * intensity, now + 0.002);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

            // crisp surface contact transient
            const snapOsc = ctx.createOscillator();
            const snapGain = ctx.createGain();
            snapOsc.type = 'square';
            snapOsc.frequency.setValueAtTime(pitch * 2.2, now);
            snapGain.gain.setValueAtTime(0.12 * intensity, now);
            snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

            // stereo panner for 3D positioning
            let panner = null;
            if (ctx.createStereoPanner) {
                panner = ctx.createStereoPanner();
                panner.pan.setValueAtTime(pan, now);
            }

            osc.connect(filter);
            filter.connect(oscGain);
            snapOsc.connect(snapGain);

            if (panner) {
                oscGain.connect(panner);
                snapGain.connect(panner);
                panner.connect(rollGain);
            } else {
                oscGain.connect(rollGain);
                snapGain.connect(rollGain);
            }

            try {
                osc.start(now);
                snapOsc.start(now);
                osc.stop(now + 0.04);
                snapOsc.stop(now + 0.015);
            } catch (e) {}
        }

        // fast randomized impacts that slow down
        let nextDelay = 35;
        function scheduleNextImpact() {
            if (!activeRollNode) return;
            const elapsed = Date.now() - startTime;
            if (elapsed >= durationMs) return;

            const progress = elapsed / durationMs;
            // interval lengthens from 35ms to 120ms
            const minInterval = 30 + progress * 70;
            const maxInterval = 55 + progress * 110;
            const delay = Math.random() * (maxInterval - minInterval) + minInterval;

            const pan = (Math.random() * 1.6 - 0.8); // 3D stereo placement
            const intensity = Math.max(0.25, 1 - progress * 0.65 + Math.random() * 0.25);
            const pitch = 1400 + Math.random() * 1200; // acrylic dice resonance

            triggerDieImpact(0, pan, intensity, pitch);

            // secondary die collision
            if (Math.random() > 0.35) {
                setTimeout(() => {
                    if (activeRollNode) {
                        const secPan = (Math.random() * 1.6 - 0.8);
                        const secPitch = 1200 + Math.random() * 1400;
                        triggerDieImpact(0, secPan, intensity * 0.75, secPitch);
                    }
                }, Math.random() * 25 + 10);
            }

            rollTimeoutId = setTimeout(scheduleNextImpact, delay);
        }

        scheduleNextImpact();
    }

    function stopDiceRoll() {
        if (rollTimeoutId) {
            clearTimeout(rollTimeoutId);
            rollTimeoutId = null;
        }
        if (rollIntervalId) {
            clearInterval(rollIntervalId);
            rollIntervalId = null;
        }
        if (activeRollNode && audioCtx) {
            try {
                // final solid settle tap when dice rest
                const now = audioCtx.currentTime;
                activeRollNode.gain.setValueAtTime(activeRollNode.gain.value, now);
                activeRollNode.gain.linearRampToValueAtTime(0.0001, now + 0.018);
            } catch (e) {}
            activeRollNode = null;
        }
    }

    // Start Game Sound
    
    function playStartGame() {
        if (isMuted) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const notes = [
            { f: 523.25, t: 0.00, dur: 0.35 }, // C5
            { f: 659.25, t: 0.08, dur: 0.38 }, // E5
            { f: 783.99, t: 0.16, dur: 0.42 }, // G5
            { f: 1046.50, t: 0.24, dur: 0.75 } // C6 (sustained shimmer)
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, now + note.t);

            gain.gain.setValueAtTime(0, now + note.t);
            gain.gain.linearRampToValueAtTime(0.22, now + note.t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.dur);

            // shimmering second harmonic
            const harm = ctx.createOscillator();
            const harmGain = ctx.createGain();
            harm.type = 'sine';
            harm.frequency.setValueAtTime(note.f * 2, now + note.t);
            harmGain.gain.setValueAtTime(0.08, now + note.t);
            harmGain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.dur * 0.7);

            osc.connect(gain);
            harm.connect(harmGain);
            gain.connect(masterGain);
            harmGain.connect(masterGain);

            try {
                osc.start(now + note.t);
                harm.start(now + note.t);
                osc.stop(now + note.t + note.dur);
                harm.stop(now + note.t + note.dur);
            } catch (e) {}
        });
    }

    // Result Reveal Sounds
    function playRollResult(turnRes, rollResult) {
        if (isMuted) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        const isStar = rollResult && rollResult.isStar;
        const isMatch = turnRes && (turnRes.numberWasRemoved || turnRes.restoredNumber);

        const now = ctx.currentTime;

        if (isStar) {
            // sparkling magical chime
            const starNotes = [
                { f: 783.99, t: 0.00 }, // G5
                { f: 987.77, t: 0.07 }, // B5
                { f: 1174.66, t: 0.14 }, // D6
                { f: 1567.98, t: 0.22 }  // G6
            ];
            starNotes.forEach(note => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(note.f, now + note.t);

                gain.gain.setValueAtTime(0, now + note.t);
                gain.gain.linearRampToValueAtTime(0.25, now + note.t + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + 0.45);

                osc.connect(gain);
                gain.connect(masterGain);

                try {
                    osc.start(now + note.t);
                    osc.stop(now + note.t + 0.48);
                } catch (e) {}
            });
        } else if (isMatch) {
            // crisp two-tone bell chime
            const matchNotes = [
                { f: 659.25, t: 0.00, dur: 0.32 }, // E5
                { f: 880.00, t: 0.09, dur: 0.48 }  // A5
            ];
            matchNotes.forEach(note => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(note.f, now + note.t);

                gain.gain.setValueAtTime(0, now + note.t);
                gain.gain.linearRampToValueAtTime(0.24, now + note.t + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.dur);

                osc.connect(gain);
                gain.connect(masterGain);

                try {
                    osc.start(now + note.t);
                    osc.stop(now + note.t + note.dur);
                } catch (e) {}
            });
        } else {
            // soft settling tap 
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(420, now);
            osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(masterGain);

            try {
                osc.start(now);
                osc.stop(now + 0.13);
            } catch (e) {}
        }
    }

    // Celebratory Victory Fanfare
    function playVictory() {
        if (isMuted) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const fanfare = [
            { f: 392.00, t: 0.00, dur: 0.18 }, // G4
            { f: 523.25, t: 0.14, dur: 0.18 }, // C5
            { f: 659.25, t: 0.28, dur: 0.18 }, // E5
            { f: 783.99, t: 0.42, dur: 0.35 }, // G5
            { f: 659.25, t: 0.72, dur: 0.16 }, // E5
            { f: 783.99, t: 0.86, dur: 0.18 }, // G5
            { f: 1046.50, t: 1.02, dur: 0.95 } // C6 (long triumphant celebration)
        ];

        fanfare.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, now + note.t);

            gain.gain.setValueAtTime(0, now + note.t);
            gain.gain.linearRampToValueAtTime(0.26, now + note.t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.dur);

            // shimmering octave layer
            const bright = ctx.createOscillator();
            const brightGain = ctx.createGain();
            bright.type = 'sine';
            bright.frequency.setValueAtTime(note.f * 2, now + note.t);
            brightGain.gain.setValueAtTime(0.1, now + note.t);
            brightGain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.dur * 0.8);

            osc.connect(gain);
            bright.connect(brightGain);
            gain.connect(masterGain);
            brightGain.connect(masterGain);

            try {
                osc.start(now + note.t);
                bright.start(now + note.t);
                osc.stop(now + note.t + note.dur);
                bright.stop(now + note.t + note.dur);
            } catch (e) {}
        });
    }

    // Loss Sound
    function playDefeat() {
        if (isMuted) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const cadence = [
            { f: 440.00, t: 0.00, dur: 0.32 }, // A4
            { f: 392.00, t: 0.22, dur: 0.34 }, // G4
            { f: 329.63, t: 0.44, dur: 0.55 }  // E4 (warm mellow resolve)
        ];

        cadence.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(note.f, now + note.t);

            gain.gain.setValueAtTime(0, now + note.t);
            gain.gain.linearRampToValueAtTime(0.18, now + note.t + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.dur);

            osc.connect(gain);
            gain.connect(masterGain);

            try {
                osc.start(now + note.t);
                osc.stop(now + note.t + note.dur);
            } catch (e) {}
        });
    }

    // Public API
    window.diceySound = {
        init: function () {
            unlockAudio();
            updateToggleIcons();
        },
        unlock: unlockAudio,
        isMuted: function () {
            return isMuted;
        },
        toggleMute: toggleMute,
        setMuted: setMuted,
        updateIcons: updateToggleIcons,
        startDiceRoll: startDiceRoll,
        stopDiceRoll: stopDiceRoll,
        playStartGame: playStartGame,
        playRollResult: playRollResult,
        playVictory: playVictory,
        playDefeat: playDefeat
    };

    // auto-initialize icons when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateToggleIcons);
    } else {
        updateToggleIcons();
    }
})();

