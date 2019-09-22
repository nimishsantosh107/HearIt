'''
data.json:
{
	id
	data station
		 data
}

transmit.json:
{
	station
	data
}
'''

from chirpsdk import ChirpSDK, CallbackSet
from uuid import uuid4
import time
import threading
import json
import signal
import sys

#INIT
STATION_NAME = "A"

class Callbacks(CallbackSet):
	def on_received(self, payload, channel):
		if (payload is not None):
			identifier = payload.decode('utf-8')
			print('RECV: ' + identifier)
			localDICT["id"] = str(uuid4())
			localDICT["data"] = {}
			localDICT["data"]["station"] = STATION_NAME
			localDICT["data"]["data"] = identifier
			with open("data.json", "w") as fp:
				json.dump(localDICT, fp)
				fp.close()	
		else:
			print('RECV: DECODE FAILED')

#RECEIVING LISTENER
def receive():
	while(runStatus):
		time.sleep(0.1)
		chirp.set_callbacks(Callbacks())

#SENDER
def send(message):
	identifier = message
	payload = identifier.encode('utf8')
	chirp.send(payload, blocking=True)

#DETECT FILE CHANGE
def fileChange():
	while(runStatus):
		time.sleep(0.1)
		try:
			f=open("transmit.json", "r")
			content = f.read()
			f.close()
			if (content == ""):
				continue
			else:
				contentDICT = json.loads(content)
				print(contentDICT)
				#SENDING TO DEVICES
				send(contentDICT["data"])
				f=open("transmit.json", "w")
				f.write("")
				f.close()
		except:
			continue


#HANDLE QUIT
def signal_handler(signal, frame):
	print("EXITING")
	runStatus = False
	sys.exit(0)

if __name__ == '__main__':
	#LOCAL DATA
	localDICT = {}
	#CHIRP SETUP
	chirp = ChirpSDK()
	chirp.start(send=True,receive=True)

	#RECV DAEMON
	runStatus = True
	recvDaemon = threading.Thread(name='RECV DAEMON', target=receive)
	recvDaemon.setDaemon(True)
	recvDaemon.start()

	#FILE CHANGE DAEMON
	fileChangeDaemon = threading.Thread(name='FILE DAEMON', target=fileChange)
	fileChangeDaemon.setDaemon(True)
	fileChangeDaemon.start()

	#QUIT PROGRAM
	signal.signal(signal.SIGINT, signal_handler)
	fileChangeDaemon.join()
	recvDaemon.join()