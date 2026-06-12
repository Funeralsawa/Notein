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

function merge(serverTodos) {
  var local = getAll();
  var map = {};
  local.forEach(function (t) { map[t.id] = t; });

  serverTodos.forEach(function (st) {
    var localTodo = map[st.id];
    if (!localTodo || st.updateTime > localTodo.updateTime) {
      map[st.id] = {
        id: st.id,
        content: st.content || '',
        completed: !!st.isCompleted,
        createTime: st.createTime,
        updateTime: st.updateTime,
        completedTime: st.isCompleted ? st.updateTime : null
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

module.exports = { getAll: getAll, add: add, remove: remove, toggleComplete: toggleComplete, getById: getById, merge: merge };
