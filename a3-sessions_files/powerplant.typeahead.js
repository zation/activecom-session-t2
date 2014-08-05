ACTIVE.powerplant.register('typeahead');
ACTIVE.powerplant.register('typeahead_location_init');
ACTIVE.powerplant.register('typeahead_location_validation');
ACTIVE.powerplant.register('set_user_location');
ACTIVE.powerplant.register('store_location_selection');
ACTIVE.powerplant.register('typeahead_render_previous_locations');
ACTIVE.powerplant.register('add_event_listeners');
ACTIVE.powerplant.register("get_user_location");
ACTIVE.powerplant.register('location_input_default_links_helper');

ACTIVE.powerplant.typeahead = function typeahead(){
  var bh = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: ACTIVE.urls.geocoding + '?output=json&callback=?&q=%QUERY',
      dataType: 'jsonp',
      filter: function(response) {
        var data = ACTIVE.powerplant.factory('typeahead_location_validation', response);
        return data.displayKeys;
      }
    }
  });
  bh.initialize();
  return bh;
}

ACTIVE.powerplant.typeahead_location_init = function typeahead_location_init(){
  var locationInputs = $('.typeahead-location-change-input');
  locationInputs.each(function(){
    var bh = new ACTIVE.powerplant.factory('typeahead');
    $(this).typeahead({ minLength: 0, hint: false },{
      name: "results",
      displayKey: 'text',
      source: bh.ttAdapter(),
      templates: {
        suggestion: _.template('<p class="title"><%=text%></p>'),
        header: _.template('<span class="caret"/>')
      }
    },{
      name: "defaults",
      displayKey: "text",
      source: ACTIVE.powerplant.factory("location_input_default_links_helper"),
      templates: {
        header: _.template('<div class="divider"></div>'),
        suggestion: _.template('<span class="<%=icon%>"></span><p><%=text%></p>')
      }
    });
    var _typeahead = $(this).data('ttTypeahead');
    $(this).focus(function() {
      var input = _typeahead.input; //Reference to the typeahead Input class
      input.query = "random_text";
      input._onInput("");
      if ($(this).val() === "Everywhere") {
        $(this).val('');
      }
    });
    ACTIVE.powerplant.factory('add_event_listeners', $(this));
  });
  ACTIVE.powerplant.factory('display_user_location');
}

ACTIVE.powerplant.location_input_default_links_helper = function location_input_default_links_helper(){
  var defaultLinks = [{text: "Current Location",icon: "icon-uniL100"},
                      {text: "Everywhere",icon: "icon-uniL200"}];
  for(var i=0;i<3;i++){
    var value = ACTIVE.powerplant.typeahead_render_previous_locations(i);
    if(value){
      defaultLinks.push({text: value, icon: "icon-uniK500"})
    }
  }
  return function(q,cb){
    cb(defaultLinks);
  }
}

ACTIVE.powerplant.add_event_listeners = function add_event_listeners(ui){
  var typeAheadClass = 'typeahead-location-change-input';
  $('#main-search-form, #search-form').submit(function(e,data){
    e.preventDefault();
    if(data && data.setByUser && !ui.is(':focus')){
      return e.currentTarget.submit();
    }
  });
  $('#keywords').keyup(function(e){
    if(e.keyCode==13){
      $(this).parents('form').trigger('submit',{setByUser: true});
    }
  });
  $('.btn-search').click(function(){
    $(this).parents('form').trigger('submit',{setByUser: true});
  });
  $('#header-location .icon-uniC300').on('mousedown',function(){
    $(this).hide();
    setTimeout(function(){
      ui.val('');
      ui.focus();
    },1);
  });
  ui.keyup(function(){
    $('#header-location > .icon-uniK500').addClass('active');
    if(ui.val() == ""){
      ui.val(ACTIVE.typeahead.get_user_location)
    }
    if(ui.val() != ""){
      $('#header-location > .icon-uniC300').show();
    }
  });
  ui.focusout(function(){
    $('#header-location .icon-uniK500').removeClass('active');
  });
  ui.on('typeahead:autocompleted',function(e,suggestion){
    ui.keyup(function(e){
      if(e.keyCode==13){
        ui.trigger('typeahead:selected',suggestion);
      }
    });
  });
  ui.on('typeahead:selected',function(e,suggestion){
    if(!!suggestion){
      $('#header-location .icon-uniC300').hide();
      $('body').css("cursor","wait");
      if(suggestion.text == "Current Location"){
        ACTIVE.ui.Location.getLocation();
      }
      else{
        ACTIVE.powerplant.factory('store_location_selection', suggestion.text)
        ACTIVE.powerplant.factory('set_user_location', suggestion.text);
      }
    }
  });
  ui.typeahead('val',ACTIVE.powerplant.get_user_location());
  ui.typeahead('close');
}

ACTIVE.powerplant.display_user_location = function display_user_location(){
  var location = ACTIVE.powerplant.get_user_location();
  $(".typeahead-location-change-input").val(location);
}

ACTIVE.powerplant.set_user_location = function set_user_location(location){
  $.removeCookie( 'lat_lon', { path: '/', domain: ACTIVE.cookie_domain });
  $.cookie('user_set_location', true, {expires: 1, path: '/', domain: ACTIVE.cookie_domain });
  $.cookie('a3userLocation', location, { expires: 1, path: '/', domain: ACTIVE.cookie_domain });
  if(location){
    return window.location.reload();
  }
}

ACTIVE.powerplant.get_user_location = function get_user_location(){
  var location = ($.cookie('a3userLocation')) ? $.cookie('a3userLocation').replace(/\+/g, ' ') : "";
  return location;
}

ACTIVE.powerplant.store_location_selection = function store_location_selection(location){
  if(location != "Everywhere"){
    var previous_locations = [];
    if(!$.isEmptyObject($.cookie('previous_locations')))
      previous_locations = JSON.parse($.cookie('previous_locations'));
    if(_.indexOf(previous_locations,location) < 0){
      if(previous_locations.length == 3)
        previous_locations.pop();
      previous_locations.unshift(location);
      $.cookie('previous_locations',JSON.stringify(previous_locations),{path:'/',expires:365});
    }
  }
}

ACTIVE.powerplant.typeahead_render_previous_locations = function typeahead_render_previous_locations(index){
  var previous_locations = [], html = "", i;
  if( !$.isEmptyObject($.cookie('previous_locations')))
    previous_locations = JSON.parse($.cookie('previous_locations'));
  return previous_locations[index];
}


ACTIVE.powerplant.typeahead_location_validation = function typeahead_location_validation(data){
  var displayKeys = [],
      typeAheadData = {},
      value = '';
  // format display text
  if( data.city ){
    if( data.stateCode ){
      value = data.city + ', ' + data.stateCode;
    }
    else if( data.country ){
      value = data.city + ', ' + data.country;
    }
  }else{
    if( data.stateCode && data.country ){
      value = data.stateCode + ', ' + data.country;
    }
    else if( !data.stateName && data.country ){
      value = data.country;
    }
  }
  
  data.text = value;
  displayKeys.push(data);
  typeAheadData.displayKeys = displayKeys;
  return typeAheadData;
}
;
