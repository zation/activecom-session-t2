// IMPORTANT: This file should be loaded last in the DOM, after all
// page-specific controllers and libraries.
// 
// The page-specific triggering algorithm is heavily inspired by:
// http://www.viget.com/inspire/extending-paul-irishs-comprehensive-dom-ready-execution/

(function(window,undefined){
  "use strict";
  
  
  // ====================================================================
  // UTIL is kept local to this file so it doesn't polute the global namespace.
  var UTIL = {};
  
  // Trigger the specified controller action function.
  UTIL.exec = function( controller, action ){
    var ns = window.RAILS.controllers,
        action = ( action === undefined ) ? "init" : action;
        
      if ( controller !== "" && ns[controller] && typeof ns[controller][action] == "function" ) {
      debug.group('RAILS.controllers.%s.%s()', controller, action);
      ns[controller][action]();
      debug.groupEnd();
    } else {
      debug.log('[rails_start::25]', 'RAILS.controllers.%s.%s NOT FOUND', controller, action);
    }
  };
  
  
  // load a div whenever the page has fully loaded including ajax requests for testing
  var body = window.document.body;
  var isLoaded = function() {
    if($('#loaded').length == 0)
      $(body).append('<div id="loaded"></div>');
  }
  
  $(body).ajaxStart(function(){ RAILS.asyncLoading = true;});
  
  $(body).ajaxStop(function() {
    RAILS.asyncLoading = false;
    isLoaded();
  });
  
  // Trigger all 3 actions for the current page.
  UTIL.init = function(){
    UTIL.exec( "mobile" );
    UTIL.exec( "common" );
    UTIL.exec( RAILS.currentPage.controller );
    UTIL.exec( RAILS.currentPage.controller, RAILS.currentPage.action );
    
    if(!RAILS.asyncLoading)
       isLoaded();
  };
  
  // Call init on page load, using jQuery's way if available, or fallback
  // to native DOM events.
  if( !!window.jQuery ){
    window.jQuery( window.document ).ready( UTIL.init() );
  } else {
    var timeout = window.setTimeout(function(){ UTIL.init() },2000);
    window.onload = function(){
      clearTimeout(timeout);
      // UTIL.init();
    };
  }
  
})(window);
