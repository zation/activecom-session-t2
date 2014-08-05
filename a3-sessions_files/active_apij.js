(function() {

  ACTIVE.apij = {};

  /*
  http://apij.active.com/regcenter/event/2056241/regstatus?getcounts=true&output=json&callback=ACTIVE.apij.reg_status_handler
  
  Ex: ACTIVE.apij.reg_status("2056241","ACTIVE.apij.reg_status_handler")
  */


  ACTIVE.apij.reg_status = function(substitutionUrl, callback, regservice) {
    var endpoint;
    regservice = regservice || "regcenter";
    callback = callback || "";
    endpoint = "http://apij.active.com/" + regservice + "/event/" + substitutionUrl + "/regstatus?output=json&callback=" + callback;
    return $.ajax({
      url: endpoint,
      dataType: "jsonp",
      timeout: 5000,
      error: function(jqXHR, textStatus, errorThrown) {
        if (errorThrown === "timeout") {
          return window.RAILS.controllers.asset_service.reg_status_handler("reg-open");
        }
      }
    });
  };

}).call(this);
