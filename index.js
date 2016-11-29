const setting = require('./setting.json');
const wateringInfo = require('./wateringInfo.json');
const fs = require('fs');
const server_url = setting.server_url;
const port = setting.port;
const deviceId = setting.deviceId;

var io = require('socket.io-client');
var gpio = require('rpi-gpio');
var RaspiCam = require('raspicam');
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


// 센서값이 변경되었을 때..?
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

var Gpio =require('pigpio').Gpio;

var led = new Gpio(23, {mode: Gpio.OUTPUT});

var brightness = 100;
led.pwmWrite(brightness);

/*
//	blink led
setInterval(loop,16);
function loop(){
	var i=0;
	brightness = Math.sin(((Date.now()/16)+(i*5))*0.2)*0.5 + 0.5;
	brightness *= brightness*brightness;
	brightness = Math.floor(brightness*255);
	led.pwmWrite(brightness);
}
*/


const waterPin = 15;
const buttonPin = 11;

gpio.setup(waterPin, gpio.DIR_OUT, function(err, value) {
	console.log(err);
	gpio.write(waterPin, true, function(err, value) {
		// console.log('water motor set to TRUE');
	});
});


var lastVal = false; 

gpio.setup(buttonPin, gpio.dir_in, function() {
	setInterval(function() {
		gpio.read(buttonPin, function(err, value) {
			if(lastVal == false && value == true) {
				/*
				console.log('button clicked!!!!!!');
				gpio.write(waterPin, false, function(err, value) {
					console.log('watering!!!!!');
				});
				*/

				gpio.write(waterPin, false, function(err, value) {
					sleep(3000, function() {
						gpio.write(waterPin, true, function(err, value){
							console.log('water finish!!!!!');	
						});
					});
				});
			}
			lastVal = value;
		});
	});
});



function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
}

// 소켓을 연결한다. 커넥트되지 않았을 때 5초에 한번씩 재연결 요청.
var socket = io.connect(server_url + ':' + port, {
	'reconnection': true,
    'reconnectionDelay': 5000
});

socket.on('connect', function(){
	console.log('connected');
    socket.emit('raspberrypi-join', deviceId);
    socket.emit('requestWateringInfo', deviceId);
    imageUpload();
});

socket.on('waterNowDevice', function() {
	gpio.write(waterPin, false, function(err, value) {
		sleep(3000, function() {
			gpio.write(waterPin, true, function(err, value){
				console.log('water finish!!!!!');	
			});
		});
	});
});

socket.on('respondWateringInfo', function(data) {
	console.log(data);
	
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




var photo_path = __dirname+"/photo/img.jpg";
var currTime = new Date().getTime();		
var pictureFilename = photo_path;

var opts = {
	mode : 'photo',
	encoding : 'jpg',
	quality : 100,
	width : 640,
	height : 480,
	output : pictureFilename
	// timeout : 1
};

var camera = new RaspiCam(opts);

function imageUpload() {
	// 이미지 파일을 라즈베리파이에서 만들어낸다...

	if(socket.connected) {
		// camera fuction
		currTime = new Date().getTime();
		var process_id = camera.start(opts);

		camera.on("exit", function(){ 
			console.log('Photo Saved : ', photo_path);

			fs.readFile(photo_path, function(err, buf){
				if(err) 
					console.log(err);
		    	// it's possible to embed binary data
		    	// within arbitrarily-complex objects
		    	socket.emit('image', { image: true, buffer: buf });
		    	
		  	});
		});
		

		
	}
}

// imageUpload();

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

var time = {	
	timer : function(){
		var lastDate;
		var lastHour;
		var lastMinute;
		setInterval(function(){
			var t = new Date();
			var nowDate;
			// {"mon":0,"tue":1,"wed":1,"thur":1,"fri":1,"sat":1,"sun":1,"amount":62,"hour":121,"minute":3,"status":1}
			switch(t.getDay()) {
				case 0 :
					nowDate = "sun";
					break;
				case 1 :
					nowDate = "mon";
					break;
				case 2 :
					nowDate = "tue";
					break;
				case 3 :
					nowDate = "wed";
					break;
				case 4 :
					nowDate = "thur";
					break;
				case 5 :
					nowDate = "fri";
					break;
				case 6 :
					nowDate = "sat";
					break;
			}

			var nowHour = t.getHours();
			var nowMinute = t.getMinutes();
			console.log('Now : '+ nowDate + ' ' + nowHour + ':' + nowMinute);
			if(wateringInfo.status == 1) {
				if(!(lastDate==nowDate && lastHour==nowHour && lastMinute==nowMinute)){
					if(wateringInfo[nowDate] == 1){
						if(nowHour == wateringInfo["hour"]){
							if(nowMinute == wateringInfo["minute"]){
								console.log('minute : ' + nowMinute);
								lastDate = nowDate;
								lastHour = nowHour;
								lastMinute = nowMinute;
								console.log('Alarm!!!! : '+ nowDate + ' ' + nowHour + ':' + nowMinute);
								gpio.write(waterPin, false, function(err, value) {
									sleep(3000, function() {
										gpio.write(waterPin, true, function(err, value){
											console.log('water finish!!!!!');	
										});
									});
								});
							}
		
						}
		
					}
				}
			}
			
		}, 3000);	
	}
};

time.timer();

// 1000*60*60*24