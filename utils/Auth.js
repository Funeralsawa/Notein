var API_BASE = 'http://127.0.0.1:8081/api/v1';
var REFRESH_INTERVAL = 5 * 60 * 1000;

function getTokens() {
  var tokens = wx.getStorageSync('auth_tokens');
  return tokens || {};
}

function setTokenField(key, value) {
  var tokens = getTokens();
  tokens[key] = value;
  wx.setStorageSync('auth_tokens', tokens);
}

function isLoggedIn() {
  var app = getApp();
  if (app && app.globalData && app.globalData.isLoggedIn) return true;
  return !!(getTokens().access_token);
}

function getAccessToken() {
  var app = getApp();
  if (app && app.globalData && app.globalData.accessToken) return app.globalData.accessToken;
  return getTokens().access_token || '';
}

function getRefreshToken() {
  return getTokens().refresh_token || '';
}

function getAlias() {
  var app = getApp();
  if (app && app.globalData && app.globalData.alias) return app.globalData.alias;
  return getTokens().alias || '';
}

function saveAuth(accessToken, refreshToken, alias) {
  wx.setStorageSync('auth_tokens', {
    access_token: accessToken,
    refresh_token: refreshToken,
    alias: alias
  });
  wx.setStorageSync('auth_last_refresh', Date.now());
  var app = getApp();
  if (app && app.globalData) {
    app.globalData.isLoggedIn = true;
    app.globalData.alias = alias;
    app.globalData.accessToken = accessToken;
  }
}

function logout() {
  wx.removeStorageSync('auth_tokens');
  wx.removeStorageSync('auth_last_refresh');
  var app = getApp();
  if (app && app.globalData) {
    app.globalData.isLoggedIn = false;
    app.globalData.alias = '';
    app.globalData.accessToken = '';
  }
}

function refreshAccessToken(callback) {
  var rt = getRefreshToken();
  if (!rt) {
    callback({ msg: '未登录' }, null);
    return;
  }

  wx.request({
    url: API_BASE + '/refresh',
    method: 'POST',
    header: { 'content-type': 'application/json' },
    data: { refresh_token: rt },
      success: function (res) {
        var body = res.data;
        if (typeof body === 'string') {
          try { body = JSON.parse(body); } catch (e) { body = {}; }
        }

        var accessToken = body.access_token || (body.data && body.data.access_token) || '';
        var refreshToken = body.refresh_token || (body.data && body.data.refresh_token) || '';

        if (accessToken && refreshToken) {
          saveAuth(accessToken, refreshToken, getAlias());
          callback(null, accessToken);
        } else {
          var msg = 'token 刷新失败';
          var bodyMsg = body.msg || (body.data && body.data.msg) || '';
          if (bodyMsg && bodyMsg !== 'success' && bodyMsg !== 'ok') {
            msg = bodyMsg;
          }
          callback({ msg: msg }, null);
        }
      },
    fail: function (err) {
      callback(err, null);
    }
  });
}

function ensureFreshToken(callback) {
  if (!isLoggedIn()) {
    callback('未登录', null);
    return;
  }

  var lastRefresh = wx.getStorageSync('auth_last_refresh') || 0;
  var now = Date.now();

  if (now - lastRefresh < REFRESH_INTERVAL) {
    callback(null, getAccessToken());
    return;
  }

  refreshAccessToken(function (err, token) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, token);
    }
  });
}

module.exports = {
  isLoggedIn: isLoggedIn,
  getAccessToken: getAccessToken,
  getRefreshToken: getRefreshToken,
  getAlias: getAlias,
  saveAuth: saveAuth,
  logout: logout,
  refreshAccessToken: refreshAccessToken,
  ensureFreshToken: ensureFreshToken
};
