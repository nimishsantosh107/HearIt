const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v4');

//CONFIG VARIABLES
const PORT = process.env.PORT || 3000;
const IP4 = "192.168.1.100";

var app = express();
var httpServer = http.Server(app);
var io = socketIO(httpServer); 


var curID = "";
//CHECKING CHANGES IN LOCAL FILE
setInterval(()=>{
	fs.readFile("./data.json", 'utf-8', (err,data)=>{
		if(err) {console.log(err);}
		else {
			try {
				var localOBJ = JSON.parse(data);
				if(curID !== localOBJ.id){
					console.log(localOBJ);
					curID = localOBJ.id;
				}
			} catch(e) {
				//IGNORE e
			}
		}
	});
}, 1000);

httpServer.listen(PORT, ()=>{console.log(`HTTP BASE-SERVER UP ON PORT: ${PORT}`);});