const Aggregate = require('../controller/Aggregate');

const Joi = require('joi');

var routes = [];

routes.push({
    method: 'GET', 
    path: '/v1/history/get_actions', 
    config: { 
        auth: false,
        cors: true,
        description: 'get actions',
        notes: 'get actions',
        tags: ['api'], // ADD THIS TAG
        validate:{
            query: {
                account_name: Joi.string().min(0).max(13).description("account name"),
                dapp: Joi.string().min(0).max(13).description("dapp account"),
                action: Joi.number().min(0).max(1000).description("action"),
                actor: Joi.number().min(0).max(1000).description("actor"),
                pos: Joi.number().min(0).max(1000000000).description("pos"),
                offset: Joi.number().min(0).max(1000000000).description("offset"),
            }
        }
    },
    handler: Aggregate
})



module.exports = routes;