(function(window,undefined){
  "use strict";
  var mFlyoutElements = {
    pageWrapper: $('#page-wrapper'), 
    rightFlyout: $('#mobile-account-links'),
    rightFlyoutBtn: $('#mobile-account-nav-button'), 
    heyBody: $('body:eq(0)'),
    leftFlyoutBtn: $('#mobile-nav-button'),
    leftFlyout: $('#mobile-nav-links')};

  window.RAILS.controllers.mobile = {
    init: function() {
      new ACTIVE.mobile.mobile_nav({
        page_wrapper: $('#page-wrapper'),
        mobile_nav_links: $('#mobile-nav-links'),
        body_tag: $('body:eq(0)'),
        mobile_nav_button: $('#mobile-nav-button')
      });
      new ACTIVE.mobile.mobile_account_nav({
        page_wrapper: $('#page-wrapper'),
        mobile_account_links: $('#mobile-account-links'),
        body_tag: $('body:eq(0)'),
        mobile_account_nav_button: $('#mobile-account-nav-button')
      });
      new ACTIVE.mobile.search_bar({
        search_bar: $('#mobile-search'),
        mobile_search_bar_button: $('#mobile-search-bar-button')
      });
      new ACTIVE.mobile.open_menu({button: $('#mobile_running_link a'), dropdown: $('#mobile_running_nav')});
      new ACTIVE.mobile.open_menu({button: $('#mobile_cycling_link a'), dropdown: $('#mobile_cycling_nav')});
      new ACTIVE.mobile.open_menu({button: $('#mobile_triathlon_link a'), dropdown: $('#mobile_triathlon_nav')});
      new ACTIVE.mobile.open_menu({button: $('#mobile_fitness_link a'), dropdown: $('#mobile_fitness_nav')});
      new ACTIVE.mobile.open_menu({button: $('#mobile_more_link a'), dropdown: $('#mobile_more_nav')});

      new ACTIVE.mobile.show_filter({btn_filter: $('#btn-filter'), tab_filter: $('#tab-filter')});
      new ACTIVE.mobile.show_add_manage({btn_add_manage: $('#btn-add-manage'), add_manage_panel: $('#add-manage-panel')});
      new ACTIVE.mobile.show_full_site({link: $('#view-desktop-link')});
      new ACTIVE.mobile.open_search_box({mobile_search_bar_button: $('#mobile-search-bar-button')});
      ACTIVE.mobile.flyout_swipe(mFlyoutElements);
      new ACTIVE.ui.search.initTypeahead({
        typeaheadElement: $('#mobile-search-form input[name="keywords"]'),
        searchButton: $('#mobile-search-form button')
      });
      $('#mobile-location-header .header-location a').location_change({
        displayLocation: false,
        hideTriggerContainer: false,
        placeholderText: "Enter Location"
      });
      $('#activity-feed-location-toggle h3').unbind('location_change');
      $('#popular-change-location-toggle h5').unbind('location_change');

      function set_carousel_header_height() {
        if (ACTIVE.ui.mediaViewport) {
          if ($('body').data('controller') == "asset_service") {
            var page_title_height = $('.page-title').height();
            $('.c-inner .item').height(page_title_height + 80);
            $('.c-inner').height(page_title_height + 130);
          }
        }
      }
      set_carousel_header_height();

      $(window).resize(function(){
        if(typeof window.matchMedia !== 'undefined') {
          if (matchMedia("(max-width: 320px)").matches || matchMedia("(max-width: 480px)").matches || matchMedia("(max-width: 767px)").matches) {
            set_carousel_header_height();
          } else {
            $('.c-inner .item').height(395);
            $('.c-inner').height(395);
          }
        }
      });
    }
  }
})(window);
