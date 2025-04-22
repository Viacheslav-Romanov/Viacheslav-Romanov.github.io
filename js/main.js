import { sceneManager } from './scene.js';
import { environment } from './environment.js';
import { fishManager } from './fish.js';
import { audioManager } from './audio.js';
import { resumeSections, fishPositions } from './config.js';

class Application {
    constructor() {
        this.animate = this.animate.bind(this);
        this.initialize();
    }

    async initialize() {
        // Initialize audio on any user interaction
        const initAudio = async () => {
            audioManager.initialize();
            await audioManager.resumeAudio();
            // Remove the event listeners after first interaction
            document.removeEventListener('click', initAudio);
            document.removeEventListener('touchstart', initAudio);
        };

        document.addEventListener('click', initAudio);
        document.addEventListener('touchstart', initAudio);

        // Create fishes
        await fishManager.createFishes(resumeSections, fishPositions);

        // Start animation loop
        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate);
        
        const time = performance.now() * 0.001;
        
        // Update environment
        environment.update(time);

        // Update fishes
        fishManager.update();

        // Render scene
        sceneManager.render();
    }
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Application();
});