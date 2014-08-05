(function($){
  function ActiveLocationChange(element,options){
    this.wrapperClass = "";
    this.typeaheadElementClass = "typeahead-location-change-input";
    this.typeaheadElementStyleClass = "change_location-inline";
    this.iconClass = "icon-uniK500";
    this.iconAria = false;
    this.iconCloseClass = "icon-uniC300";
    this.iconCloseAria = false;
    this.displayLocation = true;
    this.hideTriggerContainer = true;
    this.placeholderText = "";
    var settings = _.extend(this, options),
        changeLocationTrigger = $(element),
        changeLocationTriggerContainer = changeLocationTrigger.parent(),
        closeTarget;
    
    changeLocationTrigger.unbind('click');
    if(settings.displayLocation){
      changeLocationTrigger.text(ACTIVE.powerplant.get_user_location());
    }
    changeLocationTrigger.click(function(){
      var id = Math.floor(Math.random()*1000);
      var html = $('<div class="common-location-typeahead '+settings.wrapperClass+'" id="clt-'+id+'"><span class="'+settings.iconClass+'" aria-hidden="'+settings.iconAria+'"></span><input type="text" name="" class="'+settings.typeaheadElementClass+'" "'+settings.typeaheadElementStyleClass+'" value="" placeholder="'+settings.placeholderText+'" /><span class="'+settings.iconCloseClass+' aria-hidden="'+settings.iconCloseAria+'""></span></div>');
      html.insertAfter(changeLocationTriggerContainer);
      if(settings.hideTriggerContainer){
        changeLocationTriggerContainer.hide();
      }
      var th_parent = $("#clt-"+id),
          th_input = $('.common-location-typeahead .'+settings.typeaheadElementClass),
          th_close = $('.common-location-typeahead .'+settings.iconCloseClass),
          bh = new ACTIVE.powerplant.factory('typeahead'),
          self = $(this),
          uiInputDisplayAdjustment = function(){
            var w = th_input.width() + 66;
            th_parent.css('width',w);
          };
      
      th_input.typeahead({minLength: 0, hint: false},{
        name: "results",
        displayKey: 'text',
        source: bh.ttAdapter(),
        templates: {
          suggestion: _.template('<p class="title"><%=text%></p>'),
          header: _.template('<span class="caret"/>')
        }
      },{
        name: "defaults",
        displayKey: "text",
        source: ACTIVE.powerplant.factory("location_input_default_links_helper"),
        templates: {
          header: _.template('<div class="divider"></div>'),
          suggestion: _.template('<span class="<%=icon%>"></span><p><%=text%></p>')
        }
      });
      var ttObject = th_input.data('ttTypeahead'),
          ttObjectInput = ttObject.input;
          
      th_input.bind({
        keyup: function(){
          if(th_input.val()!="") th_close.show();
        },
        focusin: function(){
          $('.common-location-typeahead .'+settings.iconClass).addClass('active');
          ttObjectInput.query = "random_text";
          ttObjectInput._onInput("");
        },
        focusout: function(e){
          if(closeTarget !== th_close){
            $('.common-location-typeahead .'+settings.iconClass).removeClass('active');
            $('.common-location-typeahead').remove();
             return changeLocationTriggerContainer.show();
          }
          closeTarget = null;
          th_input.val("");
          th_input.unbind('blur');
          th_close.hide();
          th_input.trigger("focus");
          // Firefox focus out focus in delegation fix
          if($.browser.mozilla){
            setTimeout(function(){
              th_input.focus();
            },0);
          }
        },
        'typeahead:autocompleted': function(e, suggestion){
          th_input.keyup(function(e){
            if(e.keyCode==13){
              th_input.trigger('typeahead:selected',suggestion);
            }
          });
        },
        'typeahead:selected': function(e,suggestion){
          if(!!suggestion){
            $('body').css("cursor","wait");
            if(suggestion.text == "Current Location"){
              ACTIVE.ui.Location.getLocation();
            }
            else{
              ACTIVE.powerplant.factory('store_location_selection', suggestion.text)
              ACTIVE.powerplant.factory('set_user_location', suggestion.text);
            }
          }
        }
      });
      th_close.mousedown(function(e){
        closeTarget = th_close;
      });
      uiInputDisplayAdjustment();
      th_input.trigger("focus");
    });
  }
  
  $.fn.location_change = function(options){
    return this.each(function(){
      return new ActiveLocationChange(this, options);
    });
  }
}(jQuery));
