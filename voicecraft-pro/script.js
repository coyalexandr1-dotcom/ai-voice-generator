class VoiceCraftApp {
    constructor() {
        this.audioBlob = null;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.textInput = document.getElementById('textInput');
        this.voiceSelect = document.getElementById('voiceSelect');
        this.generateBtn = document.getElementById('generateBtn');
        this.playBtn = document.getElementById('playBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.audioPlayer = document.getElementById('audioPlayer');
        this.statusDiv = document.getElementById('status');
        this.btnText = this.generateBtn.querySelector('.btn-text');
        this.spinner = this.generateBtn.querySelector('.spinner');
    }

    attachEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateSpeech());
        this.playBtn.addEventListener('click', () => this.playAudio());
        this.downloadBtn.addEventListener('click', () => this.downloadAudio());
        
        this.textInput.addEventListener('input', () => {
            const hasText = this.textInput.value.trim().length > 0;
            this.generateBtn.disabled = !hasText;
        });
    }

    async generateSpeech() {
        const text = this.textInput.value.trim();
        const voiceId = this.voiceSelect.value;

        if (!text) {
            this.showStatus('Введите текст для генерации', 'error');
            return;
        }

        this.setLoading(true);
        this.hideStatus();

        try {
            const response = await fetch('/.netlify/functions/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    voice_id: voiceId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка генерации речи');
            }

            const audioBlob = await response.blob();
            this.audioBlob = audioBlob;
            
            const audioUrl = URL.createObjectURL(audioBlob);
            this.audioPlayer.src = audioUrl;
            this.audioPlayer.classList.remove('hidden');
            
            this.playBtn.disabled = false;
            this.downloadBtn.disabled = false;
            
            this.showStatus('Речь успешно сгенерирована!', 'success');
            
        } catch (error) {
            console.error('Generation error:', error);
            this.showStatus(`Ошибка: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    playAudio() {
        if (this.audioPlayer.src) {
            this.audioPlayer.play().catch(error => {
                this.showStatus('Ошибка воспроизведения', 'error');
            });
        }
    }

    downloadAudio() {
        if (this.audioBlob) {
            const url = URL.createObjectURL(this.audioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `voicecraft-${Date.now()}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    setLoading(loading) {
        this.generateBtn.disabled = loading;
        this.btnText.classList.toggle('hidden', loading);
        this.spinner.classList.toggle('hidden', !loading);
    }

    showStatus(message, type) {
        this.statusDiv.textContent = message;
        this.statusDiv.className = `status ${type}`;
        this.statusDiv.classList.remove('hidden');
    }

    hideStatus() {
        this.statusDiv.classList.add('hidden');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VoiceCraftApp();
});