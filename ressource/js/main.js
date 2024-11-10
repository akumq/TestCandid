import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { SceneManager } from './sceneManager.js';

function fadeOutTitle(query) {
    const title = document.querySelector(query);
    title.classList.remove('fadeIn');
    title.classList.add('fadeOut');

    setTimeout(() => {
        title.classList.add('hidden');
    }, 3000); 
}

function fadeInTitle(query) {
    const title = document.querySelector(query);
    if(title){
        console.log(title)
        title.classList.remove('hidden');
        title.classList.remove('fadeOut');
        title.classList.add('fadeIn');
    }
}

function startAnimation(){
    


    const canvas = document.getElementById('canvas');
    canvas.style.display = 'block'; 

    console.log(canvas)
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    

    const sceneManager = new SceneManager(renderer, camera);

    sceneManager.addScene('ressource/model/scene2/scene.gltf', 'ressource/srt/example.srt', '',{ loop: false, toons:true, });
    sceneManager.addScene('ressource/model/introduction/scene.gltf', 'ressource/srt/destruction.srt', 'ressource/audio/destruction.mp3',{ loop: true, skybox: true, toons:false, fog: {color: 0xec9f53, near: 18, far: 200 }, });
    sceneManager.addScene('ressource/model/scene1/scene.gltf', 'ressource/srt/hiashi.srt', 'ressource/audio/hiashi.mp3',{ loop: true, skybox: false, toons:true, fog: {color: 0xec9f53, near: 18, far: 200 }, });
   

    // Load the first scene
    sceneManager.loadScene(
        sceneManager.scenes[0].gltfPath,
        sceneManager.scenes[0].srtPath,
        sceneManager.scenes[0].audioPath,
        sceneManager.scenes[0].params
    ).then(() => {
        var audio = new Audio('ressource/audio/ost.mp3');

        audio.loop = true;
        audio.volume = 0.5;
    
        audio.play();
        sceneManager.eventEmitter.on("nextScene",(index) => {
            switch(index){
                case 1:
                    fadeOutTitle('.TitrePrincipale')
                    setTimeout(()=>{
                        fadeInTitle('.NrTitle')
                    },500)
                    break;
                // case sceneManager.scenes.length :
                //     fadeOutTitle(".canvas")
                //     fadeInTitle(".resume")
                //     break;
            }

        });

        sceneManager.eventEmitter.on("noSceneLeft",() => {
            fadeOutTitle("#canvas");
            fadeOutTitle("#Chapitre")

            document.body.style.backgroundColor = "black";
            fadeInTitle(".resume");
            // console.log( document.querySelector("#Chapitre"));
            // document.querySelector("#Chapitre").classList.add('hidden');
            // console.log( document.querySelector("#Chapitre"));
        });

        animate();
    });

    function animate() {
        requestAnimationFrame(animate);
        sceneManager.update();
        renderer.render(sceneManager.currentScene.scene, camera);
    }
}

// document.getElementById("startAnimation").addEventListener('click', function() {
//     startAnimation();
// // });


startAnimation();