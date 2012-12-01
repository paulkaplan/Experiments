var qrURL   = 'http://chart.apis.google.com/chart?cht=qr&chs=300x300&chl='
var baseURL = 'http://192.168.1.125:3000/glass/'

var getQR = function( id, gId ){
  var reqURL = qrURL+baseURL+gId+'/'+id+'?parent='+gId;
  $('#overlay').append("<div id="+id+"><h3>Player "+id+"</h3><p>Scan this barcode with your phone, follow the link, and hold the phone with the arrows facing towards the computer. Enjoy! -Paul</p><img src='"+reqURL+"'/></div>"); 
  // $('#overlay').click( function(){
  //   g.player[0].login()
  // })
}

var Game = function(){
  this.players = [];
  this.pushNewPlayer = function(){
    var newPlayer = new PlayerCell()
    this.players.push(newPlayer)
    this.numPlayers++;
    getQR(newPlayer.id, this.gameId)
  };
  this.numPlayers = 0;
  this.reportPlayers = function(){
    for(var n=0; n<this.numPlayers; n++){
      console.log(this.players[n].id)
    }
  };
  this.genPlayers = function( nPlayers ){
    for(var n=0; n<nPlayers; n++){
      this.pushNewPlayer();
    }
  };
  this.checkForPlayers = function( glass_info ){
    for(var n=0; n<this.numPlayers; n++){
      // console.log(this.players[n].id, glass_info.glass)
      if(this.players[n].id == glass_info.glass){
        this.players[n].login();
      }
    }
  };
  this.gameId = 0;
  this.socketReady = function(){
    if(this.gameId){return true}
    return false;
  }
}
var PlayerCell = function(){
  this.id = ~~( Math.random()*1000000000 );
  this.face = function(){
    return this.id;
  };
  this.login = function(){
    var el = $('#overlay')
    $('#container').fadeIn(1500)
    window.scrollTo(0, window.innerHeight)
    init();
  }
}