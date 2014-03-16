/*jshint node:true */

var dgram = require('chrome-app-socket').dgram;
var stun  = require('stun');

// namespace so we can reach this stuff in normal browser JS
NodeStunTest = {};

// Event Handler
var onRequest = function(){
    console.log('Sending STUN packet');
};

NodeStunTest.newStunRequest = function(host, port, cbFnc, errCbFnc) {
    console.log('Connecting to ' + host + ':' + port);
    // Create STUN Client
    var stunClient = stun.connect(port, host);
    stunClient.openedState = true;
    stunClient.stunPort = port;
    stunClient.stunHost = host;
    
    // Send STUN Request
    stunClient.request(onRequest);
    
    stunClient.on('response', function(packet){
        console.log('Received STUN packet from '+stunClient.stunHost+':'+stunClient.stunPort+' ', packet);
        stunClient.openedState = false;
        stunClient.close();
        cbFnc(packet.attrs[stun.attribute.MAPPED_ADDRESS]);
    });

    stunClient.on('error', function(err){
        if (stunClient.openedState === true) {
            console.log('Error binding to '+stunClient.stunHost+':'+stunClient.stunPort+':', err);
            stunClient.close();
            stunClient.openedState = false;
            errCbFnc(err);
        }
    });
    
    // Client close after 3sec
    setTimeout(function(){
        if (stunClient.openedState === true) {
            stunClient.close();
            console.log('closed STUN client to '+stunClient.stunHost+':'+stunClient.stunPort);
            errCbFnc('timedout');
        } else {
            console.log('STUN client already closed');
        }
    }, 3000);
}

// also export so we can reach this stuff in Node.js
exports.NodeStunTest = NodeStunTest;
