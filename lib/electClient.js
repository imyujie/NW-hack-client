var request = require('request');
var fs = require('fs');
var md5 = require('md5');
module.exports = function() {
  this._username = '';
  this._password = '';
  this._sid = '';
  var self = this;
  this._request = request;
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
    return this._j.getCookieString('http://uems.sysu.edu.cn/elect');;
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
      form: data,
      jar: self._j
    }, callback);
  },
  getCaptchaImage: function(callback) {
    var self = this;
    self._j = request.jar();
    this._request({
        url: 'http://uems.sysu.edu.cn/elect?_t=' + Math.random(),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/600.5.17 (KHTML, like Gecko) Version/8.0.5 Safari/600.5.17'
        },
        jar: self._j
      }, function(error, res, body) {
        var r = self._request({url: 'http://uems.sysu.edu.cn/elect/login/code?v=' + Math.random(), jar: self._j})
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