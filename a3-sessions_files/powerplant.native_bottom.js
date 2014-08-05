ACTIVE.powerplant.register('native_bottom');
ACTIVE.powerplant.native_bottom = function powerplant_native_bottom(){
  if(_.validate_factory(this) && _.isObject(ACTIVEADS.native_bottom)){
    var options = ACTIVEADS.native_bottom;
    
    var _defaults = {item:{}};
    var defaults = $.extend({},_defaults.item,options.item);
    
    var _this = this;
    var _h = _this.constructor.helpers;
    
    var listItem = $('#popular-article-ad');
    listItem.find('.popular-article-ad-image-link').attr('href', defaults.link_url);
    listItem.find('img').attr('src', defaults.image_url);
    listItem.find('.popular-article-ad-link').attr('href',defaults.link_url);
    listItem.find('.popular-article-ad-link').text(_h.cleanText(defaults.eventTitle));
    listItem.find('.sponsored-text').text(_h.cleanText(defaults.sponsored_text));
    listItem.find('.sponsored-link').attr('href', defaults.sponsored_link_url).text(_h.cleanText(defaults.sponsored_owner));
    listItem.show();
    
    return new ACTIVE.powerplant.factory('adTracker',ACTIVEADS.native_bottom.item.adTracker);
  }
}
ACTIVE.powerplant.silo(ACTIVE.powerplant.native_bottom);
