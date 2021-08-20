from flask import Flask
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
from flask_restful.utils import cors
from time import time

from eth_utils import keccak, decode_hex
from eth_keys import KeyAPI
from eth_keys.datatypes import PublicKey, Signature

app = Flask(__name__)
api = Api(app)
CORS(app, origins="*", allow_headers=["Content-Type", "Access-Control-Allow-Credentials"])

seed = str(keccak(b'SEED'))

signature_key = KeyAPI('eth_keys.backends.NativeECCBackend')

login_parser = reqparse.RequestParser()
login_parser.add_argument('login_time')
login_parser.add_argument('address')
login_parser.add_argument('signature')

def recover_address(message, signature):
    modified_message = '\u0019Ethereum Signed Message:\n' + str(len(message)) + message
    sig_bytes = decode_hex(signature)
    sig_bytes = sig_bytes[:-1] + (sig_bytes[-1] - 27).to_bytes(1, 'big')
    sig_object = Signature(sig_bytes)
    addr = PublicKey.recover_from_msg(modified_message.encode(), sig_object).to_address()
    return str(addr)

def verify_token(token):
    timestamp = int(token[:8], 16)
    address = "0x" + token[8:48]
    signature = "0x" + token[48:178]
    server_token = token[178:]
    if recover_address("logging_in_at_time_" + str(timestamp), signature) != address:
        return False
    if str(keccak((signature + seed).encode()).hex()) != server_token:
        return False
    return True

class Login(Resource):
    @cors.crossdomain(origin='*')
    def get(self):
        epoch_time = int(time())
        return {'server_time': epoch_time}
    def post(self):
        args = login_parser.parse_args()
        login_time = args['login_time']
        if int(login_time) + 60 > int(time()):
            #took over a minute to log in
            return "Login expired", 401
        address = args['address']
        signature = args['signature']
        message = "logging_in_at_time_" + str(login_time)
        rec_addr = recover_address(message, signature)
        if rec_addr == address:
            return {'token': str(keccak((signature + seed).encode()).hex())}, 200
        return "Invalid signature", 401

api.add_resource(Login, "/api/login")

if __name__ == '__main__':
    app.run(port=8000, debug=True)
