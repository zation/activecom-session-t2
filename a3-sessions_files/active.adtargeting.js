// New Comment
(function(window,document,undefined){
  "use strict";
  ACTIVE.ui.adTargeting = {
    demo_a: function(){
      var demo_a = 'na';
      var age = 0;
      if($.cookie("blessedEvent")) {
        var birthyear = parseInt($.cookie("blessedEvent"));
        var d = new Date();
        age = d.getFullYear() - birthyear;
      }
      if(ACTIVE.currentUser && ACTIVE.currentUser.age) {
        age = parseInt(ACTIVE.currentUser.age);
      }
      if(age <= 17) {
        demo_a = '0';
      } else if(age < 20) {
        demo_a = '1';
      } else if(age < 24) {
        demo_a = '2';
      } else if(age < 34) {
        demo_a = '3';
      } else if(age < 44) {
        demo_a = '4';
      } else if(age < 54) {
        demo_a = '5';
      } else if(age < 64) {
        demo_a = '6';
      } else {
        demo_a = '7';
      }
      return demo_a;
    },
    demo_g: function(){
      var gender = "na";
      if($.cookie("gender")) {
        gender = $.cookie("gender");
      }
      if(ACTIVE.currentUser && ACTIVE.currentUser.gender) {
        gender = ACTIVE.currentUser.gender.charAt(0);
      }
      return gender;
    },
    dma: function(){
      return "na";
    },
    traveler: function(){
      var eLat = $('meta[property="og:latitude"]').attr('content');
      var eLon = $('meta[property="og:longitude"]').attr('content');
      var ll = $.cookie('lat_lon');
      if (!!eLat && !!eLon && !!ll) {
        var lat = ll.split(',')[0];
        var lon = ll.split(',')[1];

        var distance = '';
        if (!!lat && !!lon) {
          var R = 3959;
          var dLat = ((eLat - lat) * Math.PI) / 180;
          var dLon = ((eLon - lon) * Math.PI) / 180;
          var rLat = (lat * Math.PI) / 180;
          var reLat = (eLat * Math.PI) / 180;

          var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(rLat) * Math.cos(reLat);
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          distance = R * c;
          return distance > 120 ? 'y' : 'n';
        }
      }
      return 'na';
    },
    view: function(){
      var view = $.cookie("ad_view");
      if(!view){
        if(ACTIVE.ui.adTargeting.subchannel != "nosubchannel"){
          view = ACTIVE.ui.adTargeting.subchannel;
        } else {
          if(ACTIVE.ui.adTargeting.channel != "nochannel") {
            view = ACTIVE.ui.adTargeting.channel;
          } else {
            view = "na";
          }
        }
      }
      return view;
    },
    overwrite_view: function(change_value){
      if(!$.cookie("ad_view") || change_value) {
        var new_value = "na";
        if(ACTIVE.ui.adTargeting.channel != "nochannel") {
          new_value = ACTIVE.ui.adTargeting.channel;
        }
        if(ACTIVE.ui.adTargeting.subchannel != "nosubchannel"){
          new_value = ACTIVE.ui.adTargeting.subchannel;
        }
        $.cookie("ad_view", new_value, { path: "/" });
      }
      return "na";
    },
    persisted_searchkw: function(){
      var value = "na";
      if(ACTIVE.ui.adTargeting.searchkw && ACTIVE.ui.adTargeting.searchkw != "na" && ACTIVE.ui.adTargeting.searchkw != ""){
        value = ACTIVE.ui.adTargeting.searchkw;
        $.cookie("searchkw", value, { path: "/" });
      } else if($.cookie("searchkw")) {
        value = $.cookie("searchkw");
      }
      return value
    }
  };

}(window,document,undefined));
