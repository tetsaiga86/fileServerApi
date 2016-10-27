var express = require('express');
var apiRouter = require('./routers/apiRouter');
const formidable = require('express-formidable');
var app = express();

app.use(formidable());

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.use('/api', apiRouter);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
