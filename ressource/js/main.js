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
    
    title.classList.remove('hidden');
    title.classList.remove('fadeOut');
    title.classList.add('fadeIn');
}

function startAnimation(){
    const canvas = document.getElementById('canvas');
    canvas.style.display = 'block'; 

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    

    const sceneManager = new SceneManager(renderer, camera);

    // Add scenes to the scene manager
    // sceneManager.addScene('ressource/model/introduction/scene.gltf', 'ressource/srt/example.srt', '',{ loop: true, skybox: true, toons:false, fog: {color: 0xec9f53, near: 18, far: 200 }, });

    // sceneManager.addScene('ressource/model/foret/scene.gltf', 'ressource/srt/example.srt', '',{ loop: true, skybox: true, toons:true, });
    // sceneManager.addScene('ressource/model/scene2/scene.gltf', 'ressource/srt/example.srt', '',{ loop: false, toons:true, });
    sceneManager.addScene('ressource/model/scene2/scene.gltf', 'ressource/srt/introduction.srt', '',{ loop: false, toons:true, });
    sceneManager.addScene('ressource/model/introduction/scene.gltf', 'ressource/srt/example.srt', '',{ loop: true, skybox: true, toons:false, fog: {color: 0xec9f53, near: 18, far: 200 }, });
    sceneManager.addScene('ressource/model/foret/scene.gltf', 'ressource/srt/example.srt', '',{ loop: true, skybox: true, toons:false, });

    // Load the first scene
    sceneManager.loadScene(
        sceneManager.scenes[0].gltfPath,
        sceneManager.scenes[0].srtPath,
        sceneManager.scenes[0].audioPath,
        sceneManager.scenes[0].params
    ).then(() => {
        sceneManager.eventEmitter.on("nextScene",(index) => {
            switch(index){
                case 1:
                    fadeOutTitle('.TitrePrincipale')
                    setTimeout(()=>{
                        fadeInTitle('.NrTitle')
                    },500)

                    break;
                case 3:
                    fadeOutTitle("#Chapitre")

                    setTimeout(()=>{
                        const chapitre = document.querySelector("#Chapitre")
                        chapitre.innerHTML = "Projet"
                        fadeInTitle("#Chapitre")
                    },3000)
                    break;
            }

        })
        animate();
    });

    function animate() {
        requestAnimationFrame(animate);
        sceneManager.update();
        renderer.render(sceneManager.currentScene.scene, camera);
    }
}

// // Ajouter un écouteur d'événement pour le bouton "Start" et le rendre invisible une fois l'animation lancée
// document.getElementById("startAnimation").addEventListener('click', function() {
//     startAnimation();
// });
startAnimation();