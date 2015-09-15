var lwip = require('lwip');

function lumi(r, g, b) {
  return Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
}

process.on('message', function(m) {
  process_image('captcha.jpg');
});
function process_image(src) {
  lwip.open(src, function(err, image){
   
    var w = image.width();
    var h = image.height();

    var i = 0, j = 0;
    var flag = false;
    function setP(i, j) {
      if (j >= h -1) {
        j = 0;
        i = i + 1;
      } else {
        j = j + 1;
      }
      if (i == w) {
        return;
      }

      (function(i, j) {

        var c = image.getPixel(i, j);
        var each = lumi(c.r, c.g, c.b) > 120 ? 255 : 0;
        image.setPixel(i, j, [each, each, each, 100], function(err, image) {
          if (i == w - 1 && j == h - 1) {
            image.batch()
            .crop(w-2, h-2)       // crop a 200X200 square from center
            .writeFile('output.jpg', function(err){
              // console.log('success');
              process.send({status: 1});
            });
          } else {
            setP(i, j);
          }
        });
      }(i, j));
    }
    setP(i, j);
   
  });
}
