var uuid = require('./uuid');

var STORAGE_KEY = 'notes_list';

function getAll() {
  try {
    return wx.getStorageSync(STORAGE_KEY) || [];
  } catch (e) {
    return [];
  }
}

function save(note) {
  var notes = getAll();
  var idx = notes.findIndex(function (n) { return n.id === note.id; });
  if (idx >= 0) {
    notes[idx] = Object.assign({}, notes[idx], note, { updateTime: Date.now() });
  } else {
    note.id = note.id || uuid();
    note.createTime = Date.now();
    note.updateTime = Date.now();
    notes.unshift(note);
  }
  wx.setStorageSync(STORAGE_KEY, notes);
  return note;
}

function remove(id) {
  var notes = getAll().filter(function (n) { return n.id !== id; });
  wx.setStorageSync(STORAGE_KEY, notes);
}

function getById(id) {
  return getAll().find(function (n) { return n.id === id; }) || null;
}

module.exports = { getAll: getAll, save: save, remove: remove, getById: getById };
