
const elasticsearch = require('elasticsearch');
var esHost = 'localhost:9200';

let _client = null;


const getClient = async (query) => {
    if(_client == null){
        _client = await new elasticsearch.Client({
            host: esHost,
        });
    }
    return _client;
}



module.exports = {
    getClient: getClient
}