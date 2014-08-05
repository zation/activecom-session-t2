ACTIVE.powerplant.register('teaser');
ACTIVE.powerplant.register('teaser_left_top');
ACTIVE.powerplant.register('teaser_center_top');
ACTIVE.powerplant.register('teaser_right_top');


ACTIVE.powerplant.teaser_left_top = function powerplant_teaser_left_top(){
  if(_.isObject(ACTIVEADS.teaser_left_top)){
    new ACTIVE.powerplant.factory('teaser','left');
    new ACTIVE.powerplant.factory('adTracker', ACTIVEADS.teaser_left_top.item.adTracker);
  }
}
ACTIVE.powerplant.teaser_center_top = function powerplant_teaser_center_top(){
  if(_.isObject(ACTIVEADS.teaser_center_top)){
    new ACTIVE.powerplant.factory('teaser','center');
    new ACTIVE.powerplant.factory('adTracker', ACTIVEADS.teaser_center_top.item.adTracker);
  }
}
ACTIVE.powerplant.teaser_right_top = function powerplant_teaser_right_top(){
  if(_.isObject(ACTIVEADS.teaser_right_top)){
    new ACTIVE.powerplant.factory('teaser','right');
    new ACTIVE.powerplant.factory('adTracker', ACTIVEADS.teaser_right_top.item.adTracker);
  }
}

ACTIVE.powerplant.teaser = function powerplant_teaser(position){
  var index = 'teaser_'+position+'_top';
  var options = ACTIVEADS[index]; 

  var _defaults = {item:{}};
  var defaults = $.extend({},_defaults.item, options.item);

  var _this = this;
  var _h = _this.constructor.helpers;

  _this.init = function(){
    var teaser = $('#teaser_pos_'+position);
    teaser.addClass('sponsored');
    teaser.find('a.primary-link').attr('href',defaults.linkUrl);
    _this.hover(teaser.find('a.primary-link'));

    teaser.find('img').attr('src',defaults.imageUrl);
    teaser.find('.sponsored-hover-data h4').text(_h.limitText(_h.cleanText(defaults.eventTitle),60));
    teaser.find('.sponsored-hover-data .date').text(_h.cleanText(defaults.eventDate));
    teaser.find('.sponsored-hover-data .location').text(_h.limitText(_h.cleanText(defaults.eventLocation),64));    
  }

  _this.hover = function(ele){
    ele.hover(function(){
        ele.addClass('reverse-text');
      },function(){
        ele.removeClass('reverse-text');
    });
  }
  return _this.init();
};
ACTIVE.powerplant.silo(ACTIVE.powerplant.teaser);
