from chirpsdk import ChirpSDK, CallbackSet

chirp = ChirpSDK()
chirp.start(send=True, receive=True)

identifier = 'hello'
payload = identifier.encode('utf8')
chirp.send(payload, blocking=True)

class Callbacks(CallbackSet):
    def on_received(self, payload, channel):
        if payload is not None:
            identifier = payload.decode('utf-8')
            print('Received: ' + identifier)
        else:
            print('Decode failed')

chirp.set_callbacks(Callbacks())