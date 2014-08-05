
(function(window,undefined){
  "use strict";

  window.RAILS.controllers.asset_service = {

    init: function() {
      var stack_bottomleft = {dir1: "up", dir2: "left", push: "bottom", firstpos1: 25, firstpos2: 25};
      $.pnotify.defaults.history = false;
      $.pnotify.defaults.animation = {
        effect_in: "blind",
        effect_out: "blind",
        options_in: "easeInCubic",
        options_out: "easeOutCubic"
      }
      $.pnotify.defaults.animation_speed = 600;
      $.pnotify.defaults.stack = stack_bottomleft;
      $.pnotify.defaults.addclass = "stack-bottomleft";
      $.pnotify.defaults.sticker = false;
      $.pnotify.defaults.delay = 6000;

      if(asset && asset.sourceSystem.sourceSystemName == "RegCenter" || asset.sourceSystem.sourceSystemName == "ActiveWorks Endurance"){
        var asset_id = ""
        if(asset.sourceSystem.sourceSystemName == "RegCenter"){
          asset_id = asset.assetLegacyData.substitutionUrl;
        } else {
          asset_id = asset.assetGuid;
        }
        ACTIVE.apij.reg_status(asset_id, "window.RAILS.controllers.asset_service.reg_status_handler", asset.sourceSystem.sourceSystemName.toLowerCase().substring(0,asset.sourceSystem.sourceSystemName.indexOf(" ")));
      }

      if(ACTIVE.ui.dealExists){
        var options = {
          type: 'GET',
          dataType: 'script',
          url: '/asset_service/dynamic?id='+asset.assetGuid
        };
        ACTIVE.eventLoaded = $.rails.ajax(options);
      }
    },

    show: function() {
      new ACTIVE.powerplant.factory('set_ed_page_map_options');
      new ACTIVE.utilities.affiliateCookieCreation();
      new ACTIVE.widgets.ui.toolTipTipAlerts({
        tipLink:            $('.alerts-tooltiptip'),
        tipButton:          $('#get-event-alerts-btn'),
        activation:         'hover',
        defaultPosition:    'top',
        maxWidth:           230,
        alertOnContent:     "You will receive a reminder email 2 days before registration opens or closes for this activity.",
        alertOffContent:    "You will no longer receive email alerts about this activity."
      });

      new ACTIVE.widgets.ui.toolTipTipMultipleWithCustomScroll({
        tipLink:            $('.camps-table-tooltip'),
        maxWidth:           430,
        maxHeight:          275,
        textAlignment:      "left",
        tipContent:         "camps-tooltip-content",
        activation:         "hover",
        keepAlive:          true,
        defaultPosition:    "right"
      });

      //---------------------------------------------
      // Fancybox
      ACTIVE.fancybox.widgets.eventGetAlert();
      //
      //---------------------------------------------
      ACTIVE.userLoaded.done(function(){ ACTIVE.fancybox.widgets.autoSignUp(); });

      // Image slideshow
      ACTIVE.widgets.ui.ed_images({
        main_image: $('.ed-carousel .main-image img'),
        thumbnails: $('.ed-carousel .thumbnails li a')
      });

      // query results to see if we have a link if the event has ended
      if($('section.register-now').data('event-state') == 'event-ended') {
        var assetId = $('meta[property=assetId]').attr('content');

        if(assetId) {
          $.ajax(ACTIVE.urls.results + '/api/v1/events/asset_id/' + assetId + '?callback=?',
            {
              type: 'GET',
              timeout: 1000,
              dataType: 'jsonp',
              success: function(data) {
                if(data.url) {
                  var html = '<span class="description"><a href="' + data.url + '">Find Your Race Results</a></span>';
                  $('section.register-now').append(html);
                }
              }
            });
        }
      }


      ACTIVE.userLoaded.done(function(data) {
        if(ACTIVE.currentUser && ACTIVE.currentUser.is_advantage_member) {
          var link = $('#advantage-col-body a');
          link.attr('href', link.data('member-url'));
          $('#advantage-col-body').show();
        } else {
          $('#advantage-col-body').show();
        }

        if(ACTIVE.currentUser) {
          $('#organizer-website').show();
        } else {
          $('#reg-unavailable-logged-in').hide();
          $('#reg-unavailable-guest').show();
        }
      });


      $(document).ready(function(){
	//add ed code here

	//end ed code
	  
	// update get direction link for large map
        var address = $('#event-details-address span[itemprop=address]').first().text().trim().replace(/\s+/g,' ');
        var start_address = $('#user-addr').length ? $('#user-addr').data('user-address').trim().replace(/\s+/g,' ') : "";
        $('#get-directions').attr('href','http://maps.google.com/maps?saddr=' + start_address + '&daddr=' + address);
        
        var cookie = $.cookie('affiliate');
        if( cookie ) {
          $("#register-now-button").click(function(e){
            e.preventDefault();
            var href = $(this).attr("href");
            var paths = href.split('?');
            if(paths.length==1){
              href = href +'?'+ cookie;
            }
            else{
              href = href +'&'+ cookie;
            }
            window.location = href;
          });
        }

        // map resize
        ACTIVE.powerplant.evaluate_screen_size_event_map();
        // auto map resize on window resize
        $(window).resize(function(event){
          ACTIVE.powerplant.evaluate_screen_size_event_map();
        });

        //bootstrap modal fix
        $('.modal').appendTo($('body'));

        $('#participants').on('show', function(){
          var link = $('#participants-link').data('src');
          var $iframe = $('<iframe src="'+link+'" frameborder="0" style="width:100%;min-height:400px;"/>');
          $('#participants-modal-body').append($iframe);
        });

        $('#participants').on('hide', function(){
          $('#participants-modal-body').html('');
        });

        if($('#event-details-section').hasClass('hide')){
          $('#about-this-activity-btn').show();
          $('#about-this-activity-btn').click(function(e){
            e.preventDefault();
            $('#event-details-section').removeClass('hide');
            $('#event-details-social-comments').removeClass('hide');
            $(this).parent('li').remove();
          });
        }

        var assetGuid = $('meta[property=assetId]').attr('content');
        $.get( "/asset_service/" + assetGuid + "/stats" , function( data ) {
          if (data) {
            if(data.message) {
              $.pnotify({
                title: data.message,
                icon: "people"
              });
            }
          }
        });

       if(asset.sourceSystem.sourceSystemName == "ActiveWorks Endurance") {
         $.get( "/asset_service/" + assetGuid + "/last_registration_time", function( data ) {
           if (data) {
             if (data.message) {
               $.pnotify({
                title: data.message,
                icon: "clock"
              });
             }
           }
         });
       }

        $('.edp_notification').each(function(idx, raw_element) {
          var element = $(raw_element);
          if(element.length > 0){
            setTimeout(function(){
              $.pnotify({
                title: element.val(),
                text: "",
                icon: element.data("icon")
              });
            },1000);
          }
        });

        $(window).scroll(function(){
          $('section.more-from-this-organizer').isInViewport({tolerance:($(window).height()-100)}, function(inViewport){
            $('section.more-from-this-organizer:has(.loader)').load("/asset_service/" + assetGuid + "/more_organizer_events", function() {
              $('section.more-from-this-organizer .loader').remove();
            });
          })

          $('#similar-activities-container').isInViewport({tolerance:($(window).height()-100)}, function(inViewport){
            $('#similar-activities-container:has(.loader)').load("/asset_service/" + assetGuid + "/similar_activities_feed", function() {
              $('div.activity_feed_page_options').css("display", "none");
              $("#similar-activities-container .loader").remove();
            });
          })
        });
      });
    }, // end show

    /**
     * JSONP Callback for regstatus AKA "Pricing Table"
     *
    **/
    reg_status_handler: function(data) {
      var section_name="";
      try{
        var end_date = new Date(asset.activityEndDate.substring(0,asset.activityEndDate.indexOf("T")));
        end_date.setDate(end_date.getDate()+2);
        var today = new Date();

        if(new Date() > end_date) {
          section_name = "reg-event-ended-section"
        } else {
          section_name = data + "-section";
        }
      } catch(err) {
        section_name = data + "-section";
      }
      var reg_section = $("."+section_name);

      // if reg-open, make sure registration url adr is present
      if((section_name == "reg-open-section" && typeof asset.registrationUrlAdr == 'undefined') ||
          asset.registrationUrlAdr == '' || asset.registrationUrlAdr == null) {
        section_name = "reg-unavailable-section";
      }

      if(reg_section.length == 0){
        reg_section = $(".reg-open-section");
        if(reg_section.length == 0){
          $('#register_now_container').css({display:'none'});
          $('.mobile_register_button').css({display:'none'});
        }
      }
      
      $('.register-now .loader').hide();
      reg_section.show();
      if(section_name == "reg-open-section"){
        $('#pricing_reg_button').show();
      }
    }

  }; // end controller

})(window);
