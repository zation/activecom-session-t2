(function(window,document,undefined){
"use strict";

  ACTIVE.ui.referrer = function(){
    
    var setHistoryArray = function(h){
      return ACTIVE.ui.adParams.historyArr = h;
    };
    
    return {
      paths: window.location.pathname,
      history: document.referrer,
      location: window.location,
      historyArr: [],
      currentArr: [],
      locationRegExp: /.*-[a-zA-Z]{2}$/,
      parseCurrent: function(){
        var currentArr = this.location.href.split('/').slice(3).join('/');
        if( currentArr.indexOf('?')>-1 )          currentArr = currentArr.split('?')[0].split('/');
        else if( currentArr.indexOf('#')>-1 )     currentArr = currentArr.split('#')[0].split('/');
        else                                      currentArr = currentArr.split('/');
        this.currentArr = ACTIVE.ui.adParams.currentArr = currentArr;
      },
      
      parseHistory: function(){
        // added to pre check for guide lpf prior to article history check
        // if( ACTIVE.ui.controller_name == 'guides' ) return this.getGuideControllerView();
        var historyArr;
        historyArr = this.history.split('/').slice(3).join('/');
        if( historyArr.indexOf('?')>-1 ) historyArr = historyArr.split('?')[0].split('/');
        else if( historyArr.indexOf('#')>-1 ) historyArr = historyArr.split('#')[0].split('/');
        else historyArr = historyArr.split('/');
        this.historyArr = historyArr;
        setHistoryArray( historyArr );
        //ACTIVE.ui.adParams.historyArr = historyArr;
        
      },
      // public init
      init: function(){
        this.parseHistory();
        var historyArr = this.historyArr;
        
        // added to pre check for guide lpf prior to article history check
        if( ACTIVE.ui.controller_name == 'guides' ) return this.getGuideControllerView();

        // is geo
        if( historyArr[0].match(this.locationRegExp) ){
          return this.getGeoView();
        }
        

        // is guide page or lpf
        if( historyArr.length > 0 ){
          // check guides independently to break processing this method
          for( var i=0, m=historyArr.length; i<m; i++ ){
            if( historyArr[i].indexOf('-training')>-1 || historyArr[i].indexOf('-guide')>-1 )
            {
              return this.getGuideView();
            }
          }
          // assume lpf page if it is not a guide
          return this.getLPFView();
        }        
        
      },
      
      // public return history settings
      getHistoryArray: function(){
        return ACTIVE.ui.adParams.historyArr;
      },
      
      //
      // Get geo page view by removing the location and checking the remaining path
      getGeoView: function(){
        
        //added view for all landing pages
        if( ACTIVE.ui.controller_name == 'landing_page_factory' ) return this.getPageView();

        var lpfPath = this.lpfRoutes[this.historyArr.slice(1).join('/')] || null;
        if( !!lpfPath ){
          ACTIVE.ui.adParams.view = lpfPath.subchannel != 'nosubchannel' ? lpfPath.subchannel : lpfPath.channel;
        }
        // if no path match assume path not logged in object fallback
        else{
          return this.getPageView();
        }
      },
      
      getGuideView: function(){
        //added view for all landing pages
        if( ACTIVE.ui.controller_name == 'landing_page_factory' ) return this.getPageView();

        for( var i=0; i<this.guideMapping.length; i++ ){
          if( this.guideMapping[i].url == this.historyArr.join('/') ){
            return ACTIVE.ui.adParams.view = this.guideMapping[i].view;
          }
        }
        if( !ACTIVE.ui.adParams.view ) return this.getPageView();
      },
      
      getLPFView: function(){
        // added view for all landing pages
        if( ACTIVE.ui.controller_name == 'landing_page_factory' ) return this.getPageView();
        
        // check lpf paths set view value, this is for article pages that come from lpf pages
        var lpfPath = this.lpfRoutes[this.historyArr[0]+(this.historyArr.length>1 ? '/'+this.historyArr[1] : '')] || null; 
        
        if( !!lpfPath ){
          ACTIVE.ui.adParams.view = lpfPath.subchannel != 'nosubchannel' ? lpfPath.subchannel : lpfPath.channel;
        }
        // if no path match assume this is not from an lpf page
        else{
          return this.getPageView();
        }
      },
      
      getGuideControllerView: function(){
        this.parseCurrent();
        var currentArr = ACTIVE.ui.adParams.currentArr;
        for( var i=0, m=currentArr.length; i<m; i++ ){
          if( currentArr[i].indexOf('-training')>-1 ) currentArr[i] = currentArr[i].replace('-training','');
          if( currentArr[i].indexOf('-guide')>-1 ) currentArr[i] = currentArr[i].replace('-guide','');
        }
        return ACTIVE.ui.adParams.view = (currentArr.length>0) ? currentArr.pop() : currentArr[0];
      },
      
      getPageView: function(){
        this.parseCurrent();
        var urlSubTopic;
        
        switch( ACTIVE.ui.controller_name ){
        case 'articles':
          var urlSegments = ( this.currentArr[0].match(this.locationRegExp) ||  this.currentArr[0]=='a3_articles' ) ? this.currentArr.splice(1) : this.currentArr;

          // accourding to seo url rules if the segments contains more than one value the subtopic should be the first value
          // if( urlSegments.length > 1 ) urlSubTopic = urlSegments[0];

          // if the url subtopic value is still undefined check the asset topics
          if( !urlSubTopic ){
            // checking asset topics
            if( ACTIVE.ui.adParams.assetTopics.length == 0 ){
              if( typeof console.warn !== 'undefined' ) console.warn( 'No taxonomy found, can not proceed!' );
              urlSubTopic = 'na';
            }
             
            if( ACTIVE.ui.adParams.assetTopics.length >= 1 ){
              var taxonomy = ACTIVE.ui.adParams.assetTopics[0].topic.topicTaxonomy.split('/');
              urlSubTopic = ( taxonomy.length>2 ) ? taxonomy[2].toLowerCase().replace(' ', '-') : ( taxonomy.length>2 ) ? taxonomy[1].toLowerCase().replace(' ', '-') : taxonomy[0].toLowerCase().replace(' ', '-');
            }
            
          }
          break;
        case 'landing_page_factory':
          var urlSegments = ( this.currentArr[0].match(this.locationRegExp) ||  this.currentArr[0]=='a3_articles' ) ? this.currentArr.splice(1) : this.currentArr;
          var lpfPath = this.lpfRoutes[urlSegments.join('/')] || null;
          
          // check if lpf path exists and return channel or subchannel
          if( !!lpfPath ){
            urlSubTopic = lpfPath.subchannel != 'nosubchannel' ? lpfPath.subchannel : lpfPath.channel;
          }else{
            urlSubTopic = 'na';
          }
          break;
        }
        
        // set view
        ACTIVE.ui.adParams.view = urlSubTopic || 'na';
      },
      guideMapping: [
        { url: "cycling/bike-racing-guide", channel: "cycling", subchannel: "bike-racing", view: "bike-racing" },
        { url: "running/5k/5k-training-guide", channel: "running", subchannel: "5k", view: "5k" },
        { url: "running/10k/10k-training-guide", channel: "running", subchannel: "10k", view: "10k" },
        { url: "running/half-marathon/training-guide", channel: "running", subchannel: "half-marathon", view: "half-marathon" },
        { url: "running/marathon/training-guide", channel: "running", subchannel: "marathon", view: "marathon" },
        { url: "running/trail-running-guide", channel: "running", subchannel: "trail-running", view: "trail-running" },
        { url: "triathlon/beginner-triathlon-guide", channel: "triathlon", subchannel: "beginners", view: "beginners" },
        { url: "active-family-guide", channel: "active-family", subchannel: "nosubchannel", view: "active-family" },
        { url: "active-women-guide", channel: "women", subchannel: "nosubchannel", view: "women" },
        { url: "nutrition", channel: "nutrition", subchannel: "nosubchannel", view: "nutrition" },
        { url: "nutrition/sports-nutrition-guide", channel: "nutrition", subchannel: "sports-nutrition", view: "sports-nutrition" },
        { url: "gear-guide", channel: "gear", subchannel: "nosubchannel", view: "gear" },
        { url: "yoga/yoga-guide", channel: "yoga", subchannel: "nosubchannel", view: "yoga" },
        { url: "running/mud-run-guide", channel: "running", subchannel: "mud-runs", view: "mud-runs" },
        { url: "triathlon/ironman-training-guide", channel: "triathlon", subchannel: "ironman", view: "ironman" },
        { url: "running/couch-to-5k-guide", channel: "running", subchannel: "couch-to-5k", view: "couch-to-5k" },
        { url: "triathlon/olympic-training-guide", channel: "triathlon", subchannel: "olympic", view: "olympic" },
        { url: "triathlon/sprint/sprint-training-guide", channel: "triathlon", subchannel: "sprint", view: "sprint" },
        { url: "outdoors/camping/camping-guide", channel: "outdoors", subchannel: "camping", view: "camping" },
        { url: "outdoors/hiking/hiking-guide", channel: "outdoors", subchannel: "hiking", view: "hiking" },
        { url: "fitness/strength-training-guide", channel: "fitness", subchannel: "strength-training", view: "strength-training" },
        { url: "fitness/hot-weather-running-guide", channel: "running", subchannel: "hot-weather-running", view: "hot-weather-running" },
        { url: "nutrition/hydration-guide", channel: "nutrition", subchannel: "hydration", view: "hydration" },
        { url: "fitness/injury-prevention-guide", channel: "fitness", subchannel: "injury-prevention", view: "injury-prevention" },
        { url: "active-pet-guide", channel: "active-pet", subchannel: "nosubchannel", view: "active-pet" }

      ],
      lpfRoutes: {"fitness/active-pets":{"subchannel":"active-pet","channel":"fitness","feature":"content","view":"active-pet"},
                  "fitness/active-pets/articles":{"subchannel":"active-pet","channel":"fitness","feature":"content","view":"active-pet"},
                  "adventure-racing/beginner":{"subchannel":"beginner","channel":"adventure-racing","feature":"content"},
                  "adventure-racing/intermediate":{"subchannel":"intermediate","channel":"adventure-racing","feature":"content"},
                  "adventure-racing/advanced":{"subchannel":"advanced","channel":"adventure-racing","feature":"content"},
                  "adventure-racing/elite":{"subchannel":"elite","channel":"adventure-racing","feature":"content"},
                  "adventure-racing":{"subchannel":"nosubchannel","channel":"adventure-racing","feature":"content"},
                  "running/15k":{"subchannel":"15k","channel":"running","feature":"content"},
                  "running/1-mile":{"subchannel":"1-mile","channel":"running","feature":"content"},
                  "fitness/mind-and-body":{"subchannel":"mind-and-body","channel":"fitness","feature":"content"},
                  "fitness/injury-prevention":{"subchannel":"injury-prevention","channel":"fitness","feature":"content"},
                  "fitness":{"subchannel":"nosubchannel","channel":"fitness","feature":"content"},
                  "walking":{"subchannel":"nosubchannel","channel":"walking","feature":"content"},
                  "running/mothers-day-runs":{"subchannel":"mothers-day-run","channel":"running","feature":"content"},
                  "running/adventure-racing":{"subchannel":"adventure-racing","channel":"running","feature":"content"},
                  "running/10k":{"subchannel":"10k","channel":"running","feature":"content"},
                  "skiing":{"subchannel":"nosubchannel","channel":"skiing","feature":"content"},
                  "basketball":{"subchannel":"nosubchannel","channel":"basketball","feature":"content"},
                  "cycling":{"subchannel":"nosubchannel","channel":"cycling","feature":"content"},
                  "table-tennis":{"subchannel":"nosubchannel","channel":"table-tennis","feature":"content"},
                  "nutrition/sports-nutrition":{"subchannel":"sports-nutrition","channel":"nutrition","feature":"content"},
                  "triathlon/beginner":{"subchannel":"beginner","channel":"triathlon","feature":"content"},
                  "hockey":{"subchannel":"nosubchannel","channel":"hockey","feature":"content"},
                  "running/marathon":{"subchannel":"marathon","channel":"running","feature":"content"},
                  "cycling/cyclo-cross":{"subchannel":"cyclo-cross","channel":"cycling","feature":"content"},
                  "walking/races":{"subchannel":"races","channel":"walking","feature":"content"},
                  "nutrition":{"subchannel":"nosubchannel","channel":"nutrition","feature":"content"},
                  "gear":{"subchannel":"nosubchannel","channel":"gear","feature":"content"},
                  "golf":{"subchannel":"nosubchannel","channel":"golf","feature":"content"},
                  "cycling/half-century":{"subchannel":"half-century","channel":"cycling","feature":"content"},
                  "tennis":{"subchannel":"nosubchannel","channel":"tennis","feature":"content"},
                  "running/relay-running":{"subchannel":"relay-running","channel":"running","feature":"content"},
                  "cheerleading":{"subchannel":"nosubchannel","channel":"cheerleading","feature":"content"},
                  "running/fourth-of-july":{"subchannel":"fourth-of-july","channel":"running","feature":"content"},
                  "women":{"subchannel":"nosubchannel","channel":"women","feature":"content"},
                  "soccer":{"subchannel":"nosubchannel","channel":"soccer","feature":"content"},
                  "nutrition/hydration":{"subchannel":"hydration","channel":"nutrition","feature":"content"},
                  "running/mud-run":{"subchannel":"mud-runs","channel":"running","feature":"content"},
                  "active-women":{"subchannel":"nosubchannel","channel":"women","feature":"content"},
                  "duathlon":{"subchannel":"nosubchannel","channel":"duathlon","feature":"content"},
                  "cycling/cross-country-cycling":{"subchannel":"cross-country-cycling","channel":"cycling","feature":"content"},
                  "cycling/road-cycling":{"subchannel":"road-cycling","channel":"cycling","feature":"content"},
                  "running/half-marathon":{"subchannel":"half-marathon","channel":"running","feature":"content"},
                  "outdoors":{"subchannel":"nosubchannel","channel":"outdoors","feature":"content"},
                  "outdoors/camping":{"subchannel":"camping","channel":"outdoors","feature":"content"},
                  "outdoors/fishing":{"subchannel":"fishing","channel":"outdoors","feature":"content"},
                  "outdoors/hiking":{"subchannel":"hiking","channel":"outdoors","feature":"content"},
                  "outdoors/hunting":{"subchannel":"hunting","channel":"outdoors","feature":"content"},
                  "outdoors/orienteering":{"subchannel":"orienteering","channel":"outdoors","feature":"content"},
                  "outdoors/other-outdoors":{"subchannel":"other-outdoors","channel":"outdoors","feature":"content"},
                  "outdoors/outdoor-survival":{"subchannel":"outdoor-survival","channel":"outdoors","feature":"content"},
                  "outdoors/skydiving":{"subchannel":"skydiving","channel":"outdoors","feature":"content"},
                  "cycling/mountain-biking":{"subchannel":"mountain-biking","channel":"cycling","feature":"content"},
                  "running/track-running":{"subchannel":"track-running","channel":"running","feature":"content"},
                  "active-family":{"subchannel":"nosubchannel","channel":"active-family","feature":"content"},
                  "cycling/century":{"subchannel":"century","channel":"cycling","feature":"content"},
                  "running/ultra":{"subchannel":"ultra","channel":"running","feature":"content"},
                  "cycling/bike-racing":{"subchannel":"bike-racing","channel":"cycling","feature":"content"},
                  "cycling/metric-century":{"subchannel":"metric-century","channel":"cycling","feature":"content"},
                  "gymnastics":{"subchannel":"nosubchannel","channel":"gymnastics","feature":"content"},
                  "athletes_with_disabilities":{"subchannel":"nosubchannel","channel":"athletes_with_disabilities","feature":"content"},
                  "skateboarding":{"subchannel":"nosubchannel","channel":"skateboarding","feature":"content"},
                  "triathlon/half-ironman":{"subchannel":"half-ironman","channel":"triathlon","feature":"content"},
                  "running/mud-running":{"subchannel":"mud-running","channel":"running","feature":"content"},
                  "nutrition/sports-nutrition-recovery":{"subchannel":"sports-nutrition-recovery","channel":"nutrition","feature":"content"},
                  "running/1k":{"subchannel":"1k","channel":"running","feature":"content"},
                  "pilates":{"subchannel":"nosubchannel","channel":"pilates","feature":"content"},
                  "yoga":{"subchannel":"nosubchannel","channel":"yoga","feature":"content"},
                  "travel":{"subchannel":"nosubchannel","channel":"travel","feature":"content"},
                  "running/holiday-runs":{"subchannel":"holiday-runs","channel":"running","feature":"content"},
                  "running/25-mile":{"subchannel":"25-mile","channel":"running","feature":"content"},
                  "running/5k":{"subchannel":"5k","channel":"running","feature":"content"},
                  "yoga/yoga":{"subchannel":"nosubchannel","channel":"yoga","feature":"content"},
                  "sweepstakes":{"subchannel":"nosubchannel","channel":"sweepstakes","feature":"content"},
                  "running/distance-running":{"subchannel":"distance-running","channel":"running","feature":"content"},
                  "outdoors/winter-sports-guide":{"subchannel":"winter-sports-guide","channel":"outdoors","feature":"content"},
                  "running/couch-to-5k":{"subchannel":"couch-to-5k","channel":"running","feature":"content"},
                  "triathlon/ironman":{"subchannel":"ironman","channel":"triathlon","feature":"content"},
                  "football":{"subchannel":"nosubchannel","channel":"football","feature":"content"},
                  "triathlon":{"subchannel":"nosubchannel","channel":"triathlon","feature":"content"},
                  "running":{"subchannel":"nosubchannel","channel":"running","feature":"content"},
                  "cycling/criterium":{"subchannel":"criterium","channel":"cycling","feature":"content"},
                  "baseball":{"subchannel":"nosubchannel","channel":"baseball","feature":"content"},
                  "running/st-patricks-day":{"subchannel":"st-patricks-day","channel":"running","feature":"content"},
                  "running/resolution-runs":{"subchannel":"resolution-runs","channel":"running","feature":"content"},
                  "softball":{"subchannel":"nosubchannel","channel":"softball","feature":"content"},
                  "cycling/spinning":{"subchannel":"spinning","channel":"cycling","feature":"content"},
                  "running/turkeytrot":{"subchannel":"turkeytrot","channel":"running","feature":"content"},
                  "running/hot-weather-running":{"subchannel":"hot-weather-running","channel":"running","feature":"content"},
                  "lacrosse":{"subchannel":"nosubchannel","channel":"lacrosse","feature":"content"},
                  "running/trail-running":{"subchannel":"trail-running","channel":"running","feature":"content"},
                  "fitness/strength-training":{"subchannel":"strength-training","channel":"fitness","feature":"content"},
                  "surfing":{"subchannel":"nosubchannel","channel":"surfing","feature":"content"},
                  "volleyball":{"subchannel":"nosubchannel","channel":"volleyball","feature":"content"},
                  "running/5-mile":{"subchannel":"5-mile","channel":"running","feature":"content"},
                  "running/8k":{"subchannel":"8k","channel":"running","feature":"content"},
                  "running/cross-country-running":{"subchannel":"cross-country-running","channel":"running","feature":"content"},
                  "camps":{"subchannel":"nosubchannel","channel":"camps","feature":"content"},
                  "running/valentines-day":{"subchannel":"valentines-day","channel":"running","feature":"content"},
                  "swimming":{"subchannel":"nosubchannel","channel":"swimming","feature":"content"},
                  // added to support target pages for preexisting pages before mr cms
                  "active-pet-guide/articles":{"subchannel":"nosubchannel","channel":"active-pet","feature":"contnet"},
                  "adventure-racing/beginner/articles":{"subchannel":"beginner","channel":"adventure-racing","feature":"content"},
                  "adventure-racing/intermediate/articles":{"subchannel":"intermediate","channel":"adventure-racing","feature":"content"},
                  "adventure-racing/advanced/articles":{"subchannel":"advanced","channel":"adventure-racing","feature":"content"},
                  "adventure-racing/elite/articles":{"subchannel":"elite","channel":"adventure-racing","feature":"content"},
                  "adventure-racing/articles":{"subchannel":"nosubchannel","channel":"adventure-racing","feature":"content"},
                  "running/15k/articles":{"subchannel":"15k","channel":"running","feature":"content"},
                  "running/1-mile/articles":{"subchannel":"1-mile","channel":"running","feature":"content"},
                  "fitness/mind-and-body/articles":{"subchannel":"mind-and-body","channel":"fitness","feature":"content"},
                  "fitness/injury-prevention/articles":{"subchannel":"injury-prevention","channel":"fitness","feature":"content"},
                  "fitness/articles":{"subchannel":"nosubchannel","channel":"fitness","feature":"content"},
                  "walking/articles":{"subchannel":"nosubchannel","channel":"walking","feature":"content"},
                  "running/mothers-day-runs/articles":{"subchannel":"mothers-day-run","channel":"running","feature":"content"},
                  "running/adventure-racing/articles":{"subchannel":"adventure-racing","channel":"running","feature":"content"},
                  "running/10k/articles":{"subchannel":"10k","channel":"running","feature":"content"},
                  "skiing/articles":{"subchannel":"nosubchannel","channel":"skiing","feature":"content"},
                  "basketball/articles":{"subchannel":"nosubchannel","channel":"basketball","feature":"content"},
                  "cycling/articles":{"subchannel":"nosubchannel","channel":"cycling","feature":"content"},
                  "table-tennis/articles":{"subchannel":"nosubchannel","channel":"table-tennis","feature":"content"},
                  "nutrition/sports-nutrition/articles":{"subchannel":"sports-nutrition","channel":"nutrition","feature":"content"},
                  "triathlon/beginner/articles":{"subchannel":"beginner","channel":"triathlon","feature":"content"},
                  "hockey/articles":{"subchannel":"nosubchannel","channel":"hockey","feature":"content"},
                  "running/marathon/articles":{"subchannel":"marathon","channel":"running","feature":"content"},
                  "cycling/cyclo-cross/articles":{"subchannel":"cyclo-cross","channel":"cycling","feature":"content"},
                  "walking/races/articles":{"subchannel":"races","channel":"walking","feature":"content"},
                  "nutrition/articles":{"subchannel":"nosubchannel","channel":"nutrition","feature":"content"},
                  "gear/articles":{"subchannel":"nosubchannel","channel":"gear","feature":"content"},
                  "golf/articles":{"subchannel":"nosubchannel","channel":"golf","feature":"content"},
                  "cycling/half-century/articles":{"subchannel":"half-century","channel":"cycling","feature":"content"},
                  "tennis/articles":{"subchannel":"nosubchannel","channel":"tennis","feature":"content"},
                  "running/relay-running/articles":{"subchannel":"relay-running","channel":"running","feature":"content"},
                  "cheerleading/articles":{"subchannel":"nosubchannel","channel":"cheerleading","feature":"content"},
                  "running/fourth-of-july/articles":{"subchannel":"fourth-of-july","channel":"running","feature":"content"},
                  "women/articles":{"subchannel":"nosubchannel","channel":"women","feature":"content"},
                  "soccer/articles":{"subchannel":"nosubchannel","channel":"soccer","feature":"content"},
                  "nutrition/hydration/articles":{"subchannel":"hydration","channel":"nutrition","feature":"content"},
                  "running/mud-run/articles":{"subchannel":"mud-runs","channel":"running","feature":"content"},
                  "active-women/articles":{"subchannel":"nosubchannel","channel":"women","feature":"content"},
                  "duathlon/articles":{"subchannel":"nosubchannel","channel":"duathlon","feature":"content"},
                  "cycling/cross-country-cycling/articles":{"subchannel":"cross-country-cycling","channel":"cycling","feature":"content"},
                  "cycling/road-cycling/articles":{"subchannel":"road-cycling","channel":"cycling","feature":"content"},
                  "running/half-marathon/articles":{"subchannel":"half-marathon","channel":"running","feature":"content"},
                  "outdoors/articles":{"subchannel":"nosubchannel","channel":"outdoors","feature":"content"},
                  "outdoors/camping/articles":{"subchannel":"camping","channel":"outdoors","feature":"content"},
                  "outdoors/fishing/articles":{"subchannel":"fishing","channel":"outdoors","feature":"content"},
                  "outdoors/hiking/articles":{"subchannel":"hiking","channel":"outdoors","feature":"content"},
                  "outdoors/hunting/articles":{"subchannel":"hunting","channel":"outdoors","feature":"content"},
                  "outdoors/orienteering/articles":{"subchannel":"orienteering","channel":"outdoors","feature":"content"},
                  "outdoors/other-outdoors/articles":{"subchannel":"other-outdoors","channel":"outdoors","feature":"content"},
                  "outdoors/outdoor-survival/articles":{"subchannel":"outdoor-survival","channel":"outdoors","feature":"content"},
                  "outdoors/skydiving/articles":{"subchannel":"skydiving","channel":"outdoors","feature":"content"},
                  "cycling/mountain-biking/articles":{"subchannel":"mountain-biking","channel":"cycling","feature":"content"},
                  "running/track-running/articles":{"subchannel":"track-running","channel":"running","feature":"content"},
                  "active-family/articles":{"subchannel":"nosubchannel","channel":"active-family","feature":"content"},
                  "cycling/century/articles":{"subchannel":"century","channel":"cycling","feature":"content"},
                  "running/ultra/articles":{"subchannel":"ultra","channel":"running","feature":"content"},
                  "cycling/bike-racing/articles":{"subchannel":"bike-racing","channel":"cycling","feature":"content"},
                  "cycling/metric-century/articles":{"subchannel":"metric-century","channel":"cycling","feature":"content"},
                  "gymnastics/articles":{"subchannel":"nosubchannel","channel":"gymnastics","feature":"content"},
                  "athletes_with_disabilities/articles":{"subchannel":"nosubchannel","channel":"athletes_with_disabilities","feature":"content"},
                  "skateboarding/articles":{"subchannel":"nosubchannel","channel":"skateboarding","feature":"content"},
                  "triathlon/half-ironman/articles":{"subchannel":"half-ironman","channel":"triathlon","feature":"content"},
                  "running/mud-running/articles":{"subchannel":"mud-running","channel":"running","feature":"content"},
                  "nutrition/sports-nutrition-recovery/articles":{"subchannel":"sports-nutrition-recovery","channel":"nutrition","feature":"content"},
                  "running/1k/articles":{"subchannel":"1k","channel":"running","feature":"content"},
                  "pilates/articles":{"subchannel":"nosubchannel","channel":"pilates","feature":"content"},
                  "yoga/articles":{"subchannel":"nosubchannel","channel":"yoga","feature":"content"},
                  "travel/articles":{"subchannel":"nosubchannel","channel":"travel","feature":"content"},
                  "running/holiday-runs/articles":{"subchannel":"holiday-runs","channel":"running","feature":"content"},
                  "running/25-mile/articles":{"subchannel":"25-mile","channel":"running","feature":"content"},
                  "running/5k/articles":{"subchannel":"5k","channel":"running","feature":"content"},
                  "yoga/yoga/articles":{"subchannel":"nosubchannel","channel":"yoga","feature":"content"},
                  "sweepstakes/articles":{"subchannel":"nosubchannel","channel":"sweepstakes","feature":"content"},
                  "running/distance-running/articles":{"subchannel":"distance-running","channel":"running","feature":"content"},
                  "outdoors/winter-sports-guide/articles":{"subchannel":"winter-sports-guide","channel":"outdoors","feature":"content"},
                  "running/couch-to-5k/articles":{"subchannel":"couch-to-5k","channel":"running","feature":"content"},
                  "triathlon/ironman/articles":{"subchannel":"ironman","channel":"triathlon","feature":"content"},
                  "football/articles":{"subchannel":"nosubchannel","channel":"football","feature":"content"},
                  "triathlon/articles":{"subchannel":"nosubchannel","channel":"triathlon","feature":"content"},
                  "running/articles":{"subchannel":"nosubchannel","channel":"running","feature":"content"},
                  "cycling/criterium/articles":{"subchannel":"criterium","channel":"cycling","feature":"content"},
                  "baseball/articles":{"subchannel":"nosubchannel","channel":"baseball","feature":"content"},
                  "running/st-patricks-day/articles":{"subchannel":"st-patricks-day","channel":"running","feature":"content"},
                  "running/resolution-runs/articles":{"subchannel":"resolution-runs","channel":"running","feature":"content"},
                  "softball/articles":{"subchannel":"nosubchannel","channel":"softball","feature":"content"},
                  "cycling/spinning/articles":{"subchannel":"spinning","channel":"cycling","feature":"content"},
                  "running/turkeytrot/articles":{"subchannel":"turkeytrot","channel":"running","feature":"content"},
                  "running/hot-weather-running/articles":{"subchannel":"hot-weather-running","channel":"running","feature":"content"},
                  "lacrosse/articles":{"subchannel":"nosubchannel","channel":"lacrosse","feature":"content"},
                  "running/trail-running/articles":{"subchannel":"trail-running","channel":"running","feature":"content"},
                  "fitness/strength-training/articles":{"subchannel":"strength-training","channel":"fitness","feature":"content"},
                  "surfing/articles":{"subchannel":"nosubchannel","channel":"surfing","feature":"content"},
                  "volleyball/articles":{"subchannel":"nosubchannel","channel":"volleyball","feature":"content"},
                  "running/5-mile/articles":{"subchannel":"5-mile","channel":"running","feature":"content"},
                  "running/8k/articles":{"subchannel":"8k","channel":"running","feature":"content"},
                  "running/cross-country-running/articles":{"subchannel":"cross-country-running","channel":"running","feature":"content"},
                  "camps/articles":{"subchannel":"nosubchannel","channel":"camps","feature":"content"},
                  "running/valentines-day/articles":{"subchannel":"valentines-day","channel":"running","feature":"content"},
                  "swimming/articles":{"subchannel":"nosubchannel","channel":"swimming","feature":"content"}}
    }
  }
}(window,document,undefined));
