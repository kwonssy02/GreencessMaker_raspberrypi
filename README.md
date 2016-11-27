# GreencessMaker_raspberrypi
그린세스메이커의 라즈베리파이 소스코드입니다. (nodejs)

## Description
**그린세스메이커**의 라즈베리파이 소스코드입니다.

## Installation
아래의 npm module들은 라즈베리파이에서만 설치될 수 있습니다.
```console
npm install
npm install rpi-gpio
npm install raspicam
npm install node-dht-sensor
```

## Setting 파일 생성
```console
cp setting_sample.json setting.json
```
생성 후 setting.json 내 변수를 수정한다.

## To run
gpio에 접근하기 위해서 root 권한이 필요하기 때문에 sudo를 사용합니다.
```console
sudo node index.js
```


By [Hyukchan Kwon](https://github.com/kwonssy02).