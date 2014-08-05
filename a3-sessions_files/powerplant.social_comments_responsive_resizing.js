ACTIVE.powerplant.register('render_social_comments');
ACTIVE.powerplant.register('reset_social_comments');
ACTIVE.powerplant.register('deferred_resize');

ACTIVE.powerplant.render_social_comments = function render_social_comments(options){
  var url = options.url,
  user_defined_width = options.width || null,
  posts = options.posts,
  width = ACTIVE.powerplant.get_social_comments_width();
  width = width || user_defined_width;
  return SocialConnect.facebookComments(url, width, posts);
}

ACTIVE.powerplant.reset_social_comments = function reset_social_comments(options){
  var iframe_url = $('#fb-comments-container').find('iframe').first().prop('src');
  if(iframe_url) {
    iframe_url = iframe_url.replace(/width=?\d{3}/g, "width=" + ACTIVE.powerplant.get_social_comments_width());
    $('#fb-comments-container').find('iframe').first().prop('src', iframe_url);
  }
}

ACTIVE.powerplant.deferred_resize = function deferred_resize(delay){
  var delay_timer = null, w = $(window);
  w.resize(function(){
    if(delay_timer != null){
      clearTimeout(delay_timer);
      delay_timer = null;
    }
    delay_timer = setTimeout(function(){
      return ACTIVE.powerplant.factory('reset_social_comments');
    },delay);
  })
}

ACTIVE.powerplant.get_social_comments_width = function get_social_comments_width(){
  var w = window.innerWidth;
  if(w <= 320){
    width = 300;
  }else if(w > 320 && w <= 480){
    width = 460;
  }else if(w > 480 && w <= 767){
    width = 548;
  }else{
    width = 620;
  }
  return width;
}
;
