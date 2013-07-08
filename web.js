var express = require('express');

var app = express.createServer(express.logger());

var indexPage;

var indexLoadFail(e) {
  console.error('Problem loading index.html -- "' + e + '"');
  process.exit(1)
}

try {
    indexPage = fs.readFileSync('index.html').toString()
  } catch(e) {
    indexLoadFail(e)
  }
});

if(indexPage === undefined) {
  indexLoadFail('EXCEPTION NOT CAUGHT')
}

  app.get('/', function(request, response) {

  response.send(indexPage);

  var port = process.env.PORT || 5000;
  app.listen(port, function() {
    console.log("Listening on " + port);
});
