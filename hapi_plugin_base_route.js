var baseRoutes = {  
  register: function (server, options, next) {
    server.route({
      method: 'GET',
      path: '/info',
      handler: function (request, reply) {
        reply({ timestamp : new Date().getTime() , uptime : process.uptime() , app : server.app.app_name })
      }
    })

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: '.',
                redirectToSlash: true,
                index: true
            }
        }
    });

    next()
  }
}

baseRoutes.register.attributes = {  
  name: 'base-routes',
  version: '1.0.0'
}

module.exports = baseRoutes  