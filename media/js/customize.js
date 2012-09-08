var customize = {
	_visibleSlideDuration	: 400,
	_visibleFadeDuration	: 400,

	_settings		: new Settings(),

	_rightColumnFixInterval	: null,

	init : function(){
		// load mycar
		customize.viewModel.mycar = ko.mapping.fromJS( customize._settings.mycar );

		// load tabs
		customize._loadTabs();

		// load items
		customize._loadItems();

		// load reviews
		customize._loadReviews();

		
		// create custom bindings
		customize._createCustomBindings();

		// knockout magic
		ko.applyBindings( customize.viewModel );

		// do magic tricks while scrolling
		customize._scrollMagic();
	},

	viewModel : {
		tabsAll		: [],
		tabActiveID	: ko.observable(),
		tabNext		: ko.observable(),

		tooltip		: ko.observable( {} ),
		dependencies	: ko.observable( {} ),

		show360		: ko.observable( false ),

		tabIsActive	: function( id ){
			return this.tabActiveID() == id()
		},

		itemRemoveFromCar : function( item ){
			var url		= customize._settings.remove_url
			,   id		= item.data.id()
			,   data	= {
				      mycar	: customize.viewModel.mycar.id(),
				      type	: item.data.type()
			      };

			data[ item.data.type() ] = id;

			var callback = function( response ){
				ko.mapping.fromJS( response.mycar, customize.viewModel.mycar );
			}

			customize._JSONAction( url, data, callback );
		},

		itemAddToCar : function( item, showDependenciesPopup, force ){
			var url		= customize._settings.add_url
			,   id		= item.groupID ? item.groupID() : item.data.id()
			,   data	= $( '#form-' + id ).serialize().replace( /-[^=]+/, '' )

			if ( force ) {
				data += '&force=1';
			}

			var callback = function( response ){
				if ( response.status == 'requirement' || response.status == 'conflict' ){
					if ( showDependenciesPopup ) {
						customize.viewModel.showDependencies( item );
					} else {
						item.data.isExpanded( true );
					}
				} else {
					customize.viewModel.showDependencies( {} );
					ko.mapping.fromJS( response.mycar, customize.viewModel.mycar );
				}
			}

			customize._JSONAction( url, data, callback );
		},

		itemRate : function( item, rate ){
			var   url	= customize._settings.reviews_rate_url
			,     data	= {
				      id	: item.data.id(),
				      rate	: rate
			      };

			var callback = function( response ){
				item.data.reviewRates( item.data.reviewRates()+1 );
				item.data.reviewRated( true );

				if ( rate > 0 ){
					item.data.reviewRatesUp( item.data.reviewRatesUp()+1 );
				}
			}

			customize._JSONAction( url, data, callback, 'POST' );
		},

		showTooltip : function( e, item ){
			// add item data to tooltip
			customize.viewModel.tooltip( item.data );

			// position tooltip
			var label		= $( e.currentTarget )
			,   labelOffset		= label.offset()
			,   tooltip		= $( '#colorTooltip' )
			,   tooltipHeight	= tooltip.outerHeight()
			,   tooltipTop		= labelOffset.top - tooltipHeight + 13
			,   tooltipLeft		= labelOffset.left - 84

			tooltip.css( {
				top	: tooltipTop > 0 ? tooltipTop : 0,
				left	: tooltipLeft > 0 ? tooltipLeft : 0
			} );
		},

		hideTooltip : function( e ){
			customize.viewModel.tooltip( {} );
		},

		showDependencies : function( item ){
			// add data to dependencies
			customize.viewModel.dependencies( item );
		},
	},

	_loadTabs : function(){
		if ( customize._settings.tabs ) {
			customize.viewModel.tabsAll = ko.mapping.fromJS( customize._settings.tabs );

			customize.viewModel.tabActiveID( customize.viewModel.tabsAll()[0].tabID() );

			customize.viewModel.tabNext = ko.dependentObservable( customize._tabNextGet );
		}
	},

	_loadItems : function(){
		if ( customize._settings.items ) {
			customize.viewModel.items = ko.mapping.fromJS( customize._settings.items );

			// watch items for adding/removing to mycar
			// and expand/collapse links
			customize._watchItems( customize.viewModel.items() )
		}
	},

	_loadReviews : function(){
		if ( customize._settings.reviews ) {
			customize.viewModel.reviews = ko.mapping.fromJS( customize._settings.reviews );
		
			// watch items for expand/collapse links
			customize._watchItems( customize.viewModel.reviews.items() )
		}
	},

	_tabNextGet : function(){
		var tabsAll		= customize.viewModel.tabsAll()
		,   tabsAllLength	= tabsAll.length

		for ( var i = 0; i < tabsAllLength; i++ ){
			var tabsAlli = tabsAll[ i ];

			if ( tabsAlli.tabID() == customize.viewModel.tabActiveID() ){
				if ( i < tabsAllLength ){
					return tabsAll[ 1+i ];
				} else {
					return false;
				}
			}
		}
	},

	// walk through items array and add dependentObservable for every item
	_watchItems : function( items, itemParent ){
		if ( items ){
			var  itemsLength = items.length
			,    itemsi, i

			for ( i = 0; i < itemsLength; i++ ){
				itemsi = items[ i ]

				if ( itemParent ) {
					itemsi.itemParent = itemParent;
				}

				// it is item when it has id, otherwise it is group
				if ( itemsi.id ){
					itemsi.isSelected	= ko.dependentObservable( customize._itemIsSelected, itemsi );
					itemsi.isExpanded	= ko.observable( false );
					itemsi.hasValues	= ko.observable( customize._itemHasValues( itemsi ) );
					itemsi.isInConflict		= ko.dependentObservable( customize._itemIsInConflict, itemsi );
					itemsi.conflictsAsString	= ko.dependentObservable( customize._itemConflictsAsString, itemsi );
					itemsi.requirements		= customize._itemRequirements( itemsi );
					itemsi.requirementsAsString	= customize._itemRequirementsAsString( itemsi );
				}

				// check if items price depends on group price
				if ( itemsi.radio ){
					itemsi.price_base	= itemsi.price();
					itemsi.price		= ko.dependentObservable( customize._itemPriceCalculate, itemsi );
				}

				// watch nested groups
				if ( itemsi.items ){
					customize._watchItems( itemsi.items(), itemsi );
				}
			}
		}
	},
	
	// check wheter item is in mycar
	_itemIsSelected : function(){
		var id			= this.id()
		,   allOptions		= customize.viewModel.mycar.all_options()
		,   allOptionsLength	= allOptions.length

		for ( var i = 0; i < allOptionsLength; i++ ){
			if ( id == allOptions[ i ].id() ){
				return id
			}
		}

		return false;
	},

	// check wheter conflicted items are selected
	_itemIsInConflict : function(){
		if ( typeof this.conflict === 'function' ){
			var allOptions		= customize.viewModel.mycar.all_options()
			,   allOptionsLength	= allOptions.length
			,   allOptionsi
			,   conflicts		= this.conflict()
			,   conflictsLength	= conflicts.length
			,   conflictsj
			,   conflictsFound	= []
			,   i, j

			for ( i = 0; i < allOptionsLength; i++ ){
				allOptionsi = allOptions[ i ];

				for ( j = 0; j < conflictsLength; j++ ){
					conflictsj = conflicts[ j ];

					if ( conflictsj.items()[0].id() == allOptionsi.id() ){
						conflictsFound.push( { title: allOptionsi.title() } );
					}
				}
			}

			if ( conflictsFound[0] ){
				return conflictsFound;
			}
		}

		return false;
	},

	// get conflicts as a string
	_itemConflictsAsString : function(){
		var conflicts		= this.isInConflict()
		,   conflictsLength	= conflicts.length
		,   conflictsTmp	= []
		,   conflicti, i


		if ( conflictsLength > 0 ) {
			for ( i = 0; i < conflictsLength; i++ ) {
				conflicti = conflicts[ i ];

				conflictsTmp.push( conflicti.title );
			}
		}

		return conflictsTmp
	},

	// format item requirements array
	_itemRequirements : function( item ){
		if ( typeof item.require === 'function' ){
			var require		= item.require()
			,   requireLength	= require.length
			,   tmp			= []
			,   j, tmpj

			for ( j = 0; j < requireLength; j++ ){
				tmpj = require[ j ].items()[0];

				tmp.push( {
					title: tmpj.title(),
					price: tmpj.price() ? $().number_format( tmpj.price(), { thousandSeparator: ',', numberOfDecimals: 0, symbol: '$' } ) : 0
				} );
			}

			return tmp;
		}
	},

	// item requirements as a string
	_itemRequirementsAsString : function( item ){
		var requirements	= item.requirements

		if ( requirements ) {
			var requirementsLength	= requirements.length
			,   requirementsTmp	= []
			,   requirementi, i


			if ( requirementsLength > 0 ) {
				for ( i = 0; i < requirementsLength; i++ ) {
					requirementi = requirements[ i ];

					requirementsTmp.push( requirementi.title );
				}
			}

			return requirementsTmp
		}
	},

	// calculate item price
	_itemPriceCalculate : function(){
		var item		= this
		,   itemPrice		= 1*item.price_base
		,   itemPriceBase	= 1*item.itemParent.itemParent.price()

		if ( item.itemParent.itemParent.isSelected() ){
			return itemPrice;
		} else {
			return itemPrice + itemPriceBase;
		}
	},

	// check wheter item has selectable values
	_itemHasValues : function( item ){
		if ( item.items ){
			var items	= item.items()
			,   itemsLength	= items.length
			,   i, itemsi

			for ( i = 0; i < itemsLength; i++ ) {
				itemsi = items[ i ];

				if ( typeof itemsi.groupType == 'function' && itemsi.groupType() == 'radio' ) {
					if ( itemsi.items().length > 1 ) {
						return true;
					}
				}
			}
		}

		return false;
	},

	// custom bindings
	_createCustomBindings : function(){
		ko.bindingHandlers.visibleSlide = {
			init: function( element, valueAccessor ) {
				console.log( 'toggle' );
				$( element ).toggle( valueAccessor() );
			},
			
			update: function( element, valueAccessor, allBindingsAccessor ) {
				var valueUnwrapped	= ko.utils.unwrapObservable( valueAccessor() )
				,   $element		= $( element );

				if ( valueUnwrapped == true && $element.not( ':visible' ) ) {
					console.log( 'slideDown', $element );
					$element.slideDown( customize._visibleSlideDuration );
				} else {
					console.log( 'slideUp', $element );
					$element.slideUp( customize._visibleSlideDuration );
				}
			}
		};
	},
	
	// ajax stuff
	_JSONAction : function( url, data, callback, type ){
		if ( typeof( callback ) == 'undefined' ){
			callback = function(){};
		}

		$.ajax( {
			url		: url,
			dataType	: 'json',
			data		: data,
			/* complete	: callback, */
			type		: type || 'GET',
			success		: callback
		} );
	},

	// do magic tricks while scrolling
	_scrollMagic : function(){
		$( '.col.right.customize' ).alwaysVisible( {
			bottomMargin	: 446   // px
		} );
		$( '.customize_tabs' ).alwaysVisible( {
			//speed			: 0,
			bottomMargin	: 446   // px
		} );
		// $( '#formFeedback' ).alwaysVisible( {
		// 	defaultFooterHeight	: 116,   // px
		// } );
	}
}

$( function(){
	customize.init();
} );
