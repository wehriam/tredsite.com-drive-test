var site = {
	_self : this,
	_settings : new Settings(),
	init : function(){
		this._slideshow();
		this._bigClick();
		this._editorialMovie();
		this._enableOverlays();
		this._feedback();
		this._standardFeatures();
	},
	_slideshow : function(){
		$('.gallery_container .switch a').click(function(e){
			e.preventDefault();
			$('a',$(this).parent().siblings()).removeClass('active');
			if (!$(this).hasClass('active')){
				var class_name = $(this).attr('class');
				$('.gallery:not(.'+class_name+')').hide();
				$('.gallery.'+class_name).show();
				$(this).addClass('active');
			}
		})
		if (typeof($().cycle)=='function'){
			//unction(currSlideElement, nextSlideElement, options, forwardFlag) 
			function onBefore(curr, next, opts) {
				var index = opts.currSlide;
				var container = $(curr).closest('.gallery');
				$('> .control.left',container)[opts.nextSlide == 0 ? 'hide' : 'show']();
				$('> .control.right',container)[(opts.nextSlide+1) == opts.slideCount  ? 'hide' : 'show']();
			}
			$('.car .slideshow').each(function(){
				var parent = $(this).parent();
				$(this).cycle({
					fx: 	 'scrollHorz',
					prev:   $('> .control.left', parent),
					next:   $('> .control.right', parent),
					before:  onBefore,
					pager:  $('.reset',parent),
					pagerAnchorBuilder: function(idx, slide) {
					// return selector string for existing anchor
						return $('.reset:not(.slideshow) li:eq(' + idx + ') img',parent);
					},
					timeout: 0
				});
				$('.control.left',parent).hide();
			})
		}
	},
	_bigClick : function(){
		$('.cars >ul:not(.list_type)>li').click(function(e){
			e.preventDefault();
			var location = $('a.more',this).attr('href')
			window.location = location;
		})
	},
	_editorialMovie : function(){
		if ( !$.colorbox||!window.flowplayer ){
			return;
		}

		function createPlayer( movie_url, id ){
			var playerWrapper = $( '<div />' ).prop( {
					id		: id,
					className	: 'player-flv'
				} );

			$( 'body' ).append( playerWrapper );

			flowplayer( id, '/media/flash/flowplayer-3.2.7.swf', {
				clip : {
					autoPlay: false,
					autoBuffering: true,
					url: movie_url
				}
			} );
		};

		if ( $( '.swf_links a' ).length ){
			$( '.swf_links a' ).each( function(){
					var playerID = escape( 'player-' + this.href.replace( /[\/:\.]+/g, '-' ) );

					createPlayer( this.href, playerID );

					this.href = '#' + playerID;
				} );

			$( '.swf_links a' ).colorbox( {
				inline:true
			} );
		}
	},

	_enableOverlays : function(){
		function showOverlay( e ){
			var id			= $( e.currentTarget ).attr( 'href' )
			,   overlayContent	= $( id )
			,   overlay		= $( overlayContent ).closest( '.overlay' )

			overlayContent.css( 'margin-top', $( window ).scrollTop()+20 );

			overlay.fadeIn();

			e.preventDefault();
		}

		function hideOverlay( e ){
			var overlay = $( '.overlay' );

			overlay.fadeOut();

			e.preventDefault();
		}
		

		var overlays		= $( '.overlay' )
		,   overlaysLength	= overlays.length
		,   overlaysi, i
		,   overlayContenti

		for ( i = 0; i < overlaysLength; i++ ){
			overlaysi	= overlays[ i ];
			overlayContenti	= $( '.overlayContent', overlaysi );
			overlayContentiID	= overlayContenti.attr( 'id' )

			overlayContenti.append( '<button class="button x">x</button>' );

			$( 'body' ).append( overlaysi );

			if ( overlayContentiID ){
				$( 'a[href="#' + overlayContentiID + '"]' ).click( showOverlay );
			}
		}

		$( '.overlay .button.x' ).live( 'click', hideOverlay );		
	},

	_feedback : function(){
		var $form	= $( 'form#feedback' )
		,   $thanks	= $( 'form#feedback + .overlayContent' ).hide()

		$form.submit( function( e ){
			var url		= this.action
			,   data	= $( this ).serialize() 

			$.ajax( {
				url		: url,
				dataType	: 'json',
				data		: data,
				type		: 'POST',
				success		: function(){
					// hide feedback form
					$form.hide();

					// clear form fields
					// $( 'fieldset input:not([type="hidden"], textarea', $form ).val( '' );

					// position thanks note
					$thanks.css( 'margin-top', $form.css( 'margin-top' ) );

					// show thank you note
					$thanks.show();
				}
			} );

			e.preventDefault();
		} );
	},

	_standardFeatures : function(){
		// show/hide details
		function showHideFeature( e ){
			var feature = $( this ).closest( '.md10' );

			feature.toggleClass( 'expanded' );
			feature.toggleClass( 'collapsed' );

			e.preventDefault();
		}

		$( '#standard-features .md10' ).append( '<button class="link expand">Details</button><button class="link collapse">Hide details</button>' );
		$( '#standard-features .md10 .link' ).live( 'click', showHideFeature );
	},

	ieSUX : true
};
$(document).ready(function(){
	site.init();
});
