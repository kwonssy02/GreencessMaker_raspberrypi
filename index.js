const deviceId = 1;
// const server_url = 'http://localhost';
const server_url = 'http://ec2-52-78-120-48.ap-northeast-2.compute.amazonaws.com';
const port = 8081;

var fs = require('fs');
var io = require('socket.io-client');
var gpio = require('rpi-gpio');
var sensorLib = require('node-dht-sensor');
var sensor = {
	initialize : function(){
		return sensorLib.initialize(11,18);
	},

	read:function(){
		var readout = sensorLib.read();
		
		console.log('Temperature:' + readout.temperature.toFixed(2)+'C,'		+'humidity:'+readout.humidity.toFixed(2)+'%');
	
		//setTimeout(sensor.read(),500);	// continued fuction
	}
};
sensor.initialize();

var exec_photo = require('child_process').exec;
var photo_path = __dirname+"/photo/img.jpg";
var cmd_photo = 'raspistill -o '+photo_path;

gpio.on('change', function(channel, value) {
	if(value ==1){
		
		console.log('Channel ' + channel + ' value is now ' + value);
		
		// camera fuction
		/*
		exec_photo(cmd_photo, function(error, stdout, stderr){
			console.log('Photo Saved : ', photo_path);
		});
		*/
	}
});

gpio.setup(11, gpio.DIR_IN, gpio.EDGE_BOTH);




var socket = io.connect(server_url + ':' + port, {
	'reconnection': true,
    'reconnectionDelay': 5000
});

socket.on('connect', function(){
	console.log('connected');
    socket.emit('raspberrypi-join', deviceId);
});

socket.on('waterNowDevice', function() {
	console.log('WATER!!!!!!!!!!');
});


setInterval(function(){
	if(socket.connected) {
		var deviceInfo = {};
		deviceInfo["deviceId"] = deviceId;
		deviceInfo["temperature"] = sensorLib.read().temperature.toFixed(2);
		deviceInfo["humidity"] = sensorLib.read().humidity.toFixed(2);
		deviceInfo["light"] = 0;
		deviceInfo["waterHeight"] = 0;

		console.log(deviceInfo);
		socket.emit('updateDeviceInfo', deviceInfo);
	}
}, 5000);







function imageUpload() {
	// 이미지 파일을 라즈베리파이에서 만들어낸다...

	if(socket.connected) {
		exec_photo(cmd_photo, function(error, stdout, stderr){
			console.log('Photo Saved : ', photo_path);
			fs.readFile(photo_path, function(err, buf){
		    	// it's possible to embed binary data
		    	// within arbitrarily-complex objects
		    	socket.emit('image', { image: true, buffer: buf });
		  	});
		});

		
	}
}

imageUpload();

setInterval(function() {
	imageUpload();	
}, 5000);


// 1000*60*60*24