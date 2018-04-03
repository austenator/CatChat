//This is basically the Client side scripts

// Create the socket.io client
var socket = io();
var roomId = "lobby";

// Listen for welcome messages, and append
// them to the message log
socket.on('welcome', function(html, name){
  $('<li>')
    .html(html)
    .addClass('welcome-message')
    .appendTo('#message-log');
  $('#user-name').val(name);
});

socket.on('room-list', function(html){
  $('#room-list').html(html);
  
});

// Listen for join messages, and append them
// to the message log
socket.on('joined', function(name) {
  $('<li>')
    .text(name + " joined!")
    .addClass('system-message')
    .appendTo('#message-log');
});

// Listen for left messages, and append them
// to the message log
socket.on('left', function(name) {
  $('<li>')
    .text(name + " left!")
    .addClass('system-message')
    .appendTo('#message-log');
});

// Listen for incoming chat messages, and append
// them to the message log, applying styles and
// the user's name.
socket.on('message', function(message){
  if (message.roomId == roomId)
  {
    var li = $('<li>')
      .appendTo('#message-log');
    $('<strong>')
      .text(message.user + " in " + message.roomName)
      .appendTo(li)
      .css('padding-right', '1rem');
    $('<span>')
      .text(message.text)
      .appendTo(li);
  }
});

$('#chat-send').on('click', function(){
  var text = $('#chat-text').val();
  socket.emit('message', text);
  $('#chat-text').val('');
});


$('#room-list').on('click', 'li.chatroom', function (event) {
  var clickedRoom = event.target.id;
  console.log(clickedRoom);

  if (clickedRoom != "")
  {
    roomId = clickedRoom;
    socket.emit('room', roomId)
  }
});

socket.on('changed-room', function(name, oldRoomId, newRoomId, roomName) {
  if (roomId == oldRoomId || roomId == newRoomId)
  {
    $('<li>')
      .text(name + " changed to "+ roomName + "!")
      .addClass('system-message')
      .appendTo('#message-log');
  }
});



$('#set-name').on('click', function() {
  var newName = $('#user-name').val();
  socket.emit('name', newName);
});

socket.on('changed-name', function(oldName, newName) {
  $('<li>')
    .text(oldName + " changed name to "+ newName + "!")
    .addClass('system-message')
    .appendTo('#message-log');
});

