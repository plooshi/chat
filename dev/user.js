window.user = undefined;
import './user.css'

window.socket.on('loginError', data => {
  document.getElementById('error-container').innerHTML = data;
});

window.socket.on('userSet', data => {
  window.user = data.username.replace(/ +/g, " ");
  window.socket.emit('getChatHTML');
  window.socket.emit('getOnlineUsers');
});