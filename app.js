var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
const google = require('./google.js')
const fs = require('fs');
const oauthRouter = express.Router()
oauthRouter.get('/oauthstage1', (req,res,next)=>{
  google.callback(req,res,'/oauthstage1')
})
oauthRouter.get('/oauthstage2', (req,res,next)=>{
  google.callback(req,res,'/oauthstage2')
})
oauthRouter.get('/oauthstage3', (req,res,next)=>{
  console.log(req.url);
  google.callback(req,res,req.url)
})
oauthRouter.get('/stage1.js', (req,res,next)=>{
  res.end(fs.readFileSync('clientjs/stage1.js'))
})
oauthRouter.get('/stage2.js', (req,res,next)=>{
  res.end(fs.readFileSync('clientjs/stage2.js'))
})
app.use('/oauth', oauthRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Bits added to the end for the backend, probably awful and wrong.

const googleapis = require('googleapis').google;
const WebSocket = require('ws');
const http = require('http');
const uuid = require('uuid/v4');
const conf = require('./config')
const db = require('./db');
const ad = require('./admin');
async function init(){
  await db.init().catch(r=>{console.log(`RECORDS, ERROR: Failed to connect to database. ${r}`);process.exit(1)})
}
init()

async function session(ws, req) {
  console.log("Got new connection");
  var auth = await google.prepare(ws)
  var peopleAPI = googleapis.people({
    version: 'v1',
    auth: auth.auth
  })
  var classroomAPI = googleapis.classroom({
    version: 'v1',
    auth: auth.auth
  })
  var user = await peopleAPI.people.get({
    resourceName: 'people/me',
    personFields: 'emailAddresses,names'
  })
  console.log(`RECORDS, LOGGING: User ${user.data.names[0].displayName} has connected with email ${user.data.emailAddresses[0].value}.`);
  var userQuery = await db.getUserByAddress(user.data.emailAddresses[0].value)
  var userID, address, name, admin
  if (userQuery != undefined) {
    userID = userQuery.uuid
    address = userQuery.address
    name = userQuery.name
    admin = userQuery.role == 'admin'
  } else {
    userID = uuid()
    admin = false
    await db.addUser(userID, user.data.emailAddresses[0].value, user.data.names[0].displayName).catch(r => {
      console.log(`RECORDS, ERROR: ${r}`)
    })
    address = user.data.emailAddresses[0].value
    name = user.data.names[0].displayName
  }
  ws.send(JSON.stringify({
    action: "ready",
    name: name,
    email: address,
    balance: db.getBalance(userID)
  }))
  ws.on('message', async (stringMessage) => {
    var message = JSON.parse(stringMessage)
    switch (message.action) {
      case "getBalance": {
        var balance = await db.getBalance(userID)
        ws.send(JSON.stringify({
          action: "balance",
          balance: balance
        }))
        break;
      }
      case "sendCoin": {
        var targetAddress = message.target
        var isBalanceSufficient
        var target
        await Promise.all([
          new Promise(async (r, rj) => {
            var balance = await db.getBalance(userID).catch(rj)
            isBalanceSufficient = balance > message.amount
            r()
          }),
          new Promise(async (r, rj) => {
            target = await db.getUserByAddress(targetAddress).catch(rj)
            r()
          })
        ])
        console.log(isBalanceSufficient);
        if (message.amount !== parseInt(message.amount, 10) || !/[A-Za-z0-9]*\@[A-Za-z0-9]*\.[a-z]{3}/.test(message.target)) {
          ws.send(JSON.stringify({
            action: "sendResponse",
            status: "badInput"
          }))
        } else if (isBalanceSufficient && target != undefined) {
          await db.addTransaction(userID, target[0], message.amount)
          ws.send(JSON.stringify({
            action: "sendResponse",
            status: "ok"
          }))
        } else if (target == undefined) {
          ws.send(JSON.stringify({
            action: "sendResponse",
            status: "nonexistentTarget"
          }))
        } else if (!isBalanceSufficient) {
          ws.send(JSON.stringify({
            action: "sendResponse",
            status: "insufficientBalance"
          }))
        }
        break;
      }
      case "mintCoin": {
        if (message.amount !== parseInt(message.amount, 10)) {
          ws.send(JSON.stringify({
            action: "sendResponse",
            status: "badInput"
          }))
        } else if (admin) {
          await db.addTransaction('nobody', userID, message.amount)
          ws.send(JSON.stringify({
            action: "mintResponse",
            status: "ok"
          }))
        } else {
          ws.send(JSON.stringify({
            action: "mintResponse",
            status: "denied"
          }))
          console.log(`RECORDS, WARNING: UNAUTHORIZED USER ${name} ATTEMPTS TO MINT ${message.amount}`);
        }
        break;
      }
      case "voidCoin": {
        if (message.amount !== parseInt(message.amount, 10)) {
          ws.send(JSON.stringify({
            action: "sendResponse",
            status: "badInput"
          }))
        } else if (admin) {
          await db.addTransaction(userID, 'nobody', message.amount)
          ws.send(JSON.stringify({
            action: "voidResponse",
            status: "ok"
          }))
        } else {
          ws.send(JSON.stringify({
            action: "voidResponse",
            status: "denied"
          }))
          console.log(`RECORDS, WARNING: UNAUTHORIZED USER ${name} ATTEMPTS TO VOID ${message.amount}`);
        }
        break;
      }
      case "getClasses": {
        var result = await google.getCourses(classroomAPI)
        if (result.err) {
          ws.send(JSON.stringify({
            action: "getClassesResponse",
            status: "ServerError",
            err: result.err
          }))
        } else {
          var courses = result.res.data.courses
          if (courses && courses.length) {
            ws.send(JSON.stringify({
              action: "getClassesResponse",
              status: "ok",
              classes: courses
            }))
          }
        }
        break;
      }
      case "getStudents": {
        var result = await google.getStudents(classroomAPI, message.classID)
        if (result.err) {
          ws.send(JSON.stringify({
            action: "getStudentsResponse",
            status: "ServerError",
            err: result.err
          }))
        } else {
          console.log(result.res.data);
          var students = result.res.data.students
          ws.send(JSON.stringify({
            action: "getStudentsResponse",
            status: "ok",
            students: students
          }))
        }
        break;
      }
      case "oauthInfo": {}
      case "elevate": {
        if (!admin || !conf.enableRemote) {
          console.log(`RECORDS, WARNING: UNAUTHORIZED USER ${name} ATTEMPTS ELEVATED ACTION ${message.procedure} WITH BODY ${message.body}`);
          ws.send(JSON.stringify({
            action: "elevateResponse",
            status: "denied"
          }))
          return;
        } else {
          console.log(`RECORDS, LOGGING: USER ${name} EXECUTES ELEVATED ACTION ${message.procedure} WITH BODY ${message.body}`);
          ad.handle(message, ws).catch((re) => {
            ws.send(JSON.stringify({
              action: "elevateResponse",
              status: "error",
              contents: re
            }))
          })
        }
        break;
      }
      default:
        console.error(`RECORDS, WARNING: User ${name} attempts invalid action.`);
    }
  })
  ws.on('close', async () => {
    console.log(`RECORDS, LOGGING: User ${name} has disconnected.`);
  })
}

module.exports.app = app;
module.exports.wssessionmethod = session
