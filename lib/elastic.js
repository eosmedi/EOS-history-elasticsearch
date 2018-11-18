
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
        index: index || 'eoshistory_*',
        type: 'history',
        body: query
    })
}

const searchAccount = async (query, index) => {
    const client = await getClient();
    console.log('searchAccount', query)
    return client.search({
        index: index || 'account*',
        type: 'account',
        body: query
    })
}


module.exports = {
    getClient: getClient,
    searchMainnet: searchMainnet,
    searchAccount: searchAccount
}