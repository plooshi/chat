import './online.css'

function setOnline(data) {
  if (!window.user || !document.getElementById('connectedUsers')) return;
  document.getElementById('connectedUsers').innerHTML = "<p>" + data.toString().split(",").join("</p><p>");
}

window.socket.on('onlineUsers', setOnline)

window.socket.on('updateOnline', setOnline)