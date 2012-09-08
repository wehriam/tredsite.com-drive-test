var library = {
	_settings : new Settings(),
	init : function(){
		this._selectmenu();
		this._checkbox_radio_replace(this);
	},
	/**
	 * Replaces all selects with better version
	 * Info about plugin: http://harvesthq.github.com/chosen/
	 */
	_selectmenu : function(){
		var make = $('#id_make');
		var makes = $.map(make_and_model, function(v, k){return k;});
		makes.sort();
		for(var i in makes) {
			make.append("<option value='" + makes[i] + "'>" + makes[i] + "</option>");
		}

		$('#id_make').change(function(e){
			var series = $('#id_series');
			$('#id_series option').remove();
			series.append("<option value=''>CHOOSE MODEL</option>");
			var models = make_and_model[$(this).val()];
			for(var i in models) {
				series.append("<option value='" + models[i] + "'>" + models[i] + "</option>");
			}
			$('#id_series').selectmenu({width:300});
		});

		if (typeof($().selectmenu)=='function'){
			$('select').selectmenu({width:300});
		}
		$('#id_series').selectmenu('disable');
	},
	_replace_single_radio_checkbox : function(node){
		var T = node;
		if (!$(T).hasClass('replaced')){
			var type = 'checkbox';
			if ($(node).attr('type')=='radio'){
				type='radio';
			}
			var checked = $(T).attr('checked');
			var position = $(T).position();
   	   	 	$(T).css({
	   			'position':'absolute',
	   			'left':0,
	   			'top':0,
	   			'width':0,
	   			'height':0,
	   			'z-index':-1,
	   			'margin':0,
	   			'padding':0,
	   			'border': '0 none',
	 			'opacity':0
   		 });
			if (checked)
				checked = 'checked';
			else
				checked = '';
			var div = $('<div />',{
				'class' : type+'_replace '+checked
			});
			$(T).parent().css('position','relative').prepend(div);
			$(T).change(function(){
				if ($(this).attr('checked')){
					$(div).addClass('checked');
				}else{
					$(div).removeClass('checked');
				}
				if (type=='radio'){
					$('.radio_replace',$('input[name='+$(this).attr('name')+']').not($(this)).parent()).removeClass('checked');
				}
			});
			$(T).addClass('replaced');
		}
	},
	_checkbox_radio_replace : function(self){
		$('input[type=checkbox].replace,input[type=radio].replace').each(function(){
			self._replace_single_radio_checkbox(this);
		});
	}
};
$(document).ready(function(){
	library.init();
});
