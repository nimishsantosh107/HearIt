const express = require('express');
const socketIO = require('socket.io');
const socketIOC = require('socket.io-client');
const http = require('http');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v4');

//CONFIG VARIABLES
const PORT = process.env.PORT || 3000;
const IP4 = "10.20.10.18";
const ServerIP = "10.20.10.227";

var app = express();
var httpServer = http.Server(app);

//INIT
var basestations = [];
var STATION_NAME = "A";

//DATA ARRAY
var dataArr = [];

//SOCKET ROUTES
var iocc = socketIOC(`http://${ServerIP}:3000`);
iocc.on('connect',()=>{
	console.log('CONNECTED TO MAIN');

	//JOIN ROOM
	iocc.emit('baseStationReport',{station: STATION_NAME});

	//RECV DATA
	iocc.on('newBaseStation', (data)=>{
		if(data.station !== STATION_NAME){
			console.log('NEW ',data);
			basestations.push(data.station);			
		}
	});

	//INCOMING DATA FROM BASE STATION
	iocc.on('dataIncoming', (data)=>{
		if(data.station === STATION_NAME)
			return;

		console.log('INCOMING',data);
		var transmitOBJ = data;
		var transmitJSON = JSON.stringify(transmitOBJ);
		fs.writeFile('transmit.json', transmitJSON, 'utf8', (err)=>{console.log('ERR');});
	});

	iocc.on('leaveBaseStation', (data)=>{
		basestations = basestations.filter(x=>x !== data.station);
	});
});

//DETECT FILE CHANGE
fs.watchFile("data.json",(curr,prev)=>{
	try {
		fs.readFile("data.json", 'utf-8', (err,data)=>{
			var localOBJ = JSON.parse(data);
			if(dataArr.indexOf(localOBJ.data.data) !== -1)
				return;
			console.log(localOBJ);
			dataArr.push(localOBJ.data.data);
			//EMIT DATA TO MAIN SERVER
			iocc.emit('chirp', localOBJ.data)
		});
	} catch(e) { /*IGNORE e*/ }
});


//SERVER UP
httpServer.listen(PORT, IP4, ()=>{console.log(`HTTP BASE-SERVER UP ON PORT: ${PORT}`);});