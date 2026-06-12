var Auth = require('../../utils/Auth');
var NoteStorage = require('../../utils/NoteStorage');
var TodoStorage = require('../../utils/TodoStorage');
var API_BASE = 'http://127.0.0.1:8081/api/v1';

var CATEGORY_MAP = { '个人': 0, '工作': 1, '其他': 2 };

Page({
  data: {
    isLoggedIn: false,
    alias: '',
    syncing: false
  },

  onShow: function () {
    var loggedIn = Auth.isLoggedIn();
    this.setData({
      isLoggedIn: loggedIn,
      alias: loggedIn ? Auth.getAlias() : ''
    });
  },

  onTapSync: function () {
    var self = this;

    Auth.ensureFreshToken(function (err, token) {
      if (err) {
        wx.showToast({ title: 'token 已过期，请重新登录', icon: 'none' });
        return;
      }

      var notes = NoteStorage.getAll().map(function (n) {
        return {
          id: n.id,
          userID: 0,
          title: n.title || '',
          content: n.content || '',
          bgColor: n.bgColor || '#c9d9c2',
          category: CATEGORY_MAP[n.category] !== undefined ? CATEGORY_MAP[n.category] : 2,
          createTime: n.createTime,
          updateTime: n.updateTime
        };
      });

      var todos = TodoStorage.getAll().map(function (t) {
        return {
          id: t.id,
          userID: 0,
          content: t.content || '',
          isCompleted: !!t.completed,
          createTime: t.createTime,
          updateTime: t.updateTime
        };
      });

      self.setData({ syncing: true });
      wx.showLoading({ title: '同步中...', mask: true });

      wx.request({
        url: API_BASE + '/sync',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        data: {
          notes: notes,
          todo: todos
        },
        success: function (res) {
          wx.hideLoading();
          self.setData({ syncing: false });

          if (res.statusCode === 200) {
            wx.showToast({ title: '同步成功', icon: 'success' });
          } else {
            var msg = (res.data && res.data.msg) ? res.data.msg : '同步失败';
            wx.showToast({ title: msg, icon: 'none' });
          }
        },
        fail: function () {
          wx.hideLoading();
          self.setData({ syncing: false });
          wx.showToast({ title: '网络请求失败', icon: 'none' });
        }
      });
    });
  },

  onTapLogin: function () {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  onTapRegister: function () {
    wx.navigateTo({ url: '/pages/register/register' });
  },

  onTapSettings: function () {
    wx.navigateTo({ url: '/pages/settings/settings' });
  },

  onLogout: function () {
    var self = this;
    wx.showModal({
      title: '退出确认',
      content: '确定要退出登录吗？',
      success: function (res) {
        if (res.confirm) {
          Auth.logout();
          self.setData({ isLoggedIn: false, alias: '' });
        }
      }
    });
  }
});
