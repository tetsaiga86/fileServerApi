var express = require('express');
var app = express();

var apiRouter = require('./routers/apiRouter');

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.use('/api', apiRouter);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
