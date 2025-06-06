#!/bin/bash

rm -rf tp-git-hook-todo
mkdir tp-git-hook-todo
cd tp-git-hook-todo

git init

# Création d’un fichier avec un TODO
echo "// TODO: corriger le calcul" > calcul.js
git add calcul.js

# Création du hook pre-commit fonctionnel
cat <<'EOF' > .git/hooks/pre-commit
#!/bin/bash

echo "Vérification des TODO/FIXME en cours..."

# Flag d'erreur
todo_found=0

# Parcours des fichiers stagés
for file in $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.js$'); do
  if grep -nE 'TODO|FIXME' "$file"; then
    echo "Le fichier $file contient un TODO ou FIXME."
    todo_found=1
  fi
done

if [ $todo_found -eq 1 ]; then
  echo "Commit bloqué : des TODO ou FIXME sont présents."
  exit 1
fi

exit 0
EOF

# Donner les droits d'exécution au hook
chmod +x .git/hooks/pre-commit

echo "Projet prêt."
echo "Un hook pre-commit est installé pour empêcher les commits contenant des TODO ou FIXME."
echo "Essayez maintenant de committer le fichier :"
echo "    git commit -m 'Test commit avec TODO'"
