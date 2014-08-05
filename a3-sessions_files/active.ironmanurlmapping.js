(function(window,document,undefined){
"use strict";

  ACTIVE.ui.ironmanURLMapping = function(){
    return {
      paths: window.location.pathname,
      history: document.referrer,
      location: window.location,
      currentArr: [],
      ironmanMapping: [
        { url: "triathlon/ironman", channel: "triathlon", subchannel: "ironman", view: "ironman" },
        { url: "triathlon/ironman-race", channel: "triathlon", subchannel: "ironman", view: "ironman" },
        { url: "triathlon/ironman-kona", channel: "triathlon", subchannel: "ironman", view: "ironman" }],

      
      parseCurrent: function(){
        var currentArr = this.location.href.split('/').slice(3).join('/');
        if( currentArr.indexOf('?')>-1 )          currentArr = currentArr.split('?')[0].split('/');
        else if( currentArr.indexOf('#')>-1 )     currentArr = currentArr.split('#')[0].split('/');
        else                                      currentArr = currentArr.split('/');
        this.currentArr = ACTIVE.ui.adParams.currentArr = currentArr;
      },
      
      mapIronmanPage: function(){
        this.parseCurrent();
        var currentArr =  this.currentArr.join('/');
        for( var i=0, l=this.ironmanMapping.length; i<l; i++ ){
          if( this.ironmanMapping[i].url == currentArr ){
            ACTIVE.ui.adParams.channel = this.ironmanMapping[i].channel;
            ACTIVE.ui.adParams.subchannel = this.ironmanMapping[i].subchannel;
            ACTIVE.ui.adParams.view = this.ironmanMapping[i].view;
          }
        }
        return true;
      }
    }
  }

}(window,document,undefined));
