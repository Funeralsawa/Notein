var NoteStorage = require('../../utils/NoteStorage');

var COLORS = ['#c9d9c2', '#e5d8b2', '#b8c9d4', '#d4b8c2', '#c2c2c2'];
var CATEGORIES = ['个人', '工作', '其他'];

Page({
  data: {
    id: '',
    title: '',
    content: '',
    bgColor: '#c9d9c2',
    category: '其他',
    colors: COLORS,
    categories: CATEGORIES
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
