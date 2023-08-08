#!/bin/bash

# cp -R build/static ../backend/
# cp -R build/* ../backend/static/
mkdir ../backend/templates
# cp ../backend/static/index.html ../backend/templates
cp build/index.html ../backend/templates
sed -i -e 's#../manifest.json#../static/manifest.json#' ../backend/templates/index.html
rm -rf ../backend/static/index.html ../backend/templates/index.html-e ../backend/static/static build