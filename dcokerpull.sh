#!/bin/bash

/usr/bin/docker pull raj2sudha/iothub-poc:latest
#docker stop iothub-poc
#docker rm iothub-poc
#docker run --rm --privileged --name iothub-poc -v /var/run/docker.sock:/var/run/docker.sock -v $(which docker):/bin/docker -it raj2sudha/iothub-poc:latest
#docker run --rm --privileged --name iothub-poc -v /var/run/docker.sock:/var/run/docker.sock -v /usr/bin/docker:/usr/bin/docker -v /usr/lib/arm-linux-gnueabihf/libltdl.so.7:/usr/lib/arm-linux-gnueabihf/libltdl.so.7 -it raj2sudha/iothub-poc:latest
