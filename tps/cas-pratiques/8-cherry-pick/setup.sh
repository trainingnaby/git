#!/bin/bash

rm -rf tp-git-cherry-pick
mkdir tp-git-cherry-pick
cd tp-git-cherry-pick

git init

# Base commune
echo "# Dashboard principal" > main.py
git add main.py
git commit -m "Initialisation du tableau de bord"

# Création des branches de fonctionnalité
git checkout -b module-auth
echo "# Authentification" > auth.py
git add auth.py
git commit -m "Ajout du module d'authentification"

git checkout master
git checkout -b module-graph
echo "# Graphiques" > graph.py
git add graph.py
git commit -m "Ajout du module graphique"

git checkout master
git checkout -b module-export
echo "# Export - partie 1" > export.py
git add export.py
git commit -m "Début du module d'export"

echo "# Export - partie 2" >> export.py
git add export.py
git commit -m "Finalisation du module d'export"

# Création de la branche de base
git checkout master
git checkout -b dashboard-main

echo "Projet prêt. Les fonctionnalités sont dans 3 branches locales (module-auth, module-graph, module-export)."
echo "Objectif : appliquer les commits de ces branches dans dashboard-main en un commit propre chacun (via cherry-pick)."
