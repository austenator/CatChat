/** server.js
 * Server for a simple chat engine
 */

// Constants
const PORT = 3000;

// Requires
var fs = require('fs');
var express = require('express');
var path = require('path');

// Set up server
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// Routing
app.use(express.static(path.join(__dirname, 'public')));
// app.get('/socket.io/socket.io.js', function(req, res){
//   res.sendFile(path.join(__dirname,'/index.html'));
// });

// Listen
server.listen(PORT, function () {
  console.log('Server listening at port %d.', PORT);
});

// Track how many users have connected
var connected = 0;

/** event hander 'connection'
 * handles a new user connecting to the websocket server
 */
io.on('connection', function(socket){
  // Set the user properties
  var name = 'User ' + connected;

  // Count the user
  connected++;

  // Let the other users know a user joined
  io.emit('joined', name);

  // Add an event handler for when the user sends
  // us a message
  socket.on('message', function(text) {
    io.emit('message', {
      user: name,
      text: text
    });
  });

  // Add an event handler for when the user leaves
  socket.on('disconnect', function(){
    // let the other users know who has left
    io.emit('left', name);
  });

  // Send a welcome message to the user
  var welcomeMessage = "<strong>Welcome " + name + "!</strong>";
  welcomeMessage += " Check out the <a href='https://github.com/austenator/CatChat'>repo.</a>";
  socket.emit('welcome', welcomeMessage);
});
