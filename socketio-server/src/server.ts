#!/usr/bin/env node

/**
 * Module dependencies.
 */

import "reflect-metadata";
import app from "./app";
var debug = require("debug")("socketio-server:server");
import * as http from "http";
import socketServer from "./socket";

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort("9000");
app.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

const io = socketServer(server);

// Lắng nghe sự kiện connection

// io.on("connection", (socket) => {
//   socket.on("create_room", (data) => {
//     console.log("create_room: ", data); // Đây sẽ nhận được dữ liệu "Player 1"
//   });
// });

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
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
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
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);

  console.log("Server Running on Port: ", port);
}
