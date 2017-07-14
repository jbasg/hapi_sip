/*!
 *
 *
 *
 */
var AMI = require("./ami_cli.js");
var log4js = require('log4js');
var util = require('util');
var EventEmitter = require('events');

log4js.configure({
    appenders:{app_nami : { type: 'console' }
              ,app_namic : { type: 'file',filename:'logs/app_nami.log' }},
    categories : { default: { appenders: ['app_nami'], level: 'trace' } }
})
const logger = log4js.getLogger('app_nami');
logger.trace("INCIANDO MODULO")


var app_nami = function(){
  var self = this;
  var queues = {};
  var members = {};

  self.get_queues = function(){
    return Promise.resolve(queues);
  };
  self.get_queue = function(queue){
    return Promise.resolve(queues[queue]);
  };
  self.get_members = function(){
    return Promise.resolve(members);
  }
  self.get_member = function(member){
    return Promise.resolve(members[member]);
  }

  self.get_queue_members = function(queue){
    return Promise.resolve(members);

  }

  var ami = new AMI("192.168.71.106");

  var add_queue = function(data){
    return new Promise(function(resolve,reject){
      var last = queues[data.queue];
        queues[data.queue] = data;
        queues[data.queue].lastupdate = new Date().getTime();
        queues[data.queue].memento = last;
        queues[data.queue].members = queues[data.queue].members?queues[data.queue].members:{};
        resolve(queues[data.queue]);
    })
  }

  var add_member = function(data){
    return new Promise(function(resolve,reject){
      var last = members[data.name];
      members[data.name] = data;
      members[data.name].lastupdate = new Date().getTime();
      members[data.name].memento = last;
      resolve(members[data.name]);
    })
  }

  var add_queue_member = function(data){
    return new Promise(function(resolve,reject){
      if(queues[data.queue]){
        if (!queues[data.queue].members[data.name]){
          queues[data.queue].members[data.name] = members[data.name];
        }
      }
      resolve(members[data.name]);
    })
  }

  var queuestatus_response = function(data){
    logger.trace("QUEUESTATUS","MAP");
      data.events.map(function(item){
        switch(item.event || 'noevent'){
          case ('QueueParams'):
              parse_queue_param(item)
                .then(add_queue)
                .then(function(data){ logger.trace("QUEUE","ADD",data.queue)});
            break;
          case ('QueueMember'):
              parse_queue_member(item)
                .then(add_member)
                .then(add_queue_member)
                .then(function(data){ logger.trace("MEMBER","ADD",data.queue)});
            break;
          default:
              logger.debug(item.event);
            break;
        }
      });
      logger.trace("MAP COMPLETE!!!")
      setTimeout(function(){
        logger.trace('QueueStatus');
        logger.trace(queues);
        logger.trace(members);

      },5000)

  }


  var parse_queue_param = function(data){
    return new Promise(function(resolve,reject){
      resolve({
         type : 'QueueParams',
         queue: data.queue,
         max: data.max,
         strategy: data.strategy,
         calls: data.calls,
         holdtime: data.holdtime,
         talktime: data.talktime,
         completed: data.completed,
         abandoned: data.abandoned,
         servicelevel: data.servicelevel,
         servicelevelperf: data.servicelevelperf,
         weight: data.weight,
       })
    })
  }

  var parse_queue_member = function(data){
    return new Promise(function(resolve,reject){
      resolve({
         type : 'QueueMember',
         queue: data.queue,
         name: data.name,
         location: data.location,
         stateinterface: data.stateinterface,
         membership: data.membership,
         penalty: data.penalty,
         callstaken: data.callstaken,
         lastcall: data.lastcall,
         incall: data.incall,
         status: data.status,
         paused: data.paused,
         pausedreason: data.pausedreason
       })
    })
  }


  ami.on('events',function(evt){
    if (evt.event === 'QueueMemberChange')
      console.log(evt.event);
      //logger.trace(evt);
  })

  ami.action('siripbx',{ action : 'queuestatus'})
  .then(queuestatus_response)
  .catch(function(err){ logger.error(err);})
}

util.inherits(app_nami, EventEmitter);

module.exports = app_nami;
