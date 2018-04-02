/** server.js
 * Server for a simple chat engine
 */

// Constants
const PORT = 3000;

// Requires
var fs = require('fs');
var http = require('http');
var server = new http.Server(handleRequest);

// Create the socket.io object.  By passing it
// the webserver, it will automatically handle
// requests for /socket.io/socket.io.js and to
// establish a socket connection.
var io = require('socket.io')(server);

// Track how many users have connected
var connected = 0;

/** event hander 'connection'
 * handles a new user connecting to the websocket server
 */
io.on('connection', function(socket){
  // Set the user properties
  var name = 'User ' + connected;

  // Count the user
  connected++;

  // Let the other users know a user joined
  io.emit('joined', name);

  // Add an event handler for when the user sends
  // us a message
  socket.on('message', function(text) {
    io.emit('message', {
      user: name,
      text: text
    });
  });

  // Add an event handler for when the user leaves
  socket.on('disconnect', function(){
    // let the other users know who has left
    io.emit('left', name);
  });

  // Send a welcome message to the user
  var welcomeMessage = "<strong>Welcome " + name + "!</strong>";
  welcomeMessage += " Check out the <a href='https://github.com/austenator/CatChat'>repo.</a>";
  socket.emit('welcome', welcomeMessage);
});

/** @function handleRequest
 * The webserver's request handling function
 * @param {http.incomingRequest} req - the request object
 * @param {http.serverResponse} res - the response object
 */
function handleRequest(req, res) {
  switch(req.url) {
    // Serve the index file
    case '/':
    case '/index.html':
      fs.readFile('public/index.html', function(err, data){
        if(err){
        }
        res.setHeader("Content-Type", "text/html");
        res.end(data);
      });
      break;
    // Serve the css file
    case '/simple-chat.css':
      fs.readFile('public/simple-chat.css', function(err, data){
        if(err){
        }
        res.setHeader("Content-Type", "text/css");
        res.end(data);
      });
      break;
    // Serve the js file
    case '/simple-chat.js':
      fs.readFile('public/simple-chat.js', function(err, data){
        if(err){
        }
        res.setHeader("Content-Type", "text/js");
        res.end(data);
      });
      break;
      // Serve the logo
      case '/images/logo_1.png':
        fs.readFile('public/images/logo_1.png', function(err, data){
          if(err){
            console.error("Could not get logo!" + err);
            res.statusCode = 500;
            res.end();
          }
          res.setHeader("Content-Type", "image/png");
          res.end(data);
        });
        break;
      case '/images/favicon-16x16.png':
        fs.readFile('public/images/favicon-16x16.png', function(err, data){
          if(err){
            console.error("Could not get favicon!" + err);
            res.statusCode = 500;
            res.end();
          }
          console.log("Got favicon!");
          res.setHeader("Content-Type", "image/png");
          res.end(data);
        });
        break;
        case '/images/favicon-32x32.png':
          fs.readFile('public/images/favicon-32x32.png', function(err, data){
            if(err){
              console.error("Could not get favicon!" + err);
              res.statusCode = 500;
              res.end();
            }
            console.log("Got favicon!");
            res.setHeader("Content-Type", "image/png");
            res.end(data);
          });
          console.log("passed got favicon!");
          break;
      default:
        res.setHeader("Content-Type", "text/plain");
        res.statusCode = 404;
        res.end("Resource Could Not Be Found!");
  }
}

// Start the server
server.listen(PORT, function(){
  console.log(PORT);
});
