import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { Scene } from "./scene.js";

export class SceneManager {
    constructor(renderer, camera) {
      this.renderer = renderer;
      this.camera = camera;
      this.currentScene = null;
      this.previousScene = null;
      this.isTransitioning = false;
      this.transitionDuration = 2;
      this.transitionStartTime = 0;
      this.clock = new THREE.Clock();
  
      // Add window resize event listener
      window.addEventListener('resize', () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }
  
    loadScene(gltfPath, srtPath = null, audioPath = null) {
      return new Promise((resolve, reject) => {
        if (this.currentScene) {
          this.previousScene = this.currentScene;
          this.currentScene.unload();
        }
        this.currentScene = new Scene(this.renderer, this.camera, gltfPath, srtPath, audioPath);
        this.currentScene.load()
          .then((scene) => {
            if (this.previousScene) {
              this.isTransitioning = true;
              this.transitionStartTime = performance.now();
            }
            resolve(scene);
          })
          .catch(error => reject(error));
      });
    }
  
    update() {
      const delta = this.clock.getDelta();
    //   if (this.isTransitioning) {
    //     const elapsed = (performance.now() - this.transitionStartTime) / 1000;
    //     const t = Math.min(elapsed / this.transitionDuration, 1);
    //     this.camera.position.lerpVectors(this.previousScene.camera.position, this.currentScene.cameraList[0].position, t);
    //     this.camera.quaternion.slerpQuaternions(this.previousScene.camera.quaternion, this.currentScene.cameraList[0].quaternion, t);
    //     if (t === 1) {
    //       this.isTransitioning = false;
    //       this.previousScene = null;
    //     }
    //   }
      if (this.currentScene) {
        this.currentScene.update(delta)
      }
    }
  }
  