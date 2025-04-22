import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { sceneConfig } from './config.js';
import { sceneManager } from './scene.js';
import { audioManager } from './audio.js';

class Environment {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.setupWater();
        this.setupGround();
        this.setupSun();
        this.setupBubbles();
        this.setupSeaweed();
        this.setupRocks();
        this.setupCorals();
    }

    setupWater() {
        const waterNormals = this.textureLoader.load('https://threejs.org/examples/textures/water/Water_1_M_Normal.jpg');
        waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

        // Create water surface
        const waterGeometry = new THREE.PlaneGeometry(1000, 1000, 128, 128);
        this.water = new Water(waterGeometry, {
            textureWidth: 1024,
            textureHeight: 1024,
            waterNormals: waterNormals,
            alpha: 0.9,
            sunDirection: new THREE.Vector3(0, 1, 0),
            sunColor: 0xffd2a3,
            waterColor: 0x2c6da3,
            distortionScale: 2.5,
            fog: true
        });
        this.water.rotation.x = -Math.PI / 2;
        this.water.position.y = sceneConfig.waterLevel;
        sceneManager.add(this.water);

        // Add surface waves
        const surfaceGeometry = new THREE.PlaneGeometry(1000, 1000, 128, 128);
        const surfaceMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x2c6da3,
            roughness: 0.15,
            metalness: 0.65,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide,
            envMapIntensity: 1.2,
            clearcoat: 0.8,
            clearcoatRoughness: 0.3,
            transmission: 0.5,
            ior: 1.33
        });
        this.surfaceMesh = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
        this.surfaceMesh.rotation.x = -Math.PI / 2;
        this.surfaceMesh.position.y = sceneConfig.waterLevel + 0.1;
        sceneManager.add(this.surfaceMesh);
    }

    setupGround() {
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000, 128, 128);
        const sandTexture = this.textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
        sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
        sandTexture.repeat.set(50, 50);
        
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xd4b681,
            map: sandTexture,
            roughness: 0.8,
            metalness: 0.1,
            bumpMap: sandTexture,
            bumpScale: 0.2
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = sceneConfig.groundLevel;
        sceneManager.add(this.ground);

        // Add sand ripples
        const rippleGeometry = new THREE.PlaneGeometry(1000, 1000, 256, 256);
        const rippleMaterial = new THREE.MeshPhongMaterial({
            color: 0xc2b280,
            transparent: true,
            opacity: 0.5,
            shininess: 10
        });
        this.sandRipples = new THREE.Mesh(rippleGeometry, rippleMaterial);
        this.sandRipples.rotation.x = -Math.PI / 2;
        this.sandRipples.position.y = sceneConfig.groundLevel + 0.2;
        sceneManager.add(this.sandRipples);
    }

    setupSun() {
        // Sun disk
        const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.8,
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.position.set(0, 40, -100);
        sceneManager.add(this.sun);

        // Sun glow
        const sunGlowGeometry = new THREE.SphereGeometry(7, 32, 32);
        const sunGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff22,
            transparent: true,
            opacity: 0.5,
            side: THREE.BackSide
        });
        this.sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
        this.sun.add(this.sunGlow);
    }

    setupBubbles() {
        const bubbleGeometry = new THREE.SphereGeometry(0.15, 32, 32); // Slightly larger bubbles
        const bubbleMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xccddff,
            transparent: true,
            opacity: 0.3,
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.9,
            thickness: 0.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            ior: 1.33
        });

        this.bubbles = [];
        for (let i = 0; i < 50; i++) { // Reduced from 150 to 50
            const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
            // Wider distribution and varied depths for more natural appearance
            bubble.position.set(
                Math.random() * 160 - 80, // Wider x range
                Math.random() * -10 - 5,  // More varied depths
                Math.random() * 160 - 80  // Wider z range
            );
            bubble.userData = {
                speed: Math.random() * 0.03 + 0.02, // Slightly faster movement
                offset: Math.random() * Math.PI * 2,
                lastSoundTime: 0
            };
            sceneManager.add(bubble);
            this.bubbles.push(bubble);
        }
    }

    setupSeaweed() {
        const seaweedGeometry = new THREE.CylinderGeometry(0.1, 0.05, 4, 8, 5, true);
        const seaweedMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x115522,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });

        this.seaweeds = [];
        for (let i = 0; i < 200; i++) {
            const seaweedGroup = new THREE.Group();
            const numSegments = 3 + Math.floor(Math.random() * 3);
            
            for (let j = 0; j < numSegments; j++) {
                const segment = new THREE.Mesh(seaweedGeometry, seaweedMaterial);
                segment.position.y = j * 3.5;
                segment.userData = {
                    originalY: j * 3.5,
                    swayOffset: Math.random() * Math.PI * 2,
                    swaySpeed: 0.5 + Math.random() * 0.5
                };
                seaweedGroup.add(segment);
            }
            
            seaweedGroup.position.set(
                Math.random() * 160 - 80,
                sceneConfig.groundLevel,
                Math.random() * 160 - 80
            );
            sceneManager.add(seaweedGroup);
            this.seaweeds.push(seaweedGroup);
        }
    }

    setupRocks() {
        const rockGeometry = new THREE.DodecahedronGeometry(1);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.8,
            metalness: 0.2
        });

        this.rocks = [];
        for (let i = 0; i < 100; i++) {
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            const scale = 0.5 + Math.random() * 2;
            rock.scale.set(scale, scale * 0.7, scale);
            rock.position.set(
                Math.random() * 200 - 100,
                sceneConfig.groundLevel + 0.5,
                Math.random() * 200 - 100
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            sceneManager.add(rock);
            this.rocks.push(rock);
        }
    }

    setupCorals() {
        const coralGeometry = new THREE.TorusKnotGeometry(0.5, 0.2, 64, 8);
        const coralMaterial = new THREE.MeshPhongMaterial({
            color: 0xff6b6b,
            shininess: 100
        });

        this.corals = [];
        for (let i = 0; i < 50; i++) {
            const coral = new THREE.Mesh(coralGeometry, coralMaterial);
            const scale = 0.5 + Math.random() * 1.5;
            coral.scale.set(scale, scale, scale);
            coral.position.set(
                Math.random() * 160 - 80,
                sceneConfig.groundLevel + 1,
                Math.random() * 160 - 80
            );
            coral.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            sceneManager.add(coral);
            this.corals.push(coral);
        }
    }

    update(time) {
        // Update water
        this.water.material.uniforms['time'].value = time;

        // Update surface waves
        const vertices = this.surfaceMesh.geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            vertices[i + 1] = 
                Math.sin(x * 0.03 + time * 0.7) * 0.3 +
                Math.sin(z * 0.04 + time * 0.6) * 0.3 +
                Math.sin((x + z) * 0.03 + time * 0.8) * 0.2 +
                Math.sin(Math.sqrt(x * x + z * z) * 0.04 + time) * 0.2 +
                Math.sin(x * 0.08 + time * 1.2) * 0.1 +
                Math.sin(z * 0.08 + time * 1.1) * 0.1;
        }
        this.surfaceMesh.geometry.attributes.position.needsUpdate = true;

        // Update sand ripples
        const rippleVertices = this.sandRipples.geometry.attributes.position.array;
        for (let i = 0; i < rippleVertices.length; i += 3) {
            const x = rippleVertices[i];
            const z = rippleVertices[i + 2];
            rippleVertices[i + 1] = 
                Math.sin(x * 0.05 + time * 0.2) * 0.1 +
                Math.sin(z * 0.05 + time * 0.3) * 0.1;
        }
        this.sandRipples.geometry.attributes.position.needsUpdate = true;

        // Update sun glow
        this.sunGlow.scale.setScalar(1 + Math.sin(time * 0.5) * 0.1);
        this.sunGlow.material.opacity = 0.3 + Math.sin(time * 0.5) * 0.1;

        // Update seaweed
        this.seaweeds.forEach(seaweedGroup => {
            seaweedGroup.children.forEach((segment, index) => {
                const swayAmount = (index + 1) * 0.1;
                const userData = segment.userData;
                
                segment.rotation.x = Math.sin(time * userData.swaySpeed + userData.swayOffset) * 0.1;
                segment.rotation.z = Math.cos(time * userData.swaySpeed + userData.swayOffset) * 0.1;
                segment.position.y = userData.originalY + Math.sin(time * 0.5 + userData.swayOffset) * swayAmount;
            });
        });

        // Update corals with subtle movement
        this.corals.forEach((coral, index) => {
            coral.rotation.y = Math.sin(time * 0.3 + index) * 0.05;
            coral.position.y = sceneConfig.groundLevel + 1 + Math.sin(time * 0.5 + index) * 0.1;
        });

        // Update bubbles with sound
        this.bubbles.forEach(bubble => {
            bubble.position.y += bubble.userData.speed;
            bubble.position.x += Math.sin(time + bubble.userData.offset) * 0.01;
            
            // Play bubble sound when reaching surface
            if (bubble.position.y > sceneConfig.waterLevel - 1) {
                const now = performance.now();
                if (now - bubble.userData.lastSoundTime > 1000) { // Play sound every second
                    audioManager.playBubbleSound(bubble.position.x);
                    bubble.userData.lastSoundTime = now;
                }
            }
            
            if (bubble.position.y > sceneConfig.waterLevel) {
                bubble.position.y = sceneConfig.groundLevel;
                bubble.position.x = Math.random() * 100 - 50;
                bubble.position.z = Math.random() * 100 - 50;
            }
        });
    }
}

export const environment = new Environment();