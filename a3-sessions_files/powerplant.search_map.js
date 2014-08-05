ACTIVE.powerplant.register('search_map_initialize');
ACTIVE.powerplant.register('listing_lat_lng');
ACTIVE.powerplant.register('map_points');
ACTIVE.powerplant.register('render_results_map');
ACTIVE.powerplant.register('render_map_markers');
ACTIVE.powerplant.register('create_map_points');
ACTIVE.powerplant.register('layered_map_points');
ACTIVE.powerplant.register('layered_map_icons');
ACTIVE.powerplant.register('layered_map_markers');
ACTIVE.powerplant.register('layered_map');
ACTIVE.powerplant.register('set_layered_map_points');
ACTIVE.powerplant.register('set_layered_map_icons');
ACTIVE.powerplant.register('set_layered_map_markers');
ACTIVE.powerplant.register('set_title_layer');
ACTIVE.powerplant.register('set_marker_icons');
ACTIVE.powerplant.register('listing_user_events');
ACTIVE.powerplant.register('search_map_options');
ACTIVE.powerplant.register('get_map_marker_path');
ACTIVE.powerplant.register('get_map_marker_shadow_path');
ACTIVE.powerplant.register('set_ed_page_map_options');
ACTIVE.powerplant.register('resize_map');
ACTIVE.powerplant.register('evaluate_screen_size_event_map');

ACTIVE.powerplant.search_map_initialize = function search_map_initialize(options){
  if(!ACTIVE.ui.mediaViewport){
    var mapOptionsDefaults = {
      zoom: 12,
      attributionControl: false,
      showStandardMarker: false
    },
    mapOptions = options.mapOptions || {};
    ACTIVE.powerplant.search_map_options = _.extend(mapOptionsDefaults,mapOptions);
    var resultsListLatLng = ACTIVE.powerplant.listing_lat_lng(options.resultsList);
    if( resultsListLatLng.length > 0 ){
      new ACTIVE.powerplant.factory('render_results_map',{resultsListLatLng: resultsListLatLng, map: options.map});
      new ACTIVE.powerplant.factory('listing_user_events', {resultsList: options.resultsList});
    }
  }
}

ACTIVE.powerplant.listing_lat_lng = function listing_lat_lng(resultsList){
  var lat_lng = [];
  $.each(resultsList, function(){
    var lat = parseFloat($(this).data('geo-point').split(',').shift());
    var lng = parseFloat($(this).data('geo-point').split(',').pop());
    lat_lng.push({lat: lat, lng: lng});
  });
  return lat_lng;
}

ACTIVE.powerplant.render_results_map = function render_results_map(options){
  new ACTIVE.powerplant.factory('create_map_points', options.resultsListLatLng);
  var bounds  = new L.LatLngBounds(ACTIVE.powerplant.layered_map_points);
  var mapOptions = ACTIVE.powerplant.search_map_options;
  if(!bounds.getNorthEast().equals(bounds.getSouthEast())) {
    ACTIVE.powerplant.layered_map = new L.Map(options.map, {
      center: bounds.getCenter(),
      attributionControl: mapOptions.attributionControl
    });
    ACTIVE.powerplant.layered_map.fitBounds(bounds);
  }else{
    ACTIVE.powerplant.layered_map = new L.Map(options.map, {
      center: ACTIVE.powerplant.layered_map_points[0],
      zoom: mapOptions.zoom,
      attributionControl: mapOptions.attributionControl
    });
  }
  ACTIVE.powerplant.layered_map.addLayer(ACTIVE.powerplant.set_title_layer());
  return new ACTIVE.powerplant.factory("render_map_markers");
}

ACTIVE.powerplant.create_map_points = function create_map_points(resultsListLatLng){
  var points = [];
  [].forEach.call(resultsListLatLng, function(geo){
    points.push(new L.LatLng(geo.lat, geo.lng));
  });
  return ACTIVE.powerplant.set_layered_map_points(points);
}

ACTIVE.powerplant.set_layered_map_points = function set_layered_map_points(points){
  return ACTIVE.powerplant.layered_map_points = points;
}

ACTIVE.powerplant.set_title_layer = function set_title_layer(){
  var cloudmadeUrl = 'http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png';
  var subDomains = ['otile1', 'otile2', 'otile3', 'otile4'];
  return new L.TileLayer(cloudmadeUrl, {maxZoom: 18, subdomains: subDomains});
}

ACTIVE.powerplant.set_layered_map_icons = function set_layered_map_icons(){
  var layered_map_icons = [];
  [].forEach.call(ACTIVE.powerplant.layered_map_points,function(point,index){
    var o = {};
    _.extend(o,{
      point: point,
      icon: {
        on: new L.Icon({
            iconUrl: ACTIVE.powerplant.get_map_marker_path("off",index),
            shadowUrl: ACTIVE.powerplant.get_map_marker_shadow_path(),
            iconSize: new L.Point(29, 34),
            shadowSize: new L.Point(44, 34),
            iconAnchor: new L.Point(13, 34),
            popupAnchor: new L.Point(0, -33)

        }),
        off: new L.Icon({
            iconUrl: ACTIVE.powerplant.get_map_marker_path("on",index),
            shadowUrl: ACTIVE.powerplant.get_map_marker_shadow_path(),
            iconSize: new L.Point(29, 34),
            shadowSize: new L.Point(44, 34),
            iconAnchor: new L.Point(13, 34),
            popupAnchor: new L.Point(0, -33)
        })
      }
    });
    layered_map_icons.push(o);
  });
  ACTIVE.powerplant.layered_map_icons = layered_map_icons;
}

ACTIVE.powerplant.get_map_marker_path = function get_map_marker_path(type, index){
  var path;  
  if( ACTIVE.powerplant.search_map_options.showStandardMarker === true){
    path = '/assets/maps/marker.png';
  }else{
    if(type==="on"){
      path = '/assets/maps/map-pin-' + (index + 1) + '.png';
    }else{
      path = '/assets/maps/map-pin-' + (index + 1) + '-off.png';
    }
  }
  return path;
}

ACTIVE.powerplant.get_map_marker_shadow_path = function get_map_marker_shadow_path(){
  var path;
  if( ACTIVE.powerplant.search_map_options.showStandardMarker === true){
    path = '/assets/maps/marker-shadow.png';
  }else{
    path = '/assets/maps/map-pin-shadow.png';
  }
  return path;
}

ACTIVE.powerplant.set_layered_map_markers = function set_layered_map_markers(markers){
  return ACTIVE.powerplant.layered_map_markers = markers;
}

ACTIVE.powerplant.render_map_markers = function render_map_markers(){
  new ACTIVE.powerplant.factory('set_layered_map_icons');
  var markers = [];
  [].forEach.call(ACTIVE.powerplant.layered_map_points,function(point,index){
    var marker = new L.Marker(point, {icon: ACTIVE.powerplant.layered_map_icons[index].icon.off});
    ACTIVE.powerplant.layered_map.addLayer(marker);
    markers.push(marker);
  });
  new ACTIVE.powerplant.factory("set_layered_map_markers",markers);
}

ACTIVE.powerplant.listing_user_events = function listing_user_events(options){
  var resultsList = options.resultsList;
  var markers = ACTIVE.powerplant.layered_map_markers;
  var icons = ACTIVE.powerplant.layered_map_icons;
  resultsList.hover(function(){
    var marker = markers[$(this).data('result-index')-1];
    marker.setIcon(icons[$(this).data('result-index')-1].icon.on);
    marker.setZIndexOffset(marker._icon._leaflet_pos.y + 100);
  },function(){
    var marker = markers[$(this).data('result-index')-1];
    marker.setIcon(icons[$(this).data('result-index')-1].icon.off);
    marker.setZIndexOffset(marker._icon._leaflet_pos.y);
  })
}

ACTIVE.powerplant.set_ed_page_map_options = function set_ed_page_map_options(){
  if ($('#map-data').length == 0) {
    return false;
  }
  var latlng = {lat: $('#map-data').data('latitude'), lng: $('#map-data').data('longitude')};
  var map = new MQA.TileMap({
    elt: document.getElementById('map-a'),
    zoom: 16,
    latLng: latlng,
    mtype: 'osm',
    bestFitMargin: 0,
    zoomOnDoubleClick: true
  });
  MQA.withModule('largezoom','viewoptions','mousewheel', function(){
    map.addControl(
      new MQA.LargeZoom(),
      new MQA.MapCornerPlacement(MQA.MapCorner.TOP_RIGHT, new MQA.Size(10,40))
    );
    map.addControl(
        new MQA.ViewOptions(),
        new MQA.MapCornerPlacement(MQA.MapCorner.TOP_RIGHT, new MQA.Size(70,10))
    );
    map.enableMouseWheelZoom();
  });
  var poi = new MQA.Poi(latlng);
  var icon = new MQA.Icon("/assets/maps/marker.png",25,41);
  poi.setIcon(icon);
  poi.setShadowOffset({x:8,y:-4});
  map.addShape(poi);
  ACTIVE.ui.asset_map = map;
}

ACTIVE.powerplant.evaluate_screen_size_event_map =  function evaluate_screen_size_event_map(){
  if(typeof window.matchMedia !== 'undefined') {
    if (document.getElementById('map-a') !== undefined) {
      if (matchMedia("(max-width: 320px)").matches) {
        ACTIVE.powerplant.resize_map(300, 350);
      } else if (matchMedia("(max-width: 480px)").matches) {
        ACTIVE.powerplant.resize_map(460, 350);
      } else if (matchMedia("(max-width: 767px)").matches) {
        ACTIVE.powerplant.resize_map(548, 350);
      } else {
        ACTIVE.powerplant.resize_map(940, 530);
      }
    }
  }
}

ACTIVE.powerplant.resize_map = function resize_map(width, height){
  var s = new MQA.Size(width, height);
  ACTIVE.ui.asset_map.setSize(s);
}

ACTIVE.powerplant.silo("search_map_initialize");
ACTIVE.powerplant.silo("set_layered_map_markers");
ACTIVE.powerplant.silo("set_layered_map_icons");
ACTIVE.powerplant.silo("set_title_layer");
ACTIVE.powerplant.silo("set_layered_map_points");
ACTIVE.powerplant.silo("create_map_points");
ACTIVE.powerplant.silo("set_marker_icons");
ACTIVE.powerplant.silo("render_map_markers");
ACTIVE.powerplant.silo("render_results_map");
ACTIVE.powerplant.silo("listing_user_event");
