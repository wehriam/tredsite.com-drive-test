var garage = {
	_settings : new Settings(),
	viewModel : {},
	init : function(){
		this._saved_cars();
		this._added_car();
		this._garage();
		ko.applyBindings( garage.viewModel ); //LAST!
	},
	_garage : function(){
		garage.viewModel.garage = {
			name : ko.observable(garage._settings.garage_name),
			form_visible : ko.observable(false),
			header_visible : ko.observable(true),
			show_form : function(){
				garage.viewModel.garage.form_visible(true);
				garage.viewModel.garage.header_visible(false);
			},
			hide_form : function(){
				garage.viewModel.garage.form_visible(false);
				garage.viewModel.garage.header_visible(true);
			},
			rename : function(e){
				garage.viewModel.garage.hide_form();
				var tmp_data = $(e.currentTarget).serializeArray();
				garage.viewModel.garage.name(tmp_data[0].value);
				var data = {
					'title':tmp_data[0].value
				}
				var url = garage._settings.garage_rename_url;
				garage._JSONAction(url, data);
			}
		}
		//console.log(garage.viewModel.garage)
	},
	_added_car : function(){
		if ( garage._settings.added_car ){
			garage.viewModel.added_car = {
				items : function(){
					var items = garage._settings.added_car;
					$.each(items, function(i,item){
						items[i].form_visible = ko.observable(false);
						items[i].title = ko.observable(item.title);  
						items[i].msrp = function(){ return $().number_format( item.msrp, { thousandSeparator: ',', numberOfDecimals: 0, symbol: '$' } )}();
					});
					return ko.observableArray(items);
				}(),//self executing
				remove : function(item){
					var url =  item.data.remove_url;
					var callback = function(){
						garage.viewModel.added_car.items.remove(function(i) { return i.id ==  item.data.id });
					}
					garage._JSONAction(url, '', callback);
					return false;
				},
				show_form : function(item){
					item.data.form_visible(true);
				},
				hide_form : function(item){
					item.data.form_visible(false);
				},
				rename : function(e, item){
					var tmp_data = $(e.currentTarget).serializeArray();
					item.data.title(tmp_data[0].value);
					item.data.form_visible(false);
					var data = {
						'id':item.data.id,
						'title':item.data.title
					}
					var url = item.data.rename_url;
					garage._JSONAction(url, data);
				}
			}
		}
	},
	_saved_cars : function(){
		garage.viewModel.saved_cars = {
			items : function(){
				var items = garage._settings.saved_cars;
				$.each(items, function(i,item){
					items[i].form_visible = ko.observable(false);
					items[i].title = ko.observable(item.title);  
					items[i].msrp = function(){ return $().number_format( item.msrp, { thousandSeparator: ',', numberOfDecimals: 0, symbol: '$' } )}();
				});
				return ko.observableArray(items);
			}(),//self executing
			remove : function(item){
				var url =  item.data.remove_url;
				var callback = function(){
					garage.viewModel.saved_cars.items.remove(function(i) { return i.id ==  item.data.id });
				}
				garage._JSONAction(url, '', callback);
				return false;
			},
			show_form : function(item){
				item.data.form_visible(true);
			},
			hide_form : function(item){
				item.data.form_visible(false);
			},
			rename : function(e, item){
				var tmp_data = $(e.currentTarget).serializeArray();
				item.data.title(tmp_data[0].value);
				item.data.form_visible(false);
				var data = {
					'id':item.data.id,
					'title':item.data.title
				}
				var url = item.data.rename_url;
				garage._JSONAction(url, data);
			}
		}
	},
	_JSONAction : function( url, data, callback ){
		if ( typeof( callback ) == 'undefined' )
			callback = function(){};
		$.ajax( {
			url		: url,
			dataType	: 'json',
			data		: data,
			success		: callback
		} );
	}
}
$(document).ready(function(){
	garage.init();	
});

