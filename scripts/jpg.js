var pixelJPG = require('pixel-jpg');
var jpgExport = require('jpeg-js');
var fs = require('fs');
function lumi(r, g, b) {
  return Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
}

function rgba_decode(pixel) {
  return {
    r: 0xFF & (pixel >> 24),
    g: 0xFF & (pixel >> 16),
    b: 0xFF & (pixel >> 8),
    a: 0xFF & pixel
  };
}

function rgba_encode(color) {
  return (color.r << 24 | 
          color.g << 16 |
          color.b << 8 |
          color.a);
}


function exportJPG(w, h, pixels, filename, callback) {
  var rawImageData = {
    data: new Buffer(w*h*4),
    width:  w,
    height: h
  };
  
  // Now we convert the data
  var x,y,idx,idxpix;
  for (y = 0; y < h; y++) {
    for (x = 0; x < w; x++) {
      idx = (w * y + x) << 2;
      idxpix = y * w + x;
      color = rgba_decode(pixels[idxpix]);
      rawImageData.data[idx] = color.r;
      rawImageData.data[idx+1] = color.g;
      rawImageData.data[idx+2] = color.b;
      rawImageData.data[idx+3] = color.a;
    }
  }
  
  var encoded = jpgExport.encode(rawImageData, 50);
  
  // Write the buffer to a file
  fs.open(filename, 'w', function(err, fd) {
    if (err) {
      console.log("Unable to write file "+filename);
      callback(false);
      return false;
    }
    
    fs.write(fd, encoded.data, 0, encoded.data.length, null, function(err) {
      if (err) {
        console.log("Error writing file "+filename);
        callback(false);
        return false;
      }
      fs.close(fd, function() {
        callback(filename);
      })
    });
  });
}
function processImage() {
  pixelJPG.parse('captcha.jpg').then(function(images) {
    var image = images[0];
    var h = image.height;
    var w = image.width;
    var pixels  = new Uint32Array((w-2)*(h-2)); // crop
    for (var y = 1; y < h - 1; y++) {
      for (var x = 1; x < w - 1; x++) {
        var idx = (w * y + x) << 2;
        var each = lumi(image.data[idx], image.data[idx+1], image.data[idx+2]); // grayscale
        each = each > 120 ? 255 : 0;
        pixels[(y-1) * (w-2) + (x - 1)] = rgba_encode({
          r:  each,
          g:  each,
          b:  each,
          a:  100
        });
      }
    }
    exportJPG(w - 2, h - 2, pixels, 'output.jpg', function() {
      process.send({status: 1});
    });
  });
}

process.on('message', function(m) {
  processImage('captcha.jpg');
});


