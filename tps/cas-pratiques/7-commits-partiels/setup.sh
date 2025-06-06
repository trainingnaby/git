#!/bin/bash

rm -rf tp-git-partial-staging
mkdir tp-git-partial-staging
cd tp-git-partial-staging

git init

# Création d’un fichier avec plusieurs blocs logiques
cat <<EOF > analyse.py
# Tache 1
def nettoyer_donnees():
    print("Nettoyage des données...")

# Tache 1
def analyser_tendance():
    print("Analyse des tendances...")

# Tache 2
def generer_rapport():
    print("Génération du rapport...")

# Autres fonctions
def exporter_resultats():
    print("Export en cours...")
EOF

# Simuler que le fichier est en cours de modification
git add .
git commit -m "Création initiale (vide)"
echo "# Tache 1 - mise à jour" >> analyse.py
echo "# Tache 2 - mise à jour" >> analyse.py

echo "Projet prêt. Le fichier analyse.py contient plusieurs blocs mélangés."
echo "Objectif : Commitez uniquement les lignes 'Tache 1' dans un premier commit, et le reste dans un second."
