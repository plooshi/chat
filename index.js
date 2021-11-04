var app = require('express')();
var login = require("./login");
var http = require('http').Server(app);
var io = require('socket.io')(http, { path: "/chat" });
var fs = require('fs');
var SwearFilter = require('@naturalatlas/bad-words');
var sFilter = new SwearFilter();
sFilter.addWords('bith');
const crypto = require("crypto");

app.get('/googlea2eaca1214e4bac4.html', (req, res) => {
  res.sendFile('/home/runner/plooshi/assets/googlea2eaca1214e4bac4.html');
});

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

app.get('/assets/avatar/:loc', (req, res) => {
  res.sendFile('/home/runner/plooshi/assets/avatar/' + req.params.loc);
})

var users = [], msgs = [], dupe_con = false;
io.on('connection', socket => {
  var user = "";

  socket.on('login', data => {
    data.user = sFilter.clean(data.user);
    if (data.user === "" || data.user.replace(/ +/g, " ") === " ") {
      socket.emit('loginError', 'Username cannot be blank')
    } else if (data.password === "" || data.password.replace(/ +/g, " ") === " ") {
      socket.emit('loginError', 'Password cannot be blank')
    } else if (!login.init(data.user.replace(/ +/g, " "), data.password.replace(/ +/g, " "), data.pfp_filename)) {
      socket.emit('loginError', 'Incorrect password!');
    } else if (users.indexOf(data.user) > -1) {
      socket.emit('loginError', data.user.replace(/ +/g, " ") + ' username is taken! Try some other username.');
    } else {
      user = data.user.replace(/ +/g, " ");
      if (users.indexOf(data.user.replace(/ +/g, " ")) === -1) {
        users.push(data.user.replace(/ +/g, " "));
      } else {
        dupe_con = true;
      }
      socket.emit('chatMain', { 
        username: user
      });
      io.sockets.emit('updateOnline', users);
    }
  });

  socket.on('get_msg_pfp', data => {
    data.pfp = login.pfp_filename(data.user);
    socket.emit('msg_pfp', data);
  })

  socket.on('getOnlineUsers', () => {
    socket.emit('onlineUsers', users);
  })
  
  socket.on('msg', data => {
    data.message = sFilter.clean(data.message);
    data.pfp = login.pfp_filename(user);
    while (msgs.length >= 9) {
      msgs.shift();
    }
    msgs.push(data)
    io.sockets.emit('newmsg', data);
  })

  socket.on('getChatHTML', () => {
    socket.emit('addChatHTML', fs.readFileSync('prod/chat.html').toString());
    socket.emit('addChatMsgs', msgs);
  });

  socket.on('join_msg', (data) => {
    if (dupe_con) return;
    var msgJson = {
      message: `${data} has joined the chat!`, 
      sys: "true",
      pfp: login.pfp_filename(user)
    };
    while (msgs.length >= 9) {
      msgs.shift();
    }
    msgs.push(msgJson);
    io.sockets.emit('newmsg', msgJson);
  })

  socket.on('disconnect', () => {
    if (user !== "" && !dupe_con) {
      users.splice(users.indexOf(user), 1);
      var msgJson = { 
        message: `${user} has left the chat.`, 
        sys: "true",
        pfp: login.pfp_filename(user)
      }; 
      while (msgs.length >= 9) {
        msgs.shift();
      }
      msgs.push(msgJson);
      io.sockets.emit('newmsg', msgJson);
      io.sockets.emit('updateOnline', users);
    }
  });

  socket.on('upload_avatar', avatar => {
    const buffer = Buffer.from(avatar.data, 'base64');
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    socket.emit('pfp_hash', hash);
    fs.writeFileSync("./assets/avatar/" + hash + "." + avatar.ext, buffer);
  })
});

http.listen(1234, () => console.log(`Started!`));