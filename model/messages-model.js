/* load dependencies */
const fs = require('fs');
const escapeHTML = require('../helpers/escapeHTML');

module.exports = {
    initRoomFile: initRoomFile,
    //getMessages: getMessages,
    getMessagesByRoom: getMessagesByRoom,
    addMessage: addMessage
};

  /* Load sync files into a global variable
  * This serves as an in-memory cache for speedy access.
   Stores as a dictionary
    [
      {
        id: roomId,
        messages: [
          {
             timestamp,
             user,
             data
          }
        ]
      }
    ]
  */
 var messagesDB = []; // = JSON.parse(fs.readFileSync("messages.json", {encoding: 'utf-8'}));

function initRoomFile(roomId)
{
    var filename = './messages/messages_'+roomId+'.json';
    fs.open(filename, 'a+', function (err) {
      if (err) console.log(err);
    });

    var fileContents = fs.readFileSync(filename, {encoding: 'utf-8'});
    console.log(roomId + ", " + fileContents);
    if (!fileContents) fileContents = "[]";

    var roomDB = {
        id: roomId,
        messages: JSON.parse(fileContents)
    }

    messagesDB.push(roomDB);
}

// function getMessages() {
//     // Clone and return the message object
//     //return JSON.parse(JSON.stringify(messages));
// }

function getMessagesByRoom(roomId)
{
    for(var i = 0; i < messagesDB.length; i++)
    {
        if (messagesDB[i].id == roomId)
          return messagesDB[i].messages;
    }
}

function addMessage(message, roomId, callback) {
    // Escape any html in the message object
    var sanitizedMessage = {
        timestamp: message.timestamp,
        user: message.user,
        data: message.data
    }

    var roomMessages = getMessagesByRoom(roomId);
    roomMessages.push(sanitizedMessage);
    fs.writeFile('./messages/messages_'+roomId+'.json', JSON.stringify(roomMessages, null, 4), 'utf-8', callback);
    //callback(false, JSON.parse(JSON.stringify(sanitizedMessage)));
    //not using a callback is depriciated and produces a node warning.

}
