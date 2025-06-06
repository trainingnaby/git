#!/bin/bash
rm -rf .git
git init

# Commit 1 => version correcte
cat > compute.py <<EOF
def compute():
    return 1 + 2  # cette calcul est celui attendu

if __name__ == "__main__":
    print(compute())
EOF
git add compute.py
git commit -m "v1: version avec bon calcul"

# Commits 2 à 4 : refactor
for i in 2 3 4
do
    echo "# Refactor v$i" >> compute.py
    git commit -am "v$i: refactor"
done

# Commit 5 : on introduit un bug
cat > compute.py <<EOF
def compute():
    return 1 - 2  # Bug introduit en faussant le calcul initial attendu (1+2)

if __name__ == "__main__":
    print(compute())
EOF
git commit -am "v5: bug introduit"

# Commits 6 à 9
for i in 6 7 8 9
do
    echo "# petite modification $i" >> compute.py
    git commit -am "v$i: autres modifications"
done

git commit --allow-empty -m "v10: release candidate"
