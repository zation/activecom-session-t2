// Social Connect Library
// Written By: Myron Robertson
// Copywrite: Active Network 2013
// website: http://www.active.com

"use strict";

var SocialConnect = window.SocialConnect = window.SocialConnect || {};

SocialConnect.prototype.init = function(){  
  SocialConnect.loadAsyncSocialScripts();
}


SocialConnect.prototype.loadMeta = function(a){
  var i=0,b=document.getElementsByTagName('meta'); 
  for(i;i<b.length;i++){
    var c = b[i].attributes;
    if(!!c.property) if(c.property.value==a) if( !!c.content ) return c.content.value;
    if(!!c.name) if(c.name.value==a) if( !!c.content ) return c.content.value;
  }
}

SocialConnect.prototype.loadAsyncSocialScripts = function(){
  var i=0,sc,src,js,ref;
  for(i;i<this.options.scripts.length;i++){
    sc = this.options.scripts[i]; src = this.filterTemplateTags(sc.src); ref = document.getElementsByTagName('script')[0];
    if(document.getElementById(sc.id)) continue;
    js = document.createElement('script'); js.id = sc.id; js.async = true;
    js.src = src; ref.parentNode.insertBefore(js, ref);
  }
}

SocialConnect.prototype.filterTemplateTags = function(ref){
  var patt1 = /({\w+}|{\w|[{\w+}]})/g;
  var patt2 = /(\w+)/g;
  var j, i=0, tags=ref.match(patt1);
  if(!tags){return ref;}
  for(i;i<tags.length;i++){
    var key = tags[i].replace('{','').replace('}','');
    for(j in this.options) if(j == key) ref = ref.replace(tags[i], this.options[j]);
  }
  return ref;
}

SocialConnect.prototype.pinterestLoader = function(){
  window.onload = function(){
    var js, ref=document.getElementsByTagName('script')[0];
    if(document.getElementById(SocialConnect.options.pin_id)){return;}
    js=document.createElement('script'); js.type="text/javascript"; js.id=SocialConnect.options.pin_id; js.src=SocialConnect.options.pin_src; js.async = false;
    ref.parentNode.insertBefore(js, ref);    
  };
}


/* Add SiteCatalyst tracking if required
* @return String: url with sc tag appended to the 
* i = count
* a = code
* b = object ref
* c = url
*/
SocialConnect.prototype.siteCatalyst = function(url,type){
  if(this.options.scTracking){
    var i,a,b = this.options.scTrackingTags,c;
    for(i=0;i<b.length;i++) if(b[i].name == type) a = b[i].tag;
    if(parseInt(url.split('?').length)==1){ 
      url = url+'?'+a; 
    }
    else if(parseInt(url.split('?').length)>1){
      c = url.split('?');
      url = c.shift()+'?'+a+'&'+c.pop();
    }
  } 
  return url;
}

/* Return the FB Facepile Social Plugin
* @param[Required]: url
* @param[Optional]: max_rows
* @param[Optional]: colorscheme
* @param[Optional]: width
* @param[Optional]: size
* @param[Optional]: show_count
*/
SocialConnect.prototype.facebookFacepile = function(a,b,c,d,e,f){
  if(a == "" || !a){
    throw new Error('URL required');
    return;
  }
  var a = this.getLocation( a );
  var rand = Math.round(Math.random()*1000);
  return document.write('<fb:facepile href="http://www.active.com" max_rows="'+(!!b?b:1)+'" colorscheme="'+(!!c?c:'dark')+'" width="'+(!!d?d:300)+'" size="'+(!!e?e:'medium')+'" show_count="'+(!!f?f:true)+'"></fb:facepile>');
}

/* Return the FB.Like Button Object 
* @param[Optional]: url
* @param[Optional]: layout
* @param[Optional]: width
* @param[Optional]: show_faces
+ @param[Optional]: colorscheme
* @param[Optional]: font
* @param[Optional]: class
*/
SocialConnect.prototype.facebookLikeButton = function(a,b,c,d,e,f,g){
  var a = SocialConnect.getLocation( a );
  var rand = Math.round(Math.random()*1000);
  return document.write('<fb:like href="'+SocialConnect.siteCatalyst(a,"facebook")+'" ref="cmp=23-126" share="false" layout="'+(!!b?b:'button_count')+'" counter="" width="'+(!!c?c:'52')+'" id="fb_like_button-'+rand+'" show_faces="'+(!!d?d:'false')+'" colorscheme="'+(!!e?e:'light')+'" font="'+(!!f?f:'lucida grande')+'" action="like" class="'+(!!g?g:'fb_like')+'"></fb:like>');
}

// <fb:like href="http://www.active.com" layout="standard" action="like" show_faces="true" share="false"></fb:like>

/* Return the FB.Comments Object
* @param[Optiona]: url
* @param[Optional]: width
* @param[Optional]: num_posts
*/
SocialConnect.prototype.facebookComments = function(a,b,c){
  var a = this.getLocation( a );
  return document.write('<fb:comments href="'+a+'" width="'+((!!b)?b:'620')+'" num_posts="'+((!!c)?c:'2')+'" id="fb-comments-container"></fb:comments>');
}

/* Return the PinitButton Object
* @param[Required]: media url
* @param[Optional]: url
* @param[Optional]: description
* @param[Optional]: class
* @param[Optional]: count-layout
*/
SocialConnect.prototype.pinitButton = function(a,b,c,d,e){
  var a = this.getImagePath( a );
  var b = this.getLocation( b );
  var c = this.getDefaultText( c, "pinit", b );
  var rand = Math.round(Math.random()*1000);
  document.write('<a href="http://pinterest.com/pin/create/button/?media='+a+'&description='+c.replace(/\s/g,'+')+'&url='+encodeURIComponent(this.siteCatalyst(b,"pinterest"))+'" class="'+((!!d)?d:'pin-it-button')+'" id="pinit-'+rand+'"  data-pin-do="buttonPin" data-pin-config="none"><img border="0" src="//assets.pinterest.com/images/pidgets/pin_it_button.png" title="Pin It" /></a>');
  this.pinterestLoader();
  return;
}

/* Return the TweetButton
* @param[Optional]: url
* @param[Optional]: default text
* @param[Optional]: hashtags
* #REMOVED##@param[Optional]: countainer type
* @param[Optional]: lang
* @param[Optional]: size
*/
SocialConnect.prototype.tweetButton = function(a,b,c,d,e,f){
  var a = this.getLocation( a );
  var b = this.getDefaultText( b );
  var c=(!!c)?c:(!!this.options.keywords)?this.filterHashTagList(this.options.keywords):'#ACTIVE';
  return document.write('<a href="https://twitter.com/share?via=active&text='+b+'&hashtags='+c+'&lang='+((!!e)?e:"en")+'&size='+((!!f)?f:"57")+'&url='+encodeURIComponent(this.siteCatalyst(a,"twitter"))+'" class="twitter-share-button" data-count="none">Tweet</a>');
}

/*Twitter helper for hashtags*/
SocialConnect.prototype.filterHashTagList = function(ref){
  var i=0;
  ref = ref.replace(/\s/g,'');
  ref = ref.split(',');
  for(i;i<ref.length;i++) ref[i] = "#"+ref[i];
  return ref.join(', ');
}

/* Return the Plus Button
* @param[Optional]: url
*/
SocialConnect.prototype.gPlusButton = function(a){
  var rand = Math.round(Math.random()*1000);
  document.write('<div id="g-plusContainer'+rand+'"></div>');
  var a = this.getLocation( a );
  gapi.plusone.render("g-plusContainer"+rand,{
    href: SocialConnect.siteCatalyst(a,"googlePlus"),
    size: "tall", 
    width: 57, 
    annotation: 'none',
    recommendations: false
  });
}

/*
* get default text
*/
SocialConnect.prototype.getDefaultText = function( str, sec, path ){
  if( !!str ){
    return str;
  }
  else if( !!this.options.og_title ){
    return this.options.og_title;
  }
  else{
    if( sec == "pinit" ){
      return this.options.active_pin_text + path;
    }
    return this.options.active_text;
  }
}

/*
* Get image path
*/
SocialConnect.prototype.getImagePath = function( path ){
  if( !!path ){
    return path;
  }
  else if( !!this.options.og_image ){
    return this.options.og_image;
  }
  else{
    return this.options.active_image_url;
  }
}

/*
* Get location
*/
SocialConnect.prototype.getLocation = function( path ){
  if( !!path ){
    return path;
  }
  else if( !! this.options.og_url ){
    return this.options.og_url;
  }
  else{
    return window.location.href;
  }
}



SocialConnect.prototype.error = function(f,msg){
  throw new Error( "SOCIALCONNECT (f) "+f+" (m) "+msg );
}

SocialConnect.prototype.options = {
  scripts:            [{
                        id  : "facebook-jssdk1",
                        src : "//connect.facebook.net/en_US/all.js#xfbml=1&appId={fb_appID}&channelUrl=//{base_url}/channel.html&xfbml=true&cookie=true&status=true" 
                      },{
                        id  : "twitter-wjs",
                        src : "//platform.twitter.com/widgets.js"
                      },{
                        id  : "google-pls",
                        src : "https://apis.google.com/js/plusone.js"
                      }],
  pin_container:      "pinit-btn",
  pin_id:             "pinterest-pin",
  pin_src:            "//assets.pinterest.com/js/pinit.js",
  base_url:           "www.active.com",
  keywords:           "", //SocialConnect.prototype.loadMeta("keywords"),
  fb_appID:           SocialConnect.prototype.loadMeta("fb:app_id"),
  og_url:             SocialConnect.prototype.loadMeta("og:url"),
  og_title:           SocialConnect.prototype.loadMeta("og:title"),
  og_image:           SocialConnect.prototype.loadMeta("og:image"),
  og_description:     SocialConnect.prototype.loadMeta("og:description"),
  og_siteName:        SocialConnect.prototype.loadMeta("og:site_name"),
  og_type:            SocialConnect.prototype.loadMeta("og:type"),
  og_latitude:        SocialConnect.prototype.loadMeta("og:latitude"),
  og_longitude:       SocialConnect.prototype.loadMeta("og:longitude"),
  og_streeAddress:    SocialConnect.prototype.loadMeta("og:street-address"),
  og_locality:        SocialConnect.prototype.loadMeta("og:locality"),
  og_region:          SocialConnect.prototype.loadMeta("og:region"),
  og_postalCode:      SocialConnect.prototype.loadMeta("og:postal-code"),
  og_countryName:     SocialConnect.prototype.loadMeta("og:country-name"),
  scTracking:         true,
  scTrackingTags:     [{
                        name: "facebook",
                        tag: "cmp=23-126"
                      },{
                        name: "pinterest",
                        tag: "cmp=23-78"
                      },{
                        name: "twitter",
                        tag: "cmp=23-127"
                      },{
                        name: "googlePlus",
                        tag: "cmp=23-128"
                      }],
  active_image_url:   "http://beta.active.com/images/FB_image.jpg",
  active_text:        "ACTIVE.com",
  active_pin_text:    "Find more at ACTIVE.com - " 
}

function SocialConnect(){
  if(typeof window.SocialConnect !== 'undefined' ){
    for(var i in SocialConnect.prototype){
      if(SocialConnect.prototype.hasOwnProperty(i)){
        SocialConnect[i] = SocialConnect.prototype[i];
      }
    }
    return new SocialConnect.init();
  }
}SocialConnect();
