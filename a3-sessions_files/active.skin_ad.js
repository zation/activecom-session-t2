/**
 * Created by mrobertson on 6/13/14.
 */

(function($){

  $.fn.skinAdPlacement = function( options ){

    var defaults = {
      // array of pages that have the new background hero carousel
      pages_with_heros : [
        "landing_page_factory",
        "asset_service"
      ]
    };
    var settings = $.extend({},defaults,options);
    // private
    var pri = {
      createBackgroundImage: function(){
        $('body').css({
          backgroundImage: 'url(' + settings.skinAssetLink + ')',
          backgroundColor: settings.backgroundColor,
          backgroundPosition: '50% 156px',
          backgroundRepeat: 'no-repeat'
        });
      },
      createPageLink: function(){
        var link = $('<a href="'+settings.skinAssetUrl+'" target="_blank" class="right-featured-link +'+settings.bannerClass+'"></a>');
        link.insertBefore($('#skin_ad_link'));
      },
      createAdTracker: function(){
        var tracker = $('<div style="position:absolute;height:1px;width:1px;left:-9999px;top:-9999px;z-index:-1;" id="skinTracker"><img src="settings.skinTracker" /></div>');
        tracker.appendTo($('body'));
      },
      // callbacks for pages with background hero carousel, make page specific changes
      pageAdjustments: {
        landing_page_factory: function(){
          $('.lpf-breadcrumb').addClass('lpf-breadcrumb-skin-ad-adjustment');
        }
      }
    };

    return function(){
      var asset_link_check = settings.skinAssetLink.match(/^default$/ig) || undefined;
      var cb = pri.pageAdjustments[ACTIVE.ui.controller_name];
      var asset = window.asset || undefined;

      if( asset_link_check !== undefined ||
          (asset && asset.sourceSystem.legacyGuid.toUpperCase() == "3BF82BBE-CF88-4E8C-A56F-78F5CE87E4C6")) {
        if( $('#hero-full-width .item').length > 0) {
          $('#hero-full-width .item').show();
          return;
        }
        ACTIVE.ui.showDefaultBackgroundImage();
      } else {
        if( $('#hero-full-width').length > 0) {
          $('#hero-full-width').hide();
        }
        if( cb ) {
          cb();
        }
        pri.createBackgroundImage();
        pri.createPageLink();
        pri.createAdTracker();
      }
    }();
  }

}(jQuery));
