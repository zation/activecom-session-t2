(function( c ){
  var $p = ACTIVE['powerplant'] = ACTIVE['powerplant'] = function powerplant(){};
  for( index in c ){
    if( typeof ACTIVE.powerplant[index] === 'undefined' ){
      ACTIVE.powerplant[index] = c[index];
    }
  }
  $p.modifiers();
}(function(){
  return {
    factory: function factory(type, args){
      var constr = type,
          newplant;
      if(!_.isFunction(ACTIVE.powerplant[constr])){
        if(_.isObject(ACTIVE.powerplant[constr])){
          return ACTIVE.powerplant[constr];
        }
        throw new Error( constr + " doesn't exists" );
      }else{
        ACTIVE.powerplant[constr].prototype = new ACTIVE.powerplant;
      }
      newplant = new ACTIVE.powerplant[constr](args);
      return newplant;
    },
    register: function register(_ns){
      if(!!_ns){
        var segments = _ns.split('.'), parent = ACTIVE.powerplant, i;
        if( _.isEqual([segments[0],segments[1]].join('.'),'ACTIVE.powerplant')){
          segments = segments.slice(2);
        }else if( _.isEqual(segments[0],'ACTIVE')){
          segments = segments.slice(1);
        }
        for(i=0;i<segments.length;i+=1){
          if(_.isUndefined(parent[segments[i]])) parent[segments[i]] = {};
          parent = parent[segments[i]];
        }
        return parent;
      }else{
        throw new TypeError;
      }
    },
    silo: function silo(object){
      if( $.browser.msie && parseInt($.browser.version, 10) == 8){
        return false;
      }else{
        if(_.isObject(object) && !_.isUndefined(Object.seal)){
          Object.seal(object);
          if(!_.isUndefined(Object.isExtensible) && Object.isExtensible(object)){
            Object.preventExtensions(object);
          }
        }
      }
    },
    validate_factory: function(object){
      if(!!object){
        if( _.isFunction(object.constructor) || object.constructor.name == 'powerplant' ){
          return true;
        }else{
          throw new Error("Object does not have a valid constructor");
        }
      }else{
        throw new Error("Object is required for validation");
      }
      return false;
    },
    addEvent: function(cb){
      if(_.isFunction(cb)){
        return $(function(){cb()});
      }else if(_.isObject(cb)){
        return $(function(){cb});
      }
      throw new TypeError(cb.toString() + " is not a valid Function");
    },
    abstract: function(referrer, object){
      referrer = _.extend( ACTIVE.powerplant[object], referrer );
      return referrer;
    },
    timezone: function(locale){
      var timezone = _.findWhere(ACTIVE.powerplant.timezones.result, {TimeZoneId: locale});
      return timezone;
    },
    helpers: {      
      cleanText: function(txt){
        txt = txt.replace(/\<.*?\>/,"");
        return txt;
      },

      limitText: function(txt,limit){
        if( txt.length > limit ){
          txt = txt.substring(0,limit) + "...";
        }
        return txt;
      },

      filterTimeZoneString: function(locale){
        return locale.replace(/\//,'-');
      },

      parseSearchQuery: function(){
        var a={},b,c,d,i,q=location.search.replace('?','').split('&');
        for(i=0;i<q.length;i++){
          d = q[i].split('=');
          b={},c=d.shift(),b[c]=d.pop(),a[c]=b[c];
        }
        return a;
      },

      cleanURIComponent: function(txt){
        // add filters as needed
        txt = decodeURIComponent(txt);
        txt = txt.replace(/\+/g, " ");
        return txt;
      }
    },
    modifiers: function(){
      // add event cross browser use only for adtag callbacks
      _.prototype.addEvent = function(cb){
        if(_.isFunction(cb)){
          return $(function(){cb()});
        }else if(_.isObject(cb)){
          return $(function(){cb});
        }
        throw new TypeError(cb.toString() + " is not a valid Function");
      }
      if(!_.isObject(_.addEvent)) _.addEvent = _.prototype.addEvent;

      // abstract objects properties to requester
      _.prototype.abstract = function(referrer, object){
        referrer = _.extend( ACTIVE.powerplant[object], referrer );
        return referrer;
      }
      if(!_.isObject(_.abstract)) _.abstract = _.prototype.abstract;

      // validate factory objects when called
      _.prototype.validate_factory = function(object){
        if(!!object){
          if( _.isFunction(object.constructor) || object.constructor.name == 'powerplant' ){
            return true;
          }else{
            throw new Error("Object does not have a valid constructor");
          }
        }else{
          throw new Error("Object is required for validation");
        }
        return false;
      }
      if(!_.isObject(_.validate_factory)) _.validate_factory = _.prototype.validate_factory;

      // timezones
      _.prototype.timezone = function(locale){
        var timezone = _.findWhere(ACTIVE.powerplant.timezones.result, {TimeZoneId: locale});
        return timezone;
      }
      if(!_.isObject(_.timezone)) _.timezone = _.prototype.timezone;
    }
  }
}()));
