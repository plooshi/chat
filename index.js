var app = require('express')();
var login = require("./login");
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var SwearFilter = require('@naturalatlas/bad-words');
var sFilter = new SwearFilter();
sFilter.addWords('bith');
const crypto = require("crypto");

app.get('/robots.txt', (req, res) => {
  res.sendFile('/home/runner/plooshi/assets/robots.txt');
});

app.get('/:loc', (req, res) => {
  res.sendFile('/home/runner/plooshi/prod/' + req.params.loc);
});

app.get('/', (req, res) => {
  res.sendFile('/home/runner/plooshi/prod/index.html');
});

app.get('/assets/:loc', (req, res) => {
  res.sendFile('/home/runner/plooshi/assets/' + req.params.loc);
})

var users = [], msgs = [];
io.on('connection', socket => {
  var user = "";

  socket.on('login', data => {
    data.user = sFilter.clean(data.user);
    if (data.user === "" || data.user === " ") {
      socket.emit('loginError', 'Username cannot be blank')
    } else if (data.password === "" || data.password === " ") {
      socket.emit('loginError', 'Password cannot be blank')
    } else if (!login(data.user, data.password)) {
      socket.emit('loginError', 'Incorrect password!');
    } else if (users.indexOf(data) > -1) {
      socket.emit('loginError', data + ' username is taken! Try some other username.');
    } else {
      user = data.user;
      if (msgs.indexOf(data.user) === -1) {
        users.push(data.user);
      }
      socket.emit('userSet', { 
        username: data.user
      });
      io.sockets.emit('updateOnline', users);
    }
  });

  socket.on('getOnlineUsers', () => {
    socket.emit('onlineUsers', users);
  })
  
  socket.on('msg', data => {
    data.message = sFilter.clean(data.message);
    while (msgs.length >= 9) {
      msgs.shift();
    }
    msgs.push(data)
    io.sockets.emit('newmsg', data);
  })

  socket.on('getChatHTML', () => {
    socket.emit(
      'addChatHTML', 
      fs.readFileSync('prod/chat.html').toString()
    );
    socket.emit('addChatMsgs', msgs);
  });

  socket.on('join_msg', (data) => {
    var msgJson = {
      message: `${data} has joined the chat!`, 
      sys: "true"
    };
    while (msgs.length >= 9) {
      msgs.shift();
    }
    msgs.push(msgJson);
    io.sockets.emit('newmsg', msgJson);
  })

  socket.on('disconnect', () => {
    if (user !== "") {
      users.splice(users.indexOf(user), 1);
      var msgJson = { 
        message: `${user} has left the chat.`, 
        sys: "true"
      }; 
      while (msgs.length >= 9) {
        msgs.shift();
      }
      msgs.push(msgJson);
      io.sockets.emit('newmsg', msgJson);
      io.sockets.emit('updateOnline', users);
    }
  });
});

http.listen(1234, () => console.log(`Started!`));