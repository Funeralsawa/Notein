var app = getApp();
var Auth = require('../../utils/Auth');

Page({
  data: {
    email: '',
    password: '',
    loading: false
  },

  onEmailInput: function (e) {
    this.setData({ email: e.detail.value });
  },

  onPasswordInput: function (e) {
    this.setData({ password: e.detail.value });
  },

  onLogin: function () {
    var email = this.data.email.trim();
    var password = this.data.password;
    if (!email) {
      wx.showToast({ title: '请输入邮箱', icon: 'none' });
      return;
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    wx.showLoading({ title: '登录中...', mask: true });

    var self = this;
    wx.request({
      url: 'http://127.0.0.1:8081/api/v1/login',
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: { email: email, password: password },
      success: function (res) {
        wx.hideLoading();
        self.setData({ loading: false });

        var body = res.data;
        if (typeof body === 'string') {
          try { body = JSON.parse(body); } catch (e) { body = {}; }
        }

        var accessToken = body.access_token || (body.data && body.data.access_token) || '';
        var refreshToken = body.refresh_token || (body.data && body.data.refresh_token) || '';
        var alias = body.alias || (body.data && body.data.alias) || email;

        if (!accessToken) {
          var msg = '登录失败';
          var bodyMsg = body.msg || (body.data && body.data.msg) || '';
          if (bodyMsg && bodyMsg !== 'success' && bodyMsg !== 'ok') {
            msg = bodyMsg;
          }
          wx.showToast({ title: msg, icon: 'none' });
          return;
        }

        Auth.saveAuth(accessToken, refreshToken, alias);
        wx.reLaunch({ url: '/pages/mine/mine' });
      },
      fail: function () {
        wx.hideLoading();
        self.setData({ loading: false });
        wx.showToast({ title: '网络请求失败', icon: 'none' });
      }
    });
  },

  onGoRegister: function () {
    wx.redirectTo({ url: '/pages/register/register' });
  }
});
