// ACTIVE Widgets
// create new ACTIVE.widgets ns to prevent overwrite
// Most ui methods are initialized within there corresponding unit controller

ACTIVE.widgets = {};
ACTIVE.widgets.ui = {};
ACTIVE.widgets.timer = {};
ACTIVE.widgets.mobileFinder = {};


ACTIVE.widgets.options = {
  setOption: function(a,b){
    return this[a]=b;
  },
  getOption: function(a){
    return this[a];
  }
}

ACTIVE.widgets.init = function(){
  //super objects
  ACTIVE.widgets.timer.init();


  //auto init for all widgets
  for(i in this)
    if(typeof this[i] === 'function' && this[i] !== this.init ) this[i]();

}
ACTIVE.widgets.dfpCarousel = function() {
  var dfpCarouselAd = $('.dfp-carousel');

  //If the carousel exists, start the animation
  if (dfpCarouselAd.length > 0) {
    $(dfpCarouselAd).carousel();
  }
}

ACTIVE.widgets.dropdown = function(){
  $('.dropdown-toggle').dropdown();
}

ACTIVE.widgets.inlineVideoPlayer = function(){
  var ui = $('.video-player');
  if(ui.length > 0) {
    var player = new YT.Player($(ui).attr('id'),{
      height:$(ui).data('height'),
      width:$(ui).data('width'),
      videoId:$(ui).data('videoid'),
      playerVars:{
        wmode: "transparent"
      },
      events:{
        onReady: function(e){
          if($(ui).data('autoplay')) e.target.playVideo();
        },
        onStateChange: function(e){
          //stoped playing
          if(e.data==0) if($(ui).data('looped')) e.target.playVideo();
          //video playing == 1
          //paused == 2
        }
      }
    });
  }
}

ACTIVE.widgets.ui.inlineTabs = function(options){
  var tabsContainer   = options.tabsContainer,
      beforeChange    = options.beforeChange || null,
      afterChange     = options.afterChange || null,
      beforeInit      = options.beforeInit || null,
      afterInit       = options.afterInit||null;

  if(!!beforeInit) beforeInit.call(null, tabsContainer );
  
  tabsContainer.children().find('a').click(function(event){
    event.preventDefault();
    event.stopImmediatePropagation();
    // before change call
    if( !!beforeChange ) Function.call( beforeChange( $(this), event) );

    //process tabs
    if( $(this).parent('li').hasClass('active') ) return;

    var c = [], i = 0, id;
    tabsContainer.children().removeClass('active');
    $(this).parent('li').addClass('active');
    tabsContainer.children().each(function(i){ 
      c.push( $(this).find('a').attr('href').split('#').pop().replace(/\#/,'') ) 
    });
    for(i;i<c.length;i++) $('#'+c[i]).css({display:'none'});
    id = $(this).attr('href').split('#').pop();
    $('#'+id).css({display:'block'});

    //after change callback
    if(ACTIVE.ui.controller_name=='home'){
      ACTIVE.powerplant.refine_search_filters_display_state_with_sponsored_feed({
        tabsContainer: $('#ab-tabs1'),
        sponsoredTabClassName: 'dfp-tab-title',
        searchOptionsContainer: $('.refined-search-container .tabs .tab-content.light')
      });
    }
    if( !!afterChange ) Function.call(afterChange($(this),event));
  });
  
  if(!!afterInit) afterInit.call(null, tabsContainer );
}

// Event Handler
ACTIVE.widgets.ui.addEvent = function( obj, type, listener, capture ){
  if( obj.addEventListener ){
    return obj.addEventListener( type, listener, capture );
  }else{
    return obj.attachEvent( type, listener );
  }
}

// Event Handler
ACTIVE.widgets.ui.removeEvent = function( obj, type, listener, capture ){
  if( obj.removeEventListener ){
    return obj.removeEventListener( type, listener, capture );
  }else{
    return obj.detachEvent( type, listener );
  }
}


ACTIVE.widgets.ui.heroPositionHelper = function(){
  var $ib = $('.info-block');
  $ib.css({'margin-top':-($ib.height()+20), display:'block'});
  $ib.find('.more a').css({'margin-top': ($ib.find('p.description').height() - 20), position:'absolute' });
}

/* Article Galleries Image Position */
ACTIVE.widgets.ui.setDisplayImagePosition = function(){
  var $img = $('.gallery-item.active').find('.article-photo img');
  var h = parseInt($img.height());
  var w = parseInt($img.width());
  if( w >= 460  ) $img.css({ width:460+'px', height:345+'px' });
  if( w < 460 ){
    $img.css({ 'margin-left':((460-w)/2)+'px', 'margin-top':((345-h)/2)+'px'});
  }
}

// Timer Init
ACTIVE.widgets.timer.init = function(){
  $.fn.timer = function(){
    if( this.data('milliseconds-until-increase')=='undefined' ) return;
    var timeRemaining = this.data('milliseconds-until-increase');

    //Set Display console
    ACTIVE.widgets.options.setOption( 'dateDiff', timeRemaining );
    // Browser Check
    if( $.browser.msie ){
      ACTIVE.widgets.timer.msieInit( this );
    }else{
      ACTIVE.widgets.options.setOption( 'countdown', new Worker('/js/countdown.js'));
      ACTIVE.widgets.timer.start( this );
    }
  }
  //init timers
  var da = $('#reg-tm1').data('milliseconds-until-increase');
  if( !da )return;
  $('#reg-tm1').timer();
}

// Timer Start
ACTIVE.widgets.timer.start = function( obj ){
  var c = ACTIVE.widgets.options.getOption('countdown');
  c.postMessage({ 'method':'start', 'dateDiff':ACTIVE.widgets.options.getOption('dateDiff') });
  ACTIVE.widgets.timer.eventListener( obj );
}

// Timer Stop
ACTIVE.widgets.timer.stop = function(){
  var c = ACTIVE.widgets.options.getOption('countdown');
  c.postMessage({ 'method':'stop' });
}

// Timer Listener
ACTIVE.widgets.timer.eventListener = function( obj ){
  var c = ACTIVE.widgets.options.getOption('countdown');
  c.addEventListener( 'message', function(e){
    if( e.data.hrs == 0 && e.data.mins == 0 && e.data.days == 0 ){
      ACTIVE.widgets.timer.stop();
      setTimeout(location.reload(),1);
    }
    ACTIVE.widgets.timer.update( obj, e.data );
  },false);
}

// IE timer countdown, may effect performance in IE, but its IE...nuff said
ACTIVE.widgets.timer.msieInit = function( obj ){
  var t = ACTIVE.widgets.options.getOption('dateDiff');
  var timeRemaining;
  var d = function(a){if(a<0)return true};
  var tt = window.setInterval(function(){
    t = t - 60000;
    if(d(t)){
      window.clearInterval(tt);
      timeRemaining = {days:0,hrs:0,mins:0};
      setTimeout(location.reload(),1);
    }else{
      console
      timeRemaining = {
        days: Math.floor(t / 86400000 ),
        hrs:  Math.floor(((t / 86400000) % 1)*24),
        mins: Math.floor(((((t / 86400000) % 1)*24)%1)*60)
      };
    }
    ACTIVE.widgets.timer.update( obj, timeRemaining );
  },60000);
}

ACTIVE.widgets.selectbox = function(){

  $.fn.activeSelectBox = function(){
    // set default
    var sb, er;
    sb = $(this);
    // get children
    sb.options = sb.find('option');

    //set ui
    if( sb.closest('fieldset').find('label').hasClass('error') ) er=true;
    sb.wrap( $('<div class="selectbox span2"></div>') );
    sb.selectbox = $( '<div class="selectbox-inner"><div class="selected"><span class="select-text"></span><span class="carat"><i class="carat-btn"></i></span></div><div class="select-list-wrap"><ul class="select-list"></ul></div></div>' );
    sb.parent('.selectbox').append(sb.selectbox);
    if(er) sb.parent('.selectbox').addClass('error');


    //set content
    sb.options.each(function(i){
      var li = $( '<li data-option="'+sb.options[i].value+'" class="list-item">'+sb.options[i].innerHTML+'</li>' );
      sb.selectbox.find('.select-list').append(li);
      //default selection
      if( sb.val() == sb.options[i].value ){
        li.addClass('selected');
        sb.selectbox.find('.select-text').html( sb.options[i].innerHTML );
      }

      //action
      li.click(function(e){
        e.stopImmediatePropagation();
        var opt = $(this).data('option');
        var val = $(this).html();
        sb.selectbox.find('.select-list li').removeClass('selected');
        $(this).addClass('selected');
        sb.find($('option')).each(function(i){
          if( $(this).val() == opt){ $(this).attr('selected',true) }
          sb.selectbox.find('.select-text').html( val );
          sb.selectbox.find('.select-list').fadeOut(200).css('display','none');
          sb.selectbox.find('.carat-btn').removeClass('open');
        });
      });
    });

    sb.selectbox.find('.selected').click(function(e){
      var sl = sb.selectbox.find('.select-list');
      var cb = sb.selectbox.find('.carat-btn');
      if( sl.css('display') == 'table' ){
        sl.css({display:'none'});
        cb.removeClass('open');
      }else{
        sl.css({display:'table'});
        cb.addClass('open');
      }
    });


    ACTIVE.widgets.ui.addEvent( document.getElementsByTagName('body')[0], 'click', function(e){
        e.stopImmediatePropagation();
        c = e.target.className;
        cl = ['selected','selectbox-inner','selectbox','select-text','carat','carat-btn','carat-btn open','select-list','select-list-wrap','list-item'];
        var sl = sb.selectbox.find('.select-list');
        if( $.inArray(c,cl) == -1 ){
          $.each( $('.select-list'), function(i){ if($(this).css('display')=='table') $(this).fadeOut(200).css('display','none') });
          $.each( $('.carat').find('.carat-btn'), function(i){ $(this).removeClass('open') });
        }
    }, false);

    return;
  }

  //init selectbox widget on all select boxes
  //$('select#ACTIVE_user_gender').activeSelectBox();
  //$('select#ACTIVE_user_address_country_code').activeSelectBox();
}

ACTIVE.widgets.resetLocationDropdown = function(){
  $(window).on('scroll',function(){
    if( $('#header-change-location-container').is(':visible') ) $('#header-change-location-container').toggle();
  });
}

ACTIVE.widgets.closeAutoComplete = function(){
  $(window).on('scroll',function(){
    $('input[name="keywords"]').autocomplete('close');
  });
}


ACTIVE.widgets.timer.update = function( a,b ){
    //Set Display console
    $(a).find('#day').html( b.days );
    $(a).find('#hrs').html( b.hrs );
    $(a).find('#mins').html( b.mins );
    return;
}

// Disable all fields with class disable
ACTIVE.widgets.ui.disable_fields = function(){
  $('.disabled').attr('disabled',true);
}

// Set location field text - this method may have bee replaced with a server side solution
ACTIVE.widgets.ui.set_location_fields = function(){
  var l_str = $('#header-location-link').html();
  if(l_str!='' && $('#li-bi') !='undefined'){
    $('#li-bi').html(l_str);
  }else{
    $('.activities-block').find('div.location').css({visibility:'hidden'});
  }
}

// Reset element height to match other element height
ACTIVE.widgets.ui.set_box_height = function( ele, ui ){
  if( ele.attr('id') == 'adv-content-block' ){
    var p = ele.find('.custom-content');
    p.css({ top: (ui.height()-p.height())/2 });
  }
  return ele.height( ui.height() );
}

ACTIVE.widgets.ui.toggle = function( ele ){
  return ele.toggle();
}

ACTIVE.widgets.ui.set_main_nav_links = function() {
  $('#navbar-main a[href^="/search"]').on('click', function(e) {
    var url = $(this).attr('href');
    var location = $('input[name="location"]').val();
    $(this).attr('href', url + '&location=' + (location == 'Everywhere' ? '' : location));
  });
}


ACTIVE.widgets.ui.ed_images = function(options){
  var main_image = options.main_image,
      thumbnails = options.thumbnails;
  return thumbnails.bind({
    click: function(e){
      e.preventDefault();
      thumbnails.parent('li').removeClass('active');
      var _li = $(this);
      _li.parent('li').addClass('active');
      main_image.attr('src', _li.find('img').attr('src') );
    }
  });
}

ACTIVE.widgets.ui.dropDownHelper = function( options ){
var listElementParent = options.listElementParent,
    dropDownToggle = options.dropDownToggle;
    // open on mouse over
    dropDownToggle.on('mouseover', function(e){
      var t = setTimeout( function(){
        var selector = options.dropDownToggle.selector;
        if( $(selector+':hover').length > 0 )
        {
          if( options.dropDownToggle.parent('li').hasClass('open') ){
            clearTimeout(t);
            return false;
          }else{
            options.dropDownToggle.trigger('click');
            if( $('.ui-autocomplete').is(':visible') ) $('.ui-autocomplete').css({display:'none'});
          }
        }
        clearTimeout(t);
      },250);
    });
    //close on mouse leave
    listElementParent.on('mouseleave',function(e){
      if( !listElementParent.hasClass('open') ) return;
      dropDownToggle.trigger('click');
    });
    
}

// Default tooltip
// uses the title attribute for content
ACTIVE.widgets.ui.toolTipTip = function(options){
  var tipLink               = options.tipLink,
      tipContentMaxWidth    = options.maxWidth,
      tipActivation         = options.activation,
      tipPosition           = options.defaultPosition,
      tipHolder             = $('#tiptip_holder');

  tipLink.hover(function(){
    tipHolder.css({'max-width':tipContentMaxWidth});
  }).tipTip({
    activation: tipActivation,
    defaultPosition: tipPosition,
    content: "",
    enter: function(){
      tipContentCont = $('#tiptip_content');
      tipContentCont.html(tipLink.attr('title'));
    }
  });
}

// Signup for alerts tip
ACTIVE.widgets.ui.toolTipTipAlerts = function(options){
  var tipLink               = options.tipLink,
      tipLinkButton         = options.tipButton,
      tipContentMaxWidth    = options.maxWidth,
      tipContentAlertsOn    = options.alertOnContent,
      tipContentAlertsOff   = options.alertOffContent,
      tipActivation         = options.activation,
      tipPosition           = options.defaultPosition,
      tipHolder             = $('#tiptip_holder'),
      tipContentCont;
  tipLink.hover(function(){
   tipHolder.css({'max-width':tipContentMaxWidth})
  }).tipTip({
    activation: tipActivation,
    defaultPosition: tipPosition,
    content: "",
    enter: function(){
      var linkTitle = tipLinkButton.find('h5').html(),
          tipContentCont = $('#tiptip_content');
      if(linkTitle == 'Turn on Alert') tipContentCont.html(tipContentAlertsOn);
      if(linkTitle == 'Turn off Alert') tipContentCont.html(tipContentAlertsOff);
    }
  });
}

// Use for multiple tips in a table or on a list that will need overflow for scroll
ACTIVE.widgets.ui.toolTipTipMultipleWithCustomScroll = function(options){
  // This method uses the dataset 'index' that keeps track of the current count for items. Example: id="my-ele-id-1" data-index="1".
  // Content can be stored in a hidded div with that id for the active tooltip
  var tipLink               = options.tipLink,
      tipContentMaxWidth    = options.maxWidth,
      tipContentMaxHeight   = options.maxHeight,
      tipContentAlignment   = options.textAlignment,
      tipContent            = options.tipContent,
      tipActivation         = options.activation,
      tipKeepAlive          = options.keepAlive,
      tipPosition           = options.defaultPosition,
      tipHolder             = $('#tiptip_holder'),
      tipContentCont,
      currentTip;

  tipLink.hover(function(){
    tipHolder.css({'max-width':tipContentMaxWidth});
    currentTip = $(this);
  }).tipTip({
    activation: tipActivation,
    keepAlive: tipKeepAlive,
    defaultPosition: tipPosition,
    content: "",
    enter: function(){
      var index = currentTip.data('index'),
      tipContentCont = $('#tiptip_content');
      tipContentCont.html( $('#'+tipContent+'-'+index).html() );
      tipContentCont.css({'max-height':tipContentMaxHeight, 'text-align':tipContentAlignment, 'overflow':'scroll' });
    }
  })
}

ACTIVE.widgets.ui.editFormHelper = function(){
  //set star on
  $('input.error').each(function(){
    var id = $(this).attr('id');
    $('label[for='+id+']').find('.asterisks').addClass('on').show();
  });

  $('label.error').each(function(){
    $(this).find('.asterisks').addClass('on').show();
    $(this).next('select').addClass('error');
  });

  $('input[type=hidded].error').each(function(){
    $(this).parent('fieldset').find('label .asterisk').addClass('on').show();
  });

  $('input.required').each(function(){
    if($(this).val()=='' && !$(this).hasClass('error')){
      var id = $(this).attr('id');
      $('label[for='+id+']').find('.asterisks').addClass('on').show();
    }
  });
}


ACTIVE.widgets.ui.everywhereLocationLinkHelper = function(options){
  var inputField = options.inputField,
      button = options.button,
      container = options.container,
      error = options.error,
      everywhereLink = options.everywhereLink;
      
    everywhereLink.click(function(e){
      e.preventDefault();
      inputField.val('everywhere');
      error.css({display:'none'});
      container.toggle();
      button.trigger('click');
    });      
}

ACTIVE.widgets.ui.everywhereContainerCancelButton = function(options){
  var cancelButton = options.cancelButton,
      inputField = options.inputField,
      container = options.container,
      error = options.error;
      
  cancelButton.click(function(){
    inputField.val('');
    error.css({display:'none'});
    container.toggle();
  });
}

ACTIVE.widgets.ui.ieHelper = function(){  
  if($.browser.msie) {
    if( parseInt($.browser.version, 10) == 11){
     $('html').addClass('ie11');
    }
    if( parseInt($.browser.version, 10) == 10){
     $('html').addClass('ie10');
    }
    if( parseInt($.browser.version, 10) == 9){
      $('html').addClass('ie9');
    }
    if( parseInt($.browser.version, 10) == 8){
      $('html').addClass('ie8');
    }
  }
}

ACTIVE.widgets.ui.safariHelper = function(){
  /*Safari Browser*/
  if( navigator.userAgent.indexOf('Chrome/') < 0 )
  {
    $('html').addClass('safari');
  }else{
    $('html').addClass('chrome');
  }
}
;
