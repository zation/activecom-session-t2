(function($) { 
  $.fn.aswipe = function(opts) {
    var config = {
      min_move_x: 30,
      aswipeL: function() { },
      aswipeR: function() { },
      preventDefaultEvents: true
    };
     
  if (opts){
      $.extend(config, opts);
    }
  this.each(function() {
    var beginX;
    var isMoving = false;
 
       
    function onFingerMotion(e) {
      if(config.preventDefaultEvents) {
        e.preventDefault();
      }
      if(isMoving) {
        var x = e.touches[0].pageX;
        var dx = beginX - x;
        if(Math.abs(dx) >= config.min_move_x) {
          endMotion();
          if(dx > 0) {
            config.aswipeL();
          }
          else {
              config.aswipeR();
          }
        }
      }
    }
    
    function endMotion() {
      this.removeEventListener('touchmove', onFingerMotion);
      beginX = null;
      isMoving = false;
    } 
       
    function onFingerStart(e){
         if (e.touches.length == 1) {
           beginX = e.touches[0].pageX;
           isMoving = true;
           this.addEventListener('touchmove', onFingerMotion, false);
         }
       }       
       if ('ontouchstart' in document.documentElement) {
         this.addEventListener('touchstart', onFingerStart, false);
       }
  });
 
     return this;
   };
 
 })(jQuery);
