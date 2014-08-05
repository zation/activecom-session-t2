ACTIVE.powerplant.register("adTracker");
ACTIVE.powerplant.adTracker = function adTracker(data){
  if(!_.isUndefined(data)){
    this.url = data;
    var rand = Math.random(10000);
    
    $div = $('<div style="position:absolute;height:1px;width:1px;left:-9999px;top:-9999px;z-index:-1;" id="adTracker-'+rand+'"></div>');
    $img = $('<img src="'+this.url+'" />');
    
    $('body').append($div);
    $('#adTracker-'+rand).append($img);    
  }else{
    if(!_.isUndefined(console.warn)) console.warn(data + ' is not a valid url');
 }
}
ACTIVE.powerplant.silo("adTracker");
