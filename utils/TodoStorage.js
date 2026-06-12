var uuid = require('./uuid');

var STORAGE_KEY = 'todos_list';

function getAll() {
  try {
    return wx.getStorageSync(STORAGE_KEY) || [];
  } catch (e) {
    return [];
  }
}

function add(content) {
  if (!content || !content.trim()) return null;
  var todos = getAll();
  var now = Date.now();
  var todo = {
    id: uuid(),
    content: content.trim(),
    completed: false,
    createTime: now,
    updateTime: now,
    completedTime: null
  };
  todos.unshift(todo);
  wx.setStorageSync(STORAGE_KEY, todos);
  return todo;
}

function remove(id) {
  var todos = getAll().filter(function (t) { return t.id !== id; });
  wx.setStorageSync(STORAGE_KEY, todos);
}

function toggleComplete(id) {
  var todos = getAll();
  var idx = todos.findIndex(function (t) { return t.id === id; });
  if (idx >= 0) {
    var now = Date.now();
    todos[idx].completed = !todos[idx].completed;
    todos[idx].updateTime = now;
    todos[idx].completedTime = todos[idx].completed ? now : null;
    wx.setStorageSync(STORAGE_KEY, todos);
    return todos[idx];
  }
  return null;
}

function getById(id) {
  return getAll().find(function (t) { return t.id === id; }) || null;
}

module.exports = { getAll: getAll, add: add, remove: remove, toggleComplete: toggleComplete, getById: getById };
