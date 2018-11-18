const Actions = require('../controller/Actions.js');
const Account = require('../controller/Account.js');


const Joi = require('joi');

var routes = [];

routes.push({
    method: 'GET', 
    path: '/v1/history/get_actions', 
    config: { 
        auth: false,
        cors: true,
        description: 'get actions',
        notes: 'get history actions',
        tags: ['api'], // ADD THIS TAG
        validate:{
            query: {
                account_name: Joi.string().min(0).max(13).description("account name"),
                dapp: Joi.string().min(0).max(13).description("dapp account"),
                action: Joi.string().min(0).max(1000).description("action"),
                pos: Joi.number().min(0).max(1000000000).description("pos"),
                offset: Joi.number().min(0).max(1000000000).description("offset"),
            }
        }
    },
    handler: Actions
})


routes.push({
    method: 'GET', 
    path: '/v1/history/get_key_accounts', 
    config: { 
        auth: false,
        cors: true,
        description: 'get key accounts',
        notes: 'get key accounts',
        tags: ['api'], // ADD THIS TAG
        validate:{
            query: {
                detail: Joi.number().min(0).max(10).description("detail"),
                public_key: Joi.string().min(0).max(100).description("public key"),
            }
        }
    },
    handler: Account.keyAccounts
})



module.exports = routes;