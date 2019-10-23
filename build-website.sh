#!/bin/bash
git clone https://git.spaghet.us/ethsdev/kitcoin-app-cordova ../kitcoin-app-cordova || echo "Destination repository already exists"
ORIGINAL_PATH=$(pwd)
cd ../kitcoin-app-cordova
npm install
echo "ATTENTION: You'll need to edit config.json to match where you're deploying this."
sleep 2
cp www/config.json www/config.json.bkp
nano www/config.json
cordova build browser
mv www/config.json.bkp www/config.json
cd $ORIGINAL_PATH
rm -r public
mkdir -p public
cp -r ../kitcoin-app-cordova/platforms/browser/www/* public
echo "Done, ready for deployment."
