const messagesModel = require('../model/messages-model');

module.exports = {
    initFileStorage: initFileStorage,
    storeMessage: storeMessage,
    //getAll: getAll,
    getMessagesByRoomId: getMessagesByRoomId
}

function initFileStorage(rooms)
{
    for (var i = 0; i < rooms.length; i++)
    {
        messagesModel.initRoomFile(rooms[i].id);
    }
}

function storeMessage(userName, room, text) {
    var message = {
        timestamp: new Date().getTime(),
        user: userName,
        data: text
    };

    messagesModel.addMessage(message, room, function(err) {
      if (err) console.log(err);
    });

}


// function getAll() {
//     var messages = messagesModel.getMessages();
//     return messages;
// }


function getMessagesByRoomId(desiredRoomId) {
    // var messages = messagesModel.getMessages();
    // var desiredMessages = [];
    //
    // for (var i = 0; i < messages.length; i++)
    // {
    //     if (messages[i].roomId == desiredRoomId)
    //     {
    //         desiredMessages.push(messages[i]);
    //     }
    // }
    // return desiredMessages

    // This should probably do something
    return messagesModel.getMessagesByRoom(desiredRoomId);
}
