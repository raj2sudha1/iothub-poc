#!/bin/bash

git fetch --prune

UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")


if [ $LOCAL != $REMOTE ]; then
   # echo "Update available and downloading..."
    git reset --hard && git pull && npm install 
fi
