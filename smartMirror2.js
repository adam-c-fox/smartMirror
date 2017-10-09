var express = require('express')
var http = require('http');
var app = express();

app.set('port', 8080);
app.use(express.static('./public'));

var server = http.createServer(app);

server.listen(8080, function(){
	console.log('Server listening on port 8080...')
});

//WebSocket ------------------------------------
var io = require('socket.io')(server);

io.on('connection', function(socket) {
	console.log((new Date()) + ' Connected');

	socket.on('disconnect', function(){
		console.log((new Date()) + ' Disconnected')
	})

	socket.on('screenOff', function() {
		exec('sudo tvservice -o', puts);
	})

	socket.on('screenOn', function() {
		exec('sudo tvservice -p', puts);
		exec('sudo chvt 9 && sudo chvt 7', puts);
	})
})

//Unix commands
var sys = require('util');
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { console.log(stdout)}

//Snowboy --------------------------------------
const spawn = require('child_process').spawn;
var hotWord = spawn('python', ['./snowboy/recog.py'], {detached: false})

hotWord.stderr.on('data', function(data) {
	var message = data.toString()
	if (message.startsWith('INFO:snowboy:Keyword')){
		//console.log(data.toString())
		console.log((new Date()) + ' Hotword Detected')
		io.emit('Hotword');	
}})
