const db = require("users.db")();
const crypto = require("crypto");

function signup(user, password) {
  db.set(user, crypto.createHash("sha256").update(password).digest("hex"));
  return true
}

function login(user, password) {
  var correctPassword = db.get(user) === crypto.createHash("sha256").update(password).digest("hex");
  return correctPassword
}

function mode(user) {
  return db.has(user) ? login : signup;
}

function init(user, password) {
  return mode(user)(user, password);
}

module.exports = init;