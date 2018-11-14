const http = require('http');
const fs = require('fs');

var esHost = 'http://localhost:9200';


// for Bigint
function deepCopy(d, notConvert) {
	let r = {};
	function _deepCopy(o, c) {
		c = c || {}

		for (let i in o) {

			let v = o[i];
			let ty = typeof v;

			if (ty === 'object') {

				c[i] = (v.constructor === Array) ? [] : {};

				_deepCopy(v, c[i]);

			} else {
				c[i] = (ty === "bigint" && !notConvert) ? v.toString() : v;
			}
		}
		return c;
	}
	_deepCopy(d, r);
	return r;
}


class elasticWriteStream {

    constructor(batchSize, index, type){
        this.batchSize = batchSize;
        this.index = index;
        this.type = type;
        this.batch = [];
        this.hook_ = {};
    }
    

    write(data) {

        if (data.length === 0) {
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
                    _index: this.index, 
                    _type: this.type,
                    _id: elem.act_digest
                }
            }
            payload.body += JSON.stringify(actionMeta) + '\n'
            payload.body += JSON.stringify(elem._source ? elem._source : elem) + '\n'
        })

        var response = http.put(thisUrl, payload);
        try {
            var r = JSON.parse(response.body)
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
            console.log(e)
        }

        var reindex = http.post( esHost +'/_refresh');
        // console.log(reindex);
    }


    // eosio/newaccount
    listent(keyId, handler){
        hook_[keyId] = hook_[keyId] || [];
        hook_[keyId].push(handler);
    }


    _getTraceAccounts(){


    }


    _onActionTrace(raw){
        var trace = deepCopy(raw);

        if (trace.act.name === "onblock") return;

        var actions = [];
        var link_accounts = {};

        var history = {};

     

        function excuteAct(at){
            link_accounts[at.receipt.receiver] = 1;
            if(at.act.authorization){
                at.act.authorization.forEach((a) => {
                    link_accounts[a.actor] = 1;
                })
            }
            actions.push(at);
            at.inline_traces.forEach((_at) => {
                excuteAct(_at, at);
            });
        }

        excuteAct(trace);


        console.log(link_accounts, actions);


        fs.appendFileSync('./dump.logs', JSON.stringify({
            link_accounts: link_accounts,


        })+"\n");

        console.time("emitter-time");

        // fs.appendFileSync('./dump.logs', JSON.stringify(data)+"\n");
        // if(batch.length > batchSize){
        //     write(batch);
        //     console.log('write done');
        // }else{
        //     batch.push(data);
        // }
    }


    write(trace, _, next) {
        try{
            this._onActionTrace(trace);
        }catch(e){
            console.log(e);
        }
    }
}


module.exports = elasticWriteStream;