const express = require('express');
const socketIO = require('socket.io');
const socketIOC = require('socket.io-client');
const http = require('http');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v4');

//CONFIG VARIABLES
const PORT = process.env.PORT || 3000;
const IP4 = "192.168.1.100";
const ServerIP = "192.168.1.11";

var app = express();
var httpServer = http.Server(app);

//SOCKET ROUTES
var iocc = socketIOC(`http://${ServerIP}:3000`);
iocc.on('connect',()=>{
	console.log('CONNECTED TO MAIN');

	//RECV DATA MAYBE
});

//CHECKING CHANGES IN LOCAL FILE
var curID = "";
setInterval(()=>{
	fs.readFile("./data.json", 'utf-8', (err,data)=>{
		if(err) {console.log(err);}
		else {
			try {
				var localOBJ = JSON.parse(data);
				if(curID !== localOBJ.id){
					console.log(localOBJ);
					curID = localOBJ.id;

					//EMIT DATA TO MAIN SERVER
					iocc.emit('update', localOBJ)
				}
			} catch(e) { /*IGNORE e*/ }
		}
	});
}, 1000);


//SERVER UP
httpServer.listen(PORT, ()=>{console.log(`HTTP BASE-SERVER UP ON PORT: ${PORT}`);});