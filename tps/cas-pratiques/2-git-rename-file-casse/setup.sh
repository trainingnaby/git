#!/bin/bash

rm -rf tp-git-rename-casse
mkdir tp-git-rename-casse
cd tp-git-rename-casse

git init

# Création d’un fichier avec mauvaise casse
echo "Instructions pour installer l'application." > GuideInstallation.txt

git add GuideInstallation.txt
git commit -m "Ajoute le fichier GuideInstallation.txt (mauvaise casse)"

echo "Projet prêt. Le fichier GuideInstallation.txt a été committé avec une casse incorrecte."
echo "Objectif : le renommer en guideinstallation.txt selon les bonnes pratiques."
