ACTIVE.powerplant.register('navigation_hover');
ACTIVE.powerplant.register('user_info_nav_hover');
ACTIVE.powerplant.register('nav_static_link');
ACTIVE.powerplant.register('close_menu_item');
ACTIVE.powerplant.register('unbind_nav_events');
ACTIVE.powerplant.register('is_mouse_over');

ACTIVE.powerplant.navigation_hover = function navigation_hover(options){
  $(options.li_group).each(function(index){
    $(this).hover(function(e){
      if ($(this).hasClass('open')) return;
      var self = $(this);
      return setTimeout(function(){
        new ACTIVE.powerplant.factory('close_menu_item',[options.li_group,options.close_on_open]);        
        if( $('#'+e.currentTarget.id+':hover').length > 0 ) self.addClass('open');
      },250);      
    },function(){
      if($(this).hasClass('open')){
        $(this).removeClass('open');
      }
    });
  });
}

ACTIVE.powerplant.user_info_nav_hover = function user_info_nav_hover(options){
  $(options.li).hover(function(e){
    if ($(this).hasClass('open')) return;
    var self = $(this);
    return setTimeout(function(){
      new ACTIVE.powerplant.factory('close_menu_item',options.close_on_open);
      if( $('#'+e.currentTarget.id+':hover').length > 0 ) self.addClass('open');
    },250);
  },function(){
    if($(this).hasClass('open')){
      $(this).removeClass('open');
    }
  });
}

ACTIVE.powerplant.nav_static_link = function nav_static_link(options){
  $('.nav_static').unbind('hover');
  $('.nav_static').mouseout(function(){ $(this).removeClass('open') });
  return $('.nav_static').hover(function(){
    return new ACTIVE.powerplant.factory('close_menu_item',options.close_on_hover);
  });
}

ACTIVE.powerplant.close_menu_item = function close_menu_item(element){
  if( _.isArray(element) ){
    return _.forEach(element, function(ele){
      if( _.isArray(ele) ) return new ACTIVE.powerplant.factory('close_menu_item',ele);
      $(ele).removeClass('open');
    });
  }
  return $(element).removeClass('open');
}

ACTIVE.powerplant.unbind_nav_events = function unbind_nav_events(ui){
  return $(ui).unbind('hover');
}

ACTIVE.powerplant.is_mouse_over = function is_mouse_over(options){
  if( $(options.ui+':hover').eq(options.pos).length > 0 ) return true
    else return false;
}

ACTIVE.powerplant.silo(ACTIVE.powerplant.info_nav_hover);
ACTIVE.powerplant.silo(ACTIVE.powerplant.navigation_hover);
ACTIVE.powerplant.silo(ACTIVE.powerplant.nav_static_link);
