(function(window,document,undefined){
"use strict";

  ACTIVE.ui.guidesURLMapping = function(){
    return {
      paths: window.location.pathname,
      history: document.referrer,
      location: window.location,
      currentArr: [],
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
        { url: "running/hot-weather-running-guide", channel: "running", subchannel: "hot-weather-running", view: "hot-weather-running" },
        { url: "nutrition/hydration-guide", channel: "nutrition", subchannel: "hydration", view: "hydration" },
        { url: "fitness/injury-prevention-guide", channel: "fitness", subchannel: "injury-prevention", view: "injury-prevention" },
        { url: "active-pet-guide", channel: "active-pet", subchannel: "nosubchannel", view: "active-pet" }
      ],
      
      parseCurrent: function(){
        var currentArr = this.location.href.split('/').slice(3).join('/');
        if( currentArr.indexOf('?')>-1 )          currentArr = currentArr.split('?')[0].split('/');
        else if( currentArr.indexOf('#')>-1 )     currentArr = currentArr.split('#')[0].split('/');
        else                                      currentArr = currentArr.split('/');
        this.currentArr = ACTIVE.ui.adParams.currentArr = currentArr;
      },
      
      mapGuidePage: function(){
        this.parseCurrent();
        var currentArr =  this.currentArr.join('/');
        for( var i=0, l=this.guideMapping.length; i<l; i++ ){
          if( this.guideMapping[i].url == currentArr ){
            ACTIVE.ui.adParams.channel = this.guideMapping[i].channel;
            ACTIVE.ui.adParams.subchannel = this.guideMapping[i].subchannel;
            ACTIVE.ui.adParams.view = this.guideMapping[i].view;
          }
        }
        return true;
      }
    }
  }

}(window,document,undefined));
