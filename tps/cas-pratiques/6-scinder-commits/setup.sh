#!/bin/bash

rm -rf tp-git-split-commit
mkdir tp-git-split-commit
cd tp-git-split-commit

git init

# Création des deux fichiers
echo "// moteur du jeu" > moteur.js
echo "function startGame() { console.log('Game started'); }" >> moteur.js

echo "// interface utilisateur" > interface.js
echo "function renderUI() { console.log('UI loaded'); }" >> interface.js

# Ajout en un seul commit (erreur volontaire)
git add moteur.js interface.js
git commit -m "Ajout des fichiers initiaux"

echo "Projet prêt. Les fichiers moteur.js et interface.js ont été committés ensemble par erreur."
echo "Objectif : séparer ce commit en deux commits distincts pour plus de clarté."
