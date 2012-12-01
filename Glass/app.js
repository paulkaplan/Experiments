
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http');
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/glass/:parent_id/:glass_id', require('./routes/glass') )

app.get('/flyover', require('./routes/flyover') )

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


var io = require('socket.io').listen(server);
io.set('log level', 1);
clients = {};
io.sockets.on('connection', function (socket) {
  var parent_id;
  clients[socket.id] = socket;
  socket.emit( 'gameId', socket.id )
  socket.on('fire', function(d){
    // var now = new Date();
    socket.broadcast.emit('fire', d);
    // console.log( "glass to server time: "+(now.getTime() - d) )
  })
  socket.on('init', function(d) {
    parent_id = d.parent_id;
    socket.broadcast.emit('glass', {
      parent: d.parent_id, 
      glass: d.glass_id
    });
    // console.log(d.parent_id.toString())
    // console.log(parent)
  });
    socket.on('xy', function(d){
      clients[parent_id.toString()].emit('xy_toParent', d)
    });
});
