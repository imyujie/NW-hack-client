var request = require('request');
var fs = require('fs');
var md5 = require('md5');
module.exports = function() {
  this._username = '';
  this._password = '';
  this._sid = '';
  this._j = request.jar();
  var self = this;
  this._request = request.defaults({jar: self._j})
}

module.exports.prototype = {
  setUsername: function(us) {
    this._username = us;
  },
  setPassword: function(ps) {
    this._password = md5(ps).toUpperCase();
  },
  setSid: function(s) {
    this._sid = s;
  },
  getSid: function() {
    return this._sid;
  },
  setCaptcha: function(s) {
    this._captcha = s;
  },
  getCookies: function() {
    return this._cookies;
  },
  login: function(callback) {
    var self = this;
    console.log(self._captcha);
    var data = {
      username: self._username,
      password: self._password,
      _eventId: 'submit',
      gateway: 'true',
      lt: '',
      j_code: self._captcha
    };
    this._request.post({
      url: 'http://uems.sysu.edu.cn/elect/login',
      form: data
    }, callback);
  },
  getCaptchaImage: function(callback) {
    var self = this;
    this._request({
        url: 'http://uems.sysu.edu.cn/elect',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/600.5.17 (KHTML, like Gecko) Version/8.0.5 Safari/600.5.17'
        }
      }, function(error, res, body) {
        self._cookies = self._j.getCookieString('http://uems.sysu.edu.cn/elect');

        var r = self._request('http://uems.sysu.edu.cn/elect/login/code?v=' + Math.random())
                    .pipe(fs.createWriteStream('captcha.jpg'));
        
        r.on('close', callback);
    });
  },
  electCourse: function(jxbh, callback) {
    var self = this;
    var req = self._request.post({
      url: 'http://uems.sysu.edu.cn/elect/s/elect',
      form: {
        jxbh: jxbh,
        sid: self._sid
      }
    }, callback);
  }
}