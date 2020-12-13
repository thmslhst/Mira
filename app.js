/**
*
* 
*
**/

const SERVER_PORT = 8080;

//--------------------------------------

var inport = 1515;
var outport = 2020;

//--------------------------------------

var path = require('path');
var express = require('express');
var app = express();

var dgram = require('dgram');
var osc = require('osc-min');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

//--------------------------------------
// routing

app.use(express.static('public'));

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname + '/views/index.html'));
});

//--------------------------------------

/*
*
* OSC RECEIVER
*
* */

var OSCReceiver = dgram.createSocket('udp4', function(msg, rInfo){

    var message = '';

    try {
        message = osc.fromBuffer(msg);
    } catch (e) {
        return console.log('error', e);
    }

    var elements = 'bundle' === message.oscType ? message.elements : [message];

    elements.forEach(function(el, index){
        var args = [el.address];
        el.args.forEach(function(arg, index){
            args.push(arg.value);
        });
        emitter.emit('osc-received', args);
    });
});

OSCReceiver.bind(inport);

/*
*
* OSC SENDER
*
* */

var OSCSender = dgram.createSocket('udp4');

/*
*
* SOCKET IO
*
* */

var io = require('socket.io').listen(app.listen(SERVER_PORT, function(){
    console.log('Listening on port: ' + SERVER_PORT);
}));

io.sockets.on('connection', function(socket){

    emitter.on('osc-received', function(){
        socket.emit('osc-received', arguments);
    });

    socket.on('osc-sent', function(msg){
        var buf;
        buf = osc.toBuffer(msg);
        OSCSender.send(buf, 0, buf.length, outport, 'localhost');
    });

    socket.on('port-changed', function(m){
        inport = m.inport;
        outport = m.outport;
    });
});
