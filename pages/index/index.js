var NoteStorage = require('../../utils/NoteStorage');

var CATEGORIES = ['全部', '个人', '工作', '其他'];

Page({
  data: {
    keyword: '',
    activeCategory: '全部',
    categories: CATEGORIES,
    allNotes: [],
    leftColumn: [],
    rightColumn: []
  },

  onShow: function () {
    this.loadNotes();
  },

  loadNotes: function () {
    var notes = NoteStorage.getAll();
    var self = this;
    var processed = notes.map(function (n) {
      return Object.assign({}, n, {
        updateTimeStr: self.formatTime(n.updateTime),
        category: n.category || '其他'
      });
    });
    this.setData({ allNotes: processed }, function () {
      self.applyFilter();
    });
  },

  applyFilter: function () {
    var keyword = this.data.keyword.toLowerCase().trim();
    var activeCategory = this.data.activeCategory;
    var filtered = this.data.allNotes;

    if (activeCategory !== '全部') {
      filtered = filtered.filter(function (n) {
        return n.category === activeCategory;
      });
    }

    if (keyword) {
      filtered = filtered.filter(function (n) {
        return (n.title || '').toLowerCase().indexOf(keyword) !== -1 ||
               (n.content || '').toLowerCase().indexOf(keyword) !== -1;
      });
    }

    var left = [];
    var right = [];
    filtered.forEach(function (item, index) {
      if (index % 2 === 0) {
        left.push(item);
      } else {
        right.push(item);
      }
    });

    this.setData({ leftColumn: left, rightColumn: right });
  },

  onSearchInput: function (e) {
    var self = this;
    this.setData({ keyword: e.detail.value }, function () {
      self.applyFilter();
    });
  },

  onCategoryTap: function (e) {
    var category = e.currentTarget.dataset.category;
    var self = this;
    this.setData({ activeCategory: category }, function () {
      self.applyFilter();
    });
  },

  onCardTap: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/edit/edit?id=' + id });
  },

  onCardLongPress: function (e) {
    wx.vibrateShort();
    var id = e.currentTarget.dataset.id;
    var self = this;
    wx.showModal({
      title: '删除确认',
      content: '确定要删除这条便签吗？',
      success: function (res) {
        if (res.confirm) {
          NoteStorage.remove(id);
          self.loadNotes();
        }
      }
    });
  },

  onAddNote: function () {
    wx.navigateTo({ url: '/pages/edit/edit' });
  },

  formatTime: function (ts) {
    if (!ts) return '';
    var d = new Date(ts);
    var month = (d.getMonth() + 1).toString();
    var day = d.getDate().toString();
    var hour = d.getHours().toString();
    var min = d.getMinutes().toString();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hour.length < 2) hour = '0' + hour;
    if (min.length < 2) min = '0' + min;
    return month + '-' + day + ' ' + hour + ':' + min;
  }
});
