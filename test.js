const deviceId = 1;
const setting = require('./setting.json');
const fs = require('fs');
const server_url = setting.server_url;
// const server_url = 'http://ec2-52-78-120-48.ap-northeast-2.compute.amazonaws.com';
const port = 8081;

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

socket.on('respondWateringInfo', function(wateringInfo) {
	console.log(wateringInfo);
	console.log('mon: ' + wateringInfo["mon"]);
	
	setting["mon"] = 1;
	saveSetting(setting);
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


function saveSetting(jsonSetting) {
	
	fs.writeFile("./setting.json", JSON.stringify(jsonSetting), function(err) {
	    if(err) {
	      return console.log(err);
	    }
	 
	    console.log("The file is saved successfully");
  });
}


// 1000*60*60*24