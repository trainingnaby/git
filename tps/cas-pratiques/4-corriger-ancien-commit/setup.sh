#!/bin/bash

rm -rf tp-git-fix-old-commit
mkdir tp-git-fix-old-commit
cd tp-git-fix-old-commit

git init

# 1er commit avec la faute
echo "<h1>Welcome to our wordl!</h1>" > accueil.html
git add accueil.html
git commit -m "Ajout de la page d'accueil"

# 2e commit
echo "<footer>Contactez-nous</footer>" >> accueil.html
git add accueil.html
git commit -m "Ajout du pied de page"

echo "Projet prêt. Une faute 'wordl' se trouve dans un ancien commit."
echo "Objectif : corriger cette faute directement dans le commit d'origine."
