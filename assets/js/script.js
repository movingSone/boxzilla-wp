(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = (function() {
	'use strict';

	var $ = window.jQuery,
		console  = window.console || { log: function() { }},
		isLoggedIn = $(document.body).hasClass('logged-in');

	// Box Object
	var Box = function( data ) {
		this.id 		= data.id;
		this.element 	= data.element;
		this.$element 	= $(data.element);
		this.position 	= data.position;
		this.trigger 	= data.trigger;
		this.cookieTime 	= data.cookie;
		this.testMode 	= data.testMode;
		this.autoHide 	= data.autoHide;
		this.triggerElementSelector = data.triggerElementSelector;
		this.triggerPercentage = data.triggerPercentage;
		this.animation 	= data.animation;
		this.visible = false;

		// calculate triggerHeight
		this.triggerHeight = this.calculateTriggerHeight();
		this.enabled = 	this.isBoxEnabled();

		this.init();

	};

	Box.prototype.init = function() {
		// attach event to "close" icon inside box
		this.$element.find('.stb-close').click(this.disable.bind(this));

		// attach event to all links referring #stb-{box_id}
		$('a[href="#' + this.$element.attr('id') +'"]').click(function() { this.toggle(); return false;}.bind(this));

		// shows the box when window hash refers an element inside the box
		if(window.location.hash && window.location.hash.length > 0) {

			var hash = window.location.hash;
			var $element;

			if( hash.substring(1) === this.element.id || ( ( $element = this.$element.find( hash ) ) && $element.length > 0 ) ) {
				window.setTimeout(this.show.bind(this), 300);
			}
		}
	};

	Box.prototype.toggle = function(show) {

		if( typeof( show ) === "undefined" ) {
			show = ! this.visible;
		}

		// do nothing if element is being animated
		if( this.$element.is(':animated') ) {
			return false;
		}

		// is box already at desired visibility?
		if( show === this.visible ) {
			return false;
		}

		// show box
		if( this.animation === 'fade' ) {
			this.$element.fadeToggle( 'slow' );
		} else {
			this.$element.slideToggle( 'slow' );
		}

		this.visible = show;
		return true;
	};
	Box.prototype.show = function() {
		return this.toggle(true);
	};
	Box.prototype.hide = function() {
		return this.toggle(false);
	};
	Box.prototype.calculateTriggerHeight = function() {

		if( this.trigger === 'element' ) {
			var $triggerElement = $(this.triggerElementSelector).first();
			if( $triggerElement.length > 0 ) {
				return $triggerElement.offset().top;
			}
		}

		// calcate % of page height
		return ( this.triggerPercentage / 100 * $(document).height() );
	};

	// set cookie that disables automatically showing the box
	Box.prototype.setCookie = function() {
		if(this.cookieTime > 0) {
			var expiryDate = new Date();
			expiryDate.setDate( expiryDate.getDate() + this.cookieTime );
			document.cookie = 'stb_box_'+ id + '=true; expires='+ expiryDate.toUTCString() +'; path=/';
		}
	};

	// is this box enabled?
	Box.prototype.isBoxEnabled = function() {

		if( isLoggedIn && this.testMode ) {
			console.log( 'Scroll Triggered Boxes: Test mode is enabled. Please disable test mode if you\'re done testing.' );
			return true;
		}

		if( this.cookieTime === 0 ) {
			return true;
		}

		var isDisabledByCookie = document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + 'stb_box_' + id + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1") === "true";
		return ( ! isDisabledByCookie );
	};

	Box.prototype.disable = function() {
		this.hide();
		this.enabled = false;
		this.setCookie();
	};

	return Box;
})();
},{}],2:[function(require,module,exports){
module.exports = (function($) {
	'use strict';

	// Global Variables
	var boxes = {},
		windowHeight = $(window).height(),
		scrollTimer = 0;

	var Box = require('./Box.js');

	// Functions
	function init() {
		$(".scroll-triggered-box").each(createBoxFromDOM);
		$(window).bind('scroll.stb', onScroll);
	}

	// create a Box object from the DOM
	function createBoxFromDOM() {

		var $box = $(this);
		var boxData = {
			element: this,
			id: parseInt($box.data('box-id')),
			position: '',
			trigger: $box.data('trigger'),
			cookie: parseInt( $box.data('cookie') ),
			testMode: (parseInt($box.data('test-mode')) === 1),
			autoHide: (parseInt($box.data('auto-hide')) === 1),
			triggerElementSelector: $box.data('trigger-element'),
			triggerPercentage: parseInt( $box.data('trigger-percentage'), 10 ),
			animation: $box.data('animation')
		};
		boxes[boxData.id] = new Box(boxData);
	}

	// schedule a check of all box criterias in 100ms
	function onScroll() {
		if( scrollTimer ) {
			window.clearTimeout(scrollTimer);
		}

		scrollTimer = window.setTimeout(checkBoxCriterias, 100);
	}

	// check criteria for all registered boxes
	function checkBoxCriterias() {
		var scrollY = $(window).scrollTop();
		var scrollHeight = scrollY + windowHeight;

		for( var boxId in boxes ) {

			if( ! boxes.hasOwnProperty( boxId ) ) {
				continue;
			}

			var box = boxes[boxId];

			// don't show if box is disabled (by cookie)
			if( ! box.enabled ) {
				continue;
			}

			if( scrollHeight > box.triggerHeight ) {
				box.show();
			} else if( box.autoHide ) {
				box.hide();
			}
		}
	}

	// init on window.load
	jQuery(window).load(init);

	return {
		boxes: boxes,
		showBox: function(id) { boxes[id].show(); },
		hideBox: function(id) { boxes[id].hide(); },
		toggleBox: function(id) { boxes[id].toggle(); }
	}

})(window.jQuery);
},{"./Box.js":1}],3:[function(require,module,exports){
window.STB = require('./STB.js');
},{"./STB.js":2}]},{},[1,2,3]);
