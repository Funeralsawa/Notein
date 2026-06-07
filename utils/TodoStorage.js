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
  var todo = {
    id: Date.now().toString(),
    content: content.trim(),
    completed: false,
    createTime: Date.now(),
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
    todos[idx].completed = !todos[idx].completed;
    todos[idx].completedTime = todos[idx].completed ? Date.now() : null;
    wx.setStorageSync(STORAGE_KEY, todos);
    return todos[idx];
  }
  return null;
}

function getById(id) {
  return getAll().find(function (t) { return t.id === id; }) || null;
}

module.exports = { getAll: getAll, add: add, remove: remove, toggleComplete: toggleComplete, getById: getById };
