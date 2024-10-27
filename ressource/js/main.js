import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { SceneManager } from './sceneManager.js';


function startAnimation(){

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    const sceneManager = new SceneManager(renderer, camera);
    
    // Add scenes to the scene manager
    sceneManager.addScene('ressource/model/scene1/scene.gltf', 'ressource/srt/example.srt', '',{ loop: true });
    sceneManager.addScene('ressource/model/scene2/scene.gltf', 'ressource/srt/example.srt', '',{ loop: false });
    
    // Load the first scene
    sceneManager.loadScene(
    sceneManager.scenes[0].gltfPath,
    sceneManager.scenes[0].srtPath,
    sceneManager.scenes[0].audioPath,
    sceneManager.scenes[0].params
    ).then(() => {
    // Start animation loop
    animate();
    });
    
    function animate() {
      requestAnimationFrame(animate);
      sceneManager.update();
      renderer.render(sceneManager.currentScene.scene, camera);
    }
    
}

startAnimation()