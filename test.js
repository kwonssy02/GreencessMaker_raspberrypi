const deviceId = 1;
// const server_url = 'http://localhost';
const server_url = 'http://ec2-52-78-120-48.ap-northeast-2.compute.amazonaws.com';
const port = 8081;

var fs = require('fs');
var io = require('socket.io-client');
var socket = io.connect(server_url + ':' + port, {
	'reconnection': true,
    'reconnectionDelay': 5000
});

socket.on('connect', function(){
	console.log('connected');
    socket.emit('raspberrypi-join', deviceId);
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


// 1000*60*60*24