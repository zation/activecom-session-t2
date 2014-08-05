(function(window,document,undefined){
  "use strict";
  
  ACTIVE.ui.seoUrlMapping = function(){
    return {
      paths: window.location.pathname,
      history: document.referrer,
      location: window.location,
      historyArr: [],
      currentArr: [],
      isGeo: false,
      locationRegExp: /.*-[a-zA-Z]{2}$/,
      subTopicsFilter: /swimming|cycling|triathlon|running|triathlon|outdoors|fitness|nutrition|adventure-racing|golf|sports|active-pet/i,
      parseHistory: function(){
        var historyArr;
        
        // parse referrer
        historyArr = this.history.split('/').slice(3).join('/');
        if( historyArr.indexOf('?')>-1 ) historyArr = historyArr.split('?')[0].split('/');
        else if( historyArr.indexOf('#')>-1 ) historyArr = historyArr.split('#')[0].split('/');
        else historyArr = historyArr.split('/');
        this.historyArr = ACTIVE.ui.adParams.historyArr = historyArr;
      },
      
      parseCurrent: function(){
        var currentArr, 
            meta = document.getElementsByTagName('meta');
            
        // parse url and store result
        currentArr = this.location.href.split('/').slice(3).join('/');
        if( currentArr.indexOf('?')>-1 )          currentArr = currentArr.split('?')[0].split('/');
        else if( currentArr.indexOf('#')>-1 )     currentArr = currentArr.split('#')[0].split('/');
        else                                      currentArr = currentArr.split('/');
        this.currentArr = ACTIVE.ui.adParams.currentArr = currentArr;
        
        // parse json data and save for later
        for(var i=0, l=meta.length; i<l; i++ ){
          if( meta[i].getAttribute('name') ){
            if( meta[i].name == 'asset_topics'){
              ACTIVE.ui.adParams.assetTopics = JSON.parse(meta[i].content);
            }
            if( meta[i].name == 'asset_channels') ACTIVE.ui.adParams.assetChannels = JSON.parse(meta[i].content);
            if( meta[i].name == 'asset_categories') ACTIVE.ui.adParams.assetCategories  = JSON.parse(meta[i].content);
          }
        }
        
        // if no topics exists return        
        if( ACTIVE.ui.adParams.assetTopics.length == 0 ){
          this.subTopicsNotFoundWarning();
          return this.mapCurrentUrlChannels();
        }
        // map url
        return this.mapCurrentURL();

      },
      
      // process geo page assets
      mapCurrentURL: function(){
        
        // currentArr for segment that matches a geo page. If match is found remove geo from array, or return array
        var urlSegments     = ( this.currentArr[0].match(this.locationRegExp) ) ? this.currentArr.slice(1) : this.currentArr;

        // if array value = 1 than there is no topic set. 
        // Url structure returned active.com/asset or active.com/location/asset. Not active.com/location/running/asset or active.com/running/asset
        var urlSubTopic       = (urlSegments.length>1) ? urlSegments[0]: null,
            urlSubSubTopic    = (urlSegments.length>2) ? urlSegments[1].split('-').slice(0,-1).join('-') : null,
            assetTopics       = ACTIVE.ui.adParams.assetTopics;
            
        [].forEach.call(assetTopics, function(topic){
          var taxonomy = topic.topic.topicTaxonomy;
          var taxonomySubSubTopic = taxonomy.split('/').length >= 3 ? taxonomy.split[2] : null;
          var localSubTopic = taxonomy.split('/')[1] || null;
          if(urlSubSubTopic) {
            var localSubSubTopic = urlSubSubTopic;
          }else if(taxonomySubSubTopic){
            var localSubSubTopic = taxonomySubSubTopic;
          }else{
            var localSubSubTopic = "nosubchannel";
          }
          var self = new ACTIVE.ui.seoUrlMapping();
          
          // check topic value an make sure it passed the filter
          if( localSubTopic && localSubTopic.match(self.subTopicsFilter) ) {
            // if urlsubtopic matches the local subtopic 
            if( urlSubTopic && localSubTopic.toLowerCase().replace(' ','-') == urlSubTopic ){
              return self.setResultValues( localSubTopic, localSubSubTopic );
            }
            // non validated urls forced through for testing asset_service & a3_articles
            if( urlSubTopic == 'a3_articles' || urlSubTopic == 'asset_servive' ){
              return self.setResultValues( localSubTopic, localSubSubTopic );
            }
          }          
        });
        
        // console.log( 'filtered subtopic: ' + urlSubTopic );
        // if there is nothing found trigger filter warning and check the asset channels if there is a filtered match
        this.filterWarning();
        if( !!urlSubTopic && urlSubTopic.match(this.subTopicsFilter) ){
          return this.mapCurrentUrlChannels();
        }
        else{
          return this.setResultValues();
        }
      },
      
      // if no topic check channels
      mapCurrentUrlChannels: function(){
        // the same filtering as before to remove the geo and return the url subtopic only
        var urlSegments       = ( this.currentArr[0].match(this.locationRegExp) ) ? this.currentArr.slice(1) : this.currentArr;
        var urlSubTopic       = (urlSegments.length>1 && urlSegments[0]!="a3_articles") ? urlSegments[0]: null,
            urlSubSubTopic    = (urlSegments.length>2) ? urlSegments[1].split('-').slice(0,-1).join('-') : null,
            localChannels     = ACTIVE.ui.adParams.assetChannels;
           
        // if no channels return default
        if( localChannels.length == 0 ) return this.setResultValues();
        
        // if only 1 channel return just on channel as subchannel
        if( localChannels.length == 1 && !!urlSubTopic ) return this.setResultValues( urlSubTopic, ((!!urlSubSubTopic) ? urlSubSubTopic : localChannels[0].channel.channelName) );
        
        // if only 1 channel and no urlsubtopic
        if( localChannels.length == 1 && !urlSubTopic ) return this.setResultValues( localChannels[0].channel.channelName, ((!!urlSubSubTopic) ? urlSubSubTopic : 'nosubchannel') );
        
        // if more than one channel exists check all for a filter match, if non found return the first
        if( localChannels.length >= 2 ){
          // check url channels for filter match and return value as subchannel if it exists
          for( var i=0, l=localChannels.length; i<l; i++ ){
            var channelName = localChannels[i].channel.channelName.toLowerCase().replace(' ','-');
            if( channelName.match( this.subTopicsFilters ) ){
              return this.setResultValues( urlSubTopic, ((!!urlSubSubTopic) ? urlSubSubTopic : localChannels[0].channel.channelName) )
            }
          }
          // if the above didn't work, just retun the urlSubTopic with no subchannel
          return this.setResultValues( urlSubTopic, ((!!urlSubSubTopic) ? urlSubSubTopic : 'nosubchannel') );
        }
        
        // all else fails return nothing
        return this.setResultMap();
      },
      
      
      // set the result values for adParams
      setResultValues: function(channel, subchannel){
        ACTIVE.ui.adParams.channel = (!!channel && channel!='') ? channel.toLowerCase() : null;
        ACTIVE.ui.adParams.subchannel = (!!subchannel && subchannel!='') ? subchannel.toLowerCase() : null;
      },
      
      subTopicsNotFoundWarning: function(){
        // this.log('warn', 'No asset topics set.');
      },
      
      filterWarning: function(){
        // this.log('warn', 'The current asset does not have a valid subtopic for this filter.');
        return this.setResultValues();
      },
      
      // log
      log: function(type,msg){
        if( typeof console[type] !== undefined ){
          return Function.call( console[type](msg) );
        }
      }
    }
  }
}(window,document,undefined));
