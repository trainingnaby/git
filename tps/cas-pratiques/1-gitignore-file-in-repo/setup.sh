#!/bin/bash

rm -rf tp-git-ignore-probleme
mkdir tp-git-ignore-probleme
cd tp-git-ignore-probleme

git init

mkdir -p config src

echo "API_KEY=dev-token-12345" > config/local.env
echo "console.log('Hello world');" > src/app.js

git add .
git commit -m "Initial commit avec fichier local.env suivi par Git"

# Ajout du .gitignore après coup
echo "config/local.env" > .gitignore
git add .gitignore
git commit -m "Ajout de .gitignore pour ignorer config/local.env"

echo "Projet prêt. Le fichier config/local.env est toujours suivi malgré le .gitignore"
