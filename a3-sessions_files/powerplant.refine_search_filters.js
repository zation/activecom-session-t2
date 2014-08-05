ACTIVE.powerplant.register('refine_search_filters');
ACTIVE.powerplant.register('refine_search_feed_filters');
ACTIVE.powerplant.register('refine_search_options');
ACTIVE.powerplant.register('refine_search_helpers');
ACTIVE.powerplant.register('set_search_options');
ACTIVE.powerplant.register('refine_search_fixed_position');
ACTIVE.powerplant.register('close_date_field');
ACTIVE.powerplant.register('change_location');
ACTIVE.powerplant.register('search_box_sort');
ACTIVE.powerplant.register('search_advantage_check_box');
ACTIVE.powerplant.register('search_box_distance');
ACTIVE.powerplant.register('category_tab_links');
ACTIVE.powerplant.register('date_range_search_button');
ACTIVE.powerplant.register('refine_search_filters_build_ui');
ACTIVE.powerplant.register('category_link_active_defaults');
ACTIVE.powerplant.register('daterange_dropdown_selected_defaults');
ACTIVE.powerplant.register('distance_dropdown_selected_defaults');
ACTIVE.powerplant.register('sort_dropdown_selected_defaults');
ACTIVE.powerplant.register('advantage_button_selected_default');
ACTIVE.powerplant.register('refine_search_filters_display_state_with_sponsored_feed');


ACTIVE.powerplant.refine_search_filters = function refine_search_filters(){
  new ACTIVE.powerplant.factory('search_box_date_picker');
  new ACTIVE.powerplant.factory('search_box_distance');
  new ACTIVE.powerplant.factory('search_box_sort');
  new ACTIVE.powerplant.factory('search_advantage_check_box');
  new ACTIVE.powerplant.factory('category_tab_links');
  new ACTIVE.powerplant.factory('date_range_search_button');
  new ACTIVE.powerplant.factory('refine_search_filters_build_ui');
}

ACTIVE.powerplant.refine_search_feed_filters = function refine_search_feed_filters(){
  new ACTIVE.powerplant.factory('search_box_date_picker');
  new ACTIVE.powerplant.factory('search_box_sort');
  new ACTIVE.powerplant.factory('search_advantage_check_box');
  new ACTIVE.powerplant.factory('date_range_search_button');
  new ACTIVE.powerplant.factory('refine_search_filters_build_ui');
}

ACTIVE.powerplant.refine_search_filters_build_ui = function refine_search_filters_build_ui(){
  var options = ACTIVE.powerplant.factory('refine_search_options');
  var helpers = ACTIVE.powerplant.factory('refine_search_helpers');
  $(document).bind({
    click: function(e){
      if(options.selectBoxAttachedContainer.is(':visible') && !helpers.check_hover_focus_states()){
        options.selectBox.trigger('close');
        if( e.target.id != 'refine-start-date' || e.target.id != 'refine-end-date' ){
          $('#ui-datepicker-div').hide();
        }
      }
    },
    ready: function(){
      var queryValues = ACTIVE.ui.parseSearchQuery();
      var a3UserLocationCookieValue = $.cookie('a3userLocation');
      if(ACTIVE.ui.controller_name=='search'){
        if(!a3UserLocationCookieValue || a3UserLocationCookieValue.match(/everywhere/i)){
          options.radiusOptionsContainer.hide();
          options.selectBoxSortContainer.find('li[data-val="distance"]').hide();
          options.sortOptionsContainer.css({'margin-left':175});
          options.advantageOptionContainer.css({'margin-left':350});
          options.distanceNotificationMessage.css({display: 'block'});
        }
      }
      options.refineSearchContainer.css({visibility:'visible'});
      options.refineSearchContainerFilters.css({visibility:'visible'}).fadeIn();
    }
  });
}

ACTIVE.powerplant.set_search_options = function set_search_options(options){
  ACTIVE.powerplant.refine_search_options = options;
}

ACTIVE.powerplant.refine_search_helpers = function refine_search_helpers(){
  return {
    is_container_hovered: function(){
      var container = ACTIVE.powerplant.factory('refine_search_options').selectBoxAttachedContainer;
      if($('#' + container.attr('id') + ':hover').length > 0) return true;
      if($('#' + container.attr('id') + ' .note:hover').length > 0) return true;
      if($('#' + container.attr('id') + ' label:hover').length > 0) return true;
      if($('#' + container.attr('id') + ' #refine-date-error:hover').length > 0) return true;
      if($('#' + container.attr('id') + ' input[type=button]:hover').length > 0) return true;
      if($('#ui-datepicker-div:hover').length > 0) return true;
      return false;
    },
    is_select_hovered: function(){
      var selectBox = ACTIVE.powerplant.factory('refine_search_options').selectBox;
      return ($('#' + selectBox.attr('id') + ':hover').length > 0) ? true : false;
    },
    is_picker_hovered: function(){
      var selectBoxDatePicker = ACTIVE.powerplant.factory('refine_search_options').selectBoxDatePicker;
      return ($('#' + selectBoxDatePicker.attr('id') + ':hover').length > 0) ? true : false;
    },
    is_start_date_field_focused: function(){
      var startDateField = ACTIVE.powerplant.factory('refine_search_options').startDateField;
      return ($('#'+startDateField.attr('id')+':focus').length>0 || $('#'+startDateField.attr('id')+':hover').length>0) ? true : false;
    },
    is_end_date_field_focused: function(){
      var endDateField = ACTIVE.powerplant.factory('refine_search_options').endDateField;
      return ($('#'+endDateField.attr('id')+':focus').length>0 || $('#'+endDateField.attr('id')+':hover').length>0) ? true : false;
    },
    check_hover_focus_states: function(){
      if(this.is_container_hovered()) return true;
      if(this.is_select_hovered()) return true;
      if(this.is_picker_hovered()) return true;
      if(this.is_start_date_field_focused()) return true;
      if(this.is_end_date_field_focused()) return true;
      return false;
    },
    build_search_query: function(options){
      var queries=[],key;
      for(key in options){
        var query = key+"="+options[key];
        queries.push(query);
      }
      return queries.join("&");
    },
    clean_query_for_articles: function(queryValues){
      if(queryValues.category=='Articles'){
        delete queryValues['sort'];
        delete queryValues['daterange'];
        delete queryValues['search_category'];
        delete queryValues['advantage_eligible'];
      }
      return queryValues;
    },
    modify_search_query: function(options){
      var queryValues = ACTIVE.ui.parseSearchQuery(),key,index;
      var helpers = ACTIVE.powerplant.factory("refine_search_helpers");
      delete queryValues['page'];
      for(index in options) queryValues[index] = options[index];
      queryValues = this.clean_query_for_articles(queryValues);
      queryValues = this.build_search_query(queryValues);
      new ACTIVE.powerplant.factory('change_location', location.pathname+'?'+queryValues);
    }
  }
}

ACTIVE.powerplant.close_date_field = function close_date_field(date_field){
  date_field.datepicker('hide');
}

ACTIVE.powerplant.search_box_date_picker = function search_box_date_picker(){
  var options = ACTIVE.powerplant.factory('refine_search_options');
  var helpers = ACTIVE.powerplant.factory('refine_search_helpers');
  return options.selectBox.bind({
    open:     function(){
      options.selectBoxAttachedContainer.show();
    },
    close:    function(){
      if(options.selectBoxAttachedContainer.is(':visible') && !helpers.check_hover_focus_states()){
        options.selectBoxAttachedContainer.hide();
        options.selectBoxOptionsContainer.hide();
      }else{
        setTimeout(function(){
          $(options.selectBoxOptionsContainerId).css({display: 'block'})
        },1);
      }
    },
    change:   function(){
      helpers.modify_search_query({daterange: encodeURIComponent(options.selectBox.val())});
    }
  });
}

ACTIVE.powerplant.search_box_sort = function search_box_sort(){
  var options = ACTIVE.powerplant.factory('refine_search_options');
  var helpers = ACTIVE.powerplant.factory('refine_search_helpers');
  return options.selectBoxSort.bind({
    open: function(){
      options.selectBoxSortContainer.find('li.selectboxit-selected').addClass('selectboxit-focus');
    },
    change: function(){
      helpers.modify_search_query({sort:encodeURIComponent(options.selectBoxSort.val())});
    }
  });
}

ACTIVE.powerplant.search_advantage_check_box = function search_advantage_check_box(){
  var options = ACTIVE.powerplant.factory('refine_search_options');
  var helpers = ACTIVE.powerplant.factory('refine_search_helpers');
  return options.advantageCheckbox.bind({
    change: function(){
      helpers.modify_search_query({advantage_eligible: options.advantageCheckbox.prop('checked')});
    }
  })
}

ACTIVE.powerplant.search_box_distance = function search_box_distance(){
  var options = ACTIVE.powerplant.factory('refine_search_options');
  var helpers = ACTIVE.powerplant.factory('refine_search_helpers');
  return options.selectBoxDistance.bind({
    open: function(){
      options.selectBoxDistanceContainer.find('li.selectboxit-selected').addClass('selectboxit-focus');
    },
    change: function(){
      helpers.modify_search_query({radius: encodeURIComponent(options.selectBoxDistance.val())});
    }
  });
}

ACTIVE.powerplant.category_tab_links = function category_tab_links(){
  var options = ACTIVE.powerplant.factory('refine_search_options');
  var helpers = ACTIVE.powerplant.factory('refine_search_helpers');
  options.categoryLinks.click(function(e){
    e.preventDefault();
    helpers.modify_search_query({category: encodeURIComponent($(this).data('type'))});
  });
}

ACTIVE.powerplant.date_range_search_button = function date_range_search_button(){
  var options = ACTIVE.powerplant.factory('refine_search_options');
  var helpers = ACTIVE.powerplant.factory('refine_search_helpers');
  options.searchButton.click(function(){
    helpers.modify_search_query({daterange: encodeURI(options.startDateField.val())+'-'+encodeURI(options.endDateField.val())});
  });
}

ACTIVE.powerplant.change_location = function change_location(path){
  if(path && path!=''){
    return location = path;
  }
}

ACTIVE.powerplant.refine_search_fixed_position = function refine_search_fixed_position(){
  if(!ACTIVE.ui.mediaViewport){
    if($('#message-bar-1:visible').length > 0) return false;
    var refSearchCont = $('#refined-search-container'),
    refSearchContFixOff = $('.refined-search-containter-fixed-offest'),
    map = $('#search-right-column .map'),
    refSearchClass = 'refined-search-fixed',
    refSearchRightColFixClass = 'refined-search-right-column-fixed';
    $(window).on('scroll',function(){
      var yOff = $(window).scrollTop(), body = $('body:eq(0)');
      var searchValues = ACTIVE.ui.parseSearchQuery();
      if( searchValues.category == 'Articles' ) return;
      if( body.hasClass('leaderpage') ){
        if( yOff >= 322 ){
          refSearchCont.addClass(refSearchClass);
          refSearchContFixOff.show();
        }else if( yOff < 322 ){
          refSearchCont.removeClass(refSearchClass);
          refSearchContFixOff.hide();
        }
        if( yOff >= 551){
          var lastActivityOffset = $('.search-item.activity').last().offset().top;
          if( yOff < lastActivityOffset - 152 ){
            map.addClass(refSearchRightColFixClass);
          }else{
            map.removeClass(refSearchRightColFixClass);
          }
        }else if( yOff < 551){
          map.removeClass(refSearchRightColFixClass);
        }
      }
      if( !body.hasClass('leaderpage') ){
        if( yOff >= 216 ){
          refSearchCont.addClass(refSearchClass);
          refSearchContFixOff.show();
        }else if( yOff < 216 ){
          refSearchCont.removeClass(refSearchClass);
          refSearchContFixOff.hide();
        }
      }
    });
}
}

ACTIVE.powerplant.category_link_active_defaults = function category_link_active_defaults(){
  var queryValues = ACTIVE.ui.parseSearchQuery();
  var options = ACTIVE.powerplant.factory('refine_search_options');
  options.categoryLinks.parent('li').removeClass('active');
  if(!!queryValues.category){
    $('.'+options.categoryLinks.attr('class')+'[data-type='+queryValues.category+']').parent('li').addClass('active');
  }else{
    $('.'+options.categoryLinks.attr('class')+':eq(0)').parent('li').addClass('active');
  }
}

ACTIVE.powerplant.daterange_dropdown_selected_defaults = function daterange_dropdown_selected_defaults(){
  var selectedText, options = ACTIVE.powerplant.factory('refine_search_options');
  var getValue = function(options) {
    var queryValues = ACTIVE.ui.parseSearchQuery();
    var daterange = options.dateOptionsContainer.data('daterange');
    if (daterange != "") return daterange;
    if (!!queryValues.daterange) {
      if (queryValues.daterange.split('-').shift().match(/\d+\/\d+\/\d\d+/)) {
        var ranges = queryValues.daterange.split('-');
        options.startDateField.val(ranges[0]);
        options.endDateField.val(ranges[1]);
        return ranges.join('-');
      } else if (0 <= ["next%207%20days", "anytime"].indexOf(queryValues.daterange.toLowerCase())){
        return queryValues.daterange;
      }
    }
    return "All future dates";
  }
  selectedText = this.constructor.helpers.cleanURIComponent(getValue(options));
  return options.selectBoxDatePickerText.text(selectedText);
}

ACTIVE.powerplant.distance_dropdown_selected_defaults = function distance_dropdown_selected_defaults(){
  var queryValues = ACTIVE.ui.parseSearchQuery();
  var options = ACTIVE.powerplant.factory('refine_search_options');
  var radius = options.radiusOptionsContainer.data('radius');
  var selected;
  if(!!radius){
    selected = "Within " + radius + " miles";
  }else if(!!queryValues.radius){
    selected = "Within " + decodeURIComponent(queryValues.radius) + " miles";
  }else{
    selected = "Any Distance";
  }
  options.selectBoxDistanceText.text(selected).data('val',parseInt(selected));
}

ACTIVE.powerplant.sort_dropdown_selected_defaults = function sort_dropdown_selected_defaults(){
  var queryValues = ACTIVE.ui.parseSearchQuery();
  var options = ACTIVE.powerplant.factory('refine_search_options');
  var selected, text, default_sort = $('#search-option-sort').data('default-sort');
  text = $('#search-option-sort').find('option[value="'+default_sort+'"]').text();
  if(!!queryValues.sort){
    selected = decodeURIComponent(queryValues.sort);
    options.selectBoxSortContainer.find('li').each(function(){
      if($(this).data('val')==selected){
        text = $(this).find('a').text();
      }
    });
  }
  var a3userLocation = $.cookie().a3userLocation;
  if(a3userLocation && !!a3userLocation.match(/everywhere/i)){
    options.selectBoxSortContainer.find('li[data-val=distance]').remove();
  }
  options.selectBoxSortText.text(text).data("val",text);
}

ACTIVE.powerplant.advantage_button_selected_default = function advantage_button_selected_default(){
  var queryValues = ACTIVE.ui.parseSearchQuery();
  if(!!queryValues.advantage_eligible){
    var selected = JSON.parse(decodeURIComponent(queryValues.advantage_eligible));
    if(selected){
      $('.jquery-checkbox[name^="aa-cb2-leftnav"]').addClass('jquery-checkbox-on');
      $('#aa-cb2-leftnav').prop('checked',true).attr('checked','selected');
    }
  }
}

ACTIVE.powerplant.refine_search_filters_display_state_with_sponsored_feed = function refine_search_filters_display_state_with_sponsored_feed(options){
  var tabsContainer = options.tabsContainer,
  sponsoredTabClassName = options.sponsoredTabClassName,
  searchOptionsContainer = options.searchOptionsContainer;
  var activeLink = tabsContainer.find('li.active');
  if(activeLink.hasClass(sponsoredTabClassName)){
    searchOptionsContainer.hide();
  }else{
    searchOptionsContainer.show();
  }
}
;
