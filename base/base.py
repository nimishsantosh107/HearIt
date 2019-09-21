from chirpsdk import ChirpSDK, CallbackSet
from uuid import uuid4
import time
import json

#LOCAL DATA
localDICT = {}

chirp = ChirpSDK()
chirp.start(send=True,receive=True)

class Callbacks(CallbackSet):
	def on_received(self, payload, channel):
		print('hi')
		if (payload is not None):
			identifier = payload.decode('utf-8')
			print('RECV: ' + identifier)
			localDICT["id"] = str(uuid4())
			localDICT["data"] = identifier
			with open('./data.json', 'w') as fp:
				json.dump(localDICT, fp)
		else:
			print('DECODE FAILED')

def receive():
	while True:
		time.sleep(0.1)
		chirp.set_callbacks(Callbacks())

def send(message):
	identifier = '$123.456'
	payload = identifier.encode('utf8')
	chirp.send(payload, blocking=True)

send()