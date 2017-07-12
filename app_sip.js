// Initiating a call example. Note: we use bogus sdp, so no real rtp session will be established.

var util = require('util');
var os = require('os');




var SIP = function(){
 var self = this;
 var sip = require("sip");
 var rstring = function() { return Math.floor(Math.random()*1e6).toString(); }

 var dialogs = {};

 var rs_server = function(rq){
   if (rq.headers.to.params.tag){
     var id = [rq.headers['call-id'],rq.headers.to.params.tag,rq.headers.from.params.tag].join(':');
     if(dialogs[id]){
       dialogs[id](rq);
     } else {
       sip.send(sip.makeResponse(rq,481, "Call doesn't exists"));
     }
   } else {
     sip.send(sip.makeResponse(rq, 405, 'Method not allowed'));
   }
 }

 var sip_invite = function(uri_dst){
   return {
     method: 'INVITE',
     uri: uri_dst,
     headers: {
       to: {uri: uri_dst},
       from: {uri: 'sip:test@test', params: {tag: rstring()}},
       'call-id': rstring(),
       cseq: {method: 'INVITE', seq: Math.floor(Math.random() * 1e5)},
       'content-type': 'application/sdp',
       contact: [{uri: 'sip:dialer@192.168.89.18' }]  // if your call doesnt get in-dialog request, maybe os.hostname() isn't resolving in your ip address
     }}/*,
     content:
       'v=0\r\n'+
       'o=- 13374 13374 IN IP4 172.16.2.2\r\n'+
       's=-\r\n'+
       'c=IN IP4 172.16.2.2\r\n'+
       't=0 0\r\n'+
       'm=audio 16424 RTP/AVP 0 8 101\r\n'+
       'a=rtpmap:0 PCMU/8000\r\n'+
       'a=rtpmap:8 PCMA/8000\r\n'+
       'a=rtpmap:101 telephone-event/8000\r\n'+
       'a=fmtp:101 0-15\r\n'+
       'a=ptime:30\r\n'+
       'a=sendrecv\r\n'
   }*/
 }

 var registrar_dialog = function(rs){
   var id = [rs.headers['call-id'], rs.headers.from.params.tag, rs.headers.to.params.tag].join(':');
   if(!dialogs[id]){
     dialogs[id] = function(rq){
       if(rq.method === 'BYE'){
         console.log("BYE",rs.headers['call-id']);
         delete dialogs[id];
         sip.send(sip.makeResponse(rq,200,'Ok'));
       } else if(rq.method === 'NOTIFY'){
         console.log("NOTIFY");
         sip.send(sip.makeResponse(rq,200,'Ok'));
       } else {
         sip.send(sip.makeResponse(rq,405,'Method not allowed'));

       }

     }

   }

 }

 var sip_ack = function(rs){
   return {
     method: 'ACK',
     uri: rs.headers.contact[0].uri,
     headers: {
       to: rs.headers.to,
       from: rs.headers.from,
       'call-id': rs.headers['call-id'],
       cseq: {method: 'ACK', seq: rs.headers.cseq.seq},
       via: [],
       route : rs.headers['record-route']
     }
   }
 }

 var sip_bye = function(rs){
   console.log(rs);
   console.log("SIP_VIA",rs.headers.via);
   return {
      method: 'BYE',
      uri: rs.headers.contact[0].uri,
      headers: {
        to: rs.headers.to,
        from: rs.headers.from,
        'call-id': rs.headers['call-id'],
        cseq: {method: 'BYE', seq: rs.headers.cseq.seq+1},
        via: []
      }
    }
 };

 var sip_refer = function(rs,uri_refer){
   return {
    method: 'REFER',
    uri: rs.headers.contact[0].uri || ''
    ,headers: {
    to: rs.headers.to,
    from: rs.headers.from,
    'call-id': rs.headers['call-id'],
    cseq: {method: 'REFER', seq: rs.headers.cseq.seq+1},
    via: [],
            route : rs.headers['record-route'],
            'refer-to' : uri_refer
    }};
 }

 var sip_response = function(rs){
   if(rs.status >= 300){

   } else if (rs.status < 200) {

   } else {
     sip.send(sip_ack(rs));
     var id = [rs.headers['call-id'], rs.headers.from.params.tag, rs.headers.to.params.tag].join(':');
     if(!dialogs[id]) {
       dialogs[id] = function(rq) {
         if(rq.method === 'BYE') {
           console.log('call received bye');

           delete dialogs[id];

           sip.send(sip.makeResponse(rq, 200, 'Ok'));
         }
         else {
           sip.send(sip.makeResponse(rq, 405, 'Method not allowed'));
         }
       }
     }
   }
 }

 self.make_call = function(uri_dst){
   var n = sip_invite(uri_dst);
   console.log(n);
   sip.send(n,function(rs){
     console.log('METHOD',n.method,n['call-id']);
     console.log('RESPONSE ',rs.headers['call-id'],rs.status);
     console.log('METHOD','ACK',rs.headers['call-id'],rs.status);
     sip.send(sip_ack(rs))
   });
 }

 self.make_predictive = function(uri_dst,uri_refer){
   var n = sip_invite(uri_dst);
   sip.send(sip_invite(uri_dst)
    ,function(rs){
      registrar_dialog(rs);
      if (rs.status >= 300){
        //Llamada finalizada
        console.log(rs.status);
      } else if(rs.status < 200){
        //Llamada en proceso
        console.log(rs.status);
      } else {
        //Resultado OK
        console.log(rs.status);
        sip.send(sip_ack(rs));

        sip.send(sip_bye(rs))

/*        sip.send(sip_refer(rs,uri_refer),
          function(rs){
            registrar_dialog(rs);
            if (rs.status >= 300){
              //Llamada finalizada
              console.log('REFER',rs.status);
            } else if(rs.status < 200){
              //Llamada en proceso
              console.log('REFER',rs.status);
            } else {
              console.log('REFER',rs.status);
            }
          })
*/
      }
    })



 }

 sip.start({ address : '192.168.89.18' },rs_server);


}

var n = new SIP();

setTimeout(function(){
 //n.make_call('sip:035646250286@192.168.7.39');
 n.make_predictive('sip:035646250286@192.168.7.39','sip:pruebas@localhost')

},5000);



/*
function rstring() { return Math.floor(Math.random()*1e6).toString(); }

//starting stack
sip.start({}, function(rq) {
 if(rq.headers.to.params.tag) { // check if it's an in dialog request
   var id = [rq.headers['call-id'], rq.headers.to.params.tag, rq.headers.from.params.tag].join(':');

   if(dialogs[id])
     dialogs[id](rq);
   else
     sip.send(sip.makeResponse(rq, 481, "Call doesn't exists"));
 }
 else
   sip.send(sip.makeResponse(rq, 405, 'Method not allowed'));
});




// Making the call
/*
sip.send({
 method: 'INVITE',
 uri: process.argv[2],
 headers: {
   to: {uri: process.argv[2]},
   from: {uri: 'sip:test@test', params: {tag: rstring()}},
   'call-id': rstring(),
   cseq: {method: 'INVITE', seq: Math.floor(Math.random() * 1e5)},
   'content-type': 'application/sdp',
   contact: [{uri: 'sip:101@' + os.hostname()}]  // if your call doesnt get in-dialog request, maybe os.hostname() isn't resolving in your ip address
 },
 content:
   'v=0\r\n'+
   'o=- 13374 13374 IN IP4 172.16.2.2\r\n'+
   's=-\r\n'+
   'c=IN IP4 172.16.2.2\r\n'+
   't=0 0\r\n'+
   'm=audio 16424 RTP/AVP 0 8 101\r\n'+
   'a=rtpmap:0 PCMU/8000\r\n'+
   'a=rtpmap:8 PCMA/8000\r\n'+
   'a=rtpmap:101 telephone-event/8000\r\n'+
   'a=fmtp:101 0-15\r\n'+
   'a=ptime:30\r\n'+
   'a=sendrecv\r\n'
},
function(rs) {
 if(rs.status >= 300) {
   console.log('call failed with status ' + rs.status);
 }
 else if(rs.status < 200) {
   console.log('call progress status ' + rs.status);
 }
 else {
   // yes we can get multiple 2xx response with different tags
   console.log('call answered with tag ' + rs.headers.to.params.tag);

   // sending ACK
   sip.send({
     method: 'ACK',
     uri: rs.headers.contact[0].uri,
     headers: {
       to: rs.headers.to,
       from: rs.headers.from,
       'call-id': rs.headers['call-id'],
       cseq: {method: 'ACK', seq: rs.headers.cseq.seq},
       via: []
     }
   });

   var id = [rs.headers['call-id'], rs.headers.from.params.tag, rs.headers.to.params.tag].join(':');

   // registring our 'dialog' which is just function to process in-dialog requests
   if(!dialogs[id]) {
     dialogs[id] = function(rq) {
       if(rq.method === 'BYE') {
         console.log('call received bye');

         delete dialogs[id];

         sip.send(sip.makeResponse(rq, 200, 'Ok'));
       }
       else {
         sip.send(sip.makeResponse(rq, 405, 'Method not allowed'));
       }
     }
   }
 }
});
*/



'v=0\r\n'+
'o=- 13374 13374 IN IP4 172.16.2.2\r\n'+
's=-\r\n'+
'c=IN IP4 172.16.2.2\r\n'+
't=0 0\r\n'+
'm=audio 16424 RTP/AVP 0 8 101\r\n'+
'a=rtpmap:0 PCMU/8000\r\n'+
'a=rtpmap:8 PCMA/8000\r\n'+
'a=rtpmap:101 telephone-event/8000\r\n'+
'a=fmtp:101 0-15\r\n'+
'a=ptime:30\r\n'+
'a=sendrecv\r\n'
