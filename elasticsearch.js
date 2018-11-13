var http = require('http');
var esHost = 'http://localhost:9200';

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


function reindex(){
    var esRequest = {
        'url': esHost +'/_refresh',
        'method': 'POST'
    }
    request(esRequest, function (err, response) { })
}

eos = EosApi({
    httpEndpoint: "https://api-kylin.eosasia.one",
    logger: {
    }
})


var afile = "./crypto_fetch";

var current = parseInt(fs.readFileSync(afile, "utf-8"));

console.log("start fetch block from", current);

function fetchBlock(){
    eos.getBlock(current, (error, result) => {

        // console.log(result)
        if(!error){
            current++;
            try{
                parseBlock(result, true);
                fs.writeFileSync(afile, current);
            }catch(e){
                console.log(e, JSON.stringify(result));
                throw e;
            }
        }else{
            console.log(error)
        }
        fetchBlock();
    })
}

function listenBlock(){
    fetchBlock();
}



function parseBlock(line, json){
    if(!json){
        try{
            line = JSON.parse(line);
        }catch(e){

        }
    }else{ }
    line.transactions.forEach(function(transaction){
        if(transaction.status != "hard_fail" && typeof transaction.trx != "string"){
            transaction.trx.transaction.actions.forEach(function(action){
                handleAction(action, line, transaction);
            })
        }
    })
}


function handleAction(action, block, transaction){
    try{
        actionHanddler['_all']  && actionHanddler['_all'](action, block, transaction);
    }catch(e){
        console.error("parseActionError", e);
    }

    var actionName = action.name;
    try{
        actionHanddler[actionName]  && actionHanddler[actionName](action['data'], block);
    }catch(e){
        console.error("parseActionError", e);
    }
}


function getAccountData(account){
    return new Promise(function(resolve, reject){
        Promise.all([
            eos.getAccount({
                account_name: account
            }),
            eos.getCurrencyBalance({
                code: "eosio.token",
                account: account
            })
        ]).then(function(res){
            res[0].blance = res[1];
            resolve(res[0])
        }, function(err){
            reject(error);
            console.log("error", err);
        }).catch(function(err){
            reject(error);
            console.log("error", err);
        })
    })
}


var actionHanddler = {};
var dataList = [];


actionHanddler['_all'] = function(data, block, transaction){

    delete data.hex_data;

    data.timestamp = block.timestamp;
    data.block_num = block.block_num;
    data.producer = block.producer;
    data.tr_id = transaction.trx.id;

    dataList.push(data);

    if(dataList.length > batchSize){
        var data = [].concat(dataList);
        dataList = [];
        setData(data);
    }

}

listenBlock();