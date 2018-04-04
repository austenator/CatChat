/* load dependencies */
const fs = require('fs');
const escapeHTML = require('../helpers/escapeHTML');

module.exports = {
    getRooms: getRooms,
    addRoom: addRoom
};

  /* Load sync files into a global variable
  * This serves as an in-memory cache for speedy access.
  */
 var rooms = JSON.parse(fs.readFileSync("rooms.json", {encoding: 'utf-8'}));


function getRooms() {
    // Clone and return the room objects
    return JSON.parse(JSON.stringify(rooms));
}


function addRoom(room, callback) {
    // Escape any html in the room object
    var sanitizedRoom = {
        name: escapeHTML(room.name),
        description: escapeHTML(room.description),
        monday: escapeHTML(room.monday),
        tuesday: escapeHTML(room.tuesday),
        wednesday: escapeHTML(room.wednesday),
        thurday: escapeHTML(room.thurday),
        friday: escapeHTML(room.friday),
    }

    rooms.push(sanitizedRoom);
    fs.writeFile('rooms.json', {encoding: 'utf-8'}, JSON.stringify(rooms));
    callback(false, JSON.parse(JSON.stringify(sanitizedRoom)));
}
