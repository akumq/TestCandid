import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";

// CamKeyFrame class definition
class CamKeyFrame extends THREE.Vector3 {
    constructor(position, rotation, time, duration) {
        super()
        this.position = position;
        this.time = time;
        this.rotation = rotation;
        this.duration = duration;
    }
}

// Scene class definition
class Scene {
  constructor(scenePath, audioPaths, subtitlePath, skyboxPaths, startAnimationTime,scene,camera) {
    this.scenePath = scenePath;
    this.audioPaths = audioPaths;
    this.subtitlePath = subtitlePath;
    this.skyboxPaths = skyboxPaths;
    this.startAnimationTime = startAnimationTime;
    this.scene = scene;
    this.audio = null;
    this.subtitles = [];
    this.skybox = null;
    this.cameraKeyFrames = [];
    this.animationClips = [];
    this.animations = [];
    this.camera = camera;
  }

  async load(camera,mixer) {
    // Load the scene using GLTFLoader
    const gltfLoader = new GLTFLoader();
    const gltf = await gltfLoader.loadAsync(this.scenePath);
    this.scene = gltf.scene;
    this.animations = gltf.animations;

    // Extract the camera positions from the scene and create CamKeyFrame objects
    let firstCameraFound = false
    this.scene.traverse((object) => {

        if (object.isCamera) {
            if (!firstCameraFound) {
              camera.position.copy(object.position);
              camera.rotation.copy(object.rotation);
              firstCameraFound = true;
            }
            const position = object.position.clone();
            const rotation = object.rotation.clone();
            this.cameraKeyFrames.push(new CamKeyFrame(position, rotation, object.userData.time, object.userData.duration));
        }
    });


 
    // updateCameraAspect(camera)  

    this.scene.traverse((child) => {
        if (child.isMesh) {
            // Check if the mesh has a material
            if (child.material) {
                // Create a new toon shader material
                const toonMaterial = new THREE.MeshToonMaterial({
                    color: child.material.color,
                    map: child.material.map,
                    transparent: child.material.transparent,
                    opacity: child.material.opacity,
                    // Add other properties as needed
                });

                // Replace the original material with the toon material
                child.material = toonMaterial;
            }
        }
    });

    // Extract the animation clips from the scene
    // this.animationClips = gltf.animations;
    // this.animations = this.animationClips.map(clip => {
    //   return {
    //     clip: clip,
    //     action: mixer.clipAction(clip)
    //   };
    // });

    // Load the subtitles
    const response = await fetch(this.subtitlePath);
    const srtContent = await response.text();
    this.subtitles = parseSrt(srtContent);

    // Load the skybox
    if (this.skyboxPaths.length == 6) {
        const skyboxLoader = new THREE.CubeTextureLoader();
        const baseSkyboxPath = 'ressource/skybox/'
        const fullSkyboxPaths = this.skyboxPaths.map(path => baseSkyboxPath + path);
        this.skybox = skyboxLoader.load(fullSkyboxPaths);
    }

  }

  unload(scene) {
    // Remove the scene from the Three.js scene
    scene.remove(this.scene);

    // Clear the subtitles
    this.subtitles = [];

    // Remove the skybox
    scene.background = null;
  }

  static clearThree(obj){
    while(obj.children.length > 0){ 
      Scene.clearThree(obj.children[0]);
      obj.remove(obj.children[0]);
    }
    if(obj.geometry) obj.geometry.dispose();
  
    if(obj.material){ 
      //in case of map, bumpMap, normalMap, envMap ...
      Object.keys(obj.material).forEach(prop => {
        if(!obj.material[prop])
          return;
        if(obj.material[prop] !== null && typeof obj.material[prop].dispose === 'function')                                  
          obj.material[prop].dispose();                                                      
      })
      obj.material.dispose();
    }
  }   
  

  async switchTo(currentScene,camera,scene,mixer, onFinish) {

     // Unload the current scene
     if (currentScene) {
        currentScene.unload();
      }

    // Load the new scene
    await this.load(camera,mixer);
    // Set the new skybox
    // if this.skybox)
    // scene.background = this.skybox;

    // Start displaying the subtitles for the new scene
    startSubtitles(this.subtitles,onFinish);

    Scene.clearThree(scene)
    scene.add(this.scene);

    // Animate the camera position based on the camera key frames
    this.cameraKeyFrames.forEach((keyFrame) => {
        gsap.to(camera.rotation, {
            x: keyFrame.rotation.x,
            y: keyFrame.rotation.y,
            z: keyFrame.rotation.z,
            duration: 4,
            delay: keyFrame.time,
        });
        gsap.to(camera.position, {
            x: keyFrame.position.x,
            y: keyFrame.position.y,
            z: keyFrame.position.z,
            duration: 3,
            delay: keyFrame.time,
        });
    });

    // Play the animations for the new scene at the specified time
    // this.animations.forEach(animation => {
    //   animation.action.reset();
    //   animation.action.play();
    // });


    // Update the current scene
    currentScene = this;

    return new Promise((resolve) => {
        resolve(scene);
    });
  }
}

// Function to parse SRT file content
function parseSrt(srtContent) {
  const lines = srtContent.split('\n');
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
    } else if (line.match(/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/)) {
      // Timestamps
      const [start, end] = line.split(' --> ');
      subtitle.start = parseTimestamp(start);
      subtitle.end = parseTimestamp(end);
    } else if (line !== '') {
      // Text
      if (subtitle.text) {
        subtitle.text += '\n' + line;
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

// Function to parse timestamp string to milliseconds
function parseTimestamp(timestamp) {
  const [time, milliseconds] = timestamp.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return (hours * 3600 + minutes * 60 + seconds) * 1000 + parseInt(milliseconds);
}

// Function to display subtitle at a given time
function displaySubtitle(subtitles, currentTime) {
  const subtitle = subtitles.find(
    (s) => s.start <= currentTime && s.end >= currentTime
  );

  if (subtitle) {
    $('#sub_text').text(subtitle.text);
  } else {
    $('#sub_text').text('');
  }
}

// Function to show the loading screen
function showLoadingScreen() {
  const loadingSpinner = document.createElement('div');
  loadingSpinner.id = 'loading-spinner';
  loadingSpinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  document.body.appendChild(loadingSpinner);
}

// Function to hide the loading screen
function hideLoadingScreen() {
  const loadingSpinner = document.getElementById('loading-spinner');
  if (loadingSpinner) {
    loadingSpinner.remove();
  }
}

function updateCameraAspect(camera) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function startSubtitles(subtitles, onFinish) {
    const subtitleElement = document.getElementById('sub_text');
    subtitleElement.textContent = '';
  
    let startTime = null;
    let intervalId = null;
  
    function displaySubtitle(currentTime) {
      const subtitle = subtitles.find(
        (s) => s.start <= currentTime && s.end >= currentTime
      );
  
      if (subtitle) {
        subtitleElement.textContent = subtitle.text;
      } else {
        subtitleElement.textContent = '';
      }
    }
  
    function updateSubtitles() {
      const currentTime = Date.now() - startTime;
      displaySubtitle(currentTime);
  
      if (currentTime >= subtitles[subtitles.length - 1].end) {
        clearInterval(intervalId);
        startTime = null;
        intervalId = null;
        onFinish();
      }
    }
    
    if (!startTime) {
      startTime = Date.now();
      intervalId = setInterval(updateSubtitles, 100);
    }
}

// Export the Scene class and the global functions
export { Scene, parseSrt, displaySubtitle, showLoadingScreen, hideLoadingScreen, startSubtitles };
