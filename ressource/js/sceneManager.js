import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { Scene } from "./scene.js";
import { EventEmitter } from "./eventEmitter.js";

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
    this.scenes = [];
    this.currentSceneIndex = 0;
    this.eventEmitter = new EventEmitter();

    // Add window resize event listener
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  skipCurrentScene() {
      if (this.currentScene) {
        this.currentScene.unload();
      }
      this.loadNextScene();
  }


  addScene(gltfPath, srtPath = null, audioPath = null, params = {}) {
    this.scenes.push({ gltfPath, srtPath, audioPath, params });
  }

  loadNextScene() {
    this.eventEmitter.emit("nextScene",this.currentSceneIndex + 1)
    if (this.currentSceneIndex < this.scenes.length - 1) {
      this.currentSceneIndex++;

      const { gltfPath, srtPath, audioPath, params } = this.scenes[this.currentSceneIndex];
      this.loadScene(gltfPath, srtPath, audioPath, params);
    } else {
      // this.renderer.domElement.remove();
      this.eventEmitter.emit("noSceneLeft")
    }
  }

  loadScene(gltfPath, srtPath = null, audioPath = null, params = {}) {
    return new Promise((resolve, reject) => {
      if (this.currentScene) {
        this.previousScene = this.currentScene;
        this.currentScene.unload();
      }
      this.currentScene = new Scene(this.renderer, this.camera, gltfPath, srtPath, audioPath, params);
      this.currentScene.eventEmitter.on('finished', () => {
        this.loadNextScene();
      });
      this.currentScene.eventEmitter.on('click',()=> {
        this.eventEmitter.emit("click");
      })
      this.currentScene
        .load()
        .then((scene) => {
          if (this.previousScene) {
            this.isTransitioning = true;
            this.transitionStartTime = performance.now();
          }
          resolve(scene);
        })
        .catch((error) => reject(error));
    });
  }

  update() {
    const delta = this.clock.getDelta();
    if (this.currentScene) {
      this.currentScene.update(delta);
    }
  }
}
