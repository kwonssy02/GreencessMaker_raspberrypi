const setting = require('./setting.json');
const wateringInfo = require('./wateringInfo.json');
const fs = require('fs');
const server_url = setting.server_url;
const port = setting.port;
const deviceId = setting.deviceId;

var io = require('socket.io-client');
var socket = io.connect(server_url + ':' + port, {
	'reconnection': true,
    'reconnectionDelay': 5000
});

socket.on('connect', function(){
	console.log('connected');
    socket.emit('raspberrypi-join', deviceId);
    socket.emit('requestWateringInfo', deviceId);
});

socket.on('waterNowDevice', function() {
	console.log('WATER!!!!!!!!!!');
});

socket.on('respondWateringInfo', function(data) {
	console.log(data);
	console.log('mon: ' + data["mon"]);
	
	wateringInfo["mon"] = data["mon"];
	wateringInfo["tue"] = data["tue"];
	wateringInfo["wed"] = data["wed"];
	wateringInfo["thur"] = data["thur"];
	wateringInfo["fri"] = data["fri"];
	wateringInfo["sat"] = data["sat"];
	wateringInfo["sun"] = data["sun"];
	wateringInfo["amount"] = data["amount"];
	wateringInfo["hour"] = data["hour"];
	wateringInfo["minute"] = data["minute"];
	wateringInfo["status"] = data["status"];	

	saveWateringInfo(wateringInfo);
});

socket.on('updateWateringInfo', function(data) {
	console.log('updateWateringInfo!!!!');
});

var i = 1;

setInterval(function(){
	if(socket.connected) {
		i++;
		var deviceInfo = {};
		deviceInfo["deviceId"] = deviceId;
		deviceInfo["temperature"] = 10+i;
		deviceInfo["humidity"] = 20+i;
		deviceInfo["light"] = 30+i;
		deviceInfo["waterHeight"] = 40+i;
		//console.log(deviceInfo);
		socket.emit('updateDeviceInfo', deviceInfo);
	}
}, 5000);







function imageUpload() {
	// 이미지 파일을 라즈베리파이에서 만들어낸다...

	if(socket.connected) {
		fs.readFile('image.png', function(err, buf){
	    	// it's possible to embed binary data
	    	// within arbitrarily-complex objects
	    	socket.emit('image', { image: true, buffer: buf });
	  	});
	}
}

imageUpload();

setInterval(function() {
	imageUpload();	
}, 1000*60*60*24);


function saveWateringInfo(jsonSetting) {
	
	fs.writeFile("./wateringInfo.json", JSON.stringify(jsonSetting), function(err) {
	    if(err) {
	      return console.log(err);
	    }
	 
	    console.log("The file is saved successfully");
  });
}


// 1000*60*60*24