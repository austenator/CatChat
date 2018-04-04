/** server.js
 * Server for a simple chat engine
 */

// Constants
const PORT = 3000;

// Requires
var fs = require('fs');
var path = require('path');
var express = require('express');
var roomController = require('./controller/rooms-controller.js');
var messagesController = require('./controller/messages-controller.js');

// Set up server
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// Routing
app.use(express.static(path.join(__dirname, 'public')));

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
  var color = 'gray';
  var roomId = 'lobby';

  // Count the user
  connected++;

  // Let the other users know a user joined
  io.emit('joined', name);

  // Add an event handler for when the user sends
  // us a message
  socket.on('message', function(text) {
    var message = {
      user: name,
      text: text,
      roomId: roomId,
      roomName: roomController.getRoomById(roomId).name,
      color: color
    };

    io.emit('message', message);
    messagesController.storeMessage(message);
  });

  // Add an event handler for when the user changes
  // thier color
  socket.on('color', function(newColor) {
    color = newColor;
  });

  socket.on('room', function(newRoomId) {
    var roomObject = roomController.getRoomById(newRoomId);
    var roomName = roomObject.name;
    io.emit('changed-room', name, roomId, newRoomId, roomName);
    roomId = newRoomId;
  });

  socket.on('name', function(newName)
  {
    var oldName = name;
    name = newName;
    io.emit('changed-name', oldName, newName);
  });

  // Add an event handler for when the user leaves
  socket.on('disconnect', function(){
    // let the other users know who has left
    io.emit('left', name);
  });

  // Send a welcome message to the user
  var welcomeMessage = "<strong>Welcome " + name + "!</strong>";
  welcomeMessage += " Check out the <a href='https://github.com/austenator/CatChat'>repo.</a>";
  socket.emit('welcome', welcomeMessage, name);
  socket.emit('room-list', roomController.list());
});
