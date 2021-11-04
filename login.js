const db = require("users.db")();
const crypto = require("crypto");

function signup(user, password, pfp_filename) {
  db.set(user, {
    password: crypto.createHmac("sha256", process.env.hashing_key).update(password).digest("hex"),
    pfp: pfp_filename || "default.png"
  });
  return true
}

function login(user, password) {
  var correctPassword = db.get(user).password === crypto.createHmac("sha256", process.env.hashing_key).update(password).digest("hex");
  return correctPassword
}

function mode(user) {
  return db.has(user) ? login : signup;
}

function init(user, password, pfp_filename) {
  return mode(user)(user, password, pfp_filename);
}

function pfp_filename(user) {
  return db.get(user).pfp
}

module.exports = {
  init,
  pfp_filename
};