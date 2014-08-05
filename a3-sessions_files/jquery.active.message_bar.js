;(function($){
  $.fn.activeMessageBar = function(options)
  {
    var defaults = {
      type: ""
    }
    var settings = _.extend(defaults, settings);
    var self = this, clbtn = self.find('#close-message-box');

    self.addClass(settings.type);
    if(self.find('.description').text().trim() != ""){
      self.show().addClass('open');
      clbtn.click(function(){
        self.slideUp().removeClass('open');
      });
    }
    return false;
  }
}(jQuery));
