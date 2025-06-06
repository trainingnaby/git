#!/bin/bash

rm -rf tp-git-modif-date
mkdir tp-git-modif-date
cd tp-git-modif-date

git init

# Création d’un fichier "livrable"
echo "Rapport mensuel du projet Alpha - mai 2024" > rapport_mensuel.md

git add rapport_mensuel.md
git commit -m "Ajoute le rapport mensuel (trop tardivement)"

echo "Projet prêt. Le rapport a été committé aujourd'hui, mais il aurait dû l'être le 25 mai."
echo "Objectif : modifier la date du dernier commit pour la faire correspondre à cette date."
