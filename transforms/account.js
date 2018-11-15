


module.exports = {

    "eosio/newaccount": (traces, tranformer) => {
        traces.forEach((trace) => {
            var accountName = trace.act.data.name;
            var doc = {
                _type: 'account',
                _index: 'accounts',
                _id: accountName,
                _source: trace.act.data
            }
            tranformer.push(doc);
        })
    },

    "eosio/updateauth": (traces, tranformer) => {
        traces.forEach((trace) => {

            var actionData = trace.act.data;
            var accountName = actionData.account;
            var updateDoc = {};
            var permission = actionData.permission;
            updateDoc[permission] = actionData.auth;

            var doc = {
                update: true,
                _type: 'account',
                _index: 'accounts',
                _id: accountName,
                _source: updateDoc
            }
            tranformer.push(doc);
        })
    },

    "eosio/deleteauth": (traces, tranformer) => {
        traces.forEach((trace) => {
            var actionData = trace.act.data;
            var accountName = actionData.account;
            var updateDoc = {};
            var permission = actionData.permission;
            updateDoc[permission] = {};
            var doc = {
                update: true,
                _type: 'account',
                _index: 'accounts',
                _id: accountName,
                _source: updateDoc
            }
            tranformer.push(doc);
        })
    }

    
}