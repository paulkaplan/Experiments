var http = require('http');
var querystring = require('querystring');
var fs = require('fs');
var index = fs.readFileSync('3d.html');

function postRequest(request, response, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'});
                request.connection.destroy();
            }
        });

        request.on('end', function() {
            response.post = querystring.parse(queryData);
            callback();
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}
// function onRequest(request, response){
//   var data = '';
//   request.setEncoding('utf8');

//   // Request received data.
//   request.on('data', function(chunk) {
//     data += chunk;
//   });

//   // The end of the request was reached. Handle the data now.
//   request.on('end', function() {
//     console.log("Request: "+data+"\n");
//     // var d = JSON.parse(data);
//     // console.log(d);
//     response.writeHead(200, {"Content-Type":"text/plain"});
//     response.write("Hello, World");
//     response.end();
//   });
// }

http.createServer(function(request, response) {
  if(request.method == 'POST') {
    postRequest(request, response, function() {
        console.log(response.post);

        response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
        response.end();
    });
  }
  else {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.end(index);
  }

}).listen(8000);