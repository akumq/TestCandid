import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import { EventEmitter } from "./eventEmitter.js"
import { VolumeManager } from "./volumeManager.js";

const volumeManager = new VolumeManager();

class CamKeyFrame extends THREE.Vector3 {
  constructor(position, rotation, time, duration) {
    super();
    this.position = position;
    this.time = time;
    this.rotation = rotation;
    this.duration = duration;
  }
}

export class Scene {
  constructor(
    renderer,
    camera,
    gltfPath,
    srtPath = null,
    audioPath = null,
    params = {},
    skybox = [],
  ) {
    this.renderer = renderer;
    this.camera = camera;
    this.gltfPath = gltfPath;
    this.srtPath = srtPath;
    this.audioPath = audioPath;
    this.mixer = null;
    this.scene = new THREE.Scene();
    this.cameraKeyFrames = [];
    this.audio = null;
    this.subtitleElement = null;
    this.subtitles = [];
    this.currentSubtitleIndex = 0;
    this.isSubtitlePlaying = false;
    this.startTime = null;
    this.intervalId = null;
    this.eventEmitter = new EventEmitter();
    this.audioFinished = false;
    this.subtitlesFinished = false;
    this.animationFinished = false;
    this.skybox = [
      "yonder_ft.jpg",
      "yonder_bk.jpg",
      "yonder_up.jpg",
      "yonder_dn.jpg",
      "yonder_rt.jpg",
      "yonder_lf.jpg",
    ];
    this.params = params;
  }

  load() {
    return new Promise((resolve, reject) => {
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(
        this.gltfPath,
        (data) => {
          const object = data.scene;
          if(this.params.toons){
            object.traverse((child) => {
              if (child.isMesh) {
                const material = child.material;
                if (material) {
                  const toonMaterial = new THREE.MeshToonMaterial({
                    color: material.color,
                    map: material.map,
                    transparent: material.transparent,
                    opacity: material.opacity,
                    skinning: true,
                  });
                  child.material = toonMaterial;
                }
              }
            });
          }
          
          this.scene.add(object);
          if (this.params.skybox) {
            var skyBox = new THREE.CubeTextureLoader()
            .setPath('ressource/skybox/')
            .load(this.skybox);
  
            this.scene.background = skyBox;
          }


          if (this.params.fog != null){
            this.scene.fog = new THREE.Fog( this.params.fog.color, this.params.fog.near, this.params.fog.far );
          }

          object.traverse((child) => {
            if (child.isCamera) {
              const position = child.position.clone();
              const rotation = child.rotation.clone();
              this.cameraKeyFrames.push(
                new CamKeyFrame(
                  position,
                  rotation,
                  child.userData.time,
                  child.userData.duration
                )
              );
            }
          });

          if (this.cameraKeyFrames.length > 0) {
            this.camera.position.copy(this.cameraKeyFrames[0].position);
            this.camera.rotation.copy(this.cameraKeyFrames[0].rotation);
          }

          this.mixer = new THREE.AnimationMixer(object);
          data.animations.forEach((clip) => {
            const action = this.mixer.clipAction(clip);
            action.setLoop(
              this.params.loop ? THREE.LoopRepeat : THREE.LoopOnce
            );
            action.play();
          });

          this.mixer.addEventListener("finished", () => {
            this.animationFinished = true;
            this.checkFinished();
          });

          if (this.srtPath) {
            fetch(this.srtPath)
              .then((response) => response.text())
              .then((data) => {
                this.subtitles = this.parseSrt(data);
                this.subtitleElement = document.getElementById("sub_text");
                // Event Scene (AwaitForclick)
                this.eventEmitter.emit("awaitClick");
                document.addEventListener(
                  "click",
                  () => {
                    this.clicked = true;
                    this.handleClick();
                  },
                  { once: true }
                );
              })
              .catch((error) => console.error(error));
          }

         

          resolve(this);
        },
        undefined,
        reject
      );
    });
  }

  unload() {
    // Remove model from scene
    this.scene.children.forEach((child) => {
      this.scene.remove(child);
    });

    // Stop audio
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }

    // Reset subtitles
    if (this.subtitleElement) {
      this.subtitleElement.textContent = "";
    }
    this.currentSubtitleIndex = 0;
    this.isSubtitlePlaying = false;
    this.startTime = null;
    this.intervalId = null;
  }

  update(delta) {
    if (this.mixer) {
      if (this.clicked) {
        this.mixer.update(delta);
      } else {
        this.mixer.update(0);
      }
    }
  }

  interpolateCamera() {
    // Check if an animation is already in progress
    if (
      gsap.isTweening(this.camera.rotation) ||
      gsap.isTweening(this.camera.position)
    ) {
      return;
    }

    const lastSubtitle = this.subtitles[this.subtitles.length -1];
    const duration = lastSubtitle.end /1000; // convert to seconds

    this.cameraKeyFrames.forEach((keyFrame) => {
      gsap.to(this.camera.rotation, {
        x: keyFrame.rotation.x,
        y: keyFrame.rotation.y,
        z: keyFrame.rotation.z,
        duration: duration,
        delay: keyFrame.time,
      });
      gsap.to(this.camera.position, {
        x: keyFrame.position.x,
        y: keyFrame.position.y,
        z: keyFrame.position.z,
        duration: duration,
        delay: keyFrame.time,
      });
    });
  }

  setAudioVolume(volume) {
    if (this.audio) {
      this.audio.volume = volume;
    }
  }

  handleClick() {
    console.log("test")
    this.eventEmitter.emit("click");

    // Vérifier si l'utilisateur a cliqué sur le bouton "Skip"
    const skipButton = document.getElementById("skip");
    if (skipButton && skipButton.contains(event.target)) {
        this.eventEmitter.emit("skipScene");
        return;
    }

    if (!this.isTransitioning) { 
      if (!this.startTime) {
        if (this.audioPath) {
            this.audio = volumeManager.createAudio(this.audioPath);

            // Listen for audio end event
            this.audio.addEventListener("ended", () => {
                this.audioFinished = true;
                this.checkFinished();
            });
            // Start audio
            this.audio.play();
        }
        this.startTime = Date.now();
        this.intervalId = setInterval(() => {
            const currentTime = Date.now() - this.startTime;
            this.displaySubtitle(currentTime);
            if (currentTime >= this.subtitles[this.subtitles.length - 1].end) {
                clearInterval(this.intervalId);
                this.startTime = null;
                this.intervalId = null;
                this.isSubtitlePlaying = false;
                this.subtitlesFinished = true;
                this.checkFinished();
            }
        }, 100);
    }

    this.interpolateCamera();
    }
   
}

  parseSrt(srtContent) {
    const lines = srtContent.split("\n");
    const subtitles = [];
    let subtitle = {};

    for (let line of lines) {
      line = line.trim();

      if (line.match(/^\d+$/)) {
        // New subtitle
        if (subtitle.id) {
          subtitles.push(subtitle);
        }
        subtitle = { id: parseInt(line) };
      } else if (
        line.match(/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/)
      ) {
        // Timestamps
        const [start, end] = line.split(" --> ");
        subtitle.start = this.parseTimestamp(start);
        subtitle.end = this.parseTimestamp(end);
      } else if (line !== "") {
        // Text
        if (subtitle.text) {
          subtitle.text += "\n" + line;
        } else {
          subtitle.text = line;
        }
      }
    }

    if (subtitle.id) {
      subtitles.push(subtitle);
    }

    return subtitles;
  }

  parseTimestamp(timestamp) {
    const [time, milliseconds] = timestamp.split(",");
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return (
      (hours * 3600 + minutes * 60 + seconds) * 1000 + parseInt(milliseconds)
    );
  }

  displaySubtitle(currentTime) {
    const subtitle = this.subtitles.find(
      (s) => s.start <= currentTime && s.end >= currentTime
    );

    if (subtitle) {
      this.subtitleElement.textContent = subtitle.text;
      this.isSubtitlePlaying = true;
    } else {
      if (this.isSubtitlePlaying) {
        const nextSubtitle = this.subtitles.find((s) => s.start > currentTime);
        if (!nextSubtitle || nextSubtitle.start > currentTime + 100) {
          this.subtitleElement.textContent = "";
          this.isSubtitlePlaying = false;
        }
      }
    }
  }

  checkFinished() {
    if (
      (!this.audioPath || this.audioFinished) &&
      (!this.srtPath || this.subtitlesFinished) &&
      (!this.loop || !this.mixer || this.animationFinished)
    ) {
      this.eventEmitter.emit("finished");
    }
  }
}
