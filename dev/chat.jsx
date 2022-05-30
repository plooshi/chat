import './chat.css'

window.sendMessage = () => {
  var msg = document.getElementById('message').value;
  if (user && (msg === "" || msg.replace(/ +/g, " ") === " ")) {
    return alert("Message cannot be blank...");
  } else {
    window.socket.emit("get_msg_pfp", {
      message: msg,
      user: user
    });
  }
  document.getElementById('message').value = "";
}

window.socket.on("msg_pfp", data => {
  window.socket.emit('msg', data);
});

function delLastMsg() {
  var ih = document.getElementById("message-container").innerHTML;
  if (ih.split("<div>").length === 10) {
    var w = ih.split("<div>");
    w.shift(); 
    w.shift(); 
    document.getElementById("message-container").innerHTML = "<div>" + w.join("<div>");
  }
}

function filterTag(str) {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function addMsg(data) {
  var sys_bool = data.sys === "true";
  var sys_txt = sys_bool ? "sys_" : "";
  var html = "";
  if (!sys_bool) {
    html += `<div><img id="pfp" src="/assets/avatar/${data.pfp}" width=32 height=32 /><b id="username">${filterTag(data.user)}</b><br>&emsp;&emsp;&emsp;&emsp;`
  } else {
    html += `<div><img id="pfp" src="/assets/avatar/${data.pfp}" width=32 height=32 />`
  }
  html += `<b id="${sys_txt}msg">${filterTag(data.message)}</b></div>`
  document.getElementById("message-container").innerHTML += html;
  html = "";
}

window.socket.on('addChatMsgs', data => {
  data.forEach(msg => {
    addMsg(msg);
  })
})

window.socket.on('newmsg', data => {
  if (!user) return;
  delLastMsg();
  addMsg(data);
});



window.socket.on('addChatHTML', data => {
  document.body.innerHTML = data;
  window.socket.emit('join_msg', user);
})