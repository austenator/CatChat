/* load dependencies */
const fs = require('fs');
const escapeHTML = require('../helpers/escapeHTML');

module.exports = {
    getMessages: getMessages,
    addMessage: addMessage
};
  
  /* Load sync files into a global variable
  * This serves as an in-memory cache for speedy access.
  */
 var messages = JSON.parse(fs.readFileSync("messages.json", {encoding: 'utf-8'}));


function getMessages() {
    // Clone and return the message object
    return JSON.parse(JSON.stringify(messages));
}


function addMessage(message, callback) {
    // Escape any html in the message object
    var sanitizedMessage = {
        user: message.user,
        roomId: message.roomId,
        roomName: message.roomName,
        text: message.text,
        color: message.color
    }
    
    messages.push(sanitizedMessage);
    fs.writeFile('messages.json', JSON.stringify(messages, null, 4), 'utf-8');
    //callback(false, JSON.parse(JSON.stringify(sanitizedMessage)));
    //not using a callback is depriciated and produces a node warning.

}
  