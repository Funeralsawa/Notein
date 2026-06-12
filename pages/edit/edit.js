var NoteStorage = require('../../utils/NoteStorage');

var COLORS = ['#c9d9c2', '#e5d8b2', '#b8c9d4', '#d4b8c2', '#c2c2c2'];
var CATEGORIES = ['个人', '工作', '其他'];
var POLISH_API = 'http://127.0.0.1:8081/api/v1/polish';

Page({
  data: {
    id: '',
    title: '',
    content: '',
    bgColor: '#c9d9c2',
    category: '个人',
    colors: COLORS,
    categories: CATEGORIES,
    polishing: false
  },

  onLoad: function (options) {
    var id = options.id || '';
    if (id) {
      var note = NoteStorage.getById(id);
      if (note) {
        this.setData({
          id: note.id,
          title: note.title || '',
          content: note.content || '',
          bgColor: note.bgColor || '#c9d9c2',
          category: note.category || '其他'
        });
      }
    }
  },

  onUnload: function () {
    this.saveNote();
  },

  saveNote: function () {
    var data = this.data;
    if (!data.title.trim() && !data.content.trim()) return;
    NoteStorage.save({
      id: data.id || '',
      title: data.title.trim(),
      content: data.content.trim(),
      bgColor: data.bgColor,
      category: data.category
    });
  },

  onPolish: function () {
    var content = this.data.content.trim();
    if (!content) {
      wx.showToast({ title: '请先输入内容', icon: 'none' });
      return;
    }

    var self = this;
    this.setData({ polishing: true });
    wx.showLoading({ title: '润色中...', mask: true });

    wx.request({
      url: POLISH_API,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: { content: content },
      success: function (res) {
        wx.hideLoading();
        self.setData({ polishing: false });
        if (res.statusCode === 200 && res.data && res.data.code === 200 && res.data.data) {
          self.setData({ content: res.data.data });
          wx.showToast({ title: '润色完成', icon: 'success' });
        } else {
          wx.showToast({ title: '润色失败', icon: 'none' });
        }
      },
      fail: function () {
        wx.hideLoading();
        self.setData({ polishing: false });
        wx.showToast({ title: '网络请求失败', icon: 'none' });
      }
    });
  },

  onTitleInput: function (e) {
    this.setData({ title: e.detail.value });
  },

  onContentInput: function (e) {
    this.setData({ content: e.detail.value });
  },

  onColorTap: function (e) {
    this.setData({ bgColor: e.currentTarget.dataset.color });
  },

  onCategoryTap: function (e) {
    this.setData({ category: e.currentTarget.dataset.category });
  }
});
