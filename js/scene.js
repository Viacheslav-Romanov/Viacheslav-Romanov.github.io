import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { sceneConfig } from './config.js';

class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupLighting();
        this.setupEventListeners();
    }

    setupScene() {
        this.scene.background = new THREE.Color(sceneConfig.backgroundColor);
        this.scene.fog = new THREE.FogExp2(sceneConfig.fogColor, sceneConfig.fogDensity);
    }

    setupCamera() {
        const { fov, near, far, position, minDistance, maxDistance, maxPolarAngle, minPolarAngle } = sceneConfig.cameraSettings;
        
        this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
        this.camera.position.set(position.x, position.y, position.z);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('canvas') });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }

    setupControls() {
        const { minDistance, maxDistance, maxPolarAngle, minPolarAngle } = sceneConfig.cameraSettings;
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = minDistance;
        this.controls.maxDistance = maxDistance;
        this.controls.maxPolarAngle = maxPolarAngle;
        this.controls.minPolarAngle = minPolarAngle;
        this.controls.target.set(0, 0, 0);
    }

    setupLighting() {
        const { ambient, directional, hemisphere } = sceneConfig.lighting;

        // Ambient light
        const ambientLight = new THREE.AmbientLight(ambient.color, ambient.intensity);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(directional.color, directional.intensity);
        directionalLight.position.set(directional.position.x, directional.position.y, directional.position.z);
        directionalLight.target.position.set(0, -10, 0);
        this.scene.add(directionalLight);
        this.scene.add(directionalLight.target);
        
        // Hemisphere light
        const hemisphereLight = new THREE.HemisphereLight(
            hemisphere.skyColor,
            hemisphere.groundColor,
            hemisphere.intensity
        );
        this.scene.add(hemisphereLight);
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    render() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    getRaycaster() {
        return new THREE.Raycaster();
    }
}

export const sceneManager = new SceneManager();