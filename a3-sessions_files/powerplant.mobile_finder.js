ACTIVE.powerplant.register('mobile_finder');
ACTIVE.powerplant.register('set_mobile_state');

ACTIVE.powerplant.mobile_finder = function mobile_finder(){
  if($.browser.msie) return;
  var worker = new Worker("/js/mobileFinder.js");
  worker.postMessage({method:'find',userAgent:window.navigator.userAgent});
  return worker.addEventListener('message',function(e){
    new ACTIVE.powerplant.factory('set_mobile_state',e.data);
    worker.postMessage({'method':'stop'});
  });
}

ACTIVE.powerplant.set_mobile_state = function set_mobile_state(data){
  return ACTIVE.isMobile = data;
}

ACTIVE.powerplant.silo(ACTIVE.powerplant.mobile_finder);
