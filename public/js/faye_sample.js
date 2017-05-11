

var Msg = function(data){
  var self = this;
  self.user = ko.observable(data.user);
  self.msg = ko.observable(data.msg);

}

var appView= function(){
  var self = this;
  self.me = ko.observable(Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5));
  self.messages = ko.observableArray([]);
  
  var client =  new Faye.Client('/faye');
  self.msg = ko.observable('');

  client.subscribe('/chat',function(data){
    console.log('RECEIVED',data);

      self.messages.push(new Msg(data));

  });

  self.send_message = function(){
    client.publish('/chat',{user : self.me(), msg: this.msg()})
  }
}

ko.applyBindings(new appView());


lsMembers = [

  { name : 'agente1' , status: 1 ,paused : 0 , pausedreason : 3 ,queue : 'UNO'},
  { name : 'agente2' , status: 1 ,paused : 1 , pausedreason : 3 ,queue : 'UNO' },
  { name : 'agente3' , status: 1 ,paused : 0 , pausedreason : 3 ,queue : 'DOS' },
  { name : 'agente4' , status: 3 ,paused : 0 , pausedreason : 3 ,queue : 'UNO' },
  { name : 'agente5' , status: 1 ,paused : 1 , pausedreason : 3 ,queue : 'DOS' },
  { name : 'agente6', status: 1 ,paused : 0 , pausedreason : 3 ,queue : 'UNO' },
  { name : 'agente7' , status: 3 ,paused : 0 , pausedreason : 3 ,queue : 'DOS' },
]


_.countBy(lsMembers, function(num) {
  return num.paused === 1? 'paused': 'ready';
});

_.each(_.groupBy(lsMembers,'queue'),function(it){
  _.groupBy(it,'queue'),function(num) {
    return num.paused === 1? 'paused': 'ready';
  }
})



_.countBy(_.groupBy(lsMembers,'queue'),function(num) {
  return num.paused === 1? 'paused': 'ready';
});