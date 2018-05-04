const roomModel = require('../model/rooms-model');

module.exports = {
    list: list,
    listAll: listAll,
    htmlList: htmlList,
    getLobby: getLobby,
    getRoomById: getRoomById,
    create: create
}

function list() {
  var rooms = roomModel.getRooms();
  var dateFactory = new Date();
  var currentTime =  (dateFactory.getHours()*100) + dateFactory.getMinutes();
  //console.log("currentTime: "+currentTime);
  var today = dateFactory.getDay(); //Sunday = 0, Saturday = 6
  //console.log("today: "+today);
  var list = [];

  for (var i = 0; i < rooms.length; i++)
  {
      if (rooms[i].id == "lobby")
      {
          var r = {
              id: rooms[i].id,
              name: rooms[i].name
          };
          list.push(r);
      }
      else
      {
          var todaysTimes;
          switch (today) {
              case 0:
                  todaysTimes = rooms[i].sunday;
                  break;
              case 1:
                  todaysTimes = rooms[i].monday;
                  break;
              case 2:
                  todaysTimes = rooms[i].tuesday;
                  break;
              case 3:
                  todaysTimes = rooms[i].wednesday;
                  break;
              case 4:
                  todaysTimes = rooms[i].thursday;
                  break;
              case 5:
                  todaysTimes = rooms[i].friday;
                  break;
              case 6:
                  todaysTimes = rooms[i].saturday;
                  break;
          }

          //console.log("todaysTimes: "+todaysTimes);

          if (todaysTimes)
          {
              var classTimes = todaysTimes.split('-');

              classTimes[0] = Number(classTimes[0]);
              classTimes[1] = Number(classTimes[1]);

              //console.log("classTimes: " + classTimes[0] + ", " + classTimes[1]);

              if (classTimes[0] <= currentTime && currentTime <= classTimes[1])
              {
                  var r = {
                      id: rooms[i].id,
                      name: rooms[i].name
                  };
                  list.push(r);
              }
          }
      }
  }
  return list;
}

function listAll() {
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
