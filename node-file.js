const fibos = require("fibos");
const fs = require('fs');
const moment = require('moment');
const traceFileDir = './traces';

if(!fs.existsSync(traceFileDir)){
    fs.mkdirSync(traceFileDir);
}

BigInt.prototype.toJSON = function() {
    return this.toString();
};

fibos.config_dir = "./data-dir";
fibos.data_dir = "./data-dir";

fibos.load("http", {
	"http-server-address": "0.0.0.0:8870",
	"access-control-allow-origin": "*",
	"http-validate-host": false,
	"verbose-http-errors": true
});

fibos.load("net", {
	// "p2p-peer-address": ["p2p-testnet.fibos.fo:9870"],
	"p2p-listen-endpoint": "0.0.0.0:9870"
});

// fibos.load("producer");
fibos.load("chain", {
	"contracts-console": true,
	// "hard-replay": true,
	"delete-all-blocks": true,
	"genesis-json": "genesis.json"
});

fibos.load("chain_api");
fibos.load("emitter");


var batchSize = 3000;
var batch = [];

fibos.on('action', (message) => {
    try{
        fs.appendFileSync('./traces/trace.log', JSON.stringify(message)+"\n");
    }catch(e){
        console.log('error', e);
    }
});

fibos.core_symbol = "EOS";
fibos.pubkey_prefix = "EOS";

fibos.start();