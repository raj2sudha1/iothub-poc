#!/bin/bash
echo " register qemu in build agent"

docker run --rm --privileged multiarch/qemu-user-static:register --reset

echo “———————————-”

echo “current dir: ”

echo $PWD

echo “———————————-”

echo “starting build”

echo “docker build –t raj2sudha/iothub-poc .”

docker build -t raj2sudha/iothub-poc .

echo “———————————-”

echo “Pushing image to repository”

#docker login -u=raj2sudha –password=Sriramsri@1 https://registry-1.docker.io/v2/
docker --version
docker login -u=raj2sudha -p=Sriramsri@1

docker push raj2sudha/iothub-poc:latest

echo “———————————-”

echo “Clean up – Logout and remove image”

docker logout