const http = require('http');
const fs = require('fs');

var esHost = 'http://localhost:9200';


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


function elasticWriteStream(batchSize, index, type){

    function write(data) {
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
        }),
        timeout: 1000
        }

        data.forEach(function (elem) {
            var actionMeta = { 
                index: { 
                    _index: index, 
                    _type: type,
                    _id: hash
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
        console.log(reindex);
    }

    var batch = [];
    var writable = {
        write: function(line, _, next) {
            var data = deepCopy(line);
            fs.appendFileSync('./dump.logs', JSON.stringify(data)+"\n");
            if(batch.length > batchSize){
                write(batch);
                console.log('write done');
            }else{
                batch.push(data);
            }
        }
    }
    return writable;
}


module.exports = elasticWriteStream;