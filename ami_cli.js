'use Static';

/*!
 *
 *
 *
 */
var Faye = require("faye");
var util = require("util");
var rp = require("request-promise");
var EventEmitter = require('events').EventEmitter;
var log4js = require('log4js');

log4js.configure({
    appenders:{ami_cli : { type: 'file',filename:'logs/amiCli.log' }},
    categories : { default: { appenders: ['ami_cli'], level: 'error' } }
})

var amiProxyClient = function(server){
  var self = this;
  var log = log4js.getLogger('ami_cli');
  const url = "http://" + server + ":8100/faye"

  const urlAction = "http://" + server + ":8101/namiproxy/{host}/action/{action}"
  //const urlAction = "http://" + server + "/namiproxy/{host}/action/{action}"

  var faye = new Faye.Client(url)
    faye.then((data) => {
      log.info("CONNECTING");
      self.emit('connect');

    });

  log.info('amiProxyClient','SERVER' ,url)

  var client = faye.subscribe('/**',function(data){
    self.emit(data.event.toLowerCase(),data);
    self.emit('events',data);
  });


  self.action = function(host,action){
    return new Promise(
      function(resolve,reject){
        var options = {
          method : 'POST'
          ,uri : urlAction.replace('{host}',host).replace('{action}',action.action)
          ,body : action
          ,json : true
        };
    rp(options)
      .then(function(data){
        resolve(data);
      })
      .catch(function(err){
        reject(err);
      })
  })};

}

util.inherits(amiProxyClient, EventEmitter);

module.exports = amiProxyClient;
