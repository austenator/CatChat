// Create the socket.io client
var socket = io('http://catchat.cs.ksu.edu');

// Listen for welcome messages, and append
// them to the message log
socket.on('welcome', function(html){
  var li = $('<li>')
    .addClass('welcome-message');

  $('<span>')
    .html(html)
    .appendTo(li);

  li.appendTo('#message-log');
});

// Listen for join messages, and append them
// to the message log
socket.on('joined', function(name) {
  var li = $('<li>')
    .addClass('system-message');

  $('<span>')
    .text(name + " joined!")
    .appendTo(li);

  li.appendTo('#message-log');
});

// Listen for left messages, and append them
// to the message log
socket.on('left', function(name) {
  var li = $('<li>')
    .addClass('system-message');

  $('<span>')
    .text(name + " left!")
    .appendTo(li);

  li.appendTo('#message-log');
});

// Listen for incoming chat messages, and append
// them to the message log, applying styles and
// the user's name.
socket.on('message', function(message){
  var li = $('<li>')
    .addClass('user-message');

  $('<span>')
    .text(message.text)
    .appendTo(li);

  li.appendTo('#message-log');
});

$('#chat-send').on('click', function(){
  var text = $('#chat-text').val();
  socket.emit('message', text);
  $('#chat-text').val('');
});
