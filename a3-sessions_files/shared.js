// unit constructors
function ACTIVEMediaGallery(options){
  var i;
  for(i in options){
    if(typeof this[i] === 'undefined'){
      this[i] = options[i];
    }
  }
  ACTIVE._require(this,ACTIVE.ui,'mediaGallery');
  ACTIVE.ui.mediaGallery.init();
}

// private method
(function(w){
  var parsePathNameForLPF = function(w){
    return {
      geo: function(s){
        return (s[0].match(/.*-[a-zA-Z]{2}$/) != null ? true : false);
      },
      subTopic: function(){
        var segments = this.segments().paths();
        if( this.geo(segments) ){
          return ( !!segments[1] ? segments[1] : null );
        }else{
          return ( !!segments[0] ? segments[0] : null );
        }
      },
      subsubTopic: function(){
        var segments = this.segments().paths();
        if( this.geo(segments) ){
          return ( !!segments[2] && segments[2] != 'articles' ? segments[2] : null );
        }else{
          return ( !!segments[1] && segments[1] != 'articles' ? segments[1] : null );
        }
      },
      segments: function(){
        return {
          legnth: function(){
            return this.paths.size;
          },
          paths: function(){
            return w.location.pathname.replace(/^\/{1}/,"").split('/');
          }
        }
      }
    }
  }(w);
  if( w.ACTIVE.ui.controller_name == 'landing_page_factory' ){
    w.ACTIVE.ui.subTopic = parsePathNameForLPF.subTopic();
    w.ACTIVE.ui.subsubTopic = parsePathNameForLPF.subsubTopic();
  }
}(window));

ACTIVE.ui.addSCCodesToLinks = function( list, code ){
  $(list).each(function(i){
    var href = $(this).attr('href');
    if( href.indexOf('?') > -1 )
    {
      href = href + '&' + code;
    }
    else{
      href = href + '?' + code;
    }
    $(this).attr('href', href);
  });
  return true;
}

//typeahead with bloodhound engine for popular keywords search
ACTIVE.ui.search.initTypeahead = function(options) {

  //typeaheadElementId = '#keywords-main'
  var query = ACTIVE.ui.parseSearchQuery();
  var popularKeywords = new Bloodhound({
    datumTokenizer: function(d) {
      return Bloodhound.tokenizers.whitespace(d.text);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: ACTIVE.urls.typeahead + '?t=%QUERY',
      dataType: 'jsonp',
      filter: function(parsedResponse) {
        return parsedResponse.typeAhead
      }
    }
  });
  popularKeywords.initialize();

  options.typeaheadElement.typeahead(null, {
    displayKey: 'text',
    source: popularKeywords.ttAdapter(),
    templates: {
      suggestion: _.template('<p><%=text%></p>'),
      header: _.template('<span class="caret"/>')
    }
  });
  if(!!query && query.keywords){
    var keyword = decodeURIComponent(query.keywords);
    keyword = keyword.replace(/\+/g," ");
    options.typeaheadElement.typeahead('val', keyword);
    options.typeaheadElement.typeahead('close');
  }
  options.typeaheadElement.on('typeahead:selected',function(jqueryEvent,selectedSuggestion, dataSet){
    options.typeaheadElement.value = selectedSuggestion.text;
    options.searchButton.trigger('click');
  });

}

// Display an error dialog window.
ACTIVE.ui.error_dialog = function(title, header, body, icon){
    var iconCls = 'icon-error-large',
            dialog = $('<div/>')
                    .html("<h3><span class='"+ iconCls +"'></span>"+ header +"</h3>"+
                    "<div class='section mt18 custom-modal-body'>"+ body +"</div>"+
                    "<div class='section mt18'>Have Questions? <a href='http://users.active.com/active'>Contact Us</a></div>")
                    .dialog({
                        autoOpen: true,
                        modal: true,
                        title: title,
                        width: 600
                    });

    return dialog;
};

ACTIVE.utilities.querystring.addParam = function(url, parameterName, parameterValue, atStart) {
  replaceDuplicates = true;

  if(url.indexOf('#') > 0){
    var cl = url.indexOf('#');
    urlhash = url.substring(url.indexOf('#'),url.length);
  }
  else {
    urlhash = '';
    cl = url.length;
  }

  sourceUrl = url.substring(0,cl);

  var urlParts = sourceUrl.split("?");
  var newQueryString = "";

  if (urlParts.length > 1) {
    var parameters = urlParts[1].split("&");
    for (var i=0; (i < parameters.length); i++) {
      var parameterParts = parameters[i].split("=");
      if (!(replaceDuplicates && parameterParts[0] == parameterName)) {
        if (newQueryString == "")
            newQueryString = "?";
        else
            newQueryString += "&";

        newQueryString += parameterParts[0] + "=" + (parameterParts[1]?parameterParts[1]:'');
      }
    }
  }

  if (newQueryString == "")
    newQueryString = "?";

  if(atStart){
    newQueryString = '?'+ parameterName + "=" + parameterValue + (newQueryString.length>1?'&'+newQueryString.substring(1):'');
  }
  else {
    if (newQueryString !== "" && newQueryString != '?')
      newQueryString += "&";

    newQueryString += parameterName + "=" + (parameterValue?parameterValue:'');
  }

  return urlParts[0] + newQueryString + urlhash;
};

// Utlity method for getting querystring values.  Returns empty string if
// the key does not exist.  If the param appears more than once in the querystring,
// the values will be returned as an array e.g. ?test=1&test=2&test3   querystring('test') => [1,2,3]
// After this method is called, the querystring is available as a hash => ACTIVE.utilities.querystring.hash
ACTIVE.utilities.querystring.getValue = function(paramName) {
    if(!this.hash) {
        var hash = this.hash = {};
        var e,
                a = /\+/g,  // Regex for replacing addition symbol with a space
                r = /([^&=]+)=?([^&]*)/g,
                d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
                q = window.location.search.substring(1);

        while (e = r.exec(q)) {
            key = d(e[1]);
            value = d(e[2])
            if(hash[key]) {
                if($.isArray(hash[key]))
                    hash[key].push(value)
                else
                    hash[key] = [hash[key], value];
            } else {
                hash[key] = value;
            }
        }
    }

    return (this.hash[paramName] ? this.hash[paramName] : "");
};

ACTIVE.utilities.querystring.to_array = function  (search) {
    var arr = [];
    if(typeof(search) == 'undefined') {
        search = window.location.search;
    }

    if(search == '') return arr;

    // get rid of the ?
    search = search.substring(1);
    var pairs = search.split('&');
    $(pairs).each(function() {
        var pair = this.split('=');
        var item = {name: pair[0], value: pair[1]};
        arr.push(item);
    });

    return arr;
}

ACTIVE.utilities.cookie.getFromMultiValuedCookie = function(cookieName, itemName, defaultValue) {
    var cookieValue = $.cookie(cookieName);
    var resultValue = defaultValue;

    if (cookieValue) {
        var itemIndex = cookieValue.indexOf(itemName + '=');
        if (itemIndex > -1) {

            // Get the index of the delimitor after the item we want
            var multiValueSplitIndex = cookieValue.indexOf('&', itemIndex);
            if (multiValueSplitIndex == -1) {
                // No delimitor, so we reached the end of the values
                multiValueSplitIndex = cookieValue.length;
            }

            // Make sure the indexes are valid
            if (multiValueSplitIndex > -1 && itemIndex < multiValueSplitIndex) {
                resultValue = cookieValue.substring(itemIndex + itemName.length + 1, multiValueSplitIndex);
            }
        }
    }

    return resultValue;
}

ACTIVE.utilities.getAssetUrl = function(asset) {
  if(typeof(asset.assetGuid) == 'undefined') {
    var url = "/asset_service/" + asset['asset.assetGuid'];
    if (asset['asset.assetSeoUrls']) {
      $(asset['asset.assetSeoUrls']).each(function() {
        if (this.seoSystemName == 'as3') {
          url = $(this.urlAdr.split("active.com")).last()[0];
        }
      })
    }

    return url;
  }
  else {
    var url = "/asset_service/" + asset.assetGuid;
    if(asset.assetSeoUrls) {
      $(asset.assetSeoUrls).each(function() {
        if(this.seoSystemName == "as3") {
          url = $(this.urlAdr.split("active.com")).last()[0];
        }
      })
    }

    return url;
  }
}

ACTIVE.ui.search.eventDetailsMap = function(el, options) {
    var cloudmadeUrl = 'http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png';
    var subDomains = ['otile1', 'otile2', 'otile3', 'otile4'];
    var tileLayer = new L.TileLayer(cloudmadeUrl, {maxZoom: 18, attribution: '', subdomains: subDomains});

    var lat = options.lat ? options.lat : 35;
    var lng = options.lng ? options.lng : -95;
    var zoom = options.lat && options.lng ? 12 : 1

    var point = new L.LatLng(lat, lng);
    var lmap = new L.Map('map', {
        center: point,
        zoom: zoom,
        attributionControl: null
    });
    lmap.addLayer(tileLayer);

    if (options.lat && options.lng) {
        var CustomIcon = L.Icon.extend({
            iconUrl: '/assets/maps/map-pin-bg.png',
            shadowUrl: '/assets/maps/map-pin-shadow.png',
            iconSize: new L.Point(29, 34),
            shadowSize: new L.Point(44, 34),
            iconAnchor: new L.Point(13, 34),
            popupAnchor: new L.Point(0, -33)
        });

        var marker = new L.Marker(point, {icon: new CustomIcon()});
        lmap.addLayer(marker);
    }
}


ACTIVE.ui.search.popularEventsNearYou = function() {
    var PopularResults = function() {
        this.fetch = function(location, radius, options) {
            var keywords = options.keywords ? options.keywords : '';

            var defaultOptions = {exists: 'views'}
            var options = options.options ? options.options : {};
            $.extend(options, defaultOptions);
            options = JSON.stringify(options);
            var date = new Date();
            var today = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

            return $.ajax({
                url: '/popular_events_near_you?query=' + keywords + '&near=' + location + '&radius=' + radius + '&sort=ranking_desc&start_date=' + today + '..&per_page=4',
                similarLinkUrl: '/search?keywords=' + keywords + '&location=' + location + '&radius=' + radius + '&category=Activities&sort=ranking_desc&daterange=All+future+dates&options=' + options,
                dataType: 'json'
            });
        }
    }

    var PopularResultsView = function(options) {
        var div = options.container;
        var similarLink = options.similarLink;

        var getEventImage = function(result) {
            var defaultImage = 'http://www.active.com/images/events/hotrace.gif';
            var image = '';

            // first check logoUrl
            if(result.logoUrlAdr && result.logoUrlAdr != defaultImage)
                image = result.logoUrlAdr;
            else {
                // if no logo, look through assetImages
                $(result.assetImages).each(function() {
                    if(this.imageUrlAdr != defaultImage) {
                        image = this.imageUrlAdr;
                    }
                });
            }

            return image;
        }

        var noResultsHtml = function() {
            return "<div>No results found.</div>";
        }

        var resultListHtml = function(results) {
            var html = '<ul>';
            $(results).each(function(index) {
                var rowClass = index % 2 == 0 ? 'odd' : '';
                var title = this.assetName;
                var summary = this.place.cityName + ', ' + this.place.stateProvinceCode;

                //var imageUrl = getEventImage(this);
                //var thumbnailClass = imageUrl == "" ? "" : "span2";

                html += '<li class="' + rowClass + '">' +
                        '<h5><a href="' + ACTIVE.utilities.getAssetUrl(this) + '" alt="">' + title + '</a></h5>' +
                        '<h6>' + summary + '</h6></li>';
                    //'<div class="thumbnail ' + thumbnailClass + '"><img src="' + imageUrl  + '" /></div>' +
            });

            html += '</ul>';

            return html
        }

        this.update = function(results, url) {
            var html = '';

            if(results.length > 0) {
                html = resultListHtml(results);

                $('#popular-events-near-you').css({display:''});
                $('aside.inline-ad').css({display:''});
            }

            div.html(html);
            similarLink.attr('href', url);
        }
    }

    var PopularResultsController = function(options) {
        var searchOptions = options.searchOptions;
        var resultsView = options.resultsView;
        var results = new PopularResults();

        var getData = function(location) {
            var dfd = $.Deferred();
            var url = '';

            results.fetch(location, 50, searchOptions).done(function(data) {
                if(data.length == 0) {
                    results.fetch(location, 100, searchOptions).done(function(data) {
                        if(data.length == 0) {
                            results.fetch('', '', searchOptions).done(function(data) {
                                if(data.length == 0) {
                                  searchOptions.keywords = "5k";
                                  results.fetch('', '', searchOptions).done(function(data) {
                                      dfd.resolve(data, this.similarLinkUrl);
                                  })
                                }
                            })
                        } else {
                            dfd.resolve(data, this.similarLinkUrl);
                        }
                    })
                } else {
                    dfd.resolve(data, this.similarLinkUrl);
                }

            });

            return dfd;
        }

        var locationChange = function(){
          var value = ACTIVE.powerplant.get_user_location().toLowerCase() || "everywhere";
          getData(value).done(function(data, url) {
            resultsView.update(data, url);
          })
        }
        locationChange();
    }

    this.initalize = function(options) {
        if( typeof options == 'undefined')
            options = {};
        var controller = new PopularResultsController({
            resultsView: new PopularResultsView({
                container: $('#popular-events-near-you div.content'),
                similarLink: $('#popular-events-near-you a.section-footer-link')
            }),
            searchOptions: options
        });
    }
}

ACTIVE.ui.leftNavAdvantage = function(options){
  var aaListElement = options.li;
  if( ! aaListElement.hasClass('current-a') ){
    aaListElement.hover(function(){
      $(this).addClass('current-a advantage');
    },function(){
      $(this).removeClass('current-a advantage');
    });
  }
}
;
