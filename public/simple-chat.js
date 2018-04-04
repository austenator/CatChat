// This are the client side scripts

// Create the socket.io client
var socket = io();
var roomId = "lobby";
var userName =  $('#user-name').val();
// console.log("Init: " + roomId);

function wrapMessage(textToWrap, classToAdd){
  var li = $('<li>')
    .addClass(classToAdd);

  $('<span>')
    .text(textToWrap)
    .appendTo(li);

  return li;
}

// Listen for welcome messages, and append
// them to the message log
socket.on('welcome', function(name){
  // console.log("Welcome recieved: "+ name);

  // Build welcome message for the lobby.
  var welcomeMessage = "Welcome to CatChat! Please "+
  "find your class on the left and select it to join.";
  // welcomeMessage += " Check out the <a href='https://github.com/austenator/CatChat'>repo.</a>";

  // Wrap the message in the span and append it to the message-log.
  var li = wrapMessage(welcomeMessage,'welcome-message');
  li.appendTo('#message-log');

  $('#user-name').val(name);
  userName = name;
});

// Server has sent a new room list.
// update the list accordingly.
socket.on('room-list', function(html){
  $('#room-list').html(html);
});

// Listen for join messages, and append them
// to the message log
socket.on('joined', function(name) {
  var li = wrapMessage(name+' joined!', 'system-message');
  li.appendTo('#message-log');
});

// Listen for left messages, and append them
// to the message log
socket.on('left', function(name) {
  var li = wrapMessage(name+' left!', 'system-message');
  li.appendTo('#message-log');
});

// Listen for incoming chat messages, and append
// them to the message log, applying styles and
// the user's name.
socket.on('message', function(message){
  if (message.roomId == roomId)
  {
    if(message.user == userName){
      var li = $('<li>')
        .addClass('user-message');

      var header = $('<div>')
        .addClass('user-message-header')
        .appendTo(li);

      var body = $('<div>')
        .addClass('user-message-body')
        .appendTo(li);

      var user = $('<p>')
        .text(message.user)
        .appendTo(header);

      var message =$('<span>')
        .text(message.text)
        .appendTo(body);

      li.appendTo('#message-log');
    } else {
      var li = $('<li>')
        .addClass('other-message');

      var header = $('<div>')
        .addClass('other-message-header')
        .appendTo(li);

      var body = $('<div>')
        .addClass('other-message-body')
        .appendTo(li);

      var user = $('<p>')
        .text(message.user)
        .appendTo(header);

      var message =$('<span>')
        .text(message.text)
        .appendTo(body);

      li.appendTo('#message-log');
    }

  }
});

//handler for when enter is pressed in the chat box (send message w/o refreshing page)
$('#chat-text').keypress(function(event) {
  if (event.which == 13) {
    event.preventDefault();
    var text = $('#chat-text').val();
    if (text != "") {
      socket.emit('message', text);
      $('#chat-text').val('');
    }
  }
});
//send button sends msg w/o refreshing page
$('#chat-send').on('click', function(event) {
  var text = $('#chat-text').val();
  if (text != "") {
    socket.emit('message', text);
    $('#chat-text').val('');
  }
});


// When the user clicks on the room list, this handles the change.
// KNOWN BUG: (event) is empty in 4 out of 5 clicks. Not sure why
$('#room-list').on('click', 'li.chatroom', function (event) {
  var clickedRoom = event.target.id;
  console.log("Changing rooms: " + clickedRoom);

  if (clickedRoom != "" && clickedRoom != roomId)
  {
    roomId = clickedRoom;
    socket.emit('room', roomId)
  }
});

// The server has stated that someone has changed a room.
// if the current user is in either the new or old room, display a message.
// if the current user is the one who moved, update the page to show the name.
socket.on('changed-room', function(name, oldRoomId, newRoomId, roomName) {
  console.log("Room change: "+ name +", "+ oldRoomId +", "+ newRoomId +", "+ roomName);
  if (roomId == oldRoomId || roomId == newRoomId)
  {
    var message = name + " changed to "+ roomName + "!";
    var li = wrapMessage(message, 'system-message');
    li.appendTo('#message-log');
  }

  if (name == userName)
  {
    $('#current-room').html(roomName);
  }

});


// User wants to change their name
// if name is not blank, and if name is different, send it
// else reset name box
$('#set-name').on('click', function() {
  var newName = $('#user-name').val();
  console.log("Changing name: " + userName + ", " + newName);
  if (newName != "" && newName != userName)
  {
    userName = newName;
    socket.emit('name', userName);
  }
  else
  {
    $('#user-name').val(userName);
  }

});

//enter changes username w/o page refresh
$('#user-name').keypress(function(event) {
  if (event.which == 13) {
    event.preventDefault();
    var newName = $('#user-name').val();
    console.log("Changing name: " + userName + ", " + newName);
    if (newName != "" && newName != userName)
    {
      userName = newName;
      socket.emit('name', userName);
    }
    else
    {
      $('#user-name').val(userName);
    }
  }
});

// A user has changed their name, display message.
// TODO, only show changes for users in this user's room.
socket.on('changed-name', function(oldName, newName) {
  // console.log("Name Changed: " + oldName + ", " + newName);
  var message = oldName + " changed name to "+ newName + "!";
  var li = wrapMessage(message, 'system-message');
  li.appendTo('#message-log');
});
