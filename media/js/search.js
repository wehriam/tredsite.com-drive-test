/* support for search form */

var search = {
	_self: this,
	_settings: new Settings(),
	default_low_price: $('#id_price_lower').val() != '' ? $('#id_price_lower').val() : 0,
	default_up_price: $('#id_price_upper').val() != '' ? $('#id_price_upper').val() : 80000,
	init: function() {
		this._slider();
		this._header_form_details();
		this._header_form_series();
		this._search_results();
	},
	_slider: function() {
		if ($('#header_form').length) {
			var T = this;
			var default_low_price = T.default_low_price, default_up_price = T.default_up_price, low_val, up_val;
			var form = $('#header_form');
			var node = $('li.prices', form);
			var price_lower_input = $('#id_price_lower');
			var price_upper_input = $('#id_price_upper');
			var slider_container = $('<div />', {'class': 'slider'});
			var price_container = $('<span/>', {'class': 'price_text', 'text' : ' $' + $().number_format(default_low_price, {thousandSeparator: ',', numberOfDecimals: 0}) + ' - $' + $().number_format(default_up_price, {thousandSeparator: ',', numberOfDecimals: 0}) + "+"});
			$(node).prepend(slider_container);
			price_container.insertAfter($('>label', node));
			var sliding;
			$(slider_container).slider({
				range: true,
				min: 0,
				max: default_up_price,
				step: 1000,
				values: [parseInt(price_lower_input.val() != '' && typeof(price_lower_input.val()) != 'undefined' ? price_lower_input.val() : default_low_price), parseInt(price_upper_input.val() != '' && typeof(price_upper_input.val()) != 'undefined' ? price_upper_input.val() : default_up_price)],
				slide: function(event, ui) {
					price_lower_input.val(ui.values[0]);
					price_upper_input.val(ui.values[1]);
					if(sliding) {
						clearTimeout(sliding);
					}
					sliding = setTimeout(function(){
						var properties = {
							"Minimum Price":ui.values[0],
							"Maximum Price":ui.values[1]};
						log(properties);
						mixpanel.register(properties);	
						sliding = null;
					}, 1000);
					low_val = $().number_format(ui.values[0], {thousandSeparator: ',', numberOfDecimals: 0});
					up_val = $().number_format(ui.values[1], {thousandSeparator: ',', numberOfDecimals: 0});
					if(ui.values[1] == default_up_price){
						up_val += "+";
					}
					price_container.text(' $' + low_val + ' - $' + up_val);
				}
			});
			price_lower_input.val(slider_container.slider('values', 0));
			price_upper_input.val(slider_container.slider('values', 1));
		}
	},

	_header_form_details: function() {
		var more_link = $('<span />', {'class': 'slider_control', text: 'More Options +'}).insertAfter($('#header_form'));

		$('#header_form input[type=checkbox]:not([value=0]):checked').live('click', function() {
			$('#header_form input[value=0]').attr('checked', false);
			$('div', $('#header_form input[value=0]').parent()).removeClass('checked');
		});

		$('#header_form input[type=checkbox][value=0]:checked').live('click', function() {
			$('#header_form input:not([value=0])').attr('checked', false);
			$('div', $('#header_form input:not([value=0])').parent()).removeClass('checked');
			$(this).attr('checked', true);
			$('div', $(this).parent()).addClass('checked');
		});

		$('#header_form input[type=checkbox]').live('click', function() {
			if (!$('#header_form input:checked').length) {
				$('#header_form input[value=0]').attr('checked', true);
			$('div', $('#header_form input[value=0]').parent()).addClass('checked');
			}
		});

		more_link.click(function(e) {
			$('#make_and_model').slideToggle();
			var T = $(this);
			e.preventDefault();
			$('#header_form button').hide();
			$('#header_form h1').slideToggle();
			$('#header_form .details').slideToggle(function() {
				$('#header_form button').slideDown();
				if ($(this).is(':hidden')) {
					// $('input[type=text]', this).val('');
					// $('input[type=checkbox]:checked:not([value=0])', this).trigger('click');
					// $('select',this).each(function(){
					// 	var val = $('option:first', this).attr('value');
					// 	$(this).selectmenu('value', val);
					// });
					T.text('More Options +');
					$('#showDetails').val('false');
				}else {
					T.text('Fewer Options -');
					$('#showDetails').val('true');
				}
				if ($('input[type=checkbox]:checked:not([value=0])').length == 0)
					$('input[type=checkbox][value=0]:not(:checked)', this).trigger('click');
			});
			$('#header_form').toggleClass('details_visible');
		});
		if ($('#showDetails').val() == 'true') {
			more_link.trigger('click');
		}
		$('a[href="#search_details"]').click(function(e) {
				more_link.trigger('click');
				e.preventDefault();
			});
	},

	_header_form_series: function() {
	},

	_search_results: function() {
		var s = this._settings;
		var cars = this._settings.cars;
		var viewModel = function() {
			this.isMore = ko.observable(s.isMore);
			this.page = s.page;
			this.url = s.search_url;
			this.cars = ko.observableArray();
			this.addItems = function(items) {
				var T = this;
				$.each(items, function(i,item) {
					item.price_lower = $().number_format(item.price_lower, {thousandSeparator: ',', numberOfDecimals: 0});
					T.cars.push(item);
				});
				/* IE fallbacks */
				$('.ie8 .cars .grid > li:nth-child(3n), .ie8 .cars .grid .details li:nth-child(3)').addClass('third');
				$('.ie8 .cars .grid .details li:first-child').addClass('first');
			};
			this.loadMore = function() {
				var T = this;
				$.get(T.url + '&page=' + (++T.page), function(data) {
					T.addItems(data.results);
					T.isMore(data.is_more);
				});
			}
		}

		var list = new viewModel();
		ko.applyBindings(list);

		if (typeof(cars) != 'undefined')
			list.addItems(cars);

	}
};
$(document).ready(function() {
	search.init();
});
