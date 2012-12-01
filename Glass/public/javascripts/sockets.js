var SocketControls = function(){
  // constructor = function(){
    this.game = new Game();
  // }
  this.tiltLR = 0;
  this.tiltFB = 0;
  this.socket = io.connect('http://192.168.1.125:3000');
  this.init = function(){
    _t = this;
    if(this.game!=undefined){
      // console.log()
    this.socket.on('gameId', function(data){
      _t.game.gameId = data;
      _t.game.genPlayers(1)
    })
    this.socket.on('glass', function (data) {
      _t.game.checkForPlayers(data);
    });
    this.socket.on('xy_toParent', function(data){
      _t.tiltLR = -data.tiltLR;
      _t.tiltFB = -data.tiltFB;
    });
  }
    
  }
  this.setClickFunction = function( f ){
    this.socket.on('fire', function(d){
      f.call();
    })
  };
}
// var socket = io.connect('http://192.168.1.125:3000');
// //var socket = io.connect('http://plkap74.glass.js.jit.su');
// // var socket = io.connect('http://localhost:3000')
// var g = new Game();
// // g.reportPlayers();
// var phoneState = {
//   tiltLR : 0,
//   tiltFB : 0,
//   
// }
// socket.on('gameId', function(data){
//   g.gameId = data;
//   g.genPlayers(1)
// })
// socket.on('glass', function (data) {
//   g.checkForPlayers(data)
//   // console.log(socket, data.parent)
//   // socket.emit('my other event', { my: 'data' });
// });
// socket.on('xy_toParent', function(data){
//   controls.rollVelocity = -(data.tiltFB+90.0)
//   controls.gravity += -(data.tiltLR/10);
//   controls.rotationVelocity = -data.tiltLR
// });
// socket.on('fire', function(d){
//   var now = new Date();
//   console.log("glass to parent time: "+(d-now.getTime()));
//   controls.jump();
// })