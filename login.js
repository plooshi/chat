const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc, setDoc } = require('firebase/firestore');
const crypto = require("crypto");

initializeApp({
  apiKey: process.env.fb_apiKey,
  authDomain: process.env.fb_authDomain,
  projectId: process.env.fb_projectId,
  storageBucket: process.env.fb_storageBucket,
  messagingSenderId: process.env.fb_messagingSenderId,
  appId: process.env.fb_appId
});

const db = getFirestore();

function docRef(doc1, user) {
  return doc(db, doc1, user)
}

async function fetchDoc(doc, user) {
  return await getDoc(docRef(doc, user));
}

async function getData(doc, user) {
  return (await fetchDoc(doc, user)).data();
}

async function docExists(doc, user) {
  return (await fetchDoc(doc, user)).exists();
}

async function signup(user, password, pfp_fn) {
  await setDoc(docRef("logins", user), {
    password: crypto.createHmac("sha256", process.env.hashing_key).update(password).digest("hex")
  });
  await setDoc(docRef("avatars", user), {
    pfp: pfp_fn || "default.png"
  });
  /*db.set(user, {
    password: crypto.createHmac("sha256", process.env.hashing_key).update(password).digest("hex"),
    pfp: pfp_fn || "default.png"
  });*/
  return true
}

async function login(user, password) {
  /*var correctPassword = db.get(user).password === crypto.createHmac("sha256", process.env.hashing_key).update(password).digest("hex");*/
  var correctPassword = (await getData("logins", user)).password === crypto.createHmac("sha256", process.env.hashing_key).update(password).digest("hex");
  return correctPassword
}

async function mode(user) {
  return (await docExists("logins", user)) ? login : signup;
}

async function init(user, password, pfp_fn) {
  var m = await mode(user);
  return m(user, password, pfp_fn);
}

async function pfp_filename(user) {
  /*return db.get(user || "owo").pfp*/
  var a = await getData("avatars", user || "default")
  return a.pfp;
}

module.exports = {
  init,
  pfp_filename
};