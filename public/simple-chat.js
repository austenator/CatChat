// Create the socket.io client
var socket = io();

// Listen for welcome messages, and append
// them to the message log
socket.on('welcome', function(html){
  $('<li>')
    .html(html)
    .addClass('welcome-message')
    .appendTo('#message-log');
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
  var li = $('<li>')
    .appendTo('#message-log');
  $('<strong>')
    .text(message.user + " in " + message.room)
    .appendTo(li)
    .css('padding-right', '1rem');
  $('<span>')
    .text(message.text)
    .appendTo(li);
});

$('#chat-send').on('click', function(){
  var text = $('#chat-text').val();
  socket.emit('message', text);
  $('#chat-text').val('');
});

$('#class-A').on('click', function(){
  var room = "Class A";
  socket.emit('room', room)
});

$('#class-B').on('click', function(){
  var room = "Class B";
  socket.emit('room', room)
});

$('#class-C').on('click', function(){
  var room = "Class C";
  socket.emit('room', room)
});

$('#class-D').on('click', function(){
  var room = "Class D";
  socket.emit('room', room)
});