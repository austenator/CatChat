const roomModel = require('../model/rooms-model');

module.exports = {
    list: list,
    htmlList: htmlList,
    getLobby: getLobby,
    getRoomById: getRoomById,
    create: create
}

function list() {
  var rooms = roomModel.getRooms();
  var list = [];

  for (var i = 0; i < rooms.length; i++)
  {
      var r = {
          id: rooms[i].id,
          name: rooms[i].name
      };
      list.push(r);
  }
  return list;
}

function htmlList() {
    var rooms = roomModel.getRooms();
    var html = "<ul  class=\"list-group-flush px-0\">";
    html += rooms.map(function(item) {
        //<li class="list-group-item" id="class-A"><p>Class A</p></li>
        return "<li class=\"list-group-item chatroom\" id=\""+ item.id +"\"><p>" + item.name + "</p></li>";
    }).join("");
    html += "</ul>"

    return html;
}

function getLobby() {
    var rooms = roomModel.getRooms();
    return rooms[0];
}

function getRoomById(desiredId) {
    var rooms = roomModel.getRooms();
    var desiredIndex = -1;

    for (var i = 0; i < rooms.length; i++)
    {
        if (rooms[i].id == desiredId)
        {
            desiredIndex = i;
            break;
        }
    }
    if (i != -1)
    {
        return rooms[i];
    }
    else
    {
        return 0;
    }

}


  /** @function create
    * Creates a new room
    */
function create(req, res) {
    // TODO:
    // 1) Parse the form content
    // 2) Create new room from form content
    // 3) Render the index with the new room
}
