
npm run dist
./node_modules/.bin/pm2 delete nlp
./node_modules/.bin/pm2 start server.js --name "nlp"