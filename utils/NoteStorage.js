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

function merge(serverNotes) {
  var local = getAll();
  var map = {};
  local.forEach(function (n) { map[n.id] = n; });

  var CAT_MAP = { 0: '个人', 1: '工作', 2: '其他' };

  serverNotes.forEach(function (sn) {
    var localNote = map[sn.id];
    if (!localNote || sn.updateTime > localNote.updateTime) {
      map[sn.id] = {
        id: sn.id,
        title: sn.title || '',
        content: sn.content || '',
        bgColor: sn.bgColor || '#c9d9c2',
        category: CAT_MAP[sn.category] !== undefined ? CAT_MAP[sn.category] : '其他',
        createTime: sn.createTime,
        updateTime: sn.updateTime
      };
    }
  });

  var merged = [];
  for (var key in map) {
    if (map.hasOwnProperty(key)) {
      merged.push(map[key]);
    }
  }
  merged.sort(function (a, b) { return b.updateTime - a.updateTime; });
  wx.setStorageSync(STORAGE_KEY, merged);
}

module.exports = { getAll: getAll, save: save, remove: remove, getById: getById, merge: merge };
