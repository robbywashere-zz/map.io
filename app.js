
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    errorHandler = require('errorhandler');

var app = module.exports = express();


var server = http.createServer(app);

// Hook Socket.io into Express
var io = require('socket.io').listen(server);

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.json());

//app.use(methodOverride('X-HTTP-Method'));          // Microsoft
//app.use(methodOverride('X-HTTP-Method-Override')); // Google/GData
//app.use(methodOverride('X-Method-Override'));      // IBM;
//app.use(methodOverride('_method'));

app.use(express.static(__dirname + '/public'));

if ('development' == app.get('env')) {
  app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}


if ('production' == app.get('env')) {
  app.use(errorHandler());
}


//catch-all because angular 
app.get('*', function(req, res){
  console.log(req);

  res.sendFile(__dirname + '/public/index.html');
});



// Socket.io Communication

io.sockets.on('connection', function(socket) {
  socket.emit('init', {});
  socket.on('add:marker', function (data) {
    socket.broadcast.emit('add:marker', data );
  });
});

// Start server

server.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
});
