
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


if ('development' == app.get('env')) {
  app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}


if ('production' == app.get('env')) {
  app.use(errorHandler());
}


var MAPS = {};
function makeid(){
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 10; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


//catch-all because angular 
app.get('/', function(req, res){

  var mapdata = { map: { } };
  if (req.query.hasOwnProperty('map')) {

    var room = req.query.map;

    if (MAPS.hasOwnProperty(room)) {
      mapdata = MAPS[room];
    }
    else {
      mapdata.map['room'] = req.query.map;
      mapdata.map['data'] = [];
      MAPS[room] = mapdata;
    }
res.render(__dirname + '/public/index.html', mapdata);
  }
  else  {
    res.redirect('/?map=' + makeid());
  }

});

app.use(express.static(__dirname + '/public'));


// Socket.io Communication

io.sockets.on('connection', function(socket) {
  socket.emit('init', {});
  socket.on('room', function(room) {

    var $rm = room;
    socket.join(room);

    socket.on('add:marker', function (data) {
      if (!MAPS.hasOwnProperty($rm)) {
        console.log('ERROR !rm:', socket);
      }
      else {
        io.sockets.in($rm).emit('add:marker', data );
        MAPS[$rm].map.data.push(data.data);
      }
    });


  });
});

// Start server

server.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
});
