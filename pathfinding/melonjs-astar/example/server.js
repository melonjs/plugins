var express = require('express'),
    app     = express(),
    http    = require('http');


app.use('/', express.static(__dirname));

var httpServer = http.createServer(app);

httpServer.listen(8080);

console.log('listening on 8080');
