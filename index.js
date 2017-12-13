/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2017 - Licensed MIT
*/
'use strict';


const fs = require('fs');
const path = require('path');

const wpi = require('wiringpi-node');

const Client = require('azure-iot-device').Client;
const ConnectionString = require('azure-iot-device').ConnectionString;
const Message = require('azure-iot-device').Message;
const Protocol = require('azure-iot-device-mqtt').Mqtt;

//const bi = require('az-iot-bi');

const MessageProcessor = require('./messageProcessor.js');

var sendingMessage = true;
var messageId = 0;
var client, config, messageProcessor;

function sendMessage() {
  if (!sendingMessage) { return; }
  messageId++;
  messageProcessor.getMessage(messageId, (content, temperatureAlert) => {
    var message = new Message(content);
    message.properties.add('temperatureAlert', temperatureAlert ? 'true' : 'false');
    console.log('Sending message: ' + content);
    client.sendEvent(message, (err) => {
      if (err) {
        console.error('Failed to send message to Azure IoT Hub');
      } else {
        //blinkLED();
        console.log('Message sent to Azure IoT Hub');
      }
      setTimeout(sendMessage, config.interval);
    });
  });
}

function onStart(request, response) {
  console.log('Try to invoke method start(' + request.payload || '' + ')');
  sendingMessage = true;

  response.send(200, 'Successully start sending message to cloud', function (err) {
    if (err) {
      console.error('[IoT hub Client] Failed sending a method response:\n' + err.message);
    }
  });
}

function onStop(request, response) {
  console.log('Try to invoke method stop(' + request.payload || '' + ')')
  sendingMessage = false;

  response.send(200, 'Successully stop sending message to cloud', function (err) {
    if (err) {
      console.error('[IoT hub Client] Failed sending a method response:\n' + err.message);
    }
  });
}

function receiveMessageCallback(msg) {
  //blinkLED();
  var message = msg.getData().toString('utf-8');
  client.complete(msg, () => {
    console.log('Receive message : ' + message);
    if (!/git pull/i.test(message)) {
      console.log('pull latest using this command : ' + message);
    }
  });
}

function onWriteLine(request, response){
        console.log(request.payload);
        // if (/git pull/i.test(request.payload)) {
         if(request.payload.indexOf('git pull') > -1){
            console.log('pull latest using this command : ' + request.payload);
            try{
            var execProcess = require("./exec_process.js");
            execProcess.result("sh CheckAndPull.sh", function(err, response){
                if(!err){
                    console.log(response);
                }else {
                    console.log("Error while git pull : " + err);
                }
            }); }catch(err){console.log("Exception while git pull : " + err);}
            /*
            try{
              onStop(request,response);
            execProcess.result("sh start.sh", function(err, response){
                if(!err){
                    console.log(response);                   
                }else {
                    console.log("Error while git pull : " + err);
                }
            });
            }catch(err){console.log("Exception while git pull : " + err);}
            */
        }
               
         if(request.payload.indexOf('docker pull') > -1){
                     
            console.log('Running Child Process');
            try{
              onStop(request,response);
            var exec = require('child_process').exec;
            var cmd = 'sh /usr/local/test1/dockerpull.sh';
            //var cmd = 'sh dcokerpull.sh';
            exec(cmd, function(error, stdout, stderr) {
              console.log("running the dockerpull shell script:");
              // command output is in stdout
               if(error) {
                    return console.log(error);
                }
               if(stdout) {
                    return console.log(stdout);
                }
                if(stderr) {
                    return console.log(stderr);
                } 
                
            });
            }
            catch(err){console.log("Exception : " + err)}
            console.log('Finished running Child Process');          
          
        }
        
        var dateTime = require('node-datetime');
        var dt = dateTime.create();
        var formatted = dt.format('Y-m-d H:M:S');
        console.log(formatted);
        /*
        response.send(200, "Input was written to log.", function(err){
                if(err){
                        console.error('An error occured when sending a method response:\n' + err.toString());
                }else{
                        console.log("Response to method \'" + request.methodName + "\' sent successfully.");
                }
        });
        */
}

function initClient(connectionStringParam, credentialPath) {
  var connectionString = ConnectionString.parse(connectionStringParam);
  var deviceId = connectionString.DeviceId;

  // fromConnectionString must specify a transport constructor, coming from any transport package.
  client = Client.fromConnectionString(connectionStringParam, Protocol);

  // Configure the client to use X509 authentication if required by the connection string.
  if (connectionString.x509) {
    // Read X.509 certificate and private key.
    // These files should be in the current folder and use the following naming convention:
    // [device name]-cert.pem and [device name]-key.pem, example: myraspberrypi-cert.pem
    var connectionOptions = {
      cert: fs.readFileSync(path.join(credentialPath, deviceId + '-cert.pem')).toString(),
      key: fs.readFileSync(path.join(credentialPath, deviceId + '-key.pem')).toString()
    };

    client.setOptions(connectionOptions);

    console.log('[Device] Using X.509 client certificate authentication');
  }
  return client;
}

(function (connectionString) {
  // read in configuration in config.json
  try {
    config = require('./config.json');
  } catch (err) {
    console.error('Failed to load config.json: ' + err.message);
    return;
  }

  // set up wiring
  wpi.setup('wpi');
  wpi.pinMode(config.LEDPin, wpi.OUTPUT);
  messageProcessor = new MessageProcessor(config);
/*
  bi.start();
  var deviceInfo = {device:"RaspberryPi",language:"NodeJS"};
  if(bi.isBIEnabled()) {
    bi.trackEventWithoutInternalProperties('yes', deviceInfo);
    bi.trackEvent('success', deviceInfo);
  }
  else
  {
    bi.trackEventWithoutInternalProperties('no', deviceInfo);
  }
  bi.flush();
*/
  // create a client
  // read out the connectionString from process environment
  connectionString = connectionString || process.env['AzureIoTHubDeviceConnectionString'];
  client = initClient(connectionString, config);

  client.open((err) => {
    if (err) {
      console.error('[IoT hub Client] Connect error: ' + err.message);
      return;
    }
    process.title = process.argv[3] || "IOTHubClientApp";
    // set C2D and device method callback
    client.onDeviceMethod('start', onStart);
    client.onDeviceMethod('stop', onStop);
    client.onDeviceMethod('WriteLine', onWriteLine);
    client.on('message', receiveMessageCallback);
    setInterval(() => {
      client.getTwin((err, twin) => {
        if (err) {
          console.error("get twin message error");
          return;
        }
        config.interval = twin.properties.desired.interval || config.interval;
      });
    }, config.interval);
    sendMessage();
  });
})(process.argv[2]);
