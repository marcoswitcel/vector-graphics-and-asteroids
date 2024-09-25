#!/usr/bin/bash

LINE="========================================="

echo "git checkout gh-pages"
git checkout gh-pages
echo $LINE

echo "git pull origin main"
git pull origin main
echo $LINE

echo "npm run build"
npm run build
echo $LINE

echo "git add public/* -f"
git add public/* -f
echo $LINE

echo "git commit -m "nova versão...""
git commit -m "nova versão..."
echo $LINE

echo "git push"
git push
echo $LINE

echo "git checkout main"
git checkout main
echo $LINE
