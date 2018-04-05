/** server.js
 * Server for a simple chat engine
 */

// Constants
const PORT = 3000;

// Requires
var fs = require('fs');
var path = require('path');
var express = require('express');

// Set up server
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// Data controllers
var roomController = require('./controller/rooms-controller.js');
var rooms = roomController.list();

var messagesController = require('./controller/messages-controller.js');
messagesController.initFileStorage(rooms);

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Listen
server.listen(PORT, function () {
  console.log('Server listening at port %d.', PORT);
});

// Track how many users have connected
var connected = 0;

// usernames which are currently connected to the chat
var usernames = [];

/** event hander 'connection'
 * handles a new user connecting to the websocket server
 */
io.on('connection', function(socket){
  // Set the user properties
  // var name = 'User ' + connected;
  var currentRoom = 'lobby';

  // Count the user
  connected++;

  // when the client emits 'adduser', this listens and executes
  socket.on('adduser', function(username){
    // store the username in the socket session for this client
    socket.username = username;
    // store the room name in the socket session for this client
    socket.room = currentRoom;
    // add the client's username to the global list
    usernames.push(username);
    // name = username;
    // send client to room 1
    socket.join(currentRoom);
    // echo to client they've connected
    socket.emit('updatechat', 'SERVER', 'Welcome to Cat Chat. Please select your class to the left.');
    // echo to room 1 that a person has connected to their room
    socket.broadcast.to(currentRoom).emit('updatechat', 'SERVER', username + ' has connected to this room.');
    socket.emit('updaterooms', rooms, currentRoom);
  });

  // when the client emits 'sendchat', this listens and executes
  socket.on('sendchat', function (data) {
      // we tell the client to execute 'updatechat' with 2 parameters
      if (socket.room == "lobby")
      {
        socket.emit('updatechat', 'SERVER', 'Talking isn\'t allowed in the Lobby. Please go to class.');
      }
      else
      {
        io.sockets.in(socket.room).emit('updatechat', socket.username, data);
        messagesController.storeMessage(socket.username, socket.room, data);
      }
  });

  socket.on('name', function(new_name){
    var old_name = socket.username;
    socket.username = new_name;
    io.emit('changed-name', old_name, new_name);
  });

  socket.on('switchRoom', function(newroom){
    var newRoomName = "";

    for (var i = 0; i < rooms.length; i++)
    {
      if (rooms[i].id == newroom)
      {
        newRoomName = rooms[i].name;
        break;
      }
    }

    // leave the current room (stored in session)
    socket.leave(socket.room);
    // join new room, received as function parameter
    socket.join(newroom);
    socket.emit('updatechat', 'SERVER', 'You have connected to '+ newRoomName + '!');
    // sent message to OLD room
    socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room.');
    // update socket session room title
    socket.room = newroom;
    socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room.');
    socket.emit('updaterooms', rooms, newroom);

    currentRoom = newroom;
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function(){
    // remove the username from global usernames list
    usernames = usernames.filter(e => e !== socket.username);
    // update list of users in chat, client-side
    io.sockets.emit('updateusers', usernames);
    // echo globally that this client has left
    socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected.');
    socket.leave(socket.room);
  });
});
