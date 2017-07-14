/*!
 *
 *
 *
 */
var AMI = require("./app_nami.js");

var ami = new AMI();

var get_uptime = function(){ return process.uptime() };

var info_handler = function(request,reply){
  reply ({ timestamp : new Date().getTime() , uptime : get_uptime() , app : 'nami_route' });
}

var queue_handler = function(request,reply){
  ami.get_queue(request.params.id).then(reply);
};
var queues_handler = function(request,reply){
  ami.get_queues().then(reply);
};

var member_handler = function(request,reply){
  ami.get_member(request.params.id).then(reply);
};
var members_handler = function(request,reply){
  ami.get_members().then(reply);
};

var baseRoutes = {

  register: function (server, options, next) {
    server.route({ method: 'GET', path: '/nami/info'
                  , handler: info_handler})
    server.route({ method: 'GET', path: '/nami/queue'
                  , handler: queues_handler})
    server.route({ method: 'GET', path: '/nami/queue/{id}'
                  , handler: queue_handler})
    server.route({ method: 'GET', path: '/nami/member'
                  , handler: members_handler})
    server.route({ method: 'GET', path: '/nami/member/{id}'
                  , handler: member_handler})
    next()
  }
}

baseRoutes.register.attributes = {
  name: 'nami-routes',
  version: '1.0.0'
}

module.exports = baseRoutes
