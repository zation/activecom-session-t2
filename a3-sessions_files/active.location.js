(function() {

  ACTIVE.ui.Location = {
    getMobileLocation: function() {
      if (ACTIVE.ui.mediaViewport && this.userLocationNotSet()) {
        return this.getLocation;
      }
    },
    deviceLocationError: function() {
      $.cookie('a3userLocation', 'Everywhere', {
        path: '/',
        domain: ACTIVE.cookie_domain
      });
      $.cookie('user_set_location', 'true', {
        path: '/',
        domain: ACTIVE.cookie_domain
      });
      return $.removeCookie('lat_lon', {
        path: '/',
        domain: ACTIVE.cookie_domain
      });
    },
    deviceLocationSuccess: function(position) {
      var location;
      location = "" + position.coords.latitude + "," + position.coords.longitude;
      $.removeCookie('a3userLocation', {
        path: '/',
        domain: ACTIVE.cookie_domain
      });
      $.cookie('lat_lon', location, {
        path: '/',
        domain: ACTIVE.cookie_domain
      });
      $.cookie('user_set_location', 'true', {
        path: '/',
        domain: ACTIVE.cookie_domain
      });
      return window.location = window.location;
    },
    userLocationNotSet: function() {
      return ($.cookie('user_set_location')) !== 'true';
    },
    getLocation: function() {
      if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(this.deviceLocationSuccess, this.deviceLocationError);
      } else {
        return this.deviceLocationError();
      }
    }
  };

}).call(this);
