Voici un README technique plus détaillé pour votre projet Three.js :

# Projet Three.js - Système de Scènes Interactives

## Description

Ce projet est une application web complexe qui utilise la bibliothèque Three.js pour créer une expérience immersive composée de plusieurs scènes 3D interconnectées. Les principales fonctionnalités incluent :

- Chargement de scènes 3D à partir de fichiers GLTF
- Gestion fluide de la transition entre les scènes
- Lecture synchronisée d'audio et de sous-titres pour chaque scène
- Contrôle dynamique du volume audio
- Caméra avec animation par keyframes

La structure du projet a été conçue pour être modulaire et extensible, permettant aux développeurs d'ajouter facilement de nouvelles fonctionnalités.

## Architecture

Le projet est organisé en plusieurs modules interdépendants :

1. **main.js** : Point d'entrée de l'application, responsable du lancement de l'animation et de la gestion globale de l'expérience.
2. **scene.js** : Définit la classe `Scene` qui encapsule tous les éléments d'une scène 3D (modèle, caméra, audio, sous-titres, etc.) et gère leur comportement.
3. **volumeManager.js** : Implémente un gestionnaire de volume audio centralisé, permettant un contrôle précis du volume dans l'ensemble de l'application.
4. **eventEmitter.js** : Fournit un simple système d'événements custom pour la communication entre les différents modules.
5. **sceneManager.js** : Coordonne le chargement et la transition entre les différentes scènes, en s'appuyant sur la classe `Scene`.

### Classe `Scene`

La classe `Scene` est le cœur du système et gère tous les aspects d'une scène 3D, notamment :

- Chargement du modèle 3D à partir d'un fichier GLTF
- Gestion de la caméra et de son animation par keyframes
- Lecture synchronisée de l'audio et des sous-titres associés
- Hooks pour les événements de fin de scène, de clic utilisateur, etc.

Elle s'appuie sur les bibliothèques Three.js, gsap (pour l'animation de la caméra) et sur un système d'événements custom implémenté dans `eventEmitter.js`.

### Classe `SceneManager`

Le `SceneManager` est responsable de la gestion du flux de navigation entre les différentes scènes. Il gère le chargement, la transition et le déchargement des scènes, en s'appuyant sur la classe `Scene`. Il expose également des méthodes permettant d'ajouter de nouvelles scènes et de passer d'une scène à l'autre.

### Classe `VolumeManager`

Le `VolumeManager` est un singleton qui centralise la gestion du volume audio de l'application. Il permet de créer et de contrôler dynamiquement le volume des différentes pistes audio utilisées dans les scènes.

## Utilisation

1. Clonez le dépôt Git sur votre machine.
2. Installez les dépendances si nécessaire (Three.js, gsap, etc.).
3. Démarrez un serveur web local pour servir les fichiers du projet.
4. Ouvrez l'application dans votre navigateur.

## Personnalisation et extensibilité

Pour personnaliser l'expérience ou ajouter de nouvelles fonctionnalités, les développeurs peuvent :

- Ajouter de nouvelles scènes en modifiant le fichier `main.js`.
- Ajuster les paramètres de chaque scène (skybox, brouillard, animation en boucle, etc.) dans le fichier `scene.js`.
- Étendre les classes existantes (Scene, SceneManager, VolumeManager) pour ajouter de nouvelles fonctionnalités.
- Intégrer de nouvelles bibliothèques ou fonctionnalités (interactions utilisateur, effets visuels, etc.) en les important dans les modules appropriés.

La structure modulaire du projet facilite grandement l'ajout de nouvelles fonctionnalités et l'évolutivité de l'application à long terme.

## Contribution

Les contributions des développeurs sont les bienvenues ! N'hésitez pas à signaler les bugs, à proposer des améliorations ou à soumettre des pull requests.

Ce projet est sous licence [MIT License](LICENSE).
