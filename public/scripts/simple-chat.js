// This are the client side scripts

// // Create the socket.io client
var socket = io();
var roomId = "lobby";
var thisUsername = "DEFAULT USERNAME";
$(document).ready(function() {

  function sendMessage(listItem){
    listItem.appendTo('#message-log');
    $("#message-log").scrollTop($("#message-log")[0].scrollHeight);
    return;
  }

  function sendServerMessage(message){
    sendOtherMessage('SERVER', message);
  }

  function sendUserMessage(userName, message){
    var li = $('<li>')
      .addClass('user-message');

    var header = $('<div>')
      .addClass('user-message-header')
      .appendTo(li);

    var body = $('<div>')
      .addClass('user-message-body')
      .appendTo(li);

    var user = $('<p>')
      .text(userName.toUpperCase())
      .appendTo(header);

    var message =$('<span>')
      .text(message)
      .appendTo(body);

    sendMessage(li);
  }

  function sendOtherMessage(userName, message){
    var li = $('<li>')
      .addClass('other-message');

    var header = $('<div>')
      .addClass('other-message-header')
      .appendTo(li);

    var body = $('<div>')
      .addClass('other-message-body')
      .appendTo(li);

    var user = $('<p>')
      .text(userName.toUpperCase())
      .appendTo(header);

    var message =$('<span>')
      .text(message)
      .appendTo(body);

    sendMessage(li, header, body);
  }

  // Sends a message to the server to be broadcasted to the room.
  function sendChat(){
    var message = $('#chat-text').val();
    if(message){
      $('#chat-text').val('');

      // Emit a 'sendchat' and give it the message to send.
      socket.emit('sendChat', message);
    }
  }

  // Handles the send button click.
  $('#chat-send').click( function() {
    sendChat();
  });

  // Handles when the user is in the textbox and presses 'Enter'.
  $('#chat-text').keypress(function(e) {
    if(e.which == 13) {
      sendChat();
    }
  });

/**
 * Updates the user's username with the sanitized version.
 * @param  {String} sanitizedName Sanitized username.
 * @return {undefined}
 */
  socket.on('sanitizeName', function(sanitizedName){
    thisUsername = sanitizedName;
  });

  /**
   * Send a message describing who changed their username and to what.
   * @param  {String} oldName The user's old name.
   * @param  {String} newName The user's new name.
   * @return {undefined}
   */
  socket.on('changedName', function(oldName, newName) {
    var message = oldName + " changed name to "+ newName + "!";
    sendServerMessage(message);
  });

    // Handles the user setting a new name.
    function setName(){
      // Get the new name from the input box.
      var newName = $('#user-name').val();
      // If it is truthy and not equal to their current username, change it.
      if (newName && newName !== thisUsername)
      {
        // Update the username on the client side.
        thisUsername = newName.toUpperCase();
        socket.emit('updateName', thisUsername);
      }
      else
      {
        // Keep/put their old username in the box.
        $('#user-name').val(thisUsername);
      }
    }

  // When the user sets their name by clicking the 'Set' button.
  $('#set-name').on('click', function() {
    setName();
  });

  // When the user set's their name by
  // pressing 'Enter' in the user-name textbox.
  $('#user-name').keypress(function(event) {
    if (event.which == 13) {
      setName();
    }
  });

  /**
   * Handles when the client connects to the server.
   * @return {undefined}
   */
  socket.on('connect', function(){
    // Add the client with the default username.
    socket.emit('addUser', thisUsername);
  });

  /**
   * Updates the chat room with a new message and places it on the correct
   * side of the message box.
   * @param  {String} userName The user's name who is sending the message.
   * @param  {String} message The user's message.
   * @return {undefined}
   */
  socket.on('updateChat', function (userName, message) {
    if(userName === thisUsername){
      sendUserMessage(userName, message);
    } else if(userName === 'SERVER'){
      sendServerMessage(message);
    } else {
      sendOtherMessage(userName, message);
    }
  });

  // listener, whenever the server emits 'updaterooms', this updates the room the client is in
  /**
   * Updates the room list to reflect room change.
   * @param  {String[]} rooms All the currently open rooms.
   * @param  {String} currentRoom The current room the user is in.
   * @return {undefined}
   */
  socket.on('updateRooms', function(rooms, currentRoom) {
    $('#room-list').empty();
    var ul = $('<ul>')
      .addClass('list-group-flush px-0');

    $.each(rooms, function(key, value) {
      var li = $('<li>')
        .addClass('list-group-item chatroom');

      if(value.id == currentRoom){
        li.append('<p>' + value.name + '</p>');
        $('#current-room').html(value.name);
      }
      else {
        li.append('<p><a href="#" onclick="switchRoom(\''+value.id+'\')">' + value.name + '</a></p>');
      }

      li.appendTo(ul);
    });
    ul.appendTo('#room-list');
  });

  /**
   * Updates the user's message log with messages from the room
   * they switched to and alerting the user they switched rooms
   * successfully.
   * @param  {String[]} messages An array of previous messages in the chatroom.
   * @return {undefined}
   */
  socket.on('switchRoom', function(messages) {
    $('#message-log').empty();

    // Fill the message log with previous chatroom messages from the server.
    for (var i = 0; i < messages.length; i++)
    {
      if(messages[i].user == thisUsername){
        sendUserMessage(messages[i].user,messages[i].data);
      } else if(messages[i].user == 'SERVER'){
        sendServerMessage(messages[i].data);
      } else {
        sendOtherMessage(messages[i].user, messages[i].data);
      }
    }
  });
});

function switchRoom(room){
  socket.emit('switchRoom', room);
}
