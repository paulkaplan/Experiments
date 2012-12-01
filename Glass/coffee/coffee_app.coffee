express = require 'express'
http    = require 'http'
app     = express()

app.configure    ->
  # Settings
  app.set 'port', process.env.PORT || 8000 
  app.set 'views', __dirname + '/views' 
  app.set 'view engine', 'jade' 
  app.use express.favicon
  app.use express.bodyParser   
  app.use express.methodOverride   
  app.use app.router 
  app.use express.static __dirname+'/public'

  # Routes
  app.get '/', (req,res) ->
    res.render('flyover', { title: 'Express' })
  app.get '/glass/:parent_id/:glass_id', (req,res)->
    res.render 'glass', 
      title: 'Express'
      glass_id : req.params.glass_id
      parent_id : req.query['parent']
  app.get '/flyover', (req,res) ->
    res.render('flyover', { title: 'Express' })
    
  server = http.createServer(app).listen app.get('port'), ()->
    console.log "Express server listening on port " + app.get('port') 

 io = require 'socket.io' .listen server 
io.set 'log level', 1 
clients = {} 
io.sockets.on 'connection', (socket) ->
  clients[socket.id] = socket
  socket.emit  'gameId', socket.id  
  socket.on 'fire', (d) ->  
    socket.broadcast.emit 'fire', d 
    
  socket.on 'init', (d) ->   
    parent_id = d.parent_id
    socket.broadcast.emit 'glass',  
      parent: d.parent_id, 
      glass: d.glass_id

    
    socket.on 'xy', (d) ->  
      clients[parent_id.toString  ].emit 'xy_toParent', d 
      
  