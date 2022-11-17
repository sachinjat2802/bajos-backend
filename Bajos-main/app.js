require('dotenv').config()
const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
const debug = require('debug')('mmnt:server');
const helmet = require("helmet");
const cors = require('cors');
const logger = require('morgan')

const connect = require("./connection/connect");
const v1Routes = require('./v1/routes')
const sendFailResponse = require("./utility/response").sendFailResponse

const app = express();

app.use(cors())
app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(logger("dev"));

// connecting routes
app.use('/api/v1/', v1Routes);

// 404 Error 
app.use((req, res, next) => {
  const err = "Oops! Page Not Found";
  res.status(404).send({ status: 404, message: err });
});

/**
 * Error Handeling
 */

app.use((err, req, res, next) => {
  const status = err.status || 400;
  console.log("Woopsiee!! You Ran Into Error (())====>>>  ", err)
  if (err.message == "jwt expired" || err.message == "Authentication error") { return res.status(401).send({ statusCode: 401, message: err }) }
  if (typeof err == typeof "") sendFailResponse(req, res, status, err)
  else if (err.Error) sendFailResponse(req, res, status, err.Error);
  else if (err.message) sendFailResponse(req, res, status, err.message)
  else sendFailResponse(req, res, status, err);
});

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});


let port = normalizePort(process.env.PORT) || 5000;
app.set('port', port);
let server = http.createServer(app);

server.listen(port, async () => {
  console.log(`Server up and running on port: ${port}`);
  await connect.mongoDbconnection();
});


server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
