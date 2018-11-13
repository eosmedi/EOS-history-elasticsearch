const http = require('http');
var esHost = 'http://localhost:9200';

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
            if(batch.length > batchSize){
                (async () => {
                    await write();
                    console.log('write done');
                })();
            }else{
                batch.push(line);
            }
        }
    }
    return writable;
}


module.exports = elasticWriteStream;