#!/bin/bash

rm -rf tp-git-rebase-onto
mkdir tp-git-rebase-onto
cd tp-git-rebase-onto

git init

# Commits A → D sur rédaction-main
echo "Début" > base.txt
git add base.txt
git commit -m "A"

echo "Étape B" >> base.txt
git commit -am "B"

echo "Étape C" >> base.txt
git commit -am "C"

echo "Étape D" >> base.txt
git commit -am "D"
git branch rédaction-main

# Branche suggestions (E, F, G)
git checkout -b suggestions
echo "Ajout de suggestions" > suggestions.txt
git add suggestions.txt
git commit -m "E - ajout de suggestions"

echo "Algorithme amélioré" >> suggestions.txt
git commit -am "F - amélioration suggestions"

echo "Réglages UX" >> suggestions.txt
git commit -am "G - fin suggestions"

# Branche correction-typo à partir de E
git checkout -b correction-typo HEAD~2
echo "Fix typo 1" > typo.txt
git add typo.txt
git commit -m "H - fix affichage typo"

echo "Fix typo 2" >> typo.txt
git commit -am "I - fix supplémentaire typo"

echo "Projet prêt. Vous êtes sur la branche correction-typo avec deux commits à rebaser sur rédaction-main sans embarquer les suggestions."
echo "Objectif : Utiliser git rebase --onto pour repositionner H et I directement au-dessus de D."
