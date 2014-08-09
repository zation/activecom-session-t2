(function($) {

  var $collapser = $('.expand-button .collapser');
  $collapser.toggle(function() {
    $(this).parents('.expand-button').siblings('.collapsible').slideDown();
  }, function() {
    $(this).parents('.expand-button').siblings('.collapsible').slideUp();
  });

})($);