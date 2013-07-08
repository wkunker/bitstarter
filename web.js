var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

var indexPage;

var indexLoadFail = function(e) {
  console.log('Problem loading index.html -- "' + e + '"');
  process.exit(1);
};

var loadIndex = function() {
  try {
    indexPage = fs.readFileSync('index.html').toString();
  } catch(e) {
    indexLoadFail(e);
  }
};

app.get('/', function(request, response) {
  if(indexPage === undefined) {
    indexLoadFail('EXCEPTION NOT CAUGHT');
  }

 response.send(indexPage);
});

var port = process.env.PORT || 5000;

app.listen(port, function() {
  loadIndex();
  console.log("Listening on " + port);
});
