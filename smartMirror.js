var connect = require('connect');
var serveStatic = require('serve-static');

var WebSocketServer = require('websocket').server;
var http = require('http');

var app = connect();
var server = http.createServer(app);
wsServer = new WebSocketServer({ httpServer: app });

app.use(serveStatic('./public'));
app.listen(8080, function(){
	console.log('Server running on 8080...');
})

	var count = 0;
	var clients = {};

wsServer.on('request', function(r){
	console.log('in');
	var connection = r.accept('echo-protocol', r.origin);
	var id = count++;

	clients[id] = connection

 	console.log((new Date()) + ' Connection accepted [' + id + ']');

 	connection.on('message', function(message) {
 		console.log('Message received: ' + message)
 	})

 	connection.on('close', function(reasonCode, description) {
    	delete clients[id];
    	console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
	});
});

// connect().use(serveStatic('./public')).listen(8080, function(){
//     console.log('Server running on 8080...');
// });

//--------------------------------

const spawn = require('child_process').spawn;
var hotWord = spawn('python', ['./snowboy/demo.py'], {detached: false})

hotWord.stderr.on('data', function(data) {
	var message = data.toString()
	if (message.startsWith('INFO:snowboy:Keyword')){
		console.log(data.toString())	
}})