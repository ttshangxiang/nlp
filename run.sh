
#!/bin/bash

./node_modules/.bin/rimraf ./dist/*
./node_modules/.bin/webpack
./node_modules/.bin/pm2 delete nlp
./node_modules/.bin/pm2 start server.js --name "nlp" -i 4