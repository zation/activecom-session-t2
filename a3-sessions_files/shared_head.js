// Include code in here that is needed inline (e.g. Doubleclick ads) before the bundle_common js
// libraries are loaded.  Only include code if necessary since we want everything loaded after the DOM
// is loaded.

(function( compound, window ){
  var ACTIVE = window['ACTIVE'] = function(){};
  var ACTIVEADS = window['ACTIVEADS'] = {};
  for( index in compound ){
    if( typeof ACTIVE[index] === 'undefined' ){
      ACTIVE[index] = compound[index];
    }
  }

  // init required methods
  ACTIVE.ui.controller_name = $('meta[property="controller"]:eq(0)').prop('content');
  if(typeof matchMedia !== 'undefined'){
    if(window.outerWidth < 768){
      if($.cookie('view_full_site') != 'true' || $.cookie('view_full_site') === 'undefined'){
        $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" id="metaViewport">');
      }
    }
    var setViewport = function(){
      if(matchMedia("(max-width: 320px)").matches||matchMedia("(max-width: 480px)").matches||matchMedia("(max-width: 767px)").matches){
        ACTIVE.ui.mediaViewport = true;
      }else{
        ACTIVE.ui.mediaViewport = false;
      }
    };
    $(window).resize(function(){
      setViewport();
    });
    setViewport();
  }else{
    // show adaptive views on all device screen that don't support the matchMedia function
    $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" id="metaViewport">');
  }
}(function( window, $, undefined ){

  // setup pre initialied methods

  return {
    utilities: {
      querystring: {},
      cookie: {}
    },
    urls: {},
    test: function test(){},

    /*
    * Class Loader
    * @param = Object to load
    * @param = Object making request
    * @params = String alyus
    */
    _require: function _require( a, b, c ){
      try{
        if(_.isObject(a) && _.isObject(b) ){
          if(!!c && _.isUndefined(b[c])) b[c] = {};
          for(i in a){
            if(_.isUndefined(b[i]) && _.isObject(b[c])){
              b[c][i] = a[i];
            }else if(_.isUndefined(b[i]) && !_.isObject(b[c])){
              b[i] = a[i];
            }
          }
        }
      }catch(err){
        throw new Warning(err);
      }
    },

    cookie: {
      options: {
        setOption: function setOption(a,b){
          return this[a]=b;
        },
        getOption: function getOption(a){
          return this[a];
        }
      },
      setCookie: function(name,value,days){
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = "; expires="+date.toGMTString();
        }
        else var expires = "";
        document.cookie = name+"="+value+expires+"; path=/; domain="+document.domain;
      },
      getCookie: function(name){
        var i,x,y,ARRcookies=document.cookie.split(";");
        for (i=0;i<ARRcookies.length;i++) {
          x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
          y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
          x=x.replace(/^\s+|\s+$/g,"");
          if (x==name) {
            return unescape(y);
          }
        }
      },
      removeCookie: function(name){
        return ACTIVE.cookie.setCookie(name, '', -1);
      },
      checkCookie: function(n){
        if(document.cookie.length>0 && document.cookie.indexOf(n+'=')== -1) return false;
          else return true;
      }
    },
    environment: function(){
      if( ACTIVE.rails_env == "production" || ACTIVE.rails_env == "staging" ){
        if(ACTIVE.ui.mediaViewport){
          return ACTIVE.ui.adParams.environment = "activecom.m.web";
        }
        ACTIVE.ui.adParams.environment = "activecom.tan";
      }
      else{
        if(ACTIVE.ui.mediaViewport){
          return ACTIVE.ui.adParams.environment = "test.activecom.m.web";
        }
        ACTIVE.ui.adParams.environment = "test.active.tan";
      }
    },

     ui: {
      search: {},
      showDefaultBackgroundImage: function showDefaultBackgroundImage(){
        var cont_name = ACTIVE.ui.controller_name;
        if (cont_name === "home" || cont_name === "asset_service" || cont_name === "landing_page_factory") return;
        var body = document.getElementsByTagName('body')[0],
            banner = document.getElementById('leaderboard-inner');

        body.style.backgroundImage = "url('" + siteBackgroundImage + "')";
        body.style.backgroundAttachment = "scroll";
        body.style.backgroundColor = '#FFFFFF';
        body.style.backgroundRepeat = 'no-repeat'; // scroll 50% 135px no-repeat ' + options.backgroundColor ;
        if( banner ){
          body.style.backgroundPosition = '50% 156px';
        }
        else{
          body.style.backgroundPosition = '50% 50px';
        }
      },
      adParamsInitialize: function adParamsInitialize(){
        var referrer = new ACTIVE.ui.referrer();
        var seoUrlMapping = new ACTIVE.ui.seoUrlMapping();

        if( ACTIVE.ui.controller_name == 'articles' ){
          ACTIVE.ui.adParams.channelMapper = true;
          seoUrlMapping.parseCurrent();
          referrer.init();
        }

        if( ACTIVE.ui.controller_name == 'asset_service' ){
          ACTIVE.ui.adParams.channelMapper = true;
          seoUrlMapping.parseCurrent();
          referrer.init();
        }

        if( ACTIVE.ui.controller_name == 'landing_page_factory' ){
          ACTIVE.ui.adParams.channelMapper = true;
          referrer.init();
        }

        if( ACTIVE.ui.controller_name == 'guides' ){
          ACTIVE.ui.adParams.channelMapper = true;
          new ACTIVE.ui.guidesURLMapping().mapGuidePage();
        }

        if( ACTIVE.ui.controller_name == 'ironman' ){
          ACTIVE.ui.adParams.channelMapper = true;
          new ACTIVE.ui.ironmanURLMapping().mapIronmanPage();
        }
      },
      parseSearchQuery: function parseSearchQuery(){
        var q = location.search.replace('?','').split('&'), a = {}, i = 0;
        if(q!=""){
          for(i;i<q.length;i++){
            var b = {}, c = q[i].split('=').shift();
            b[c] = q[i].split('=').pop();
            a[c] = b[c];
          }
          return a;
        }
        return {};
      },
      parseCurrentPath: function(){
        var currentPath = location.href.split('/').slice(3).join('/');
        var path = [];
        if( _.isArray(currentPath) && currentPath.match(/\?|#/).length > 0 ){
          path = currentPath.split(/\?|#/).shift().split(/\//);
        }else{
          path = currentPath.split(/\//);
        }
        return path;
      },
      isGeoLpf: function(){
        var isGeo = $('#main-content').hasClass("geo_lpf");
        return isGeo;
      },
      adParams: {
        view: "na",
        title: 0,
        isAdPositionMobileWhiteList: function isAdPositionMobileWhiteList(position){
          var white_list = ["breadcrumb_top","sponsor","native_top","med_rec_top","native_bottom","med_rec_bottom","pop_up","feed_tab","med_rec_top,half_page_top"];

          if(ACTIVE.ui.mediaViewport){
            if($.inArray(position, white_list )>-1){
              return true;
	          }
            return false;
          }
  	    return true;
        },
        displayAdMobile: function(position){
          if (ACTIVE.ui.mediaViewport)
             googletag.display(position);
        },
        displayAdDesktop: function(position){
          if (!ACTIVE.ui.mediaViewport)
            googletag.display(position);
        },
        metaHelper: function metaHelper(){
          var i=0,b=document.getElementsByTagName('meta');
          for(i;i<b.length;i++){
            var c = b[i].attributes;
            if(!(!c.property)) if(c.property.value==arguments[0]) return c.content.value;
            if(!(!c.name)) if(c.name.value==arguments[0]) return c.content.value;
          }
        },
        gender: function gender(){
          if( !ACTIVE.cookie.checkCookie ) return 'ng';
          else return ACTIVE.cookie.getCookie('gender');
        },
        ageGroup: function ageGroup(){
          if( !ACTIVE.cookie.checkCookie('blessedEvent') ) return 'na';
          var birthyear = parseInt(ACTIVE.cookie.getCookie('blessedEvent'));
          var d = new Date();
          var userAge = d.getFullYear() - birthyear;
          if(userAge >= 12 && userAge <= 17)
            return '0';
          else if(userAge >= 18 && userAge <= 20)
            return '1';
          else if(userAge >= 21 && userAge <= 24)
            return '2';
          else if(userAge >= 25 && userAge <= 34)
            return '3';
          else if(userAge >= 35 && userAge <= 44)
            return '4';
          else if(userAge >= 45 && userAge <= 54)
            return '5';
          else if(userAge >= 55 && userAge <= 64)
            return '6';
          else if(userAge >= 65)
            return '7';
        },
        traveler: function traveler(){
          var eLat = ACTIVE.ui.adParams.metaHelper('og:latitude');
          var eLon = ACTIVE.ui.adParams.metaHelper('og:longitude');
          var ll = ACTIVE.cookie.getCookie('lat_lon');
          if (!!eLat && !!eLon && !!ll) {
            var lat = ll.split(',')[0];
            var lon = ll.split(',')[1];

            var distance = '';
            if (!!lat && !!lon) {
              var R = 3959;
              var dLat = ((eLat - lat) * Math.PI) / 180;
              var dLon = ((eLon - lon) * Math.PI) / 180;
              var rLat = (lat * Math.PI) / 180;
              var reLat = (eLat * Math.PI) / 180;

              var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(rLat) * Math.cos(reLat);
              var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              distance = R * c;
              return distance > 120 ? 'y' : 'n';
            }
          }
          return 'na';
        },
        getTitle: function getTitle(){
          if( ACTIVE.ui.adParams.title > 15 )
            ACTIVE.ui.adParams.title = 1
          else
            ACTIVE.ui.adParams.title++;
          return ACTIVE.ui.adParams.title;
        },
        ord: function ord(){
          return Math.floor(Math.random() * (1000000 - 100000 + 1) + 100000);
        },
        getSerchKeyword: function getSearchKeyword(){
          var queryValues = ACTIVE.ui.parseSearchQuery();
          if( !!ACTIVE.ui.adParams.searchkw ){
            //variable only set on search page
            return ACTIVE.ui.adParams.searchkw;
          }else if( queryValues.adk && ACTIVE.ui.controller_name == 'asset_service'){
            return queryValues.adk;
          }else{
            return "na";
          }
        }
      }
    },
    backtrack: {
      facebookCampaignTracker: function(){
        if( window.location.href.indexOf( 'fb_ref=' ) == -1 ) return;
        var location = window.location.href,
            params = location.split('?').pop().split('&'),
            refCode, iframe, container, countdown;
        for(var i=0, m=params.length; i<m; i++){
          if( params[i].indexOf('fb_ref') > -1 ){
            var ref = params[i];
            refCode = ref.replace('fb_ref=','');
            break;
          }
        }
        iframe = document.createElement('iframe');
        iframe.setAttribute('class','backtrack-facebook-sc-helper');
        iframe.setAttribute('id','active.backtrack.'+Math.random());
        iframe.setAttribute('src',location.split('?').shift()+'?'+refCode);
        iframe.setAttribute('onload', 'ACTIVE.ui.backtrack.remove(this)' );

        container = document.createElement('div');
        container.setAttribute('id','active.backtrack.'+Math.random());
        document.getElementsByTagName('body')[0].appendChild(container);
        container.appendChild(iframe);
      },
      remove: function(ui){
        // console.log('called, unloading iframe');
        ui.parentNode.innerHTML = '';
        ui.remove(ui.selectedIndex);
      }
    },
    workers: {
      ui: {},
      options: {
        setOption: function(a,b){
          return this[a]=b;
        },
        getOption: function(a){
          return this[a];
        }
      }
    }


  }
}(window, jQuery),window));
