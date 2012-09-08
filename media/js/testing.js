// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};
var url_params = {};
(function () {
    var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        r = /([^&=]+)=?([^&]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = window.location.search.substring(1);
    while (e = r.exec(q)) {
      url_params[d(e[1])] = d(e[2]);
    }  
})();
String.prototype.hashCode = function(){
  var hash = 0;
  if (this.length == 0) return hash;
  for (i = 0; i < this.length; i++) {
    char = this.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
var test_hash_code = function(i) {
  if(!i){
    i = 0;
  }
  var user_id = $.cookie('tred_user_id'); 
  if(!user_id){
    user_id = (Number.MAX_VALUE * Math.random()).toString(36).substring(0, 32);
    $.cookie('tred_user_id', user_id, {expires: 3650, path: '/'});
  }
  log("Identified user as " + user_id);
  mixpanel.identify(user_id);
  return Math.abs((user_id.substring(i) + user_id.substring(0, i)).hashCode());
}
var modal = function(){
  $("#modal_form").modal({close:false, overlayCss: {backgroundColor:"#000"}, opacity:80, focus:false});
}



var google_adwords_conversion_click_action_button = function() {
  setTimeout(function(){
  google_conversion_id = 991240381;
  google_conversion_language = "en";
  google_conversion_format = "3";
  google_conversion_color = "ffffff";
  google_conversion_label = "5X8cCNOjhwQQvcHU2AM";
  google_conversion_value = 0;
  var randomNum = new Date().getMilliseconds();
  $.getScript("http://www.googleadservices.com/pagead/conversion.js");
  var image = new Image(1,1);
  image.src = 'http://www.googleadservices.com/pagead/conversion/' + google_conversion_id + '/?random=' + randomNum + 'label=' + google_conversion_label + '&guid=ON&script=0';
  }, 250);
}

var google_adwords_conversion_click_non_action_button = function() {
  setTimeout(function(){
  google_conversion_id = 991240381;
  google_conversion_language = "en";
  google_conversion_format = "3";
  google_conversion_color = "ffffff";
  google_conversion_label = "I7IPCJPIiQQQvcHU2AM";
  google_conversion_value = 0;
  var randomNum = new Date().getMilliseconds();
  $.getScript("http://www.googleadservices.com/pagead/conversion.js");
  var image = new Image(1,1);
  image.src = 'http://www.googleadservices.com/pagead/conversion/' + google_conversion_id + '/?random=' + randomNum + 'label=' + google_conversion_label + '&guid=ON&script=0';
  }, 250);
}

$(document).ready(function(){
  if(url_params){
    log(url_params);
    mixpanel.register(url_params);
    for(var key in url_params) {
      _gaq.push(['_setCustomVar', 1, 'Page', key, url_params[key]]);
    }    
  }
  var msg = "Visited Page"
  log(msg);
  mixpanel.track(msg);
  _gaq.push(['_trackEvent', 'Page', msg]);
  var test_id = test_hash_code(0) % 4;
  $(".slider_control").click(function(e){
    if($(this).text().indexOf("+") != -1) {
      var msg = "Use Property Search";
      log(msg);
      mixpanel.track(msg);
      _gaq.push(['_trackEvent', 'Page', msg]);
    }
  });
  $("input[type=checkbox]").click(function(){
    var values = [];
    $("input[type=checkbox]:checked").each(function(){
      if(this.value == "0") {
        return;
      }
      values.push(this.value)
    });
    var properties = {"Body Style": values};
    log(properties);
    mixpanel.register(properties);
    for(var key in properties) {
      _gaq.push(['_setCustomVar', 1, 'Page', key, properties[key]]);
    }
  });
  $("select").change(function(e){
    var properties = {};
    properties[this.name] = $(this).find("option[value='" + $(this).val() + "']").text();  
    log(properties);
    mixpanel.register(properties);
    for(var key in properties) {
      _gaq.push(['_setCustomVar', 1, 'Page', key, properties[key]]);
    }
  });
  $("#id_series-button *").click(function(e){
    if($("#id_make").val() == "") {
      $("#id_make-button").effect("shake", { times:2, distance:10}, 150);
      e.preventDefault();
    }
  });
  $("a:not(.ui-widget, .ui-widget-content a)").click(function(e){
    var name = $(this).text();
    if(name.length == 0) {
      if(this.id == "feedback") {
        name = "FEEDBACK";
      }
    }
    e.preventDefault();
    var msg = "Click Non-Action Button";
    log(msg);
    mixpanel.track(msg);
    _gaq.push(['_trackEvent', 'Page', msg]);    
    var properties = {};
    properties["Clicked Action Button"] = false;
    properties["Left Via"] = "Link: " + name;
    if($(".slider_control").text().indexOf("+") != -1) {
      properties["Used Property Search"] = false;
    } else {
      properties["Used Property Search"] = true;
    }
    log(properties);
    mixpanel.register(properties); 
    for(var key in properties) {
      _gaq.push(['_setCustomVar', 1, 'Page', key, properties[key]]);
    }
    var msg = "Leave Page Via Click";
    log(msg);
    mixpanel.track(msg); 
    _gaq.push(['_trackEvent', 'Page', msg]);
    google_adwords_conversion_click_non_action_button();
    modal();
  });
  $("#go, #jump_to_price, #customize").click(function(e){
    e.preventDefault();  
    if($(".slider_control").text().indexOf("+") != -1) {
      if($("#id_make").val() === "") {
        $("#id_make-button").effect("shake", { times:2, distance:10}, 150);
        var msg = "Attempt Premature Action";
        var properties = {"Premature Action":"No Make"};
        log(msg); 
        log(properties); 
        mixpanel.track(msg);
        _gaq.push(['_trackEvent', 'Page', msg]);
        mixpanel.register(properties);
        for(var key in properties) {
          _gaq.push(['_setCustomVar', 1, 'Page', key, properties[key]]);
        }
        return;
      }
      if($("#id_series").val() === "") {
        $("#id_series-button").effect("shake", { times:2, distance:10}, 150);
        var msg = "Attempt Premature Action";
        var properties = {"Premature Action":"No Model"};
        log(msg); 
        log(properties); 
        mixpanel.track(msg);
        _gaq.push(['_trackEvent', 'Page', msg]);
        mixpanel.register(properties);
        for(var key in properties) {
          _gaq.push(['_setCustomVar', 1, 'Page', key, properties[key]]);
        }
        return;
      }      
    }
    var msg = "Click Action Button";
    log(msg);
    mixpanel.track(msg);
    _gaq.push(['_trackEvent', 'Page', msg]);
    var properties = {"Action Button":$(this).val()};
    properties["Clicked Action Button"] = true;
    properties["Left Via"] = "Action: " + $(this).val();
    if($(".slider_control").text().indexOf("+") != -1) {
      properties["Used Property Search"] = false;
    } else {
      properties["Used Property Search"] = true;
    }
    log(properties);
    mixpanel.register(properties);
    for(var key in properties) {
      _gaq.push(['_setCustomVar', 1, 'Page', key, properties[key]]);
    }
    var msg = "Leave Page Via Click";
    log(msg);
    mixpanel.track(msg); 
    google_adwords_conversion_click_action_button();
    _gaq.push(['_trackEvent', 'Page', msg]);
    modal();
  });
  $('#email').example('email@example.com');
  $('#inviteform').submit(function(e) {
    $.ajax({
      url: this.action,
      data: $(this).serialize(),
      type: 'GET',
      dataType: 'jsonp',
      success: function(data) {
        var msg = "Submitted Email";
        log(msg);
        mixpanel.track(msg);
        _gaq.push(['_trackEvent', 'Page', msg]);
        if (data.Status != 200) {
          var properties = {"Valid Email":false};
          log(properties);
          mixpanel.register(properties);
          for(var key in properties) {
            _gaq.push(['_setCustomVar', 1, 'Page', key, properties[key]]);
          }
          alert(data.Message);
        } else {
          log("Name Tag:" + $('#email').val());
          mixpanel.name_tag($('#email').val());
          var properties = {"Valid Email":true};
          log(properties);
          mixpanel.register(properties);
          for(var key in properties) {
            _gaq.push(['_setCustomVar', 1, 'Page', key, properties[key]]);
          }
          $('#inviteform').fadeTo(250, 0, function() {
            $('#thanks').fadeIn();
          });
        }
      }
    });
    e.preventDefault();
  });
});