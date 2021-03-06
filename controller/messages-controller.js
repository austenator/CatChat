const messagesModel = require('../model/messages-model');
var fs = require('fs');
var path = require('path');
const LOGS_PATH = 'messages';
module.exports = {
    initFileStorage: initFileStorage,
    storeMessage: storeMessage,
    //getAll: getAll,
    getMessagesByRoomId: getMessagesByRoomId,
    archiveRoomLog: archiveRoomLog,
    handleLogPopulation:handleLogPopulation,
    getLogByName:getLogByName
}

// Handles all the get requests for log files /logs/log?name=fileName
function getLogByName(req,res){
  var name = req.query.name;

  // Read in the file they requested.
  fs.readFile(path.join(__dirname,'..',LOGS_PATH, name), 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  // console.log('Read in: '+data);

  // Make sure there is data in the file. Otherwise, alert the user.
  if(data){
    jsonData = JSON.parse(data);
    var log = "";
    for (var i = 0; i< jsonData.length; i++) {
      log += jsonData[i].user + ": " + jsonData[i].data + "\n";
    }
    res.statusCode=200;
    res.header('Content-Disposition', "filename=" + name.substr(0, name.length-5) + ".txt");
    res.header("Content-Type", "text/plain");
    res.send(log);
  } else{
    res.statusCode=200;
    res.send('There were no messages in that file.');
  }
});
}

// Handles the population of the log-container with all the available
// files in the messages folder.TODO > error handling for readDirSync().
function handleLogPopulation(req,res){
  var logs = [];
  fs.readdirSync(LOGS_PATH).forEach(file => {
    // console.log(file);
    logs.push(file);
  });
  res.statusCode=200;
  res.render('logs', {
    logs:logs
  });
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

function archiveRoomLog(roomId) {
   messagesModel.archiveRoomFile(roomId);
   messagesModel.initRoomFile(roomId);
}
