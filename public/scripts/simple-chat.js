// This are the client side scripts

// // Create the socket.io client
var socket = io();
var roomId = "lobby";
var thisUsername = "Default Username";
$(document).ready(function() {
  function sendMessage(list_item){
    list_item.appendTo('#message-log');
    $("#message-log").scrollTop($("#message-log")[0].scrollHeight);
    return;
  }

  function sendServerMessage(data){
    sendOtherMessage('SERVER', data);
  }

  function sendUserMessage(user_name, data){
    var li = $('<li>')
      .addClass('user-message');

    var header = $('<div>')
      .addClass('user-message-header')
      .appendTo(li);

    var body = $('<div>')
      .addClass('user-message-body')
      .appendTo(li);

    var user = $('<p>')
      .text(user_name.toUpperCase())
      .appendTo(header);

    var message =$('<span>')
      .text(data)
      .appendTo(body);

    sendMessage(li);
  }

  function sendOtherMessage(user_name, data){
    var li = $('<li>')
      .addClass('other-message');

    var header = $('<div>')
      .addClass('other-message-header')
      .appendTo(li);

    var body = $('<div>')
      .addClass('other-message-body')
      .appendTo(li);

    var user = $('<p>')
      .text(user_name.toUpperCase())
      .appendTo(header);

    var message =$('<span>')
      .text(data)
      .appendTo(body);

    sendMessage(li, header, body);
  }

  function sendChat(){
    var message = $('#chat-text').val();
    if(message){
      $('#chat-text').val('');

      // Emit a 'sendchat' and give it the message to send.
      // TODO > parse for script injection
      socket.emit('sendchat', message);
    }
    return;
  }

  // when the client clicks SEND
  $('#chat-send').click( function() {
    sendChat();
  });

  // when the client hits ENTER on their keyboard
  $('#chat-text').keypress(function(e) {
    if(e.which == 13) {
      sendChat();
    }
  });

  // Set's the client's name.
  function setName(){
    var newName = $('#user-name').val();
    // console.log("Changing name: " + thisUsername + ", " + newName);
    if (newName != "" && newName != thisUsername)
    {
      // console.log('Changed name to ' + newName + ' on client side.');
      thisUsername = newName.toUpperCase();
      socket.emit('name', thisUsername);
    }
    else
    {
      $('#user-name').val(thisUsername);
    }
    return;
  }

  // When the user set's their name by clicking the 'Set' button.
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


  // on connection to server, ask for user's name with an anonymous callback
  socket.on('connect', function(){
    // call the server-side function 'adduser' and send one parameter (value of prompt)
    // TODO > sanitize input
    // thisUsername = prompt("What's your name?").toUpperCase();
    console.log('Connection...');
    socket.emit('adduser', thisUsername);
  });

  // listener, whenever the server emits 'updatechat', this updates the chat body
  socket.on('updatechat', function (username, data) {
    // console.log("Message received from "+ username +" with data: " + data);
    // console.log('thisUsername is ' + thisUsername);
    if(username == thisUsername){
      sendUserMessage(username,data);
    } else if(username == 'SERVER'){
      sendServerMessage(data);
    } else {
      sendOtherMessage(username, data);
    }
  });

  // listener, whenever the server emits 'updaterooms', this updates the room the client is in
  socket.on('updaterooms', function(rooms, current_room) {
    $('#room-list').empty();
    var ul = $('<ul>')
      .addClass('list-group-flush px-0');

    $.each(rooms, function(key, value) {
      var li = $('<li>')
        .addClass('list-group-item chatroom');

      if(value.id == current_room){
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

  //server is letting the client know that they have changed rooms
  // and is providing a log of messages
  socket.on('switchRoom', function(messages) {
    $('#message-log').empty();
    //console.log(messages);
    for (var i = 0; i < messages.length; i++)
    {
      //console.log(messages[i].user + ", " + messages[i].data);
      if(messages[i].user == thisUsername){
        sendUserMessage(messages[i].user,messages[i].data);
      } else if(messages[i].user == 'SERVER'){
        sendServerMessage(messages[i].data);
      } else {
        sendOtherMessage(messages[i].user, messages[i].data);
      }
    }

  });

  // A user has changed their name, display message.
  // TODO, only show changes for users in this user's room.
  socket.on('changed-name', function(old_name, new_name) {
    var message = old_name + " changed name to "+ new_name + "!";
    sendServerMessage(message);
  });


});
function switchRoom(room){
  socket.emit('switchRoom', room);
}
