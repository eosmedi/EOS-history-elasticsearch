
const elasticsearch = require('elasticsearch');
let _client = null;

const getClient = async (query) => {
    if(_client == null){
        _client = await new elasticsearch.Client({
            host: '127.0.0.1:9200',
            // log: 'trace'
        });
    }
    return _client;
}

const searchMainnet = async (query, index) => {
    const client = await getClient();
    return client.search({
        index: index || 'mainnet',
        type: 'eos',
        body: query
    })
}


module.exports = {
    getClient: getClient,
    searchMainnet: searchMainnet
}