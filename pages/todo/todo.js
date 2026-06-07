var TodoStorage = require('../../utils/TodoStorage');

function pad(n) {
  n = n.toString();
  return n.length < 2 ? '0' + n : n;
}

Page({
  data: {
    inputValue: '',
    groups: []
  },

  onShow: function () {
    this.loadTodos();
  },

  loadTodos: function () {
    var todos = TodoStorage.getAll();
    var groups = this.buildTimeline(todos);
    this.setData({ groups: groups });
  },

  buildTimeline: function (todos) {
    if (todos.length === 0) return [];

    var now = new Date();
    var todayStr = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

    var yesterday = new Date(now.getTime() - 86400000);
    var yesterdayStr = yesterday.getFullYear() + '-' + pad(yesterday.getMonth() + 1) + '-' + pad(yesterday.getDate());

    var groups = [];
    var currentLabel = '';
    var currentGroup = null;

    todos.forEach(function (todo) {
      var d = new Date(todo.createTime);
      var dateStr = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

      var label;
      if (dateStr === todayStr) {
        label = '今天';
      } else if (dateStr === yesterdayStr) {
        label = '昨天';
      } else {
        label = pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      }

      var timeStr = pad(d.getHours()) + ':' + pad(d.getMinutes());

      if (label !== currentLabel) {
        currentGroup = { label: label, items: [], isFirst: groups.length === 0 };
        groups.push(currentGroup);
        currentLabel = label;
      }

      currentGroup.items.push({
        id: todo.id,
        content: todo.content,
        completed: todo.completed,
        timeStr: timeStr,
        isLast: false
      });
    });

    for (var i = 0; i < groups.length; i++) {
      var group = groups[i];
      if (group.items.length > 0) {
        group.items[group.items.length - 1].isLast = true;
      }
    }

    return groups;
  },

  onInputChange: function (e) {
    this.setData({ inputValue: e.detail.value });
  },

  onAddTodo: function () {
    var val = this.data.inputValue.trim();
    if (!val) return;
    TodoStorage.add(val);
    this.setData({ inputValue: '' });
    this.loadTodos();
  },

  onToggleTodo: function (e) {
    var id = e.currentTarget.dataset.id;
    TodoStorage.toggleComplete(id);
    this.loadTodos();
  },

  onDeleteTodo: function (e) {
    wx.vibrateShort();
    var id = e.currentTarget.dataset.id;
    var self = this;
    wx.showModal({
      title: '删除确认',
      content: '确定要删除这条待办吗？',
      success: function (res) {
        if (res.confirm) {
          TodoStorage.remove(id);
          self.loadTodos();
        }
      }
    });
  }
});
