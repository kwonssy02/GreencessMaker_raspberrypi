const deviceId = 2;
const server_url = 'http://localhost';
const port = 8081;

var io = require('socket.io-client');
var socket = io.connect(server_url + ':' + port, {
	'reconnection': true,
    'reconnectionDelay': 5000
});

socket.on('connect', function(){
	console.log('connected');
    socket.emit('join', deviceId);
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
