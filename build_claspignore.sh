#!/bin/bash
echo "**/**" > .claspignore
echo "!appsscript.json" >> .claspignore
find . -name "claspignore-template" | xargs cat >> .claspignore
