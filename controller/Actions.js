var elastic = require('../lib/elastic.js');
var tabify = require('es-tabify');

const searchMainnet = elastic.searchMainnet;


var sourceTypes = {
    fibos: 'fibos',
    eos: 'eosmainnet*'
}

const AllDimensions = {
    dapp: {
        fieldName: 'account.keyword'
    },
    action: {
        fieldName: 'action.keyword'
    },
    actor: {
        fieldName: 'actors.keyword'
    }
}


module.exports = async (request, h) => {

    let query = request.query || {};
    let from = query.pos || 0;
    let querySize = query.offset || 40;
    var filterParsed = [];

    var queryFilters = ['account_name', 'action', 'dapp'];

    queryFilters.forEach((key) => {
        if(query[key]){
            if(key == 'account_name'){
                filterParsed.push({
                    field: 'actor',
                    type: 'EQ',
                    value: [query[key]]
                })
            }else{
                filterParsed.push({
                    field: key,
                    type: 'EQ',
                    value: [query[key]]
                })
            }
        }
    })
  

    var filterQuery = {
        must: [],
        must_not: []
    }

    filterParsed.forEach((filterItem) => {
        var filterFiled = filterItem.field;
        var filterType = filterItem.type;
        var filterValue = filterItem.value;
        var dimensionData = AllDimensions[filterFiled];
        switch(filterType){
            case 'EQ':
                var query = {}
                var termType = 'term';

                if(filterValue.length > 1){
                    termType = 'terms';
                }

                query[termType] = {};
                query[termType][dimensionData.fieldName] = filterValue.length > 1 ? filterValue : filterValue[0]
                filterQuery.must.push(query);
            break;
        }
    })

 
    let queryJson = {};
    queryJson['query'] = {
        bool: {
            must: filterQuery.must,
            must_not: [],
        }
    }

    // 分页信息
    queryJson.from = from;
    queryJson.size = querySize;
    queryJson.sort = [ { block_num: "desc" }];
    
    var results = {};

    try{
        response = await searchMainnet(queryJson);
        // console.log(response);
        results.total = response.hits.total;
        results.took = response.took;
        data = tabify(response);
        data.map((item) => {
            try{
                item.action_trace = JSON.parse(item.action_trace);
            }catch(e){}

        })
        results.status = 1;
        results.data = data;
    }catch(e){
        results.status = 0;
        console.log(e);
    }
   

    return results;
}


