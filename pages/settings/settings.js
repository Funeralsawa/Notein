var Auth = require('../../utils/Auth');

Page({
  data: {
    isLoggedIn: false,
    alias: ''
  },

  onShow: function () {
    this.setData({
      isLoggedIn: Auth.isLoggedIn(),
      alias: Auth.getAlias()
    });
  },

  onTapLogin: function () {
    wx.navigateTo({ url: '/pages/login/login' });
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
