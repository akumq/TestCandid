import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { Scene, parseSrt, displaySubtitle, showLoadingScreen, hideLoadingScreen, startSubtitles } from "./scene.js";

// Initialize Three.js renderer and scene
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadows = true;
renderer.shadowType = 1;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio( window.devicePixelRatio );
renderer.toneMapping = 0;
renderer.toneMappingExposure = 1
renderer.useLegacyLights  = false;
renderer.toneMapping = THREE.NoToneMapping;
renderer.setClearColor(0xffffff, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace



const scene = new THREE.Scene();
let mixer = new THREE.AnimationMixer(scene);
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

function switchToNextScene() {
    if (currentScene === scene1) {
      scene2.switchTo(currentScene);
    } else if (currentScene === scene2) {
      // Add more scenes here as needed
    }
  }

// Create instances of the Scene class for each scene
const scene1 = new Scene(
  'ressource/model/scene2/scene.gltf',
  [],
  'ressource/srt/example.srt',
  [],
//   ['yonder_ft.jpg', 'yonder_bk.jpg', 'yonder_up.jpg', 'yonder_dn.jpg', 'yonder_rt.jpg', 'yonder_lf.jpg'],
  3,
  scene,
  camera,
);

const scene2 = new Scene(
  'ressource/model/scene1/scene.gltf',
  [],
  'ressource/srt/example.srt',
  [],
  0,
  scene,
  camera,
);

// Initialize the current scene to null
let currentScene = null;

// Switch to the first scene when the page loads
await scene2.switchTo(currentScene,camera,scene,mixer,() => {
    console.log("scene 1 load")
    // scene2.switchTo(currentScene,camera,scene,mixer,() => {
    //     console.log("finish")
    // });
}).then((scene)=>{
  console.log(scene)
  // const clips = scene.animations;
  // console.log(currentScene.animations)
  // const clip = THREE.AnimationClip.findByName(currentScene.animations,"Hanabi Hyuga_armAction");
  // const action = mixer.clipAction(clip);
  // action.play();
  // console.log(action)
});




// Animation loop
const clock = new THREE.Clock();
function animate() {
    const delta = clock.getDelta();
    // Update the animation mixer for the current scene
    //   console.log(currentScene.mixer)
    mixer.update(delta);
    renderer.render(scene, camera);
    // Call the animate function again on the next frame
    // console.log(currentScene)
    requestAnimationFrame(animate);

}
animate();

// Window resize event listener
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
