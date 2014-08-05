ACTIVE.powerplant.register('link_helper');
ACTIVE.powerplant.register('activity_feed_link_watcher');
ACTIVE.powerplant.register('open_element_href');
ACTIVE.powerplant.register('instant_ads_link_helper');
ACTIVE.powerplant.register('find_element_parent_links');

ACTIVE.powerplant.instant_ads_link_helper = function instant_ads_link_helper(){
  var elements = $('.instant-ads-promotion-link');
  elements.each(function(){
    new ACTIVE.powerplant.factory('activity_feed_link_watcher',{parent: ACTIVE.powerplant.factory('find_element_parent_links', $(this)), element: $(this)});
  });
}

ACTIVE.powerplant.link_helper = function link_helper(){
  // var elements = $('*[data-href]');
  var elements = $('.advantage-feed-link');
  elements.each(function(){
    new ACTIVE.powerplant.factory('activity_feed_link_watcher',{parent: ACTIVE.powerplant.factory('find_element_parent_links', $(this)), element: $(this)});
  });
}

ACTIVE.powerplant.find_element_parent_links = function find_element_parent_links(element){
  return $('a.ie-article-link[data-asset-id='+element.data('asset-id')+']');
}

ACTIVE.powerplant.activity_feed_link_watcher = function activity_feed_link_watcher(options){
  var parent = options.parent, 
      ui = options.element;
  $(parent).click(function(e){
    var targetClass = e.target.className || null;
    if(targetClass == 'reverse-text' || targetClass == 'advantage-link-inline'
       || targetClass == 'advantage-feed-link' || targetClass == 'instant-ads-promotion-link'){
      e.preventDefault();
      new ACTIVE.powerplant.factory('open_element_href', ui);
    }else{
      return true;
    }
  });
}

ACTIVE.powerplant.open_element_href = function open_element_href(ui){
  return window.location = $(ui).data('href');
}
;
