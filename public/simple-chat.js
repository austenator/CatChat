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
    .text(message.text)
    .addClass('user-message')
    .appendTo('#message-log');
});

$('#chat-send').on('click', function(){
  var text = $('#chat-text').val();
  socket.emit('message', text);
  $('#chat-text').val('');
});
