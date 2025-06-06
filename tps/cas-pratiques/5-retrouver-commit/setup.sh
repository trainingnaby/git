#!/bin/bash

rm -rf tp-git-reflog-restore
mkdir tp-git-reflog-restore
cd tp-git-reflog-restore

git init

# Étape 1 : Premier commit avec la bonne version
echo "// Version initiale du module de reconnaissance vocale" > speech.js
echo "function recognize() { console.log('Start speech recognition'); }" >> speech.js

git add speech.js
git commit -m "Implémentation de la reconnaissance vocale"

# Création de la branche
git branch voix-v1

# Étape 2 : Modification erronée puis amend
echo "// Mauvaise version, cassée" > speech.js
echo "function broken() { console.log('Oops'); }" >> speech.js

git add speech.js
GIT_COMMITTER_DATE="$(date)" git commit --amend --no-edit

echo "Projet prêt. Vous avez remplacé accidentellement un commit important avec git commit --amend."
echo "Objectif : retrouver la version originale grâce à git reflog et la restaurer sur la branche voix-v1."
