/** server.js
 * Server for a simple chat engine
 */

// Requires:
var fs = require('fs');
var path = require('path');
var express = require('express');
var sanitize = require('./helpers/escapeHTML');

// Constants:
const PORT = process.env.PORT || 3000;
var lobby = "lobby";
const LOGS_PATH = path.join(__dirname,'messages');

// Set up express application and server.
var app = express();
app.set('view engine', 'ejs');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// Initialize controllers:
var roomController = require('./controller/rooms-controller.js');
var messagesController = require('./controller/messages-controller.js');

// Read in all the class rooms.
var availableRooms = roomController.listAll();
messagesController.initFileStorage(availableRooms);
var rooms = roomController.list();

// Routes:
app.get('/logs', messagesController.handleLogPopulation);
app.get('/', getHome);
app.get('/logs/log', messagesController.getLogByName);
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', getNotFound);

// Listen:
server.listen(PORT, function () {
  console.log('Server listening at port %d.', PORT);
});

// Route for getting the home view.
function getHome(req,res){
  res.statusCode = 200;
  res.render('home');
}

// Route for getting a 404 not found view.
function getNotFound(req,res){
  res.statusCode=404;
  res.render('notFound');
}
// usernames which are currently connected to the chat
var usernames = [];

/**
 * Handles a new connection of a user.
 * @param  {io.Socket} socket The user's socket.
 * @return {undefined}
 */
io.on('connection', function(socket){
  // Initialize the user to be in the lobby.
  var currentRoom = 'lobby';

  // When the client emits 'adduser', this listens and executes.
  socket.on('addUser', function(username){
    // Store the username in the socket session for this client.
    socket.username = username;
    // Store the room name in the socket session for this client.
    socket.room = currentRoom;
    // Add the client's username to the global list.
    usernames.push(username);
    // Send user to lobby.
    socket.join(currentRoom);
    // Echo to user they've connected.
    socket.emit('updateChat', 'SERVER', 'Welcome to Cat Chat. Please select your class to the left.');
    // Echo to lobby that a person has connected to their room.
    socket.broadcast.to(currentRoom).emit('updateChat', 'SERVER', username + ' has connected to this room.');
    updateRooms();
    socket.emit('updateRooms', rooms, currentRoom);
  });

  /**
   * Sends a user's chat to their current room.
   * @param  {String} data The message the user is trying to send.
   * @return {undefined}
   */
  socket.on('sendChat', function (message) {
      // If the user is trying to send a message in the lobby, alert them they cannot.
      if (socket.room == "lobby")
      {
        socket.emit('updateChat', 'SERVER', 'Talking isn\'t allowed in the Lobby. Please select a class.');
      }
      else
      {
        // Emit the message to everyone in the room.
        io.sockets.in(socket.room).emit('updateChat', socket.username, message);
        // Store the message.
        messagesController.storeMessage(socket.username, socket.room, message);
      }
  });
/**
 * Sanitizes the given name and updates their name on the socket connection.
 * @param  {String} newName The raw name from the UI in need of sanitization.
 * @return {undefined}
 */
  socket.on('updateName', function(newName){
    // Sanitize the name with a helper function.
    var sanitizedName = sanitize.escapeHTML(newName);
    var oldName = socket.username;
    // Update the name on the user's socket.
    socket.username = sanitizedName;
    // Update the user's name on the client side.
    socket.emit('sanitizeName', sanitizedName);
    // Alert everyone in the same room that the user changed their name.
    io.emit('changedName', oldName, sanitizedName);
  });

  /**
   * Updates the server's information on which room the user is in.
   * @param  {String} newRoom The room name to switch to.
   * @return {undefined}
   */
  socket.on('switchRoom', function(newRoom){
    var newRoomName = "";

    for (var i = 0; i < rooms.length; i++)
    {
      if (rooms[i].id == newRoom)
      {
        newRoomName = rooms[i].name;
        break;
      }
    }

    // Leave the current room (stored in session).
    socket.leave(socket.room);
    // Join new room.
    socket.join(newRoom);
    // Update the user's message log to reflect previous messages.
    socket.emit('switchRoom', messagesController.getMessagesByRoomId(newRoom));
    // Alert the user they have entered the room.
    socket.emit('updateChat', 'SERVER', 'You have connected to '+ newRoomName + '!');
    // Alert old room the user left.
    socket.broadcast.to(socket.room).emit('updateChat', 'SERVER', socket.username+' has left this room.');
    // Update socket session information.
    socket.room = newRoom;
    // Alert new room the user has joined.
    socket.broadcast.to(newRoom).emit('updateChat', 'SERVER', socket.username+' has joined this room.');
    // Update rooms on server side.
    updateRooms();
    // Update the rooms list for the client to reflect the new room.
    socket.emit('updateRooms', rooms, newRoom);
    currentRoom = newRoom;
  });

  /**
   * Disconnects the user's socket connection.
   * @return {undefined}
   */
  socket.on('disconnect', function(){
    // Remove the username from global usernames list.
    usernames = usernames.filter(e => e !== socket.username);
    // Update list of users in chat, client-side.
    io.sockets.emit('updateUsers', usernames);
    // Echo globally that this client has left.
    socket.broadcast.emit('updateChat', 'SERVER', socket.username + ' has disconnected.');
    socket.leave(socket.room);
  });

  function updateRooms() {
      var newRooms = roomController.list();
      // console.log(newRooms);
      for (var i = 0; i < rooms.length; i++)
      {
          var roomStillOpen = false;
          for (var j = 0; j < newRooms.length; j++)
          {
              // console.log("comparing new "+newRooms[j].id + " to old "+rooms[i].id);
              // console.log(newRooms[j].id == rooms[i].id);
              if (newRooms[j].id == rooms[i].id)
              {
                  roomStillOpen = true;
              }

              // console.log("roomflag = " +roomStillOpen);
          }
          if (!roomStillOpen)
          {
              // close room
              // TODO make use of node scheduling. to give warnings
              var clients = io.sockets.adapter.rooms[rooms[i].id];

              if (clients.length > 0)
              {
                socket.broadcast.to(rooms[i].id).emit('updateChat', 'SERVER', rooms[i].name+' has closed. The chat log will be available for download in a moment.');
                // move everyone to Lobby
                for (var k = 0; k < clients.length; k++)
                {
                  clients[k].leave(rooms[i].id);
                  clients[k].join(lobby);
                  clients[k].emit('switchRoom', messagesController.getMessagesByRoomId(newroom));
                  clients[k].emit('updateChat', 'SERVER', 'You have been moved to the lobby.');
                }
                // io.sockets.clients(rooms[i].id).forEach(function(s){
                //     s.leave(rooms[i].id);
                //     s.join(lobby);
                //     s.emit('switchRoom', messagesController.getMessagesByRoomId(newroom));
                //     s.emit('updatechat', 'SERVER', 'You have been moved to the lobby.');
                // });

              }
              // close chatlog and start a new one
              messagesController.archiveRoomLog(rooms[i].id);
          }
      }
      rooms = newRooms;
  }
});
