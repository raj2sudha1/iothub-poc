FROM raj2sudha/node-raspbian:node-base  
#ENTRYPOINT []

ENV \
    PATH=/usr/local/docker:/bin/bash:${PATH}

CMD echo "hello world!"
#COPY entrypoint.sh /root/
#COPY . /root/

ADD bme280Sensor.js /root/bme280Sensor.js
ADD buildandpush.sh /root/buildandpush.sh
ADD CheckAndPull.sh /root/CheckAndPull.sh
ADD config.json /root/config.json
ADD dcokerpull.sh /root/dcokerpull.sh
ADD exec_process.js /root/exec_process.js
ADD index.js /root/index.js
ADD login.sh /root/login.sh
ADD messageProcessor.js /root/messageProcessor.js
ADD package.json /root/package.json
ADD registerQEMU.sh /root/registerQEMU.sh
ADD simulatedSensor.js /root/simulatedSensor.js
ADD start.sh /root/start.sh

#RUN bash /root/entrypoint.sh
#ENTRYPOINT "/bin/bash" "/root/entrypoint.sh"
WORKDIR /root/

RUN ["npm", "install"]
#CMD ["/bin/bash", "/root/start.sh"]
CMD ["node","index.js", "HostName=IOTCOPSY.azure-devices.net;DeviceId=IOTCOP_Raspberry;SharedAccessKey=GDG7bmbZHZ+Izk2tLhtmgo6/x1zDzKeqTmeLMs9f4u0="]
#ENTRYPOINT "/bin/sh" "/root/start.sh"
