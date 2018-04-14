var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var spectator = io.of('/spectator');
var player = io.of('/player');


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:' + 3000);
});

player.on('connection', function(socket){
	console.log("Player Connected");
  socket.on('chat message', function(msg){
    player.emit('chat message', msg);
  });
});

spectator.on('connection', function(socket){
	console.log("Spectator Connected");
  socket.on('chat message', function(msg){
    spectator.emit('chat message', msg);
  });
});