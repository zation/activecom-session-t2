ACTIVE.fancybox = {};
ACTIVE.fancybox.widgets = {};
ACTIVE.fancybox.widgets.ui = {};

ACTIVE.fancybox.options = {
  setOption: function(a,b){
    return this[a]=b;
  },
  getOption: function(a){
    return this[a];
  }
}

ACTIVE.fancybox.widgets.defaults = {
  padding: [20,20,20,20],
  margin: [20,20,20,20],
  height: 800,
  width: 500,
  minWidth: 100,
  minHeight: 100,
  maxHeight: 800,
  maxWidth: 600,
  autoSize: true,
  autoHeight: false,
  autoWidth: false,
  autoCenter: true,
  fitToView: true,
  topRatio: 0.5,
  leftRatio: 0.5,
  scrolling: 'auto',
  wrapCSS: 'active-fancybox-widget',
  arrows: false,
  closeBtn: true,
  closeClick: false,
  nextClick: false,
  mouseWheel: false,
  autoPlay: false,
  playSpeed: 5000,
  preload: 3,
  modal: true,
  loop: true,
  ajax: {
          dataType: 'html',
          headers: { 'X-fancybox': true }
        },
  iframe: {
          scrolling: 'auto',
          preload: 'true'
        },
  swf:  {
          wmode: 'opaque',
          allowfullscreen: 'true',
          allowscriptaccess: 'always'
        },
  keys: {
          next : {
                    3 : 'left', // enter
                    34 : 'up',   // page down
                    39 : 'left', // right arrow
                    40 : 'up'    // down arrow
                  },
          prev : {
                    8  : 'right',  // backspace
                    33 : 'down',   // page up
                    37 : 'right',  // left arrow
                    38 : 'down'    // up arrow
          },
          close  : [27], // escape key
          play   : [32], // space - start/stop slideshow
          toggle : [70]  // letter "f" - toggle fullscreen
        },
  direction: {
                next: 'left',
                prev: 'right'
              },
  scrollOutside: true,
  index: 0,
  type: null,
  href: null,
  content: null,
  title: null
};

ACTIVE.fancybox.widgets.setOptions = function(options){
  for(i in options) ACTIVE.fancybox.widgets.defaults[i] = options[i];
}

ACTIVE.fancybox.widgets.init = function(options){

}

ACTIVE.fancybox.widgets.eventGetAlert = function(){
  var alertSignUp = $('#get-event-alerts-btn');
  var iconOff = alertSignUp.find($('.icon-uniA200'));
  var iconOn = alertSignUp.find($('.icon-uniA100'));
  var obj = this;

  alertSignUp.on('click',function(e){
    e.preventDefault();
    if(iconOff.is(':visible')){
      if(!$.isEmptyObject(ACTIVE.currentUser)){
        obj.setSaveEventSignUp(alertSignUp, iconOff, iconOn);
      }else{
        obj.showSignUpProcess();
      }
    }else if(iconOn.is(':visible')){
      obj.removeEventSignUp(alertSignUp, iconOff, iconOn);
    }
  });
}

/*
* Show Sign Up Form and Onboarding display slides
*/
ACTIVE.fancybox.widgets.showSignUpProcess = function(){
  var helpers = {
  };

  ACTIVE.fancybox.widgets.setOptions({
    padding: [0,0,0,0],
    wrapCSS: 'active-fancybox-widget apw-signup-widget',
    afterLoad: function(){
      var date = new Date();
      date.setTime(date.getTime() + (10*60*1000));
      $.cookie('saveAlert', '1', { expires: date, path: '/' });
      $('.fancybox-inner:eq(0)').prepend(APW.initiate("ap-roo", "sign_in_plus"));
    },
    afterShow: function(){
      ACTIVE.fancybox.widgets.ui.widgetChangeViewButtonListeners();
    }
  });

  $('.actv_login_button').fancybox(ACTIVE.fancybox.widgets.defaults);
}


/*
* Sign Up for Event
* @param: Object
* @param: Object
* @param: Object
*/

ACTIVE.fancybox.widgets.setSaveEventSignUp = function(a,b,c){
  var h = $(a).find('h5');
  var data = a.data();
  $.ajax({ url: '/alerts',
      type: 'POST',
      beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
      data: data
    }).done(function(resource){
  });

  if(b.is(':visible')) b.css({display:'none'});
  c.css({display:'block'});
  $('#message-bar').slideUp();
  if(h.html() == 'Turn on Alert') h.html('Turn off Alert');
}

ACTIVE.fancybox.widgets.initialStarState = function(){
  var starBtn = $('#get-event-alerts-btn');
  var h = $(starBtn).find('h5');
  var iconOff = starBtn.find($('.icon-uniA200'));
  var iconOn = starBtn.find($('.icon-uniA100'));
  var data = starBtn.data();
  $.ajax({ url: '/alerts/is_event_starred',
      type: 'GET',
      data: data,
      success: function(result){
        if (result.data == 'true'){
          iconOff.css({display:'none'});
          iconOn.css({display:'block'});
          $('#message-bar').slideUp();
          if(h.html() == 'Turn on Alert') h.html('Turn off Alert');
        }
      }
    });
}

/*
* Remove Sign Up for Event
* @param: Object
* @param: Object
* @param: Object
*/
ACTIVE.fancybox.widgets.removeEventSignUp = function(a,b,c){
  var h = $(a).find('h5');
  var data = a.data();
  $.ajax({
      url: '/alerts',
      type: 'delete',
      data: data
    }).done(function(resource){
  });

  if(c.is(':visible')) c.css({display:'none'});
  b.css({display:'block'});

  var setAlertBox = (function(){
    var bar = $('#message-bar');
    bar.addClass('warning');
    bar.find(".description > span").html('You will no longer receive alerts about this activity.');
    bar.find(".description > a.pull-right").click(function(){bar.slideUp();bar.find(".description > span").html('');});
    bar.slideDown();
  }());
  if(h.html() == 'Turn off Alert') h.html('Turn on Alert');
}

ACTIVE.fancybox.widgets.autoSignUp = function(){
    if (!$.isEmptyObject($.cookie('saveAlert')) && !$.isEmptyObject(ACTIVE.currentUser) ) {
      var alertSignUp = $('#get-event-alerts-btn');
      var iconOff = alertSignUp.find($('.icon-uniA200'));
      var iconOn = alertSignUp.find($('.icon-uniA100'));

      ACTIVE.fancybox.widgets.setSaveEventSignUp(alertSignUp, iconOff, iconOn);

      $.removeCookie('saveAlert', { path: '/' });
    }
    else {
      ACTIVE.fancybox.widgets.initialStarState();

      $.removeCookie('saveAlert', { path: '/' });
    }
}

ACTIVE.fancybox.widgets.captureUserInterest = function(){

  var preventReopen = 0,
      helpers = {

    /*
    * adjust the position of the active banner so it appears outside of the overflow hidden defaults
    */
    activeBannerAdjustment: function(){
      var a = {},
          b = $('.what-your-active-banner');
      a=b;b.remove();
      var c = $('.fancybox-skin')[0];
      b.insertBefore(c);
    },

    /*
    * Selects interest and saves them in OBJECT::ACTIVE.fancybox.widgets.options until needed.
    * Auto updates array for removing and adding new interest
    */
    selectInterest: function(){
      $('.capture-interest .content .span2').click(function(){
        var type = $(this).find('.title h4').html();
        var types = (!$.isEmptyObject(ACTIVE.fancybox.options.interestTypes)) ? ACTIVE.fancybox.options.interestTypes : [];
        if(!$(this).hasClass('on')){
          $(this).addClass('on');
          types.push(type);
          ACTIVE.fancybox.options.setOption('interestTypes',types);
        }else{
          $(this).removeClass('on');
          var c = types.indexOf(type),d=[];
          for(var i=0;i<types.length;i++){
            if(types[i] == type) continue;
            else d.push(types[i]);
          }
          ACTIVE.fancybox.options.setOption('interestTypes',d);
        }
      });
    },

    /*
    * Custom close utton
    */
    closeBtnClicked: function(){
      var closeBtn =  $('#actv-custom-close-btn');
        closeBtn.on('click',function(){
        $.fancybox.close(true);
      });
    },


    /*
    * Custom next button to change slides
    */
    changeStateOnContinue: function(){
      //change the functionality continue button if user is logged in

      $('.state-continue-btn').click(function(e){
        e.preventDefault();

        if(!$.isEmptyObject(ACTIVE.currentUser)){
          helpers.saveInterest();
          helpers.saveInterestIfLoggedIn();
          preventReopen = 1;
          parent.$.fancybox.close();
        }
        else{
          helpers.saveInterest();
          var date = new Date();
          date.setTime(date.getTime() + (10*60*1000));
          $.cookie('doSaveInterest', '1', {path: '/', expires: date});
          $.fancybox.close(true);
          ACTIVE.fancybox.widgets.apwLoginWidget();
        }
      });

    },

    /*
    * Add content when beforeLoad callback is initiated.
    * Used to add the APW login plugin
    */
    changeStateUpdateContent: function(){
      var nextState = ACTIVE.fancybox.options.ob_currentState;
      var link = $('.onboarding[href="#state-'+nextState+'"]');
      var pagetype = link.data('pagetype');
      switch(pagetype){
      case 'capture-interest':
        ACTIVE.fancybox.options.setOption('apwOpen',0);
        break;
      case 'apw-login':
        if(!ACTIVE.fancybox.options.apwOpen){
          $.fancybox.close(true);
          ACTIVE.fancybox.widgets.apwLoginWidget();
        }
        break;
      }
    },

    /*
    * Adjust styles or add custom classes to target elements to fix content in different browsers
    */
    cssBrowserAdjustments: function(){
      //adding classes for custom content sections
      if(!ACTIVE.fancybox.options.apwOpen){
        $('.active-fancybox-widget').addClass('capture-interest');
      }
      if(ACTIVE.fancybox.options.apwOpen){
        $('.active-fancybox-widget').addClass('apw-signup-widget');
      }

    },

    /*
    * Callback before fancybox closes to save array of interest to a cookie called "interestTypes"
    */
    saveInterest: function(){
      if(!$.isEmptyObject(ACTIVE.fancybox.options.interestTypes)){
        $.cookie('interestTypes',ACTIVE.fancybox.options.interestTypes,{path:'/', expires:42});
//        var date = new Date();
//        date.setTime(date.getTime() + (10*60*1000));
//        $.cookie('doSaveInterest', '1', {path: '/', expires: date});
      }
    },

    /*
    * Callback for sending cookie interestTypes to server via ajax if needed
    */
    saveInterestIfLoggedIn: function(){
      //add Ajax here to save interest or just grab the cookie
        var packageInterest = function(data){
              if (!!data.length) {
                  var theData = '';
                  for(var i = 0; i < data.length; i++) {
                      theData = theData + 'interests[]=' + data[i] + '&';
                  }
                  return theData;
              }
            };
            //theInterests = packageInterest($.cookie('interestTypes').split(',')) || '';
        var theInterests;
        if ($.cookie('interestTypes') == ''){
          theInterests = '';
        }else{
          theInterests = packageInterest($.cookie('interestTypes').split(','));
        }

        if (theInterests!=''){
          this.saveInterestPost(theInterests);
          $.cookie('interestTypes',$.cookie('interestTypes'),{path:'/', expires:7000});
        }
        else{
          $.cookie('interestTypes','',{path:'/', expires:42});

        }

    },

    saveInterestPost: function(data){
        $.ajax({ url: '/my_profile/interests',
            type: 'POST',
            beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
            data: data
          }).done(function(resource){
        });
    }
  };

  if($.isEmptyObject($.cookie('interestTypes'))) {
    ACTIVE.fancybox.widgets.setOptions({
      padding: [0,0,0,0],
      minWidth: '100%',
      beforeLoad: function(){
        if(preventReopen){
          $.fancybox.close(true);
        }
        else{
          //set empty cookie in case they close modal
          if($.isEmptyObject($.cookie('interestTypes'))){
            $.cookie('interestTypes', '', {path:'/', expires:42});
          }
        }
      },
      afterLoad: function(){
        helpers.activeBannerAdjustment();
        helpers.changeStateOnContinue();
        helpers.cssBrowserAdjustments();

      },
      afterShow: function(){
        helpers.selectInterest();
        ACTIVE.fancybox.widgets.ui.widgetChangeViewButtonListeners();
      },
      beforeClose: function(){
      }
    });

    //init container
    var onboardinit = $('.onboarding');
    onboardinit.click(function(){
      ACTIVE.fancybox.options.setOption('ob_currentState',0);
      $('.onboarding').fancybox(ACTIVE.fancybox.widgets.defaults);
    });
    (function(a){
      $(a).eq(0).trigger('click');
    }(onboardinit));
  }else{
    if(!$.isEmptyObject($.cookie('doSaveInterest'))){
      helpers.saveInterestIfLoggedIn();
      $.cookie('doSaveInterest', 1, { path: '/', expires: -5});
    }
  }
}



/*
* Advantage Upsell
*/
ACTIVE.fancybox.widgets.advantageUpsell = function(){
  /*
  * defaults, callbacks
  */

  //display upsell if no muteAdvantage cookie
  if ($.isEmptyObject($.cookie('email'))) {
    //$.removeCookie('muteAdvantage');
    ACTIVE.fancybox.widgets.captureUserInterest();
  }else {
    if (!$.isEmptyObject($.cookie('muteAdvantage'))) {
      ACTIVE.fancybox.widgets.captureUserInterest();
    }else{
      $.cookie('muteAdvantage', '1', {path:'/', expires:42})

      var preventReopen = 0,
        helpers = {
          /*
           * Custom close utton
           */
          closeBtnClicked: function(){
            var closeBtn =  $('#actv-custom-close-btn');
            closeBtn.on('click',function(){
              $.fancybox.close(true);
            });
          }
        };

      /*
       * Save defaults
       */
      ACTIVE.fancybox.widgets.setOptions({
        padding: [0,0,0,0],
        minWidth: '100%',
        wrapCSS: 'active-fancybox-widget adv-upsell-wrap',
        beforeLoad: function(){
          if(preventReopen){
            $.fancybox.close(true);
          }
        },
        afterLoad: function(){
        }
      });

      $('.try-advantage-button').on('click', function(e) {
        $.fancybox.close(true);
        ACTIVE.fancybox.widgets.captureUserInterest();
      });

      // init container
      var advbtn = $('#advantage-upsell-btn');
      advbtn.click(function(){
        $('.advantage-upsell').fancybox(ACTIVE.fancybox.widgets.defaults);
      });
      (function(a){
        $(a).trigger('click');
      }(advbtn));
    }
  }

}

/*
* Advantage Account Upgrade
*/
ACTIVE.fancybox.widgets.advantageAccountUpgrade = function(){

  ACTIVE.fancybox.widgets.setOptions({
    padding: [0,0,0,0],
    minWidth: '100%',
    wrapCSS: 'active-fancybox-widget advantage-upgrade-popup',
    modal:false,
    beforeClose: function(){
      $('#myTabContent div#main-content-wrapper-faq').removeClass('active in');
      $('#myTabContent div#main-content-wrapper-home').addClass('active in');
    }
  });


  $('.aa-popover-upgrade-account-link').on('click', function(){
    utag.view({page_name: 'activecom:popup:join active advantage', page_type: 'popup', feature: 'activecom:popup:'+ ACTIVE.ui.controller_name +':join active advantage|upgrade-account-link'});
    $.fancybox($(this), ACTIVE.fancybox.widgets.defaults);
  });

  //after page load and ajax call
  $('.dfp-advantage').on('click', 'a', function(){
    utag.view({page_name: 'activecom:popup:join active advantage', page_type: 'popup', feature: 'activecom:popup:'+ ACTIVE.ui.controller_name +':join active advantage|learn-more-link'});
    $.fancybox($(this), ACTIVE.fancybox.widgets.defaults);
  });

  //after page load and ajax call
  $('.aa-reg-button-upsell').on('click', 'a', function(){
    utag.view({page_name: 'activecom:popup:join active advantage', page_type: 'popup', feature: 'activecom:popup:'+ ACTIVE.ui.controller_name +':join active advantage|save-today-button'});
    $.fancybox($(this), ACTIVE.fancybox.widgets.defaults);
  });

  //Special case for link in popover
  $(document).on('mousedown', '.aa-popover-upgrade-link-search', function(){
    utag.view({page_name: 'activecom:popup:join active advantage', page_type: 'popup', feature: 'activecom:popup:'+ ACTIVE.ui.controller_name +':join active advantage|learn-more-link'});
    $.fancybox($(this), ACTIVE.fancybox.widgets.defaults);
  });
}

/*
* Advantage X close
 */
ACTIVE.fancybox.widgets.advantageXClose = function(){
  $.fancybox.close(true);
  if ($.isEmptyObject($.cookie('interestTypes'))){
    $.cookie('interestTypes', '', {path:'/', expires:42});
  }else{
    if (!$.isEmptyObject($.cookie('doSaveInterest'))){
      ACTIVE.fancybox.widgets.captureUserInterest();
    }
  }

}

/*
* Advantage Upsell
*/
ACTIVE.fancybox.widgets.apwLoginWidget = function(){
  /*
  * defaults, callbacks
  */
  var preventReopen = 0,
    helpers = {
    };

  /*
  * Save defaults
  */
  ACTIVE.fancybox.widgets.setOptions({
    padding: [0,0,0,0],
    wrapCSS: 'active-fancybox-widget apw-signup-widget',
    beforeLoad: function(){
      if(preventReopen){
        $.fancybox.close(true);
      }
    },
    afterLoad: function(){
      $('.fancybox-inner:eq(0)').prepend(APW.initiate("ap-root", "sign_in_plus"));
    },
    afterShow: function(){
      ACTIVE.fancybox.widgets.ui.widgetChangeViewButtonListeners();
    }
  });

  // init container
  var advbtn = $('#apw-login-widget-btn');
  advbtn.click(function(){
    $('.apw-login-widget').fancybox(ACTIVE.fancybox.widgets.defaults);

  });
  (function(a){
    $(a).trigger('click');
  }(advbtn));
}

/*
* Widget event listiners
* Listen for events triggered on links within the signup widget and do stuff
*/

ACTIVE.fancybox.widgets.ui.widgetChangeViewButtonListeners = function(){

  //before signup state display
  $('#ap-root').on('click', 'a#apca-signin-link', function() {
    $('.active-fancybox-widget').removeClass('signup-view');
    $('#auth-widget-content-header-title').html('Please sign in to continue.');
    $.fancybox.update();
  });

  //before signin state display
  $('#ap-root').on('click', 'a#apl-signUpLink', function() {
    $('.active-fancybox-widget').addClass('signup-view');
    $('#auth-widget-content-header-title').html('Join ACTIVE to save and share your activities.');
    $.fancybox.update();
  });
}

//ACTIVE.fancybox.widgets.muteModal = function(){
//  $.cookie('muteAdvantage', '1', {path:'/', expires:42});
//  $.cookie('interestTypes', '', {path:'/', expires:42});
//}

;
