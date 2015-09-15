var request = require('request');

var j = request.jar()

var htmlDec = require('htmldec');

function htmlDecode (str) {
  str = htmlDec(str);
  return str.match(/<textarea>(.+)<\/textarea>/)[1];
}
var idx = 0;
process.on('message', function(m) {
  cookie = request.cookie(m.cookies);
  j.setCookie(cookie, 'http://uems.sysu.edu.cn/elect', function (err, cookie){});
  var sid = m.sid;
  var jxbh = m.jxbh;

  function postElect() {
    request.post({url: 'http://uems.sysu.edu.cn/elect/s/elect', form: {sid: sid, jxbh: jxbh}, jar: j, timeout: 6000}, function (err, res, body) {
      if (err) {
        process.send({body: '请求超时，请检查网络环境'});
      } else if (res.statusCode === 200) {
        var t = htmlDecode(body);
        eval('var obj = ' + t);
        if (obj.err.code === 18) {
          setTimeout(function() {
            postElect();
          }, 200);
          
        } else if (obj.err.code === 0) {
          process.send({body: {jxbh: jxbh}});
        } else {
          process.send({body: obj});
        }
      } else {
        process.send({body: '请求超时，请检查网络环境'});
      }

    
    });
  }

  postElect();
});




