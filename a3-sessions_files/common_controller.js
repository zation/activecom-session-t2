// Application-wide code to be executed on DOMReady
(function(window,undefined){
  "use strict";

  window.RAILS.controllers.common = {
    init: function() {
      ACTIVE.widgets.ui.ieHelper();
      ACTIVE.widgets.ui.safariHelper();
      new ACTIVE.powerplant.factory('link_helper');
      $('select').selectBoxIt();
      $('input[type^=checkbox]').checkbox();

      //mark header
      if($.browser.mozilla) $('html').addClass('mozilla');

      ACTIVE.ui.linkLocationHelper = function(options){
        $.fn.linkLocationHelper = function(){
          var normalHeaderLink = $('#header-location-link'),
              link = $(this).attr('href'),
              location = normalHeaderLink.text() != 'Everywhere' ? normalHeaderLink.text() : '';
              if( link.indexOf('?') > -1 ){
                link = link + '&location=' + location;
              }else{
                link = link + '?location=' + location;
              }
          return $(this).attr('href', link);
        }
        $(options.linkClass).each(function(){ $(this).linkLocationHelper() });
      }

      ACTIVE.utilities.affiliateCookieCreation = function(){
        // ---------------------------------------------
        // Affiliate cookie creation+
        var query = ACTIVE.ui.parseSearchQuery();

        if ( query.ltcmp && query.ltclickid ) {
        var params = 'ltcmp=' + query.ltcmp + '&' + 'ltclickid=' + query.ltclickid;
        $.cookie('affiliate', params, { expires: 30, path: '/', domain: ACTIVE.cookie_domain});
        }
      }

      // Init Twitter Bootstrap
      $("a[rel=popover]").popover();
      $(".tooltip").tooltip();
      $("a[rel=tooltip]").tooltip();


      $('#flash_messages').delay(1000).show("blind", { direction: "vertical" }, 700);
      $('#flash_messages').click(function(e){
        $('#flash_messages').hide( "blind", { direction: "vertical" }, 700);
      });

      ACTIVE.userLoaded = $.rails.ajax({
        type: 'GET',
        dataType: 'script',
        url: '/users/dynamic'
      });

      // --------------------------------------------
      // AJAX Response: Forbidden
      // When any AJAX request returns with status 403, we know it was an
      // access denied error. Deal with it appropriately.
      $(document).ajaxError( function(event, xhr, settings, error){
        if( xhr.status === 403 ){
          // TODO: Design and implement a friendly error message
          var json = $.parseJSON(xhr.responseText),
              header = json['header'],
              body = json['alert'];
          if( json.hasOwnProperty('link') ){
            body += '<br><br><a href="'+ json['link'] +'" class="btn green">Log In to Continue</a>';
          }
          debug.warn('[common_controller::72]', 'AJAX Permission Denied: %o', json);
          ACTIVE.ui.error_dialog( 'Attention', header, body, 'error' );
        }
      });

      new ACTIVE.powerplant.factory('typeahead_location_init');
      if(!ACTIVE.ui.mediaViewport){

        if(!ACTIVE.ui.isGeoLpf()){
          $('#activity-feed-location-toggle h3').location_change();
          $('#popular-change-location-toggle h5').location_change();
        }
      }else{
        $('#activity-feed-location-toggle h3, #popular-change-location-toggle h5').text(ACTIVE.powerplant.get_user_location());
        $('#activity-feed-location-toggle h3, #popular-change-location-toggle h5').click(function(){
          if(!$('#mobile-search').hasClass('open')){
            $('#mobile-search-bar-button').trigger('click');
          }
          $('#mobile-location-header .header-location a').trigger('click');
        });
      }

      if(ACTIVE.ui.controller_name=='home'){
        ACTIVE.ui.search.initTypeahead({
          typeaheadElement: $('#keywords-main'),
          searchButton: $('.header-search button')
        });
      }else{
        ACTIVE.ui.search.initTypeahead({
          typeaheadElement: $('#keywords'),
          searchButton: $('#search-form button')
        });
      }
      //---------------------------------------------
      $(document).ready(function(){
        $('#message-bar').activeMessageBar();

        $('#search-min .header-search').removeClass('off');

        new ACTIVE.powerplant.factory('set_search_options',{
          selectBox: $('#search-option-date-picker'),
          selectBoxAttachedContainer: $('#search-option-date-range-picker'),
          selectBoxOptionsContainer: $('#search-option-date-pickerSelectBoxItOptions'),
          selectBoxOptionsContainerId: '#search-option-date-pickerSelectBoxItOptions',
          selectBoxTerms: $('#search-option-terms'),
          selectBoxTermsContainer: $('#search-option-termsSelectBoxItOptions'),
          selectBoxTermsText: $('#search-option-termsSelectBoxItText'),
          selectBoxDistanceBtn: $('#search-option-radiusSelectBoxIt'),
          selectBoxDistanceContainer: $('#search-option-radiusSelectBoxItOptions'),
          selectBoxDistance: $('#search-option-radius'),
          selectBoxDistanceText: $('#search-option-radiusSelectBoxItText'),
          selectBoxSort: $('#search-option-sort'),
          selectBoxSortContainer: $('#search-option-sortSelectBoxItOptions'),
          selectBoxSortText: $('#search-option-sortSelectBoxItText'),
          selectBoxDatePicker: $('#search-option-date-pickerSelectBoxIt'),
          selectBoxDatePickerText: $('#search-option-date-pickerSelectBoxItText'),
          startDateField: $('#refine-start-date'),
          endDateField: $('#refine-end-date'),
          searchButton: $('#refine-search-date-button'),
          advantageCheckbox: $('#aa-cb2-leftnav'),
          categoryLinks: $('.category-link'),
          parentContainerId: 'date-options-container',
          datePickerOpenedTracker: false,
          refineSearchContainer: $('#refined-search-container'),
          refineSearchContainerFilters: $('.tab-content.light'),
          sortOptionsContainer: $('#sort-options-container'),
          radiusOptionsContainer: $('#radius-options-container'),
          dateOptionsContainer: $('#date-options-container'),
          advantageOptionContainer: $('#advantage-option-container'),
          distanceNotificationMessage: $('.distance-notification-message')
        });

        $("img").lazy({
          visibleOnly : true
        });

        $(".carousel.slide").on('slid.bs.carousel', function (slide) {
          $(this).find('.active').trigger("scroll");
        });

        // Run active widgets
        // --------------------------------------------------------------
        ACTIVE.widgets.init();
        //
        // static link helper
        // add the user location to static links for search
        // --------------------------------------------------------------
        new ACTIVE.ui.linkLocationHelper({
          linkClass: '.link-helper'
        });
        ACTIVE.widgets.ui.heroPositionHelper();
        ACTIVE.widgets.ui.set_main_nav_links();
        //
        // Initialize Tabs for Advatnage Accout Upgrade
        // --------------------------------------------------------------
        new ACTIVE.widgets.ui.inlineTabs({
          tabsContainer:          $('#aa-tabs1'),
          beforeChange:       function( ui, event ){
            utag.link({page_name: 'activecom:popup:join active advantage', page_type: 'popup', feature: 'activecom:popup:join active advantage|' + $(ui).text().trim().toLowerCase()});
          }
        });
        //
        // Initialize dropdown menus beyond normal bootstrap functionality. Adds the mouseover mouseout events
        // -----------------------------------------------------------
        new ACTIVE.widgets.ui.dropDownHelper({
          listElementParent: $('#li1-dd'),
          dropDownToggle: $('#sports-dropdown-toggle')
        });
        new ACTIVE.widgets.ui.dropDownHelper({
          listElementParent: $('#li2-dd'),
          dropDownToggle: $('#fitness-dropdown-toggle')
        });
        new ACTIVE.widgets.ui.dropDownHelper({
          listElementParent: $('#li3-dd'),
          dropDownToggle: $('#outdoors-dropdown-toggle')
        });

        new ACTIVE.fancybox.widgets.advantageAccountUpgrade();

        // search results, filter toggle dropdown
        // --------------------------------------------------------------
        $('#search-filter-container-toggle').on('click',function(){
          $('#search-filter-container').toggle();
        });

        $('#refine-start-date, #refine-end-date').datepicker();

        // $('select').selectBoxIt();

      }); // end document ready

    } // end init action

  }; // end controller

})(window);
