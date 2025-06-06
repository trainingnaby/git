#!/bin/bash

rm -rf tp-git-reset-soft
mkdir tp-git-reset-soft
cd tp-git-reset-soft

git init

# Fichier normal
echo "Code de connexion" > login.js
git add login.js

# Fichier temporaire de debug
echo "console.log('debug')" > debug_temp.js
git add debug_temp.js

git commit -m "Fix du bug de connexion + debug temporaire"

echo "Projet prêt. Vous avez committé login.js ET debug_temp.js dans le même commit."
echo "Objectif : supprimer ce commit tout en conservant les fichiers modifiés pour re-stager proprement."
