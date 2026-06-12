Page({
  data: {
    email: '',
    password: '',
    confirmPassword: '',
    loading: false
  },

  onEmailInput: function (e) {
    this.setData({ email: e.detail.value });
  },

  onPasswordInput: function (e) {
    this.setData({ password: e.detail.value });
  },

  onConfirmInput: function (e) {
    this.setData({ confirmPassword: e.detail.value });
  },

  onRegister: function () {
    var email = this.data.email.trim();
    var password = this.data.password;
    var confirmPassword = this.data.confirmPassword;

    if (!email) {
      wx.showToast({ title: '请输入邮箱', icon: 'none' });
      return;
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    if (password !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }

    var self = this;
    this.setData({ loading: true });
    wx.showLoading({ title: '注册中...', mask: true });

    wx.request({
      url: 'http://127.0.0.1:8081/api/v1/register',
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: { email: email, password: password },
      success: function (res) {
        wx.hideLoading();
        self.setData({ loading: false });

        if (res.statusCode !== 200) {
          wx.showToast({ title: '注册失败', icon: 'none' });
          return;
        }

        wx.showToast({ title: '注册成功，请登录', icon: 'success', duration: 800 });
        setTimeout(function () {
          wx.redirectTo({ url: '/pages/login/login' });
        }, 1000);
      },
      fail: function () {
        wx.hideLoading();
        self.setData({ loading: false });
        wx.showToast({ title: '网络请求失败', icon: 'none' });
      }
    });
  },

  onGoLogin: function () {
    wx.redirectTo({ url: '/pages/login/login' });
  }
});
