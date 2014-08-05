ACTIVE.powerplant.register('native_top');
ACTIVE.powerplant.native_top = function powerplant_native_top(){
  if(_.validate_factory(this) && _.isObject(ACTIVEADS.native_top)){
    var options = ACTIVEADS.native_top;

    var _defaults = {item:{}};
    var defaults = $.extend({},_defaults.item,options.item);

    var _this = this;
    var _h = _this.constructor.helpers;
    
    var listItem = $('#sponsored-latest-update');
    listItem.find('.description-link').attr('href',defaults.link_url);
    listItem.find('img').attr('src',defaults.image_url);
    listItem.find('h5').text(_h.cleanText(defaults.eventTitle));
    listItem.find('.sponsored-text').text(_h.cleanText(defaults.sponsored_text));
    listItem.find('.sponsored-link').attr('href',defaults.sponsored_link_url).text(_h.cleanText(defaults.sponsored_owner));
    listItem.show();
    
    return new ACTIVE.powerplant.factory('adTracker',ACTIVEADS.native_top.item.adTracker);
  }
}
ACTIVE.powerplant.silo(ACTIVE.powerplant.native_top);
