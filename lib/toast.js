var Toast = function(opts) {
  this._toast = document.createElement('div');
  addClass(this._toast, 'toast');

  this._toast.textContent = opts.text;
  this._delay = opts.delay;
  this._state = 0;
}

Toast.prototype = {
  constructor: Toast,
  show: function() {
    var self = this;
    this._toast.style.display = 'block';
    
    addClass(this._toast, 'animated');
    addClass(this._toast, 'fadeInDown');
    
    this._toast.addEventListener('webkitAnimationEnd', function(e) {
      removeClass(self._toast, 'fadeInDown');
      self._toast.removeEventListener('webkitAnimationEnd', arguments.callee, false);
    }, false);

    setTimeout(function() {
      self.hide();
    }, self._delay);
  },
  hide: function() {
    var self = this;
    addClass(this._toast, 'fadeOutUp');

    this._toast.addEventListener('webkitAnimationEnd', function(e) {
      self._toast.style.display = 'none';
      removeClass(self._toast, 'fadeOutUp');
      self._toast.removeEventListener('webkitAnimationEnd', arguments.callee, false);
      self.remove();
    }, false);
  },
  remove: function() {
    this._toast.parentNode.removeChild(this._toast);
  },
  getDOMElement: function() {
    return this._toast;
  }
}

var ToastList = (function() {
  var _toastListEle;

  function _addToast(text) {
    var t = new Toast({
      text: text,
      delay: 5000
    });
    _toastListEle.insertBefore(t.getDOMElement(), _toastListEle.childNodes[0]);
    t.show();
  }

  return {
    init: function(ele) {
      _toastListEle = ele;
    },
    add: function(text) {
      _addToast(text);
    }
  };
}());