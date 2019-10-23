#!/bin/bash
git clone https://git.spaghet.us/ethsdev/kitcoin-app-cordova ../kitcoin-app-cordova || echo "Destination repository already exists"
ORIGINAL_PATH=$(pwd)
cd ../kitcoin-app-cordova
npm install
cordova build browser
cd $ORIGINAL_PATH
mkdir -p public
cp -r ../kitcoin-app-cordova/platforms/browser/www/* public
echo "Done, ready for deployment."
