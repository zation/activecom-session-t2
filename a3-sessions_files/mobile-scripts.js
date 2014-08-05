(function(c){
  var am = ACTIVE['mobile'] = {};
  _.extend(ACTIVE.mobile,c);
  
}(function(){
  return {
    flyout_swipe: function(elmo){
      elmo.rightFlyout.aswipe({
        aswipeR: function() {
          elmo.heyBody.attr("class","");
          elmo.pageWrapper.switchClass( "fixed-account", "",
          200, "easeInOutQuad",
            function(){ 
              elmo.rightFlyout.removeClass("open");
              elmo.rightFlyoutBtn.removeClass('active');
            });
        },
        min_move_x: 30,
        preventDefaultEvents: true
      });
    elmo.leftFlyout.aswipe({
        aswipeL: function() {
          elmo.heyBody.attr("class","");
          elmo.pageWrapper.switchClass( "fixed", "",
          200, "easeInOutQuad",
            function(){ 
              elmo.leftFlyout.removeClass("open");
              elmo.leftFlyoutBtn.removeClass('active');
            });
        },
        min_move_x: 30,
        preventDefaultEvents: true
      });
    },
    mobile_nav: function(options){
      var page_wrapper = options.page_wrapper,
          mobile_nav_links = options.mobile_nav_links,
          body_tag = options.body_tag,
          mobile_nav_button = options.mobile_nav_button;
      mobile_nav_button.click(function(e){
        e.preventDefault();
        if (!mobile_nav_button.hasClass('active')){
          toggle_mobile_nav = true;
          page_wrapper.attr('class','fixed');
          mobile_nav_links.attr('class','open');
          body_tag.attr('class','fixed');
          mobile_nav_button.addClass('active');
          $('body[data-controller="asset_service"] #hero-full-width, .asset-toolbar-wrapper').hide();
        } else {
          toggle_mobile_nav = false;
          page_wrapper.removeClass('fixed');
          mobile_nav_links.removeClass('open');
          body_tag.attr('class',ACTIVE.ui.body_class);
          mobile_nav_button.removeClass('active');
          $('body[data-controller="asset_service"] #hero-full-width, .asset-toolbar-wrapper').show();
        }
        return window.scrollTo(0,0);
      });
    },
    mobile_account_nav: function(options){
      var page_wrapper = options.page_wrapper,
          mobile_account_links = options.mobile_account_links,
          body_tag = options.body_tag,
          mobile_account_nav_button = options.mobile_account_nav_button;
      mobile_account_nav_button.click(function(e){
        e.preventDefault();
        if (!mobile_account_nav_button.hasClass('active')){
          page_wrapper.attr('class','fixed-account');
          mobile_account_links.attr('class','open');
          body_tag.attr('class','fixed account');
          mobile_account_nav_button.addClass('active');
          $('body[data-controller="asset_service"] #hero-full-width, .asset-toolbar-wrapper').hide();
        } else {
          page_wrapper.removeClass('fixed-account');
          mobile_account_links.removeClass('open');
          body_tag.attr('class',ACTIVE.ui.body_class);
          mobile_account_nav_button.removeClass('active');
          $('body[data-controller="asset_service"] #hero-full-width, .asset-toolbar-wrapper').show();
        }
        return window.scrollTo(0,0);
      });
    },
    search_bar: function(options){
      var search_bar = options.search_bar,
          mobile_search_bar_button = options.mobile_search_bar_button;
      mobile_search_bar_button.click(function(e){
        e.stopPropagation();
        e.preventDefault();
        if (!mobile_search_bar_button.hasClass('active')){
          search_bar.attr('class','open');
          mobile_search_bar_button.addClass('active');
          mobile_search_bar_button.html('<span class="icon-uniE200 link-icon"></span>');
          $('.asset_service .page-title').css({top: 129});
        } else {
          search_bar.removeClass('open');
          mobile_search_bar_button.removeClass('active');
          mobile_search_bar_button.html('<span class="icon-uniJ100 link-icon"></span>');
          $('.asset_service .page-title').css({top: 50});
        }        
      });
    },
    open_search_box: function(options){
      var mobile_search_bar_button = options.mobile_search_bar_button;
      var controller = ACTIVE.ui.controller_name;
      if(controller == "home" || controller == "search"){
        return mobile_search_bar_button.trigger('click');
      }
    },
    open_menu: function(options){
      var button = options.button,
          dropdown = options.dropdown;
      button.click(function(e){
        e.preventDefault();
        if(!button.hasClass('open')){
          dropdown.collapse('show');
          button.find('.open-icon').removeClass('open');
          button.find('.close-icon').addClass('open');
          button.addClass('open')
        }else{
          dropdown.collapse('hide');
          button.find('.open-icon').addClass('open');
          button.find('.close-icon').removeClass('open');
          button.removeClass('open')
        }
      });
      return false;
    },
    show_filter: function(options){
      var btn_filter = options.btn_filter,
          tab_filter = options.tab_filter;
      btn_filter.click(function(e){
        e.preventDefault();
        if (!tab_filter.hasClass('open')){
          btn_filter.text("Hide");
          tab_filter.addClass('open');
        } else {
          btn_filter.text("Filter");
          tab_filter.removeClass('open');
        }        
      });
    },
    show_add_manage: function(options){
      var btn_add_manage = options.btn_add_manage,
          add_manage_panel = options.add_manage_panel;
      btn_add_manage.click(function(e){
        e.preventDefault();
        if (!add_manage_panel.hasClass('open')){
          btn_add_manage.text("Hide");
          add_manage_panel.addClass("open");
        } else {
          btn_add_manage.text("Options");
          add_manage_panel.removeClass('open');
        }
      });
    },
    show_full_site: function(options){
      var link = options.link,
          location = window.location.href;
      link.click(function(e){
        e.preventDefault();
        if(!$.cookie('view_full_site')){
          $.cookie('view_full_site', true);
        }
        window.location = location;
      });
    }
  }
}()));
