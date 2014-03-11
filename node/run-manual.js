var test = require('./index.js');

//test.NodeStunTest.stunConnect();

function cb(){
    console.log('yay!');
}

function errCb(){
    console.log('boo!');
}

test.NodeStunTest.newStunRequest('stun.l.connectifyswitchboard.com', 3478, cb, errCb);
test.NodeStunTest.newStunRequest('stun.l.google.com', 19302, cb, errCb);
test.NodeStunTest.newStunRequest('bullshit.connectifyswitchboard.com', 19302, cb, errCb);
test.NodeStunTest.newStunRequest('stun.l.connectifyswitchboard.com', 19302, cb, errCb);
