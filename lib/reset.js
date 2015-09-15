var gui = require('nw.gui');
win = gui.Window.get();

var tray;

// Get the minimize event
win.on('minimize', function() {
  // Hide window
  this.hide();

  // Show tray
  var icon_image = process.platform == "darwin" ? 'shenqi_icon_16.png' : 'shenqi_icon.png';
  tray = new gui.Tray({ icon: icon_image});

  // Show window and remove tray when clicked
  tray.on('click', function() {
    win.show();
    if (process.platform != "darwin") {
      win.setTransparent(!win.isTransparent);
      win.setTransparent(!win.isTransparent);
    }
    this.remove();
    tray = null;
  });
});


if (process.platform == "darwin") {
  var menu = new gui.Menu({type: "menubar"});
  menu.createMacBuiltin && menu.createMacBuiltin(window.document.title);
  gui.Window.get().menu = menu;
} else {
  win.setTransparent(!win.isTransparent);
  win.setTransparent(!win.isTransparent);
}
