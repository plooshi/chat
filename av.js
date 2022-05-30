const { getStorage, ref, uploadBytes, getBytes } = require("firebase/storage");

const storage = getStorage();

function stRef(hash, ext) {
  return ref(storage, 'avatars/' + hash + "." + ext);
}

async function uploadAv(data, hash, ext) {
  var len = data.length;
  var arr = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
      arr[i] = data.charCodeAt(i);
  }
  return await uploadBytes(stRef(hash, ext), arr, { contentType: "image/" + ((ext === "jpg") ? "jpeg" : ext) })
}

async function getAv(path) {
  var s = path.split(".")
  return getBytes(stRef(s[0], s[1]));
}

module.exports = {
  upload: uploadAv,
  get: getAv
}