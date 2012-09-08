/*
 * Always visible
 * author:		PablO
 * version:		0.1.21
 * last update:		2011-12-28
 * url:			http://piskorz.info/tools/alwaysVisible/
 * 
 */ 

;(function ( $, window, document, undefined ) {
    	// Create the defaults once
	var pluginName	= 'alwaysVisible'
	,   defaults	= {
			_initialPosX		: 0,
			_initialPosXParent	: 0,
			_initialPosY		: 0,
			_initialPosYParent	: 0,
			bottomMargin		: 0,	// px
			placeholder		: null,
			placeholderID		: null,
			position		: 'fixed',
			speed			: 100,	// ms
			easing			: 'ease'
		}
	,   _common = {
		interval	: null,
		elements	: [],
		bodyScrollY	: null,
		pageSize	: null
	}

	// The actual plugin constructor
	function Plugin( element, options ) {
		this.element	= element;
		this.options	= $.extend( {}, defaults, options );

		this._defaults	= defaults;
		this._name	= pluginName;

		this._common	= _common;

		this.init();
	}

	Plugin.prototype.init = function(){
		// Place initialization logic here
		// You already have access to the DOM element and the options via the instance, 
		// e.g., this.element and this.options

		// store every element options independently
		this.element.options	= $.extend( {}, defaults, this.options );

		// add element to collection
		this._common.elements.push( this.element );

		// enable inverval
		if ( this._common.interval === null ){
			this._common.interval = true;
			$( window ).bind( 'scroll', (function( Plugin ){
			 	return function(){
					Plugin.refreshAll();
				}
			})( this ) );
		}
	};

	Plugin.prototype.refreshAll = function(){
		// get current scroll position and page dimensions
		var bodyScrollY	= $( window ).scrollTop()
		,   pageSize	= this._getPageSize()

		// check if either scroll position or page dimensions has changed
		if ( bodyScrollY != this._common.bodyScrollY || pageSize.pageHeight != this._common.pageSize.pageHeight ){

			// save current scroll position and page dimensions
			this._common.bodyScrollY	= bodyScrollY;
			this._common.pageSize		= pageSize;

			// iterate through elements and position them
			var elements		= this._common.elements
			,   elementsLength	= elements.length
			,   elementi, i

			for ( i = 0; i < elementsLength; i++ ){
				elementi = elements[ i ];

				this.positionElement( elementi, bodyScrollY, pageSize );
			}

		}
	};

	Plugin.prototype.positionElement = function( element, bodyScrollY, pageSize ){
		var $element		= $( element )
		,   options		= element.options
		,   bodyScrollY		= bodyScrollY || $( window ).scrollTop()
		,   pageSize		= pageSize || this._getPageSize()
		,   windowHeight	= pageSize.windowHeight
		,   pageHeight		= pageSize.pageHeight
		,   pageHeightWoFooter	= pageHeight - options.bottomMargin
		,   elmHeight		= $element.outerHeight()
		,   minusFooter		= 0
		,   elmYposNew		= null

		// Element height must me smaller than body visible height
		if ( elmHeight < windowHeight ){

			// get initial position only if element isn't fixed already
			if ( !$element.hasClass( 'alwaysVisible' ) ){
				Plugin.prototype._getInitialXY( element );
			}

			if ( bodyScrollY > options._initialPosY ){
				if ( ( bodyScrollY + elmHeight ) > pageHeightWoFooter ){
					minusFooter = ( ( bodyScrollY + elmHeight ) - pageHeightWoFooter );
				}

				elmYposNew	= ( bodyScrollY - options._initialPosY - minusFooter );
			}
		}

		if ( elmYposNew > 0 ) {
			var css = {
				position	: options.position,
				width		: $( element ).width()
			};

			if ( css.position == 'fixed' ){
				if ( minusFooter ){

					// if element reached footer, behave like it has position:absolute
					css.position	= 'absolute';
					css.top		= elmYposNew + options._initialPosY;
				} else {
					css.top		= 0;
					css.left	= options._initialPosX;
					elmYposNew	= -minusFooter;
				}

				css.margin = 0;

				this._createPlaceholder( element );
			}

			if ( css.position == 'absolute' ){
				css.left	= options._initialPosXParent;
				css.margin	= '';

				elmYposNew	= elmYposNew + options._initialPosY;
			}

			if ( minusFooter ){
				$element.addClass( 'reachedFooter' );
			}

			$element.addClass( 'alwaysVisible' );
			$element.css( css );

		} else {
			if ( $element.hasClass( 'alwaysVisible' ) ){
				this._removePlaceholder( element );

				$element.removeClass( 'alwaysVisible' );
				$element.css( {
					position	: '',
					top		: '',
					left		: '',
					margin		: ''
				} );
			}
		}

		if ( elmYposNew != null ){
			$element.stop().animate( { top: elmYposNew }, element.options.speed );
		}
	};

	Plugin.prototype._getPageSize = function(){
		var xScroll
		,   yScroll
		,   pageWidth
		,   pageHeight
		,   windowWidth
		,   windowHeight;

		if ( window.innerHeight && window.scrollMaxY ){
			xScroll = document.body.scrollWidth;
			yScroll = window.innerHeight + window.scrollMaxY;
		} else if ( document.body.scrollHeight > document.body.offsetHeight ){ // all but Explorer Mac
			xScroll = document.body.scrollWidth;
			yScroll = document.body.scrollHeight;
		} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
			xScroll = document.body.offsetWidth;
			yScroll = document.body.offsetHeight;
		}

		if ( self.innerHeight ){ // all except Explorer
			windowWidth = self.innerWidth;
			windowHeight = self.innerHeight;
		} else if ( document.documentElement && document.documentElement.clientHeight ){ // Explorer 6 Strict Mode
			windowWidth = document.documentElement.clientWidth;
			windowHeight = document.documentElement.clientHeight;
		} else if ( document.body ){ // other Explorers
			windowWidth = document.body.clientWidth;
			windowHeight = document.body.clientHeight;
		}

		// for small pages with total height less then height of the viewport
		if ( yScroll < windowHeight ){
			pageHeight = windowHeight;
		} else {
			pageHeight = yScroll;
		}

		// for small pages with total width less then width of the viewport
		if ( xScroll < windowWidth ){
			pageWidth = windowWidth;
		} else {
			pageWidth = xScroll;
		}

		return {
			pageWidth	: pageWidth,
			pageHeight	: pageHeight,
			windowWidth	: windowWidth,
			windowHeight	: windowHeight
		};
	}

	// create placeholder
	Plugin.prototype._createPlaceholder = function( element ){
		var $element	= $( element )
		,   width	= $element.outerWidth()
		,   height	= $element.outerHeight()
		,   options	= element.options

		if ( !options.placeholder ){
			options.placeholder = $( element.cloneNode( false ) );
			options.placeholder.attr( { id : options.placeholderID } );
			options.placeholder.css( { visibility : 'hidden' } );
		}

		options.placeholder.css( {
			width	: width,
			height	: height
		} );

		options.placeholder.insertAfter( element );
	}

	// remove placeholder
	Plugin.prototype._removePlaceholder = function( element ){
		if ( element.options.placeholder ){
			element.options.placeholder.remove();
		}
	}

	// get elements initial position
	Plugin.prototype._getInitialXY = function( element ){
		var $element	= $( element )
		,   options	= element.options
		,   elementOffset	= $element.offset()
		,   elementOffsetParent	= $element.position()
			
		options._initialPosX		= elementOffset.left;
		options._initialPosXParent	= elementOffsetParent.left;
		options._initialPosY		= elementOffset.top;
		options._initialPosYParent	= elementOffsetParent.top;
	}

	// A really lightweight plugin wrapper around the constructor, 
	// preventing against multiple instantiations
	$.fn[pluginName] = function ( options ) {
		return this.each( function(){
			if ( !$.data( this, 'plugin_' + pluginName ) ){
				$.data( this, 'plugin_' + pluginName, new Plugin( this, options ) );
			}
		} );
	}

})( jQuery, window, document );
