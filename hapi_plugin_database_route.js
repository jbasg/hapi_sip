/*!
 *
 *
 *
 */
var baseRoutes = {
  register: function (server, options, next) {
    server.route({
      method: 'GET',
      path: '/db/info',
      handler: function (request, reply) {
        reply({ timestamp : new Date().getTime() , uptime : process.uptime() , app : server.app.app_name })
      }
    })

    next()
  }
}

baseRoutes.register.attributes = {
  name: 'database-routes',
  version: '1.0.0'
}

module.exports = baseRoutes
