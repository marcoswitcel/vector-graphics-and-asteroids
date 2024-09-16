
git checkout gh-pages
git pull origin main
npm run build
git add public/* -f
git commit -m "nova versão..."
git push
git checkout main