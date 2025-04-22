import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { sceneManager } from './scene.js';
import { audioManager } from './audio.js';

class Fish {
    constructor(mesh, section, index) {
        this.mesh = mesh;
        this.section = section.content;
        this.title = section.title;
        this.url = section.url || null;
        this.initialY = this.mesh.position.y;
        
        // Create label
        this.label = document.createElement('div');
        this.label.className = 'fish-label';
        this.label.textContent = this.title;
        document.body.appendChild(this.label);
        
        this.speed = Math.random() * 0.2 + 0.1;
        this.direction = 1;
        
        // Add subtle up/down movement
        this.verticalOffset = 0;
        this.verticalSpeed = Math.random() * 0.02 - 0.01;
    }

    update() {
        // Horizontal movement
        this.mesh.position.x += this.speed * this.direction;
        if (this.mesh.position.x > 30 || this.mesh.position.x < -30) {
            this.direction *= -1;
            this.mesh.rotation.y = this.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
        }

        // Vertical movement (gentle up/down)
        this.verticalOffset += this.verticalSpeed;
        if (Math.abs(this.verticalOffset) > 2) {
            this.verticalSpeed *= -1;
        }
        this.mesh.position.y = this.initialY + this.verticalOffset;
        
        // Update label position
        this.updateLabel();
    }

    updateLabel() {
        const vector = this.mesh.position.clone();
        vector.y += 5;  // Position label closer to fish
        
        const widthHalf = window.innerWidth / 2;
        const heightHalf = window.innerHeight / 2;
        
        vector.project(sceneManager.camera);
        
        const x = (vector.x * widthHalf) + widthHalf;
        const y = -(vector.y * heightHalf) + heightHalf;
        
        this.label.style.left = x + 'px';
        this.label.style.top = y + 'px';
    }

    remove() {
        if (this.label && this.label.parentNode) {
            this.label.parentNode.removeChild(this.label);
        }
    }
}

class FishManager {
    constructor() {
        this.fishes = [];
        this.gltfLoader = new GLTFLoader();
        this.setupEventListeners();
    }

    loadFishModel(sections) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/refs/heads/main/2.0/BarramundiFish/glTF/BarramundiFish.gltf',
                (gltf) => {
                    console.log('Fish model loaded successfully');
                    const fishMesh = gltf.scene;
                    fishMesh.scale.set(8, 8, 8);
                    fishMesh.rotation.y = Math.PI / 2;
                    resolve(fishMesh);
                },
                (xhr) => {
                    console.log('Fish model ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                },
                (error) => {
                    console.error('An error happened loading the fish model:', error);
                    reject(error);
                }
            );
        });
    }

    async createFishes(sections, positions) {
        try {
            const fishMesh = await this.loadFishModel();
            
            sections.forEach((section, index) => {
                const fishClone = fishMesh.clone();
                fishClone.position.set(
                    positions[index].x,
                    positions[index].y,
                    positions[index].z
                );
                sceneManager.add(fishClone);
                const fish = new Fish(fishClone, section, index);
                this.fishes.push(fish);
            });
        } catch (error) {
            console.error('Failed to create fishes:', error);
            alert('Could not load the fish model. Please try refreshing the page.');
        }
    }

    setupEventListeners() {
        const canvas = document.querySelector('canvas');
        canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        canvas.addEventListener('click', this.onClick.bind(this));
    }

    onMouseMove(event) {
        const mouse = {
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: -(event.clientY / window.innerHeight) * 2 + 1
        };

        const raycaster = sceneManager.getRaycaster();
        raycaster.setFromCamera(mouse, sceneManager.camera);

        const intersects = raycaster.intersectObjects(sceneManager.scene.children, true);
        let foundFish = false;

        for (const intersect of intersects) {
            const fishObject = this.fishes.find(fish => 
                fish.mesh === intersect.object || 
                fish.mesh.children.includes(intersect.object) ||
                (intersect.object.parent && fish.mesh === intersect.object.parent)
            );
            
            if (fishObject) {
                foundFish = true;
                break;
            }
        }

        document.body.classList.toggle('fish-hook-cursor', foundFish);
    }

    onClick(event) {
        event.preventDefault();
        
        const mouse = {
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: -(event.clientY / window.innerHeight) * 2 + 1
        };

        const raycaster = sceneManager.getRaycaster();
        raycaster.setFromCamera(mouse, sceneManager.camera);

        const intersects = raycaster.intersectObjects(sceneManager.scene.children, true);

        for (const intersect of intersects) {
            const fishObject = this.fishes.find(fish => 
                fish.mesh === intersect.object || 
                fish.mesh.children.includes(intersect.object) ||
                (intersect.object.parent && fish.mesh === intersect.object.parent)
            );
            
            if (fishObject) {
                if (fishObject.url) {
                    window.open(fishObject.url, '_blank');
                } else {
                    sceneManager.remove(fishObject.mesh);
                    fishObject.remove();
                    this.fishes.splice(this.fishes.indexOf(fishObject), 1);
                    this.showPopup(fishObject.section);
                }
                break;
            }
        }
    }

    showPopup(content) {
        const popup = document.getElementById('popup');
        popup.innerHTML = content;
        popup.style.display = 'block';
        
        const closePopup = (e) => {
            if (e.target !== popup && !popup.contains(e.target)) {
                popup.style.display = 'none';
                document.removeEventListener('click', closePopup);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closePopup);
        }, 100);
    }

    update() {
        this.fishes.forEach(fish => fish.update());
    }
}

export const fishManager = new FishManager();