var html5 = {
    placeholder: function(){
		if (!("placeholder" in document.createElement("input"))) {
			$('[placeholder]').focus(function(){
				var input = $(this);
				if (input.val() == input.attr('placeholder')) {
					input.val('');
					input.removeClass('placeholder');
				}
			}).blur(function(){
				var input = $(this);
				if (input.val() == '' || input.val() == input.attr('placeholder')) {
					input.addClass('placeholder');
					input.val(input.attr('placeholder'));
				}
			}).blur();
		}
    }
}
$(document).ready(function(){
    html5.placeholder();
});