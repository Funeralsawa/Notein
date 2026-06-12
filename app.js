var Auth = require('./utils/Auth');

App({
  globalData: {
    isLoggedIn: false,
    alias: '',
    accessToken: ''
  },

  onLaunch: function () {
    var tokens = wx.getStorageSync('auth_tokens');
    if (tokens && tokens.access_token) {
      var app = this;
      app.globalData.isLoggedIn = true;
      app.globalData.alias = tokens.alias || '';
      app.globalData.accessToken = tokens.access_token;

      Auth.ensureFreshToken(function () {});
    }
  },

  onShow: function () {
    if (this.globalData.isLoggedIn) {
      Auth.ensureFreshToken(function () {});
    }
  }
});
