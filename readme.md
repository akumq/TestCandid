# Description du Projet

Ce projet est une application de scène 3D qui utilise la bibliothèque Three.js pour charger et afficher des modèles 3D, animer les positions de la caméra et afficher des sous-titres. L'application prend en charge plusieurs scènes, chacune avec son propre modèle 3D, ses sous-titres et ses clés de caméra.

## Fichiers

- `scene.js`: Contient la logique principale pour le chargement et la gestion des scènes, y compris la classe `Scene`, la gestion des clés de caméra, l'analyse et l'affichage des sous-titres.
- `main.js`: Initialise le moteur de rendu Three.js et la scène, crée des instances de la classe `Scene` pour chaque scène et gère le changement de scène et l'animation.
- `index.html`: Le fichier HTML principal qui inclut les scripts et les styles nécessaires pour l'application.
- `ressource/`: Contient diverses ressources telles que des modèles 3D, des fichiers de sous-titres et des images de skybox.

## Utilisation

1. Ouvrez `index.html` dans un navigateur web.
2. L'application chargera la première scène et affichera le modèle 3D correspondant, les sous-titres et animera la position de la caméra en fonction des clés de caméra.
3. Après la fin de la première scène, l'application passera à la deuxième scène et répétera le processus.

## Fonctionnalités

- Charger et afficher des modèles 3D à l'aide de GLTFLoader.
- Extraire les positions de la caméra de la scène et créer des clés de caméra.
- Animer la position de la caméra en fonction des clés de caméra à l'aide de la bibliothèque GSAP.
- Analyser les fichiers de sous-titres SRT et afficher les sous-titres au moment approprié.
- Charger et définir les images de skybox.
- Basculer entre plusieurs scènes et décharger la scène actuelle avant de charger la nouvelle.
- Gérer les événements de redimensionnement de la fenêtre pour mettre à jour le rapport d'aspect de la caméra et la taille du moteur de rendu.

## Dépendances

- Three.js (v0.121.1)
- GSAP (GreenSock Animation Platform)
- jQuery (pour l'affichage des sous-titres)

## Licence

Ce projet est sous licence [MIT License](LICENSE).
