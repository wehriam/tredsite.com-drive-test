var review =  function(reviewJSON, template_id){
	template = 'review_template';
	if (typeof(template_id)!='undefined'){
		template = template_id;
	}
	reviewJSON.node_id = template+'_'+reviewJSON.pk;
	this.render = function(){
		return $('#'+template).tmpl(reviewJSON)
	}
	this.update  = function(key, value){
		if (key.indexOf('.')!=-1){
			key = key.split('.');
			reviewJSON[key[0]][key[1]] = value;	
		}else{
			reviewJSON[key] = value;
		}
		$('#'+reviewJSON.node_id).replaceWith(this.render());
	}
}
var reviews = function(reviewsJSON, target,review_template, list_temlate_id){
	var container = $('<div>');
	var T = this;
	this.list = [];
	this.render = function(){
		$.each(T.list, function(index, item){
			$(container).append(T.list[index].render());
		});
		$(target).append($(container).html());
	} 
	$.each(reviewsJSON, function(index, item){
		T.list.push(new review(item, review_template));
	})
}
$(document).ready(function(){
	var s = new Settings();
	var r = new reviews(s.reviews, $('.reviews_list')[0], 'review_template');
	r.render();
	//r.list[0].update('fields.user_name', 'none'); - example how to update node.
})
