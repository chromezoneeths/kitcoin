/* jshint -W104, -W119*/
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var fs = require('fs');

var config = require('./config');
var keys = require('./keys');
var indexRouter = require('./routes/index');
var dashboardRouter = require('./routes/dashboard');
var loginRouter = require('./routes/login');

var app = express();

// Checks if code should use a local https certificate, configured by env variables. See https://docs.google.com/document/d/1-oF_bcskiEk2IDY2Tt8Ct5rXgFG-2JJK2e64DSvHq1A/edit?usp=sharing.
if (process.env.LOCAL_HTTPS) {
  var http = require('https');
  var key = fs.readFileSync(process.env.KEY_PATH);
  var cert = fs.readFileSync(process.env.CERT_PATH);
  http.createServer({
    key: key,
    cert: cert
  }, app).listen(config.nodePort, () => {
    console.log('KitCoin is listening on port ' + config.nodePort + '.');
  });
} else {
  var http = require('http').createServer(app);
  app.listen(config.nodePort, () => {
    console.log('KitCoin is listening on port ' + config.nodePort + '.');
  });
}

var io = require('socket.io')(http);


// view engine setup
app.engine('hbs', exphbs({
  extname: 'hbs',
  defaultLayout: false
}));
app.set('view engine', 'hbs');

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/dashboard', dashboardRouter);
app.use('/login', loginRouter);
app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (err)
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;