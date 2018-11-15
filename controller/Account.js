

var elastic = require('../lib/elastic.js');
var tabify = require('es-tabify');

const searchAccount = elastic.searchAccount;

module.exports = {
    
    keyAccounts: async (request, h) => {

        let query = request.query || {};
        let pubKey = query.public_key || 0;
   
        var filterQuery = {
            must: [ 
                {
                    "query_string":{
                        "query": pubKey,
                        "analyze_wildcard":true,
                        "default_field":"*"
                    }
                }
            ],
            must_not: []
        }

  
        let queryJson = {};
        queryJson['query'] = {
            bool: {
                must: filterQuery.must,
                must_not: [],
            }
        }

        // 分页信息
        queryJson.from = 0;
        queryJson.size = 500;
        
        var results = {};
        var account_names = [];

        try{
            console.log(JSON.stringify(queryJson));
            response = await searchAccount(queryJson);
            results.total = response.hits.total;
            results.took = response.took;
            data = tabify(response);
            data.map((item) => {
                account_names.push(item.name);
            })
            results.status = 1;
            results.data = data;
        }catch(e){
            results.status = 0;
            console.log(e);
        }

        if(query.detail){
            return results;
        }else{
            return account_names;
        }

    }

}
