const Hapi = require('hapi');
const routes = require('./routes');
const HapiSwagger = require('hapi-swagger');
const Inert = require('inert');
const Vision = require('vision');

// 文档
const SwaggerOptions = {
  info: {
    'title': 'EOS Elasticsearch History API Documentation',
    'version': '0.0.1'
  },
};

const init = async () => {
  const server = new Hapi.Server({ 
    host: '0.0.0.0',
    port: 80
  });

  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: SwaggerOptions
    }
  ]);

  server.route(routes);

  await server.start();
  return server;
};


init().then(server => {
  console.log('Server running at:', server.info.uri);
})
.catch(error => {
  console.log(error);
});