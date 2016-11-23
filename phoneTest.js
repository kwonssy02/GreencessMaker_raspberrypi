const deviceId = 2;
const server_url = 'http://localhost';
const port = 8081;

var fs = require('fs');
var io = require('socket.io-client');
var socket = io.connect(server_url + ':' + port, {
	'reconnection': true,
    'reconnectionDelay': 5000
});

socket.on('connect', function(){
	console.log('connected');
    socket.emit('phone-join', 'kwonssy02');
    //socket.emit('phone-socket', deviceId);
    socket.emit('waterNow', deviceId);
});

socket.on('DeviceInfo', function(data) {
	console.log(data);
});






