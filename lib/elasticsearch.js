const http = require('http');
const fs = require('fs');
const moment = require('moment');

var esHost = 'http://localhost:9200';

BigInt.prototype.toJSON = function() {
    return this.toString();
};

var totalWrites = 0;
var totalHandle = 0;

class elasticWriteStream {

    constructor(batchSize){
        this.batchSize = batchSize;
        this.batch = [];
        this.hook_ = {};
    }
    
    _writeToEs(data) {
        if (data.length === 0) {
            console.log('empty');
            return;
        }

        var writes = 0;
        var thisUrl = esHost+'/_bulk'

        var payload = {
            body: '',
            headers: Object.assign({
                'User-Agent': 'elasticdump',
                'Content-Type': 'application/x-ndjson'
            })
        }

        data.forEach(function (elem) {
            var actionMeta = { 
                index: { 
                    _index: elem._index, 
                    _type: elem._type,
                    _id: elem._id
                }
            }
            payload.body += JSON.stringify(actionMeta) + '\n'
            payload.body += JSON.stringify(elem._source) + '\n'
        })


        var response = http.put(thisUrl, payload);
        try {
            var r = response.json();
            if (r.items !== null && r.items !== undefined) {
                if (r.ok === true) {
                    writes = data.length
                } else {
                    r.items.forEach(function (item) {
                        if (item['index'].status < 400) {
                            writes++
                        } else {
                            console.error(item['index'])
                        }
                    })
                }
            }
        } catch (e) {
            console.log('parse return', e.stack, response.json())
        }

        totalWrites += writes;

        console.log('writes', writes, 'totalWrites', totalWrites, 'totalHandle', totalHandle);
        var reindex = http.post( esHost +'/_refresh');
        this.batch = [];
    }


    // eosio/newaccount
    listent(keyId, handler){
        this.hook_[keyId] = hook_[keyId] || [];
        this.hook_[keyId].push(handler);
    }


    _onActionTrace(raw){
        var trace = raw;
        var self = this;

        if(!trace.receipt){
            return;
        }

        if(trace.receipt.status == "hard_fail"){
            return;
        }

        if (trace.act && trace.act.name === "onblock") return;

        var actions = [];
        var messages = {};

        function collectMessage(_at) {
            function _c(f) {
                if (self.hook_[f]) {
                    messages[f] = messages[f] || [];
                    messages[f].push(_at);
                }
            }
            _c(_at.act.account);
            _c(_at.act.account + "/" + _at.act.name);
        }

        function excuteAct(at){

            var link_accounts = {};
            var history = {};

            if(at.act && at.act.hex_data){
                // remove hex_data too large
                delete at.act.hex_data;
            }

            link_accounts[at.receipt.receiver] = 1;

            if(at.act.authorization){
                at.act.authorization.forEach((a) => {
                    link_accounts[a.actor] = 1;
                })
            }

            // actions.push(at);

            var data = {};

            let block_num = trace.block_num.toString();
            var date = moment.utc(trace.block_time).format('YYYYMMDD');
    
            data._type = 'history';
            data._index = 'eoshistory_'+date;
            data._id =  at.receipt.global_sequence;

            var action_trace = Object.assign({}, at);

            delete action_trace.inline_traces;

            history.actors = Object.keys(link_accounts);
            history.action_trace = JSON.stringify(action_trace);
            
            history.account = action_trace.act.account;
            history.action = action_trace.act.name;

            history.block_num = parseInt(block_num);
            history.block_time = trace.block_time;

            history.producer = trace.producer;
            history.trx_id = trace.trx_id;
            history.global_sequence = at.receipt.global_sequence;

            data._source = history;

            if(self.batch.length > self.batchSize){
                self._writeToEs(self.batch);
                console.log('write done', self.batchSize, self.batch.length);
            }else{
                self.batch.push(data);
            }
            
            collectMessage(at);
            at.inline_traces.forEach((_at) => {
                excuteAct(_at, at);
            });
        }

        excuteAct(trace);

        console.time("emitter-time");
        totalHandle++;

    }


    write(trace, _, next) {
        try{
            this._onActionTrace(trace);
        }catch(e){
            console.log('error', e.stack);
        }
    }
}


module.exports = elasticWriteStream;