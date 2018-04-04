const messagesModel = require('../model/messages-model');

module.exports = {
    storeMessage: storeMessage,
    getAll: getAll,
    getMessagesByRoomId: getMessagesByRoomId
}

function storeMessage(message) {
    messagesModel.addMessage(message);
}


function getAll() {
    var messages = messagesModel.getMessages();
    return messages;
    // //var html = studentIndex(students);
    // var html = "<ul class=\"list-group-flush px-0\">";
    // html += rooms.map(function(item) {
    //     //<li class="list-group-item" id="class-A"><p>Class A</p></li>
    //     return "<li class=\"list-group-item chatroom\" id=\""+ item.id +"\"><p>" + item.name + "</p></li>";
    // }).join("");
    // html += "</ul>"

    // return html;
}


function getMessagesByRoomId(desiredRoomId) {
    var messages = messagesModel.getMessages();
    var desiredMessages = [];

    for (var i = 0; i < messages.length; i++)
    {
        if (messages[i].roomId == desiredRoomId)
        {
            desiredMessages.push(messages[i]);
        }
    }
    return desiredMessages
}


