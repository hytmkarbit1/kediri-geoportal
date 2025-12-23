// Loading Progress Component
import './loading.css';

export class LoadingProgress {
    constructor() {
        this.progressBar = null;
        this.progressContainer = null;
        this.messageEl = null;
        this.currentProgress = 0;
        this.totalLayers = 0;
        this.loadedLayers = 0;

        this.init();
    }

    init() {
        // Create progress container
        this.progressContainer = document.createElement('div');
        this.progressContainer.className = 'loading-progress';

        // Create progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'loading-progress-bar';
        this.progressContainer.appendChild(this.progressBar);

        // Create message element
        this.messageEl = document.createElement('div');
        this.messageEl.className = 'loading-message';

        // Add to body
        document.body.appendChild(this.progressContainer);
        document.body.appendChild(this.messageEl);
    }

    start(totalLayers) {
        this.totalLayers = totalLayers;
        this.loadedLayers = 0;
        this.currentProgress = 0;

        this.progressContainer.classList.add('active');
        this.messageEl.classList.add('active');
        this.updateProgress(0);
        this.updateMessage('Loading layers...');
    }

    increment(layerName) {
        this.loadedLayers++;
        const progress = (this.loadedLayers / this.totalLayers) * 100;
        this.updateProgress(progress);
        this.updateMessage(`Loading ${layerName}... (${this.loadedLayers}/${this.totalLayers})`);

        if (this.loadedLayers >= this.totalLayers) {
            setTimeout(() => this.complete(), 500);
        }
    }

    updateProgress(percent) {
        this.currentProgress = Math.min(percent, 100);
        this.progressBar.style.width = `${this.currentProgress}%`;
    }

    updateMessage(message) {
        this.messageEl.textContent = message;
    }

    complete() {
        this.updateProgress(100);
        this.updateMessage('✓ All layers loaded');

        setTimeout(() => {
            this.progressContainer.classList.remove('active');
            this.messageEl.classList.remove('active');
        }, 1000);
    }

    hide() {
        this.progressContainer.classList.remove('active');
        this.messageEl.classList.remove('active');
    }
}

export default LoadingProgress;
