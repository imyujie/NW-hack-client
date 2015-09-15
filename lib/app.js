var ChildProcess = require('child_process');
var ElectClient = require('./lib/electClient');
var c = new ElectClient();

var electList = [];
window.onload = init;

function htmlDecode(s){  
  var div = document.createElement('div');  
  div.innerHTML = s;  
  return div.innerText || div.textContent;  
};

function recognize_image(callback) {

  var pr = ChildProcess.fork('./scripts/jpg.js');
  pr.send({m: 'start'});
  pr.on('message', function(m) {
    var img = new Image();
    img.src = 'output.jpg';
    img.onload = function(){
      OCRAD(img, function(text){
        text = text.replace(/l/g, 'I')
                   .replace(/0/g, 'O')
                   .replace(/5/g, 'S')
                   .replace(/_/g, 'j')
                   .replace(/a/g, 'Q')
                   .replace(/\s/g, '');
        callback(text);
      });
    }
  });
  pr.on('error', function(err) {
    console.log(err);
  });
}
var processes = [];
function elect(jxbh) {
  var n = ChildProcess.fork('./scripts/elect.js');
  n.on('message', function(m) {
    var obj = m.body;
    var startBtn = document.querySelector('#start');
    var stopBtn = document.querySelector('#stop');
    var dim = document.querySelector('.dim');
    var listWrapper = document.querySelector('.list-view-wrapper');
    removeClass(dim, 'active');
    removeClass(listWrapper, 'blur');
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    if (typeof(m.body) === 'string') {

      ToastList.add(m.body);
      ToastList.add('正在尝试重新登录...');

      for (var i = 0, len = process.length; i < len; i++) {
        processes[i].kill();
      }
      auto_login('always', function() {
        processes = [];
        for (var i = 0, len = electList.length; i < len; i++) {
          elect(electList[i]);
        }
      });
      return;
    }
    if (!!obj.err.caurse) {
      ToastList.add(obj.err.caurse);
    } else {
      ToastList.add(msg[obj.err.code]);
    }
  });
  n.send({
    sid: c.getSid(),
    cookies: c.getCookies(),
    jxbh: jxbh
  });
  processes.push(n);
}

function switchPage(p1, p2, typ) {
  if (typ === 'forward') {
    addClass(p1, 'animated');
    addClass(p1, 'fadeOutLeft');

    p2.style.display = 'block';
    addClass(p2, 'animated');
    addClass(p2, 'fadeInRight');
  } else {

  }
}

function init() {

  if (process.platform == "darwin") {
    document.querySelector('.mac-title-bar').style.display = 'block';
  } else {
    document.querySelector('.win-title-bar').style.display = 'block';
  }
  
  var closeBtn = document.querySelector('#close');
  var miniBtn = document.querySelector('#minimize');
  var captcha = document.querySelector('#captcha');
  var form = document.querySelector('form');
  var uid = document.querySelector('#username');
  var pwd = document.querySelector('#password');
  var cap = document.querySelector('#cap');
  var list = document.querySelectorAll('.list-view')[0];
  var startBtn = document.querySelector('#start');
  var stopBtn = document.querySelector('#stop');
  var addBtn = document.querySelector('#add-class');
  var loginPage = document.querySelector('#login-page');
  var electPage = document.querySelector('#elect-page');
  var toasts = document.querySelector('.toast-list');
  var dim = document.querySelector('.dim');

  var listWrapper = document.querySelector('.list-view-wrapper');

  ToastList.init(toasts);

  closeBtn.addEventListener('click', function() {
    window.close();
  }, false);

  document.querySelector('#win-close').addEventListener('click', function() {
    window.close();
  }, false);

  miniBtn.addEventListener('click', function() {
    gui.Window.get().minimize();
  }, false);

  document.querySelector('#win-minimize').addEventListener('click', function() {
    gui.Window.get().minimize();
  }, false);

  
  addBtn.addEventListener('click', function(e) {
    var input = document.createElement('input');
    addClass(input, 'numberfield');
    addClass(input, 'textfield');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', '教学班号');
    list.appendChild(input);
  }, false);

  startBtn.addEventListener('click', function(e) {
    var listView = document.querySelectorAll('.list-view')[0];
    var inputs = listView.querySelectorAll('.numberfield');
    var flag = false;
    for (var i = 0, len = inputs.length; i < len; i++) {
      var jxbh = inputs[i].value;
      jxbh = jxbh.replace(/\s/g, '');
      if (jxbh.length > 0) {
        elect(jxbh);
        electList.push(jxbh);
        flag = true;
      }
    }
    if (flag) {
      startBtn.style.display = 'none';
      stopBtn.style.display = 'block';
      addClass(dim, 'active');
      addClass(listWrapper, 'blur');
    }
  }, false);

  stopBtn.addEventListener('click', function(e) {
    for (var i = 0, len = processes.length; i < len; i++) {
      processes[i].kill();
    }
    removeClass(dim, 'active');
    removeClass(listWrapper, 'blur');
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
  }, false);

  function auto_login(typ, callback) {
    callback = callback || function() {};
    c.getCaptchaImage(function() {
      recognize_image(function(text) {
        c.setCaptcha(text);
        console.log(text);
        c.login(function cb(err, res, body) {
          if (res.statusCode === 500) {
            if (body.indexOf('验证码') >= 0) {
              auto_login('always');
            } else {
              if (typ !== 'first') {
                ToastList.add('学号或密码错误');
              }
              return;
            }
          } else {
            callback();
            var loc = res.headers.location;
            c.setSid(loc.split('=')[1]);
            switchPage(loginPage, electPage, 'forward');
          }
        });
      });
    });
  }
  
  auto_login('first');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    c.setPassword(pwd.value);
    c.setUsername(uid.value);
    
    c.login(function cb(err, res, body) {
      if (res.statusCode === 500) {
        if (body.indexOf('验证码') >= 0) {
          auto_login('always');
        } else {
          if (typ !== 'first') {
            ToastList.add('学号或密码错误');
          }
          return;
        }
      } else {
        var loc = res.headers.location;
        c.setSid(loc.split('=')[1]);
        switchPage(loginPage, electPage, 'forward');
      }
    });
    

    return false;
  }, false);

  function isCombine(e) {
    if (process.platform == "darwin") {
      return e.KeyCode === 91;
    } else {
      return e.ctrlKey;
    }
  }
  function ini() {
    var lastValue = '';
    

    list.addEventListener('keyup', function(e) {
      var t = e.target;
      if (t.className.indexOf('numberfield') < 0) {
        return;
      }
      if (!(e.KeyCode === 91)) {
        if ((e.KeyCode > 57 || e.KeyCode < 48) && e.KeyCode !== 8) {
          t.value = lastValue;
        }
      } else {
        var v = t.value, res = [];
        for (var i = 0, len = v.length; i < len; i++) {
          if (!isNaN(v[i])) {
            res.push(v[i]);
          }
        }
        t.value = res.join('');
      }
      lastValue = t.value;
    }, false);
  }

  ini();
}
