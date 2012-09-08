/**
Copyright (C) 2011, Jacek Ostanski 
Permission is hereby granted, free of charge, to any person obtaining a 
copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions: 

The above copyright notice and this permission notice shall be included in 
all copies or substantial portions of the Software. 

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL 
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE. 
 */

/**
 * Simple Infinite Carousel jQuery Plugin
 */
(function($) {
	$.fn.simple_carousel = function(options){
		var opts = $.extend({}, $.fn.simple_carousel.defaults, options);
	
		return this.each(function(){
			var T = $(this);
			var o = $.meta ? $.extend({}, opts, $this.data()) : opts;
			var carousel = T;
			var duration  = o.duration;
			var offsetLeft = o.offsetLeft ||  -$(' li:first-child', T).outerWidth(); //initial left pos	
			var item_width = o.itemWidth || $('li:first-child', T).outerWidth(); // as named
			var left_value = item_width * (-1);
			var elements = $('li', carousel);
			var last_el = $(' li:last', carousel);
			var moved_last_element = $(last_el).clone(true).prependTo(carousel);
			$(last_el).remove(); 
			
			var control_left = $('<span />',{'class' : 'control left'});
			var control_right = $('<span />',{'class' : 'control right'});
			
			var carousel_container = $(carousel).wrap($('<div />', {'class' : 'carousel_container'})).parent(); //generate and append container for carousel items		
			carousel_container.wrapInner($('<div />',{'class' : 'carousel_crop'}));
			$(carousel_container).append($(control_left));
			$(carousel_container).append($(control_right));
			

			$(carousel).css({
				'left': offsetLeft
			});
			
			$('.control:not(.disabled)', $(carousel_container)).bind("click",function(e){
				e.preventDefault();
				
				var node_active = $('li.active',carousel).get(0);
				$(this).addClass('disabled');
				setTimeout("$('.disabled').removeClass('disabled');",duration*0.82);
				
				$(carousel).css('left',left_value);
				
				var css_class = $(this).attr('class');
				css_class = css_class.replace('control ','');
				css_class = css_class.replace(' disabled','');
				var direction = css_class;
	
				switch(css_class){
					case 'left':
						var left_indent  = parseInt(parseInt($(carousel).css('left'))+parseInt(item_width));
						$(carousel).animate({'left':left_indent},{'duration': duration, 'easing' : 'linear', complete : function(){
								$('li:first',carousel).before($('li:last',carousel));
								$(carousel).css('left',left_value);
							}
						});
					break;
					case 'right':
						var left_indent  = parseInt(parseInt($(carousel).css('left'))-parseInt(item_width));
						$(carousel).animate({'left':left_indent},{'duration': duration, 'easing' : 'linear', complete : function(){
								$('li:last',carousel).after($('li:first',carousel));
								$(carousel).css('left',left_value);
							}
						});
					break;
				}
				
			});
		});
	}
	
	$.fn.simple_carousel.defaults = {
		'duration' : 500, //animation timeout
	};
})(jQuery);
