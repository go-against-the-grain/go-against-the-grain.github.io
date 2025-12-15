class GoAgainstTheGrain extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Constants
        this.AUTOPLAY_DELAY_MS = 500;
        this.BEEP_DURATION_SEC = 0.3;
        this.BASE_FREQUENCY_HZ = 440;
        this.FREQUENCY_VARIATION_HZ = 200;
        this.currentActiveLine = -1;
        
        // Original lyrics inspired by the theme "going against the grain"
        // Not copyrighted material - original content
        this.lyrics = [
            { text: "Walking down the road less traveled by", start: 0.5, end: 3.5 },
            { text: "Standing tall when others wonder why", start: 3.8, end: 6.8 },
            { text: "Following my heart instead of the crowd", start: 7.1, end: 10.1 },
            { text: "Speaking my truth clear and loud", start: 10.4, end: 13.4 },
            { text: "", start: 13.7, end: 14.7 },
            { text: "Going against the grain", start: 14.7, end: 17.2 },
            { text: "Dancing in the rain", start: 17.5, end: 19.5 },
            { text: "Not afraid of change", start: 19.8, end: 22.3 },
            { text: "Going against the grain", start: 22.6, end: 25.6 },
            { text: "", start: 25.9, end: 27.0 },
            { text: "When they say turn left, I go right", start: 27.0, end: 30.0 },
            { text: "I chase my dreams into the night", start: 30.3, end: 33.3 },
            { text: "Living life on my own terms", start: 33.6, end: 36.6 },
            { text: "Taking chances, never concerned", start: 36.9, end: 39.9 },
            { text: "", start: 40.2, end: 41.2 },
            { text: "Going against the grain", start: 41.2, end: 43.7 },
            { text: "Dancing in the rain", start: 44.0, end: 46.0 },
            { text: "Not afraid of change", start: 46.3, end: 48.8 },
            { text: "Going against the grain", start: 49.1, end: 52.1 }
        ];
        
        // Base64 encoded audio - a simple beep/tone pattern (WAV format)
        // This is a minimal WAV file with simple tones for demonstration
        this.audioData = this.generateAudioData();
    }
    
    generateAudioData() {
        // Generate a simple WAV file with beeps as base64
        // This creates a ~54 second audio file with simple tones
        const sampleRate = 8000;
        const duration = 54;
        const numSamples = sampleRate * duration;
        const numChannels = 1;
        const bitsPerSample = 8;
        
        const dataSize = numSamples * numChannels * (bitsPerSample / 8);
        const buffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(buffer);
        
        // WAV header
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataSize, true);
        this.writeString(view, 8, 'WAVE');
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
        view.setUint16(32, numChannels * (bitsPerSample / 8), true);
        view.setUint16(34, bitsPerSample, true);
        this.writeString(view, 36, 'data');
        view.setUint32(40, dataSize, true);
        
        // Generate audio samples with varying tones
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            let value = 128; // silence
            
            // Add beeps at key moments to simulate music rhythm
            const beepTimes = [0.5, 3.8, 7.1, 10.4, 14.7, 17.5, 19.8, 22.6, 27.0, 30.3, 33.6, 36.9, 41.2, 44.0, 46.3, 49.1];
            
            for (const beepStart of beepTimes) {
                if (t >= beepStart && t < beepStart + this.BEEP_DURATION_SEC) {
                    const freq = this.BASE_FREQUENCY_HZ + Math.floor(Math.random() * this.FREQUENCY_VARIATION_HZ);
                    value = 128 + Math.sin(2 * Math.PI * freq * (t - beepStart)) * 50;
                }
            }
            
            view.setUint8(44 + i, Math.max(0, Math.min(255, value)));
        }
        
        // Convert to base64
        const bytes = new Uint8Array(buffer);
        const binaryChunks = [];
        for (let i = 0; i < bytes.length; i++) {
            binaryChunks.push(String.fromCharCode(bytes[i]));
        }
        return 'data:audio/wav;base64,' + btoa(binaryChunks.join(''));
    }
    
    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
    
    connectedCallback() {
        this.render();
        this.setupEventListeners();
        
        // If sync attribute is present, auto-open dialog and start playback
        if (this.hasAttribute('sync')) {
            setTimeout(() => {
                this.dialog.showModal();
                this.audio.play().catch(error => {
                    console.warn('Autoplay was prevented:', error);
                    // User will need to manually start playback
                });
            }, this.AUTOPLAY_DELAY_MS);
        }
    }
    
    render() {
        const style = `
            <style>
                :host {
                    display: block;
                    font-family: Arial, sans-serif;
                }
                
                .container {
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 10px;
                    color: white;
                    text-align: center;
                }
                
                .title {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 15px;
                }
                
                .play-button {
                    background: #fff;
                    color: #667eea;
                    border: none;
                    padding: 12px 30px;
                    font-size: 16px;
                    border-radius: 25px;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    font-weight: bold;
                }
                
                .play-button:hover {
                    transform: scale(1.05);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }
                
                .play-button:active {
                    transform: scale(0.98);
                }
                
                dialog {
                    border: none;
                    border-radius: 15px;
                    padding: 0;
                    max-width: 600px;
                    width: 90%;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                }
                
                dialog::backdrop {
                    background: rgba(0, 0, 0, 0.7);
                }
                
                .dialog-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 15px 15px 0 0;
                }
                
                .dialog-title {
                    margin: 0;
                    font-size: 22px;
                }
                
                .close-button {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    font-size: 24px;
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: background 0.2s;
                    line-height: 1;
                }
                
                .close-button:hover {
                    background: rgba(255,255,255,0.3);
                }
                
                .lyrics-container {
                    padding: 30px;
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                .lyric-line {
                    font-size: 18px;
                    line-height: 1.8;
                    margin: 10px 0;
                    padding: 8px;
                    border-radius: 5px;
                    transition: all 0.3s ease;
                    color: #333;
                }
                
                .lyric-line.active {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-weight: bold;
                    transform: scale(1.05);
                    box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
                }
                
                .lyric-line.empty {
                    height: 20px;
                }
                
                .audio-controls {
                    padding: 20px;
                    background: #f5f5f5;
                    border-radius: 0 0 15px 15px;
                    text-align: center;
                }
                
                audio {
                    width: 100%;
                    margin-top: 10px;
                }
            </style>
        `;
        
        const html = `
            <div class="container">
                <div class="title">🎵 Go Against The Grain 🎵</div>
                <button class="play-button" id="openDialog">
                    ▶️ Play & View Lyrics
                </button>
            </div>
            
            <dialog id="lyricsDialog">
                <div class="dialog-header">
                    <h2 class="dialog-title">Go Against The Grain</h2>
                    <button class="close-button" id="closeDialog">×</button>
                </div>
                <div class="lyrics-container" id="lyricsContainer">
                    ${this.lyrics.map((line, index) => 
                        `<div class="lyric-line ${line.text === '' ? 'empty' : ''}" data-index="${index}">
                            ${line.text || '&nbsp;'}
                         </div>`
                    ).join('')}
                </div>
                <div class="audio-controls">
                    <audio id="audio" controls>
                        <source src="${this.audioData}" type="audio/wav">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            </dialog>
        `;
        
        this.shadowRoot.innerHTML = style + html;
        
        // Store references
        this.dialog = this.shadowRoot.getElementById('lyricsDialog');
        this.audio = this.shadowRoot.getElementById('audio');
        this.lyricsContainer = this.shadowRoot.getElementById('lyricsContainer');
    }
    
    setupEventListeners() {
        const openButton = this.shadowRoot.getElementById('openDialog');
        const closeButton = this.shadowRoot.getElementById('closeDialog');
        
        openButton.addEventListener('click', () => {
            this.dialog.showModal();
            if (this.hasAttribute('sync')) {
                this.audio.play().catch(error => {
                    console.warn('Playback failed:', error);
                });
            }
        });
        
        closeButton.addEventListener('click', () => {
            this.dialog.close();
            this.audio.pause();
            this.audio.currentTime = 0;
            this.clearHighlights();
        });
        
        // Close on backdrop click
        this.dialog.addEventListener('click', (e) => {
            const rect = this.dialog.getBoundingClientRect();
            if (
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom
            ) {
                this.dialog.close();
                this.audio.pause();
                this.audio.currentTime = 0;
                this.clearHighlights();
            }
        });
        
        // Sync lyrics with audio if sync attribute is present
        if (this.hasAttribute('sync')) {
            this.audio.addEventListener('timeupdate', () => {
                this.syncLyrics();
            });
            
            this.audio.addEventListener('ended', () => {
                this.clearHighlights();
            });
        }
    }
    
    syncLyrics() {
        const currentTime = this.audio.currentTime;
        const lyricElements = this.shadowRoot.querySelectorAll('.lyric-line');
        
        let newActiveLine = -1;
        this.lyrics.forEach((line, index) => {
            const element = lyricElements[index];
            if (currentTime >= line.start && currentTime <= line.end) {
                element.classList.add('active');
                newActiveLine = index;
            } else {
                element.classList.remove('active');
            }
        });
        
        // Only scroll if the active line changed to prevent excessive scrolling
        if (newActiveLine !== -1 && newActiveLine !== this.currentActiveLine) {
            this.currentActiveLine = newActiveLine;
            lyricElements[newActiveLine].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    clearHighlights() {
        const lyricElements = this.shadowRoot.querySelectorAll('.lyric-line');
        lyricElements.forEach(element => element.classList.remove('active'));
        this.currentActiveLine = -1;
    }
}

// Define the custom element
customElements.define('go-against-the-grain', GoAgainstTheGrain);
