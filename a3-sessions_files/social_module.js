var SocialControl = function(options) {
  var asset = options.asset;
  var ausId = options.ausId;

  this.parseDateFromAsset = function(date_time){
    var date = date_time.substring(0, date_time.indexOf('T'));
    return date;
  }

  this.parseTimeFromAsset = function(date_time){
    var time = date_time.substring(date_time.indexOf('T')+1);
    return time;
  }

  this.getRondavuData = function() {  
    var _pageType = 'Details Page';
    var _prePurchase = true;
    var _pageArray = new Array();
    _pageArray.push(_pageType);
    _pageArray.push(asset.assetGuid);
    
    var _tags = new Array();

    //Add Channels
    for(var i = 0; i < asset.assetChannels.length; i++)
    {
      _pageArray.push(asset.assetChannels[i].channel.channelName);
      _tags.push(asset.assetChannels[i].channel.channelName);
    }

    // We only want to add the 'mob' tag one time
    for(var i = 0; i < asset.assetMediaTypes.length; i++) {
      var mediaType = asset.assetMediaTypes[i].mediaType.mediaTypeName.toLowerCase();

      if (mediaType == 'obstacle' || mediaType == 'costume' || 
        mediaType == 'ragnar' || mediaType == 'adventure race' || 
        mediaType == 'beer' || mediaType == 'mud') {
        _pageArray.push('mob'); _tags.push('mob'); break;
      }
    }

    // Add MediaTypes
    for(var i = 0; i < asset.assetMediaTypes.length; i++)
    {
      var mediaType = asset.assetMediaTypes[i].mediaType.mediaTypeName.toLowerCase();
      if(mediaType == 'event' || mediaType == 'tournament' || mediaType == 'league' || mediaType == 'class' || mediaType == 'camp' || mediaType == 'membership' || mediaType == 'conference') {
        _pageArray.push(mediaType); _tags.push(mediaType);
      } else if (mediaType == 'training program') {
        _pageArray.push('training_program'); _tags.push('training_program');
      } else if (mediaType == 'obstacle') {
        _pageArray.push('obstacle'); _tags.push('obstacle');
      } else if (mediaType == 'costume') {
        _pageArray.push('costume'); _tags.push('costume');
      } else if (mediaType == 'ragnar') {
        _pageArray.push('ragnar'); _tags.push('ragnar');
      } else if (mediaType == 'adventure race') {
        _pageArray.push('adventure race'); _tags.push('adventure race');
      } else if (mediaType == 'beer') {
        _pageArray.push('beer'); _tags.push('beer');
      } else if (mediaType == 'mud') {
        _pageArray.push('mud'); _tags.push('mud');
      } 
    }

    //Add submedia types, has to be in different loop because of the order
    for(var i = 0; i < asset.assetMediaTypes.length; i++)
    {
      var mediaType = asset.assetMediaTypes[i].mediaType.mediaTypeName.toLowerCase();
      var subMediaType = mediaType.split('\\');
      if(subMediaType.length > 1 && subMediaType[1] != '') {
        _pageArray.push(mediaType.split('\\')[1]);
        _tags.push(mediaType.split('\\')[1]);
      }
    }

    _pageArray.push(asset.assetName);
    _tags.push(asset.assetName);
    
    var startDate = this.parseDateFromAsset(asset.activityStartDate);
    var startTime = this.parseTimeFromAsset(asset.activityStartDate);  

    var endDate = startDate; var endTime = startTime;
    if (asset.activityEndDate != '') {
      endDate = this.parseDateFromAsset(asset.activityEndDate);
      endTime = this.parseTimeFromAsset(asset.activityEndDate);
    }
    
    var _mediaType = 'event';
    // if(asset.assetMediaTypes.length > 0)
    //   _mediaType = asset.assetMediaTypes[0].mediaType.mediaTypeName.toLowerCase();
    
    var _eventLogo = "http://www.active.com/assets/images/FB_image.jpg";
    if(asset.logoUrlAdr && asset.logoUrlAdr != '' && asset.logoUrlAdr != 'http://www.active.com/images/events/hotrace.gif' && (/^https?:\/\//.test(asset.logoUrlAdr)))
      _eventLogo = asset.logoUrlAdr;

    var _detailsUrl = $("[rel='canonical']").attr('href');
    
    var dma = '';
    if (typeof(asset.place.dma) != 'undefined')
      dma = (asset.place.dma.dmaName || '').toLowerCase();

    var rondavuData = {
      config: {
        version: "1.2"
      },
      page: {
        disable: false,
        is_homepage: false,
        language: "en-US",
        tags: _pageArray
        // shopping_cart: {
        //   is_shopping_cart: false, 
        //   pre_purchase: true
        // }
      },    
      primary_mo: {
        id: [{
          id: asset.assetGuid,//_eventDetails.assetId,
          type: _mediaType        
        }],
        name: [{name: asset.assetName}],
        primary_tag: 'event_' + asset.assetGuid,//_eventDetails.assetId,
        tags: _tags,
        location: {
          name: asset.assetName,
          address_line1: asset.place.addressLine1Txt,
          city:  asset.place.cityName,
          state: asset.place.stateProvinceCode,
          country: asset.place.countryName,
          postal_code: asset.place.postalCode,
          latitude: asset.place.latitude,
          longitude: asset.place.longitude
        },
        product_date: [{
          start: {
            date : startDate,
            time: startTime,
            timezone: 'local'
          },
          end: {
            date: endDate,
            time: endTime,
            timezone: 'local'
          }
        }],
        url: { 
          detail: _detailsUrl,
          picture: {primary: _eventLogo}
        },      
        facebook: {
          create_event: false
        },
        marketing_area: [dma]     
      } 
    };  
    
    if(ausId) {
      rondavuData.user = {
        id: [
          {
            id: ausId,
            type: "Active.com"
          }
        ]
      }
    }
    return rondavuData;
  }

}
