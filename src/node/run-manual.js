var test = require('./index.js');

//test.NodeStunTest.stunConnect();

function cb(){
    console.log('yay!');
}

function errCb(){
    console.log('boo!');
}

test.NodeStunTest.newStunRequest('docker-vz-2.connectify.me', 3478, cb, errCb);

test.NodeStunTest.newStunRequest('stun.l.connectifyswitchboard.com', 3478, cb, errCb);
test.NodeStunTest.newStunRequest('stun.l.google.com', 19302, cb, errCb);
//test.NodeStunTest.newStunRequest('doesnotresolve.connectifyswitchboard.com', 19302, cb, errCb);
//test.NodeStunTest.newStunRequest('stun.l.connectifyswitchboard.com', 19302, cb, errCb);


test.NodeStunTest.newStunRequest('sb-fr-paris-1.connectify.me', 3478, cb, errCb);
test.NodeStunTest.newStunRequest('sb-us-nyc-1.connectify.me', 3478, cb, errCb);
test.NodeStunTest.newStunRequest('sb-us-nova-1.connectify.me', 3478, cb, errCb);
test.NodeStunTest.newStunRequest('sb-sg-singapore-1.connectify.me', 3478, cb, errCb);
test.NodeStunTest.newStunRequest('sb-us-dallas-1.connectify.me', 3478, cb, errCb);
test.NodeStunTest.newStunRequest('sb-us-chicago-1.connectify.me', 3478, cb, errCb);
test.NodeStunTest.newStunRequest('sb-us-sanjose-1.connectify.me', 3478, cb, errCb);
test.NodeStunTest.newStunRequest('sb-us-la-1.connectify.me', 3478, cb, errCb);
test.NodeStunTest.newStunRequest('sb-br-saopaulo-1.connectify.me', 3478, cb, errCb);
test.NodeStunTest.newStunRequest('sb-au-sydney-1.connectify.me', 3478, cb, errCb);
test.NodeStunTest.newStunRequest('sb-jp-tokyo-1.connectify.me', 3478, cb, errCb);
test.NodeStunTest.newStunRequest('sb-in-chennai-1.connectify.me', 3478, cb, errCb);
//test.NodeStunTest.newStunRequest('sb-uk-london-1.connectify.me', 3478, cb, errCb);
