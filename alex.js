(function($) {

  var $collapser = $('.expand-button .collapser');
  $collapser.toggle(function() {
    var $this = $(this);
    $this.find('.icon-uniC100').removeClass('icon-uniC100').addClass('icon-uniC800');
    $this.parents('.expand-button').siblings('.collapsible').slideDown();
  }, function() {
    var $this = $(this);
    $this.find('.icon-uniC800').removeClass('icon-uniC800').addClass('icon-uniC100');
    $this.parents('.expand-button').siblings('.collapsible').slideUp();
  });

})($);