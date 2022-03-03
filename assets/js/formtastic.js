/*! Color.js - v1.1.0 - 2015-12-17
* https://github.com/Automattic/Color.js
* Copyright (c) 2015 Matt Wiebe; Licensed GPLv2 */
(function(global, undef) {

	var Color = function( color, type ) {
		if ( ! ( this instanceof Color ) )
			return new Color( color, type );

		return this._init( color, type );
	};

	Color.fn = Color.prototype = {
		_color: 0,
		_alpha: 1,
		error: false,
		// for preserving hue/sat in fromHsl().toHsl() flows
		_hsl: { h: 0, s: 0, l: 0 },
		// for preserving hue/sat in fromHsv().toHsv() flows
		_hsv: { h: 0, s: 0, v: 0 },
		// for setting hsl or hsv space - needed for .h() & .s() functions to function properly
		_hSpace: 'hsl',
		_init: function( color ) {
			var func = 'noop';
			switch ( typeof color ) {
					case 'object':
						// alpha?
						if ( color.a !== undef )
							this.a( color.a );
						func = ( color.r !== undef ) ? 'fromRgb' :
							( color.l !== undef ) ? 'fromHsl' :
							( color.v !== undef ) ? 'fromHsv' : func;
						return this[func]( color );
					case 'string':
						return this.fromCSS( color );
					case 'number':
						return this.fromInt( parseInt( color, 10 ) );
			}
			return this;
		},

		_error: function() {
			this.error = true;
			return this;
		},

		clone: function() {
			var newColor = new Color( this.toInt() ),
				copy = ['_alpha', '_hSpace', '_hsl', '_hsv', 'error'];
			for ( var i = copy.length - 1; i >= 0; i-- ) {
				newColor[ copy[i] ] = this[ copy[i] ];
			}
			return newColor;
		},

		setHSpace: function( space ) {
			this._hSpace = ( space === 'hsv' ) ? space : 'hsl';
			return this;
		},

		noop: function() {
			return this;
		},

		fromCSS: function( color ) {
			var list,
				leadingRE = /^(rgb|hs(l|v))a?\(/;
			this.error = false;

			// whitespace and semicolon trim
			color = color.replace(/^\s+/, '').replace(/\s+$/, '').replace(/;$/, '');

			if ( color.match(leadingRE) && color.match(/\)$/) ) {
				list = color.replace(/(\s|%)/g, '').replace(leadingRE, '').replace(/,?\);?$/, '').split(',');

				if ( list.length < 3 )
					return this._error();

				if ( list.length === 4 ) {
					this.a( parseFloat( list.pop() ) );
					// error state has been set to true in .a() if we passed NaN
					if ( this.error )
						return this;
				}

				for (var i = list.length - 1; i >= 0; i--) {
					list[i] = parseInt(list[i], 10);
					if ( isNaN( list[i] ) )
						return this._error();
				}

				if ( color.match(/^rgb/) ) {
					return this.fromRgb( {
						r: list[0],
						g: list[1],
						b: list[2]
					} );
				} else if ( color.match(/^hsv/) ) {
					return this.fromHsv( {
						h: list[0],
						s: list[1],
						v: list[2]
					} );
				} else {
					return this.fromHsl( {
						h: list[0],
						s: list[1],
						l: list[2]
					} );
				}
			} else {
				// must be hex amirite?
				return this.fromHex( color );
			}
		},

		fromRgb: function( rgb, preserve ) {
			if ( typeof rgb !== 'object' || rgb.r === undef || rgb.g === undef || rgb.b === undef )
				return this._error();

			this.error = false;
			return this.fromInt( parseInt( ( rgb.r << 16 ) + ( rgb.g << 8 ) + rgb.b, 10 ), preserve );
		},

		fromHex: function( color ) {
			color = color.replace(/^#/, '').replace(/^0x/, '');
			if ( color.length === 3 ) {
				color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
			}

			// rough error checking - this is where things go squirrely the most
			this.error = ! /^[0-9A-F]{6}$/i.test( color );
			return this.fromInt( parseInt( color, 16 ) );
		},

		fromHsl: function( hsl ) {
			var r, g, b, q, p, h, s, l;

			if ( typeof hsl !== 'object' || hsl.h === undef || hsl.s === undef || hsl.l === undef )
				return this._error();

			this._hsl = hsl; // store it
			this._hSpace = 'hsl'; // implicit
			h = hsl.h / 360; s = hsl.s / 100; l = hsl.l / 100;
			if ( s === 0 ) {
				r = g = b = l; // achromatic
			}
			else {
				q = l < 0.5 ? l * ( 1 + s ) : l + s - l * s;
				p = 2 * l - q;
				r = this.hue2rgb( p, q, h + 1/3 );
				g = this.hue2rgb( p, q, h );
				b = this.hue2rgb( p, q, h - 1/3 );
			}
			return this.fromRgb( {
				r: r * 255,
				g: g * 255,
				b: b * 255
			}, true ); // true preserves hue/sat
		},

		fromHsv: function( hsv ) {
			var h, s, v, r, g, b, i, f, p, q, t;
			if ( typeof hsv !== 'object' || hsv.h === undef || hsv.s === undef || hsv.v === undef )
				return this._error();

			this._hsv = hsv; // store it
			this._hSpace = 'hsv'; // implicit

			h = hsv.h / 360; s = hsv.s / 100; v = hsv.v / 100;
			i = Math.floor( h * 6 );
			f = h * 6 - i;
			p = v * ( 1 - s );
			q = v * ( 1 - f * s );
			t = v * ( 1 - ( 1 - f ) * s );

			switch( i % 6 ) {
				case 0:
					r = v; g = t; b = p;
					break;
				case 1:
					r = q; g = v; b = p;
					break;
				case 2:
					r = p; g = v; b = t;
					break;
				case 3:
					r = p; g = q; b = v;
					break;
				case 4:
					r = t; g = p; b = v;
					break;
				case 5:
					r = v; g = p; b = q;
					break;
			}

			return this.fromRgb( {
				r: r * 255,
				g: g * 255,
				b: b * 255
			}, true ); // true preserves hue/sat

		},
		// everything comes down to fromInt
		fromInt: function( color, preserve ) {
			this._color = parseInt( color, 10 );

			if ( isNaN( this._color ) )
				this._color = 0;

			// let's coerce things
			if ( this._color > 16777215 )
				this._color = 16777215;
			else if ( this._color < 0 )
				this._color = 0;

			// let's not do weird things
			if ( preserve === undef ) {
				this._hsv.h = this._hsv.s = this._hsl.h = this._hsl.s = 0;
			}
			// EVENT GOES HERE
			return this;
		},

		hue2rgb: function( p, q, t ) {
			if ( t < 0 ) {
				t += 1;
			}
			if ( t > 1 ) {
				t -= 1;
			}
			if ( t < 1/6 ) {
				return p + ( q - p ) * 6 * t;
			}
			if ( t < 1/2 ) {
				return q;
			}
			if ( t < 2/3 ) {
				return p + ( q - p ) * ( 2/3 - t ) * 6;
			}
			return p;
		},

		toString: function() {
			var hex = parseInt( this._color, 10 ).toString( 16 );
			if ( this.error )
				return '';
			// maybe left pad it
			if ( hex.length < 6 ) {
				for (var i = 6 - hex.length - 1; i >= 0; i--) {
					hex = '0' + hex;
				}
			}
			return '#' + hex;
		},

		toCSS: function( type, alpha ) {
			type = type || 'hex';
			alpha = parseFloat( alpha || this._alpha );
			switch ( type ) {
				case 'rgb':
				case 'rgba':
					var rgb = this.toRgb();
					if ( alpha < 1 ) {
						return "rgba( " + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + alpha + " )";
					}
					else {
						return "rgb( " + rgb.r + ", " + rgb.g + ", " + rgb.b + " )";
					}
					break;
				case 'hsl':
				case 'hsla':
					var hsl = this.toHsl();
					if ( alpha < 1 ) {
						return "hsla( " + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%, " + alpha + " )";
					}
					else {
						return "hsl( " + hsl.h + ", " + hsl.s + "%, " + hsl.l + "% )";
					}
					break;
				default:
					return this.toString();
			}
		},

		toRgb: function() {
			return {
				r: 255 & ( this._color >> 16 ),
				g: 255 & ( this._color >> 8 ),
				b: 255 & ( this._color )
			};
		},

		toHsl: function() {
			var rgb = this.toRgb();
			var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
			var max = Math.max( r, g, b ), min = Math.min( r, g, b );
			var h, s, l = ( max + min ) / 2;

			if ( max === min ) {
				h = s = 0; // achromatic
			} else {
				var d = max - min;
				s = l > 0.5 ? d / ( 2 - max - min ) : d / ( max + min );
				switch ( max ) {
					case r: h = ( g - b ) / d + ( g < b ? 6 : 0 );
						break;
					case g: h = ( b - r ) / d + 2;
						break;
					case b: h = ( r - g ) / d + 4;
						break;
				}
				h /= 6;
			}

			// maintain hue & sat if we've been manipulating things in the HSL space.
			h = Math.round( h * 360 );
			if ( h === 0 && this._hsl.h !== h ) {
				h = this._hsl.h;
			}
			s = Math.round( s * 100 );
			if ( s === 0 && this._hsl.s ) {
				s = this._hsl.s;
			}

			return {
				h: h,
				s: s,
				l: Math.round( l * 100 )
			};

		},

		toHsv: function() {
			var rgb = this.toRgb();
			var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
			var max = Math.max( r, g, b ), min = Math.min( r, g, b );
			var h, s, v = max;
			var d = max - min;
			s = max === 0 ? 0 : d / max;

			if ( max === min ) {
				h = s = 0; // achromatic
			} else {
				switch( max ){
					case r:
						h = ( g - b ) / d + ( g < b ? 6 : 0 );
						break;
					case g:
						h = ( b - r ) / d + 2;
						break;
					case b:
						h = ( r - g ) / d + 4;
						break;
				}
				h /= 6;
			}

			// maintain hue & sat if we've been manipulating things in the HSV space.
			h = Math.round( h * 360 );
			if ( h === 0 && this._hsv.h !== h ) {
				h = this._hsv.h;
			}
			s = Math.round( s * 100 );
			if ( s === 0 && this._hsv.s ) {
				s = this._hsv.s;
			}

			return {
				h: h,
				s: s,
				v: Math.round( v * 100 )
			};
		},

		toInt: function() {
			return this._color;
		},

		toIEOctoHex: function() {
			// AARRBBGG
			var hex = this.toString();
			var AA = parseInt( 255 * this._alpha, 10 ).toString(16);
			if ( AA.length === 1 ) {
				AA = '0' + AA;
			}
			return '#' + AA + hex.replace(/^#/, '' );
		},

		// http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
		toLuminosity: function() {
			var rgb = this.toRgb();
			var lum = {};
			for ( var i in rgb ) {
				if ( ! rgb.hasOwnProperty( i ) ) {
					continue;
				}
				var chan = rgb[ i ] / 255;
				lum[ i ] = ( chan <= 0.03928 ) ? chan / 12.92 : Math.pow( ( ( chan + 0.055 ) / 1.055 ), 2.4 );
			}

			return 0.2126 * lum.r + 0.7152 * lum.g + 0.0722 * lum.b;
		},

		// http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
		getDistanceLuminosityFrom: function( color ) {
			if ( ! ( color instanceof Color ) ) {
				throw 'getDistanceLuminosityFrom requires a Color object';
			}
			var lum1 = this.toLuminosity();
			var lum2 = color.toLuminosity();
			if ( lum1 > lum2 ) {
				return ( lum1 + 0.05 ) / ( lum2 + 0.05 );
			}
			else {
				return ( lum2 + 0.05 ) / ( lum1 + 0.05 );
			}
		},

		getMaxContrastColor: function() {
			var withBlack = this.getDistanceLuminosityFrom( new Color( '#000' ) );
			var withWhite = this.getDistanceLuminosityFrom( new Color( '#fff' ) );
			var hex = ( withBlack >= withWhite ) ? '#000' : '#fff';
			return new Color( hex );
		},

		getReadableContrastingColor: function( bgColor, minContrast ) {
			if ( ! ( bgColor instanceof Color ) ) {
				return this;
			}

			// you shouldn't use less than 5, but you might want to.
			var targetContrast = ( minContrast === undef ) ? 5 : minContrast,
				contrast = bgColor.getDistanceLuminosityFrom( this ),
				maxContrastColor, maxContrast, incr;

			// if we have sufficient contrast already, cool
			if ( contrast >= targetContrast ) {
				return this;
			}


			maxContrastColor = bgColor.getMaxContrastColor();
			maxContrast = maxContrastColor.getDistanceLuminosityFrom( bgColor );

			// if current max contrast is less than the target contrast, we had wishful thinking.
			// still, go max
			if ( maxContrast <= targetContrast ) {
				return maxContrastColor;
			}

			incr = ( 0 === maxContrastColor.toInt() ) ? -1 : 1;
			while ( contrast < targetContrast ) {
				this.l( incr, true ); // 2nd arg turns this into an incrementer
				contrast = this.getDistanceLuminosityFrom( bgColor );
				// infininite loop prevention: you never know.
				if ( this._color === 0 || this._color === 16777215 ) {
					break;
				}
			}

			return this;
		},

		a: function( val ) {
			if ( val === undef )
				return this._alpha;

			var a = parseFloat( val );

			if ( isNaN( a ) )
				return this._error();

			this._alpha = a;
			return this;
		},

		// TRANSFORMS

		darken: function( amount ) {
			amount = amount || 5;
			return this.l( - amount, true );
		},

		lighten: function( amount ) {
			amount = amount || 5;
			return this.l( amount, true );
		},

		saturate: function( amount ) {
			amount = amount || 15;
			return this.s( amount, true );
		},

		desaturate: function( amount ) {
			amount = amount || 15;
			return this.s( - amount, true );
		},

		toGrayscale: function() {
			return this.setHSpace('hsl').s( 0 );
		},

		getComplement: function() {
			return this.h( 180, true );
		},

		getSplitComplement: function( step ) {
			step = step || 1;
			var incr = 180 + ( step * 30 );
			return this.h( incr, true );
		},

		getAnalog: function( step ) {
			step = step || 1;
			var incr = step * 30;
			return this.h( incr, true );
		},

		getTetrad: function( step ) {
			step = step || 1;
			var incr = step * 60;
			return this.h( incr, true );
		},

		getTriad: function( step ) {
			step = step || 1;
			var incr = step * 120;
			return this.h( incr, true );
		},

		_partial: function( key ) {
			var prop = shortProps[key];
			return function( val, incr ) {
				var color = this._spaceFunc('to', prop.space);

				// GETTER
				if ( val === undef )
					return color[key];

				// INCREMENT
				if ( incr === true )
					val = color[key] + val;

				// MOD & RANGE
				if ( prop.mod )
					val = val % prop.mod;
				if ( prop.range )
					val = ( val < prop.range[0] ) ? prop.range[0] : ( val > prop.range[1] ) ? prop.range[1] : val;

				// NEW VALUE
				color[key] = val;

				return this._spaceFunc('from', prop.space, color);
			};
		},

		_spaceFunc: function( dir, s, val ) {
			var space = s || this._hSpace,
				funcName = dir + space.charAt(0).toUpperCase() + space.substr(1);
			return this[funcName](val);
		}
	};

	var shortProps = {
		h: {
			mod: 360
		},
		s: {
			range: [0,100]
		},
		l: {
			space: 'hsl',
			range: [0,100]
		},
		v: {
			space: 'hsv',
			range: [0,100]
		},
		r: {
			space: 'rgb',
			range: [0,255]
		},
		g: {
			space: 'rgb',
			range: [0,255]
		},
		b: {
			space: 'rgb',
			range: [0,255]
		}
	};

	for ( var key in shortProps ) {
		if ( shortProps.hasOwnProperty( key ) )
			Color.fn[key] = Color.fn._partial(key);
	}

	// play nicely with Node + browser
	if ( typeof exports === 'object' )
		module.exports = Color;
	else
		global.Color = Color;

}(this));

/*! Iris Color Picker - v1.0.7 - 2014-11-28
* https://github.com/Automattic/Iris
* Copyright (c) 2014 Matt Wiebe; Licensed GPLv2 */
(function( $, undef ){
	var _html, nonGradientIE, gradientType, vendorPrefixes, _css, Iris, UA, isIE, IEVersion;

	_html = '<div class="iris-picker"><div class="iris-picker-inner"><div class="iris-square"><a class="iris-square-value" href="#"><span class="iris-square-handle ui-slider-handle"></span></a><div class="iris-square-inner iris-square-horiz"></div><div class="iris-square-inner iris-square-vert"></div></div><div class="iris-slider iris-strip"><div class="iris-slider-offset"></div></div></div></div>';
	_css = '.iris-picker{display:block;position:relative}.iris-picker,.iris-picker *{-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box}input+.iris-picker{margin-top:4px}.iris-error{background-color:#ffafaf}.iris-border{border-radius:3px;border:1px solid #aaa;width:200px;background-color:#fff}.iris-picker-inner{position:absolute;top:0;right:0;left:0;bottom:0}.iris-border .iris-picker-inner{top:10px;right:10px;left:10px;bottom:10px}.iris-picker .iris-square-inner{position:absolute;left:0;right:0;top:0;bottom:0}.iris-picker .iris-square,.iris-picker .iris-slider,.iris-picker .iris-square-inner,.iris-picker .iris-palette{border-radius:3px;box-shadow:inset 0 0 5px rgba(0,0,0,.4);height:100%;width:12.5%;float:left;margin-right:5%}.iris-picker .iris-square{width:76%;margin-right:10%;position:relative}.iris-picker .iris-square-inner{width:auto;margin:0}.iris-ie-9 .iris-square,.iris-ie-9 .iris-slider,.iris-ie-9 .iris-square-inner,.iris-ie-9 .iris-palette{box-shadow:none;border-radius:0}.iris-ie-9 .iris-square,.iris-ie-9 .iris-slider,.iris-ie-9 .iris-palette{outline:1px solid rgba(0,0,0,.1)}.iris-ie-lt9 .iris-square,.iris-ie-lt9 .iris-slider,.iris-ie-lt9 .iris-square-inner,.iris-ie-lt9 .iris-palette{outline:1px solid #aaa}.iris-ie-lt9 .iris-square .ui-slider-handle{outline:1px solid #aaa;background-color:#fff;-ms-filter:"alpha(Opacity=30)"}.iris-ie-lt9 .iris-square .iris-square-handle{background:0;border:3px solid #fff;-ms-filter:"alpha(Opacity=50)"}.iris-picker .iris-strip{margin-right:0;position:relative}.iris-picker .iris-strip .ui-slider-handle{position:absolute;background:0;margin:0;right:-3px;left:-3px;border:4px solid #aaa;border-width:4px 3px;width:auto;height:6px;border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.2);opacity:.9;z-index:5;cursor:ns-resize}.iris-strip .ui-slider-handle:before{content:" ";position:absolute;left:-2px;right:-2px;top:-3px;bottom:-3px;border:2px solid #fff;border-radius:3px}.iris-picker .iris-slider-offset{position:absolute;top:11px;left:0;right:0;bottom:-3px;width:auto;height:auto;background:transparent;border:0;border-radius:0}.iris-picker .iris-square-handle{background:transparent;border:5px solid #aaa;border-radius:50%;border-color:rgba(128,128,128,.5);box-shadow:none;width:12px;height:12px;position:absolute;left:-10px;top:-10px;cursor:move;opacity:1;z-index:10}.iris-picker .ui-state-focus .iris-square-handle{opacity:.8}.iris-picker .iris-square-handle:hover{border-color:#999}.iris-picker .iris-square-value:focus .iris-square-handle{box-shadow:0 0 2px rgba(0,0,0,.75);opacity:.8}.iris-picker .iris-square-handle:hover::after{border-color:#fff}.iris-picker .iris-square-handle::after{position:absolute;bottom:-4px;right:-4px;left:-4px;top:-4px;border:3px solid #f9f9f9;border-color:rgba(255,255,255,.8);border-radius:50%;content:" "}.iris-picker .iris-square-value{width:8px;height:8px;position:absolute}.iris-ie-lt9 .iris-square-value,.iris-mozilla .iris-square-value{width:1px;height:1px}.iris-palette-container{position:absolute;bottom:0;left:0;margin:0;padding:0}.iris-border .iris-palette-container{left:10px;bottom:10px}.iris-picker .iris-palette{margin:0;cursor:pointer}.iris-square-handle,.ui-slider-handle{border:0;outline:0}';

	// Even IE9 dosen't support gradients. Elaborate sigh.
	UA = navigator.userAgent.toLowerCase();
	isIE = navigator.appName === 'Microsoft Internet Explorer';
	IEVersion = isIE ? parseFloat( UA.match( /msie ([0-9]{1,}[\.0-9]{0,})/ )[1] ) : 0;
	nonGradientIE = ( isIE && IEVersion < 10 );
	gradientType = false;

	// we don't bother with an unprefixed version, as it has a different syntax
	vendorPrefixes = [ '-moz-', '-webkit-', '-o-', '-ms-' ];

	// Bail for IE <= 7
	if ( nonGradientIE && IEVersion <= 7 ) {
		$.fn.iris = $.noop;
		$.support.iris = false;
		return;
	}

	$.support.iris = true;

	function testGradientType() {
		var el, base,
			bgImageString = 'backgroundImage';

		if ( nonGradientIE ) {
			gradientType = 'filter';
		}
		else {
			el = $( '<div id="iris-gradtest" />' );
			base = 'linear-gradient(top,#fff,#000)';
			$.each( vendorPrefixes, function( i, val ){
				el.css( bgImageString, val + base );
				if ( el.css( bgImageString ).match( 'gradient' ) ) {
					gradientType = i;
					return false;
				}
			});
			// check for legacy webkit gradient syntax
			if ( gradientType === false ) {
				el.css( 'background', '-webkit-gradient(linear,0% 0%,0% 100%,from(#fff),to(#000))' );
				if ( el.css( bgImageString ).match( 'gradient' ) ) {
					gradientType = 'webkit';
				}
			}
			el.remove();
		}

	}

	/**
	* Only for CSS3 gradients. oldIE will use a separate function.
	*
	* Accepts as many color stops as necessary from 2nd arg on, or 2nd
	* arg can be an array of color stops
	*
	* @param  {string} origin Gradient origin - top or left, defaults to left.
	* @return {string}        Appropriate CSS3 gradient string for use in
	*/
	function createGradient( origin, stops ) {
		origin = ( origin === 'top' ) ? 'top' : 'left';
		stops = $.isArray( stops ) ? stops : Array.prototype.slice.call( arguments, 1 );
		if ( gradientType === 'webkit' ) {
			return legacyWebkitGradient( origin, stops );
		} else {
			return vendorPrefixes[ gradientType ] + 'linear-gradient(' + origin + ', ' + stops.join(', ') + ')';
		}
	}

	/**
	* Stupid gradients for a stupid browser.
	*/
	function stupidIEGradient( origin, stops ) {
		var type, self, lastIndex, filter, startPosProp, endPosProp, dimensionProp, template, html;

		origin = ( origin === 'top' ) ? 'top' : 'left';
		stops = $.isArray( stops ) ? stops : Array.prototype.slice.call( arguments, 1 );
		// 8 hex: AARRGGBB
		// GradientType: 0 vertical, 1 horizontal
		type = ( origin === 'top' ) ? 0 : 1;
		self = $( this );
		lastIndex = stops.length - 1;
		filter = 'filter';
		startPosProp = ( type === 1 ) ? 'left' : 'top';
		endPosProp = ( type === 1 ) ? 'right' : 'bottom';
		dimensionProp = ( type === 1 ) ? 'height' : 'width';
		template = '<div class="iris-ie-gradient-shim" style="position:absolute;' + dimensionProp + ':100%;' + startPosProp + ':%start%;' + endPosProp + ':%end%;' + filter + ':%filter%;" data-color:"%color%"></div>';
		html = '';
		// need a positioning context
		if ( self.css('position') === 'static' ) {
			self.css( {position: 'relative' } );
		}

		stops = fillColorStops( stops );
		$.each(stops, function( i, startColor ) {
			var endColor, endStop, filterVal;

			// we want two at a time. if we're on the last pair, bail.
			if ( i === lastIndex ) {
				return false;
			}

			endColor = stops[ i + 1 ];
			//if our pairs are at the same color stop, moving along.
			if ( startColor.stop === endColor.stop ) {
				return;
			}

			endStop = 100 - parseFloat( endColor.stop ) + '%';
			startColor.octoHex = new Color( startColor.color ).toIEOctoHex();
			endColor.octoHex = new Color( endColor.color ).toIEOctoHex();

			filterVal = 'progid:DXImageTransform.Microsoft.Gradient(GradientType=' + type + ', StartColorStr=\'' + startColor.octoHex + '\', EndColorStr=\'' + endColor.octoHex + '\')';
			html += template.replace( '%start%', startColor.stop ).replace( '%end%', endStop ).replace( '%filter%', filterVal );
		});
		self.find( '.iris-ie-gradient-shim' ).remove();
		$( html ).prependTo( self );
	}

	function legacyWebkitGradient( origin, colorList ) {
		var stops = [];
		origin = ( origin === 'top' ) ? '0% 0%,0% 100%,' : '0% 100%,100% 100%,';
		colorList = fillColorStops( colorList );
		$.each( colorList, function( i, val ){
			stops.push( 'color-stop(' + ( parseFloat( val.stop ) / 100 ) + ', ' + val.color + ')' );
		});
		return '-webkit-gradient(linear,' + origin + stops.join(',') + ')';
	}

	function fillColorStops( colorList ) {
		var colors = [],
			percs = [],
			newColorList = [],
			lastIndex = colorList.length - 1;

		$.each( colorList, function( index, val ) {
			var color = val,
				perc = false,
				match = val.match( /1?[0-9]{1,2}%$/ );

			if ( match ) {
				color = val.replace( /\s?1?[0-9]{1,2}%$/, '' );
				perc = match.shift();
			}
			colors.push( color );
			percs.push( perc );
		});

		// back fill first and last
		if ( percs[0] === false ) {
			percs[0] = '0%';
		}

		if ( percs[lastIndex] === false ) {
			percs[lastIndex] = '100%';
		}

		percs = backFillColorStops( percs );

		$.each( percs, function( i ){
			newColorList[i] = { color: colors[i], stop: percs[i] };
		});
		return newColorList;
	}

	function backFillColorStops( stops ) {
		var first = 0,
			last = stops.length - 1,
			i = 0,
			foundFirst = false,
			incr,
			steps,
			step,
			firstVal;

		if ( stops.length <= 2 || $.inArray( false, stops ) < 0 ) {
			return stops;
		}
		while ( i < stops.length - 1 ) {
			if ( ! foundFirst && stops[i] === false ) {
				first = i - 1;
				foundFirst = true;
			} else if ( foundFirst && stops[i] !== false ) {
				last = i;
				i = stops.length;
			}
			i++;
		}
		steps = last - first;
		firstVal = parseInt( stops[first].replace('%'), 10 );
		incr = ( parseFloat( stops[last].replace('%') ) - firstVal ) / steps;
		i = first + 1;
		step = 1;
		while ( i < last ) {
			stops[i] = ( firstVal + ( step * incr ) ) + '%';
			step++;
			i++;
		}
		return backFillColorStops( stops );
	}

	$.fn.gradient = function() {
		var args = arguments;
		return this.each( function() {
			// this'll be oldishIE
			if ( nonGradientIE ) {
				stupidIEGradient.apply( this, args );
			} else {
				// new hotness
				$( this ).css( 'backgroundImage', createGradient.apply( this, args ) );
			}
		});
	};

	$.fn.raninbowGradient = function( origin, args ) {
		var opts, template, i, steps;

		origin = origin || 'top';
		opts = $.extend( {}, { s: 100, l: 50 }, args );
		template = 'hsl(%h%,' + opts.s + '%,' + opts.l + '%)';
		i = 0;
		steps = [];
		while ( i <= 360 ) {
			steps.push( template.replace('%h%', i) );
			i += 30;
		}
		return this.each(function() {
			$(this).gradient( origin, steps );
		});
	};

	// the colorpicker widget def.
	Iris = {
		options: {
			color: false,
			mode: 'hsl',
			controls: {
				horiz: 's', // horizontal defaults to saturation
				vert: 'l', // vertical defaults to lightness
				strip: 'h' // right strip defaults to hue
			},
			hide: true, // hide the color picker by default
			border: true, // draw a border around the collection of UI elements
			target: false, // a DOM element / jQuery selector that the element will be appended within. Only used when called on an input.
			width: 200, // the width of the collection of UI elements
			palettes: false // show a palette of basic colors beneath the square.
		},
		_color: '',
		_palettes: [ '#000', '#fff', '#d33', '#d93', '#ee2', '#81d742', '#1e73be', '#8224e3' ],
		_inited: false,
		_defaultHSLControls: {
			horiz: 's',
			vert: 'l',
			strip: 'h'
		},
		_defaultHSVControls: {
			horiz: 'h',
			vert: 'v',
			strip: 's'
		},
		_scale: {
			h: 360,
			s: 100,
			l: 100,
			v: 100
		},
		_create: function() {
			var self = this,
				el = self.element,
				color = self.options.color || el.val();

			if ( gradientType === false ) {
				testGradientType();
			}

			if ( el.is( 'input' ) ) {
				if ( self.options.target ) {
					self.picker = $( _html ).appendTo( self.options.target );
				} else {
					self.picker = $( _html ).insertAfter( el );
				}

				self._addInputListeners( el );
			} else {
				el.append( _html );
				self.picker = el.find( '.iris-picker' );
			}

			// Browsers / Versions
			// Feature detection doesn't work for these, and $.browser is deprecated
			if ( isIE ) {
				if ( IEVersion === 9 ) {
					self.picker.addClass( 'iris-ie-9' );
				} else if ( IEVersion <= 8 ) {
					self.picker.addClass( 'iris-ie-lt9' );
				}
			} else if ( UA.indexOf('compatible') < 0 && UA.indexOf('khtml') < 0 && UA.match( /mozilla/ ) ) {
				self.picker.addClass( 'iris-mozilla' );
			}

			if ( self.options.palettes ) {
				self._addPalettes();
			}

			self._color = new Color( color ).setHSpace( self.options.mode );
			self.options.color = self._color.toString();

			// prep 'em for re-use
			self.controls = {
				square:      self.picker.find( '.iris-square' ),
				squareDrag:  self.picker.find( '.iris-square-value' ),
				horiz:       self.picker.find( '.iris-square-horiz' ),
				vert:        self.picker.find( '.iris-square-vert' ),
				strip:       self.picker.find( '.iris-strip' ),
				stripSlider: self.picker.find( '.iris-strip .iris-slider-offset' )
			};

			// small sanity check - if we chose hsv, change default controls away from hsl
			if ( self.options.mode === 'hsv' && self._has('l', self.options.controls) ) {
				self.options.controls = self._defaultHSVControls;
			} else if ( self.options.mode === 'hsl' && self._has('v', self.options.controls) ) {
				self.options.controls = self._defaultHSLControls;
			}

			// store it. HSL gets squirrely
			self.hue = self._color.h();

			if ( self.options.hide ) {
				self.picker.hide();
			}

			if ( self.options.border ) {
				self.picker.addClass( 'iris-border' );
			}

			self._initControls();
			self.active = 'external';
			self._dimensions();
			self._change();
		},
		_has: function(needle, haystack) {
			var ret = false;
			$.each(haystack, function(i,v){
				if ( needle === v ) {
					ret = true;
					// exit the loop
					return false;
				}
			});
			return ret;
		},
		_addPalettes: function () {
			var container = $( '<div class="iris-palette-container" />' ),
				palette = $( '<a class="iris-palette" tabindex="0" />' ),
				colors = $.isArray( this.options.palettes ) ? this.options.palettes : this._palettes;

			// do we have an existing container? Empty and reuse it.
			if ( this.picker.find( '.iris-palette-container' ).length ) {
				container = this.picker.find( '.iris-palette-container' ).detach().html( '' );
			}

			$.each(colors, function(index, val) {
				palette.clone().data( 'color', val )
					.css( 'backgroundColor', val ).appendTo( container )
					.height( 10 ).width( 10 );
			});

			this.picker.append(container);
		},
		_paint: function() {
			var self = this;
			self._paintDimension( 'top', 'strip' );
			self._paintDimension( 'top', 'vert' );
			self._paintDimension( 'left', 'horiz' );
		},
		_paintDimension: function( origin, control ) {
			var self = this,
				c = self._color,
				mode = self.options.mode,
				color = self._getHSpaceColor(),
				target = self.controls[ control ],
				controlOpts = self.options.controls,
				stops;

			// don't paint the active control
			if ( control === self.active || ( self.active === 'square' && control !== 'strip' ) ) {
				return;
			}

			switch ( controlOpts[ control ] ) {
				case 'h':
					if ( mode === 'hsv' ) {
						color = c.clone();
						switch ( control ) {
							case 'horiz':
								color[controlOpts.vert](100);
								break;
							case 'vert':
								color[controlOpts.horiz](100);
								break;
							case 'strip':
								color.setHSpace('hsl');
								break;
						}
						stops = color.toHsl();
					} else {
						if ( control === 'strip' ) {
							stops = { s: color.s, l: color.l };
						} else {
							stops = { s: 100, l: color.l };
						}
					}

					target.raninbowGradient( origin, stops );
					break;
				case 's':
					if ( mode === 'hsv' ) {
						if ( control === 'vert' ) {
							stops = [ c.clone().a(0).s(0).toCSS('rgba'), c.clone().a(1).s(0).toCSS('rgba') ];
						} else if ( control === 'strip' ) {
							stops = [ c.clone().s(100).toCSS('hsl'), c.clone().s(0).toCSS('hsl') ];
						} else if ( control === 'horiz' ) {
							stops = [ '#fff', 'hsl(' + color.h + ',100%,50%)' ];
						}
					} else { // implicit mode === 'hsl'
						if ( control === 'vert' && self.options.controls.horiz === 'h' ) {
							stops = ['hsla(0, 0%, ' + color.l + '%, 0)', 'hsla(0, 0%, ' + color.l + '%, 1)'];
						} else {
							stops = ['hsl('+ color.h +',0%,50%)', 'hsl(' + color.h + ',100%,50%)'];
						}
					}


					target.gradient( origin, stops );
					break;
				case 'l':
					if ( control === 'strip' ) {
						stops = ['hsl(' + color.h + ',100%,100%)', 'hsl(' + color.h + ', ' + color.s + '%,50%)', 'hsl('+ color.h +',100%,0%)'];
					} else {
						stops = ['#fff', 'rgba(255,255,255,0) 50%', 'rgba(0,0,0,0) 50%', 'rgba(0,0,0,1)'];
					}
					target.gradient( origin, stops );
					break;
				case 'v':
						if ( control === 'strip' ) {
							stops = [ c.clone().v(100).toCSS(), c.clone().v(0).toCSS() ];
						} else {
							stops = ['rgba(0,0,0,0)', '#000'];
						}
						target.gradient( origin, stops );
					break;
				default:
					break;
			}
		},

		_getHSpaceColor: function() {
			return ( this.options.mode === 'hsv' ) ? this._color.toHsv() : this._color.toHsl();
		},

		_dimensions: function( reset ) {
			// whatever size
			var self = this,
				opts = self.options,
				controls = self.controls,
				square = controls.square,
				strip = self.picker.find( '.iris-strip' ),
				squareWidth = '77.5%',
				stripWidth = '12%',
				totalPadding = 20,
				innerWidth = opts.border ? opts.width - totalPadding : opts.width,
				controlsHeight,
				paletteCount = $.isArray( opts.palettes ) ? opts.palettes.length : self._palettes.length,
				paletteMargin, paletteWidth, paletteContainerWidth;

			if ( reset ) {
				square.css( 'width', '' );
				strip.css( 'width', '' );
				self.picker.css( {width: '', height: ''} );
			}

			squareWidth = innerWidth * ( parseFloat( squareWidth ) / 100 );
			stripWidth = innerWidth * ( parseFloat( stripWidth ) / 100 );
			controlsHeight = opts.border ? squareWidth + totalPadding : squareWidth;

			square.width( squareWidth ).height( squareWidth );
			strip.height( squareWidth ).width( stripWidth );
			self.picker.css( { width: opts.width, height: controlsHeight } );

			if ( ! opts.palettes ) {
				return self.picker.css( 'paddingBottom', '' );
			}

			// single margin at 2%
			paletteMargin = squareWidth * 2 / 100;
			paletteContainerWidth = squareWidth - ( ( paletteCount - 1 ) * paletteMargin );
			paletteWidth = paletteContainerWidth / paletteCount;
			self.picker.find('.iris-palette').each( function( i ) {
				var margin = i === 0 ? 0 : paletteMargin;
				$( this ).css({
					width: paletteWidth,
					height: paletteWidth,
					marginLeft: margin
				});
			});
			self.picker.css( 'paddingBottom', paletteWidth + paletteMargin );
			strip.height( paletteWidth + paletteMargin + squareWidth );
		},

		_addInputListeners: function( input ) {
			var self = this,
				debounceTimeout = 100,
				callback = function( event ){
					var color = new Color( input.val() ),
						val = input.val().replace( /^#/, '' );

					input.removeClass( 'iris-error' );
					// we gave a bad color
					if ( color.error ) {
						// don't error on an empty input - we want those allowed
						if ( val !== '' ) {
							input.addClass( 'iris-error' );
						}
					} else {
						if ( color.toString() !== self._color.toString() ) {
							// let's not do this on keyup for hex shortcodes
							if ( ! ( event.type === 'keyup' && val.match( /^[0-9a-fA-F]{3}$/ ) ) ) {
								self._setOption( 'color', color.toString() );
							}
						}
					}
				};

			input.on( 'change', callback ).on( 'keyup', self._debounce( callback, debounceTimeout ) );

			// If we initialized hidden, show on first focus. The rest is up to you.
			if ( self.options.hide ) {
				input.one( 'focus', function() {
					self.show();
				});
			}
		},

		_initControls: function() {
			var self = this,
				controls = self.controls,
				square = controls.square,
				controlOpts = self.options.controls,
				stripScale = self._scale[controlOpts.strip];

			controls.stripSlider.slider({
				orientation: 'vertical',
				max: stripScale,
				slide: function( event, ui ) {
					self.active = 'strip';
					// "reverse" for hue.
					if ( controlOpts.strip === 'h' ) {
						ui.value = stripScale - ui.value;
					}

					self._color[controlOpts.strip]( ui.value );
					self._change.apply( self, arguments );
				}
			});

			controls.squareDrag.draggable({
				containment: controls.square.find( '.iris-square-inner' ),
				zIndex: 1000,
				cursor: 'move',
				drag: function( event, ui ) {
					self._squareDrag( event, ui );
				},
				start: function() {
					square.addClass( 'iris-dragging' );
					$(this).addClass( 'ui-state-focus' );
				},
				stop: function() {
					square.removeClass( 'iris-dragging' );
					$(this).removeClass( 'ui-state-focus' );
				}
			}).on( 'mousedown mouseup', function( event ) {
				var focusClass = 'ui-state-focus';
				event.preventDefault();
				if (event.type === 'mousedown' ) {
					self.picker.find( '.' + focusClass ).removeClass( focusClass ).blur();
					$(this).addClass( focusClass ).focus();
				} else {
					$(this).removeClass( focusClass );
				}
			}).on( 'keydown', function( event ) {
				var container = controls.square,
					draggable = controls.squareDrag,
					position = draggable.position(),
					distance = self.options.width / 100; // Distance in pixels the draggable should be moved: 1 "stop"

				// make alt key go "10"
				if ( event.altKey ) {
					distance *= 10;
				}

				// Reposition if one of the directional keys is pressed
				switch ( event.keyCode ) {
					case 37: position.left -= distance; break; // Left
					case 38: position.top  -= distance; break; // Up
					case 39: position.left += distance; break; // Right
					case 40: position.top  += distance; break; // Down
					default: return true; // Exit and bubble
				}

				// Keep draggable within container
				position.left = Math.max( 0, Math.min( position.left, container.width() ) );
				position.top =  Math.max( 0, Math.min( position.top, container.height() ) );

				draggable.css(position);
				self._squareDrag( event, { position: position });
				event.preventDefault();
			});

			// allow clicking on the square to move there and keep dragging
			square.mousedown( function( event ) {
				var squareOffset, pos;
				// only left click
				if ( event.which !== 1 ) {
					return;
				}

				// prevent bubbling from the handle: no infinite loops
				if ( ! $( event.target ).is( 'div' ) ) {
					return;
				}

				squareOffset = self.controls.square.offset();
				pos = {
						top: event.pageY - squareOffset.top,
						left: event.pageX - squareOffset.left
				};
				event.preventDefault();
				self._squareDrag( event, { position: pos } );
				event.target = self.controls.squareDrag.get(0);
				self.controls.squareDrag.css( pos ).trigger( event );
			});

			// palettes
			if ( self.options.palettes ) {
				self._paletteListeners();
			}
		},

		_paletteListeners: function() {
			var self = this;
			self.picker.find('.iris-palette-container').on('click.palette', '.iris-palette', function() {
				self._color.fromCSS( $(this).data('color') );
				self.active = 'external';
				self._change();
			}).on( 'keydown.palette', '.iris-palette', function( event ) {
				if ( ! ( event.keyCode === 13 || event.keyCode === 32 ) ) {
					return true;
				}
				event.stopPropagation();
				$( this ).click();
			});
		},

		_squareDrag: function( event, ui ) {
			var self = this,
				controlOpts = self.options.controls,
				dimensions = self._squareDimensions(),
				vertVal = Math.round( ( dimensions.h - ui.position.top ) / dimensions.h * self._scale[controlOpts.vert] ),
				horizVal = self._scale[controlOpts.horiz] - Math.round( ( dimensions.w - ui.position.left ) / dimensions.w * self._scale[controlOpts.horiz] );

			self._color[controlOpts.horiz]( horizVal )[controlOpts.vert]( vertVal );

			self.active = 'square';
			self._change.apply( self, arguments );
		},

		_setOption: function( key, value ) {
			var self = this,
				oldValue = self.options[key],
				doDimensions = false,
				hexLessColor,
				newColor,
				method;

			// ensure the new value is set. We can reset to oldValue if some check wasn't met.
			self.options[key] = value;

			switch(key) {
				case 'color':
					// cast to string in case we have a number
					value = '' + value;
					hexLessColor = value.replace( /^#/, '' );
					newColor = new Color( value ).setHSpace( self.options.mode );
					if ( newColor.error ) {
						self.options[key] = oldValue;
					} else {
						self._color = newColor;
						self.options.color = self.options[key] = self._color.toString();
						self.active = 'external';
						self._change();
					}
					break;
				case 'palettes':
					doDimensions = true;

					if ( value ) {
						self._addPalettes();
					} else {
						self.picker.find('.iris-palette-container').remove();
					}

					// do we need to add events?
					if ( ! oldValue ) {
						self._paletteListeners();
					}
					break;
				case 'width':
					doDimensions = true;
					break;
				case 'border':
					doDimensions = true;
					method = value ? 'addClass' : 'removeClass';
					self.picker[method]('iris-border');
					break;
				case 'mode':
				case 'controls':
					// if nothing's changed, let's bail, since this causes re-rendering the whole widget
					if ( oldValue === value ) {
						return;
					}

					// we're using these poorly named variables because they're already scoped.
					// method is the element that Iris was called on. oldValue will be the options
					method = self.element;
					oldValue = self.options;
					oldValue.hide = ! self.picker.is( ':visible' );
					self.destroy();
					self.picker.remove();
					return $(self.element).iris(oldValue);
			}

			// Do we need to recalc dimensions?
			if ( doDimensions ) {
				self._dimensions(true);
			}
		},

		_squareDimensions: function( forceRefresh ) {
			var square = this.controls.square,
				dimensions,
				control;

			if ( forceRefresh !== undef && square.data('dimensions') ) {
				return square.data('dimensions');
			}

			control = this.controls.squareDrag;
			dimensions = {
				w: square.width(),
				h: square.height()
			};
			square.data( 'dimensions', dimensions );
			return dimensions;
		},

		_isNonHueControl: function( active, type ) {
			if ( active === 'square' && this.options.controls.strip === 'h' ) {
				return true;
			} else if ( type === 'external' || ( type === 'h' && active === 'strip' ) ) {
				return false;
			}

			return true;
		},

		_change: function() {
			var self = this,
				controls = self.controls,
				color = self._getHSpaceColor(),
				actions = [ 'square', 'strip' ],
				controlOpts = self.options.controls,
				type = controlOpts[self.active] || 'external',
				oldHue = self.hue;

			if ( self.active === 'strip' ) {
				// take no action on any of the square sliders if we adjusted the strip
				actions = [];
			} else if ( self.active !== 'external' ) {
				// for non-strip, non-external, strip should never change
				actions.pop(); // conveniently the last item
			}

			$.each( actions, function(index, item) {
				var value, dimensions, cssObj;
				if ( item !== self.active ) {
					switch ( item ) {
						case 'strip':
							// reverse for hue
							value = ( controlOpts.strip === 'h' ) ? self._scale[controlOpts.strip] - color[controlOpts.strip] : color[controlOpts.strip];
							controls.stripSlider.slider( 'value', value );
							break;
						case 'square':
							dimensions = self._squareDimensions();
							cssObj = {
								left: color[controlOpts.horiz] / self._scale[controlOpts.horiz] * dimensions.w,
								top: dimensions.h - ( color[controlOpts.vert] / self._scale[controlOpts.vert] * dimensions.h )
							};

							self.controls.squareDrag.css( cssObj );
							break;
					}
				}
			});

			// Ensure that we don't change hue if we triggered a hue reset
			if ( color.h !== oldHue && self._isNonHueControl( self.active, type ) ) {
				self._color.h(oldHue);
			}

			// store hue for repeating above check next time
			self.hue = self._color.h();

			self.options.color = self._color.toString();

			// only run after the first time
			if ( self._inited ) {
				self._trigger( 'change', { type: self.active }, { color: self._color } );
			}

			if ( self.element.is( ':input' ) && ! self._color.error ) {
				self.element.removeClass( 'iris-error' );
				if ( self.element.val() !== self._color.toString() ) {
					self.element.val( self._color.toString() );
				}
			}

			self._paint();
			self._inited = true;
			self.active = false;
		},
		// taken from underscore.js _.debounce method
		_debounce: function( func, wait, immediate ) {
			var timeout, result;
			return function() {
				var context = this,
					args = arguments,
					later,
					callNow;

				later = function() {
					timeout = null;
					if ( ! immediate) {
						result = func.apply( context, args );
					}
				};

				callNow = immediate && !timeout;
				clearTimeout( timeout );
				timeout = setTimeout( later, wait );
				if ( callNow ) {
					result = func.apply( context, args );
				}
				return result;
			};
		},
		show: function() {
			this.picker.show();
		},
		hide: function() {
			this.picker.hide();
		},
		toggle: function() {
			this.picker.toggle();
		},
		color: function(newColor) {
			if ( newColor === true ) {
				return this._color.clone();
			} else if ( newColor === undef ) {
				return this._color.toString();
			}
			this.option('color', newColor);
		}
	};
	// initialize the widget
	$.widget( 'a8c.iris', Iris );
	// add CSS
	$( '<style id="iris-css">' + _css + '</style>' ).appendTo( 'head' );

}( jQuery ));
/*! Color.js - v0.9.11 - 2013-08-09
* https://github.com/Automattic/Color.js
* Copyright (c) 2013 Matt Wiebe; Licensed GPLv2 */
(function(global, undef) {

	var Color = function( color, type ) {
		if ( ! ( this instanceof Color ) )
			return new Color( color, type );

		return this._init( color, type );
	};

	Color.fn = Color.prototype = {
		_color: 0,
		_alpha: 1,
		error: false,
		// for preserving hue/sat in fromHsl().toHsl() flows
		_hsl: { h: 0, s: 0, l: 0 },
		// for preserving hue/sat in fromHsv().toHsv() flows
		_hsv: { h: 0, s: 0, v: 0 },
		// for setting hsl or hsv space - needed for .h() & .s() functions to function properly
		_hSpace: 'hsl',
		_init: function( color ) {
			var func = 'noop';
			switch ( typeof color ) {
					case 'object':
						// alpha?
						if ( color.a !== undef )
							this.a( color.a );
						func = ( color.r !== undef ) ? 'fromRgb' :
							( color.l !== undef ) ? 'fromHsl' :
							( color.v !== undef ) ? 'fromHsv' : func;
						return this[func]( color );
					case 'string':
						return this.fromCSS( color );
					case 'number':
						return this.fromInt( parseInt( color, 10 ) );
			}
			return this;
		},

		_error: function() {
			this.error = true;
			return this;
		},

		clone: function() {
			var newColor = new Color( this.toInt() ),
				copy = ['_alpha', '_hSpace', '_hsl', '_hsv', 'error'];
			for ( var i = copy.length - 1; i >= 0; i-- ) {
				newColor[ copy[i] ] = this[ copy[i] ];
			}
			return newColor;
		},

		setHSpace: function( space ) {
			this._hSpace = ( space === 'hsv' ) ? space : 'hsl';
			return this;
		},

		noop: function() {
			return this;
		},

		fromCSS: function( color ) {
			var list,
				leadingRE = /^(rgb|hs(l|v))a?\(/;
			this.error = false;

			// whitespace and semicolon trim
			color = color.replace(/^\s+/, '').replace(/\s+$/, '').replace(/;$/, '');

			if ( color.match(leadingRE) && color.match(/\)$/) ) {
				list = color.replace(/(\s|%)/g, '').replace(leadingRE, '').replace(/,?\);?$/, '').split(',');

				if ( list.length < 3 )
					return this._error();

				if ( list.length === 4 ) {
					this.a( parseFloat( list.pop() ) );
					// error state has been set to true in .a() if we passed NaN
					if ( this.error )
						return this;
				}

				for (var i = list.length - 1; i >= 0; i--) {
					list[i] = parseInt(list[i], 10);
					if ( isNaN( list[i] ) )
						return this._error();
				}

				if ( color.match(/^rgb/) ) {
					return this.fromRgb( {
						r: list[0],
						g: list[1],
						b: list[2]
					} );
				} else if ( color.match(/^hsv/) ) {
					return this.fromHsv( {
						h: list[0],
						s: list[1],
						v: list[2]
					} );
				} else {
					return this.fromHsl( {
						h: list[0],
						s: list[1],
						l: list[2]
					} );
				}
			} else {
				// must be hex amirite?
				return this.fromHex( color );
			}
		},

		fromRgb: function( rgb, preserve ) {
			if ( typeof rgb !== 'object' || rgb.r === undef || rgb.g === undef || rgb.b === undef )
				return this._error();

			this.error = false;
			return this.fromInt( parseInt( ( rgb.r << 16 ) + ( rgb.g << 8 ) + rgb.b, 10 ), preserve );
		},

		fromHex: function( color ) {
			color = color.replace(/^#/, '').replace(/^0x/, '');
			if ( color.length === 3 ) {
				color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
			}

			// rough error checking - this is where things go squirrely the most
			this.error = ! /^[0-9A-F]{6}$/i.test( color );
			return this.fromInt( parseInt( color, 16 ) );
		},

		fromHsl: function( hsl ) {
			var r, g, b, q, p, h, s, l;

			if ( typeof hsl !== 'object' || hsl.h === undef || hsl.s === undef || hsl.l === undef )
				return this._error();

			this._hsl = hsl; // store it
			this._hSpace = 'hsl'; // implicit
			h = hsl.h / 360; s = hsl.s / 100; l = hsl.l / 100;
			if ( s === 0 ) {
				r = g = b = l; // achromatic
			}
			else {
				q = l < 0.5 ? l * ( 1 + s ) : l + s - l * s;
				p = 2 * l - q;
				r = this.hue2rgb( p, q, h + 1/3 );
				g = this.hue2rgb( p, q, h );
				b = this.hue2rgb( p, q, h - 1/3 );
			}
			return this.fromRgb( {
				r: r * 255,
				g: g * 255,
				b: b * 255
			}, true ); // true preserves hue/sat
		},

		fromHsv: function( hsv ) {
			var h, s, v, r, g, b, i, f, p, q, t;
			if ( typeof hsv !== 'object' || hsv.h === undef || hsv.s === undef || hsv.v === undef )
				return this._error();

			this._hsv = hsv; // store it
			this._hSpace = 'hsv'; // implicit

			h = hsv.h / 360; s = hsv.s / 100; v = hsv.v / 100;
			i = Math.floor( h * 6 );
			f = h * 6 - i;
			p = v * ( 1 - s );
			q = v * ( 1 - f * s );
			t = v * ( 1 - ( 1 - f ) * s );

			switch( i % 6 ) {
				case 0:
					r = v; g = t; b = p;
					break;
				case 1:
					r = q; g = v; b = p;
					break;
				case 2:
					r = p; g = v; b = t;
					break;
				case 3:
					r = p; g = q; b = v;
					break;
				case 4:
					r = t; g = p; b = v;
					break;
				case 5:
					r = v; g = p; b = q;
					break;
			}

			return this.fromRgb( {
				r: r * 255,
				g: g * 255,
				b: b * 255
			}, true ); // true preserves hue/sat

		},
		// everything comes down to fromInt
		fromInt: function( color, preserve ) {
			this._color = parseInt( color, 10 );

			if ( isNaN( this._color ) )
				this._color = 0;

			// let's coerce things
			if ( this._color > 16777215 )
				this._color = 16777215;
			else if ( this._color < 0 )
				this._color = 0;

			// let's not do weird things
			if ( preserve === undef ) {
				this._hsv.h = this._hsv.s = this._hsl.h = this._hsl.s = 0;
			}
			// EVENT GOES HERE
			return this;
		},

		hue2rgb: function( p, q, t ) {
			if ( t < 0 ) {
				t += 1;
			}
			if ( t > 1 ) {
				t -= 1;
			}
			if ( t < 1/6 ) {
				return p + ( q - p ) * 6 * t;
			}
			if ( t < 1/2 ) {
				return q;
			}
			if ( t < 2/3 ) {
				return p + ( q - p ) * ( 2/3 - t ) * 6;
			}
			return p;
		},

		toString: function() {
			var hex = parseInt( this._color, 10 ).toString( 16 );
			if ( this.error )
				return '';
			// maybe left pad it
			if ( hex.length < 6 ) {
				for (var i = 6 - hex.length - 1; i >= 0; i--) {
					hex = '0' + hex;
				}
			}
			return '#' + hex;
		},

		toCSS: function( type, alpha ) {
			type = type || 'hex';
			alpha = parseFloat( alpha || this._alpha );
			switch ( type ) {
				case 'rgb':
				case 'rgba':
					var rgb = this.toRgb();
					if ( alpha < 1 ) {
						return "rgba( " + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + alpha + " )";
					}
					else {
						return "rgb( " + rgb.r + ", " + rgb.g + ", " + rgb.b + " )";
					}
					break;
				case 'hsl':
				case 'hsla':
					var hsl = this.toHsl();
					if ( alpha < 1 ) {
						return "hsla( " + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%, " + alpha + " )";
					}
					else {
						return "hsl( " + hsl.h + ", " + hsl.s + "%, " + hsl.l + "% )";
					}
					break;
				default:
					return this.toString();
			}
		},

		toRgb: function() {
			return {
				r: 255 & ( this._color >> 16 ),
				g: 255 & ( this._color >> 8 ),
				b: 255 & ( this._color )
			};
		},

		toHsl: function() {
			var rgb = this.toRgb();
			var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
			var max = Math.max( r, g, b ), min = Math.min( r, g, b );
			var h, s, l = ( max + min ) / 2;

			if ( max === min ) {
				h = s = 0; // achromatic
			} else {
				var d = max - min;
				s = l > 0.5 ? d / ( 2 - max - min ) : d / ( max + min );
				switch ( max ) {
					case r: h = ( g - b ) / d + ( g < b ? 6 : 0 );
						break;
					case g: h = ( b - r ) / d + 2;
						break;
					case b: h = ( r - g ) / d + 4;
						break;
				}
				h /= 6;
			}

			// maintain hue & sat if we've been manipulating things in the HSL space.
			h = Math.round( h * 360 );
			if ( h === 0 && this._hsl.h !== h ) {
				h = this._hsl.h;
			}
			s = Math.round( s * 100 );
			if ( s === 0 && this._hsl.s ) {
				s = this._hsl.s;
			}

			return {
				h: h,
				s: s,
				l: Math.round( l * 100 )
			};

		},

		toHsv: function() {
			var rgb = this.toRgb();
			var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
			var max = Math.max( r, g, b ), min = Math.min( r, g, b );
			var h, s, v = max;
			var d = max - min;
			s = max === 0 ? 0 : d / max;

			if ( max === min ) {
				h = s = 0; // achromatic
			} else {
				switch( max ){
					case r:
						h = ( g - b ) / d + ( g < b ? 6 : 0 );
						break;
					case g:
						h = ( b - r ) / d + 2;
						break;
					case b:
						h = ( r - g ) / d + 4;
						break;
				}
				h /= 6;
			}

			// maintain hue & sat if we've been manipulating things in the HSV space.
			h = Math.round( h * 360 );
			if ( h === 0 && this._hsv.h !== h ) {
				h = this._hsv.h;
			}
			s = Math.round( s * 100 );
			if ( s === 0 && this._hsv.s ) {
				s = this._hsv.s;
			}

			return {
				h: h,
				s: s,
				v: Math.round( v * 100 )
			};
		},

		toInt: function() {
			return this._color;
		},

		toIEOctoHex: function() {
			// AARRBBGG
			var hex = this.toString();
			var AA = parseInt( 255 * this._alpha, 10 ).toString(16);
			if ( AA.length === 1 ) {
				AA = '0' + AA;
			}
			return '#' + AA + hex.replace(/^#/, '' );
		},

		toLuminosity: function() {
			var rgb = this.toRgb();
			return 0.2126 * Math.pow( rgb.r / 255, 2.2 ) + 0.7152 * Math.pow( rgb.g / 255, 2.2 ) + 0.0722 * Math.pow( rgb.b / 255, 2.2);
		},

		getDistanceLuminosityFrom: function( color ) {
			if ( ! ( color instanceof Color ) ) {
				throw 'getDistanceLuminosityFrom requires a Color object';
			}
			var lum1 = this.toLuminosity();
			var lum2 = color.toLuminosity();
			if ( lum1 > lum2 ) {
				return ( lum1 + 0.05 ) / ( lum2 + 0.05 );
			}
			else {
				return ( lum2 + 0.05 ) / ( lum1 + 0.05 );
			}
		},

		getMaxContrastColor: function() {
			var lum = this.toLuminosity();
			var hex = ( lum >= 0.5 ) ? '000000' : 'ffffff';
			return new Color( hex );
		},

		getReadableContrastingColor: function( bgColor, minContrast ) {
			if ( ! ( bgColor instanceof Color ) ) {
				return this;
			}

			// you shouldn't use less than 5, but you might want to.
			var targetContrast = ( minContrast === undef ) ? 5 : minContrast;
			// working things
			var contrast = bgColor.getDistanceLuminosityFrom( this );
			var maxContrastColor = bgColor.getMaxContrastColor();
			var maxContrast = maxContrastColor.getDistanceLuminosityFrom( bgColor );

			// if current max contrast is less than the target contrast, we had wishful thinking.
			// still, go max
			if ( maxContrast <= targetContrast ) {
				return maxContrastColor;
			}
			// or, we might already have sufficient contrast
			else if ( contrast >= targetContrast ) {
				return this;
			}

			var incr = ( 0 === maxContrastColor.toInt() ) ? -1 : 1;
			while ( contrast < targetContrast ) {
				this.l( incr, true ); // 2nd arg turns this into an incrementer
				contrast = this.getDistanceLuminosityFrom( bgColor );
				// infininite loop prevention: you never know.
				if ( this._color === 0 || this._color === 16777215 ) {
					break;
				}
			}

			return this;

		},

		a: function( val ) {
			if ( val === undef )
				return this._alpha;

			var a = parseFloat( val );

			if ( isNaN( a ) )
				return this._error();

			this._alpha = a;
			return this;
		},

		// TRANSFORMS

		darken: function( amount ) {
			amount = amount || 5;
			return this.l( - amount, true );
		},

		lighten: function( amount ) {
			amount = amount || 5;
			return this.l( amount, true );
		},

		saturate: function( amount ) {
			amount = amount || 15;
			return this.s( amount, true );
		},

		desaturate: function( amount ) {
			amount = amount || 15;
			return this.s( - amount, true );
		},

		toGrayscale: function() {
			return this.setHSpace('hsl').s( 0 );
		},

		getComplement: function() {
			return this.h( 180, true );
		},

		getSplitComplement: function( step ) {
			step = step || 1;
			var incr = 180 + ( step * 30 );
			return this.h( incr, true );
		},

		getAnalog: function( step ) {
			step = step || 1;
			var incr = step * 30;
			return this.h( incr, true );
		},

		getTetrad: function( step ) {
			step = step || 1;
			var incr = step * 60;
			return this.h( incr, true );
		},

		getTriad: function( step ) {
			step = step || 1;
			var incr = step * 120;
			return this.h( incr, true );
		},

		_partial: function( key ) {
			var prop = shortProps[key];
			return function( val, incr ) {
				var color = this._spaceFunc('to', prop.space);

				// GETTER
				if ( val === undef )
					return color[key];

				// INCREMENT
				if ( incr === true )
					val = color[key] + val;

				// MOD & RANGE
				if ( prop.mod )
					val = val % prop.mod;
				if ( prop.range )
					val = ( val < prop.range[0] ) ? prop.range[0] : ( val > prop.range[1] ) ? prop.range[1] : val;

				// NEW VALUE
				color[key] = val;

				return this._spaceFunc('from', prop.space, color);
			};
		},

		_spaceFunc: function( dir, s, val ) {
			var space = s || this._hSpace,
				funcName = dir + space.charAt(0).toUpperCase() + space.substr(1);
			return this[funcName](val);
		}
	};

	var shortProps = {
		h: {
			mod: 360
		},
		s: {
			range: [0,100]
		},
		l: {
			space: 'hsl',
			range: [0,100]
		},
		v: {
			space: 'hsv',
			range: [0,100]
		},
		r: {
			space: 'rgb',
			range: [0,255]
		},
		g: {
			space: 'rgb',
			range: [0,255]
		},
		b: {
			space: 'rgb',
			range: [0,255]
		}
	};

	for ( var key in shortProps ) {
		if ( shortProps.hasOwnProperty( key ) )
			Color.fn[key] = Color.fn._partial(key);
	}

	// play nicely with Node + browser
	if ( typeof exports === 'object' )
		module.exports = Color;
	else
		global.Color = Color;

}(this));

/*!
 * jQuery Validation Plugin v1.19.1
 *
 * https://jqueryvalidation.org/
 *
 * Copyright (c) 2019 Jörn Zaefferer
 * Released under the MIT license
 */
(function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( ["jquery"], factory );
	} else if (typeof module === "object" && module.exports) {
		module.exports = factory( require( "jquery" ) );
	} else {
		factory( jQuery );
	}
}(function( $ ) {

$.extend( $.fn, {

	// https://jqueryvalidation.org/validate/
	validate: function( options ) {

		// If nothing is selected, return nothing; can't chain anyway
		if ( !this.length ) {
			if ( options && options.debug && window.console ) {
				console.warn( "Nothing selected, can't validate, returning nothing." );
			}
			return;
		}

		// Check if a validator for this form was already created
		var validator = $.data( this[ 0 ], "validator" );
		if ( validator ) {
			return validator;
		}

		// Add novalidate tag if HTML5.
		this.attr( "novalidate", "novalidate" );

		validator = new $.validator( options, this[ 0 ] );
		$.data( this[ 0 ], "validator", validator );

		if ( validator.settings.onsubmit ) {

			this.on( "click.validate", ":submit", function( event ) {

				// Track the used submit button to properly handle scripted
				// submits later.
				validator.submitButton = event.currentTarget;

				// Allow suppressing validation by adding a cancel class to the submit button
				if ( $( this ).hasClass( "cancel" ) ) {
					validator.cancelSubmit = true;
				}

				// Allow suppressing validation by adding the html5 formnovalidate attribute to the submit button
				if ( $( this ).attr( "formnovalidate" ) !== undefined ) {
					validator.cancelSubmit = true;
				}
			} );

			// Validate the form on submit
			this.on( "submit.validate", function( event ) {
				if ( validator.settings.debug ) {

					// Prevent form submit to be able to see console output
					event.preventDefault();
				}

				function handle() {
					var hidden, result;

					// Insert a hidden input as a replacement for the missing submit button
					// The hidden input is inserted in two cases:
					//   - A user defined a `submitHandler`
					//   - There was a pending request due to `remote` method and `stopRequest()`
					//     was called to submit the form in case it's valid
					if ( validator.submitButton && ( validator.settings.submitHandler || validator.formSubmitted ) ) {
						hidden = $( "<input type='hidden'/>" )
							.attr( "name", validator.submitButton.name )
							.val( $( validator.submitButton ).val() )
							.appendTo( validator.currentForm );
					}

					if ( validator.settings.submitHandler && !validator.settings.debug ) {
						result = validator.settings.submitHandler.call( validator, validator.currentForm, event );
						if ( hidden ) {

							// And clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						if ( result !== undefined ) {
							return result;
						}
						return false;
					}
					return true;
				}

				// Prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			} );
		}

		return validator;
	},

	// https://jqueryvalidation.org/valid/
	valid: function() {
		var valid, validator, errorList;

		if ( $( this[ 0 ] ).is( "form" ) ) {
			valid = this.validate().form();
		} else {
			errorList = [];
			valid = true;
			validator = $( this[ 0 ].form ).validate();
			this.each( function() {
				valid = validator.element( this ) && valid;
				if ( !valid ) {
					errorList = errorList.concat( validator.errorList );
				}
			} );
			validator.errorList = errorList;
		}
		return valid;
	},

	// https://jqueryvalidation.org/rules/
	rules: function( command, argument ) {
		var element = this[ 0 ],
			isContentEditable = typeof this.attr( "contenteditable" ) !== "undefined" && this.attr( "contenteditable" ) !== "false",
			settings, staticRules, existingRules, data, param, filtered;

		// If nothing is selected, return empty object; can't chain anyway
		if ( element == null ) {
			return;
		}

		if ( !element.form && isContentEditable ) {
			element.form = this.closest( "form" )[ 0 ];
			element.name = this.attr( "name" );
		}

		if ( element.form == null ) {
			return;
		}

		if ( command ) {
			settings = $.data( element.form, "validator" ).settings;
			staticRules = settings.rules;
			existingRules = $.validator.staticRules( element );
			switch ( command ) {
			case "add":
				$.extend( existingRules, $.validator.normalizeRule( argument ) );

				// Remove messages from rules, but allow them to be set separately
				delete existingRules.messages;
				staticRules[ element.name ] = existingRules;
				if ( argument.messages ) {
					settings.messages[ element.name ] = $.extend( settings.messages[ element.name ], argument.messages );
				}
				break;
			case "remove":
				if ( !argument ) {
					delete staticRules[ element.name ];
					return existingRules;
				}
				filtered = {};
				$.each( argument.split( /\s/ ), function( index, method ) {
					filtered[ method ] = existingRules[ method ];
					delete existingRules[ method ];
				} );
				return filtered;
			}
		}

		data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.classRules( element ),
			$.validator.attributeRules( element ),
			$.validator.dataRules( element ),
			$.validator.staticRules( element )
		), element );

		// Make sure required is at front
		if ( data.required ) {
			param = data.required;
			delete data.required;
			data = $.extend( { required: param }, data );
		}

		// Make sure remote is at back
		if ( data.remote ) {
			param = data.remote;
			delete data.remote;
			data = $.extend( data, { remote: param } );
		}

		return data;
	}
} );

// Custom selectors
$.extend( $.expr.pseudos || $.expr[ ":" ], {		// '|| $.expr[ ":" ]' here enables backwards compatibility to jQuery 1.7. Can be removed when dropping jQ 1.7.x support

	// https://jqueryvalidation.org/blank-selector/
	blank: function( a ) {
		return !$.trim( "" + $( a ).val() );
	},

	// https://jqueryvalidation.org/filled-selector/
	filled: function( a ) {
		var val = $( a ).val();
		return val !== null && !!$.trim( "" + val );
	},

	// https://jqueryvalidation.org/unchecked-selector/
	unchecked: function( a ) {
		return !$( a ).prop( "checked" );
	}
} );

// Constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

// https://jqueryvalidation.org/jQuery.validator.format/
$.validator.format = function( source, params ) {
	if ( arguments.length === 1 ) {
		return function() {
			var args = $.makeArray( arguments );
			args.unshift( source );
			return $.validator.format.apply( this, args );
		};
	}
	if ( params === undefined ) {
		return source;
	}
	if ( arguments.length > 2 && params.constructor !== Array  ) {
		params = $.makeArray( arguments ).slice( 1 );
	}
	if ( params.constructor !== Array ) {
		params = [ params ];
	}
	$.each( params, function( i, n ) {
		source = source.replace( new RegExp( "\\{" + i + "\\}", "g" ), function() {
			return n;
		} );
	} );
	return source;
};

$.extend( $.validator, {

	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		pendingClass: "pending",
		validClass: "valid",
		errorElement: "label",
		focusCleanup: false,
		focusInvalid: true,
		errorContainer: $( [] ),
		errorLabelContainer: $( [] ),
		onsubmit: true,
		ignore: ":hidden",
		ignoreTitle: false,
		onfocusin: function( element ) {
			this.lastActive = element;

			// Hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup ) {
				if ( this.settings.unhighlight ) {
					this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				}
				this.hideThese( this.errorsFor( element ) );
			}
		},
		onfocusout: function( element ) {
			if ( !this.checkable( element ) && ( element.name in this.submitted || !this.optional( element ) ) ) {
				this.element( element );
			}
		},
		onkeyup: function( element, event ) {

			// Avoid revalidate the field when pressing one of the following keys
			// Shift       => 16
			// Ctrl        => 17
			// Alt         => 18
			// Caps lock   => 20
			// End         => 35
			// Home        => 36
			// Left arrow  => 37
			// Up arrow    => 38
			// Right arrow => 39
			// Down arrow  => 40
			// Insert      => 45
			// Num lock    => 144
			// AltGr key   => 225
			var excludedKeys = [
				16, 17, 18, 20, 35, 36, 37,
				38, 39, 40, 45, 144, 225
			];

			if ( event.which === 9 && this.elementValue( element ) === "" || $.inArray( event.keyCode, excludedKeys ) !== -1 ) {
				return;
			} else if ( element.name in this.submitted || element.name in this.invalid ) {
				this.element( element );
			}
		},
		onclick: function( element ) {

			// Click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted ) {
				this.element( element );

			// Or option elements, check parent select in that case
			} else if ( element.parentNode.name in this.submitted ) {
				this.element( element.parentNode );
			}
		},
		highlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName( element.name ).addClass( errorClass ).removeClass( validClass );
			} else {
				$( element ).addClass( errorClass ).removeClass( validClass );
			}
		},
		unhighlight: function( element, errorClass, validClass ) {
			if ( element.type === "radio" ) {
				this.findByName( element.name ).removeClass( errorClass ).addClass( validClass );
			} else {
				$( element ).removeClass( errorClass ).addClass( validClass );
			}
		}
	},

	// https://jqueryvalidation.org/jQuery.validator.setDefaults/
	setDefaults: function( settings ) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "This field is required.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date (ISO).",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		equalTo: "Please enter the same value again.",
		maxlength: $.validator.format( "Please enter no more than {0} characters." ),
		minlength: $.validator.format( "Please enter at least {0} characters." ),
		rangelength: $.validator.format( "Please enter a value between {0} and {1} characters long." ),
		range: $.validator.format( "Please enter a value between {0} and {1}." ),
		max: $.validator.format( "Please enter a value less than or equal to {0}." ),
		min: $.validator.format( "Please enter a value greater than or equal to {0}." ),
		step: $.validator.format( "Please enter a multiple of {0}." )
	},

	autoCreateRanges: false,

	prototype: {

		init: function() {
			this.labelContainer = $( this.settings.errorLabelContainer );
			this.errorContext = this.labelContainer.length && this.labelContainer || $( this.currentForm );
			this.containers = $( this.settings.errorContainer ).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();

			var currentForm = this.currentForm,
				groups = ( this.groups = {} ),
				rules;
			$.each( this.settings.groups, function( key, value ) {
				if ( typeof value === "string" ) {
					value = value.split( /\s/ );
				}
				$.each( value, function( index, name ) {
					groups[ name ] = key;
				} );
			} );
			rules = this.settings.rules;
			$.each( rules, function( key, value ) {
				rules[ key ] = $.validator.normalizeRule( value );
			} );

			function delegate( event ) {
				var isContentEditable = typeof $( this ).attr( "contenteditable" ) !== "undefined" && $( this ).attr( "contenteditable" ) !== "false";

				// Set form expando on contenteditable
				if ( !this.form && isContentEditable ) {
					this.form = $( this ).closest( "form" )[ 0 ];
					this.name = $( this ).attr( "name" );
				}

				// Ignore the element if it belongs to another form. This will happen mainly
				// when setting the `form` attribute of an input to the id of another form.
				if ( currentForm !== this.form ) {
					return;
				}

				var validator = $.data( this.form, "validator" ),
					eventType = "on" + event.type.replace( /^validate/, "" ),
					settings = validator.settings;
				if ( settings[ eventType ] && !$( this ).is( settings.ignore ) ) {
					settings[ eventType ].call( validator, this, event );
				}
			}

			$( this.currentForm )
				.on( "focusin.validate focusout.validate keyup.validate",
					":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], " +
					"[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " +
					"[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], " +
					"[type='radio'], [type='checkbox'], [contenteditable], [type='button']", delegate )

				// Support: Chrome, oldIE
				// "select" is provided as event.target when clicking a option
				.on( "click.validate", "select, option, [type='radio'], [type='checkbox']", delegate );

			if ( this.settings.invalidHandler ) {
				$( this.currentForm ).on( "invalid-form.validate", this.settings.invalidHandler );
			}
		},

		// https://jqueryvalidation.org/Validator.form/
		form: function() {
			this.checkForm();
			$.extend( this.submitted, this.errorMap );
			this.invalid = $.extend( {}, this.errorMap );
			if ( !this.valid() ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ] );
			}
			this.showErrors();
			return this.valid();
		},

		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = ( this.currentElements = this.elements() ); elements[ i ]; i++ ) {
				this.check( elements[ i ] );
			}
			return this.valid();
		},

		// https://jqueryvalidation.org/Validator.element/
		element: function( element ) {
			var cleanElement = this.clean( element ),
				checkElement = this.validationTargetFor( cleanElement ),
				v = this,
				result = true,
				rs, group;

			if ( checkElement === undefined ) {
				delete this.invalid[ cleanElement.name ];
			} else {
				this.prepareElement( checkElement );
				this.currentElements = $( checkElement );

				// If this element is grouped, then validate all group elements already
				// containing a value
				group = this.groups[ checkElement.name ];
				if ( group ) {
					$.each( this.groups, function( name, testgroup ) {
						if ( testgroup === group && name !== checkElement.name ) {
							cleanElement = v.validationTargetFor( v.clean( v.findByName( name ) ) );
							if ( cleanElement && cleanElement.name in v.invalid ) {
								v.currentElements.push( cleanElement );
								result = v.check( cleanElement ) && result;
							}
						}
					} );
				}

				rs = this.check( checkElement ) !== false;
				result = result && rs;
				if ( rs ) {
					this.invalid[ checkElement.name ] = false;
				} else {
					this.invalid[ checkElement.name ] = true;
				}

				if ( !this.numberOfInvalids() ) {

					// Hide error containers on last error
					this.toHide = this.toHide.add( this.containers );
				}
				this.showErrors();

				// Add aria-invalid status for screen readers
				$( element ).attr( "aria-invalid", !rs );
			}

			return result;
		},

		// https://jqueryvalidation.org/Validator.showErrors/
		showErrors: function( errors ) {
			if ( errors ) {
				var validator = this;

				// Add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = $.map( this.errorMap, function( message, name ) {
					return {
						message: message,
						element: validator.findByName( name )[ 0 ]
					};
				} );

				// Remove items from success list
				this.successList = $.grep( this.successList, function( element ) {
					return !( element.name in errors );
				} );
			}
			if ( this.settings.showErrors ) {
				this.settings.showErrors.call( this, this.errorMap, this.errorList );
			} else {
				this.defaultShowErrors();
			}
		},

		// https://jqueryvalidation.org/Validator.resetForm/
		resetForm: function() {
			if ( $.fn.resetForm ) {
				$( this.currentForm ).resetForm();
			}
			this.invalid = {};
			this.submitted = {};
			this.prepareForm();
			this.hideErrors();
			var elements = this.elements()
				.removeData( "previousValue" )
				.removeAttr( "aria-invalid" );

			this.resetElements( elements );
		},

		resetElements: function( elements ) {
			var i;

			if ( this.settings.unhighlight ) {
				for ( i = 0; elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ],
						this.settings.errorClass, "" );
					this.findByName( elements[ i ].name ).removeClass( this.settings.validClass );
				}
			} else {
				elements
					.removeClass( this.settings.errorClass )
					.removeClass( this.settings.validClass );
			}
		},

		numberOfInvalids: function() {
			return this.objectLength( this.invalid );
		},

		objectLength: function( obj ) {
			/* jshint unused: false */
			var count = 0,
				i;
			for ( i in obj ) {

				// This check allows counting elements with empty error
				// message as invalid elements
				if ( obj[ i ] !== undefined && obj[ i ] !== null && obj[ i ] !== false ) {
					count++;
				}
			}
			return count;
		},

		hideErrors: function() {
			this.hideThese( this.toHide );
		},

		hideThese: function( errors ) {
			errors.not( this.containers ).text( "" );
			this.addWrapper( errors ).hide();
		},

		valid: function() {
			return this.size() === 0;
		},

		size: function() {
			return this.errorList.length;
		},

		focusInvalid: function() {
			if ( this.settings.focusInvalid ) {
				try {
					$( this.findLastActive() || this.errorList.length && this.errorList[ 0 ].element || [] )
					.filter( ":visible" )
					.trigger( "focus" )

					// Manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger( "focusin" );
				} catch ( e ) {

					// Ignore IE throwing errors when focusing hidden elements
				}
			}
		},

		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep( this.errorList, function( n ) {
				return n.element.name === lastActive.name;
			} ).length === 1 && lastActive;
		},

		elements: function() {
			var validator = this,
				rulesCache = {};

			// Select all valid inputs inside the form (no submit or reset buttons)
			return $( this.currentForm )
			.find( "input, select, textarea, [contenteditable]" )
			.not( ":submit, :reset, :image, :disabled" )
			.not( this.settings.ignore )
			.filter( function() {
				var name = this.name || $( this ).attr( "name" ); // For contenteditable
				var isContentEditable = typeof $( this ).attr( "contenteditable" ) !== "undefined" && $( this ).attr( "contenteditable" ) !== "false";

				if ( !name && validator.settings.debug && window.console ) {
					console.error( "%o has no name assigned", this );
				}

				// Set form expando on contenteditable
				if ( isContentEditable ) {
					this.form = $( this ).closest( "form" )[ 0 ];
					this.name = name;
				}

				// Ignore elements that belong to other/nested forms
				if ( this.form !== validator.currentForm ) {
					return false;
				}

				// Select only the first element for each name, and only those with rules specified
				if ( name in rulesCache || !validator.objectLength( $( this ).rules() ) ) {
					return false;
				}

				rulesCache[ name ] = true;
				return true;
			} );
		},

		clean: function( selector ) {
			return $( selector )[ 0 ];
		},

		errors: function() {
			var errorClass = this.settings.errorClass.split( " " ).join( "." );
			return $( this.settings.errorElement + "." + errorClass, this.errorContext );
		},

		resetInternals: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $( [] );
			this.toHide = $( [] );
		},

		reset: function() {
			this.resetInternals();
			this.currentElements = $( [] );
		},

		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},

		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor( element );
		},

		elementValue: function( element ) {
			var $element = $( element ),
				type = element.type,
				isContentEditable = typeof $element.attr( "contenteditable" ) !== "undefined" && $element.attr( "contenteditable" ) !== "false",
				val, idx;

			if ( type === "radio" || type === "checkbox" ) {
				return this.findByName( element.name ).filter( ":checked" ).val();
			} else if ( type === "number" && typeof element.validity !== "undefined" ) {
				return element.validity.badInput ? "NaN" : $element.val();
			}

			if ( isContentEditable ) {
				val = $element.text();
			} else {
				val = $element.val();
			}

			if ( type === "file" ) {

				// Modern browser (chrome & safari)
				if ( val.substr( 0, 12 ) === "C:\\fakepath\\" ) {
					return val.substr( 12 );
				}

				// Legacy browsers
				// Unix-based path
				idx = val.lastIndexOf( "/" );
				if ( idx >= 0 ) {
					return val.substr( idx + 1 );
				}

				// Windows-based path
				idx = val.lastIndexOf( "\\" );
				if ( idx >= 0 ) {
					return val.substr( idx + 1 );
				}

				// Just the file name
				return val;
			}

			if ( typeof val === "string" ) {
				return val.replace( /\r/g, "" );
			}
			return val;
		},

		check: function( element ) {
			element = this.validationTargetFor( this.clean( element ) );

			var rules = $( element ).rules(),
				rulesCount = $.map( rules, function( n, i ) {
					return i;
				} ).length,
				dependencyMismatch = false,
				val = this.elementValue( element ),
				result, method, rule, normalizer;

			// Prioritize the local normalizer defined for this element over the global one
			// if the former exists, otherwise user the global one in case it exists.
			if ( typeof rules.normalizer === "function" ) {
				normalizer = rules.normalizer;
			} else if (	typeof this.settings.normalizer === "function" ) {
				normalizer = this.settings.normalizer;
			}

			// If normalizer is defined, then call it to retreive the changed value instead
			// of using the real one.
			// Note that `this` in the normalizer is `element`.
			if ( normalizer ) {
				val = normalizer.call( element, val );

				// Delete the normalizer from rules to avoid treating it as a pre-defined method.
				delete rules.normalizer;
			}

			for ( method in rules ) {
				rule = { method: method, parameters: rules[ method ] };
				try {
					result = $.validator.methods[ method ].call( this, val, element, rule.parameters );

					// If a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result === "dependency-mismatch" && rulesCount === 1 ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;

					if ( result === "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor( element ) );
						return;
					}

					if ( !result ) {
						this.formatAndAdd( element, rule );
						return false;
					}
				} catch ( e ) {
					if ( this.settings.debug && window.console ) {
						console.log( "Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e );
					}
					if ( e instanceof TypeError ) {
						e.message += ".  Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.";
					}

					throw e;
				}
			}
			if ( dependencyMismatch ) {
				return;
			}
			if ( this.objectLength( rules ) ) {
				this.successList.push( element );
			}
			return true;
		},

		// Return the custom message for the given element and validation method
		// specified in the element's HTML5 data attribute
		// return the generic message if present and no method specific message is present
		customDataMessage: function( element, method ) {
			return $( element ).data( "msg" + method.charAt( 0 ).toUpperCase() +
				method.substring( 1 ).toLowerCase() ) || $( element ).data( "msg" );
		},

		// Return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[ name ];
			return m && ( m.constructor === String ? m : m[ method ] );
		},

		// Return the first defined argument, allowing empty strings
		findDefined: function() {
			for ( var i = 0; i < arguments.length; i++ ) {
				if ( arguments[ i ] !== undefined ) {
					return arguments[ i ];
				}
			}
			return undefined;
		},

		// The second parameter 'rule' used to be a string, and extended to an object literal
		// of the following form:
		// rule = {
		//     method: "method name",
		//     parameters: "the given method parameters"
		// }
		//
		// The old behavior still supported, kept to maintain backward compatibility with
		// old code, and will be removed in the next major release.
		defaultMessage: function( element, rule ) {
			if ( typeof rule === "string" ) {
				rule = { method: rule };
			}

			var message = this.findDefined(
					this.customMessage( element.name, rule.method ),
					this.customDataMessage( element, rule.method ),

					// 'title' is never undefined, so handle empty string as undefined
					!this.settings.ignoreTitle && element.title || undefined,
					$.validator.messages[ rule.method ],
					"<strong>Warning: No message defined for " + element.name + "</strong>"
				),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message === "function" ) {
				message = message.call( this, rule.parameters, element );
			} else if ( theregex.test( message ) ) {
				message = $.validator.format( message.replace( theregex, "{$1}" ), rule.parameters );
			}

			return message;
		},

		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule );

			this.errorList.push( {
				message: message,
				element: element,
				method: rule.method
			} );

			this.errorMap[ element.name ] = message;
			this.submitted[ element.name ] = message;
		},

		addWrapper: function( toToggle ) {
			if ( this.settings.wrapper ) {
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			}
			return toToggle;
		},

		defaultShowErrors: function() {
			var i, elements, error;
			for ( i = 0; this.errorList[ i ]; i++ ) {
				error = this.errorList[ i ];
				if ( this.settings.highlight ) {
					this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				}
				this.showLabel( error.element, error.message );
			}
			if ( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if ( this.settings.success ) {
				for ( i = 0; this.successList[ i ]; i++ ) {
					this.showLabel( this.successList[ i ] );
				}
			}
			if ( this.settings.unhighlight ) {
				for ( i = 0, elements = this.validElements(); elements[ i ]; i++ ) {
					this.settings.unhighlight.call( this, elements[ i ], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},

		validElements: function() {
			return this.currentElements.not( this.invalidElements() );
		},

		invalidElements: function() {
			return $( this.errorList ).map( function() {
				return this.element;
			} );
		},

		showLabel: function( element, message ) {
			var place, group, errorID, v,
				error = this.errorsFor( element ),
				elementID = this.idOrName( element ),
				describedBy = $( element ).attr( "aria-describedby" );

			if ( error.length ) {

				// Refresh error/success class
				error.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );

				// Replace message on existing label
				error.html( message );
			} else {

				// Create error element
				error = $( "<" + this.settings.errorElement + ">" )
					.attr( "id", elementID + "-error" )
					.addClass( this.settings.errorClass )
					.html( message || "" );

				// Maintain reference to the element to be placed into the DOM
				place = error;
				if ( this.settings.wrapper ) {

					// Make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					place = error.hide().show().wrap( "<" + this.settings.wrapper + "/>" ).parent();
				}
				if ( this.labelContainer.length ) {
					this.labelContainer.append( place );
				} else if ( this.settings.errorPlacement ) {
					this.settings.errorPlacement.call( this, place, $( element ) );
				} else {
					place.insertAfter( element );
				}

				// Link error back to the element
				if ( error.is( "label" ) ) {

					// If the error is a label, then associate using 'for'
					error.attr( "for", elementID );

					// If the element is not a child of an associated label, then it's necessary
					// to explicitly apply aria-describedby
				} else if ( error.parents( "label[for='" + this.escapeCssMeta( elementID ) + "']" ).length === 0 ) {
					errorID = error.attr( "id" );

					// Respect existing non-error aria-describedby
					if ( !describedBy ) {
						describedBy = errorID;
					} else if ( !describedBy.match( new RegExp( "\\b" + this.escapeCssMeta( errorID ) + "\\b" ) ) ) {

						// Add to end of list if not already present
						describedBy += " " + errorID;
					}
					$( element ).attr( "aria-describedby", describedBy );

					// If this element is grouped, then assign to all elements in the same group
					group = this.groups[ element.name ];
					if ( group ) {
						v = this;
						$.each( v.groups, function( name, testgroup ) {
							if ( testgroup === group ) {
								$( "[name='" + v.escapeCssMeta( name ) + "']", v.currentForm )
									.attr( "aria-describedby", error.attr( "id" ) );
							}
						} );
					}
				}
			}
			if ( !message && this.settings.success ) {
				error.text( "" );
				if ( typeof this.settings.success === "string" ) {
					error.addClass( this.settings.success );
				} else {
					this.settings.success( error, element );
				}
			}
			this.toShow = this.toShow.add( error );
		},

		errorsFor: function( element ) {
			var name = this.escapeCssMeta( this.idOrName( element ) ),
				describer = $( element ).attr( "aria-describedby" ),
				selector = "label[for='" + name + "'], label[for='" + name + "'] *";

			// 'aria-describedby' should directly reference the error element
			if ( describer ) {
				selector = selector + ", #" + this.escapeCssMeta( describer )
					.replace( /\s+/g, ", #" );
			}

			return this
				.errors()
				.filter( selector );
		},

		// See https://api.jquery.com/category/selectors/, for CSS
		// meta-characters that should be escaped in order to be used with JQuery
		// as a literal part of a name/id or any selector.
		escapeCssMeta: function( string ) {
			return string.replace( /([\\!"#$%&'()*+,./:;<=>?@\[\]^`{|}~])/g, "\\$1" );
		},

		idOrName: function( element ) {
			return this.groups[ element.name ] || ( this.checkable( element ) ? element.name : element.id || element.name );
		},

		validationTargetFor: function( element ) {

			// If radio/checkbox, validate first element in group instead
			if ( this.checkable( element ) ) {
				element = this.findByName( element.name );
			}

			// Always apply ignore filter
			return $( element ).not( this.settings.ignore )[ 0 ];
		},

		checkable: function( element ) {
			return ( /radio|checkbox/i ).test( element.type );
		},

		findByName: function( name ) {
			return $( this.currentForm ).find( "[name='" + this.escapeCssMeta( name ) + "']" );
		},

		getLength: function( value, element ) {
			switch ( element.nodeName.toLowerCase() ) {
			case "select":
				return $( "option:selected", element ).length;
			case "input":
				if ( this.checkable( element ) ) {
					return this.findByName( element.name ).filter( ":checked" ).length;
				}
			}
			return value.length;
		},

		depend: function( param, element ) {
			return this.dependTypes[ typeof param ] ? this.dependTypes[ typeof param ]( param, element ) : true;
		},

		dependTypes: {
			"boolean": function( param ) {
				return param;
			},
			"string": function( param, element ) {
				return !!$( param, element.form ).length;
			},
			"function": function( param, element ) {
				return param( element );
			}
		},

		optional: function( element ) {
			var val = this.elementValue( element );
			return !$.validator.methods.required.call( this, val, element ) && "dependency-mismatch";
		},

		startRequest: function( element ) {
			if ( !this.pending[ element.name ] ) {
				this.pendingRequest++;
				$( element ).addClass( this.settings.pendingClass );
				this.pending[ element.name ] = true;
			}
		},

		stopRequest: function( element, valid ) {
			this.pendingRequest--;

			// Sometimes synchronization fails, make sure pendingRequest is never < 0
			if ( this.pendingRequest < 0 ) {
				this.pendingRequest = 0;
			}
			delete this.pending[ element.name ];
			$( element ).removeClass( this.settings.pendingClass );
			if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() ) {
				$( this.currentForm ).submit();

				// Remove the hidden input that was used as a replacement for the
				// missing submit button. The hidden input is added by `handle()`
				// to ensure that the value of the used submit button is passed on
				// for scripted submits triggered by this method
				if ( this.submitButton ) {
					$( "input:hidden[name='" + this.submitButton.name + "']", this.currentForm ).remove();
				}

				this.formSubmitted = false;
			} else if ( !valid && this.pendingRequest === 0 && this.formSubmitted ) {
				$( this.currentForm ).triggerHandler( "invalid-form", [ this ] );
				this.formSubmitted = false;
			}
		},

		previousValue: function( element, method ) {
			method = typeof method === "string" && method || "remote";

			return $.data( element, "previousValue" ) || $.data( element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, { method: method } )
			} );
		},

		// Cleans up all forms and elements, removes validator-specific events
		destroy: function() {
			this.resetForm();

			$( this.currentForm )
				.off( ".validate" )
				.removeData( "validator" )
				.find( ".validate-equalTo-blur" )
					.off( ".validate-equalTo" )
					.removeClass( "validate-equalTo-blur" )
				.find( ".validate-lessThan-blur" )
					.off( ".validate-lessThan" )
					.removeClass( "validate-lessThan-blur" )
				.find( ".validate-lessThanEqual-blur" )
					.off( ".validate-lessThanEqual" )
					.removeClass( "validate-lessThanEqual-blur" )
				.find( ".validate-greaterThanEqual-blur" )
					.off( ".validate-greaterThanEqual" )
					.removeClass( "validate-greaterThanEqual-blur" )
				.find( ".validate-greaterThan-blur" )
					.off( ".validate-greaterThan" )
					.removeClass( "validate-greaterThan-blur" );
		}

	},

	classRuleSettings: {
		required: { required: true },
		email: { email: true },
		url: { url: true },
		date: { date: true },
		dateISO: { dateISO: true },
		number: { number: true },
		digits: { digits: true },
		creditcard: { creditcard: true }
	},

	addClassRules: function( className, rules ) {
		if ( className.constructor === String ) {
			this.classRuleSettings[ className ] = rules;
		} else {
			$.extend( this.classRuleSettings, className );
		}
	},

	classRules: function( element ) {
		var rules = {},
			classes = $( element ).attr( "class" );

		if ( classes ) {
			$.each( classes.split( " " ), function() {
				if ( this in $.validator.classRuleSettings ) {
					$.extend( rules, $.validator.classRuleSettings[ this ] );
				}
			} );
		}
		return rules;
	},

	normalizeAttributeRule: function( rules, type, method, value ) {

		// Convert the value to a number for number inputs, and for text for backwards compability
		// allows type="date" and others to be compared as strings
		if ( /min|max|step/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {
			value = Number( value );

			// Support Opera Mini, which returns NaN for undefined minlength
			if ( isNaN( value ) ) {
				value = undefined;
			}
		}

		if ( value || value === 0 ) {
			rules[ method ] = value;
		} else if ( type === method && type !== "range" ) {

			// Exception: the jquery validate 'range' method
			// does not test for the html5 'range' type
			rules[ method ] = true;
		}
	},

	attributeRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {

			// Support for <input required> in both html5 and older browsers
			if ( method === "required" ) {
				value = element.getAttribute( method );

				// Some browsers return an empty string for the required attribute
				// and non-HTML5 browsers might have required="" markup
				if ( value === "" ) {
					value = true;
				}

				// Force non-HTML5 browsers to return bool
				value = !!value;
			} else {
				value = $element.attr( method );
			}

			this.normalizeAttributeRule( rules, type, method, value );
		}

		// 'maxlength' may be returned as -1, 2147483647 ( IE ) and 524288 ( safari ) for text inputs
		if ( rules.maxlength && /-1|2147483647|524288/.test( rules.maxlength ) ) {
			delete rules.maxlength;
		}

		return rules;
	},

	dataRules: function( element ) {
		var rules = {},
			$element = $( element ),
			type = element.getAttribute( "type" ),
			method, value;

		for ( method in $.validator.methods ) {
			value = $element.data( "rule" + method.charAt( 0 ).toUpperCase() + method.substring( 1 ).toLowerCase() );

			// Cast empty attributes like `data-rule-required` to `true`
			if ( value === "" ) {
				value = true;
			}

			this.normalizeAttributeRule( rules, type, method, value );
		}
		return rules;
	},

	staticRules: function( element ) {
		var rules = {},
			validator = $.data( element.form, "validator" );

		if ( validator.settings.rules ) {
			rules = $.validator.normalizeRule( validator.settings.rules[ element.name ] ) || {};
		}
		return rules;
	},

	normalizeRules: function( rules, element ) {

		// Handle dependency check
		$.each( rules, function( prop, val ) {

			// Ignore rule when param is explicitly false, eg. required:false
			if ( val === false ) {
				delete rules[ prop ];
				return;
			}
			if ( val.param || val.depends ) {
				var keepRule = true;
				switch ( typeof val.depends ) {
				case "string":
					keepRule = !!$( val.depends, element.form ).length;
					break;
				case "function":
					keepRule = val.depends.call( element, element );
					break;
				}
				if ( keepRule ) {
					rules[ prop ] = val.param !== undefined ? val.param : true;
				} else {
					$.data( element.form, "validator" ).resetElements( $( element ) );
					delete rules[ prop ];
				}
			}
		} );

		// Evaluate parameters
		$.each( rules, function( rule, parameter ) {
			rules[ rule ] = $.isFunction( parameter ) && rule !== "normalizer" ? parameter( element ) : parameter;
		} );

		// Clean number parameters
		$.each( [ "minlength", "maxlength" ], function() {
			if ( rules[ this ] ) {
				rules[ this ] = Number( rules[ this ] );
			}
		} );
		$.each( [ "rangelength", "range" ], function() {
			var parts;
			if ( rules[ this ] ) {
				if ( $.isArray( rules[ this ] ) ) {
					rules[ this ] = [ Number( rules[ this ][ 0 ] ), Number( rules[ this ][ 1 ] ) ];
				} else if ( typeof rules[ this ] === "string" ) {
					parts = rules[ this ].replace( /[\[\]]/g, "" ).split( /[\s,]+/ );
					rules[ this ] = [ Number( parts[ 0 ] ), Number( parts[ 1 ] ) ];
				}
			}
		} );

		if ( $.validator.autoCreateRanges ) {

			// Auto-create ranges
			if ( rules.min != null && rules.max != null ) {
				rules.range = [ rules.min, rules.max ];
				delete rules.min;
				delete rules.max;
			}
			if ( rules.minlength != null && rules.maxlength != null ) {
				rules.rangelength = [ rules.minlength, rules.maxlength ];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}

		return rules;
	},

	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function( data ) {
		if ( typeof data === "string" ) {
			var transformed = {};
			$.each( data.split( /\s/ ), function() {
				transformed[ this ] = true;
			} );
			data = transformed;
		}
		return data;
	},

	// https://jqueryvalidation.org/jQuery.validator.addMethod/
	addMethod: function( name, method, message ) {
		$.validator.methods[ name ] = method;
		$.validator.messages[ name ] = message !== undefined ? message : $.validator.messages[ name ];
		if ( method.length < 3 ) {
			$.validator.addClassRules( name, $.validator.normalizeRule( name ) );
		}
	},

	// https://jqueryvalidation.org/jQuery.validator.methods/
	methods: {

		// https://jqueryvalidation.org/required-method/
		required: function( value, element, param ) {

			// Check if dependency is met
			if ( !this.depend( param, element ) ) {
				return "dependency-mismatch";
			}
			if ( element.nodeName.toLowerCase() === "select" ) {

				// Could be an array for select-multiple or a string, both are fine this way
				var val = $( element ).val();
				return val && val.length > 0;
			}
			if ( this.checkable( element ) ) {
				return this.getLength( value, element ) > 0;
			}
			return value !== undefined && value !== null && value.length > 0;
		},

		// https://jqueryvalidation.org/email-method/
		email: function( value, element ) {

			// From https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
			// Retrieved 2014-01-14
			// If you have a problem with this implementation, report a bug against the above spec
			// Or use custom methods to implement your own email validation
			return this.optional( element ) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
		},

		// https://jqueryvalidation.org/url-method/
		url: function( value, element ) {

			// Copyright (c) 2010-2013 Diego Perini, MIT licensed
			// https://gist.github.com/dperini/729294
			// see also https://mathiasbynens.be/demo/url-regex
			// modified to allow protocol-relative URLs
			return this.optional( element ) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( value );
		},

		// https://jqueryvalidation.org/date-method/
		date: ( function() {
			var called = false;

			return function( value, element ) {
				if ( !called ) {
					called = true;
					if ( this.settings.debug && window.console ) {
						console.warn(
							"The `date` method is deprecated and will be removed in version '2.0.0'.\n" +
							"Please don't use it, since it relies on the Date constructor, which\n" +
							"behaves very differently across browsers and locales. Use `dateISO`\n" +
							"instead or one of the locale specific methods in `localizations/`\n" +
							"and `additional-methods.js`."
						);
					}
				}

				return this.optional( element ) || !/Invalid|NaN/.test( new Date( value ).toString() );
			};
		}() ),

		// https://jqueryvalidation.org/dateISO-method/
		dateISO: function( value, element ) {
			return this.optional( element ) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test( value );
		},

		// https://jqueryvalidation.org/number-method/
		number: function( value, element ) {
			return this.optional( element ) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value );
		},

		// https://jqueryvalidation.org/digits-method/
		digits: function( value, element ) {
			return this.optional( element ) || /^\d+$/.test( value );
		},

		// https://jqueryvalidation.org/minlength-method/
		minlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length >= param;
		},

		// https://jqueryvalidation.org/maxlength-method/
		maxlength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || length <= param;
		},

		// https://jqueryvalidation.org/rangelength-method/
		rangelength: function( value, element, param ) {
			var length = $.isArray( value ) ? value.length : this.getLength( value, element );
			return this.optional( element ) || ( length >= param[ 0 ] && length <= param[ 1 ] );
		},

		// https://jqueryvalidation.org/min-method/
		min: function( value, element, param ) {
			return this.optional( element ) || value >= param;
		},

		// https://jqueryvalidation.org/max-method/
		max: function( value, element, param ) {
			return this.optional( element ) || value <= param;
		},

		// https://jqueryvalidation.org/range-method/
		range: function( value, element, param ) {
			return this.optional( element ) || ( value >= param[ 0 ] && value <= param[ 1 ] );
		},

		// https://jqueryvalidation.org/step-method/
		step: function( value, element, param ) {
			var type = $( element ).attr( "type" ),
				errorMessage = "Step attribute on input type " + type + " is not supported.",
				supportedTypes = [ "text", "number", "range" ],
				re = new RegExp( "\\b" + type + "\\b" ),
				notSupported = type && !re.test( supportedTypes.join() ),
				decimalPlaces = function( num ) {
					var match = ( "" + num ).match( /(?:\.(\d+))?$/ );
					if ( !match ) {
						return 0;
					}

					// Number of digits right of decimal point.
					return match[ 1 ] ? match[ 1 ].length : 0;
				},
				toInt = function( num ) {
					return Math.round( num * Math.pow( 10, decimals ) );
				},
				valid = true,
				decimals;

			// Works only for text, number and range input types
			// TODO find a way to support input types date, datetime, datetime-local, month, time and week
			if ( notSupported ) {
				throw new Error( errorMessage );
			}

			decimals = decimalPlaces( param );

			// Value can't have too many decimals
			if ( decimalPlaces( value ) > decimals || toInt( value ) % toInt( param ) !== 0 ) {
				valid = false;
			}

			return this.optional( element ) || valid;
		},

		// https://jqueryvalidation.org/equalTo-method/
		equalTo: function( value, element, param ) {

			// Bind to the blur event of the target in order to revalidate whenever the target field is updated
			var target = $( param );
			if ( this.settings.onfocusout && target.not( ".validate-equalTo-blur" ).length ) {
				target.addClass( "validate-equalTo-blur" ).on( "blur.validate-equalTo", function() {
					$( element ).valid();
				} );
			}
			return value === target.val();
		},

		// https://jqueryvalidation.org/remote-method/
		remote: function( value, element, param, method ) {
			if ( this.optional( element ) ) {
				return "dependency-mismatch";
			}

			method = typeof method === "string" && method || "remote";

			var previous = this.previousValue( element, method ),
				validator, data, optionDataString;

			if ( !this.settings.messages[ element.name ] ) {
				this.settings.messages[ element.name ] = {};
			}
			previous.originalMessage = previous.originalMessage || this.settings.messages[ element.name ][ method ];
			this.settings.messages[ element.name ][ method ] = previous.message;

			param = typeof param === "string" && { url: param } || param;
			optionDataString = $.param( $.extend( { data: value }, param.data ) );
			if ( previous.old === optionDataString ) {
				return previous.valid;
			}

			previous.old = optionDataString;
			validator = this;
			this.startRequest( element );
			data = {};
			data[ element.name ] = value;
			$.ajax( $.extend( true, {
				mode: "abort",
				port: "validate" + element.name,
				dataType: "json",
				data: data,
				context: validator.currentForm,
				success: function( response ) {
					var valid = response === true || response === "true",
						errors, message, submitted;

					validator.settings.messages[ element.name ][ method ] = previous.originalMessage;
					if ( valid ) {
						submitted = validator.formSubmitted;
						validator.resetInternals();
						validator.toHide = validator.errorsFor( element );
						validator.formSubmitted = submitted;
						validator.successList.push( element );
						validator.invalid[ element.name ] = false;
						validator.showErrors();
					} else {
						errors = {};
						message = response || validator.defaultMessage( element, { method: method, parameters: value } );
						errors[ element.name ] = previous.message = message;
						validator.invalid[ element.name ] = true;
						validator.showErrors( errors );
					}
					previous.valid = valid;
					validator.stopRequest( element, valid );
				}
			}, param ) );
			return "pending";
		}
	}

} );

// Ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()

var pendingRequests = {},
	ajax;

// Use a prefilter if available (1.5+)
if ( $.ajaxPrefilter ) {
	$.ajaxPrefilter( function( settings, _, xhr ) {
		var port = settings.port;
		if ( settings.mode === "abort" ) {
			if ( pendingRequests[ port ] ) {
				pendingRequests[ port ].abort();
			}
			pendingRequests[ port ] = xhr;
		}
	} );
} else {

	// Proxy ajax
	ajax = $.ajax;
	$.ajax = function( settings ) {
		var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
			port = ( "port" in settings ? settings : $.ajaxSettings ).port;
		if ( mode === "abort" ) {
			if ( pendingRequests[ port ] ) {
				pendingRequests[ port ].abort();
			}
			pendingRequests[ port ] = ajax.apply( this, arguments );
			return pendingRequests[ port ];
		}
		return ajax.apply( this, arguments );
	};
}
return $;
}));
(function($) {
    "use strict";

        $( window ).on( 'load', function() {
            formtasticInit();
        });

        function formtasticInit() {
            var form;

            var ft_url = function formastic_url_parameter( sParam ) {
                var sPageURL = decodeURIComponent( window.location.search.substring(1) ),
                    sURLVariables = sPageURL.split( '&' ),
                    sParameterName,
                    i;

                for ( i = 0; i < sURLVariables.length; i++ ) {
                    sParameterName = sURLVariables[i].split( '=' );

                    if ( sParameterName[0] === sParam ) {
                        return sParameterName[1] === undefined ? true : sParameterName[1];
                    }
                }
            };

            if ( ft.lang_code == 'fr' ) {
                form = ft_url( 'formulaire' );

            } else {
                form = ft_url( 'form' );
            }

            if ( typeof form !== 'undefined' ) {
                setTimeout( function() {
                    formtastic_scroll( '#' + form );
                }, 500 );
            }

            function formtastic_scroll( target ) {
                var speed   = parseInt( $( target ).attr( 'data-speed' ) ),
                    offset  = parseInt( $( target ).attr( 'data-offset' ) ),
                    tag     = $( target ).attr( 'data-tag' ),
                    element = $( target ).closest( tag );

                $( 'html, body' ).animate( {
                    scrollTop: element.offset().top - offset
                }, speed, 'linear', function() {

                });

                return false;
            }

            $( '.ft-validate' ).on( 'submit', function() {
                var form = $( this );

                if ( ! form.valid() ) {
                    return false;
                }

                if ( typeof ft.use_captcha !== 'undefined' && ft.use_captcha == 'yes' && typeof ft.site_key !== 'undefined' && ft.site_key !== '' ) {
                    event.preventDefault();

                    grecaptcha.ready( function() {
                        grecaptcha.execute( ft.site_key, { action: 'formtastic' } ).then( function( token ) {
                            form.find( 'input[name="g-recaptcha-response"]' ).val( token );

                            form.unbind( 'submit' ).submit();
                        });
                    });
                }
            });

            $( '.ft-validate' ).each( function() {
                $( this ).validate({
                    errorElement: 'span',
                    errorLabelContainer: '.ft-check',
                    errorClass: 'invalid-feedback',
                    validClass: 'ft-success is-valid',
                    highlight: function( element, errorClass, validClass ) {
                        $( element )
                            // .closest( '.ft-field' )
                            .addClass( 'ft-invalid is-invalid' )
                            .removeClass( validClass );

                        if ( typeof pageScroll !== 'undefined' ) {
                            setTimeout( function() {
                                pageScroll.setSize();
                            }, 300);
                        }
                    },
                    unhighlight: function( element, errorClass, validClass ) {
                        $( element )
                            // .closest( '.ft-field' )
                            .removeClass( 'ft-invalid is-invalid' )
                            .addClass( validClass );

                        if ( typeof pageScroll !== 'undefined' ) {
                            setTimeout( function() {
                                pageScroll.setSize();
                            }, 300);
                        }
                    },
                    errorPlacement: function( error, element ) {
                        error.appendTo( element.closest( '.ft-field' ) );
                    }
                });
            });

            $.validator.addMethod( 'ft-tel', function( value, element ) {
                // return this.optional( element ) || /^([1][- ]?)?[\(]?[2-9][0-9]{2}[\)]?[- ]?[0-9]{3}[- ]?[0-9]{4}$/.test( value );
                return this.optional( element ) || /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/.test( value );
            });

            $.validator.addMethod( 'ft-number', function( value, element ) {
                return this.optional( element ) || /^(-{1})?[0-9]+(\.[0-9]{1,})?$/.test( value );
            });

            $.validator.addMethod( 'ft-email', function( value, element ) {
                return this.optional( element ) || /^[a-zA-Z0-9._-]+@[a-z0-9.-]{2,}[.][a-z]{2,5}$/.test( value );
            });

            $.validator.addMethod( 'ft-name', function( value, element ) {
                return this.optional( element ) || /^[a-zA-ZÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ' -]{3,}$/.test( value );
            });

            $.validator.addMethod( 'ft-postal', function( value, element ) {
                return this.optional( element ) || /^[AaBbCcEeGgHhJjKkLlMmNnPpRrSsTtVvXxYy]{1}\d{1}[A-Za-z]{1} *\d{1}[A-Za-z]{1}\d{1}$/.test( value );
            });

            $.validator.addMethod( 'ft-url', function( value, element ) {
                return this.optional( element ) || /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test( value );
            });

            $.validator.addMethod( 'ft-time', function( value, element ) {
                return this.optional( element ) || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test( value );
            });

            $.validator.addMethod( 'ft-color', function( value, element ) {
                return this.optional( element ) || /^([#]?[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test( value );
            });

            if ( $( '.ft-input--date' ).length ) {
                $( '.ft-input--date' ).each( function() {
                    var me     = $( this ),
                        min    = me.attr( 'data-min' ),
                        max    = me.attr( 'data-max' ),
                        format = me.attr( 'data-format' );

                    $( '.ft-input--date' ).datepicker({
                        dateFormat: format,
                        onSelect: function() {
                            var validator = $( this ).closest( 'form' ).validate();

                            validator.element( $( this ) );
                        },
                        minDate: min,
                        maxDate: max,
                        changeMonth: false,
                        changeYear: false
                    }, $.datepicker.regional[ ft.lang_code ]);
                });
            }

            if ( $( '.ft-range' ).length ) {
                $( '.ft-range' ).each( function() {
                    var me    = $( this ),
                        min   = me.attr( 'data-min' ),
                        max   = me.attr( 'data-max' ),
                        step  = me.attr( 'data-step' ),
                        value = me.attr( 'data-value' );

                    me.slider({
                        step: parseInt( step ),
                        min: parseInt( min ),
                        max: parseInt( max ),
                        value: parseInt( value ),
                        slide: function( event, ui ) {
                            $( '#' + me.attr( 'data-input' ) ).val( ui.value );
                        }
                    });
                });
            }

            if ( $( '.ft-input--file' ).length ) {
                $( '.ft-input--file' ).on( 'change', function() {
                    var validator = $( this ).closest( 'form' ).validate();

                    validator.element( $( this ) );
                });
            }

            if ( $( '.ft-input--address' ).length ) {
                $( '.ft-input--address' ).each( function() {
                    var options  = {
                            // type: ['(cities'],
                            // componentRestrictions: {
                            //     country: 'ca'
                            // }
                        },
                        input    = document.getElementById( $( this ).attr( 'id' ) ),
                        autocomplete = new google.maps.places.Autocomplete( input, options);

                    autocomplete.addListener( 'place_changed', function() {
                        var place = autocomplete.getPlace();

                        // console.log( place.geometry.location.lat() );
                    });
                });
            }

            if ( $( '.ft-input--color' ).length ) {
                $( '.ft-input--color' ).iris({
                    change: function( event, ui ) {
                        $( this ).parent().find( '.ft-color' ).css( 'background', ui.color.toString() );
                    }
                });

                $( '.ft-input--color' ).each( function() {
                    var color = $( this ).val();

                    $( this ).iris( 'color', color );
                });

                $( '.ft-input--color, .iris-picker, .iris-picker-inner' ).on( 'click', function( event ) {
                    event.stopPropagation();
                });

                $( document ).on( 'click', function( event ) {
                    $( '.ft-input--color' ).iris( 'hide' );
                });

                $( '.ft-input--color' ).on( 'click', function( event ) {
                    $( '.ft-input--color' ).iris( 'hide' );

                    $( this ).iris( 'show' );
                });
            }

            if ( $( '.ft-input--checkbox' ).length ) {
                $( '.ft-input--checkbox' ).each( function() {
                    var me     = $( this ),
                        max    = me.attr( 'data-max' ),
                        chosen = me.find( 'input:checked' ).length;

                    me.attr( 'data-chosen', chosen );

                    if ( chosen >= max ) {
                        disable_checkbox( me );
                    }
                });

                $( '.ft-input--checkbox input' ).on( 'change', function() {
                    var me = $( this ),
                        holder = me.closest( '.ft-input--checkbox' ),
                        max    = holder.attr( 'data-max' ),
                        chosen = holder.attr( 'data-chosen' );

                    if ( me.is( ':checked' ) ) {
                        if ( chosen < max ) {
                            holder.attr( 'data-chosen', parseInt( chosen ) + 1 );

                            if ( ( parseInt( chosen ) + 1 ) == max ) {
                                disable_checkbox( holder );
                            }
                        }

                    } else {
                        holder.attr( 'data-chosen', parseInt( chosen ) - 1 );

                        if ( ( parseInt( chosen ) - 1 ) < max ) {
                            enable_checkbox( holder );
                        }
                    }
                });
            }

            if ( $( '.ft-repeater' ).length ) {
                $( '.ft-repeater' ).each( function() {
                    var me     = $( this ).closest( '.ft-field--redo' );

                    me.find( 'input' ).val( '1' );
                });

                $( '.ft-repeater' ).on( 'click', function() {
                    var me     = $( this ).closest( '.ft-field--redo' ),
                        number = me.find( 'input' ).val(),
                        id     = me.attr( 'id' ),
                        els    = [],
                        clone  = me.closest( '.ft-row' ).find( '.ft-field' ).not( '.ft-field--redo' ).not( '.ft-clone' ).clone();

                    if ( parseInt( number ) < parseInt( me.find( 'input' ).attr( 'data-max' ) ) ) {
                        number++;

                        if ( parseInt( number ) == parseInt( me.find( 'input' ).attr( 'data-max' ) ) ) {
                            $( this ).prop( 'disabled', true );
                        }

                        me.find( 'input' ).val( number );

                        clone.each( function() {
                            var id   = $( this ).attr( 'data-id' ),
                                name = $( this ).attr( 'data-name' );

                            $( this )
                                .removeAttr( 'id' )
                                .attr( 'data-clone', number )
                                .addClass( 'ft-clone' )
                                .find( 'input' ).attr( 'id', id + '-clone-' + number ).end()
                                .find( 'input' ).attr( 'name', id + '-clone-' + number ).end()
                                .find( 'select' ).attr( 'id', id + '-clone-' + number ).end()
                                .find( 'select' ).attr( 'name', id + '-clone-' + number );

                            $( this ).insertBefore( me );
                        });

                        me.closest( '.ft-row' )
                            .find( '[data-clone=' + number + ']' )
                            .wrapAll( '<div class="ft-clone-line col-12"><div class="row ft-row"></div><a href="#" class="ft-delete">&times;</a></div>' );
                    }
                });
            }

            $( document ).on( 'click', '.ft-delete', function() {
                var me = $( this ),
                    number = me.closest( '.ft-row' ).find( '.ft-field--redo input' ).val();

                number--;

                me.closest( '.ft-row' ).find( '.ft-field--redo input' ).val( number );
                me.closest( '.ft-row' ).find( '.ft-field--redo .ft-repeater' ).prop( 'disabled', false );

                me.closest( '.ft-clone-line' ).remove();

                return false;
            });

            function disable_checkbox( holder ) {
                holder.find( 'input' ).each( function() {
                    if ( ! $( this ).is( ':checked' ) ) {
                        $( this ).prop( 'disabled', true );
                    }
                });
            }

            function enable_checkbox( holder ) {
                holder.find( 'input' ).each( function() {
                    $( this ).prop( 'disabled', false );
                });
            }

            autofill();
            targets();
        }

        function autofill() {
            if ( $( '.ft-autofill' ).length ) {
                $( '.ft-autofill a' ).on( 'click', function() {
                    var form   = $( this ).closest( 'form' ),
                        fields = {};

                    form.find( '.ft-field' ).each( function() {
                        if ( ! $( this ).is( '.ft-field--submit' ) ) {
                            var type = $( this ).attr( 'data-type' ),
                                name = $( this ).find( ':input:not(button)' ).attr( 'name' );

                            fields[name] = type;
                        }
                    });

                    $.each( fields, function( key, value ) {
                        switch ( value ) {
                            case 'name' :
                                $( '#' + key ).val( generateName() );
                                break;

                            case 'email' :
                                $( '#' + key ).val( generateEmail() );
                                break;

                            case 'tel' :
                                $( '#' + key ).val( generatePhone() );
                                break;

                            case 'password' :
                                $( '#' + key ).val( generatePassword() );
                                break;

                            case 'postal' :
                                $( '#' + key ).val( generatePostal() );
                                break;

                            case 'date' :
                                generateDate( key );
                                break;

                            case 'time' :
                                $( '#' + key ).val( generateTime() );
                                break;

                            case 'color' :
                                $( '#' + key ).iris( 'color', generateColor() );
                                break;

                            case 'number' :
                                $( '#' + key ).val( generateNumber( key ) );
                                break;

                            case 'range' :
                                var number = generateNumber( key );
                                $( '#' + key ).val( number ).parent().find( '.ft-range' ).slider( 'value', number );
                                break;

                            case 'text' :
                            case 'address' :
                            case 'search' :
                                $( '#' + key ).val( generateText() );
                                break;

                            case 'url' :
                                $( '#' + key ).val( generateUrl() );
                                break;

                            case 'select' :
                                selectChoice( key );
                                break;

                            case 'radio' :
                                radioChoice( form, key );
                                break;

                            case 'checkbox' :
                                radioChoice( form, key );
                                break;

                            case 'textarea' :
                                generateTextarea( key );
                                break;
                        }
                    });

                    form.valid();

                    return false;
                });
            }
        }

        function targets() {
            function hideTargets( ids ) {
                if ( typeof ids !== 'undefined' ) {
                    ids = ids.split( ',' );

                    for ( var i = 0; i < ids.length; i++ ) {
                        if ( $( '#' + $.trim( ids[i] ) ).is( 'fieldset' ) ) {
                            $( '#' + $.trim( ids[i] ) )
                                .hide()
                                .find( ':input' )
                                .prop( 'disabled', true );

                        } else if ( $( '#' + $.trim( ids[i] ) ).is( 'div' ) ) {
                            $( '#' + $.trim( ids[i] ) )
                                .closest( '.ft-field' )
                                .hide()
                                .find( ':input' )
                                .prop( 'disabled', true );

                        } else {
                            $( '#' + $.trim( ids[i] ) )
                                .prop( 'disabled', true )
                                .closest( '.ft-field' )
                                .hide();
                        }
                    }
                }
            }

            function showTargets( ids ) {
                if ( typeof ids !== 'undefined' ) {
                    ids = ids.split( ',' );

                    for ( var i = 0; i < ids.length; i++ ) {
                        if ( $( '#' + $.trim( ids[i] ) ).is( 'fieldset' ) ) {
                            $( '#' + $.trim( ids[i] ) )
                                .show()
                                .find( ':input' )
                                .prop( 'disabled', false );

                        } else if ( $( '#' + $.trim( ids[i] ) ).is( 'div' ) ) {
                            $( '#' + $.trim( ids[i] ) )
                                .closest( '.ft-field' )
                                .show()
                                .find( ':input' )
                                .prop( 'disabled', false );

                        } else {
                            $( '#' + $.trim( ids[i] ) )
                                .prop( 'disabled', false )
                                .closest( '.ft-field' )
                                .show();
                        }
                    }
                }
            }

            if ( $( '[data-ft-target]' ) ) {
                $( '[data-ft-target]' ).each( function() {
                    var me  = $( this ),
                        ids = me.attr( 'data-ft-target' );

                    if ( me.is( 'option' ) ) {
                        if ( ! me.prop( 'selected' ) ) {
                            hideTargets( ids );
                        }

                    } else {
                        if ( ! me.prop( 'checked' ) ) {
                            hideTargets( ids );
                        }
                    }

                    me.closest( '.ft-field' ).addClass( 'ft-conditions' );
                });

                $( '[data-ft-target]' ).each( function() {
                    var me  = $( this ),
                        ids = me.attr( 'data-ft-target' );

                    if ( me.is( 'option' ) ) {
                        if ( me.prop( 'selected' ) ) {
                            showTargets( ids );
                        }

                    } else {
                        if ( me.prop( 'checked' ) ) {
                            showTargets( ids );
                        }
                    }

                    me.closest( '.ft-field' ).addClass( 'ft-conditions' );
                });

                $( document ).on( 'change', '.ft-conditions input, .ft-conditions select', function() {
                    var me = $( this ),
                        ids = '';

                    if ( me.is( 'select' ) ) {
                        var sel = me.val(),
                            values = [];

                        if ( $.isArray( sel ) ) {
                            for ( var i = 0; i < sel.length; i++ ) {
                                var target = me.find( '[value="' + sel[i] + '"]' ).attr( 'data-ft-target' );

                                if ( typeof target !== 'undefined' ) {
                                    values.push( target );
                                }
                            }

                            ids = values.join( ',' );

                        } else {
                            ids = me.find( ':selected' ).attr( 'data-ft-target' );
                        }

                    } else {
                        ids = me.attr( 'data-ft-target' );
                    }

                    me.closest( '.ft-field' ).find( '[data-ft-target]' ).each( function() {
                        var me = $( this );

                        hideTargets( me.attr( 'data-ft-target' ) );
                    });

                    if ( ids !== '' ) {
                        if ( me.is( '[type=checkbox]' ) ) {
                            if ( me.prop( 'checked' ) == false ) {
                                hideTargets( ids );

                            } else {
                                showTargets( ids );
                            }

                        } else {
                            showTargets( ids );
                        }
                    }
                });
            }
        }

        function rndN( min, max ) {
            return Math.floor( Math.random() * ( max - min + 1 ) + min );
        }

        function generateName() {
            var firstArr  = ['Sébas', 'Dav', 'Jean', 'Carl', 'Jona', 'Ém', 'Mar', 'Sam', 'Ian', 'Mik', 'Alex', 'Sa', 'André', 'Ga', 'Tur', 'Dés', 'Spoo', 'Beau', 'Lab', 'Lév', 'Ja', 'Orfa', 'Mich', 'Mor', 'Parent', 'Rob', 'Bois', 'Lan', 'Lemi', 'Rous' ],
                middleArr = ['tien', 'id', 'carl', 'than', 'lie', 'ie', 'uel', 'andre', 'anne', 'gné', 'cotte', 'lets', 'ner', 'lieu', 'orde', 'esque', 'ques', 'chaud', 'eau', 'erge', 'vert', 'dry', 're', 'seau'],
                name      = firstArr[Math.floor( Math.random() * firstArr.length )] + middleArr[Math.floor( Math.random() * middleArr.length )];

            return name;
        }

        function generateEmail() {
            var firstArr  = ['sebas', 'cav', 'jean', 'max', 'carl', 'jona', 'em', 'chris', 'mar', 'an', 'sam', 'ian', 'mik', 'alex', 'sa', 'andre', 'ga', 'tur', 'des', 'rey', 'spoo', 'beau', 'lab', 'lev', 'ja', 'orfa', 'mich', 'mor', 'parent', 'rob', 'bois', 'lan', 'lemi', 'rous' ],
                lastArr   = ['tien', 'id', 'carl', 'ime', 'than', 'lie', 'tian', 'ie', 'uel', 'andre', 'anne', 'gne', 'cotte', 'lets', 'ner', 'lieu', 'orde', 'esque', 'ques', 'chaud', 'eau', 'erge', 'vert', 'dry', 're', 'seau'],
                name      = firstArr[Math.floor( Math.random() * firstArr.length )] + lastArr[Math.floor( Math.random() * lastArr.length )],
                domainArr = ['gmail.com', 'msn.com', 'outlook.com', 'zoho.com', 'yahoo.com', 'yandex.com', 'inbox.com', 'mail.com'],
                j         = Math.floor( Math.random() * domainArr.length );

            return name + '@' + domainArr[j];
        }

        function generatePassword() {
            return 'pwd';
        }

        function generateUrl() {
            var firstArr  = ['fire', 'water', 'flame', 'metal', 'punk', 'pop', 'snow', 'skate', 'smooth', 'soft', 'palm', 'hard', 'electric', 'liquid', 'death', 'blue', 'red', 'pink', 'white', 'black', 'super', 'extra'],
                lastArr   = ['banana', 'apple', 'bone', 'chair', 'head', 'tree', 'deck', 'plant', 'board', 'sky', 'star', 'cloud', 'heart', 'porn', 'rainbow', 'chocolate', 'helmet', 'phone', 'beach'],
                name      = firstArr[Math.floor( Math.random() * firstArr.length )] + lastArr[Math.floor( Math.random() * lastArr.length )],
                domainArr = ['.com', '.net', '.org', '.info', '.biz', '.us', '.ca', '.eu', '.co', '.co', '.mobi', '.asia', '.xxx'],
                j         = Math.floor( Math.random() * domainArr.length );

            return 'http://' + name + domainArr[j];
        }

        function generatePhone() {
            var indArr = ['367', '418', '438', '450', '514', '579', '581', '819', '873'],
                i      = Math.floor( Math.random() * indArr.length );

            return indArr[i] + '-' + rndN( 100, 999 ) + '-' + rndN( 1000, 9999 );
        }

        function generatePostal() {
            var postalArr = ['A', 'B', 'C', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'X', 'Y'];

            return postalArr[rndN( 0, 17 )] + rndN( 0, 9 ) + postalArr[rndN( 0, 17 )] + ' ' + rndN( 0, 9 ) + postalArr[rndN( 0, 17 )] + rndN( 0, 9 );
        }

        function generateColor() {
            var letters = '0123456789ABCDEF',
                color   = '#';

            for ( var i = 0; i < 6; i++ ) {
                color += letters[ Math.floor( Math.random() * 16 ) ];
            }

            return color;
        }

        function generateNumber( key ) {
            var field = $( '#' + key ),
                min   = field.attr( 'min' ),
                max   = field.attr( 'max' );

            if ( typeof max === 'undefined' ) {
                max = 100;
            }

            return rndN( min, max );
        }

        function generateDate( key ) {
            var field  = $( '#' + key ),
                format = field.attr( 'data-format' ),
                min    = field.attr( 'data-min' ),
                max    = field.attr( 'data-max' ),
                day    = rndN( 1, 28 ),
                month  = rndN( 1, 12 ),
                year   = rndN( 1900, 2100 );

            // var date = new Date( year, month, day );
            var date = ( '0' + month ).slice( -2 ) + '/' + ( '0' + day ).slice( -2 ) + '/' + year;

            field.datepicker( 'setDate', date ).datepicker( 'refresh' );
        }

        function generateTime( key ) {
            var hour = rndN( 0, 23 ),
                min  = rndN( 0, 59 );

            if ( hour < 10 ) {
                hour = '0' + hour;
            }

            if ( min < 10 ) {
                min = '0' + min;
            }

            return hour + ':' + min;
        }

        function generateText() {
            var textArr = ['Lorem ipsum dolor sit amet', 'Consectetur adipiscing elit', 'Aliquam sit amet libero dolor', 'Nulla urna quam efficitur vel', 'Consequat eget tempor in quam', 'Cras convallis diam a congue efficitur', 'Curabitur elit magna, porttitor a velit pharetra', 'Dignissim fringilla tellus', 'In lobortis elit ac vulputate pellentesque', 'Vivamus sollicitudin volutpat arcu'],
                i       = Math.floor( Math.random() * textArr.length );

            return textArr[i];
        }

        function generateTextarea( key ) {
            var field   = $( '#' + key ),
                textArr = [
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sit amet libero dolor. Nulla urna quam, efficitur vel consequat eget, tempor in quam. Cras convallis diam a congue efficitur. Curabitur elit magna, porttitor a velit pharetra, dignissim fringilla tellus. In lobortis elit ac vulputate pellentesque. Vivamus sollicitudin volutpat arcu, at luctus ligula pellentesque at. Aliquam nulla sapien, dapibus vel iaculis ornare, congue non ipsum. Nullam dapibus tortor vitae metus egestas interdum. In egestas ante sem, a faucibus sapien lacinia non. Mauris suscipit lobortis nisl, id posuere dolor vestibulum ut. Morbi ut mollis tortor. Interdum et malesuada fames ac ante ipsum primis in faucibus. Cras semper consequat sem nec cursus.',
                    'Sed volutpat lorem ac ligula dapibus ullamcorper. Suspendisse hendrerit elit at neque hendrerit ullamcorper. Duis diam arcu, hendrerit et lacus vel, vulputate lobortis eros. Nulla a elementum nisi. Nullam non imperdiet nunc. Morbi rutrum, metus a iaculis ultrices, odio ipsum pharetra justo, nec tincidunt mauris lorem a diam. Nam vitae rhoncus nibh. Aliquam maximus elit ut laoreet tempus. Morbi maximus tristique aliquet. Proin orci enim, lacinia at vestibulum eget, fringilla vel ante. Integer et condimentum sapien.',
                    'Nullam maximus condimentum nulla ut rutrum. Duis dignissim velit fringilla, euismod metus quis, eleifend lectus. Vestibulum faucibus, magna imperdiet maximus pharetra, tortor turpis ullamcorper magna, sed vulputate lorem odio a nunc. Duis lobortis nec quam eget iaculis. Vivamus vel enim ut nisi tincidunt iaculis eu sed tellus. Ut congue iaculis gravida. Curabitur posuere, sapien non suscipit congue, turpis felis sagittis magna, ac consectetur ligula est sit amet sem. Vestibulum quis pretium nulla, eget posuere ex. Mauris tincidunt lectus nec semper consectetur.',
                    'Pellentesque maximus dapibus iaculis. Aliquam tempus turpis turpis, id pulvinar nulla ultrices a. Proin ut porttitor risus, quis fermentum sem. Sed eget enim blandit, varius eros sed, tincidunt eros. Maecenas in condimentum augue. Suspendisse mauris arcu, rutrum vel scelerisque sed, facilisis quis sem. Duis at nibh gravida, bibendum ex sed, congue libero. Donec luctus tellus justo. Curabitur in sollicitudin quam.',
                    'Donec elementum rutrum dolor, at maximus mi finibus at. Duis cursus tincidunt sapien id vulputate. Maecenas quam quam, varius ut diam et, porta vehicula sem. Aliquam lorem turpis, dignissim eget venenatis sed, hendrerit id erat. Nulla purus ipsum, pellentesque eu condimentum a, volutpat in lacus. Pellentesque ullamcorper non nibh vel mollis. Mauris sed pretium justo. Quisque volutpat ullamcorper blandit. Etiam gravida euismod velit vitae ullamcorper. Maecenas velit leo, egestas vel eros eu, dictum dignissim justo.'
                ],
                paras = rndN( 1, 5 ),
                custom = '';

            for( var i = 1; i <= paras; i++) {
                var k = Math.floor( Math.random() * textArr.length );

                custom += textArr[k];

                if ( i !== paras ) {
                    custom += '\n\n';
                }
            }

            field.val( custom );
        }

        function selectChoice( key ) {
            var field      = $( '#' + key.replace( '[]', '' ) ),
                optionsArr = [];

            if ( field.is( 'select' ) ) {
                field.find( 'option' ).each( function() {
                    if ( $( this ).val() !== '' ) {
                        optionsArr.push( $( this ).val() );
                    }
                });
            }

            var i = Math.floor( Math.random() * optionsArr.length );

            field.val( optionsArr[i] ).change();
        }

        function radioChoice( form, key ) {
            var optionsArr = [];

            form.find( 'input[name="' + key + '"]' ).each( function() {
                $( this ).prop( 'checked', false ).change();

                optionsArr.push( $( this ) );
            });

            var i = Math.floor( Math.random() * optionsArr.length );

            form.find( optionsArr[i] ).prop( 'checked', true ).change();
        }

}(jQuery));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbG9yLmpzIiwiaXJpcy5qcyIsInZhbGlkYXRlLmpzIiwiZm9ybXRhc3RpYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2puREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImZvcm10YXN0aWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgQ29sb3IuanMgLSB2MS4xLjAgLSAyMDE1LTEyLTE3XG4qIGh0dHBzOi8vZ2l0aHViLmNvbS9BdXRvbWF0dGljL0NvbG9yLmpzXG4qIENvcHlyaWdodCAoYykgMjAxNSBNYXR0IFdpZWJlOyBMaWNlbnNlZCBHUEx2MiAqL1xuKGZ1bmN0aW9uKGdsb2JhbCwgdW5kZWYpIHtcblxuXHR2YXIgQ29sb3IgPSBmdW5jdGlvbiggY29sb3IsIHR5cGUgKSB7XG5cdFx0aWYgKCAhICggdGhpcyBpbnN0YW5jZW9mIENvbG9yICkgKVxuXHRcdFx0cmV0dXJuIG5ldyBDb2xvciggY29sb3IsIHR5cGUgKTtcblxuXHRcdHJldHVybiB0aGlzLl9pbml0KCBjb2xvciwgdHlwZSApO1xuXHR9O1xuXG5cdENvbG9yLmZuID0gQ29sb3IucHJvdG90eXBlID0ge1xuXHRcdF9jb2xvcjogMCxcblx0XHRfYWxwaGE6IDEsXG5cdFx0ZXJyb3I6IGZhbHNlLFxuXHRcdC8vIGZvciBwcmVzZXJ2aW5nIGh1ZS9zYXQgaW4gZnJvbUhzbCgpLnRvSHNsKCkgZmxvd3Ncblx0XHRfaHNsOiB7IGg6IDAsIHM6IDAsIGw6IDAgfSxcblx0XHQvLyBmb3IgcHJlc2VydmluZyBodWUvc2F0IGluIGZyb21Ic3YoKS50b0hzdigpIGZsb3dzXG5cdFx0X2hzdjogeyBoOiAwLCBzOiAwLCB2OiAwIH0sXG5cdFx0Ly8gZm9yIHNldHRpbmcgaHNsIG9yIGhzdiBzcGFjZSAtIG5lZWRlZCBmb3IgLmgoKSAmIC5zKCkgZnVuY3Rpb25zIHRvIGZ1bmN0aW9uIHByb3Blcmx5XG5cdFx0X2hTcGFjZTogJ2hzbCcsXG5cdFx0X2luaXQ6IGZ1bmN0aW9uKCBjb2xvciApIHtcblx0XHRcdHZhciBmdW5jID0gJ25vb3AnO1xuXHRcdFx0c3dpdGNoICggdHlwZW9mIGNvbG9yICkge1xuXHRcdFx0XHRcdGNhc2UgJ29iamVjdCc6XG5cdFx0XHRcdFx0XHQvLyBhbHBoYT9cblx0XHRcdFx0XHRcdGlmICggY29sb3IuYSAhPT0gdW5kZWYgKVxuXHRcdFx0XHRcdFx0XHR0aGlzLmEoIGNvbG9yLmEgKTtcblx0XHRcdFx0XHRcdGZ1bmMgPSAoIGNvbG9yLnIgIT09IHVuZGVmICkgPyAnZnJvbVJnYicgOlxuXHRcdFx0XHRcdFx0XHQoIGNvbG9yLmwgIT09IHVuZGVmICkgPyAnZnJvbUhzbCcgOlxuXHRcdFx0XHRcdFx0XHQoIGNvbG9yLnYgIT09IHVuZGVmICkgPyAnZnJvbUhzdicgOiBmdW5jO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXNbZnVuY10oIGNvbG9yICk7XG5cdFx0XHRcdFx0Y2FzZSAnc3RyaW5nJzpcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLmZyb21DU1MoIGNvbG9yICk7XG5cdFx0XHRcdFx0Y2FzZSAnbnVtYmVyJzpcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLmZyb21JbnQoIHBhcnNlSW50KCBjb2xvciwgMTAgKSApO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdF9lcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmVycm9yID0gdHJ1ZTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHRjbG9uZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbmV3Q29sb3IgPSBuZXcgQ29sb3IoIHRoaXMudG9JbnQoKSApLFxuXHRcdFx0XHRjb3B5ID0gWydfYWxwaGEnLCAnX2hTcGFjZScsICdfaHNsJywgJ19oc3YnLCAnZXJyb3InXTtcblx0XHRcdGZvciAoIHZhciBpID0gY29weS5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcblx0XHRcdFx0bmV3Q29sb3JbIGNvcHlbaV0gXSA9IHRoaXNbIGNvcHlbaV0gXTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuZXdDb2xvcjtcblx0XHR9LFxuXG5cdFx0c2V0SFNwYWNlOiBmdW5jdGlvbiggc3BhY2UgKSB7XG5cdFx0XHR0aGlzLl9oU3BhY2UgPSAoIHNwYWNlID09PSAnaHN2JyApID8gc3BhY2UgOiAnaHNsJztcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHRub29wOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHRmcm9tQ1NTOiBmdW5jdGlvbiggY29sb3IgKSB7XG5cdFx0XHR2YXIgbGlzdCxcblx0XHRcdFx0bGVhZGluZ1JFID0gL14ocmdifGhzKGx8dikpYT9cXCgvO1xuXHRcdFx0dGhpcy5lcnJvciA9IGZhbHNlO1xuXG5cdFx0XHQvLyB3aGl0ZXNwYWNlIGFuZCBzZW1pY29sb24gdHJpbVxuXHRcdFx0Y29sb3IgPSBjb2xvci5yZXBsYWNlKC9eXFxzKy8sICcnKS5yZXBsYWNlKC9cXHMrJC8sICcnKS5yZXBsYWNlKC87JC8sICcnKTtcblxuXHRcdFx0aWYgKCBjb2xvci5tYXRjaChsZWFkaW5nUkUpICYmIGNvbG9yLm1hdGNoKC9cXCkkLykgKSB7XG5cdFx0XHRcdGxpc3QgPSBjb2xvci5yZXBsYWNlKC8oXFxzfCUpL2csICcnKS5yZXBsYWNlKGxlYWRpbmdSRSwgJycpLnJlcGxhY2UoLyw/XFwpOz8kLywgJycpLnNwbGl0KCcsJyk7XG5cblx0XHRcdFx0aWYgKCBsaXN0Lmxlbmd0aCA8IDMgKVxuXHRcdFx0XHRcdHJldHVybiB0aGlzLl9lcnJvcigpO1xuXG5cdFx0XHRcdGlmICggbGlzdC5sZW5ndGggPT09IDQgKSB7XG5cdFx0XHRcdFx0dGhpcy5hKCBwYXJzZUZsb2F0KCBsaXN0LnBvcCgpICkgKTtcblx0XHRcdFx0XHQvLyBlcnJvciBzdGF0ZSBoYXMgYmVlbiBzZXQgdG8gdHJ1ZSBpbiAuYSgpIGlmIHdlIHBhc3NlZCBOYU5cblx0XHRcdFx0XHRpZiAoIHRoaXMuZXJyb3IgKVxuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmb3IgKHZhciBpID0gbGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdFx0XHRcdGxpc3RbaV0gPSBwYXJzZUludChsaXN0W2ldLCAxMCk7XG5cdFx0XHRcdFx0aWYgKCBpc05hTiggbGlzdFtpXSApIClcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLl9lcnJvcigpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCBjb2xvci5tYXRjaCgvXnJnYi8pICkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmZyb21SZ2IoIHtcblx0XHRcdFx0XHRcdHI6IGxpc3RbMF0sXG5cdFx0XHRcdFx0XHRnOiBsaXN0WzFdLFxuXHRcdFx0XHRcdFx0YjogbGlzdFsyXVxuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0fSBlbHNlIGlmICggY29sb3IubWF0Y2goL15oc3YvKSApIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5mcm9tSHN2KCB7XG5cdFx0XHRcdFx0XHRoOiBsaXN0WzBdLFxuXHRcdFx0XHRcdFx0czogbGlzdFsxXSxcblx0XHRcdFx0XHRcdHY6IGxpc3RbMl1cblx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZnJvbUhzbCgge1xuXHRcdFx0XHRcdFx0aDogbGlzdFswXSxcblx0XHRcdFx0XHRcdHM6IGxpc3RbMV0sXG5cdFx0XHRcdFx0XHRsOiBsaXN0WzJdXG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBtdXN0IGJlIGhleCBhbWlyaXRlP1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5mcm9tSGV4KCBjb2xvciApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRmcm9tUmdiOiBmdW5jdGlvbiggcmdiLCBwcmVzZXJ2ZSApIHtcblx0XHRcdGlmICggdHlwZW9mIHJnYiAhPT0gJ29iamVjdCcgfHwgcmdiLnIgPT09IHVuZGVmIHx8IHJnYi5nID09PSB1bmRlZiB8fCByZ2IuYiA9PT0gdW5kZWYgKVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5fZXJyb3IoKTtcblxuXHRcdFx0dGhpcy5lcnJvciA9IGZhbHNlO1xuXHRcdFx0cmV0dXJuIHRoaXMuZnJvbUludCggcGFyc2VJbnQoICggcmdiLnIgPDwgMTYgKSArICggcmdiLmcgPDwgOCApICsgcmdiLmIsIDEwICksIHByZXNlcnZlICk7XG5cdFx0fSxcblxuXHRcdGZyb21IZXg6IGZ1bmN0aW9uKCBjb2xvciApIHtcblx0XHRcdGNvbG9yID0gY29sb3IucmVwbGFjZSgvXiMvLCAnJykucmVwbGFjZSgvXjB4LywgJycpO1xuXHRcdFx0aWYgKCBjb2xvci5sZW5ndGggPT09IDMgKSB7XG5cdFx0XHRcdGNvbG9yID0gY29sb3JbMF0gKyBjb2xvclswXSArIGNvbG9yWzFdICsgY29sb3JbMV0gKyBjb2xvclsyXSArIGNvbG9yWzJdO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyByb3VnaCBlcnJvciBjaGVja2luZyAtIHRoaXMgaXMgd2hlcmUgdGhpbmdzIGdvIHNxdWlycmVseSB0aGUgbW9zdFxuXHRcdFx0dGhpcy5lcnJvciA9ICEgL15bMC05QS1GXXs2fSQvaS50ZXN0KCBjb2xvciApO1xuXHRcdFx0cmV0dXJuIHRoaXMuZnJvbUludCggcGFyc2VJbnQoIGNvbG9yLCAxNiApICk7XG5cdFx0fSxcblxuXHRcdGZyb21Ic2w6IGZ1bmN0aW9uKCBoc2wgKSB7XG5cdFx0XHR2YXIgciwgZywgYiwgcSwgcCwgaCwgcywgbDtcblxuXHRcdFx0aWYgKCB0eXBlb2YgaHNsICE9PSAnb2JqZWN0JyB8fCBoc2wuaCA9PT0gdW5kZWYgfHwgaHNsLnMgPT09IHVuZGVmIHx8IGhzbC5sID09PSB1bmRlZiApXG5cdFx0XHRcdHJldHVybiB0aGlzLl9lcnJvcigpO1xuXG5cdFx0XHR0aGlzLl9oc2wgPSBoc2w7IC8vIHN0b3JlIGl0XG5cdFx0XHR0aGlzLl9oU3BhY2UgPSAnaHNsJzsgLy8gaW1wbGljaXRcblx0XHRcdGggPSBoc2wuaCAvIDM2MDsgcyA9IGhzbC5zIC8gMTAwOyBsID0gaHNsLmwgLyAxMDA7XG5cdFx0XHRpZiAoIHMgPT09IDAgKSB7XG5cdFx0XHRcdHIgPSBnID0gYiA9IGw7IC8vIGFjaHJvbWF0aWNcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRxID0gbCA8IDAuNSA/IGwgKiAoIDEgKyBzICkgOiBsICsgcyAtIGwgKiBzO1xuXHRcdFx0XHRwID0gMiAqIGwgLSBxO1xuXHRcdFx0XHRyID0gdGhpcy5odWUycmdiKCBwLCBxLCBoICsgMS8zICk7XG5cdFx0XHRcdGcgPSB0aGlzLmh1ZTJyZ2IoIHAsIHEsIGggKTtcblx0XHRcdFx0YiA9IHRoaXMuaHVlMnJnYiggcCwgcSwgaCAtIDEvMyApO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXMuZnJvbVJnYigge1xuXHRcdFx0XHRyOiByICogMjU1LFxuXHRcdFx0XHRnOiBnICogMjU1LFxuXHRcdFx0XHRiOiBiICogMjU1XG5cdFx0XHR9LCB0cnVlICk7IC8vIHRydWUgcHJlc2VydmVzIGh1ZS9zYXRcblx0XHR9LFxuXG5cdFx0ZnJvbUhzdjogZnVuY3Rpb24oIGhzdiApIHtcblx0XHRcdHZhciBoLCBzLCB2LCByLCBnLCBiLCBpLCBmLCBwLCBxLCB0O1xuXHRcdFx0aWYgKCB0eXBlb2YgaHN2ICE9PSAnb2JqZWN0JyB8fCBoc3YuaCA9PT0gdW5kZWYgfHwgaHN2LnMgPT09IHVuZGVmIHx8IGhzdi52ID09PSB1bmRlZiApXG5cdFx0XHRcdHJldHVybiB0aGlzLl9lcnJvcigpO1xuXG5cdFx0XHR0aGlzLl9oc3YgPSBoc3Y7IC8vIHN0b3JlIGl0XG5cdFx0XHR0aGlzLl9oU3BhY2UgPSAnaHN2JzsgLy8gaW1wbGljaXRcblxuXHRcdFx0aCA9IGhzdi5oIC8gMzYwOyBzID0gaHN2LnMgLyAxMDA7IHYgPSBoc3YudiAvIDEwMDtcblx0XHRcdGkgPSBNYXRoLmZsb29yKCBoICogNiApO1xuXHRcdFx0ZiA9IGggKiA2IC0gaTtcblx0XHRcdHAgPSB2ICogKCAxIC0gcyApO1xuXHRcdFx0cSA9IHYgKiAoIDEgLSBmICogcyApO1xuXHRcdFx0dCA9IHYgKiAoIDEgLSAoIDEgLSBmICkgKiBzICk7XG5cblx0XHRcdHN3aXRjaCggaSAlIDYgKSB7XG5cdFx0XHRcdGNhc2UgMDpcblx0XHRcdFx0XHRyID0gdjsgZyA9IHQ7IGIgPSBwO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIDE6XG5cdFx0XHRcdFx0ciA9IHE7IGcgPSB2OyBiID0gcDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdHIgPSBwOyBnID0gdjsgYiA9IHQ7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHRyID0gcDsgZyA9IHE7IGIgPSB2O1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0ciA9IHQ7IGcgPSBwOyBiID0gdjtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSA1OlxuXHRcdFx0XHRcdHIgPSB2OyBnID0gcDsgYiA9IHE7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzLmZyb21SZ2IoIHtcblx0XHRcdFx0cjogciAqIDI1NSxcblx0XHRcdFx0ZzogZyAqIDI1NSxcblx0XHRcdFx0YjogYiAqIDI1NVxuXHRcdFx0fSwgdHJ1ZSApOyAvLyB0cnVlIHByZXNlcnZlcyBodWUvc2F0XG5cblx0XHR9LFxuXHRcdC8vIGV2ZXJ5dGhpbmcgY29tZXMgZG93biB0byBmcm9tSW50XG5cdFx0ZnJvbUludDogZnVuY3Rpb24oIGNvbG9yLCBwcmVzZXJ2ZSApIHtcblx0XHRcdHRoaXMuX2NvbG9yID0gcGFyc2VJbnQoIGNvbG9yLCAxMCApO1xuXG5cdFx0XHRpZiAoIGlzTmFOKCB0aGlzLl9jb2xvciApIClcblx0XHRcdFx0dGhpcy5fY29sb3IgPSAwO1xuXG5cdFx0XHQvLyBsZXQncyBjb2VyY2UgdGhpbmdzXG5cdFx0XHRpZiAoIHRoaXMuX2NvbG9yID4gMTY3NzcyMTUgKVxuXHRcdFx0XHR0aGlzLl9jb2xvciA9IDE2Nzc3MjE1O1xuXHRcdFx0ZWxzZSBpZiAoIHRoaXMuX2NvbG9yIDwgMCApXG5cdFx0XHRcdHRoaXMuX2NvbG9yID0gMDtcblxuXHRcdFx0Ly8gbGV0J3Mgbm90IGRvIHdlaXJkIHRoaW5nc1xuXHRcdFx0aWYgKCBwcmVzZXJ2ZSA9PT0gdW5kZWYgKSB7XG5cdFx0XHRcdHRoaXMuX2hzdi5oID0gdGhpcy5faHN2LnMgPSB0aGlzLl9oc2wuaCA9IHRoaXMuX2hzbC5zID0gMDtcblx0XHRcdH1cblx0XHRcdC8vIEVWRU5UIEdPRVMgSEVSRVxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdGh1ZTJyZ2I6IGZ1bmN0aW9uKCBwLCBxLCB0ICkge1xuXHRcdFx0aWYgKCB0IDwgMCApIHtcblx0XHRcdFx0dCArPSAxO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCB0ID4gMSApIHtcblx0XHRcdFx0dCAtPSAxO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCB0IDwgMS82ICkge1xuXHRcdFx0XHRyZXR1cm4gcCArICggcSAtIHAgKSAqIDYgKiB0O1xuXHRcdFx0fVxuXHRcdFx0aWYgKCB0IDwgMS8yICkge1xuXHRcdFx0XHRyZXR1cm4gcTtcblx0XHRcdH1cblx0XHRcdGlmICggdCA8IDIvMyApIHtcblx0XHRcdFx0cmV0dXJuIHAgKyAoIHEgLSBwICkgKiAoIDIvMyAtIHQgKSAqIDY7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcDtcblx0XHR9LFxuXG5cdFx0dG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGhleCA9IHBhcnNlSW50KCB0aGlzLl9jb2xvciwgMTAgKS50b1N0cmluZyggMTYgKTtcblx0XHRcdGlmICggdGhpcy5lcnJvciApXG5cdFx0XHRcdHJldHVybiAnJztcblx0XHRcdC8vIG1heWJlIGxlZnQgcGFkIGl0XG5cdFx0XHRpZiAoIGhleC5sZW5ndGggPCA2ICkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gNiAtIGhleC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdFx0XHRcdGhleCA9ICcwJyArIGhleDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuICcjJyArIGhleDtcblx0XHR9LFxuXG5cdFx0dG9DU1M6IGZ1bmN0aW9uKCB0eXBlLCBhbHBoYSApIHtcblx0XHRcdHR5cGUgPSB0eXBlIHx8ICdoZXgnO1xuXHRcdFx0YWxwaGEgPSBwYXJzZUZsb2F0KCBhbHBoYSB8fCB0aGlzLl9hbHBoYSApO1xuXHRcdFx0c3dpdGNoICggdHlwZSApIHtcblx0XHRcdFx0Y2FzZSAncmdiJzpcblx0XHRcdFx0Y2FzZSAncmdiYSc6XG5cdFx0XHRcdFx0dmFyIHJnYiA9IHRoaXMudG9SZ2IoKTtcblx0XHRcdFx0XHRpZiAoIGFscGhhIDwgMSApIHtcblx0XHRcdFx0XHRcdHJldHVybiBcInJnYmEoIFwiICsgcmdiLnIgKyBcIiwgXCIgKyByZ2IuZyArIFwiLCBcIiArIHJnYi5iICsgXCIsIFwiICsgYWxwaGEgKyBcIiApXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuIFwicmdiKCBcIiArIHJnYi5yICsgXCIsIFwiICsgcmdiLmcgKyBcIiwgXCIgKyByZ2IuYiArIFwiIClcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ2hzbCc6XG5cdFx0XHRcdGNhc2UgJ2hzbGEnOlxuXHRcdFx0XHRcdHZhciBoc2wgPSB0aGlzLnRvSHNsKCk7XG5cdFx0XHRcdFx0aWYgKCBhbHBoYSA8IDEgKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gXCJoc2xhKCBcIiArIGhzbC5oICsgXCIsIFwiICsgaHNsLnMgKyBcIiUsIFwiICsgaHNsLmwgKyBcIiUsIFwiICsgYWxwaGEgKyBcIiApXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuIFwiaHNsKCBcIiArIGhzbC5oICsgXCIsIFwiICsgaHNsLnMgKyBcIiUsIFwiICsgaHNsLmwgKyBcIiUgKVwiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy50b1N0cmluZygpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHR0b1JnYjogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyOiAyNTUgJiAoIHRoaXMuX2NvbG9yID4+IDE2ICksXG5cdFx0XHRcdGc6IDI1NSAmICggdGhpcy5fY29sb3IgPj4gOCApLFxuXHRcdFx0XHRiOiAyNTUgJiAoIHRoaXMuX2NvbG9yIClcblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHRvSHNsOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciByZ2IgPSB0aGlzLnRvUmdiKCk7XG5cdFx0XHR2YXIgciA9IHJnYi5yIC8gMjU1LCBnID0gcmdiLmcgLyAyNTUsIGIgPSByZ2IuYiAvIDI1NTtcblx0XHRcdHZhciBtYXggPSBNYXRoLm1heCggciwgZywgYiApLCBtaW4gPSBNYXRoLm1pbiggciwgZywgYiApO1xuXHRcdFx0dmFyIGgsIHMsIGwgPSAoIG1heCArIG1pbiApIC8gMjtcblxuXHRcdFx0aWYgKCBtYXggPT09IG1pbiApIHtcblx0XHRcdFx0aCA9IHMgPSAwOyAvLyBhY2hyb21hdGljXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgZCA9IG1heCAtIG1pbjtcblx0XHRcdFx0cyA9IGwgPiAwLjUgPyBkIC8gKCAyIC0gbWF4IC0gbWluICkgOiBkIC8gKCBtYXggKyBtaW4gKTtcblx0XHRcdFx0c3dpdGNoICggbWF4ICkge1xuXHRcdFx0XHRcdGNhc2UgcjogaCA9ICggZyAtIGIgKSAvIGQgKyAoIGcgPCBiID8gNiA6IDAgKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgZzogaCA9ICggYiAtIHIgKSAvIGQgKyAyO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBiOiBoID0gKCByIC0gZyApIC8gZCArIDQ7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRoIC89IDY7XG5cdFx0XHR9XG5cblx0XHRcdC8vIG1haW50YWluIGh1ZSAmIHNhdCBpZiB3ZSd2ZSBiZWVuIG1hbmlwdWxhdGluZyB0aGluZ3MgaW4gdGhlIEhTTCBzcGFjZS5cblx0XHRcdGggPSBNYXRoLnJvdW5kKCBoICogMzYwICk7XG5cdFx0XHRpZiAoIGggPT09IDAgJiYgdGhpcy5faHNsLmggIT09IGggKSB7XG5cdFx0XHRcdGggPSB0aGlzLl9oc2wuaDtcblx0XHRcdH1cblx0XHRcdHMgPSBNYXRoLnJvdW5kKCBzICogMTAwICk7XG5cdFx0XHRpZiAoIHMgPT09IDAgJiYgdGhpcy5faHNsLnMgKSB7XG5cdFx0XHRcdHMgPSB0aGlzLl9oc2wucztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aDogaCxcblx0XHRcdFx0czogcyxcblx0XHRcdFx0bDogTWF0aC5yb3VuZCggbCAqIDEwMCApXG5cdFx0XHR9O1xuXG5cdFx0fSxcblxuXHRcdHRvSHN2OiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciByZ2IgPSB0aGlzLnRvUmdiKCk7XG5cdFx0XHR2YXIgciA9IHJnYi5yIC8gMjU1LCBnID0gcmdiLmcgLyAyNTUsIGIgPSByZ2IuYiAvIDI1NTtcblx0XHRcdHZhciBtYXggPSBNYXRoLm1heCggciwgZywgYiApLCBtaW4gPSBNYXRoLm1pbiggciwgZywgYiApO1xuXHRcdFx0dmFyIGgsIHMsIHYgPSBtYXg7XG5cdFx0XHR2YXIgZCA9IG1heCAtIG1pbjtcblx0XHRcdHMgPSBtYXggPT09IDAgPyAwIDogZCAvIG1heDtcblxuXHRcdFx0aWYgKCBtYXggPT09IG1pbiApIHtcblx0XHRcdFx0aCA9IHMgPSAwOyAvLyBhY2hyb21hdGljXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzd2l0Y2goIG1heCApe1xuXHRcdFx0XHRcdGNhc2Ugcjpcblx0XHRcdFx0XHRcdGggPSAoIGcgLSBiICkgLyBkICsgKCBnIDwgYiA/IDYgOiAwICk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIGc6XG5cdFx0XHRcdFx0XHRoID0gKCBiIC0gciApIC8gZCArIDI7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIGI6XG5cdFx0XHRcdFx0XHRoID0gKCByIC0gZyApIC8gZCArIDQ7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRoIC89IDY7XG5cdFx0XHR9XG5cblx0XHRcdC8vIG1haW50YWluIGh1ZSAmIHNhdCBpZiB3ZSd2ZSBiZWVuIG1hbmlwdWxhdGluZyB0aGluZ3MgaW4gdGhlIEhTViBzcGFjZS5cblx0XHRcdGggPSBNYXRoLnJvdW5kKCBoICogMzYwICk7XG5cdFx0XHRpZiAoIGggPT09IDAgJiYgdGhpcy5faHN2LmggIT09IGggKSB7XG5cdFx0XHRcdGggPSB0aGlzLl9oc3YuaDtcblx0XHRcdH1cblx0XHRcdHMgPSBNYXRoLnJvdW5kKCBzICogMTAwICk7XG5cdFx0XHRpZiAoIHMgPT09IDAgJiYgdGhpcy5faHN2LnMgKSB7XG5cdFx0XHRcdHMgPSB0aGlzLl9oc3Yucztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aDogaCxcblx0XHRcdFx0czogcyxcblx0XHRcdFx0djogTWF0aC5yb3VuZCggdiAqIDEwMCApXG5cdFx0XHR9O1xuXHRcdH0sXG5cblx0XHR0b0ludDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fY29sb3I7XG5cdFx0fSxcblxuXHRcdHRvSUVPY3RvSGV4OiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIEFBUlJCQkdHXG5cdFx0XHR2YXIgaGV4ID0gdGhpcy50b1N0cmluZygpO1xuXHRcdFx0dmFyIEFBID0gcGFyc2VJbnQoIDI1NSAqIHRoaXMuX2FscGhhLCAxMCApLnRvU3RyaW5nKDE2KTtcblx0XHRcdGlmICggQUEubGVuZ3RoID09PSAxICkge1xuXHRcdFx0XHRBQSA9ICcwJyArIEFBO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuICcjJyArIEFBICsgaGV4LnJlcGxhY2UoL14jLywgJycgKTtcblx0XHR9LFxuXG5cdFx0Ly8gaHR0cDovL3d3dy53My5vcmcvVFIvMjAwOC9SRUMtV0NBRzIwLTIwMDgxMjExLyNyZWxhdGl2ZWx1bWluYW5jZWRlZlxuXHRcdHRvTHVtaW5vc2l0eTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcmdiID0gdGhpcy50b1JnYigpO1xuXHRcdFx0dmFyIGx1bSA9IHt9O1xuXHRcdFx0Zm9yICggdmFyIGkgaW4gcmdiICkge1xuXHRcdFx0XHRpZiAoICEgcmdiLmhhc093blByb3BlcnR5KCBpICkgKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGNoYW4gPSByZ2JbIGkgXSAvIDI1NTtcblx0XHRcdFx0bHVtWyBpIF0gPSAoIGNoYW4gPD0gMC4wMzkyOCApID8gY2hhbiAvIDEyLjkyIDogTWF0aC5wb3coICggKCBjaGFuICsgMC4wNTUgKSAvIDEuMDU1ICksIDIuNCApO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gMC4yMTI2ICogbHVtLnIgKyAwLjcxNTIgKiBsdW0uZyArIDAuMDcyMiAqIGx1bS5iO1xuXHRcdH0sXG5cblx0XHQvLyBodHRwOi8vd3d3LnczLm9yZy9UUi8yMDA4L1JFQy1XQ0FHMjAtMjAwODEyMTEvI2NvbnRyYXN0LXJhdGlvZGVmXG5cdFx0Z2V0RGlzdGFuY2VMdW1pbm9zaXR5RnJvbTogZnVuY3Rpb24oIGNvbG9yICkge1xuXHRcdFx0aWYgKCAhICggY29sb3IgaW5zdGFuY2VvZiBDb2xvciApICkge1xuXHRcdFx0XHR0aHJvdyAnZ2V0RGlzdGFuY2VMdW1pbm9zaXR5RnJvbSByZXF1aXJlcyBhIENvbG9yIG9iamVjdCc7XG5cdFx0XHR9XG5cdFx0XHR2YXIgbHVtMSA9IHRoaXMudG9MdW1pbm9zaXR5KCk7XG5cdFx0XHR2YXIgbHVtMiA9IGNvbG9yLnRvTHVtaW5vc2l0eSgpO1xuXHRcdFx0aWYgKCBsdW0xID4gbHVtMiApIHtcblx0XHRcdFx0cmV0dXJuICggbHVtMSArIDAuMDUgKSAvICggbHVtMiArIDAuMDUgKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gKCBsdW0yICsgMC4wNSApIC8gKCBsdW0xICsgMC4wNSApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRnZXRNYXhDb250cmFzdENvbG9yOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciB3aXRoQmxhY2sgPSB0aGlzLmdldERpc3RhbmNlTHVtaW5vc2l0eUZyb20oIG5ldyBDb2xvciggJyMwMDAnICkgKTtcblx0XHRcdHZhciB3aXRoV2hpdGUgPSB0aGlzLmdldERpc3RhbmNlTHVtaW5vc2l0eUZyb20oIG5ldyBDb2xvciggJyNmZmYnICkgKTtcblx0XHRcdHZhciBoZXggPSAoIHdpdGhCbGFjayA+PSB3aXRoV2hpdGUgKSA/ICcjMDAwJyA6ICcjZmZmJztcblx0XHRcdHJldHVybiBuZXcgQ29sb3IoIGhleCApO1xuXHRcdH0sXG5cblx0XHRnZXRSZWFkYWJsZUNvbnRyYXN0aW5nQ29sb3I6IGZ1bmN0aW9uKCBiZ0NvbG9yLCBtaW5Db250cmFzdCApIHtcblx0XHRcdGlmICggISAoIGJnQ29sb3IgaW5zdGFuY2VvZiBDb2xvciApICkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH1cblxuXHRcdFx0Ly8geW91IHNob3VsZG4ndCB1c2UgbGVzcyB0aGFuIDUsIGJ1dCB5b3UgbWlnaHQgd2FudCB0by5cblx0XHRcdHZhciB0YXJnZXRDb250cmFzdCA9ICggbWluQ29udHJhc3QgPT09IHVuZGVmICkgPyA1IDogbWluQ29udHJhc3QsXG5cdFx0XHRcdGNvbnRyYXN0ID0gYmdDb2xvci5nZXREaXN0YW5jZUx1bWlub3NpdHlGcm9tKCB0aGlzICksXG5cdFx0XHRcdG1heENvbnRyYXN0Q29sb3IsIG1heENvbnRyYXN0LCBpbmNyO1xuXG5cdFx0XHQvLyBpZiB3ZSBoYXZlIHN1ZmZpY2llbnQgY29udHJhc3QgYWxyZWFkeSwgY29vbFxuXHRcdFx0aWYgKCBjb250cmFzdCA+PSB0YXJnZXRDb250cmFzdCApIHtcblx0XHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0XHR9XG5cblxuXHRcdFx0bWF4Q29udHJhc3RDb2xvciA9IGJnQ29sb3IuZ2V0TWF4Q29udHJhc3RDb2xvcigpO1xuXHRcdFx0bWF4Q29udHJhc3QgPSBtYXhDb250cmFzdENvbG9yLmdldERpc3RhbmNlTHVtaW5vc2l0eUZyb20oIGJnQ29sb3IgKTtcblxuXHRcdFx0Ly8gaWYgY3VycmVudCBtYXggY29udHJhc3QgaXMgbGVzcyB0aGFuIHRoZSB0YXJnZXQgY29udHJhc3QsIHdlIGhhZCB3aXNoZnVsIHRoaW5raW5nLlxuXHRcdFx0Ly8gc3RpbGwsIGdvIG1heFxuXHRcdFx0aWYgKCBtYXhDb250cmFzdCA8PSB0YXJnZXRDb250cmFzdCApIHtcblx0XHRcdFx0cmV0dXJuIG1heENvbnRyYXN0Q29sb3I7XG5cdFx0XHR9XG5cblx0XHRcdGluY3IgPSAoIDAgPT09IG1heENvbnRyYXN0Q29sb3IudG9JbnQoKSApID8gLTEgOiAxO1xuXHRcdFx0d2hpbGUgKCBjb250cmFzdCA8IHRhcmdldENvbnRyYXN0ICkge1xuXHRcdFx0XHR0aGlzLmwoIGluY3IsIHRydWUgKTsgLy8gMm5kIGFyZyB0dXJucyB0aGlzIGludG8gYW4gaW5jcmVtZW50ZXJcblx0XHRcdFx0Y29udHJhc3QgPSB0aGlzLmdldERpc3RhbmNlTHVtaW5vc2l0eUZyb20oIGJnQ29sb3IgKTtcblx0XHRcdFx0Ly8gaW5maW5pbml0ZSBsb29wIHByZXZlbnRpb246IHlvdSBuZXZlciBrbm93LlxuXHRcdFx0XHRpZiAoIHRoaXMuX2NvbG9yID09PSAwIHx8IHRoaXMuX2NvbG9yID09PSAxNjc3NzIxNSApIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXG5cdFx0YTogZnVuY3Rpb24oIHZhbCApIHtcblx0XHRcdGlmICggdmFsID09PSB1bmRlZiApXG5cdFx0XHRcdHJldHVybiB0aGlzLl9hbHBoYTtcblxuXHRcdFx0dmFyIGEgPSBwYXJzZUZsb2F0KCB2YWwgKTtcblxuXHRcdFx0aWYgKCBpc05hTiggYSApIClcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2Vycm9yKCk7XG5cblx0XHRcdHRoaXMuX2FscGhhID0gYTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHQvLyBUUkFOU0ZPUk1TXG5cblx0XHRkYXJrZW46IGZ1bmN0aW9uKCBhbW91bnQgKSB7XG5cdFx0XHRhbW91bnQgPSBhbW91bnQgfHwgNTtcblx0XHRcdHJldHVybiB0aGlzLmwoIC0gYW1vdW50LCB0cnVlICk7XG5cdFx0fSxcblxuXHRcdGxpZ2h0ZW46IGZ1bmN0aW9uKCBhbW91bnQgKSB7XG5cdFx0XHRhbW91bnQgPSBhbW91bnQgfHwgNTtcblx0XHRcdHJldHVybiB0aGlzLmwoIGFtb3VudCwgdHJ1ZSApO1xuXHRcdH0sXG5cblx0XHRzYXR1cmF0ZTogZnVuY3Rpb24oIGFtb3VudCApIHtcblx0XHRcdGFtb3VudCA9IGFtb3VudCB8fCAxNTtcblx0XHRcdHJldHVybiB0aGlzLnMoIGFtb3VudCwgdHJ1ZSApO1xuXHRcdH0sXG5cblx0XHRkZXNhdHVyYXRlOiBmdW5jdGlvbiggYW1vdW50ICkge1xuXHRcdFx0YW1vdW50ID0gYW1vdW50IHx8IDE1O1xuXHRcdFx0cmV0dXJuIHRoaXMucyggLSBhbW91bnQsIHRydWUgKTtcblx0XHR9LFxuXG5cdFx0dG9HcmF5c2NhbGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuc2V0SFNwYWNlKCdoc2wnKS5zKCAwICk7XG5cdFx0fSxcblxuXHRcdGdldENvbXBsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuaCggMTgwLCB0cnVlICk7XG5cdFx0fSxcblxuXHRcdGdldFNwbGl0Q29tcGxlbWVudDogZnVuY3Rpb24oIHN0ZXAgKSB7XG5cdFx0XHRzdGVwID0gc3RlcCB8fCAxO1xuXHRcdFx0dmFyIGluY3IgPSAxODAgKyAoIHN0ZXAgKiAzMCApO1xuXHRcdFx0cmV0dXJuIHRoaXMuaCggaW5jciwgdHJ1ZSApO1xuXHRcdH0sXG5cblx0XHRnZXRBbmFsb2c6IGZ1bmN0aW9uKCBzdGVwICkge1xuXHRcdFx0c3RlcCA9IHN0ZXAgfHwgMTtcblx0XHRcdHZhciBpbmNyID0gc3RlcCAqIDMwO1xuXHRcdFx0cmV0dXJuIHRoaXMuaCggaW5jciwgdHJ1ZSApO1xuXHRcdH0sXG5cblx0XHRnZXRUZXRyYWQ6IGZ1bmN0aW9uKCBzdGVwICkge1xuXHRcdFx0c3RlcCA9IHN0ZXAgfHwgMTtcblx0XHRcdHZhciBpbmNyID0gc3RlcCAqIDYwO1xuXHRcdFx0cmV0dXJuIHRoaXMuaCggaW5jciwgdHJ1ZSApO1xuXHRcdH0sXG5cblx0XHRnZXRUcmlhZDogZnVuY3Rpb24oIHN0ZXAgKSB7XG5cdFx0XHRzdGVwID0gc3RlcCB8fCAxO1xuXHRcdFx0dmFyIGluY3IgPSBzdGVwICogMTIwO1xuXHRcdFx0cmV0dXJuIHRoaXMuaCggaW5jciwgdHJ1ZSApO1xuXHRcdH0sXG5cblx0XHRfcGFydGlhbDogZnVuY3Rpb24oIGtleSApIHtcblx0XHRcdHZhciBwcm9wID0gc2hvcnRQcm9wc1trZXldO1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCB2YWwsIGluY3IgKSB7XG5cdFx0XHRcdHZhciBjb2xvciA9IHRoaXMuX3NwYWNlRnVuYygndG8nLCBwcm9wLnNwYWNlKTtcblxuXHRcdFx0XHQvLyBHRVRURVJcblx0XHRcdFx0aWYgKCB2YWwgPT09IHVuZGVmIClcblx0XHRcdFx0XHRyZXR1cm4gY29sb3Jba2V5XTtcblxuXHRcdFx0XHQvLyBJTkNSRU1FTlRcblx0XHRcdFx0aWYgKCBpbmNyID09PSB0cnVlIClcblx0XHRcdFx0XHR2YWwgPSBjb2xvcltrZXldICsgdmFsO1xuXG5cdFx0XHRcdC8vIE1PRCAmIFJBTkdFXG5cdFx0XHRcdGlmICggcHJvcC5tb2QgKVxuXHRcdFx0XHRcdHZhbCA9IHZhbCAlIHByb3AubW9kO1xuXHRcdFx0XHRpZiAoIHByb3AucmFuZ2UgKVxuXHRcdFx0XHRcdHZhbCA9ICggdmFsIDwgcHJvcC5yYW5nZVswXSApID8gcHJvcC5yYW5nZVswXSA6ICggdmFsID4gcHJvcC5yYW5nZVsxXSApID8gcHJvcC5yYW5nZVsxXSA6IHZhbDtcblxuXHRcdFx0XHQvLyBORVcgVkFMVUVcblx0XHRcdFx0Y29sb3Jba2V5XSA9IHZhbDtcblxuXHRcdFx0XHRyZXR1cm4gdGhpcy5fc3BhY2VGdW5jKCdmcm9tJywgcHJvcC5zcGFjZSwgY29sb3IpO1xuXHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0X3NwYWNlRnVuYzogZnVuY3Rpb24oIGRpciwgcywgdmFsICkge1xuXHRcdFx0dmFyIHNwYWNlID0gcyB8fCB0aGlzLl9oU3BhY2UsXG5cdFx0XHRcdGZ1bmNOYW1lID0gZGlyICsgc3BhY2UuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzcGFjZS5zdWJzdHIoMSk7XG5cdFx0XHRyZXR1cm4gdGhpc1tmdW5jTmFtZV0odmFsKTtcblx0XHR9XG5cdH07XG5cblx0dmFyIHNob3J0UHJvcHMgPSB7XG5cdFx0aDoge1xuXHRcdFx0bW9kOiAzNjBcblx0XHR9LFxuXHRcdHM6IHtcblx0XHRcdHJhbmdlOiBbMCwxMDBdXG5cdFx0fSxcblx0XHRsOiB7XG5cdFx0XHRzcGFjZTogJ2hzbCcsXG5cdFx0XHRyYW5nZTogWzAsMTAwXVxuXHRcdH0sXG5cdFx0djoge1xuXHRcdFx0c3BhY2U6ICdoc3YnLFxuXHRcdFx0cmFuZ2U6IFswLDEwMF1cblx0XHR9LFxuXHRcdHI6IHtcblx0XHRcdHNwYWNlOiAncmdiJyxcblx0XHRcdHJhbmdlOiBbMCwyNTVdXG5cdFx0fSxcblx0XHRnOiB7XG5cdFx0XHRzcGFjZTogJ3JnYicsXG5cdFx0XHRyYW5nZTogWzAsMjU1XVxuXHRcdH0sXG5cdFx0Yjoge1xuXHRcdFx0c3BhY2U6ICdyZ2InLFxuXHRcdFx0cmFuZ2U6IFswLDI1NV1cblx0XHR9XG5cdH07XG5cblx0Zm9yICggdmFyIGtleSBpbiBzaG9ydFByb3BzICkge1xuXHRcdGlmICggc2hvcnRQcm9wcy5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKVxuXHRcdFx0Q29sb3IuZm5ba2V5XSA9IENvbG9yLmZuLl9wYXJ0aWFsKGtleSk7XG5cdH1cblxuXHQvLyBwbGF5IG5pY2VseSB3aXRoIE5vZGUgKyBicm93c2VyXG5cdGlmICggdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnIClcblx0XHRtb2R1bGUuZXhwb3J0cyA9IENvbG9yO1xuXHRlbHNlXG5cdFx0Z2xvYmFsLkNvbG9yID0gQ29sb3I7XG5cbn0odGhpcykpO1xuIiwiLyohIElyaXMgQ29sb3IgUGlja2VyIC0gdjEuMC43IC0gMjAxNC0xMS0yOFxuKiBodHRwczovL2dpdGh1Yi5jb20vQXV0b21hdHRpYy9JcmlzXG4qIENvcHlyaWdodCAoYykgMjAxNCBNYXR0IFdpZWJlOyBMaWNlbnNlZCBHUEx2MiAqL1xuKGZ1bmN0aW9uKCAkLCB1bmRlZiApe1xuXHR2YXIgX2h0bWwsIG5vbkdyYWRpZW50SUUsIGdyYWRpZW50VHlwZSwgdmVuZG9yUHJlZml4ZXMsIF9jc3MsIElyaXMsIFVBLCBpc0lFLCBJRVZlcnNpb247XG5cblx0X2h0bWwgPSAnPGRpdiBjbGFzcz1cImlyaXMtcGlja2VyXCI+PGRpdiBjbGFzcz1cImlyaXMtcGlja2VyLWlubmVyXCI+PGRpdiBjbGFzcz1cImlyaXMtc3F1YXJlXCI+PGEgY2xhc3M9XCJpcmlzLXNxdWFyZS12YWx1ZVwiIGhyZWY9XCIjXCI+PHNwYW4gY2xhc3M9XCJpcmlzLXNxdWFyZS1oYW5kbGUgdWktc2xpZGVyLWhhbmRsZVwiPjwvc3Bhbj48L2E+PGRpdiBjbGFzcz1cImlyaXMtc3F1YXJlLWlubmVyIGlyaXMtc3F1YXJlLWhvcml6XCI+PC9kaXY+PGRpdiBjbGFzcz1cImlyaXMtc3F1YXJlLWlubmVyIGlyaXMtc3F1YXJlLXZlcnRcIj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVwiaXJpcy1zbGlkZXIgaXJpcy1zdHJpcFwiPjxkaXYgY2xhc3M9XCJpcmlzLXNsaWRlci1vZmZzZXRcIj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj4nO1xuXHRfY3NzID0gJy5pcmlzLXBpY2tlcntkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOnJlbGF0aXZlfS5pcmlzLXBpY2tlciwuaXJpcy1waWNrZXIgKnstbW96LWJveC1zaXppbmc6Y29udGVudC1ib3g7LXdlYmtpdC1ib3gtc2l6aW5nOmNvbnRlbnQtYm94O2JveC1zaXppbmc6Y29udGVudC1ib3h9aW5wdXQrLmlyaXMtcGlja2Vye21hcmdpbi10b3A6NHB4fS5pcmlzLWVycm9ye2JhY2tncm91bmQtY29sb3I6I2ZmYWZhZn0uaXJpcy1ib3JkZXJ7Ym9yZGVyLXJhZGl1czozcHg7Ym9yZGVyOjFweCBzb2xpZCAjYWFhO3dpZHRoOjIwMHB4O2JhY2tncm91bmQtY29sb3I6I2ZmZn0uaXJpcy1waWNrZXItaW5uZXJ7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7cmlnaHQ6MDtsZWZ0OjA7Ym90dG9tOjB9LmlyaXMtYm9yZGVyIC5pcmlzLXBpY2tlci1pbm5lcnt0b3A6MTBweDtyaWdodDoxMHB4O2xlZnQ6MTBweDtib3R0b206MTBweH0uaXJpcy1waWNrZXIgLmlyaXMtc3F1YXJlLWlubmVye3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDtyaWdodDowO3RvcDowO2JvdHRvbTowfS5pcmlzLXBpY2tlciAuaXJpcy1zcXVhcmUsLmlyaXMtcGlja2VyIC5pcmlzLXNsaWRlciwuaXJpcy1waWNrZXIgLmlyaXMtc3F1YXJlLWlubmVyLC5pcmlzLXBpY2tlciAuaXJpcy1wYWxldHRle2JvcmRlci1yYWRpdXM6M3B4O2JveC1zaGFkb3c6aW5zZXQgMCAwIDVweCByZ2JhKDAsMCwwLC40KTtoZWlnaHQ6MTAwJTt3aWR0aDoxMi41JTtmbG9hdDpsZWZ0O21hcmdpbi1yaWdodDo1JX0uaXJpcy1waWNrZXIgLmlyaXMtc3F1YXJle3dpZHRoOjc2JTttYXJnaW4tcmlnaHQ6MTAlO3Bvc2l0aW9uOnJlbGF0aXZlfS5pcmlzLXBpY2tlciAuaXJpcy1zcXVhcmUtaW5uZXJ7d2lkdGg6YXV0bzttYXJnaW46MH0uaXJpcy1pZS05IC5pcmlzLXNxdWFyZSwuaXJpcy1pZS05IC5pcmlzLXNsaWRlciwuaXJpcy1pZS05IC5pcmlzLXNxdWFyZS1pbm5lciwuaXJpcy1pZS05IC5pcmlzLXBhbGV0dGV7Ym94LXNoYWRvdzpub25lO2JvcmRlci1yYWRpdXM6MH0uaXJpcy1pZS05IC5pcmlzLXNxdWFyZSwuaXJpcy1pZS05IC5pcmlzLXNsaWRlciwuaXJpcy1pZS05IC5pcmlzLXBhbGV0dGV7b3V0bGluZToxcHggc29saWQgcmdiYSgwLDAsMCwuMSl9LmlyaXMtaWUtbHQ5IC5pcmlzLXNxdWFyZSwuaXJpcy1pZS1sdDkgLmlyaXMtc2xpZGVyLC5pcmlzLWllLWx0OSAuaXJpcy1zcXVhcmUtaW5uZXIsLmlyaXMtaWUtbHQ5IC5pcmlzLXBhbGV0dGV7b3V0bGluZToxcHggc29saWQgI2FhYX0uaXJpcy1pZS1sdDkgLmlyaXMtc3F1YXJlIC51aS1zbGlkZXItaGFuZGxle291dGxpbmU6MXB4IHNvbGlkICNhYWE7YmFja2dyb3VuZC1jb2xvcjojZmZmOy1tcy1maWx0ZXI6XCJhbHBoYShPcGFjaXR5PTMwKVwifS5pcmlzLWllLWx0OSAuaXJpcy1zcXVhcmUgLmlyaXMtc3F1YXJlLWhhbmRsZXtiYWNrZ3JvdW5kOjA7Ym9yZGVyOjNweCBzb2xpZCAjZmZmOy1tcy1maWx0ZXI6XCJhbHBoYShPcGFjaXR5PTUwKVwifS5pcmlzLXBpY2tlciAuaXJpcy1zdHJpcHttYXJnaW4tcmlnaHQ6MDtwb3NpdGlvbjpyZWxhdGl2ZX0uaXJpcy1waWNrZXIgLmlyaXMtc3RyaXAgLnVpLXNsaWRlci1oYW5kbGV7cG9zaXRpb246YWJzb2x1dGU7YmFja2dyb3VuZDowO21hcmdpbjowO3JpZ2h0Oi0zcHg7bGVmdDotM3B4O2JvcmRlcjo0cHggc29saWQgI2FhYTtib3JkZXItd2lkdGg6NHB4IDNweDt3aWR0aDphdXRvO2hlaWdodDo2cHg7Ym9yZGVyLXJhZGl1czo0cHg7Ym94LXNoYWRvdzowIDFweCAycHggcmdiYSgwLDAsMCwuMik7b3BhY2l0eTouOTt6LWluZGV4OjU7Y3Vyc29yOm5zLXJlc2l6ZX0uaXJpcy1zdHJpcCAudWktc2xpZGVyLWhhbmRsZTpiZWZvcmV7Y29udGVudDpcIiBcIjtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0Oi0ycHg7cmlnaHQ6LTJweDt0b3A6LTNweDtib3R0b206LTNweDtib3JkZXI6MnB4IHNvbGlkICNmZmY7Ym9yZGVyLXJhZGl1czozcHh9LmlyaXMtcGlja2VyIC5pcmlzLXNsaWRlci1vZmZzZXR7cG9zaXRpb246YWJzb2x1dGU7dG9wOjExcHg7bGVmdDowO3JpZ2h0OjA7Ym90dG9tOi0zcHg7d2lkdGg6YXV0bztoZWlnaHQ6YXV0bztiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2JvcmRlcjowO2JvcmRlci1yYWRpdXM6MH0uaXJpcy1waWNrZXIgLmlyaXMtc3F1YXJlLWhhbmRsZXtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2JvcmRlcjo1cHggc29saWQgI2FhYTtib3JkZXItcmFkaXVzOjUwJTtib3JkZXItY29sb3I6cmdiYSgxMjgsMTI4LDEyOCwuNSk7Ym94LXNoYWRvdzpub25lO3dpZHRoOjEycHg7aGVpZ2h0OjEycHg7cG9zaXRpb246YWJzb2x1dGU7bGVmdDotMTBweDt0b3A6LTEwcHg7Y3Vyc29yOm1vdmU7b3BhY2l0eToxO3otaW5kZXg6MTB9LmlyaXMtcGlja2VyIC51aS1zdGF0ZS1mb2N1cyAuaXJpcy1zcXVhcmUtaGFuZGxle29wYWNpdHk6Ljh9LmlyaXMtcGlja2VyIC5pcmlzLXNxdWFyZS1oYW5kbGU6aG92ZXJ7Ym9yZGVyLWNvbG9yOiM5OTl9LmlyaXMtcGlja2VyIC5pcmlzLXNxdWFyZS12YWx1ZTpmb2N1cyAuaXJpcy1zcXVhcmUtaGFuZGxle2JveC1zaGFkb3c6MCAwIDJweCByZ2JhKDAsMCwwLC43NSk7b3BhY2l0eTouOH0uaXJpcy1waWNrZXIgLmlyaXMtc3F1YXJlLWhhbmRsZTpob3Zlcjo6YWZ0ZXJ7Ym9yZGVyLWNvbG9yOiNmZmZ9LmlyaXMtcGlja2VyIC5pcmlzLXNxdWFyZS1oYW5kbGU6OmFmdGVye3Bvc2l0aW9uOmFic29sdXRlO2JvdHRvbTotNHB4O3JpZ2h0Oi00cHg7bGVmdDotNHB4O3RvcDotNHB4O2JvcmRlcjozcHggc29saWQgI2Y5ZjlmOTtib3JkZXItY29sb3I6cmdiYSgyNTUsMjU1LDI1NSwuOCk7Ym9yZGVyLXJhZGl1czo1MCU7Y29udGVudDpcIiBcIn0uaXJpcy1waWNrZXIgLmlyaXMtc3F1YXJlLXZhbHVle3dpZHRoOjhweDtoZWlnaHQ6OHB4O3Bvc2l0aW9uOmFic29sdXRlfS5pcmlzLWllLWx0OSAuaXJpcy1zcXVhcmUtdmFsdWUsLmlyaXMtbW96aWxsYSAuaXJpcy1zcXVhcmUtdmFsdWV7d2lkdGg6MXB4O2hlaWdodDoxcHh9LmlyaXMtcGFsZXR0ZS1jb250YWluZXJ7cG9zaXRpb246YWJzb2x1dGU7Ym90dG9tOjA7bGVmdDowO21hcmdpbjowO3BhZGRpbmc6MH0uaXJpcy1ib3JkZXIgLmlyaXMtcGFsZXR0ZS1jb250YWluZXJ7bGVmdDoxMHB4O2JvdHRvbToxMHB4fS5pcmlzLXBpY2tlciAuaXJpcy1wYWxldHRle21hcmdpbjowO2N1cnNvcjpwb2ludGVyfS5pcmlzLXNxdWFyZS1oYW5kbGUsLnVpLXNsaWRlci1oYW5kbGV7Ym9yZGVyOjA7b3V0bGluZTowfSc7XG5cblx0Ly8gRXZlbiBJRTkgZG9zZW4ndCBzdXBwb3J0IGdyYWRpZW50cy4gRWxhYm9yYXRlIHNpZ2guXG5cdFVBID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xuXHRpc0lFID0gbmF2aWdhdG9yLmFwcE5hbWUgPT09ICdNaWNyb3NvZnQgSW50ZXJuZXQgRXhwbG9yZXInO1xuXHRJRVZlcnNpb24gPSBpc0lFID8gcGFyc2VGbG9hdCggVUEubWF0Y2goIC9tc2llIChbMC05XXsxLH1bXFwuMC05XXswLH0pLyApWzFdICkgOiAwO1xuXHRub25HcmFkaWVudElFID0gKCBpc0lFICYmIElFVmVyc2lvbiA8IDEwICk7XG5cdGdyYWRpZW50VHlwZSA9IGZhbHNlO1xuXG5cdC8vIHdlIGRvbid0IGJvdGhlciB3aXRoIGFuIHVucHJlZml4ZWQgdmVyc2lvbiwgYXMgaXQgaGFzIGEgZGlmZmVyZW50IHN5bnRheFxuXHR2ZW5kb3JQcmVmaXhlcyA9IFsgJy1tb3otJywgJy13ZWJraXQtJywgJy1vLScsICctbXMtJyBdO1xuXG5cdC8vIEJhaWwgZm9yIElFIDw9IDdcblx0aWYgKCBub25HcmFkaWVudElFICYmIElFVmVyc2lvbiA8PSA3ICkge1xuXHRcdCQuZm4uaXJpcyA9ICQubm9vcDtcblx0XHQkLnN1cHBvcnQuaXJpcyA9IGZhbHNlO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdCQuc3VwcG9ydC5pcmlzID0gdHJ1ZTtcblxuXHRmdW5jdGlvbiB0ZXN0R3JhZGllbnRUeXBlKCkge1xuXHRcdHZhciBlbCwgYmFzZSxcblx0XHRcdGJnSW1hZ2VTdHJpbmcgPSAnYmFja2dyb3VuZEltYWdlJztcblxuXHRcdGlmICggbm9uR3JhZGllbnRJRSApIHtcblx0XHRcdGdyYWRpZW50VHlwZSA9ICdmaWx0ZXInO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGVsID0gJCggJzxkaXYgaWQ9XCJpcmlzLWdyYWR0ZXN0XCIgLz4nICk7XG5cdFx0XHRiYXNlID0gJ2xpbmVhci1ncmFkaWVudCh0b3AsI2ZmZiwjMDAwKSc7XG5cdFx0XHQkLmVhY2goIHZlbmRvclByZWZpeGVzLCBmdW5jdGlvbiggaSwgdmFsICl7XG5cdFx0XHRcdGVsLmNzcyggYmdJbWFnZVN0cmluZywgdmFsICsgYmFzZSApO1xuXHRcdFx0XHRpZiAoIGVsLmNzcyggYmdJbWFnZVN0cmluZyApLm1hdGNoKCAnZ3JhZGllbnQnICkgKSB7XG5cdFx0XHRcdFx0Z3JhZGllbnRUeXBlID0gaTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0Ly8gY2hlY2sgZm9yIGxlZ2FjeSB3ZWJraXQgZ3JhZGllbnQgc3ludGF4XG5cdFx0XHRpZiAoIGdyYWRpZW50VHlwZSA9PT0gZmFsc2UgKSB7XG5cdFx0XHRcdGVsLmNzcyggJ2JhY2tncm91bmQnLCAnLXdlYmtpdC1ncmFkaWVudChsaW5lYXIsMCUgMCUsMCUgMTAwJSxmcm9tKCNmZmYpLHRvKCMwMDApKScgKTtcblx0XHRcdFx0aWYgKCBlbC5jc3MoIGJnSW1hZ2VTdHJpbmcgKS5tYXRjaCggJ2dyYWRpZW50JyApICkge1xuXHRcdFx0XHRcdGdyYWRpZW50VHlwZSA9ICd3ZWJraXQnO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbC5yZW1vdmUoKTtcblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQqIE9ubHkgZm9yIENTUzMgZ3JhZGllbnRzLiBvbGRJRSB3aWxsIHVzZSBhIHNlcGFyYXRlIGZ1bmN0aW9uLlxuXHQqXG5cdCogQWNjZXB0cyBhcyBtYW55IGNvbG9yIHN0b3BzIGFzIG5lY2Vzc2FyeSBmcm9tIDJuZCBhcmcgb24sIG9yIDJuZFxuXHQqIGFyZyBjYW4gYmUgYW4gYXJyYXkgb2YgY29sb3Igc3RvcHNcblx0KlxuXHQqIEBwYXJhbSAge3N0cmluZ30gb3JpZ2luIEdyYWRpZW50IG9yaWdpbiAtIHRvcCBvciBsZWZ0LCBkZWZhdWx0cyB0byBsZWZ0LlxuXHQqIEByZXR1cm4ge3N0cmluZ30gICAgICAgIEFwcHJvcHJpYXRlIENTUzMgZ3JhZGllbnQgc3RyaW5nIGZvciB1c2UgaW5cblx0Ki9cblx0ZnVuY3Rpb24gY3JlYXRlR3JhZGllbnQoIG9yaWdpbiwgc3RvcHMgKSB7XG5cdFx0b3JpZ2luID0gKCBvcmlnaW4gPT09ICd0b3AnICkgPyAndG9wJyA6ICdsZWZ0Jztcblx0XHRzdG9wcyA9ICQuaXNBcnJheSggc3RvcHMgKSA/IHN0b3BzIDogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoIGFyZ3VtZW50cywgMSApO1xuXHRcdGlmICggZ3JhZGllbnRUeXBlID09PSAnd2Via2l0JyApIHtcblx0XHRcdHJldHVybiBsZWdhY3lXZWJraXRHcmFkaWVudCggb3JpZ2luLCBzdG9wcyApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdmVuZG9yUHJlZml4ZXNbIGdyYWRpZW50VHlwZSBdICsgJ2xpbmVhci1ncmFkaWVudCgnICsgb3JpZ2luICsgJywgJyArIHN0b3BzLmpvaW4oJywgJykgKyAnKSc7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCogU3R1cGlkIGdyYWRpZW50cyBmb3IgYSBzdHVwaWQgYnJvd3Nlci5cblx0Ki9cblx0ZnVuY3Rpb24gc3R1cGlkSUVHcmFkaWVudCggb3JpZ2luLCBzdG9wcyApIHtcblx0XHR2YXIgdHlwZSwgc2VsZiwgbGFzdEluZGV4LCBmaWx0ZXIsIHN0YXJ0UG9zUHJvcCwgZW5kUG9zUHJvcCwgZGltZW5zaW9uUHJvcCwgdGVtcGxhdGUsIGh0bWw7XG5cblx0XHRvcmlnaW4gPSAoIG9yaWdpbiA9PT0gJ3RvcCcgKSA/ICd0b3AnIDogJ2xlZnQnO1xuXHRcdHN0b3BzID0gJC5pc0FycmF5KCBzdG9wcyApID8gc3RvcHMgOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggYXJndW1lbnRzLCAxICk7XG5cdFx0Ly8gOCBoZXg6IEFBUlJHR0JCXG5cdFx0Ly8gR3JhZGllbnRUeXBlOiAwIHZlcnRpY2FsLCAxIGhvcml6b250YWxcblx0XHR0eXBlID0gKCBvcmlnaW4gPT09ICd0b3AnICkgPyAwIDogMTtcblx0XHRzZWxmID0gJCggdGhpcyApO1xuXHRcdGxhc3RJbmRleCA9IHN0b3BzLmxlbmd0aCAtIDE7XG5cdFx0ZmlsdGVyID0gJ2ZpbHRlcic7XG5cdFx0c3RhcnRQb3NQcm9wID0gKCB0eXBlID09PSAxICkgPyAnbGVmdCcgOiAndG9wJztcblx0XHRlbmRQb3NQcm9wID0gKCB0eXBlID09PSAxICkgPyAncmlnaHQnIDogJ2JvdHRvbSc7XG5cdFx0ZGltZW5zaW9uUHJvcCA9ICggdHlwZSA9PT0gMSApID8gJ2hlaWdodCcgOiAnd2lkdGgnO1xuXHRcdHRlbXBsYXRlID0gJzxkaXYgY2xhc3M9XCJpcmlzLWllLWdyYWRpZW50LXNoaW1cIiBzdHlsZT1cInBvc2l0aW9uOmFic29sdXRlOycgKyBkaW1lbnNpb25Qcm9wICsgJzoxMDAlOycgKyBzdGFydFBvc1Byb3AgKyAnOiVzdGFydCU7JyArIGVuZFBvc1Byb3AgKyAnOiVlbmQlOycgKyBmaWx0ZXIgKyAnOiVmaWx0ZXIlO1wiIGRhdGEtY29sb3I6XCIlY29sb3IlXCI+PC9kaXY+Jztcblx0XHRodG1sID0gJyc7XG5cdFx0Ly8gbmVlZCBhIHBvc2l0aW9uaW5nIGNvbnRleHRcblx0XHRpZiAoIHNlbGYuY3NzKCdwb3NpdGlvbicpID09PSAnc3RhdGljJyApIHtcblx0XHRcdHNlbGYuY3NzKCB7cG9zaXRpb246ICdyZWxhdGl2ZScgfSApO1xuXHRcdH1cblxuXHRcdHN0b3BzID0gZmlsbENvbG9yU3RvcHMoIHN0b3BzICk7XG5cdFx0JC5lYWNoKHN0b3BzLCBmdW5jdGlvbiggaSwgc3RhcnRDb2xvciApIHtcblx0XHRcdHZhciBlbmRDb2xvciwgZW5kU3RvcCwgZmlsdGVyVmFsO1xuXG5cdFx0XHQvLyB3ZSB3YW50IHR3byBhdCBhIHRpbWUuIGlmIHdlJ3JlIG9uIHRoZSBsYXN0IHBhaXIsIGJhaWwuXG5cdFx0XHRpZiAoIGkgPT09IGxhc3RJbmRleCApIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRlbmRDb2xvciA9IHN0b3BzWyBpICsgMSBdO1xuXHRcdFx0Ly9pZiBvdXIgcGFpcnMgYXJlIGF0IHRoZSBzYW1lIGNvbG9yIHN0b3AsIG1vdmluZyBhbG9uZy5cblx0XHRcdGlmICggc3RhcnRDb2xvci5zdG9wID09PSBlbmRDb2xvci5zdG9wICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGVuZFN0b3AgPSAxMDAgLSBwYXJzZUZsb2F0KCBlbmRDb2xvci5zdG9wICkgKyAnJSc7XG5cdFx0XHRzdGFydENvbG9yLm9jdG9IZXggPSBuZXcgQ29sb3IoIHN0YXJ0Q29sb3IuY29sb3IgKS50b0lFT2N0b0hleCgpO1xuXHRcdFx0ZW5kQ29sb3Iub2N0b0hleCA9IG5ldyBDb2xvciggZW5kQ29sb3IuY29sb3IgKS50b0lFT2N0b0hleCgpO1xuXG5cdFx0XHRmaWx0ZXJWYWwgPSAncHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LkdyYWRpZW50KEdyYWRpZW50VHlwZT0nICsgdHlwZSArICcsIFN0YXJ0Q29sb3JTdHI9XFwnJyArIHN0YXJ0Q29sb3Iub2N0b0hleCArICdcXCcsIEVuZENvbG9yU3RyPVxcJycgKyBlbmRDb2xvci5vY3RvSGV4ICsgJ1xcJyknO1xuXHRcdFx0aHRtbCArPSB0ZW1wbGF0ZS5yZXBsYWNlKCAnJXN0YXJ0JScsIHN0YXJ0Q29sb3Iuc3RvcCApLnJlcGxhY2UoICclZW5kJScsIGVuZFN0b3AgKS5yZXBsYWNlKCAnJWZpbHRlciUnLCBmaWx0ZXJWYWwgKTtcblx0XHR9KTtcblx0XHRzZWxmLmZpbmQoICcuaXJpcy1pZS1ncmFkaWVudC1zaGltJyApLnJlbW92ZSgpO1xuXHRcdCQoIGh0bWwgKS5wcmVwZW5kVG8oIHNlbGYgKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGxlZ2FjeVdlYmtpdEdyYWRpZW50KCBvcmlnaW4sIGNvbG9yTGlzdCApIHtcblx0XHR2YXIgc3RvcHMgPSBbXTtcblx0XHRvcmlnaW4gPSAoIG9yaWdpbiA9PT0gJ3RvcCcgKSA/ICcwJSAwJSwwJSAxMDAlLCcgOiAnMCUgMTAwJSwxMDAlIDEwMCUsJztcblx0XHRjb2xvckxpc3QgPSBmaWxsQ29sb3JTdG9wcyggY29sb3JMaXN0ICk7XG5cdFx0JC5lYWNoKCBjb2xvckxpc3QsIGZ1bmN0aW9uKCBpLCB2YWwgKXtcblx0XHRcdHN0b3BzLnB1c2goICdjb2xvci1zdG9wKCcgKyAoIHBhcnNlRmxvYXQoIHZhbC5zdG9wICkgLyAxMDAgKSArICcsICcgKyB2YWwuY29sb3IgKyAnKScgKTtcblx0XHR9KTtcblx0XHRyZXR1cm4gJy13ZWJraXQtZ3JhZGllbnQobGluZWFyLCcgKyBvcmlnaW4gKyBzdG9wcy5qb2luKCcsJykgKyAnKSc7XG5cdH1cblxuXHRmdW5jdGlvbiBmaWxsQ29sb3JTdG9wcyggY29sb3JMaXN0ICkge1xuXHRcdHZhciBjb2xvcnMgPSBbXSxcblx0XHRcdHBlcmNzID0gW10sXG5cdFx0XHRuZXdDb2xvckxpc3QgPSBbXSxcblx0XHRcdGxhc3RJbmRleCA9IGNvbG9yTGlzdC5sZW5ndGggLSAxO1xuXG5cdFx0JC5lYWNoKCBjb2xvckxpc3QsIGZ1bmN0aW9uKCBpbmRleCwgdmFsICkge1xuXHRcdFx0dmFyIGNvbG9yID0gdmFsLFxuXHRcdFx0XHRwZXJjID0gZmFsc2UsXG5cdFx0XHRcdG1hdGNoID0gdmFsLm1hdGNoKCAvMT9bMC05XXsxLDJ9JSQvICk7XG5cblx0XHRcdGlmICggbWF0Y2ggKSB7XG5cdFx0XHRcdGNvbG9yID0gdmFsLnJlcGxhY2UoIC9cXHM/MT9bMC05XXsxLDJ9JSQvLCAnJyApO1xuXHRcdFx0XHRwZXJjID0gbWF0Y2guc2hpZnQoKTtcblx0XHRcdH1cblx0XHRcdGNvbG9ycy5wdXNoKCBjb2xvciApO1xuXHRcdFx0cGVyY3MucHVzaCggcGVyYyApO1xuXHRcdH0pO1xuXG5cdFx0Ly8gYmFjayBmaWxsIGZpcnN0IGFuZCBsYXN0XG5cdFx0aWYgKCBwZXJjc1swXSA9PT0gZmFsc2UgKSB7XG5cdFx0XHRwZXJjc1swXSA9ICcwJSc7XG5cdFx0fVxuXG5cdFx0aWYgKCBwZXJjc1tsYXN0SW5kZXhdID09PSBmYWxzZSApIHtcblx0XHRcdHBlcmNzW2xhc3RJbmRleF0gPSAnMTAwJSc7XG5cdFx0fVxuXG5cdFx0cGVyY3MgPSBiYWNrRmlsbENvbG9yU3RvcHMoIHBlcmNzICk7XG5cblx0XHQkLmVhY2goIHBlcmNzLCBmdW5jdGlvbiggaSApe1xuXHRcdFx0bmV3Q29sb3JMaXN0W2ldID0geyBjb2xvcjogY29sb3JzW2ldLCBzdG9wOiBwZXJjc1tpXSB9O1xuXHRcdH0pO1xuXHRcdHJldHVybiBuZXdDb2xvckxpc3Q7XG5cdH1cblxuXHRmdW5jdGlvbiBiYWNrRmlsbENvbG9yU3RvcHMoIHN0b3BzICkge1xuXHRcdHZhciBmaXJzdCA9IDAsXG5cdFx0XHRsYXN0ID0gc3RvcHMubGVuZ3RoIC0gMSxcblx0XHRcdGkgPSAwLFxuXHRcdFx0Zm91bmRGaXJzdCA9IGZhbHNlLFxuXHRcdFx0aW5jcixcblx0XHRcdHN0ZXBzLFxuXHRcdFx0c3RlcCxcblx0XHRcdGZpcnN0VmFsO1xuXG5cdFx0aWYgKCBzdG9wcy5sZW5ndGggPD0gMiB8fCAkLmluQXJyYXkoIGZhbHNlLCBzdG9wcyApIDwgMCApIHtcblx0XHRcdHJldHVybiBzdG9wcztcblx0XHR9XG5cdFx0d2hpbGUgKCBpIDwgc3RvcHMubGVuZ3RoIC0gMSApIHtcblx0XHRcdGlmICggISBmb3VuZEZpcnN0ICYmIHN0b3BzW2ldID09PSBmYWxzZSApIHtcblx0XHRcdFx0Zmlyc3QgPSBpIC0gMTtcblx0XHRcdFx0Zm91bmRGaXJzdCA9IHRydWU7XG5cdFx0XHR9IGVsc2UgaWYgKCBmb3VuZEZpcnN0ICYmIHN0b3BzW2ldICE9PSBmYWxzZSApIHtcblx0XHRcdFx0bGFzdCA9IGk7XG5cdFx0XHRcdGkgPSBzdG9wcy5sZW5ndGg7XG5cdFx0XHR9XG5cdFx0XHRpKys7XG5cdFx0fVxuXHRcdHN0ZXBzID0gbGFzdCAtIGZpcnN0O1xuXHRcdGZpcnN0VmFsID0gcGFyc2VJbnQoIHN0b3BzW2ZpcnN0XS5yZXBsYWNlKCclJyksIDEwICk7XG5cdFx0aW5jciA9ICggcGFyc2VGbG9hdCggc3RvcHNbbGFzdF0ucmVwbGFjZSgnJScpICkgLSBmaXJzdFZhbCApIC8gc3RlcHM7XG5cdFx0aSA9IGZpcnN0ICsgMTtcblx0XHRzdGVwID0gMTtcblx0XHR3aGlsZSAoIGkgPCBsYXN0ICkge1xuXHRcdFx0c3RvcHNbaV0gPSAoIGZpcnN0VmFsICsgKCBzdGVwICogaW5jciApICkgKyAnJSc7XG5cdFx0XHRzdGVwKys7XG5cdFx0XHRpKys7XG5cdFx0fVxuXHRcdHJldHVybiBiYWNrRmlsbENvbG9yU3RvcHMoIHN0b3BzICk7XG5cdH1cblxuXHQkLmZuLmdyYWRpZW50ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cdFx0cmV0dXJuIHRoaXMuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyB0aGlzJ2xsIGJlIG9sZGlzaElFXG5cdFx0XHRpZiAoIG5vbkdyYWRpZW50SUUgKSB7XG5cdFx0XHRcdHN0dXBpZElFR3JhZGllbnQuYXBwbHkoIHRoaXMsIGFyZ3MgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIG5ldyBob3RuZXNzXG5cdFx0XHRcdCQoIHRoaXMgKS5jc3MoICdiYWNrZ3JvdW5kSW1hZ2UnLCBjcmVhdGVHcmFkaWVudC5hcHBseSggdGhpcywgYXJncyApICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG5cblx0JC5mbi5yYW5pbmJvd0dyYWRpZW50ID0gZnVuY3Rpb24oIG9yaWdpbiwgYXJncyApIHtcblx0XHR2YXIgb3B0cywgdGVtcGxhdGUsIGksIHN0ZXBzO1xuXG5cdFx0b3JpZ2luID0gb3JpZ2luIHx8ICd0b3AnO1xuXHRcdG9wdHMgPSAkLmV4dGVuZCgge30sIHsgczogMTAwLCBsOiA1MCB9LCBhcmdzICk7XG5cdFx0dGVtcGxhdGUgPSAnaHNsKCVoJSwnICsgb3B0cy5zICsgJyUsJyArIG9wdHMubCArICclKSc7XG5cdFx0aSA9IDA7XG5cdFx0c3RlcHMgPSBbXTtcblx0XHR3aGlsZSAoIGkgPD0gMzYwICkge1xuXHRcdFx0c3RlcHMucHVzaCggdGVtcGxhdGUucmVwbGFjZSgnJWglJywgaSkgKTtcblx0XHRcdGkgKz0gMzA7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHQkKHRoaXMpLmdyYWRpZW50KCBvcmlnaW4sIHN0ZXBzICk7XG5cdFx0fSk7XG5cdH07XG5cblx0Ly8gdGhlIGNvbG9ycGlja2VyIHdpZGdldCBkZWYuXG5cdElyaXMgPSB7XG5cdFx0b3B0aW9uczoge1xuXHRcdFx0Y29sb3I6IGZhbHNlLFxuXHRcdFx0bW9kZTogJ2hzbCcsXG5cdFx0XHRjb250cm9sczoge1xuXHRcdFx0XHRob3JpejogJ3MnLCAvLyBob3Jpem9udGFsIGRlZmF1bHRzIHRvIHNhdHVyYXRpb25cblx0XHRcdFx0dmVydDogJ2wnLCAvLyB2ZXJ0aWNhbCBkZWZhdWx0cyB0byBsaWdodG5lc3Ncblx0XHRcdFx0c3RyaXA6ICdoJyAvLyByaWdodCBzdHJpcCBkZWZhdWx0cyB0byBodWVcblx0XHRcdH0sXG5cdFx0XHRoaWRlOiB0cnVlLCAvLyBoaWRlIHRoZSBjb2xvciBwaWNrZXIgYnkgZGVmYXVsdFxuXHRcdFx0Ym9yZGVyOiB0cnVlLCAvLyBkcmF3IGEgYm9yZGVyIGFyb3VuZCB0aGUgY29sbGVjdGlvbiBvZiBVSSBlbGVtZW50c1xuXHRcdFx0dGFyZ2V0OiBmYWxzZSwgLy8gYSBET00gZWxlbWVudCAvIGpRdWVyeSBzZWxlY3RvciB0aGF0IHRoZSBlbGVtZW50IHdpbGwgYmUgYXBwZW5kZWQgd2l0aGluLiBPbmx5IHVzZWQgd2hlbiBjYWxsZWQgb24gYW4gaW5wdXQuXG5cdFx0XHR3aWR0aDogMjAwLCAvLyB0aGUgd2lkdGggb2YgdGhlIGNvbGxlY3Rpb24gb2YgVUkgZWxlbWVudHNcblx0XHRcdHBhbGV0dGVzOiBmYWxzZSAvLyBzaG93IGEgcGFsZXR0ZSBvZiBiYXNpYyBjb2xvcnMgYmVuZWF0aCB0aGUgc3F1YXJlLlxuXHRcdH0sXG5cdFx0X2NvbG9yOiAnJyxcblx0XHRfcGFsZXR0ZXM6IFsgJyMwMDAnLCAnI2ZmZicsICcjZDMzJywgJyNkOTMnLCAnI2VlMicsICcjODFkNzQyJywgJyMxZTczYmUnLCAnIzgyMjRlMycgXSxcblx0XHRfaW5pdGVkOiBmYWxzZSxcblx0XHRfZGVmYXVsdEhTTENvbnRyb2xzOiB7XG5cdFx0XHRob3JpejogJ3MnLFxuXHRcdFx0dmVydDogJ2wnLFxuXHRcdFx0c3RyaXA6ICdoJ1xuXHRcdH0sXG5cdFx0X2RlZmF1bHRIU1ZDb250cm9sczoge1xuXHRcdFx0aG9yaXo6ICdoJyxcblx0XHRcdHZlcnQ6ICd2Jyxcblx0XHRcdHN0cmlwOiAncydcblx0XHR9LFxuXHRcdF9zY2FsZToge1xuXHRcdFx0aDogMzYwLFxuXHRcdFx0czogMTAwLFxuXHRcdFx0bDogMTAwLFxuXHRcdFx0djogMTAwXG5cdFx0fSxcblx0XHRfY3JlYXRlOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0ZWwgPSBzZWxmLmVsZW1lbnQsXG5cdFx0XHRcdGNvbG9yID0gc2VsZi5vcHRpb25zLmNvbG9yIHx8IGVsLnZhbCgpO1xuXG5cdFx0XHRpZiAoIGdyYWRpZW50VHlwZSA9PT0gZmFsc2UgKSB7XG5cdFx0XHRcdHRlc3RHcmFkaWVudFR5cGUoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBlbC5pcyggJ2lucHV0JyApICkge1xuXHRcdFx0XHRpZiAoIHNlbGYub3B0aW9ucy50YXJnZXQgKSB7XG5cdFx0XHRcdFx0c2VsZi5waWNrZXIgPSAkKCBfaHRtbCApLmFwcGVuZFRvKCBzZWxmLm9wdGlvbnMudGFyZ2V0ICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2VsZi5waWNrZXIgPSAkKCBfaHRtbCApLmluc2VydEFmdGVyKCBlbCApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0c2VsZi5fYWRkSW5wdXRMaXN0ZW5lcnMoIGVsICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRlbC5hcHBlbmQoIF9odG1sICk7XG5cdFx0XHRcdHNlbGYucGlja2VyID0gZWwuZmluZCggJy5pcmlzLXBpY2tlcicgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQnJvd3NlcnMgLyBWZXJzaW9uc1xuXHRcdFx0Ly8gRmVhdHVyZSBkZXRlY3Rpb24gZG9lc24ndCB3b3JrIGZvciB0aGVzZSwgYW5kICQuYnJvd3NlciBpcyBkZXByZWNhdGVkXG5cdFx0XHRpZiAoIGlzSUUgKSB7XG5cdFx0XHRcdGlmICggSUVWZXJzaW9uID09PSA5ICkge1xuXHRcdFx0XHRcdHNlbGYucGlja2VyLmFkZENsYXNzKCAnaXJpcy1pZS05JyApO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBJRVZlcnNpb24gPD0gOCApIHtcblx0XHRcdFx0XHRzZWxmLnBpY2tlci5hZGRDbGFzcyggJ2lyaXMtaWUtbHQ5JyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKCBVQS5pbmRleE9mKCdjb21wYXRpYmxlJykgPCAwICYmIFVBLmluZGV4T2YoJ2todG1sJykgPCAwICYmIFVBLm1hdGNoKCAvbW96aWxsYS8gKSApIHtcblx0XHRcdFx0c2VsZi5waWNrZXIuYWRkQ2xhc3MoICdpcmlzLW1vemlsbGEnICk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggc2VsZi5vcHRpb25zLnBhbGV0dGVzICkge1xuXHRcdFx0XHRzZWxmLl9hZGRQYWxldHRlcygpO1xuXHRcdFx0fVxuXG5cdFx0XHRzZWxmLl9jb2xvciA9IG5ldyBDb2xvciggY29sb3IgKS5zZXRIU3BhY2UoIHNlbGYub3B0aW9ucy5tb2RlICk7XG5cdFx0XHRzZWxmLm9wdGlvbnMuY29sb3IgPSBzZWxmLl9jb2xvci50b1N0cmluZygpO1xuXG5cdFx0XHQvLyBwcmVwICdlbSBmb3IgcmUtdXNlXG5cdFx0XHRzZWxmLmNvbnRyb2xzID0ge1xuXHRcdFx0XHRzcXVhcmU6ICAgICAgc2VsZi5waWNrZXIuZmluZCggJy5pcmlzLXNxdWFyZScgKSxcblx0XHRcdFx0c3F1YXJlRHJhZzogIHNlbGYucGlja2VyLmZpbmQoICcuaXJpcy1zcXVhcmUtdmFsdWUnICksXG5cdFx0XHRcdGhvcml6OiAgICAgICBzZWxmLnBpY2tlci5maW5kKCAnLmlyaXMtc3F1YXJlLWhvcml6JyApLFxuXHRcdFx0XHR2ZXJ0OiAgICAgICAgc2VsZi5waWNrZXIuZmluZCggJy5pcmlzLXNxdWFyZS12ZXJ0JyApLFxuXHRcdFx0XHRzdHJpcDogICAgICAgc2VsZi5waWNrZXIuZmluZCggJy5pcmlzLXN0cmlwJyApLFxuXHRcdFx0XHRzdHJpcFNsaWRlcjogc2VsZi5waWNrZXIuZmluZCggJy5pcmlzLXN0cmlwIC5pcmlzLXNsaWRlci1vZmZzZXQnIClcblx0XHRcdH07XG5cblx0XHRcdC8vIHNtYWxsIHNhbml0eSBjaGVjayAtIGlmIHdlIGNob3NlIGhzdiwgY2hhbmdlIGRlZmF1bHQgY29udHJvbHMgYXdheSBmcm9tIGhzbFxuXHRcdFx0aWYgKCBzZWxmLm9wdGlvbnMubW9kZSA9PT0gJ2hzdicgJiYgc2VsZi5faGFzKCdsJywgc2VsZi5vcHRpb25zLmNvbnRyb2xzKSApIHtcblx0XHRcdFx0c2VsZi5vcHRpb25zLmNvbnRyb2xzID0gc2VsZi5fZGVmYXVsdEhTVkNvbnRyb2xzO1xuXHRcdFx0fSBlbHNlIGlmICggc2VsZi5vcHRpb25zLm1vZGUgPT09ICdoc2wnICYmIHNlbGYuX2hhcygndicsIHNlbGYub3B0aW9ucy5jb250cm9scykgKSB7XG5cdFx0XHRcdHNlbGYub3B0aW9ucy5jb250cm9scyA9IHNlbGYuX2RlZmF1bHRIU0xDb250cm9scztcblx0XHRcdH1cblxuXHRcdFx0Ly8gc3RvcmUgaXQuIEhTTCBnZXRzIHNxdWlycmVseVxuXHRcdFx0c2VsZi5odWUgPSBzZWxmLl9jb2xvci5oKCk7XG5cblx0XHRcdGlmICggc2VsZi5vcHRpb25zLmhpZGUgKSB7XG5cdFx0XHRcdHNlbGYucGlja2VyLmhpZGUoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBzZWxmLm9wdGlvbnMuYm9yZGVyICkge1xuXHRcdFx0XHRzZWxmLnBpY2tlci5hZGRDbGFzcyggJ2lyaXMtYm9yZGVyJyApO1xuXHRcdFx0fVxuXG5cdFx0XHRzZWxmLl9pbml0Q29udHJvbHMoKTtcblx0XHRcdHNlbGYuYWN0aXZlID0gJ2V4dGVybmFsJztcblx0XHRcdHNlbGYuX2RpbWVuc2lvbnMoKTtcblx0XHRcdHNlbGYuX2NoYW5nZSgpO1xuXHRcdH0sXG5cdFx0X2hhczogZnVuY3Rpb24obmVlZGxlLCBoYXlzdGFjaykge1xuXHRcdFx0dmFyIHJldCA9IGZhbHNlO1xuXHRcdFx0JC5lYWNoKGhheXN0YWNrLCBmdW5jdGlvbihpLHYpe1xuXHRcdFx0XHRpZiAoIG5lZWRsZSA9PT0gdiApIHtcblx0XHRcdFx0XHRyZXQgPSB0cnVlO1xuXHRcdFx0XHRcdC8vIGV4aXQgdGhlIGxvb3Bcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHJldDtcblx0XHR9LFxuXHRcdF9hZGRQYWxldHRlczogZnVuY3Rpb24gKCkge1xuXHRcdFx0dmFyIGNvbnRhaW5lciA9ICQoICc8ZGl2IGNsYXNzPVwiaXJpcy1wYWxldHRlLWNvbnRhaW5lclwiIC8+JyApLFxuXHRcdFx0XHRwYWxldHRlID0gJCggJzxhIGNsYXNzPVwiaXJpcy1wYWxldHRlXCIgdGFiaW5kZXg9XCIwXCIgLz4nICksXG5cdFx0XHRcdGNvbG9ycyA9ICQuaXNBcnJheSggdGhpcy5vcHRpb25zLnBhbGV0dGVzICkgPyB0aGlzLm9wdGlvbnMucGFsZXR0ZXMgOiB0aGlzLl9wYWxldHRlcztcblxuXHRcdFx0Ly8gZG8gd2UgaGF2ZSBhbiBleGlzdGluZyBjb250YWluZXI/IEVtcHR5IGFuZCByZXVzZSBpdC5cblx0XHRcdGlmICggdGhpcy5waWNrZXIuZmluZCggJy5pcmlzLXBhbGV0dGUtY29udGFpbmVyJyApLmxlbmd0aCApIHtcblx0XHRcdFx0Y29udGFpbmVyID0gdGhpcy5waWNrZXIuZmluZCggJy5pcmlzLXBhbGV0dGUtY29udGFpbmVyJyApLmRldGFjaCgpLmh0bWwoICcnICk7XG5cdFx0XHR9XG5cblx0XHRcdCQuZWFjaChjb2xvcnMsIGZ1bmN0aW9uKGluZGV4LCB2YWwpIHtcblx0XHRcdFx0cGFsZXR0ZS5jbG9uZSgpLmRhdGEoICdjb2xvcicsIHZhbCApXG5cdFx0XHRcdFx0LmNzcyggJ2JhY2tncm91bmRDb2xvcicsIHZhbCApLmFwcGVuZFRvKCBjb250YWluZXIgKVxuXHRcdFx0XHRcdC5oZWlnaHQoIDEwICkud2lkdGgoIDEwICk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5waWNrZXIuYXBwZW5kKGNvbnRhaW5lcik7XG5cdFx0fSxcblx0XHRfcGFpbnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0c2VsZi5fcGFpbnREaW1lbnNpb24oICd0b3AnLCAnc3RyaXAnICk7XG5cdFx0XHRzZWxmLl9wYWludERpbWVuc2lvbiggJ3RvcCcsICd2ZXJ0JyApO1xuXHRcdFx0c2VsZi5fcGFpbnREaW1lbnNpb24oICdsZWZ0JywgJ2hvcml6JyApO1xuXHRcdH0sXG5cdFx0X3BhaW50RGltZW5zaW9uOiBmdW5jdGlvbiggb3JpZ2luLCBjb250cm9sICkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdFx0XHRjID0gc2VsZi5fY29sb3IsXG5cdFx0XHRcdG1vZGUgPSBzZWxmLm9wdGlvbnMubW9kZSxcblx0XHRcdFx0Y29sb3IgPSBzZWxmLl9nZXRIU3BhY2VDb2xvcigpLFxuXHRcdFx0XHR0YXJnZXQgPSBzZWxmLmNvbnRyb2xzWyBjb250cm9sIF0sXG5cdFx0XHRcdGNvbnRyb2xPcHRzID0gc2VsZi5vcHRpb25zLmNvbnRyb2xzLFxuXHRcdFx0XHRzdG9wcztcblxuXHRcdFx0Ly8gZG9uJ3QgcGFpbnQgdGhlIGFjdGl2ZSBjb250cm9sXG5cdFx0XHRpZiAoIGNvbnRyb2wgPT09IHNlbGYuYWN0aXZlIHx8ICggc2VsZi5hY3RpdmUgPT09ICdzcXVhcmUnICYmIGNvbnRyb2wgIT09ICdzdHJpcCcgKSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRzd2l0Y2ggKCBjb250cm9sT3B0c1sgY29udHJvbCBdICkge1xuXHRcdFx0XHRjYXNlICdoJzpcblx0XHRcdFx0XHRpZiAoIG1vZGUgPT09ICdoc3YnICkge1xuXHRcdFx0XHRcdFx0Y29sb3IgPSBjLmNsb25lKCk7XG5cdFx0XHRcdFx0XHRzd2l0Y2ggKCBjb250cm9sICkge1xuXHRcdFx0XHRcdFx0XHRjYXNlICdob3Jpeic6XG5cdFx0XHRcdFx0XHRcdFx0Y29sb3JbY29udHJvbE9wdHMudmVydF0oMTAwKTtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0Y2FzZSAndmVydCc6XG5cdFx0XHRcdFx0XHRcdFx0Y29sb3JbY29udHJvbE9wdHMuaG9yaXpdKDEwMCk7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdGNhc2UgJ3N0cmlwJzpcblx0XHRcdFx0XHRcdFx0XHRjb2xvci5zZXRIU3BhY2UoJ2hzbCcpO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0c3RvcHMgPSBjb2xvci50b0hzbCgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAoIGNvbnRyb2wgPT09ICdzdHJpcCcgKSB7XG5cdFx0XHRcdFx0XHRcdHN0b3BzID0geyBzOiBjb2xvci5zLCBsOiBjb2xvci5sIH07XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRzdG9wcyA9IHsgczogMTAwLCBsOiBjb2xvci5sIH07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dGFyZ2V0LnJhbmluYm93R3JhZGllbnQoIG9yaWdpbiwgc3RvcHMgKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAncyc6XG5cdFx0XHRcdFx0aWYgKCBtb2RlID09PSAnaHN2JyApIHtcblx0XHRcdFx0XHRcdGlmICggY29udHJvbCA9PT0gJ3ZlcnQnICkge1xuXHRcdFx0XHRcdFx0XHRzdG9wcyA9IFsgYy5jbG9uZSgpLmEoMCkucygwKS50b0NTUygncmdiYScpLCBjLmNsb25lKCkuYSgxKS5zKDApLnRvQ1NTKCdyZ2JhJykgXTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoIGNvbnRyb2wgPT09ICdzdHJpcCcgKSB7XG5cdFx0XHRcdFx0XHRcdHN0b3BzID0gWyBjLmNsb25lKCkucygxMDApLnRvQ1NTKCdoc2wnKSwgYy5jbG9uZSgpLnMoMCkudG9DU1MoJ2hzbCcpIF07XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCBjb250cm9sID09PSAnaG9yaXonICkge1xuXHRcdFx0XHRcdFx0XHRzdG9wcyA9IFsgJyNmZmYnLCAnaHNsKCcgKyBjb2xvci5oICsgJywxMDAlLDUwJSknIF07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHsgLy8gaW1wbGljaXQgbW9kZSA9PT0gJ2hzbCdcblx0XHRcdFx0XHRcdGlmICggY29udHJvbCA9PT0gJ3ZlcnQnICYmIHNlbGYub3B0aW9ucy5jb250cm9scy5ob3JpeiA9PT0gJ2gnICkge1xuXHRcdFx0XHRcdFx0XHRzdG9wcyA9IFsnaHNsYSgwLCAwJSwgJyArIGNvbG9yLmwgKyAnJSwgMCknLCAnaHNsYSgwLCAwJSwgJyArIGNvbG9yLmwgKyAnJSwgMSknXTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHN0b3BzID0gWydoc2woJysgY29sb3IuaCArJywwJSw1MCUpJywgJ2hzbCgnICsgY29sb3IuaCArICcsMTAwJSw1MCUpJ107XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cblx0XHRcdFx0XHR0YXJnZXQuZ3JhZGllbnQoIG9yaWdpbiwgc3RvcHMgKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAnbCc6XG5cdFx0XHRcdFx0aWYgKCBjb250cm9sID09PSAnc3RyaXAnICkge1xuXHRcdFx0XHRcdFx0c3RvcHMgPSBbJ2hzbCgnICsgY29sb3IuaCArICcsMTAwJSwxMDAlKScsICdoc2woJyArIGNvbG9yLmggKyAnLCAnICsgY29sb3IucyArICclLDUwJSknLCAnaHNsKCcrIGNvbG9yLmggKycsMTAwJSwwJSknXTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c3RvcHMgPSBbJyNmZmYnLCAncmdiYSgyNTUsMjU1LDI1NSwwKSA1MCUnLCAncmdiYSgwLDAsMCwwKSA1MCUnLCAncmdiYSgwLDAsMCwxKSddO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0YXJnZXQuZ3JhZGllbnQoIG9yaWdpbiwgc3RvcHMgKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAndic6XG5cdFx0XHRcdFx0XHRpZiAoIGNvbnRyb2wgPT09ICdzdHJpcCcgKSB7XG5cdFx0XHRcdFx0XHRcdHN0b3BzID0gWyBjLmNsb25lKCkudigxMDApLnRvQ1NTKCksIGMuY2xvbmUoKS52KDApLnRvQ1NTKCkgXTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHN0b3BzID0gWydyZ2JhKDAsMCwwLDApJywgJyMwMDAnXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHRhcmdldC5ncmFkaWVudCggb3JpZ2luLCBzdG9wcyApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRfZ2V0SFNwYWNlQ29sb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICggdGhpcy5vcHRpb25zLm1vZGUgPT09ICdoc3YnICkgPyB0aGlzLl9jb2xvci50b0hzdigpIDogdGhpcy5fY29sb3IudG9Ic2woKTtcblx0XHR9LFxuXG5cdFx0X2RpbWVuc2lvbnM6IGZ1bmN0aW9uKCByZXNldCApIHtcblx0XHRcdC8vIHdoYXRldmVyIHNpemVcblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0b3B0cyA9IHNlbGYub3B0aW9ucyxcblx0XHRcdFx0Y29udHJvbHMgPSBzZWxmLmNvbnRyb2xzLFxuXHRcdFx0XHRzcXVhcmUgPSBjb250cm9scy5zcXVhcmUsXG5cdFx0XHRcdHN0cmlwID0gc2VsZi5waWNrZXIuZmluZCggJy5pcmlzLXN0cmlwJyApLFxuXHRcdFx0XHRzcXVhcmVXaWR0aCA9ICc3Ny41JScsXG5cdFx0XHRcdHN0cmlwV2lkdGggPSAnMTIlJyxcblx0XHRcdFx0dG90YWxQYWRkaW5nID0gMjAsXG5cdFx0XHRcdGlubmVyV2lkdGggPSBvcHRzLmJvcmRlciA/IG9wdHMud2lkdGggLSB0b3RhbFBhZGRpbmcgOiBvcHRzLndpZHRoLFxuXHRcdFx0XHRjb250cm9sc0hlaWdodCxcblx0XHRcdFx0cGFsZXR0ZUNvdW50ID0gJC5pc0FycmF5KCBvcHRzLnBhbGV0dGVzICkgPyBvcHRzLnBhbGV0dGVzLmxlbmd0aCA6IHNlbGYuX3BhbGV0dGVzLmxlbmd0aCxcblx0XHRcdFx0cGFsZXR0ZU1hcmdpbiwgcGFsZXR0ZVdpZHRoLCBwYWxldHRlQ29udGFpbmVyV2lkdGg7XG5cblx0XHRcdGlmICggcmVzZXQgKSB7XG5cdFx0XHRcdHNxdWFyZS5jc3MoICd3aWR0aCcsICcnICk7XG5cdFx0XHRcdHN0cmlwLmNzcyggJ3dpZHRoJywgJycgKTtcblx0XHRcdFx0c2VsZi5waWNrZXIuY3NzKCB7d2lkdGg6ICcnLCBoZWlnaHQ6ICcnfSApO1xuXHRcdFx0fVxuXG5cdFx0XHRzcXVhcmVXaWR0aCA9IGlubmVyV2lkdGggKiAoIHBhcnNlRmxvYXQoIHNxdWFyZVdpZHRoICkgLyAxMDAgKTtcblx0XHRcdHN0cmlwV2lkdGggPSBpbm5lcldpZHRoICogKCBwYXJzZUZsb2F0KCBzdHJpcFdpZHRoICkgLyAxMDAgKTtcblx0XHRcdGNvbnRyb2xzSGVpZ2h0ID0gb3B0cy5ib3JkZXIgPyBzcXVhcmVXaWR0aCArIHRvdGFsUGFkZGluZyA6IHNxdWFyZVdpZHRoO1xuXG5cdFx0XHRzcXVhcmUud2lkdGgoIHNxdWFyZVdpZHRoICkuaGVpZ2h0KCBzcXVhcmVXaWR0aCApO1xuXHRcdFx0c3RyaXAuaGVpZ2h0KCBzcXVhcmVXaWR0aCApLndpZHRoKCBzdHJpcFdpZHRoICk7XG5cdFx0XHRzZWxmLnBpY2tlci5jc3MoIHsgd2lkdGg6IG9wdHMud2lkdGgsIGhlaWdodDogY29udHJvbHNIZWlnaHQgfSApO1xuXG5cdFx0XHRpZiAoICEgb3B0cy5wYWxldHRlcyApIHtcblx0XHRcdFx0cmV0dXJuIHNlbGYucGlja2VyLmNzcyggJ3BhZGRpbmdCb3R0b20nLCAnJyApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBzaW5nbGUgbWFyZ2luIGF0IDIlXG5cdFx0XHRwYWxldHRlTWFyZ2luID0gc3F1YXJlV2lkdGggKiAyIC8gMTAwO1xuXHRcdFx0cGFsZXR0ZUNvbnRhaW5lcldpZHRoID0gc3F1YXJlV2lkdGggLSAoICggcGFsZXR0ZUNvdW50IC0gMSApICogcGFsZXR0ZU1hcmdpbiApO1xuXHRcdFx0cGFsZXR0ZVdpZHRoID0gcGFsZXR0ZUNvbnRhaW5lcldpZHRoIC8gcGFsZXR0ZUNvdW50O1xuXHRcdFx0c2VsZi5waWNrZXIuZmluZCgnLmlyaXMtcGFsZXR0ZScpLmVhY2goIGZ1bmN0aW9uKCBpICkge1xuXHRcdFx0XHR2YXIgbWFyZ2luID0gaSA9PT0gMCA/IDAgOiBwYWxldHRlTWFyZ2luO1xuXHRcdFx0XHQkKCB0aGlzICkuY3NzKHtcblx0XHRcdFx0XHR3aWR0aDogcGFsZXR0ZVdpZHRoLFxuXHRcdFx0XHRcdGhlaWdodDogcGFsZXR0ZVdpZHRoLFxuXHRcdFx0XHRcdG1hcmdpbkxlZnQ6IG1hcmdpblxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdFx0c2VsZi5waWNrZXIuY3NzKCAncGFkZGluZ0JvdHRvbScsIHBhbGV0dGVXaWR0aCArIHBhbGV0dGVNYXJnaW4gKTtcblx0XHRcdHN0cmlwLmhlaWdodCggcGFsZXR0ZVdpZHRoICsgcGFsZXR0ZU1hcmdpbiArIHNxdWFyZVdpZHRoICk7XG5cdFx0fSxcblxuXHRcdF9hZGRJbnB1dExpc3RlbmVyczogZnVuY3Rpb24oIGlucHV0ICkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdFx0XHRkZWJvdW5jZVRpbWVvdXQgPSAxMDAsXG5cdFx0XHRcdGNhbGxiYWNrID0gZnVuY3Rpb24oIGV2ZW50ICl7XG5cdFx0XHRcdFx0dmFyIGNvbG9yID0gbmV3IENvbG9yKCBpbnB1dC52YWwoKSApLFxuXHRcdFx0XHRcdFx0dmFsID0gaW5wdXQudmFsKCkucmVwbGFjZSggL14jLywgJycgKTtcblxuXHRcdFx0XHRcdGlucHV0LnJlbW92ZUNsYXNzKCAnaXJpcy1lcnJvcicgKTtcblx0XHRcdFx0XHQvLyB3ZSBnYXZlIGEgYmFkIGNvbG9yXG5cdFx0XHRcdFx0aWYgKCBjb2xvci5lcnJvciApIHtcblx0XHRcdFx0XHRcdC8vIGRvbid0IGVycm9yIG9uIGFuIGVtcHR5IGlucHV0IC0gd2Ugd2FudCB0aG9zZSBhbGxvd2VkXG5cdFx0XHRcdFx0XHRpZiAoIHZhbCAhPT0gJycgKSB7XG5cdFx0XHRcdFx0XHRcdGlucHV0LmFkZENsYXNzKCAnaXJpcy1lcnJvcicgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYgKCBjb2xvci50b1N0cmluZygpICE9PSBzZWxmLl9jb2xvci50b1N0cmluZygpICkge1xuXHRcdFx0XHRcdFx0XHQvLyBsZXQncyBub3QgZG8gdGhpcyBvbiBrZXl1cCBmb3IgaGV4IHNob3J0Y29kZXNcblx0XHRcdFx0XHRcdFx0aWYgKCAhICggZXZlbnQudHlwZSA9PT0gJ2tleXVwJyAmJiB2YWwubWF0Y2goIC9eWzAtOWEtZkEtRl17M30kLyApICkgKSB7XG5cdFx0XHRcdFx0XHRcdFx0c2VsZi5fc2V0T3B0aW9uKCAnY29sb3InLCBjb2xvci50b1N0cmluZygpICk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cblx0XHRcdGlucHV0Lm9uKCAnY2hhbmdlJywgY2FsbGJhY2sgKS5vbiggJ2tleXVwJywgc2VsZi5fZGVib3VuY2UoIGNhbGxiYWNrLCBkZWJvdW5jZVRpbWVvdXQgKSApO1xuXG5cdFx0XHQvLyBJZiB3ZSBpbml0aWFsaXplZCBoaWRkZW4sIHNob3cgb24gZmlyc3QgZm9jdXMuIFRoZSByZXN0IGlzIHVwIHRvIHlvdS5cblx0XHRcdGlmICggc2VsZi5vcHRpb25zLmhpZGUgKSB7XG5cdFx0XHRcdGlucHV0Lm9uZSggJ2ZvY3VzJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0c2VsZi5zaG93KCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRfaW5pdENvbnRyb2xzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0Y29udHJvbHMgPSBzZWxmLmNvbnRyb2xzLFxuXHRcdFx0XHRzcXVhcmUgPSBjb250cm9scy5zcXVhcmUsXG5cdFx0XHRcdGNvbnRyb2xPcHRzID0gc2VsZi5vcHRpb25zLmNvbnRyb2xzLFxuXHRcdFx0XHRzdHJpcFNjYWxlID0gc2VsZi5fc2NhbGVbY29udHJvbE9wdHMuc3RyaXBdO1xuXG5cdFx0XHRjb250cm9scy5zdHJpcFNsaWRlci5zbGlkZXIoe1xuXHRcdFx0XHRvcmllbnRhdGlvbjogJ3ZlcnRpY2FsJyxcblx0XHRcdFx0bWF4OiBzdHJpcFNjYWxlLFxuXHRcdFx0XHRzbGlkZTogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcblx0XHRcdFx0XHRzZWxmLmFjdGl2ZSA9ICdzdHJpcCc7XG5cdFx0XHRcdFx0Ly8gXCJyZXZlcnNlXCIgZm9yIGh1ZS5cblx0XHRcdFx0XHRpZiAoIGNvbnRyb2xPcHRzLnN0cmlwID09PSAnaCcgKSB7XG5cdFx0XHRcdFx0XHR1aS52YWx1ZSA9IHN0cmlwU2NhbGUgLSB1aS52YWx1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRzZWxmLl9jb2xvcltjb250cm9sT3B0cy5zdHJpcF0oIHVpLnZhbHVlICk7XG5cdFx0XHRcdFx0c2VsZi5fY2hhbmdlLmFwcGx5KCBzZWxmLCBhcmd1bWVudHMgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdGNvbnRyb2xzLnNxdWFyZURyYWcuZHJhZ2dhYmxlKHtcblx0XHRcdFx0Y29udGFpbm1lbnQ6IGNvbnRyb2xzLnNxdWFyZS5maW5kKCAnLmlyaXMtc3F1YXJlLWlubmVyJyApLFxuXHRcdFx0XHR6SW5kZXg6IDEwMDAsXG5cdFx0XHRcdGN1cnNvcjogJ21vdmUnLFxuXHRcdFx0XHRkcmFnOiBmdW5jdGlvbiggZXZlbnQsIHVpICkge1xuXHRcdFx0XHRcdHNlbGYuX3NxdWFyZURyYWcoIGV2ZW50LCB1aSApO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0c3F1YXJlLmFkZENsYXNzKCAnaXJpcy1kcmFnZ2luZycgKTtcblx0XHRcdFx0XHQkKHRoaXMpLmFkZENsYXNzKCAndWktc3RhdGUtZm9jdXMnICk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHN0b3A6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHNxdWFyZS5yZW1vdmVDbGFzcyggJ2lyaXMtZHJhZ2dpbmcnICk7XG5cdFx0XHRcdFx0JCh0aGlzKS5yZW1vdmVDbGFzcyggJ3VpLXN0YXRlLWZvY3VzJyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KS5vbiggJ21vdXNlZG93biBtb3VzZXVwJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHR2YXIgZm9jdXNDbGFzcyA9ICd1aS1zdGF0ZS1mb2N1cyc7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdGlmIChldmVudC50eXBlID09PSAnbW91c2Vkb3duJyApIHtcblx0XHRcdFx0XHRzZWxmLnBpY2tlci5maW5kKCAnLicgKyBmb2N1c0NsYXNzICkucmVtb3ZlQ2xhc3MoIGZvY3VzQ2xhc3MgKS5ibHVyKCk7XG5cdFx0XHRcdFx0JCh0aGlzKS5hZGRDbGFzcyggZm9jdXNDbGFzcyApLmZvY3VzKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCh0aGlzKS5yZW1vdmVDbGFzcyggZm9jdXNDbGFzcyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KS5vbiggJ2tleWRvd24nLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdHZhciBjb250YWluZXIgPSBjb250cm9scy5zcXVhcmUsXG5cdFx0XHRcdFx0ZHJhZ2dhYmxlID0gY29udHJvbHMuc3F1YXJlRHJhZyxcblx0XHRcdFx0XHRwb3NpdGlvbiA9IGRyYWdnYWJsZS5wb3NpdGlvbigpLFxuXHRcdFx0XHRcdGRpc3RhbmNlID0gc2VsZi5vcHRpb25zLndpZHRoIC8gMTAwOyAvLyBEaXN0YW5jZSBpbiBwaXhlbHMgdGhlIGRyYWdnYWJsZSBzaG91bGQgYmUgbW92ZWQ6IDEgXCJzdG9wXCJcblxuXHRcdFx0XHQvLyBtYWtlIGFsdCBrZXkgZ28gXCIxMFwiXG5cdFx0XHRcdGlmICggZXZlbnQuYWx0S2V5ICkge1xuXHRcdFx0XHRcdGRpc3RhbmNlICo9IDEwO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gUmVwb3NpdGlvbiBpZiBvbmUgb2YgdGhlIGRpcmVjdGlvbmFsIGtleXMgaXMgcHJlc3NlZFxuXHRcdFx0XHRzd2l0Y2ggKCBldmVudC5rZXlDb2RlICkge1xuXHRcdFx0XHRcdGNhc2UgMzc6IHBvc2l0aW9uLmxlZnQgLT0gZGlzdGFuY2U7IGJyZWFrOyAvLyBMZWZ0XG5cdFx0XHRcdFx0Y2FzZSAzODogcG9zaXRpb24udG9wICAtPSBkaXN0YW5jZTsgYnJlYWs7IC8vIFVwXG5cdFx0XHRcdFx0Y2FzZSAzOTogcG9zaXRpb24ubGVmdCArPSBkaXN0YW5jZTsgYnJlYWs7IC8vIFJpZ2h0XG5cdFx0XHRcdFx0Y2FzZSA0MDogcG9zaXRpb24udG9wICArPSBkaXN0YW5jZTsgYnJlYWs7IC8vIERvd25cblx0XHRcdFx0XHRkZWZhdWx0OiByZXR1cm4gdHJ1ZTsgLy8gRXhpdCBhbmQgYnViYmxlXG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBLZWVwIGRyYWdnYWJsZSB3aXRoaW4gY29udGFpbmVyXG5cdFx0XHRcdHBvc2l0aW9uLmxlZnQgPSBNYXRoLm1heCggMCwgTWF0aC5taW4oIHBvc2l0aW9uLmxlZnQsIGNvbnRhaW5lci53aWR0aCgpICkgKTtcblx0XHRcdFx0cG9zaXRpb24udG9wID0gIE1hdGgubWF4KCAwLCBNYXRoLm1pbiggcG9zaXRpb24udG9wLCBjb250YWluZXIuaGVpZ2h0KCkgKSApO1xuXG5cdFx0XHRcdGRyYWdnYWJsZS5jc3MocG9zaXRpb24pO1xuXHRcdFx0XHRzZWxmLl9zcXVhcmVEcmFnKCBldmVudCwgeyBwb3NpdGlvbjogcG9zaXRpb24gfSk7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gYWxsb3cgY2xpY2tpbmcgb24gdGhlIHNxdWFyZSB0byBtb3ZlIHRoZXJlIGFuZCBrZWVwIGRyYWdnaW5nXG5cdFx0XHRzcXVhcmUubW91c2Vkb3duKCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdHZhciBzcXVhcmVPZmZzZXQsIHBvcztcblx0XHRcdFx0Ly8gb25seSBsZWZ0IGNsaWNrXG5cdFx0XHRcdGlmICggZXZlbnQud2hpY2ggIT09IDEgKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gcHJldmVudCBidWJibGluZyBmcm9tIHRoZSBoYW5kbGU6IG5vIGluZmluaXRlIGxvb3BzXG5cdFx0XHRcdGlmICggISAkKCBldmVudC50YXJnZXQgKS5pcyggJ2RpdicgKSApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRzcXVhcmVPZmZzZXQgPSBzZWxmLmNvbnRyb2xzLnNxdWFyZS5vZmZzZXQoKTtcblx0XHRcdFx0cG9zID0ge1xuXHRcdFx0XHRcdFx0dG9wOiBldmVudC5wYWdlWSAtIHNxdWFyZU9mZnNldC50b3AsXG5cdFx0XHRcdFx0XHRsZWZ0OiBldmVudC5wYWdlWCAtIHNxdWFyZU9mZnNldC5sZWZ0XG5cdFx0XHRcdH07XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdHNlbGYuX3NxdWFyZURyYWcoIGV2ZW50LCB7IHBvc2l0aW9uOiBwb3MgfSApO1xuXHRcdFx0XHRldmVudC50YXJnZXQgPSBzZWxmLmNvbnRyb2xzLnNxdWFyZURyYWcuZ2V0KDApO1xuXHRcdFx0XHRzZWxmLmNvbnRyb2xzLnNxdWFyZURyYWcuY3NzKCBwb3MgKS50cmlnZ2VyKCBldmVudCApO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIHBhbGV0dGVzXG5cdFx0XHRpZiAoIHNlbGYub3B0aW9ucy5wYWxldHRlcyApIHtcblx0XHRcdFx0c2VsZi5fcGFsZXR0ZUxpc3RlbmVycygpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRfcGFsZXR0ZUxpc3RlbmVyczogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHRzZWxmLnBpY2tlci5maW5kKCcuaXJpcy1wYWxldHRlLWNvbnRhaW5lcicpLm9uKCdjbGljay5wYWxldHRlJywgJy5pcmlzLXBhbGV0dGUnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0c2VsZi5fY29sb3IuZnJvbUNTUyggJCh0aGlzKS5kYXRhKCdjb2xvcicpICk7XG5cdFx0XHRcdHNlbGYuYWN0aXZlID0gJ2V4dGVybmFsJztcblx0XHRcdFx0c2VsZi5fY2hhbmdlKCk7XG5cdFx0XHR9KS5vbiggJ2tleWRvd24ucGFsZXR0ZScsICcuaXJpcy1wYWxldHRlJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRpZiAoICEgKCBldmVudC5rZXlDb2RlID09PSAxMyB8fCBldmVudC5rZXlDb2RlID09PSAzMiApICkge1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHQkKCB0aGlzICkuY2xpY2soKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHRfc3F1YXJlRHJhZzogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0Y29udHJvbE9wdHMgPSBzZWxmLm9wdGlvbnMuY29udHJvbHMsXG5cdFx0XHRcdGRpbWVuc2lvbnMgPSBzZWxmLl9zcXVhcmVEaW1lbnNpb25zKCksXG5cdFx0XHRcdHZlcnRWYWwgPSBNYXRoLnJvdW5kKCAoIGRpbWVuc2lvbnMuaCAtIHVpLnBvc2l0aW9uLnRvcCApIC8gZGltZW5zaW9ucy5oICogc2VsZi5fc2NhbGVbY29udHJvbE9wdHMudmVydF0gKSxcblx0XHRcdFx0aG9yaXpWYWwgPSBzZWxmLl9zY2FsZVtjb250cm9sT3B0cy5ob3Jpel0gLSBNYXRoLnJvdW5kKCAoIGRpbWVuc2lvbnMudyAtIHVpLnBvc2l0aW9uLmxlZnQgKSAvIGRpbWVuc2lvbnMudyAqIHNlbGYuX3NjYWxlW2NvbnRyb2xPcHRzLmhvcml6XSApO1xuXG5cdFx0XHRzZWxmLl9jb2xvcltjb250cm9sT3B0cy5ob3Jpel0oIGhvcml6VmFsIClbY29udHJvbE9wdHMudmVydF0oIHZlcnRWYWwgKTtcblxuXHRcdFx0c2VsZi5hY3RpdmUgPSAnc3F1YXJlJztcblx0XHRcdHNlbGYuX2NoYW5nZS5hcHBseSggc2VsZiwgYXJndW1lbnRzICk7XG5cdFx0fSxcblxuXHRcdF9zZXRPcHRpb246IGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdFx0XHRvbGRWYWx1ZSA9IHNlbGYub3B0aW9uc1trZXldLFxuXHRcdFx0XHRkb0RpbWVuc2lvbnMgPSBmYWxzZSxcblx0XHRcdFx0aGV4TGVzc0NvbG9yLFxuXHRcdFx0XHRuZXdDb2xvcixcblx0XHRcdFx0bWV0aG9kO1xuXG5cdFx0XHQvLyBlbnN1cmUgdGhlIG5ldyB2YWx1ZSBpcyBzZXQuIFdlIGNhbiByZXNldCB0byBvbGRWYWx1ZSBpZiBzb21lIGNoZWNrIHdhc24ndCBtZXQuXG5cdFx0XHRzZWxmLm9wdGlvbnNba2V5XSA9IHZhbHVlO1xuXG5cdFx0XHRzd2l0Y2goa2V5KSB7XG5cdFx0XHRcdGNhc2UgJ2NvbG9yJzpcblx0XHRcdFx0XHQvLyBjYXN0IHRvIHN0cmluZyBpbiBjYXNlIHdlIGhhdmUgYSBudW1iZXJcblx0XHRcdFx0XHR2YWx1ZSA9ICcnICsgdmFsdWU7XG5cdFx0XHRcdFx0aGV4TGVzc0NvbG9yID0gdmFsdWUucmVwbGFjZSggL14jLywgJycgKTtcblx0XHRcdFx0XHRuZXdDb2xvciA9IG5ldyBDb2xvciggdmFsdWUgKS5zZXRIU3BhY2UoIHNlbGYub3B0aW9ucy5tb2RlICk7XG5cdFx0XHRcdFx0aWYgKCBuZXdDb2xvci5lcnJvciApIHtcblx0XHRcdFx0XHRcdHNlbGYub3B0aW9uc1trZXldID0gb2xkVmFsdWU7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHNlbGYuX2NvbG9yID0gbmV3Q29sb3I7XG5cdFx0XHRcdFx0XHRzZWxmLm9wdGlvbnMuY29sb3IgPSBzZWxmLm9wdGlvbnNba2V5XSA9IHNlbGYuX2NvbG9yLnRvU3RyaW5nKCk7XG5cdFx0XHRcdFx0XHRzZWxmLmFjdGl2ZSA9ICdleHRlcm5hbCc7XG5cdFx0XHRcdFx0XHRzZWxmLl9jaGFuZ2UoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ3BhbGV0dGVzJzpcblx0XHRcdFx0XHRkb0RpbWVuc2lvbnMgPSB0cnVlO1xuXG5cdFx0XHRcdFx0aWYgKCB2YWx1ZSApIHtcblx0XHRcdFx0XHRcdHNlbGYuX2FkZFBhbGV0dGVzKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHNlbGYucGlja2VyLmZpbmQoJy5pcmlzLXBhbGV0dGUtY29udGFpbmVyJykucmVtb3ZlKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gZG8gd2UgbmVlZCB0byBhZGQgZXZlbnRzP1xuXHRcdFx0XHRcdGlmICggISBvbGRWYWx1ZSApIHtcblx0XHRcdFx0XHRcdHNlbGYuX3BhbGV0dGVMaXN0ZW5lcnMoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ3dpZHRoJzpcblx0XHRcdFx0XHRkb0RpbWVuc2lvbnMgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdib3JkZXInOlxuXHRcdFx0XHRcdGRvRGltZW5zaW9ucyA9IHRydWU7XG5cdFx0XHRcdFx0bWV0aG9kID0gdmFsdWUgPyAnYWRkQ2xhc3MnIDogJ3JlbW92ZUNsYXNzJztcblx0XHRcdFx0XHRzZWxmLnBpY2tlclttZXRob2RdKCdpcmlzLWJvcmRlcicpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdtb2RlJzpcblx0XHRcdFx0Y2FzZSAnY29udHJvbHMnOlxuXHRcdFx0XHRcdC8vIGlmIG5vdGhpbmcncyBjaGFuZ2VkLCBsZXQncyBiYWlsLCBzaW5jZSB0aGlzIGNhdXNlcyByZS1yZW5kZXJpbmcgdGhlIHdob2xlIHdpZGdldFxuXHRcdFx0XHRcdGlmICggb2xkVmFsdWUgPT09IHZhbHVlICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIHdlJ3JlIHVzaW5nIHRoZXNlIHBvb3JseSBuYW1lZCB2YXJpYWJsZXMgYmVjYXVzZSB0aGV5J3JlIGFscmVhZHkgc2NvcGVkLlxuXHRcdFx0XHRcdC8vIG1ldGhvZCBpcyB0aGUgZWxlbWVudCB0aGF0IElyaXMgd2FzIGNhbGxlZCBvbi4gb2xkVmFsdWUgd2lsbCBiZSB0aGUgb3B0aW9uc1xuXHRcdFx0XHRcdG1ldGhvZCA9IHNlbGYuZWxlbWVudDtcblx0XHRcdFx0XHRvbGRWYWx1ZSA9IHNlbGYub3B0aW9ucztcblx0XHRcdFx0XHRvbGRWYWx1ZS5oaWRlID0gISBzZWxmLnBpY2tlci5pcyggJzp2aXNpYmxlJyApO1xuXHRcdFx0XHRcdHNlbGYuZGVzdHJveSgpO1xuXHRcdFx0XHRcdHNlbGYucGlja2VyLnJlbW92ZSgpO1xuXHRcdFx0XHRcdHJldHVybiAkKHNlbGYuZWxlbWVudCkuaXJpcyhvbGRWYWx1ZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIERvIHdlIG5lZWQgdG8gcmVjYWxjIGRpbWVuc2lvbnM/XG5cdFx0XHRpZiAoIGRvRGltZW5zaW9ucyApIHtcblx0XHRcdFx0c2VsZi5fZGltZW5zaW9ucyh0cnVlKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0X3NxdWFyZURpbWVuc2lvbnM6IGZ1bmN0aW9uKCBmb3JjZVJlZnJlc2ggKSB7XG5cdFx0XHR2YXIgc3F1YXJlID0gdGhpcy5jb250cm9scy5zcXVhcmUsXG5cdFx0XHRcdGRpbWVuc2lvbnMsXG5cdFx0XHRcdGNvbnRyb2w7XG5cblx0XHRcdGlmICggZm9yY2VSZWZyZXNoICE9PSB1bmRlZiAmJiBzcXVhcmUuZGF0YSgnZGltZW5zaW9ucycpICkge1xuXHRcdFx0XHRyZXR1cm4gc3F1YXJlLmRhdGEoJ2RpbWVuc2lvbnMnKTtcblx0XHRcdH1cblxuXHRcdFx0Y29udHJvbCA9IHRoaXMuY29udHJvbHMuc3F1YXJlRHJhZztcblx0XHRcdGRpbWVuc2lvbnMgPSB7XG5cdFx0XHRcdHc6IHNxdWFyZS53aWR0aCgpLFxuXHRcdFx0XHRoOiBzcXVhcmUuaGVpZ2h0KClcblx0XHRcdH07XG5cdFx0XHRzcXVhcmUuZGF0YSggJ2RpbWVuc2lvbnMnLCBkaW1lbnNpb25zICk7XG5cdFx0XHRyZXR1cm4gZGltZW5zaW9ucztcblx0XHR9LFxuXG5cdFx0X2lzTm9uSHVlQ29udHJvbDogZnVuY3Rpb24oIGFjdGl2ZSwgdHlwZSApIHtcblx0XHRcdGlmICggYWN0aXZlID09PSAnc3F1YXJlJyAmJiB0aGlzLm9wdGlvbnMuY29udHJvbHMuc3RyaXAgPT09ICdoJyApIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9IGVsc2UgaWYgKCB0eXBlID09PSAnZXh0ZXJuYWwnIHx8ICggdHlwZSA9PT0gJ2gnICYmIGFjdGl2ZSA9PT0gJ3N0cmlwJyApICkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0sXG5cblx0XHRfY2hhbmdlOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0Y29udHJvbHMgPSBzZWxmLmNvbnRyb2xzLFxuXHRcdFx0XHRjb2xvciA9IHNlbGYuX2dldEhTcGFjZUNvbG9yKCksXG5cdFx0XHRcdGFjdGlvbnMgPSBbICdzcXVhcmUnLCAnc3RyaXAnIF0sXG5cdFx0XHRcdGNvbnRyb2xPcHRzID0gc2VsZi5vcHRpb25zLmNvbnRyb2xzLFxuXHRcdFx0XHR0eXBlID0gY29udHJvbE9wdHNbc2VsZi5hY3RpdmVdIHx8ICdleHRlcm5hbCcsXG5cdFx0XHRcdG9sZEh1ZSA9IHNlbGYuaHVlO1xuXG5cdFx0XHRpZiAoIHNlbGYuYWN0aXZlID09PSAnc3RyaXAnICkge1xuXHRcdFx0XHQvLyB0YWtlIG5vIGFjdGlvbiBvbiBhbnkgb2YgdGhlIHNxdWFyZSBzbGlkZXJzIGlmIHdlIGFkanVzdGVkIHRoZSBzdHJpcFxuXHRcdFx0XHRhY3Rpb25zID0gW107XG5cdFx0XHR9IGVsc2UgaWYgKCBzZWxmLmFjdGl2ZSAhPT0gJ2V4dGVybmFsJyApIHtcblx0XHRcdFx0Ly8gZm9yIG5vbi1zdHJpcCwgbm9uLWV4dGVybmFsLCBzdHJpcCBzaG91bGQgbmV2ZXIgY2hhbmdlXG5cdFx0XHRcdGFjdGlvbnMucG9wKCk7IC8vIGNvbnZlbmllbnRseSB0aGUgbGFzdCBpdGVtXG5cdFx0XHR9XG5cblx0XHRcdCQuZWFjaCggYWN0aW9ucywgZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcblx0XHRcdFx0dmFyIHZhbHVlLCBkaW1lbnNpb25zLCBjc3NPYmo7XG5cdFx0XHRcdGlmICggaXRlbSAhPT0gc2VsZi5hY3RpdmUgKSB7XG5cdFx0XHRcdFx0c3dpdGNoICggaXRlbSApIHtcblx0XHRcdFx0XHRcdGNhc2UgJ3N0cmlwJzpcblx0XHRcdFx0XHRcdFx0Ly8gcmV2ZXJzZSBmb3IgaHVlXG5cdFx0XHRcdFx0XHRcdHZhbHVlID0gKCBjb250cm9sT3B0cy5zdHJpcCA9PT0gJ2gnICkgPyBzZWxmLl9zY2FsZVtjb250cm9sT3B0cy5zdHJpcF0gLSBjb2xvcltjb250cm9sT3B0cy5zdHJpcF0gOiBjb2xvcltjb250cm9sT3B0cy5zdHJpcF07XG5cdFx0XHRcdFx0XHRcdGNvbnRyb2xzLnN0cmlwU2xpZGVyLnNsaWRlciggJ3ZhbHVlJywgdmFsdWUgKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlICdzcXVhcmUnOlxuXHRcdFx0XHRcdFx0XHRkaW1lbnNpb25zID0gc2VsZi5fc3F1YXJlRGltZW5zaW9ucygpO1xuXHRcdFx0XHRcdFx0XHRjc3NPYmogPSB7XG5cdFx0XHRcdFx0XHRcdFx0bGVmdDogY29sb3JbY29udHJvbE9wdHMuaG9yaXpdIC8gc2VsZi5fc2NhbGVbY29udHJvbE9wdHMuaG9yaXpdICogZGltZW5zaW9ucy53LFxuXHRcdFx0XHRcdFx0XHRcdHRvcDogZGltZW5zaW9ucy5oIC0gKCBjb2xvcltjb250cm9sT3B0cy52ZXJ0XSAvIHNlbGYuX3NjYWxlW2NvbnRyb2xPcHRzLnZlcnRdICogZGltZW5zaW9ucy5oIClcblx0XHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0XHRzZWxmLmNvbnRyb2xzLnNxdWFyZURyYWcuY3NzKCBjc3NPYmogKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gRW5zdXJlIHRoYXQgd2UgZG9uJ3QgY2hhbmdlIGh1ZSBpZiB3ZSB0cmlnZ2VyZWQgYSBodWUgcmVzZXRcblx0XHRcdGlmICggY29sb3IuaCAhPT0gb2xkSHVlICYmIHNlbGYuX2lzTm9uSHVlQ29udHJvbCggc2VsZi5hY3RpdmUsIHR5cGUgKSApIHtcblx0XHRcdFx0c2VsZi5fY29sb3IuaChvbGRIdWUpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBzdG9yZSBodWUgZm9yIHJlcGVhdGluZyBhYm92ZSBjaGVjayBuZXh0IHRpbWVcblx0XHRcdHNlbGYuaHVlID0gc2VsZi5fY29sb3IuaCgpO1xuXG5cdFx0XHRzZWxmLm9wdGlvbnMuY29sb3IgPSBzZWxmLl9jb2xvci50b1N0cmluZygpO1xuXG5cdFx0XHQvLyBvbmx5IHJ1biBhZnRlciB0aGUgZmlyc3QgdGltZVxuXHRcdFx0aWYgKCBzZWxmLl9pbml0ZWQgKSB7XG5cdFx0XHRcdHNlbGYuX3RyaWdnZXIoICdjaGFuZ2UnLCB7IHR5cGU6IHNlbGYuYWN0aXZlIH0sIHsgY29sb3I6IHNlbGYuX2NvbG9yIH0gKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBzZWxmLmVsZW1lbnQuaXMoICc6aW5wdXQnICkgJiYgISBzZWxmLl9jb2xvci5lcnJvciApIHtcblx0XHRcdFx0c2VsZi5lbGVtZW50LnJlbW92ZUNsYXNzKCAnaXJpcy1lcnJvcicgKTtcblx0XHRcdFx0aWYgKCBzZWxmLmVsZW1lbnQudmFsKCkgIT09IHNlbGYuX2NvbG9yLnRvU3RyaW5nKCkgKSB7XG5cdFx0XHRcdFx0c2VsZi5lbGVtZW50LnZhbCggc2VsZi5fY29sb3IudG9TdHJpbmcoKSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHNlbGYuX3BhaW50KCk7XG5cdFx0XHRzZWxmLl9pbml0ZWQgPSB0cnVlO1xuXHRcdFx0c2VsZi5hY3RpdmUgPSBmYWxzZTtcblx0XHR9LFxuXHRcdC8vIHRha2VuIGZyb20gdW5kZXJzY29yZS5qcyBfLmRlYm91bmNlIG1ldGhvZFxuXHRcdF9kZWJvdW5jZTogZnVuY3Rpb24oIGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSApIHtcblx0XHRcdHZhciB0aW1lb3V0LCByZXN1bHQ7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBjb250ZXh0ID0gdGhpcyxcblx0XHRcdFx0XHRhcmdzID0gYXJndW1lbnRzLFxuXHRcdFx0XHRcdGxhdGVyLFxuXHRcdFx0XHRcdGNhbGxOb3c7XG5cblx0XHRcdFx0bGF0ZXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aW1lb3V0ID0gbnVsbDtcblx0XHRcdFx0XHRpZiAoICEgaW1tZWRpYXRlKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgPSBmdW5jLmFwcGx5KCBjb250ZXh0LCBhcmdzICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG5cdFx0XHRcdGNsZWFyVGltZW91dCggdGltZW91dCApO1xuXHRcdFx0XHR0aW1lb3V0ID0gc2V0VGltZW91dCggbGF0ZXIsIHdhaXQgKTtcblx0XHRcdFx0aWYgKCBjYWxsTm93ICkge1xuXHRcdFx0XHRcdHJlc3VsdCA9IGZ1bmMuYXBwbHkoIGNvbnRleHQsIGFyZ3MgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fTtcblx0XHR9LFxuXHRcdHNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5waWNrZXIuc2hvdygpO1xuXHRcdH0sXG5cdFx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnBpY2tlci5oaWRlKCk7XG5cdFx0fSxcblx0XHR0b2dnbGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5waWNrZXIudG9nZ2xlKCk7XG5cdFx0fSxcblx0XHRjb2xvcjogZnVuY3Rpb24obmV3Q29sb3IpIHtcblx0XHRcdGlmICggbmV3Q29sb3IgPT09IHRydWUgKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9jb2xvci5jbG9uZSgpO1xuXHRcdFx0fSBlbHNlIGlmICggbmV3Q29sb3IgPT09IHVuZGVmICkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fY29sb3IudG9TdHJpbmcoKTtcblx0XHRcdH1cblx0XHRcdHRoaXMub3B0aW9uKCdjb2xvcicsIG5ld0NvbG9yKTtcblx0XHR9XG5cdH07XG5cdC8vIGluaXRpYWxpemUgdGhlIHdpZGdldFxuXHQkLndpZGdldCggJ2E4Yy5pcmlzJywgSXJpcyApO1xuXHQvLyBhZGQgQ1NTXG5cdCQoICc8c3R5bGUgaWQ9XCJpcmlzLWNzc1wiPicgKyBfY3NzICsgJzwvc3R5bGU+JyApLmFwcGVuZFRvKCAnaGVhZCcgKTtcblxufSggalF1ZXJ5ICkpO1xuLyohIENvbG9yLmpzIC0gdjAuOS4xMSAtIDIwMTMtMDgtMDlcbiogaHR0cHM6Ly9naXRodWIuY29tL0F1dG9tYXR0aWMvQ29sb3IuanNcbiogQ29weXJpZ2h0IChjKSAyMDEzIE1hdHQgV2llYmU7IExpY2Vuc2VkIEdQTHYyICovXG4oZnVuY3Rpb24oZ2xvYmFsLCB1bmRlZikge1xuXG5cdHZhciBDb2xvciA9IGZ1bmN0aW9uKCBjb2xvciwgdHlwZSApIHtcblx0XHRpZiAoICEgKCB0aGlzIGluc3RhbmNlb2YgQ29sb3IgKSApXG5cdFx0XHRyZXR1cm4gbmV3IENvbG9yKCBjb2xvciwgdHlwZSApO1xuXG5cdFx0cmV0dXJuIHRoaXMuX2luaXQoIGNvbG9yLCB0eXBlICk7XG5cdH07XG5cblx0Q29sb3IuZm4gPSBDb2xvci5wcm90b3R5cGUgPSB7XG5cdFx0X2NvbG9yOiAwLFxuXHRcdF9hbHBoYTogMSxcblx0XHRlcnJvcjogZmFsc2UsXG5cdFx0Ly8gZm9yIHByZXNlcnZpbmcgaHVlL3NhdCBpbiBmcm9tSHNsKCkudG9Ic2woKSBmbG93c1xuXHRcdF9oc2w6IHsgaDogMCwgczogMCwgbDogMCB9LFxuXHRcdC8vIGZvciBwcmVzZXJ2aW5nIGh1ZS9zYXQgaW4gZnJvbUhzdigpLnRvSHN2KCkgZmxvd3Ncblx0XHRfaHN2OiB7IGg6IDAsIHM6IDAsIHY6IDAgfSxcblx0XHQvLyBmb3Igc2V0dGluZyBoc2wgb3IgaHN2IHNwYWNlIC0gbmVlZGVkIGZvciAuaCgpICYgLnMoKSBmdW5jdGlvbnMgdG8gZnVuY3Rpb24gcHJvcGVybHlcblx0XHRfaFNwYWNlOiAnaHNsJyxcblx0XHRfaW5pdDogZnVuY3Rpb24oIGNvbG9yICkge1xuXHRcdFx0dmFyIGZ1bmMgPSAnbm9vcCc7XG5cdFx0XHRzd2l0Y2ggKCB0eXBlb2YgY29sb3IgKSB7XG5cdFx0XHRcdFx0Y2FzZSAnb2JqZWN0Jzpcblx0XHRcdFx0XHRcdC8vIGFscGhhP1xuXHRcdFx0XHRcdFx0aWYgKCBjb2xvci5hICE9PSB1bmRlZiApXG5cdFx0XHRcdFx0XHRcdHRoaXMuYSggY29sb3IuYSApO1xuXHRcdFx0XHRcdFx0ZnVuYyA9ICggY29sb3IuciAhPT0gdW5kZWYgKSA/ICdmcm9tUmdiJyA6XG5cdFx0XHRcdFx0XHRcdCggY29sb3IubCAhPT0gdW5kZWYgKSA/ICdmcm9tSHNsJyA6XG5cdFx0XHRcdFx0XHRcdCggY29sb3IudiAhPT0gdW5kZWYgKSA/ICdmcm9tSHN2JyA6IGZ1bmM7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdGhpc1tmdW5jXSggY29sb3IgKTtcblx0XHRcdFx0XHRjYXNlICdzdHJpbmcnOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuZnJvbUNTUyggY29sb3IgKTtcblx0XHRcdFx0XHRjYXNlICdudW1iZXInOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuZnJvbUludCggcGFyc2VJbnQoIGNvbG9yLCAxMCApICk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXG5cdFx0X2Vycm9yOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuZXJyb3IgPSB0cnVlO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdGNsb25lOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBuZXdDb2xvciA9IG5ldyBDb2xvciggdGhpcy50b0ludCgpICksXG5cdFx0XHRcdGNvcHkgPSBbJ19hbHBoYScsICdfaFNwYWNlJywgJ19oc2wnLCAnX2hzdicsICdlcnJvciddO1xuXHRcdFx0Zm9yICggdmFyIGkgPSBjb3B5Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuXHRcdFx0XHRuZXdDb2xvclsgY29weVtpXSBdID0gdGhpc1sgY29weVtpXSBdO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5ld0NvbG9yO1xuXHRcdH0sXG5cblx0XHRzZXRIU3BhY2U6IGZ1bmN0aW9uKCBzcGFjZSApIHtcblx0XHRcdHRoaXMuX2hTcGFjZSA9ICggc3BhY2UgPT09ICdoc3YnICkgPyBzcGFjZSA6ICdoc2wnO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdG5vb3A6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdGZyb21DU1M6IGZ1bmN0aW9uKCBjb2xvciApIHtcblx0XHRcdHZhciBsaXN0LFxuXHRcdFx0XHRsZWFkaW5nUkUgPSAvXihyZ2J8aHMobHx2KSlhP1xcKC87XG5cdFx0XHR0aGlzLmVycm9yID0gZmFsc2U7XG5cblx0XHRcdC8vIHdoaXRlc3BhY2UgYW5kIHNlbWljb2xvbiB0cmltXG5cdFx0XHRjb2xvciA9IGNvbG9yLnJlcGxhY2UoL15cXHMrLywgJycpLnJlcGxhY2UoL1xccyskLywgJycpLnJlcGxhY2UoLzskLywgJycpO1xuXG5cdFx0XHRpZiAoIGNvbG9yLm1hdGNoKGxlYWRpbmdSRSkgJiYgY29sb3IubWF0Y2goL1xcKSQvKSApIHtcblx0XHRcdFx0bGlzdCA9IGNvbG9yLnJlcGxhY2UoLyhcXHN8JSkvZywgJycpLnJlcGxhY2UobGVhZGluZ1JFLCAnJykucmVwbGFjZSgvLD9cXCk7PyQvLCAnJykuc3BsaXQoJywnKTtcblxuXHRcdFx0XHRpZiAoIGxpc3QubGVuZ3RoIDwgMyApXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2Vycm9yKCk7XG5cblx0XHRcdFx0aWYgKCBsaXN0Lmxlbmd0aCA9PT0gNCApIHtcblx0XHRcdFx0XHR0aGlzLmEoIHBhcnNlRmxvYXQoIGxpc3QucG9wKCkgKSApO1xuXHRcdFx0XHRcdC8vIGVycm9yIHN0YXRlIGhhcyBiZWVuIHNldCB0byB0cnVlIGluIC5hKCkgaWYgd2UgcGFzc2VkIE5hTlxuXHRcdFx0XHRcdGlmICggdGhpcy5lcnJvciApXG5cdFx0XHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZvciAodmFyIGkgPSBsaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0XHRcdFx0bGlzdFtpXSA9IHBhcnNlSW50KGxpc3RbaV0sIDEwKTtcblx0XHRcdFx0XHRpZiAoIGlzTmFOKCBsaXN0W2ldICkgKVxuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2Vycm9yKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIGNvbG9yLm1hdGNoKC9ecmdiLykgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZnJvbVJnYigge1xuXHRcdFx0XHRcdFx0cjogbGlzdFswXSxcblx0XHRcdFx0XHRcdGc6IGxpc3RbMV0sXG5cdFx0XHRcdFx0XHRiOiBsaXN0WzJdXG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBjb2xvci5tYXRjaCgvXmhzdi8pICkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmZyb21Ic3YoIHtcblx0XHRcdFx0XHRcdGg6IGxpc3RbMF0sXG5cdFx0XHRcdFx0XHRzOiBsaXN0WzFdLFxuXHRcdFx0XHRcdFx0djogbGlzdFsyXVxuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5mcm9tSHNsKCB7XG5cdFx0XHRcdFx0XHRoOiBsaXN0WzBdLFxuXHRcdFx0XHRcdFx0czogbGlzdFsxXSxcblx0XHRcdFx0XHRcdGw6IGxpc3RbMl1cblx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIG11c3QgYmUgaGV4IGFtaXJpdGU/XG5cdFx0XHRcdHJldHVybiB0aGlzLmZyb21IZXgoIGNvbG9yICk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGZyb21SZ2I6IGZ1bmN0aW9uKCByZ2IsIHByZXNlcnZlICkge1xuXHRcdFx0aWYgKCB0eXBlb2YgcmdiICE9PSAnb2JqZWN0JyB8fCByZ2IuciA9PT0gdW5kZWYgfHwgcmdiLmcgPT09IHVuZGVmIHx8IHJnYi5iID09PSB1bmRlZiApXG5cdFx0XHRcdHJldHVybiB0aGlzLl9lcnJvcigpO1xuXG5cdFx0XHR0aGlzLmVycm9yID0gZmFsc2U7XG5cdFx0XHRyZXR1cm4gdGhpcy5mcm9tSW50KCBwYXJzZUludCggKCByZ2IuciA8PCAxNiApICsgKCByZ2IuZyA8PCA4ICkgKyByZ2IuYiwgMTAgKSwgcHJlc2VydmUgKTtcblx0XHR9LFxuXG5cdFx0ZnJvbUhleDogZnVuY3Rpb24oIGNvbG9yICkge1xuXHRcdFx0Y29sb3IgPSBjb2xvci5yZXBsYWNlKC9eIy8sICcnKS5yZXBsYWNlKC9eMHgvLCAnJyk7XG5cdFx0XHRpZiAoIGNvbG9yLmxlbmd0aCA9PT0gMyApIHtcblx0XHRcdFx0Y29sb3IgPSBjb2xvclswXSArIGNvbG9yWzBdICsgY29sb3JbMV0gKyBjb2xvclsxXSArIGNvbG9yWzJdICsgY29sb3JbMl07XG5cdFx0XHR9XG5cblx0XHRcdC8vIHJvdWdoIGVycm9yIGNoZWNraW5nIC0gdGhpcyBpcyB3aGVyZSB0aGluZ3MgZ28gc3F1aXJyZWx5IHRoZSBtb3N0XG5cdFx0XHR0aGlzLmVycm9yID0gISAvXlswLTlBLUZdezZ9JC9pLnRlc3QoIGNvbG9yICk7XG5cdFx0XHRyZXR1cm4gdGhpcy5mcm9tSW50KCBwYXJzZUludCggY29sb3IsIDE2ICkgKTtcblx0XHR9LFxuXG5cdFx0ZnJvbUhzbDogZnVuY3Rpb24oIGhzbCApIHtcblx0XHRcdHZhciByLCBnLCBiLCBxLCBwLCBoLCBzLCBsO1xuXG5cdFx0XHRpZiAoIHR5cGVvZiBoc2wgIT09ICdvYmplY3QnIHx8IGhzbC5oID09PSB1bmRlZiB8fCBoc2wucyA9PT0gdW5kZWYgfHwgaHNsLmwgPT09IHVuZGVmIClcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2Vycm9yKCk7XG5cblx0XHRcdHRoaXMuX2hzbCA9IGhzbDsgLy8gc3RvcmUgaXRcblx0XHRcdHRoaXMuX2hTcGFjZSA9ICdoc2wnOyAvLyBpbXBsaWNpdFxuXHRcdFx0aCA9IGhzbC5oIC8gMzYwOyBzID0gaHNsLnMgLyAxMDA7IGwgPSBoc2wubCAvIDEwMDtcblx0XHRcdGlmICggcyA9PT0gMCApIHtcblx0XHRcdFx0ciA9IGcgPSBiID0gbDsgLy8gYWNocm9tYXRpY1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHEgPSBsIDwgMC41ID8gbCAqICggMSArIHMgKSA6IGwgKyBzIC0gbCAqIHM7XG5cdFx0XHRcdHAgPSAyICogbCAtIHE7XG5cdFx0XHRcdHIgPSB0aGlzLmh1ZTJyZ2IoIHAsIHEsIGggKyAxLzMgKTtcblx0XHRcdFx0ZyA9IHRoaXMuaHVlMnJnYiggcCwgcSwgaCApO1xuXHRcdFx0XHRiID0gdGhpcy5odWUycmdiKCBwLCBxLCBoIC0gMS8zICk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcy5mcm9tUmdiKCB7XG5cdFx0XHRcdHI6IHIgKiAyNTUsXG5cdFx0XHRcdGc6IGcgKiAyNTUsXG5cdFx0XHRcdGI6IGIgKiAyNTVcblx0XHRcdH0sIHRydWUgKTsgLy8gdHJ1ZSBwcmVzZXJ2ZXMgaHVlL3NhdFxuXHRcdH0sXG5cblx0XHRmcm9tSHN2OiBmdW5jdGlvbiggaHN2ICkge1xuXHRcdFx0dmFyIGgsIHMsIHYsIHIsIGcsIGIsIGksIGYsIHAsIHEsIHQ7XG5cdFx0XHRpZiAoIHR5cGVvZiBoc3YgIT09ICdvYmplY3QnIHx8IGhzdi5oID09PSB1bmRlZiB8fCBoc3YucyA9PT0gdW5kZWYgfHwgaHN2LnYgPT09IHVuZGVmIClcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2Vycm9yKCk7XG5cblx0XHRcdHRoaXMuX2hzdiA9IGhzdjsgLy8gc3RvcmUgaXRcblx0XHRcdHRoaXMuX2hTcGFjZSA9ICdoc3YnOyAvLyBpbXBsaWNpdFxuXG5cdFx0XHRoID0gaHN2LmggLyAzNjA7IHMgPSBoc3YucyAvIDEwMDsgdiA9IGhzdi52IC8gMTAwO1xuXHRcdFx0aSA9IE1hdGguZmxvb3IoIGggKiA2ICk7XG5cdFx0XHRmID0gaCAqIDYgLSBpO1xuXHRcdFx0cCA9IHYgKiAoIDEgLSBzICk7XG5cdFx0XHRxID0gdiAqICggMSAtIGYgKiBzICk7XG5cdFx0XHR0ID0gdiAqICggMSAtICggMSAtIGYgKSAqIHMgKTtcblxuXHRcdFx0c3dpdGNoKCBpICUgNiApIHtcblx0XHRcdFx0Y2FzZSAwOlxuXHRcdFx0XHRcdHIgPSB2OyBnID0gdDsgYiA9IHA7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0XHRyID0gcTsgZyA9IHY7IGIgPSBwO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIDI6XG5cdFx0XHRcdFx0ciA9IHA7IGcgPSB2OyBiID0gdDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRcdHIgPSBwOyBnID0gcTsgYiA9IHY7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgNDpcblx0XHRcdFx0XHRyID0gdDsgZyA9IHA7IGIgPSB2O1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIDU6XG5cdFx0XHRcdFx0ciA9IHY7IGcgPSBwOyBiID0gcTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXMuZnJvbVJnYigge1xuXHRcdFx0XHRyOiByICogMjU1LFxuXHRcdFx0XHRnOiBnICogMjU1LFxuXHRcdFx0XHRiOiBiICogMjU1XG5cdFx0XHR9LCB0cnVlICk7IC8vIHRydWUgcHJlc2VydmVzIGh1ZS9zYXRcblxuXHRcdH0sXG5cdFx0Ly8gZXZlcnl0aGluZyBjb21lcyBkb3duIHRvIGZyb21JbnRcblx0XHRmcm9tSW50OiBmdW5jdGlvbiggY29sb3IsIHByZXNlcnZlICkge1xuXHRcdFx0dGhpcy5fY29sb3IgPSBwYXJzZUludCggY29sb3IsIDEwICk7XG5cblx0XHRcdGlmICggaXNOYU4oIHRoaXMuX2NvbG9yICkgKVxuXHRcdFx0XHR0aGlzLl9jb2xvciA9IDA7XG5cblx0XHRcdC8vIGxldCdzIGNvZXJjZSB0aGluZ3Ncblx0XHRcdGlmICggdGhpcy5fY29sb3IgPiAxNjc3NzIxNSApXG5cdFx0XHRcdHRoaXMuX2NvbG9yID0gMTY3NzcyMTU7XG5cdFx0XHRlbHNlIGlmICggdGhpcy5fY29sb3IgPCAwIClcblx0XHRcdFx0dGhpcy5fY29sb3IgPSAwO1xuXG5cdFx0XHQvLyBsZXQncyBub3QgZG8gd2VpcmQgdGhpbmdzXG5cdFx0XHRpZiAoIHByZXNlcnZlID09PSB1bmRlZiApIHtcblx0XHRcdFx0dGhpcy5faHN2LmggPSB0aGlzLl9oc3YucyA9IHRoaXMuX2hzbC5oID0gdGhpcy5faHNsLnMgPSAwO1xuXHRcdFx0fVxuXHRcdFx0Ly8gRVZFTlQgR09FUyBIRVJFXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXG5cdFx0aHVlMnJnYjogZnVuY3Rpb24oIHAsIHEsIHQgKSB7XG5cdFx0XHRpZiAoIHQgPCAwICkge1xuXHRcdFx0XHR0ICs9IDE7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHQgPiAxICkge1xuXHRcdFx0XHR0IC09IDE7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHQgPCAxLzYgKSB7XG5cdFx0XHRcdHJldHVybiBwICsgKCBxIC0gcCApICogNiAqIHQ7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHQgPCAxLzIgKSB7XG5cdFx0XHRcdHJldHVybiBxO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCB0IDwgMi8zICkge1xuXHRcdFx0XHRyZXR1cm4gcCArICggcSAtIHAgKSAqICggMi8zIC0gdCApICogNjtcblx0XHRcdH1cblx0XHRcdHJldHVybiBwO1xuXHRcdH0sXG5cblx0XHR0b1N0cmluZzogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgaGV4ID0gcGFyc2VJbnQoIHRoaXMuX2NvbG9yLCAxMCApLnRvU3RyaW5nKCAxNiApO1xuXHRcdFx0aWYgKCB0aGlzLmVycm9yIClcblx0XHRcdFx0cmV0dXJuICcnO1xuXHRcdFx0Ly8gbWF5YmUgbGVmdCBwYWQgaXRcblx0XHRcdGlmICggaGV4Lmxlbmd0aCA8IDYgKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSA2IC0gaGV4Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0XHRcdFx0aGV4ID0gJzAnICsgaGV4O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gJyMnICsgaGV4O1xuXHRcdH0sXG5cblx0XHR0b0NTUzogZnVuY3Rpb24oIHR5cGUsIGFscGhhICkge1xuXHRcdFx0dHlwZSA9IHR5cGUgfHwgJ2hleCc7XG5cdFx0XHRhbHBoYSA9IHBhcnNlRmxvYXQoIGFscGhhIHx8IHRoaXMuX2FscGhhICk7XG5cdFx0XHRzd2l0Y2ggKCB0eXBlICkge1xuXHRcdFx0XHRjYXNlICdyZ2InOlxuXHRcdFx0XHRjYXNlICdyZ2JhJzpcblx0XHRcdFx0XHR2YXIgcmdiID0gdGhpcy50b1JnYigpO1xuXHRcdFx0XHRcdGlmICggYWxwaGEgPCAxICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIFwicmdiYSggXCIgKyByZ2IuciArIFwiLCBcIiArIHJnYi5nICsgXCIsIFwiICsgcmdiLmIgKyBcIiwgXCIgKyBhbHBoYSArIFwiIClcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gXCJyZ2IoIFwiICsgcmdiLnIgKyBcIiwgXCIgKyByZ2IuZyArIFwiLCBcIiArIHJnYi5iICsgXCIgKVwiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSAnaHNsJzpcblx0XHRcdFx0Y2FzZSAnaHNsYSc6XG5cdFx0XHRcdFx0dmFyIGhzbCA9IHRoaXMudG9Ic2woKTtcblx0XHRcdFx0XHRpZiAoIGFscGhhIDwgMSApIHtcblx0XHRcdFx0XHRcdHJldHVybiBcImhzbGEoIFwiICsgaHNsLmggKyBcIiwgXCIgKyBoc2wucyArIFwiJSwgXCIgKyBoc2wubCArIFwiJSwgXCIgKyBhbHBoYSArIFwiIClcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gXCJoc2woIFwiICsgaHNsLmggKyBcIiwgXCIgKyBoc2wucyArIFwiJSwgXCIgKyBoc2wubCArIFwiJSApXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHRvUmdiOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHI6IDI1NSAmICggdGhpcy5fY29sb3IgPj4gMTYgKSxcblx0XHRcdFx0ZzogMjU1ICYgKCB0aGlzLl9jb2xvciA+PiA4ICksXG5cdFx0XHRcdGI6IDI1NSAmICggdGhpcy5fY29sb3IgKVxuXHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0dG9Ic2w6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHJnYiA9IHRoaXMudG9SZ2IoKTtcblx0XHRcdHZhciByID0gcmdiLnIgLyAyNTUsIGcgPSByZ2IuZyAvIDI1NSwgYiA9IHJnYi5iIC8gMjU1O1xuXHRcdFx0dmFyIG1heCA9IE1hdGgubWF4KCByLCBnLCBiICksIG1pbiA9IE1hdGgubWluKCByLCBnLCBiICk7XG5cdFx0XHR2YXIgaCwgcywgbCA9ICggbWF4ICsgbWluICkgLyAyO1xuXG5cdFx0XHRpZiAoIG1heCA9PT0gbWluICkge1xuXHRcdFx0XHRoID0gcyA9IDA7IC8vIGFjaHJvbWF0aWNcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBkID0gbWF4IC0gbWluO1xuXHRcdFx0XHRzID0gbCA+IDAuNSA/IGQgLyAoIDIgLSBtYXggLSBtaW4gKSA6IGQgLyAoIG1heCArIG1pbiApO1xuXHRcdFx0XHRzd2l0Y2ggKCBtYXggKSB7XG5cdFx0XHRcdFx0Y2FzZSByOiBoID0gKCBnIC0gYiApIC8gZCArICggZyA8IGIgPyA2IDogMCApO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBnOiBoID0gKCBiIC0gciApIC8gZCArIDI7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIGI6IGggPSAoIHIgLSBnICkgLyBkICsgNDtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGggLz0gNjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gbWFpbnRhaW4gaHVlICYgc2F0IGlmIHdlJ3ZlIGJlZW4gbWFuaXB1bGF0aW5nIHRoaW5ncyBpbiB0aGUgSFNMIHNwYWNlLlxuXHRcdFx0aCA9IE1hdGgucm91bmQoIGggKiAzNjAgKTtcblx0XHRcdGlmICggaCA9PT0gMCAmJiB0aGlzLl9oc2wuaCAhPT0gaCApIHtcblx0XHRcdFx0aCA9IHRoaXMuX2hzbC5oO1xuXHRcdFx0fVxuXHRcdFx0cyA9IE1hdGgucm91bmQoIHMgKiAxMDAgKTtcblx0XHRcdGlmICggcyA9PT0gMCAmJiB0aGlzLl9oc2wucyApIHtcblx0XHRcdFx0cyA9IHRoaXMuX2hzbC5zO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRoOiBoLFxuXHRcdFx0XHRzOiBzLFxuXHRcdFx0XHRsOiBNYXRoLnJvdW5kKCBsICogMTAwIClcblx0XHRcdH07XG5cblx0XHR9LFxuXG5cdFx0dG9Ic3Y6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHJnYiA9IHRoaXMudG9SZ2IoKTtcblx0XHRcdHZhciByID0gcmdiLnIgLyAyNTUsIGcgPSByZ2IuZyAvIDI1NSwgYiA9IHJnYi5iIC8gMjU1O1xuXHRcdFx0dmFyIG1heCA9IE1hdGgubWF4KCByLCBnLCBiICksIG1pbiA9IE1hdGgubWluKCByLCBnLCBiICk7XG5cdFx0XHR2YXIgaCwgcywgdiA9IG1heDtcblx0XHRcdHZhciBkID0gbWF4IC0gbWluO1xuXHRcdFx0cyA9IG1heCA9PT0gMCA/IDAgOiBkIC8gbWF4O1xuXG5cdFx0XHRpZiAoIG1heCA9PT0gbWluICkge1xuXHRcdFx0XHRoID0gcyA9IDA7IC8vIGFjaHJvbWF0aWNcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHN3aXRjaCggbWF4ICl7XG5cdFx0XHRcdFx0Y2FzZSByOlxuXHRcdFx0XHRcdFx0aCA9ICggZyAtIGIgKSAvIGQgKyAoIGcgPCBiID8gNiA6IDAgKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgZzpcblx0XHRcdFx0XHRcdGggPSAoIGIgLSByICkgLyBkICsgMjtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgYjpcblx0XHRcdFx0XHRcdGggPSAoIHIgLSBnICkgLyBkICsgNDtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGggLz0gNjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gbWFpbnRhaW4gaHVlICYgc2F0IGlmIHdlJ3ZlIGJlZW4gbWFuaXB1bGF0aW5nIHRoaW5ncyBpbiB0aGUgSFNWIHNwYWNlLlxuXHRcdFx0aCA9IE1hdGgucm91bmQoIGggKiAzNjAgKTtcblx0XHRcdGlmICggaCA9PT0gMCAmJiB0aGlzLl9oc3YuaCAhPT0gaCApIHtcblx0XHRcdFx0aCA9IHRoaXMuX2hzdi5oO1xuXHRcdFx0fVxuXHRcdFx0cyA9IE1hdGgucm91bmQoIHMgKiAxMDAgKTtcblx0XHRcdGlmICggcyA9PT0gMCAmJiB0aGlzLl9oc3YucyApIHtcblx0XHRcdFx0cyA9IHRoaXMuX2hzdi5zO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRoOiBoLFxuXHRcdFx0XHRzOiBzLFxuXHRcdFx0XHR2OiBNYXRoLnJvdW5kKCB2ICogMTAwIClcblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHRvSW50OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLl9jb2xvcjtcblx0XHR9LFxuXG5cdFx0dG9JRU9jdG9IZXg6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gQUFSUkJCR0dcblx0XHRcdHZhciBoZXggPSB0aGlzLnRvU3RyaW5nKCk7XG5cdFx0XHR2YXIgQUEgPSBwYXJzZUludCggMjU1ICogdGhpcy5fYWxwaGEsIDEwICkudG9TdHJpbmcoMTYpO1xuXHRcdFx0aWYgKCBBQS5sZW5ndGggPT09IDEgKSB7XG5cdFx0XHRcdEFBID0gJzAnICsgQUE7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gJyMnICsgQUEgKyBoZXgucmVwbGFjZSgvXiMvLCAnJyApO1xuXHRcdH0sXG5cblx0XHR0b0x1bWlub3NpdHk6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHJnYiA9IHRoaXMudG9SZ2IoKTtcblx0XHRcdHJldHVybiAwLjIxMjYgKiBNYXRoLnBvdyggcmdiLnIgLyAyNTUsIDIuMiApICsgMC43MTUyICogTWF0aC5wb3coIHJnYi5nIC8gMjU1LCAyLjIgKSArIDAuMDcyMiAqIE1hdGgucG93KCByZ2IuYiAvIDI1NSwgMi4yKTtcblx0XHR9LFxuXG5cdFx0Z2V0RGlzdGFuY2VMdW1pbm9zaXR5RnJvbTogZnVuY3Rpb24oIGNvbG9yICkge1xuXHRcdFx0aWYgKCAhICggY29sb3IgaW5zdGFuY2VvZiBDb2xvciApICkge1xuXHRcdFx0XHR0aHJvdyAnZ2V0RGlzdGFuY2VMdW1pbm9zaXR5RnJvbSByZXF1aXJlcyBhIENvbG9yIG9iamVjdCc7XG5cdFx0XHR9XG5cdFx0XHR2YXIgbHVtMSA9IHRoaXMudG9MdW1pbm9zaXR5KCk7XG5cdFx0XHR2YXIgbHVtMiA9IGNvbG9yLnRvTHVtaW5vc2l0eSgpO1xuXHRcdFx0aWYgKCBsdW0xID4gbHVtMiApIHtcblx0XHRcdFx0cmV0dXJuICggbHVtMSArIDAuMDUgKSAvICggbHVtMiArIDAuMDUgKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gKCBsdW0yICsgMC4wNSApIC8gKCBsdW0xICsgMC4wNSApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRnZXRNYXhDb250cmFzdENvbG9yOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBsdW0gPSB0aGlzLnRvTHVtaW5vc2l0eSgpO1xuXHRcdFx0dmFyIGhleCA9ICggbHVtID49IDAuNSApID8gJzAwMDAwMCcgOiAnZmZmZmZmJztcblx0XHRcdHJldHVybiBuZXcgQ29sb3IoIGhleCApO1xuXHRcdH0sXG5cblx0XHRnZXRSZWFkYWJsZUNvbnRyYXN0aW5nQ29sb3I6IGZ1bmN0aW9uKCBiZ0NvbG9yLCBtaW5Db250cmFzdCApIHtcblx0XHRcdGlmICggISAoIGJnQ29sb3IgaW5zdGFuY2VvZiBDb2xvciApICkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH1cblxuXHRcdFx0Ly8geW91IHNob3VsZG4ndCB1c2UgbGVzcyB0aGFuIDUsIGJ1dCB5b3UgbWlnaHQgd2FudCB0by5cblx0XHRcdHZhciB0YXJnZXRDb250cmFzdCA9ICggbWluQ29udHJhc3QgPT09IHVuZGVmICkgPyA1IDogbWluQ29udHJhc3Q7XG5cdFx0XHQvLyB3b3JraW5nIHRoaW5nc1xuXHRcdFx0dmFyIGNvbnRyYXN0ID0gYmdDb2xvci5nZXREaXN0YW5jZUx1bWlub3NpdHlGcm9tKCB0aGlzICk7XG5cdFx0XHR2YXIgbWF4Q29udHJhc3RDb2xvciA9IGJnQ29sb3IuZ2V0TWF4Q29udHJhc3RDb2xvcigpO1xuXHRcdFx0dmFyIG1heENvbnRyYXN0ID0gbWF4Q29udHJhc3RDb2xvci5nZXREaXN0YW5jZUx1bWlub3NpdHlGcm9tKCBiZ0NvbG9yICk7XG5cblx0XHRcdC8vIGlmIGN1cnJlbnQgbWF4IGNvbnRyYXN0IGlzIGxlc3MgdGhhbiB0aGUgdGFyZ2V0IGNvbnRyYXN0LCB3ZSBoYWQgd2lzaGZ1bCB0aGlua2luZy5cblx0XHRcdC8vIHN0aWxsLCBnbyBtYXhcblx0XHRcdGlmICggbWF4Q29udHJhc3QgPD0gdGFyZ2V0Q29udHJhc3QgKSB7XG5cdFx0XHRcdHJldHVybiBtYXhDb250cmFzdENvbG9yO1xuXHRcdFx0fVxuXHRcdFx0Ly8gb3IsIHdlIG1pZ2h0IGFscmVhZHkgaGF2ZSBzdWZmaWNpZW50IGNvbnRyYXN0XG5cdFx0XHRlbHNlIGlmICggY29udHJhc3QgPj0gdGFyZ2V0Q29udHJhc3QgKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgaW5jciA9ICggMCA9PT0gbWF4Q29udHJhc3RDb2xvci50b0ludCgpICkgPyAtMSA6IDE7XG5cdFx0XHR3aGlsZSAoIGNvbnRyYXN0IDwgdGFyZ2V0Q29udHJhc3QgKSB7XG5cdFx0XHRcdHRoaXMubCggaW5jciwgdHJ1ZSApOyAvLyAybmQgYXJnIHR1cm5zIHRoaXMgaW50byBhbiBpbmNyZW1lbnRlclxuXHRcdFx0XHRjb250cmFzdCA9IHRoaXMuZ2V0RGlzdGFuY2VMdW1pbm9zaXR5RnJvbSggYmdDb2xvciApO1xuXHRcdFx0XHQvLyBpbmZpbmluaXRlIGxvb3AgcHJldmVudGlvbjogeW91IG5ldmVyIGtub3cuXG5cdFx0XHRcdGlmICggdGhpcy5fY29sb3IgPT09IDAgfHwgdGhpcy5fY29sb3IgPT09IDE2Nzc3MjE1ICkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXG5cdFx0fSxcblxuXHRcdGE6IGZ1bmN0aW9uKCB2YWwgKSB7XG5cdFx0XHRpZiAoIHZhbCA9PT0gdW5kZWYgKVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5fYWxwaGE7XG5cblx0XHRcdHZhciBhID0gcGFyc2VGbG9hdCggdmFsICk7XG5cblx0XHRcdGlmICggaXNOYU4oIGEgKSApXG5cdFx0XHRcdHJldHVybiB0aGlzLl9lcnJvcigpO1xuXG5cdFx0XHR0aGlzLl9hbHBoYSA9IGE7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXG5cdFx0Ly8gVFJBTlNGT1JNU1xuXG5cdFx0ZGFya2VuOiBmdW5jdGlvbiggYW1vdW50ICkge1xuXHRcdFx0YW1vdW50ID0gYW1vdW50IHx8IDU7XG5cdFx0XHRyZXR1cm4gdGhpcy5sKCAtIGFtb3VudCwgdHJ1ZSApO1xuXHRcdH0sXG5cblx0XHRsaWdodGVuOiBmdW5jdGlvbiggYW1vdW50ICkge1xuXHRcdFx0YW1vdW50ID0gYW1vdW50IHx8IDU7XG5cdFx0XHRyZXR1cm4gdGhpcy5sKCBhbW91bnQsIHRydWUgKTtcblx0XHR9LFxuXG5cdFx0c2F0dXJhdGU6IGZ1bmN0aW9uKCBhbW91bnQgKSB7XG5cdFx0XHRhbW91bnQgPSBhbW91bnQgfHwgMTU7XG5cdFx0XHRyZXR1cm4gdGhpcy5zKCBhbW91bnQsIHRydWUgKTtcblx0XHR9LFxuXG5cdFx0ZGVzYXR1cmF0ZTogZnVuY3Rpb24oIGFtb3VudCApIHtcblx0XHRcdGFtb3VudCA9IGFtb3VudCB8fCAxNTtcblx0XHRcdHJldHVybiB0aGlzLnMoIC0gYW1vdW50LCB0cnVlICk7XG5cdFx0fSxcblxuXHRcdHRvR3JheXNjYWxlOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLnNldEhTcGFjZSgnaHNsJykucyggMCApO1xuXHRcdH0sXG5cblx0XHRnZXRDb21wbGVtZW50OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmgoIDE4MCwgdHJ1ZSApO1xuXHRcdH0sXG5cblx0XHRnZXRTcGxpdENvbXBsZW1lbnQ6IGZ1bmN0aW9uKCBzdGVwICkge1xuXHRcdFx0c3RlcCA9IHN0ZXAgfHwgMTtcblx0XHRcdHZhciBpbmNyID0gMTgwICsgKCBzdGVwICogMzAgKTtcblx0XHRcdHJldHVybiB0aGlzLmgoIGluY3IsIHRydWUgKTtcblx0XHR9LFxuXG5cdFx0Z2V0QW5hbG9nOiBmdW5jdGlvbiggc3RlcCApIHtcblx0XHRcdHN0ZXAgPSBzdGVwIHx8IDE7XG5cdFx0XHR2YXIgaW5jciA9IHN0ZXAgKiAzMDtcblx0XHRcdHJldHVybiB0aGlzLmgoIGluY3IsIHRydWUgKTtcblx0XHR9LFxuXG5cdFx0Z2V0VGV0cmFkOiBmdW5jdGlvbiggc3RlcCApIHtcblx0XHRcdHN0ZXAgPSBzdGVwIHx8IDE7XG5cdFx0XHR2YXIgaW5jciA9IHN0ZXAgKiA2MDtcblx0XHRcdHJldHVybiB0aGlzLmgoIGluY3IsIHRydWUgKTtcblx0XHR9LFxuXG5cdFx0Z2V0VHJpYWQ6IGZ1bmN0aW9uKCBzdGVwICkge1xuXHRcdFx0c3RlcCA9IHN0ZXAgfHwgMTtcblx0XHRcdHZhciBpbmNyID0gc3RlcCAqIDEyMDtcblx0XHRcdHJldHVybiB0aGlzLmgoIGluY3IsIHRydWUgKTtcblx0XHR9LFxuXG5cdFx0X3BhcnRpYWw6IGZ1bmN0aW9uKCBrZXkgKSB7XG5cdFx0XHR2YXIgcHJvcCA9IHNob3J0UHJvcHNba2V5XTtcblx0XHRcdHJldHVybiBmdW5jdGlvbiggdmFsLCBpbmNyICkge1xuXHRcdFx0XHR2YXIgY29sb3IgPSB0aGlzLl9zcGFjZUZ1bmMoJ3RvJywgcHJvcC5zcGFjZSk7XG5cblx0XHRcdFx0Ly8gR0VUVEVSXG5cdFx0XHRcdGlmICggdmFsID09PSB1bmRlZiApXG5cdFx0XHRcdFx0cmV0dXJuIGNvbG9yW2tleV07XG5cblx0XHRcdFx0Ly8gSU5DUkVNRU5UXG5cdFx0XHRcdGlmICggaW5jciA9PT0gdHJ1ZSApXG5cdFx0XHRcdFx0dmFsID0gY29sb3Jba2V5XSArIHZhbDtcblxuXHRcdFx0XHQvLyBNT0QgJiBSQU5HRVxuXHRcdFx0XHRpZiAoIHByb3AubW9kIClcblx0XHRcdFx0XHR2YWwgPSB2YWwgJSBwcm9wLm1vZDtcblx0XHRcdFx0aWYgKCBwcm9wLnJhbmdlIClcblx0XHRcdFx0XHR2YWwgPSAoIHZhbCA8IHByb3AucmFuZ2VbMF0gKSA/IHByb3AucmFuZ2VbMF0gOiAoIHZhbCA+IHByb3AucmFuZ2VbMV0gKSA/IHByb3AucmFuZ2VbMV0gOiB2YWw7XG5cblx0XHRcdFx0Ly8gTkVXIFZBTFVFXG5cdFx0XHRcdGNvbG9yW2tleV0gPSB2YWw7XG5cblx0XHRcdFx0cmV0dXJuIHRoaXMuX3NwYWNlRnVuYygnZnJvbScsIHByb3Auc3BhY2UsIGNvbG9yKTtcblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdF9zcGFjZUZ1bmM6IGZ1bmN0aW9uKCBkaXIsIHMsIHZhbCApIHtcblx0XHRcdHZhciBzcGFjZSA9IHMgfHwgdGhpcy5faFNwYWNlLFxuXHRcdFx0XHRmdW5jTmFtZSA9IGRpciArIHNwYWNlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3BhY2Uuc3Vic3RyKDEpO1xuXHRcdFx0cmV0dXJuIHRoaXNbZnVuY05hbWVdKHZhbCk7XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBzaG9ydFByb3BzID0ge1xuXHRcdGg6IHtcblx0XHRcdG1vZDogMzYwXG5cdFx0fSxcblx0XHRzOiB7XG5cdFx0XHRyYW5nZTogWzAsMTAwXVxuXHRcdH0sXG5cdFx0bDoge1xuXHRcdFx0c3BhY2U6ICdoc2wnLFxuXHRcdFx0cmFuZ2U6IFswLDEwMF1cblx0XHR9LFxuXHRcdHY6IHtcblx0XHRcdHNwYWNlOiAnaHN2Jyxcblx0XHRcdHJhbmdlOiBbMCwxMDBdXG5cdFx0fSxcblx0XHRyOiB7XG5cdFx0XHRzcGFjZTogJ3JnYicsXG5cdFx0XHRyYW5nZTogWzAsMjU1XVxuXHRcdH0sXG5cdFx0Zzoge1xuXHRcdFx0c3BhY2U6ICdyZ2InLFxuXHRcdFx0cmFuZ2U6IFswLDI1NV1cblx0XHR9LFxuXHRcdGI6IHtcblx0XHRcdHNwYWNlOiAncmdiJyxcblx0XHRcdHJhbmdlOiBbMCwyNTVdXG5cdFx0fVxuXHR9O1xuXG5cdGZvciAoIHZhciBrZXkgaW4gc2hvcnRQcm9wcyApIHtcblx0XHRpZiAoIHNob3J0UHJvcHMuaGFzT3duUHJvcGVydHkoIGtleSApIClcblx0XHRcdENvbG9yLmZuW2tleV0gPSBDb2xvci5mbi5fcGFydGlhbChrZXkpO1xuXHR9XG5cblx0Ly8gcGxheSBuaWNlbHkgd2l0aCBOb2RlICsgYnJvd3NlclxuXHRpZiAoIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyApXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBDb2xvcjtcblx0ZWxzZVxuXHRcdGdsb2JhbC5Db2xvciA9IENvbG9yO1xuXG59KHRoaXMpKTtcbiIsIi8qIVxuICogalF1ZXJ5IFZhbGlkYXRpb24gUGx1Z2luIHYxLjE5LjFcbiAqXG4gKiBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL1xuICpcbiAqIENvcHlyaWdodCAoYykgMjAxOSBKw7ZybiBaYWVmZmVyZXJcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG4oZnVuY3Rpb24oIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cdFx0ZGVmaW5lKCBbXCJqcXVlcnlcIl0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCByZXF1aXJlKCBcImpxdWVyeVwiICkgKTtcblx0fSBlbHNlIHtcblx0XHRmYWN0b3J5KCBqUXVlcnkgKTtcblx0fVxufShmdW5jdGlvbiggJCApIHtcblxuJC5leHRlbmQoICQuZm4sIHtcblxuXHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL3ZhbGlkYXRlL1xuXHR2YWxpZGF0ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cblx0XHQvLyBJZiBub3RoaW5nIGlzIHNlbGVjdGVkLCByZXR1cm4gbm90aGluZzsgY2FuJ3QgY2hhaW4gYW55d2F5XG5cdFx0aWYgKCAhdGhpcy5sZW5ndGggKSB7XG5cdFx0XHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5kZWJ1ZyAmJiB3aW5kb3cuY29uc29sZSApIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKCBcIk5vdGhpbmcgc2VsZWN0ZWQsIGNhbid0IHZhbGlkYXRlLCByZXR1cm5pbmcgbm90aGluZy5cIiApO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIENoZWNrIGlmIGEgdmFsaWRhdG9yIGZvciB0aGlzIGZvcm0gd2FzIGFscmVhZHkgY3JlYXRlZFxuXHRcdHZhciB2YWxpZGF0b3IgPSAkLmRhdGEoIHRoaXNbIDAgXSwgXCJ2YWxpZGF0b3JcIiApO1xuXHRcdGlmICggdmFsaWRhdG9yICkge1xuXHRcdFx0cmV0dXJuIHZhbGlkYXRvcjtcblx0XHR9XG5cblx0XHQvLyBBZGQgbm92YWxpZGF0ZSB0YWcgaWYgSFRNTDUuXG5cdFx0dGhpcy5hdHRyKCBcIm5vdmFsaWRhdGVcIiwgXCJub3ZhbGlkYXRlXCIgKTtcblxuXHRcdHZhbGlkYXRvciA9IG5ldyAkLnZhbGlkYXRvciggb3B0aW9ucywgdGhpc1sgMCBdICk7XG5cdFx0JC5kYXRhKCB0aGlzWyAwIF0sIFwidmFsaWRhdG9yXCIsIHZhbGlkYXRvciApO1xuXG5cdFx0aWYgKCB2YWxpZGF0b3Iuc2V0dGluZ3Mub25zdWJtaXQgKSB7XG5cblx0XHRcdHRoaXMub24oIFwiY2xpY2sudmFsaWRhdGVcIiwgXCI6c3VibWl0XCIsIGZ1bmN0aW9uKCBldmVudCApIHtcblxuXHRcdFx0XHQvLyBUcmFjayB0aGUgdXNlZCBzdWJtaXQgYnV0dG9uIHRvIHByb3Blcmx5IGhhbmRsZSBzY3JpcHRlZFxuXHRcdFx0XHQvLyBzdWJtaXRzIGxhdGVyLlxuXHRcdFx0XHR2YWxpZGF0b3Iuc3VibWl0QnV0dG9uID0gZXZlbnQuY3VycmVudFRhcmdldDtcblxuXHRcdFx0XHQvLyBBbGxvdyBzdXBwcmVzc2luZyB2YWxpZGF0aW9uIGJ5IGFkZGluZyBhIGNhbmNlbCBjbGFzcyB0byB0aGUgc3VibWl0IGJ1dHRvblxuXHRcdFx0XHRpZiAoICQoIHRoaXMgKS5oYXNDbGFzcyggXCJjYW5jZWxcIiApICkge1xuXHRcdFx0XHRcdHZhbGlkYXRvci5jYW5jZWxTdWJtaXQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQWxsb3cgc3VwcHJlc3NpbmcgdmFsaWRhdGlvbiBieSBhZGRpbmcgdGhlIGh0bWw1IGZvcm1ub3ZhbGlkYXRlIGF0dHJpYnV0ZSB0byB0aGUgc3VibWl0IGJ1dHRvblxuXHRcdFx0XHRpZiAoICQoIHRoaXMgKS5hdHRyKCBcImZvcm1ub3ZhbGlkYXRlXCIgKSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdHZhbGlkYXRvci5jYW5jZWxTdWJtaXQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cblx0XHRcdC8vIFZhbGlkYXRlIHRoZSBmb3JtIG9uIHN1Ym1pdFxuXHRcdFx0dGhpcy5vbiggXCJzdWJtaXQudmFsaWRhdGVcIiwgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRpZiAoIHZhbGlkYXRvci5zZXR0aW5ncy5kZWJ1ZyApIHtcblxuXHRcdFx0XHRcdC8vIFByZXZlbnQgZm9ybSBzdWJtaXQgdG8gYmUgYWJsZSB0byBzZWUgY29uc29sZSBvdXRwdXRcblx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZnVuY3Rpb24gaGFuZGxlKCkge1xuXHRcdFx0XHRcdHZhciBoaWRkZW4sIHJlc3VsdDtcblxuXHRcdFx0XHRcdC8vIEluc2VydCBhIGhpZGRlbiBpbnB1dCBhcyBhIHJlcGxhY2VtZW50IGZvciB0aGUgbWlzc2luZyBzdWJtaXQgYnV0dG9uXG5cdFx0XHRcdFx0Ly8gVGhlIGhpZGRlbiBpbnB1dCBpcyBpbnNlcnRlZCBpbiB0d28gY2FzZXM6XG5cdFx0XHRcdFx0Ly8gICAtIEEgdXNlciBkZWZpbmVkIGEgYHN1Ym1pdEhhbmRsZXJgXG5cdFx0XHRcdFx0Ly8gICAtIFRoZXJlIHdhcyBhIHBlbmRpbmcgcmVxdWVzdCBkdWUgdG8gYHJlbW90ZWAgbWV0aG9kIGFuZCBgc3RvcFJlcXVlc3QoKWBcblx0XHRcdFx0XHQvLyAgICAgd2FzIGNhbGxlZCB0byBzdWJtaXQgdGhlIGZvcm0gaW4gY2FzZSBpdCdzIHZhbGlkXG5cdFx0XHRcdFx0aWYgKCB2YWxpZGF0b3Iuc3VibWl0QnV0dG9uICYmICggdmFsaWRhdG9yLnNldHRpbmdzLnN1Ym1pdEhhbmRsZXIgfHwgdmFsaWRhdG9yLmZvcm1TdWJtaXR0ZWQgKSApIHtcblx0XHRcdFx0XHRcdGhpZGRlbiA9ICQoIFwiPGlucHV0IHR5cGU9J2hpZGRlbicvPlwiIClcblx0XHRcdFx0XHRcdFx0LmF0dHIoIFwibmFtZVwiLCB2YWxpZGF0b3Iuc3VibWl0QnV0dG9uLm5hbWUgKVxuXHRcdFx0XHRcdFx0XHQudmFsKCAkKCB2YWxpZGF0b3Iuc3VibWl0QnV0dG9uICkudmFsKCkgKVxuXHRcdFx0XHRcdFx0XHQuYXBwZW5kVG8oIHZhbGlkYXRvci5jdXJyZW50Rm9ybSApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICggdmFsaWRhdG9yLnNldHRpbmdzLnN1Ym1pdEhhbmRsZXIgJiYgIXZhbGlkYXRvci5zZXR0aW5ncy5kZWJ1ZyApIHtcblx0XHRcdFx0XHRcdHJlc3VsdCA9IHZhbGlkYXRvci5zZXR0aW5ncy5zdWJtaXRIYW5kbGVyLmNhbGwoIHZhbGlkYXRvciwgdmFsaWRhdG9yLmN1cnJlbnRGb3JtLCBldmVudCApO1xuXHRcdFx0XHRcdFx0aWYgKCBoaWRkZW4gKSB7XG5cblx0XHRcdFx0XHRcdFx0Ly8gQW5kIGNsZWFuIHVwIGFmdGVyd2FyZHM7IHRoYW5rcyB0byBuby1ibG9jay1zY29wZSwgaGlkZGVuIGNhbiBiZSByZWZlcmVuY2VkXG5cdFx0XHRcdFx0XHRcdGhpZGRlbi5yZW1vdmUoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmICggcmVzdWx0ICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gUHJldmVudCBzdWJtaXQgZm9yIGludmFsaWQgZm9ybXMgb3IgY3VzdG9tIHN1Ym1pdCBoYW5kbGVyc1xuXHRcdFx0XHRpZiAoIHZhbGlkYXRvci5jYW5jZWxTdWJtaXQgKSB7XG5cdFx0XHRcdFx0dmFsaWRhdG9yLmNhbmNlbFN1Ym1pdCA9IGZhbHNlO1xuXHRcdFx0XHRcdHJldHVybiBoYW5kbGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIHZhbGlkYXRvci5mb3JtKCkgKSB7XG5cdFx0XHRcdFx0aWYgKCB2YWxpZGF0b3IucGVuZGluZ1JlcXVlc3QgKSB7XG5cdFx0XHRcdFx0XHR2YWxpZGF0b3IuZm9ybVN1Ym1pdHRlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBoYW5kbGUoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YWxpZGF0b3IuZm9jdXNJbnZhbGlkKCk7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHZhbGlkYXRvcjtcblx0fSxcblxuXHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL3ZhbGlkL1xuXHR2YWxpZDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHZhbGlkLCB2YWxpZGF0b3IsIGVycm9yTGlzdDtcblxuXHRcdGlmICggJCggdGhpc1sgMCBdICkuaXMoIFwiZm9ybVwiICkgKSB7XG5cdFx0XHR2YWxpZCA9IHRoaXMudmFsaWRhdGUoKS5mb3JtKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGVycm9yTGlzdCA9IFtdO1xuXHRcdFx0dmFsaWQgPSB0cnVlO1xuXHRcdFx0dmFsaWRhdG9yID0gJCggdGhpc1sgMCBdLmZvcm0gKS52YWxpZGF0ZSgpO1xuXHRcdFx0dGhpcy5lYWNoKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFsaWQgPSB2YWxpZGF0b3IuZWxlbWVudCggdGhpcyApICYmIHZhbGlkO1xuXHRcdFx0XHRpZiAoICF2YWxpZCApIHtcblx0XHRcdFx0XHRlcnJvckxpc3QgPSBlcnJvckxpc3QuY29uY2F0KCB2YWxpZGF0b3IuZXJyb3JMaXN0ICk7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblx0XHRcdHZhbGlkYXRvci5lcnJvckxpc3QgPSBlcnJvckxpc3Q7XG5cdFx0fVxuXHRcdHJldHVybiB2YWxpZDtcblx0fSxcblxuXHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL3J1bGVzL1xuXHRydWxlczogZnVuY3Rpb24oIGNvbW1hbmQsIGFyZ3VtZW50ICkge1xuXHRcdHZhciBlbGVtZW50ID0gdGhpc1sgMCBdLFxuXHRcdFx0aXNDb250ZW50RWRpdGFibGUgPSB0eXBlb2YgdGhpcy5hdHRyKCBcImNvbnRlbnRlZGl0YWJsZVwiICkgIT09IFwidW5kZWZpbmVkXCIgJiYgdGhpcy5hdHRyKCBcImNvbnRlbnRlZGl0YWJsZVwiICkgIT09IFwiZmFsc2VcIixcblx0XHRcdHNldHRpbmdzLCBzdGF0aWNSdWxlcywgZXhpc3RpbmdSdWxlcywgZGF0YSwgcGFyYW0sIGZpbHRlcmVkO1xuXG5cdFx0Ly8gSWYgbm90aGluZyBpcyBzZWxlY3RlZCwgcmV0dXJuIGVtcHR5IG9iamVjdDsgY2FuJ3QgY2hhaW4gYW55d2F5XG5cdFx0aWYgKCBlbGVtZW50ID09IG51bGwgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCAhZWxlbWVudC5mb3JtICYmIGlzQ29udGVudEVkaXRhYmxlICkge1xuXHRcdFx0ZWxlbWVudC5mb3JtID0gdGhpcy5jbG9zZXN0KCBcImZvcm1cIiApWyAwIF07XG5cdFx0XHRlbGVtZW50Lm5hbWUgPSB0aGlzLmF0dHIoIFwibmFtZVwiICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBlbGVtZW50LmZvcm0gPT0gbnVsbCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIGNvbW1hbmQgKSB7XG5cdFx0XHRzZXR0aW5ncyA9ICQuZGF0YSggZWxlbWVudC5mb3JtLCBcInZhbGlkYXRvclwiICkuc2V0dGluZ3M7XG5cdFx0XHRzdGF0aWNSdWxlcyA9IHNldHRpbmdzLnJ1bGVzO1xuXHRcdFx0ZXhpc3RpbmdSdWxlcyA9ICQudmFsaWRhdG9yLnN0YXRpY1J1bGVzKCBlbGVtZW50ICk7XG5cdFx0XHRzd2l0Y2ggKCBjb21tYW5kICkge1xuXHRcdFx0Y2FzZSBcImFkZFwiOlxuXHRcdFx0XHQkLmV4dGVuZCggZXhpc3RpbmdSdWxlcywgJC52YWxpZGF0b3Iubm9ybWFsaXplUnVsZSggYXJndW1lbnQgKSApO1xuXG5cdFx0XHRcdC8vIFJlbW92ZSBtZXNzYWdlcyBmcm9tIHJ1bGVzLCBidXQgYWxsb3cgdGhlbSB0byBiZSBzZXQgc2VwYXJhdGVseVxuXHRcdFx0XHRkZWxldGUgZXhpc3RpbmdSdWxlcy5tZXNzYWdlcztcblx0XHRcdFx0c3RhdGljUnVsZXNbIGVsZW1lbnQubmFtZSBdID0gZXhpc3RpbmdSdWxlcztcblx0XHRcdFx0aWYgKCBhcmd1bWVudC5tZXNzYWdlcyApIHtcblx0XHRcdFx0XHRzZXR0aW5ncy5tZXNzYWdlc1sgZWxlbWVudC5uYW1lIF0gPSAkLmV4dGVuZCggc2V0dGluZ3MubWVzc2FnZXNbIGVsZW1lbnQubmFtZSBdLCBhcmd1bWVudC5tZXNzYWdlcyApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcInJlbW92ZVwiOlxuXHRcdFx0XHRpZiAoICFhcmd1bWVudCApIHtcblx0XHRcdFx0XHRkZWxldGUgc3RhdGljUnVsZXNbIGVsZW1lbnQubmFtZSBdO1xuXHRcdFx0XHRcdHJldHVybiBleGlzdGluZ1J1bGVzO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZpbHRlcmVkID0ge307XG5cdFx0XHRcdCQuZWFjaCggYXJndW1lbnQuc3BsaXQoIC9cXHMvICksIGZ1bmN0aW9uKCBpbmRleCwgbWV0aG9kICkge1xuXHRcdFx0XHRcdGZpbHRlcmVkWyBtZXRob2QgXSA9IGV4aXN0aW5nUnVsZXNbIG1ldGhvZCBdO1xuXHRcdFx0XHRcdGRlbGV0ZSBleGlzdGluZ1J1bGVzWyBtZXRob2QgXTtcblx0XHRcdFx0fSApO1xuXHRcdFx0XHRyZXR1cm4gZmlsdGVyZWQ7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZGF0YSA9ICQudmFsaWRhdG9yLm5vcm1hbGl6ZVJ1bGVzKFxuXHRcdCQuZXh0ZW5kKFxuXHRcdFx0e30sXG5cdFx0XHQkLnZhbGlkYXRvci5jbGFzc1J1bGVzKCBlbGVtZW50ICksXG5cdFx0XHQkLnZhbGlkYXRvci5hdHRyaWJ1dGVSdWxlcyggZWxlbWVudCApLFxuXHRcdFx0JC52YWxpZGF0b3IuZGF0YVJ1bGVzKCBlbGVtZW50ICksXG5cdFx0XHQkLnZhbGlkYXRvci5zdGF0aWNSdWxlcyggZWxlbWVudCApXG5cdFx0KSwgZWxlbWVudCApO1xuXG5cdFx0Ly8gTWFrZSBzdXJlIHJlcXVpcmVkIGlzIGF0IGZyb250XG5cdFx0aWYgKCBkYXRhLnJlcXVpcmVkICkge1xuXHRcdFx0cGFyYW0gPSBkYXRhLnJlcXVpcmVkO1xuXHRcdFx0ZGVsZXRlIGRhdGEucmVxdWlyZWQ7XG5cdFx0XHRkYXRhID0gJC5leHRlbmQoIHsgcmVxdWlyZWQ6IHBhcmFtIH0sIGRhdGEgKTtcblx0XHR9XG5cblx0XHQvLyBNYWtlIHN1cmUgcmVtb3RlIGlzIGF0IGJhY2tcblx0XHRpZiAoIGRhdGEucmVtb3RlICkge1xuXHRcdFx0cGFyYW0gPSBkYXRhLnJlbW90ZTtcblx0XHRcdGRlbGV0ZSBkYXRhLnJlbW90ZTtcblx0XHRcdGRhdGEgPSAkLmV4dGVuZCggZGF0YSwgeyByZW1vdGU6IHBhcmFtIH0gKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZGF0YTtcblx0fVxufSApO1xuXG4vLyBDdXN0b20gc2VsZWN0b3JzXG4kLmV4dGVuZCggJC5leHByLnBzZXVkb3MgfHwgJC5leHByWyBcIjpcIiBdLCB7XHRcdC8vICd8fCAkLmV4cHJbIFwiOlwiIF0nIGhlcmUgZW5hYmxlcyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSB0byBqUXVlcnkgMS43LiBDYW4gYmUgcmVtb3ZlZCB3aGVuIGRyb3BwaW5nIGpRIDEuNy54IHN1cHBvcnRcblxuXHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL2JsYW5rLXNlbGVjdG9yL1xuXHRibGFuazogZnVuY3Rpb24oIGEgKSB7XG5cdFx0cmV0dXJuICEkLnRyaW0oIFwiXCIgKyAkKCBhICkudmFsKCkgKTtcblx0fSxcblxuXHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL2ZpbGxlZC1zZWxlY3Rvci9cblx0ZmlsbGVkOiBmdW5jdGlvbiggYSApIHtcblx0XHR2YXIgdmFsID0gJCggYSApLnZhbCgpO1xuXHRcdHJldHVybiB2YWwgIT09IG51bGwgJiYgISEkLnRyaW0oIFwiXCIgKyB2YWwgKTtcblx0fSxcblxuXHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL3VuY2hlY2tlZC1zZWxlY3Rvci9cblx0dW5jaGVja2VkOiBmdW5jdGlvbiggYSApIHtcblx0XHRyZXR1cm4gISQoIGEgKS5wcm9wKCBcImNoZWNrZWRcIiApO1xuXHR9XG59ICk7XG5cbi8vIENvbnN0cnVjdG9yIGZvciB2YWxpZGF0b3JcbiQudmFsaWRhdG9yID0gZnVuY3Rpb24oIG9wdGlvbnMsIGZvcm0gKSB7XG5cdHRoaXMuc2V0dGluZ3MgPSAkLmV4dGVuZCggdHJ1ZSwge30sICQudmFsaWRhdG9yLmRlZmF1bHRzLCBvcHRpb25zICk7XG5cdHRoaXMuY3VycmVudEZvcm0gPSBmb3JtO1xuXHR0aGlzLmluaXQoKTtcbn07XG5cbi8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvalF1ZXJ5LnZhbGlkYXRvci5mb3JtYXQvXG4kLnZhbGlkYXRvci5mb3JtYXQgPSBmdW5jdGlvbiggc291cmNlLCBwYXJhbXMgKSB7XG5cdGlmICggYXJndW1lbnRzLmxlbmd0aCA9PT0gMSApIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgYXJncyA9ICQubWFrZUFycmF5KCBhcmd1bWVudHMgKTtcblx0XHRcdGFyZ3MudW5zaGlmdCggc291cmNlICk7XG5cdFx0XHRyZXR1cm4gJC52YWxpZGF0b3IuZm9ybWF0LmFwcGx5KCB0aGlzLCBhcmdzICk7XG5cdFx0fTtcblx0fVxuXHRpZiAoIHBhcmFtcyA9PT0gdW5kZWZpbmVkICkge1xuXHRcdHJldHVybiBzb3VyY2U7XG5cdH1cblx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBwYXJhbXMuY29uc3RydWN0b3IgIT09IEFycmF5ICApIHtcblx0XHRwYXJhbXMgPSAkLm1ha2VBcnJheSggYXJndW1lbnRzICkuc2xpY2UoIDEgKTtcblx0fVxuXHRpZiAoIHBhcmFtcy5jb25zdHJ1Y3RvciAhPT0gQXJyYXkgKSB7XG5cdFx0cGFyYW1zID0gWyBwYXJhbXMgXTtcblx0fVxuXHQkLmVhY2goIHBhcmFtcywgZnVuY3Rpb24oIGksIG4gKSB7XG5cdFx0c291cmNlID0gc291cmNlLnJlcGxhY2UoIG5ldyBSZWdFeHAoIFwiXFxcXHtcIiArIGkgKyBcIlxcXFx9XCIsIFwiZ1wiICksIGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIG47XG5cdFx0fSApO1xuXHR9ICk7XG5cdHJldHVybiBzb3VyY2U7XG59O1xuXG4kLmV4dGVuZCggJC52YWxpZGF0b3IsIHtcblxuXHRkZWZhdWx0czoge1xuXHRcdG1lc3NhZ2VzOiB7fSxcblx0XHRncm91cHM6IHt9LFxuXHRcdHJ1bGVzOiB7fSxcblx0XHRlcnJvckNsYXNzOiBcImVycm9yXCIsXG5cdFx0cGVuZGluZ0NsYXNzOiBcInBlbmRpbmdcIixcblx0XHR2YWxpZENsYXNzOiBcInZhbGlkXCIsXG5cdFx0ZXJyb3JFbGVtZW50OiBcImxhYmVsXCIsXG5cdFx0Zm9jdXNDbGVhbnVwOiBmYWxzZSxcblx0XHRmb2N1c0ludmFsaWQ6IHRydWUsXG5cdFx0ZXJyb3JDb250YWluZXI6ICQoIFtdICksXG5cdFx0ZXJyb3JMYWJlbENvbnRhaW5lcjogJCggW10gKSxcblx0XHRvbnN1Ym1pdDogdHJ1ZSxcblx0XHRpZ25vcmU6IFwiOmhpZGRlblwiLFxuXHRcdGlnbm9yZVRpdGxlOiBmYWxzZSxcblx0XHRvbmZvY3VzaW46IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuXHRcdFx0dGhpcy5sYXN0QWN0aXZlID0gZWxlbWVudDtcblxuXHRcdFx0Ly8gSGlkZSBlcnJvciBsYWJlbCBhbmQgcmVtb3ZlIGVycm9yIGNsYXNzIG9uIGZvY3VzIGlmIGVuYWJsZWRcblx0XHRcdGlmICggdGhpcy5zZXR0aW5ncy5mb2N1c0NsZWFudXAgKSB7XG5cdFx0XHRcdGlmICggdGhpcy5zZXR0aW5ncy51bmhpZ2hsaWdodCApIHtcblx0XHRcdFx0XHR0aGlzLnNldHRpbmdzLnVuaGlnaGxpZ2h0LmNhbGwoIHRoaXMsIGVsZW1lbnQsIHRoaXMuc2V0dGluZ3MuZXJyb3JDbGFzcywgdGhpcy5zZXR0aW5ncy52YWxpZENsYXNzICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5oaWRlVGhlc2UoIHRoaXMuZXJyb3JzRm9yKCBlbGVtZW50ICkgKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdG9uZm9jdXNvdXQ6IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuXHRcdFx0aWYgKCAhdGhpcy5jaGVja2FibGUoIGVsZW1lbnQgKSAmJiAoIGVsZW1lbnQubmFtZSBpbiB0aGlzLnN1Ym1pdHRlZCB8fCAhdGhpcy5vcHRpb25hbCggZWxlbWVudCApICkgKSB7XG5cdFx0XHRcdHRoaXMuZWxlbWVudCggZWxlbWVudCApO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0b25rZXl1cDogZnVuY3Rpb24oIGVsZW1lbnQsIGV2ZW50ICkge1xuXG5cdFx0XHQvLyBBdm9pZCByZXZhbGlkYXRlIHRoZSBmaWVsZCB3aGVuIHByZXNzaW5nIG9uZSBvZiB0aGUgZm9sbG93aW5nIGtleXNcblx0XHRcdC8vIFNoaWZ0ICAgICAgID0+IDE2XG5cdFx0XHQvLyBDdHJsICAgICAgICA9PiAxN1xuXHRcdFx0Ly8gQWx0ICAgICAgICAgPT4gMThcblx0XHRcdC8vIENhcHMgbG9jayAgID0+IDIwXG5cdFx0XHQvLyBFbmQgICAgICAgICA9PiAzNVxuXHRcdFx0Ly8gSG9tZSAgICAgICAgPT4gMzZcblx0XHRcdC8vIExlZnQgYXJyb3cgID0+IDM3XG5cdFx0XHQvLyBVcCBhcnJvdyAgICA9PiAzOFxuXHRcdFx0Ly8gUmlnaHQgYXJyb3cgPT4gMzlcblx0XHRcdC8vIERvd24gYXJyb3cgID0+IDQwXG5cdFx0XHQvLyBJbnNlcnQgICAgICA9PiA0NVxuXHRcdFx0Ly8gTnVtIGxvY2sgICAgPT4gMTQ0XG5cdFx0XHQvLyBBbHRHciBrZXkgICA9PiAyMjVcblx0XHRcdHZhciBleGNsdWRlZEtleXMgPSBbXG5cdFx0XHRcdDE2LCAxNywgMTgsIDIwLCAzNSwgMzYsIDM3LFxuXHRcdFx0XHQzOCwgMzksIDQwLCA0NSwgMTQ0LCAyMjVcblx0XHRcdF07XG5cblx0XHRcdGlmICggZXZlbnQud2hpY2ggPT09IDkgJiYgdGhpcy5lbGVtZW50VmFsdWUoIGVsZW1lbnQgKSA9PT0gXCJcIiB8fCAkLmluQXJyYXkoIGV2ZW50LmtleUNvZGUsIGV4Y2x1ZGVkS2V5cyApICE9PSAtMSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fSBlbHNlIGlmICggZWxlbWVudC5uYW1lIGluIHRoaXMuc3VibWl0dGVkIHx8IGVsZW1lbnQubmFtZSBpbiB0aGlzLmludmFsaWQgKSB7XG5cdFx0XHRcdHRoaXMuZWxlbWVudCggZWxlbWVudCApO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0b25jbGljazogZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG5cblx0XHRcdC8vIENsaWNrIG9uIHNlbGVjdHMsIHJhZGlvYnV0dG9ucyBhbmQgY2hlY2tib3hlc1xuXHRcdFx0aWYgKCBlbGVtZW50Lm5hbWUgaW4gdGhpcy5zdWJtaXR0ZWQgKSB7XG5cdFx0XHRcdHRoaXMuZWxlbWVudCggZWxlbWVudCApO1xuXG5cdFx0XHQvLyBPciBvcHRpb24gZWxlbWVudHMsIGNoZWNrIHBhcmVudCBzZWxlY3QgaW4gdGhhdCBjYXNlXG5cdFx0XHR9IGVsc2UgaWYgKCBlbGVtZW50LnBhcmVudE5vZGUubmFtZSBpbiB0aGlzLnN1Ym1pdHRlZCApIHtcblx0XHRcdFx0dGhpcy5lbGVtZW50KCBlbGVtZW50LnBhcmVudE5vZGUgKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGhpZ2hsaWdodDogZnVuY3Rpb24oIGVsZW1lbnQsIGVycm9yQ2xhc3MsIHZhbGlkQ2xhc3MgKSB7XG5cdFx0XHRpZiAoIGVsZW1lbnQudHlwZSA9PT0gXCJyYWRpb1wiICkge1xuXHRcdFx0XHR0aGlzLmZpbmRCeU5hbWUoIGVsZW1lbnQubmFtZSApLmFkZENsYXNzKCBlcnJvckNsYXNzICkucmVtb3ZlQ2xhc3MoIHZhbGlkQ2xhc3MgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoIGVsZW1lbnQgKS5hZGRDbGFzcyggZXJyb3JDbGFzcyApLnJlbW92ZUNsYXNzKCB2YWxpZENsYXNzICk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR1bmhpZ2hsaWdodDogZnVuY3Rpb24oIGVsZW1lbnQsIGVycm9yQ2xhc3MsIHZhbGlkQ2xhc3MgKSB7XG5cdFx0XHRpZiAoIGVsZW1lbnQudHlwZSA9PT0gXCJyYWRpb1wiICkge1xuXHRcdFx0XHR0aGlzLmZpbmRCeU5hbWUoIGVsZW1lbnQubmFtZSApLnJlbW92ZUNsYXNzKCBlcnJvckNsYXNzICkuYWRkQ2xhc3MoIHZhbGlkQ2xhc3MgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoIGVsZW1lbnQgKS5yZW1vdmVDbGFzcyggZXJyb3JDbGFzcyApLmFkZENsYXNzKCB2YWxpZENsYXNzICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvalF1ZXJ5LnZhbGlkYXRvci5zZXREZWZhdWx0cy9cblx0c2V0RGVmYXVsdHM6IGZ1bmN0aW9uKCBzZXR0aW5ncyApIHtcblx0XHQkLmV4dGVuZCggJC52YWxpZGF0b3IuZGVmYXVsdHMsIHNldHRpbmdzICk7XG5cdH0sXG5cblx0bWVzc2FnZXM6IHtcblx0XHRyZXF1aXJlZDogXCJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkLlwiLFxuXHRcdHJlbW90ZTogXCJQbGVhc2UgZml4IHRoaXMgZmllbGQuXCIsXG5cdFx0ZW1haWw6IFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwgYWRkcmVzcy5cIixcblx0XHR1cmw6IFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgVVJMLlwiLFxuXHRcdGRhdGU6IFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgZGF0ZS5cIixcblx0XHRkYXRlSVNPOiBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGRhdGUgKElTTykuXCIsXG5cdFx0bnVtYmVyOiBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIG51bWJlci5cIixcblx0XHRkaWdpdHM6IFwiUGxlYXNlIGVudGVyIG9ubHkgZGlnaXRzLlwiLFxuXHRcdGVxdWFsVG86IFwiUGxlYXNlIGVudGVyIHRoZSBzYW1lIHZhbHVlIGFnYWluLlwiLFxuXHRcdG1heGxlbmd0aDogJC52YWxpZGF0b3IuZm9ybWF0KCBcIlBsZWFzZSBlbnRlciBubyBtb3JlIHRoYW4gezB9IGNoYXJhY3RlcnMuXCIgKSxcblx0XHRtaW5sZW5ndGg6ICQudmFsaWRhdG9yLmZvcm1hdCggXCJQbGVhc2UgZW50ZXIgYXQgbGVhc3QgezB9IGNoYXJhY3RlcnMuXCIgKSxcblx0XHRyYW5nZWxlbmd0aDogJC52YWxpZGF0b3IuZm9ybWF0KCBcIlBsZWFzZSBlbnRlciBhIHZhbHVlIGJldHdlZW4gezB9IGFuZCB7MX0gY2hhcmFjdGVycyBsb25nLlwiICksXG5cdFx0cmFuZ2U6ICQudmFsaWRhdG9yLmZvcm1hdCggXCJQbGVhc2UgZW50ZXIgYSB2YWx1ZSBiZXR3ZWVuIHswfSBhbmQgezF9LlwiICksXG5cdFx0bWF4OiAkLnZhbGlkYXRvci5mb3JtYXQoIFwiUGxlYXNlIGVudGVyIGEgdmFsdWUgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHswfS5cIiApLFxuXHRcdG1pbjogJC52YWxpZGF0b3IuZm9ybWF0KCBcIlBsZWFzZSBlbnRlciBhIHZhbHVlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB7MH0uXCIgKSxcblx0XHRzdGVwOiAkLnZhbGlkYXRvci5mb3JtYXQoIFwiUGxlYXNlIGVudGVyIGEgbXVsdGlwbGUgb2YgezB9LlwiIClcblx0fSxcblxuXHRhdXRvQ3JlYXRlUmFuZ2VzOiBmYWxzZSxcblxuXHRwcm90b3R5cGU6IHtcblxuXHRcdGluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5sYWJlbENvbnRhaW5lciA9ICQoIHRoaXMuc2V0dGluZ3MuZXJyb3JMYWJlbENvbnRhaW5lciApO1xuXHRcdFx0dGhpcy5lcnJvckNvbnRleHQgPSB0aGlzLmxhYmVsQ29udGFpbmVyLmxlbmd0aCAmJiB0aGlzLmxhYmVsQ29udGFpbmVyIHx8ICQoIHRoaXMuY3VycmVudEZvcm0gKTtcblx0XHRcdHRoaXMuY29udGFpbmVycyA9ICQoIHRoaXMuc2V0dGluZ3MuZXJyb3JDb250YWluZXIgKS5hZGQoIHRoaXMuc2V0dGluZ3MuZXJyb3JMYWJlbENvbnRhaW5lciApO1xuXHRcdFx0dGhpcy5zdWJtaXR0ZWQgPSB7fTtcblx0XHRcdHRoaXMudmFsdWVDYWNoZSA9IHt9O1xuXHRcdFx0dGhpcy5wZW5kaW5nUmVxdWVzdCA9IDA7XG5cdFx0XHR0aGlzLnBlbmRpbmcgPSB7fTtcblx0XHRcdHRoaXMuaW52YWxpZCA9IHt9O1xuXHRcdFx0dGhpcy5yZXNldCgpO1xuXG5cdFx0XHR2YXIgY3VycmVudEZvcm0gPSB0aGlzLmN1cnJlbnRGb3JtLFxuXHRcdFx0XHRncm91cHMgPSAoIHRoaXMuZ3JvdXBzID0ge30gKSxcblx0XHRcdFx0cnVsZXM7XG5cdFx0XHQkLmVhY2goIHRoaXMuc2V0dGluZ3MuZ3JvdXBzLCBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcblx0XHRcdFx0aWYgKCB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRcdFx0dmFsdWUgPSB2YWx1ZS5zcGxpdCggL1xccy8gKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQkLmVhY2goIHZhbHVlLCBmdW5jdGlvbiggaW5kZXgsIG5hbWUgKSB7XG5cdFx0XHRcdFx0Z3JvdXBzWyBuYW1lIF0gPSBrZXk7XG5cdFx0XHRcdH0gKTtcblx0XHRcdH0gKTtcblx0XHRcdHJ1bGVzID0gdGhpcy5zZXR0aW5ncy5ydWxlcztcblx0XHRcdCQuZWFjaCggcnVsZXMsIGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXHRcdFx0XHRydWxlc1sga2V5IF0gPSAkLnZhbGlkYXRvci5ub3JtYWxpemVSdWxlKCB2YWx1ZSApO1xuXHRcdFx0fSApO1xuXG5cdFx0XHRmdW5jdGlvbiBkZWxlZ2F0ZSggZXZlbnQgKSB7XG5cdFx0XHRcdHZhciBpc0NvbnRlbnRFZGl0YWJsZSA9IHR5cGVvZiAkKCB0aGlzICkuYXR0ciggXCJjb250ZW50ZWRpdGFibGVcIiApICE9PSBcInVuZGVmaW5lZFwiICYmICQoIHRoaXMgKS5hdHRyKCBcImNvbnRlbnRlZGl0YWJsZVwiICkgIT09IFwiZmFsc2VcIjtcblxuXHRcdFx0XHQvLyBTZXQgZm9ybSBleHBhbmRvIG9uIGNvbnRlbnRlZGl0YWJsZVxuXHRcdFx0XHRpZiAoICF0aGlzLmZvcm0gJiYgaXNDb250ZW50RWRpdGFibGUgKSB7XG5cdFx0XHRcdFx0dGhpcy5mb3JtID0gJCggdGhpcyApLmNsb3Nlc3QoIFwiZm9ybVwiIClbIDAgXTtcblx0XHRcdFx0XHR0aGlzLm5hbWUgPSAkKCB0aGlzICkuYXR0ciggXCJuYW1lXCIgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIElnbm9yZSB0aGUgZWxlbWVudCBpZiBpdCBiZWxvbmdzIHRvIGFub3RoZXIgZm9ybS4gVGhpcyB3aWxsIGhhcHBlbiBtYWlubHlcblx0XHRcdFx0Ly8gd2hlbiBzZXR0aW5nIHRoZSBgZm9ybWAgYXR0cmlidXRlIG9mIGFuIGlucHV0IHRvIHRoZSBpZCBvZiBhbm90aGVyIGZvcm0uXG5cdFx0XHRcdGlmICggY3VycmVudEZvcm0gIT09IHRoaXMuZm9ybSApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR2YXIgdmFsaWRhdG9yID0gJC5kYXRhKCB0aGlzLmZvcm0sIFwidmFsaWRhdG9yXCIgKSxcblx0XHRcdFx0XHRldmVudFR5cGUgPSBcIm9uXCIgKyBldmVudC50eXBlLnJlcGxhY2UoIC9edmFsaWRhdGUvLCBcIlwiICksXG5cdFx0XHRcdFx0c2V0dGluZ3MgPSB2YWxpZGF0b3Iuc2V0dGluZ3M7XG5cdFx0XHRcdGlmICggc2V0dGluZ3NbIGV2ZW50VHlwZSBdICYmICEkKCB0aGlzICkuaXMoIHNldHRpbmdzLmlnbm9yZSApICkge1xuXHRcdFx0XHRcdHNldHRpbmdzWyBldmVudFR5cGUgXS5jYWxsKCB2YWxpZGF0b3IsIHRoaXMsIGV2ZW50ICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0JCggdGhpcy5jdXJyZW50Rm9ybSApXG5cdFx0XHRcdC5vbiggXCJmb2N1c2luLnZhbGlkYXRlIGZvY3Vzb3V0LnZhbGlkYXRlIGtleXVwLnZhbGlkYXRlXCIsXG5cdFx0XHRcdFx0XCI6dGV4dCwgW3R5cGU9J3Bhc3N3b3JkJ10sIFt0eXBlPSdmaWxlJ10sIHNlbGVjdCwgdGV4dGFyZWEsIFt0eXBlPSdudW1iZXInXSwgW3R5cGU9J3NlYXJjaCddLCBcIiArXG5cdFx0XHRcdFx0XCJbdHlwZT0ndGVsJ10sIFt0eXBlPSd1cmwnXSwgW3R5cGU9J2VtYWlsJ10sIFt0eXBlPSdkYXRldGltZSddLCBbdHlwZT0nZGF0ZSddLCBbdHlwZT0nbW9udGgnXSwgXCIgK1xuXHRcdFx0XHRcdFwiW3R5cGU9J3dlZWsnXSwgW3R5cGU9J3RpbWUnXSwgW3R5cGU9J2RhdGV0aW1lLWxvY2FsJ10sIFt0eXBlPSdyYW5nZSddLCBbdHlwZT0nY29sb3InXSwgXCIgK1xuXHRcdFx0XHRcdFwiW3R5cGU9J3JhZGlvJ10sIFt0eXBlPSdjaGVja2JveCddLCBbY29udGVudGVkaXRhYmxlXSwgW3R5cGU9J2J1dHRvbiddXCIsIGRlbGVnYXRlIClcblxuXHRcdFx0XHQvLyBTdXBwb3J0OiBDaHJvbWUsIG9sZElFXG5cdFx0XHRcdC8vIFwic2VsZWN0XCIgaXMgcHJvdmlkZWQgYXMgZXZlbnQudGFyZ2V0IHdoZW4gY2xpY2tpbmcgYSBvcHRpb25cblx0XHRcdFx0Lm9uKCBcImNsaWNrLnZhbGlkYXRlXCIsIFwic2VsZWN0LCBvcHRpb24sIFt0eXBlPSdyYWRpbyddLCBbdHlwZT0nY2hlY2tib3gnXVwiLCBkZWxlZ2F0ZSApO1xuXG5cdFx0XHRpZiAoIHRoaXMuc2V0dGluZ3MuaW52YWxpZEhhbmRsZXIgKSB7XG5cdFx0XHRcdCQoIHRoaXMuY3VycmVudEZvcm0gKS5vbiggXCJpbnZhbGlkLWZvcm0udmFsaWRhdGVcIiwgdGhpcy5zZXR0aW5ncy5pbnZhbGlkSGFuZGxlciApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL1ZhbGlkYXRvci5mb3JtL1xuXHRcdGZvcm06IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5jaGVja0Zvcm0oKTtcblx0XHRcdCQuZXh0ZW5kKCB0aGlzLnN1Ym1pdHRlZCwgdGhpcy5lcnJvck1hcCApO1xuXHRcdFx0dGhpcy5pbnZhbGlkID0gJC5leHRlbmQoIHt9LCB0aGlzLmVycm9yTWFwICk7XG5cdFx0XHRpZiAoICF0aGlzLnZhbGlkKCkgKSB7XG5cdFx0XHRcdCQoIHRoaXMuY3VycmVudEZvcm0gKS50cmlnZ2VySGFuZGxlciggXCJpbnZhbGlkLWZvcm1cIiwgWyB0aGlzIF0gKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuc2hvd0Vycm9ycygpO1xuXHRcdFx0cmV0dXJuIHRoaXMudmFsaWQoKTtcblx0XHR9LFxuXG5cdFx0Y2hlY2tGb3JtOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMucHJlcGFyZUZvcm0oKTtcblx0XHRcdGZvciAoIHZhciBpID0gMCwgZWxlbWVudHMgPSAoIHRoaXMuY3VycmVudEVsZW1lbnRzID0gdGhpcy5lbGVtZW50cygpICk7IGVsZW1lbnRzWyBpIF07IGkrKyApIHtcblx0XHRcdFx0dGhpcy5jaGVjayggZWxlbWVudHNbIGkgXSApO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXMudmFsaWQoKTtcblx0XHR9LFxuXG5cdFx0Ly8gaHR0cHM6Ly9qcXVlcnl2YWxpZGF0aW9uLm9yZy9WYWxpZGF0b3IuZWxlbWVudC9cblx0XHRlbGVtZW50OiBmdW5jdGlvbiggZWxlbWVudCApIHtcblx0XHRcdHZhciBjbGVhbkVsZW1lbnQgPSB0aGlzLmNsZWFuKCBlbGVtZW50ICksXG5cdFx0XHRcdGNoZWNrRWxlbWVudCA9IHRoaXMudmFsaWRhdGlvblRhcmdldEZvciggY2xlYW5FbGVtZW50ICksXG5cdFx0XHRcdHYgPSB0aGlzLFxuXHRcdFx0XHRyZXN1bHQgPSB0cnVlLFxuXHRcdFx0XHRycywgZ3JvdXA7XG5cblx0XHRcdGlmICggY2hlY2tFbGVtZW50ID09PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdGRlbGV0ZSB0aGlzLmludmFsaWRbIGNsZWFuRWxlbWVudC5uYW1lIF07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnByZXBhcmVFbGVtZW50KCBjaGVja0VsZW1lbnQgKTtcblx0XHRcdFx0dGhpcy5jdXJyZW50RWxlbWVudHMgPSAkKCBjaGVja0VsZW1lbnQgKTtcblxuXHRcdFx0XHQvLyBJZiB0aGlzIGVsZW1lbnQgaXMgZ3JvdXBlZCwgdGhlbiB2YWxpZGF0ZSBhbGwgZ3JvdXAgZWxlbWVudHMgYWxyZWFkeVxuXHRcdFx0XHQvLyBjb250YWluaW5nIGEgdmFsdWVcblx0XHRcdFx0Z3JvdXAgPSB0aGlzLmdyb3Vwc1sgY2hlY2tFbGVtZW50Lm5hbWUgXTtcblx0XHRcdFx0aWYgKCBncm91cCApIHtcblx0XHRcdFx0XHQkLmVhY2goIHRoaXMuZ3JvdXBzLCBmdW5jdGlvbiggbmFtZSwgdGVzdGdyb3VwICkge1xuXHRcdFx0XHRcdFx0aWYgKCB0ZXN0Z3JvdXAgPT09IGdyb3VwICYmIG5hbWUgIT09IGNoZWNrRWxlbWVudC5uYW1lICkge1xuXHRcdFx0XHRcdFx0XHRjbGVhbkVsZW1lbnQgPSB2LnZhbGlkYXRpb25UYXJnZXRGb3IoIHYuY2xlYW4oIHYuZmluZEJ5TmFtZSggbmFtZSApICkgKTtcblx0XHRcdFx0XHRcdFx0aWYgKCBjbGVhbkVsZW1lbnQgJiYgY2xlYW5FbGVtZW50Lm5hbWUgaW4gdi5pbnZhbGlkICkge1xuXHRcdFx0XHRcdFx0XHRcdHYuY3VycmVudEVsZW1lbnRzLnB1c2goIGNsZWFuRWxlbWVudCApO1xuXHRcdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHYuY2hlY2soIGNsZWFuRWxlbWVudCApICYmIHJlc3VsdDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJzID0gdGhpcy5jaGVjayggY2hlY2tFbGVtZW50ICkgIT09IGZhbHNlO1xuXHRcdFx0XHRyZXN1bHQgPSByZXN1bHQgJiYgcnM7XG5cdFx0XHRcdGlmICggcnMgKSB7XG5cdFx0XHRcdFx0dGhpcy5pbnZhbGlkWyBjaGVja0VsZW1lbnQubmFtZSBdID0gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5pbnZhbGlkWyBjaGVja0VsZW1lbnQubmFtZSBdID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggIXRoaXMubnVtYmVyT2ZJbnZhbGlkcygpICkge1xuXG5cdFx0XHRcdFx0Ly8gSGlkZSBlcnJvciBjb250YWluZXJzIG9uIGxhc3QgZXJyb3Jcblx0XHRcdFx0XHR0aGlzLnRvSGlkZSA9IHRoaXMudG9IaWRlLmFkZCggdGhpcy5jb250YWluZXJzICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zaG93RXJyb3JzKCk7XG5cblx0XHRcdFx0Ly8gQWRkIGFyaWEtaW52YWxpZCBzdGF0dXMgZm9yIHNjcmVlbiByZWFkZXJzXG5cdFx0XHRcdCQoIGVsZW1lbnQgKS5hdHRyKCBcImFyaWEtaW52YWxpZFwiLCAhcnMgKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LFxuXG5cdFx0Ly8gaHR0cHM6Ly9qcXVlcnl2YWxpZGF0aW9uLm9yZy9WYWxpZGF0b3Iuc2hvd0Vycm9ycy9cblx0XHRzaG93RXJyb3JzOiBmdW5jdGlvbiggZXJyb3JzICkge1xuXHRcdFx0aWYgKCBlcnJvcnMgKSB7XG5cdFx0XHRcdHZhciB2YWxpZGF0b3IgPSB0aGlzO1xuXG5cdFx0XHRcdC8vIEFkZCBpdGVtcyB0byBlcnJvciBsaXN0IGFuZCBtYXBcblx0XHRcdFx0JC5leHRlbmQoIHRoaXMuZXJyb3JNYXAsIGVycm9ycyApO1xuXHRcdFx0XHR0aGlzLmVycm9yTGlzdCA9ICQubWFwKCB0aGlzLmVycm9yTWFwLCBmdW5jdGlvbiggbWVzc2FnZSwgbmFtZSApIHtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0bWVzc2FnZTogbWVzc2FnZSxcblx0XHRcdFx0XHRcdGVsZW1lbnQ6IHZhbGlkYXRvci5maW5kQnlOYW1lKCBuYW1lIClbIDAgXVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gKTtcblxuXHRcdFx0XHQvLyBSZW1vdmUgaXRlbXMgZnJvbSBzdWNjZXNzIGxpc3Rcblx0XHRcdFx0dGhpcy5zdWNjZXNzTGlzdCA9ICQuZ3JlcCggdGhpcy5zdWNjZXNzTGlzdCwgZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG5cdFx0XHRcdFx0cmV0dXJuICEoIGVsZW1lbnQubmFtZSBpbiBlcnJvcnMgKTtcblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCB0aGlzLnNldHRpbmdzLnNob3dFcnJvcnMgKSB7XG5cdFx0XHRcdHRoaXMuc2V0dGluZ3Muc2hvd0Vycm9ycy5jYWxsKCB0aGlzLCB0aGlzLmVycm9yTWFwLCB0aGlzLmVycm9yTGlzdCApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5kZWZhdWx0U2hvd0Vycm9ycygpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL1ZhbGlkYXRvci5yZXNldEZvcm0vXG5cdFx0cmVzZXRGb3JtOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggJC5mbi5yZXNldEZvcm0gKSB7XG5cdFx0XHRcdCQoIHRoaXMuY3VycmVudEZvcm0gKS5yZXNldEZvcm0oKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuaW52YWxpZCA9IHt9O1xuXHRcdFx0dGhpcy5zdWJtaXR0ZWQgPSB7fTtcblx0XHRcdHRoaXMucHJlcGFyZUZvcm0oKTtcblx0XHRcdHRoaXMuaGlkZUVycm9ycygpO1xuXHRcdFx0dmFyIGVsZW1lbnRzID0gdGhpcy5lbGVtZW50cygpXG5cdFx0XHRcdC5yZW1vdmVEYXRhKCBcInByZXZpb3VzVmFsdWVcIiApXG5cdFx0XHRcdC5yZW1vdmVBdHRyKCBcImFyaWEtaW52YWxpZFwiICk7XG5cblx0XHRcdHRoaXMucmVzZXRFbGVtZW50cyggZWxlbWVudHMgKTtcblx0XHR9LFxuXG5cdFx0cmVzZXRFbGVtZW50czogZnVuY3Rpb24oIGVsZW1lbnRzICkge1xuXHRcdFx0dmFyIGk7XG5cblx0XHRcdGlmICggdGhpcy5zZXR0aW5ncy51bmhpZ2hsaWdodCApIHtcblx0XHRcdFx0Zm9yICggaSA9IDA7IGVsZW1lbnRzWyBpIF07IGkrKyApIHtcblx0XHRcdFx0XHR0aGlzLnNldHRpbmdzLnVuaGlnaGxpZ2h0LmNhbGwoIHRoaXMsIGVsZW1lbnRzWyBpIF0sXG5cdFx0XHRcdFx0XHR0aGlzLnNldHRpbmdzLmVycm9yQ2xhc3MsIFwiXCIgKTtcblx0XHRcdFx0XHR0aGlzLmZpbmRCeU5hbWUoIGVsZW1lbnRzWyBpIF0ubmFtZSApLnJlbW92ZUNsYXNzKCB0aGlzLnNldHRpbmdzLnZhbGlkQ2xhc3MgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZWxlbWVudHNcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoIHRoaXMuc2V0dGluZ3MuZXJyb3JDbGFzcyApXG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCB0aGlzLnNldHRpbmdzLnZhbGlkQ2xhc3MgKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0bnVtYmVyT2ZJbnZhbGlkczogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5vYmplY3RMZW5ndGgoIHRoaXMuaW52YWxpZCApO1xuXHRcdH0sXG5cblx0XHRvYmplY3RMZW5ndGg6IGZ1bmN0aW9uKCBvYmogKSB7XG5cdFx0XHQvKiBqc2hpbnQgdW51c2VkOiBmYWxzZSAqL1xuXHRcdFx0dmFyIGNvdW50ID0gMCxcblx0XHRcdFx0aTtcblx0XHRcdGZvciAoIGkgaW4gb2JqICkge1xuXG5cdFx0XHRcdC8vIFRoaXMgY2hlY2sgYWxsb3dzIGNvdW50aW5nIGVsZW1lbnRzIHdpdGggZW1wdHkgZXJyb3Jcblx0XHRcdFx0Ly8gbWVzc2FnZSBhcyBpbnZhbGlkIGVsZW1lbnRzXG5cdFx0XHRcdGlmICggb2JqWyBpIF0gIT09IHVuZGVmaW5lZCAmJiBvYmpbIGkgXSAhPT0gbnVsbCAmJiBvYmpbIGkgXSAhPT0gZmFsc2UgKSB7XG5cdFx0XHRcdFx0Y291bnQrKztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNvdW50O1xuXHRcdH0sXG5cblx0XHRoaWRlRXJyb3JzOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuaGlkZVRoZXNlKCB0aGlzLnRvSGlkZSApO1xuXHRcdH0sXG5cblx0XHRoaWRlVGhlc2U6IGZ1bmN0aW9uKCBlcnJvcnMgKSB7XG5cdFx0XHRlcnJvcnMubm90KCB0aGlzLmNvbnRhaW5lcnMgKS50ZXh0KCBcIlwiICk7XG5cdFx0XHR0aGlzLmFkZFdyYXBwZXIoIGVycm9ycyApLmhpZGUoKTtcblx0XHR9LFxuXG5cdFx0dmFsaWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuc2l6ZSgpID09PSAwO1xuXHRcdH0sXG5cblx0XHRzaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmVycm9yTGlzdC5sZW5ndGg7XG5cdFx0fSxcblxuXHRcdGZvY3VzSW52YWxpZDogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHRoaXMuc2V0dGluZ3MuZm9jdXNJbnZhbGlkICkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdCQoIHRoaXMuZmluZExhc3RBY3RpdmUoKSB8fCB0aGlzLmVycm9yTGlzdC5sZW5ndGggJiYgdGhpcy5lcnJvckxpc3RbIDAgXS5lbGVtZW50IHx8IFtdIClcblx0XHRcdFx0XHQuZmlsdGVyKCBcIjp2aXNpYmxlXCIgKVxuXHRcdFx0XHRcdC50cmlnZ2VyKCBcImZvY3VzXCIgKVxuXG5cdFx0XHRcdFx0Ly8gTWFudWFsbHkgdHJpZ2dlciBmb2N1c2luIGV2ZW50OyB3aXRob3V0IGl0LCBmb2N1c2luIGhhbmRsZXIgaXNuJ3QgY2FsbGVkLCBmaW5kTGFzdEFjdGl2ZSB3b24ndCBoYXZlIGFueXRoaW5nIHRvIGZpbmRcblx0XHRcdFx0XHQudHJpZ2dlciggXCJmb2N1c2luXCIgKTtcblx0XHRcdFx0fSBjYXRjaCAoIGUgKSB7XG5cblx0XHRcdFx0XHQvLyBJZ25vcmUgSUUgdGhyb3dpbmcgZXJyb3JzIHdoZW4gZm9jdXNpbmcgaGlkZGVuIGVsZW1lbnRzXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZmluZExhc3RBY3RpdmU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGxhc3RBY3RpdmUgPSB0aGlzLmxhc3RBY3RpdmU7XG5cdFx0XHRyZXR1cm4gbGFzdEFjdGl2ZSAmJiAkLmdyZXAoIHRoaXMuZXJyb3JMaXN0LCBmdW5jdGlvbiggbiApIHtcblx0XHRcdFx0cmV0dXJuIG4uZWxlbWVudC5uYW1lID09PSBsYXN0QWN0aXZlLm5hbWU7XG5cdFx0XHR9ICkubGVuZ3RoID09PSAxICYmIGxhc3RBY3RpdmU7XG5cdFx0fSxcblxuXHRcdGVsZW1lbnRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciB2YWxpZGF0b3IgPSB0aGlzLFxuXHRcdFx0XHRydWxlc0NhY2hlID0ge307XG5cblx0XHRcdC8vIFNlbGVjdCBhbGwgdmFsaWQgaW5wdXRzIGluc2lkZSB0aGUgZm9ybSAobm8gc3VibWl0IG9yIHJlc2V0IGJ1dHRvbnMpXG5cdFx0XHRyZXR1cm4gJCggdGhpcy5jdXJyZW50Rm9ybSApXG5cdFx0XHQuZmluZCggXCJpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYSwgW2NvbnRlbnRlZGl0YWJsZV1cIiApXG5cdFx0XHQubm90KCBcIjpzdWJtaXQsIDpyZXNldCwgOmltYWdlLCA6ZGlzYWJsZWRcIiApXG5cdFx0XHQubm90KCB0aGlzLnNldHRpbmdzLmlnbm9yZSApXG5cdFx0XHQuZmlsdGVyKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIG5hbWUgPSB0aGlzLm5hbWUgfHwgJCggdGhpcyApLmF0dHIoIFwibmFtZVwiICk7IC8vIEZvciBjb250ZW50ZWRpdGFibGVcblx0XHRcdFx0dmFyIGlzQ29udGVudEVkaXRhYmxlID0gdHlwZW9mICQoIHRoaXMgKS5hdHRyKCBcImNvbnRlbnRlZGl0YWJsZVwiICkgIT09IFwidW5kZWZpbmVkXCIgJiYgJCggdGhpcyApLmF0dHIoIFwiY29udGVudGVkaXRhYmxlXCIgKSAhPT0gXCJmYWxzZVwiO1xuXG5cdFx0XHRcdGlmICggIW5hbWUgJiYgdmFsaWRhdG9yLnNldHRpbmdzLmRlYnVnICYmIHdpbmRvdy5jb25zb2xlICkge1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoIFwiJW8gaGFzIG5vIG5hbWUgYXNzaWduZWRcIiwgdGhpcyApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gU2V0IGZvcm0gZXhwYW5kbyBvbiBjb250ZW50ZWRpdGFibGVcblx0XHRcdFx0aWYgKCBpc0NvbnRlbnRFZGl0YWJsZSApIHtcblx0XHRcdFx0XHR0aGlzLmZvcm0gPSAkKCB0aGlzICkuY2xvc2VzdCggXCJmb3JtXCIgKVsgMCBdO1xuXHRcdFx0XHRcdHRoaXMubmFtZSA9IG5hbWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBJZ25vcmUgZWxlbWVudHMgdGhhdCBiZWxvbmcgdG8gb3RoZXIvbmVzdGVkIGZvcm1zXG5cdFx0XHRcdGlmICggdGhpcy5mb3JtICE9PSB2YWxpZGF0b3IuY3VycmVudEZvcm0gKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gU2VsZWN0IG9ubHkgdGhlIGZpcnN0IGVsZW1lbnQgZm9yIGVhY2ggbmFtZSwgYW5kIG9ubHkgdGhvc2Ugd2l0aCBydWxlcyBzcGVjaWZpZWRcblx0XHRcdFx0aWYgKCBuYW1lIGluIHJ1bGVzQ2FjaGUgfHwgIXZhbGlkYXRvci5vYmplY3RMZW5ndGgoICQoIHRoaXMgKS5ydWxlcygpICkgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cnVsZXNDYWNoZVsgbmFtZSBdID0gdHJ1ZTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9ICk7XG5cdFx0fSxcblxuXHRcdGNsZWFuOiBmdW5jdGlvbiggc2VsZWN0b3IgKSB7XG5cdFx0XHRyZXR1cm4gJCggc2VsZWN0b3IgKVsgMCBdO1xuXHRcdH0sXG5cblx0XHRlcnJvcnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGVycm9yQ2xhc3MgPSB0aGlzLnNldHRpbmdzLmVycm9yQ2xhc3Muc3BsaXQoIFwiIFwiICkuam9pbiggXCIuXCIgKTtcblx0XHRcdHJldHVybiAkKCB0aGlzLnNldHRpbmdzLmVycm9yRWxlbWVudCArIFwiLlwiICsgZXJyb3JDbGFzcywgdGhpcy5lcnJvckNvbnRleHQgKTtcblx0XHR9LFxuXG5cdFx0cmVzZXRJbnRlcm5hbHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5zdWNjZXNzTGlzdCA9IFtdO1xuXHRcdFx0dGhpcy5lcnJvckxpc3QgPSBbXTtcblx0XHRcdHRoaXMuZXJyb3JNYXAgPSB7fTtcblx0XHRcdHRoaXMudG9TaG93ID0gJCggW10gKTtcblx0XHRcdHRoaXMudG9IaWRlID0gJCggW10gKTtcblx0XHR9LFxuXG5cdFx0cmVzZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5yZXNldEludGVybmFscygpO1xuXHRcdFx0dGhpcy5jdXJyZW50RWxlbWVudHMgPSAkKCBbXSApO1xuXHRcdH0sXG5cblx0XHRwcmVwYXJlRm9ybTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnJlc2V0KCk7XG5cdFx0XHR0aGlzLnRvSGlkZSA9IHRoaXMuZXJyb3JzKCkuYWRkKCB0aGlzLmNvbnRhaW5lcnMgKTtcblx0XHR9LFxuXG5cdFx0cHJlcGFyZUVsZW1lbnQ6IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuXHRcdFx0dGhpcy5yZXNldCgpO1xuXHRcdFx0dGhpcy50b0hpZGUgPSB0aGlzLmVycm9yc0ZvciggZWxlbWVudCApO1xuXHRcdH0sXG5cblx0XHRlbGVtZW50VmFsdWU6IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuXHRcdFx0dmFyICRlbGVtZW50ID0gJCggZWxlbWVudCApLFxuXHRcdFx0XHR0eXBlID0gZWxlbWVudC50eXBlLFxuXHRcdFx0XHRpc0NvbnRlbnRFZGl0YWJsZSA9IHR5cGVvZiAkZWxlbWVudC5hdHRyKCBcImNvbnRlbnRlZGl0YWJsZVwiICkgIT09IFwidW5kZWZpbmVkXCIgJiYgJGVsZW1lbnQuYXR0ciggXCJjb250ZW50ZWRpdGFibGVcIiApICE9PSBcImZhbHNlXCIsXG5cdFx0XHRcdHZhbCwgaWR4O1xuXG5cdFx0XHRpZiAoIHR5cGUgPT09IFwicmFkaW9cIiB8fCB0eXBlID09PSBcImNoZWNrYm94XCIgKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmZpbmRCeU5hbWUoIGVsZW1lbnQubmFtZSApLmZpbHRlciggXCI6Y2hlY2tlZFwiICkudmFsKCk7XG5cdFx0XHR9IGVsc2UgaWYgKCB0eXBlID09PSBcIm51bWJlclwiICYmIHR5cGVvZiBlbGVtZW50LnZhbGlkaXR5ICE9PSBcInVuZGVmaW5lZFwiICkge1xuXHRcdFx0XHRyZXR1cm4gZWxlbWVudC52YWxpZGl0eS5iYWRJbnB1dCA/IFwiTmFOXCIgOiAkZWxlbWVudC52YWwoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBpc0NvbnRlbnRFZGl0YWJsZSApIHtcblx0XHRcdFx0dmFsID0gJGVsZW1lbnQudGV4dCgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFsID0gJGVsZW1lbnQudmFsKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggdHlwZSA9PT0gXCJmaWxlXCIgKSB7XG5cblx0XHRcdFx0Ly8gTW9kZXJuIGJyb3dzZXIgKGNocm9tZSAmIHNhZmFyaSlcblx0XHRcdFx0aWYgKCB2YWwuc3Vic3RyKCAwLCAxMiApID09PSBcIkM6XFxcXGZha2VwYXRoXFxcXFwiICkge1xuXHRcdFx0XHRcdHJldHVybiB2YWwuc3Vic3RyKCAxMiApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gTGVnYWN5IGJyb3dzZXJzXG5cdFx0XHRcdC8vIFVuaXgtYmFzZWQgcGF0aFxuXHRcdFx0XHRpZHggPSB2YWwubGFzdEluZGV4T2YoIFwiL1wiICk7XG5cdFx0XHRcdGlmICggaWR4ID49IDAgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHZhbC5zdWJzdHIoIGlkeCArIDEgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFdpbmRvd3MtYmFzZWQgcGF0aFxuXHRcdFx0XHRpZHggPSB2YWwubGFzdEluZGV4T2YoIFwiXFxcXFwiICk7XG5cdFx0XHRcdGlmICggaWR4ID49IDAgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHZhbC5zdWJzdHIoIGlkeCArIDEgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIEp1c3QgdGhlIGZpbGUgbmFtZVxuXHRcdFx0XHRyZXR1cm4gdmFsO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRcdHJldHVybiB2YWwucmVwbGFjZSggL1xcci9nLCBcIlwiICk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdmFsO1xuXHRcdH0sXG5cblx0XHRjaGVjazogZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG5cdFx0XHRlbGVtZW50ID0gdGhpcy52YWxpZGF0aW9uVGFyZ2V0Rm9yKCB0aGlzLmNsZWFuKCBlbGVtZW50ICkgKTtcblxuXHRcdFx0dmFyIHJ1bGVzID0gJCggZWxlbWVudCApLnJ1bGVzKCksXG5cdFx0XHRcdHJ1bGVzQ291bnQgPSAkLm1hcCggcnVsZXMsIGZ1bmN0aW9uKCBuLCBpICkge1xuXHRcdFx0XHRcdHJldHVybiBpO1xuXHRcdFx0XHR9ICkubGVuZ3RoLFxuXHRcdFx0XHRkZXBlbmRlbmN5TWlzbWF0Y2ggPSBmYWxzZSxcblx0XHRcdFx0dmFsID0gdGhpcy5lbGVtZW50VmFsdWUoIGVsZW1lbnQgKSxcblx0XHRcdFx0cmVzdWx0LCBtZXRob2QsIHJ1bGUsIG5vcm1hbGl6ZXI7XG5cblx0XHRcdC8vIFByaW9yaXRpemUgdGhlIGxvY2FsIG5vcm1hbGl6ZXIgZGVmaW5lZCBmb3IgdGhpcyBlbGVtZW50IG92ZXIgdGhlIGdsb2JhbCBvbmVcblx0XHRcdC8vIGlmIHRoZSBmb3JtZXIgZXhpc3RzLCBvdGhlcndpc2UgdXNlciB0aGUgZ2xvYmFsIG9uZSBpbiBjYXNlIGl0IGV4aXN0cy5cblx0XHRcdGlmICggdHlwZW9mIHJ1bGVzLm5vcm1hbGl6ZXIgPT09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdFx0bm9ybWFsaXplciA9IHJ1bGVzLm5vcm1hbGl6ZXI7XG5cdFx0XHR9IGVsc2UgaWYgKFx0dHlwZW9mIHRoaXMuc2V0dGluZ3Mubm9ybWFsaXplciA9PT0gXCJmdW5jdGlvblwiICkge1xuXHRcdFx0XHRub3JtYWxpemVyID0gdGhpcy5zZXR0aW5ncy5ub3JtYWxpemVyO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBJZiBub3JtYWxpemVyIGlzIGRlZmluZWQsIHRoZW4gY2FsbCBpdCB0byByZXRyZWl2ZSB0aGUgY2hhbmdlZCB2YWx1ZSBpbnN0ZWFkXG5cdFx0XHQvLyBvZiB1c2luZyB0aGUgcmVhbCBvbmUuXG5cdFx0XHQvLyBOb3RlIHRoYXQgYHRoaXNgIGluIHRoZSBub3JtYWxpemVyIGlzIGBlbGVtZW50YC5cblx0XHRcdGlmICggbm9ybWFsaXplciApIHtcblx0XHRcdFx0dmFsID0gbm9ybWFsaXplci5jYWxsKCBlbGVtZW50LCB2YWwgKTtcblxuXHRcdFx0XHQvLyBEZWxldGUgdGhlIG5vcm1hbGl6ZXIgZnJvbSBydWxlcyB0byBhdm9pZCB0cmVhdGluZyBpdCBhcyBhIHByZS1kZWZpbmVkIG1ldGhvZC5cblx0XHRcdFx0ZGVsZXRlIHJ1bGVzLm5vcm1hbGl6ZXI7XG5cdFx0XHR9XG5cblx0XHRcdGZvciAoIG1ldGhvZCBpbiBydWxlcyApIHtcblx0XHRcdFx0cnVsZSA9IHsgbWV0aG9kOiBtZXRob2QsIHBhcmFtZXRlcnM6IHJ1bGVzWyBtZXRob2QgXSB9O1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHJlc3VsdCA9ICQudmFsaWRhdG9yLm1ldGhvZHNbIG1ldGhvZCBdLmNhbGwoIHRoaXMsIHZhbCwgZWxlbWVudCwgcnVsZS5wYXJhbWV0ZXJzICk7XG5cblx0XHRcdFx0XHQvLyBJZiBhIG1ldGhvZCBpbmRpY2F0ZXMgdGhhdCB0aGUgZmllbGQgaXMgb3B0aW9uYWwgYW5kIHRoZXJlZm9yZSB2YWxpZCxcblx0XHRcdFx0XHQvLyBkb24ndCBtYXJrIGl0IGFzIHZhbGlkIHdoZW4gdGhlcmUgYXJlIG5vIG90aGVyIHJ1bGVzXG5cdFx0XHRcdFx0aWYgKCByZXN1bHQgPT09IFwiZGVwZW5kZW5jeS1taXNtYXRjaFwiICYmIHJ1bGVzQ291bnQgPT09IDEgKSB7XG5cdFx0XHRcdFx0XHRkZXBlbmRlbmN5TWlzbWF0Y2ggPSB0cnVlO1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRlcGVuZGVuY3lNaXNtYXRjaCA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0aWYgKCByZXN1bHQgPT09IFwicGVuZGluZ1wiICkge1xuXHRcdFx0XHRcdFx0dGhpcy50b0hpZGUgPSB0aGlzLnRvSGlkZS5ub3QoIHRoaXMuZXJyb3JzRm9yKCBlbGVtZW50ICkgKTtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoICFyZXN1bHQgKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmZvcm1hdEFuZEFkZCggZWxlbWVudCwgcnVsZSApO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoIGUgKSB7XG5cdFx0XHRcdFx0aWYgKCB0aGlzLnNldHRpbmdzLmRlYnVnICYmIHdpbmRvdy5jb25zb2xlICkge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coIFwiRXhjZXB0aW9uIG9jY3VycmVkIHdoZW4gY2hlY2tpbmcgZWxlbWVudCBcIiArIGVsZW1lbnQuaWQgKyBcIiwgY2hlY2sgdGhlICdcIiArIHJ1bGUubWV0aG9kICsgXCInIG1ldGhvZC5cIiwgZSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoIGUgaW5zdGFuY2VvZiBUeXBlRXJyb3IgKSB7XG5cdFx0XHRcdFx0XHRlLm1lc3NhZ2UgKz0gXCIuICBFeGNlcHRpb24gb2NjdXJyZWQgd2hlbiBjaGVja2luZyBlbGVtZW50IFwiICsgZWxlbWVudC5pZCArIFwiLCBjaGVjayB0aGUgJ1wiICsgcnVsZS5tZXRob2QgKyBcIicgbWV0aG9kLlwiO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHRocm93IGU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICggZGVwZW5kZW5jeU1pc21hdGNoICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHRoaXMub2JqZWN0TGVuZ3RoKCBydWxlcyApICkge1xuXHRcdFx0XHR0aGlzLnN1Y2Nlc3NMaXN0LnB1c2goIGVsZW1lbnQgKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0sXG5cblx0XHQvLyBSZXR1cm4gdGhlIGN1c3RvbSBtZXNzYWdlIGZvciB0aGUgZ2l2ZW4gZWxlbWVudCBhbmQgdmFsaWRhdGlvbiBtZXRob2Rcblx0XHQvLyBzcGVjaWZpZWQgaW4gdGhlIGVsZW1lbnQncyBIVE1MNSBkYXRhIGF0dHJpYnV0ZVxuXHRcdC8vIHJldHVybiB0aGUgZ2VuZXJpYyBtZXNzYWdlIGlmIHByZXNlbnQgYW5kIG5vIG1ldGhvZCBzcGVjaWZpYyBtZXNzYWdlIGlzIHByZXNlbnRcblx0XHRjdXN0b21EYXRhTWVzc2FnZTogZnVuY3Rpb24oIGVsZW1lbnQsIG1ldGhvZCApIHtcblx0XHRcdHJldHVybiAkKCBlbGVtZW50ICkuZGF0YSggXCJtc2dcIiArIG1ldGhvZC5jaGFyQXQoIDAgKS50b1VwcGVyQ2FzZSgpICtcblx0XHRcdFx0bWV0aG9kLnN1YnN0cmluZyggMSApLnRvTG93ZXJDYXNlKCkgKSB8fCAkKCBlbGVtZW50ICkuZGF0YSggXCJtc2dcIiApO1xuXHRcdH0sXG5cblx0XHQvLyBSZXR1cm4gdGhlIGN1c3RvbSBtZXNzYWdlIGZvciB0aGUgZ2l2ZW4gZWxlbWVudCBuYW1lIGFuZCB2YWxpZGF0aW9uIG1ldGhvZFxuXHRcdGN1c3RvbU1lc3NhZ2U6IGZ1bmN0aW9uKCBuYW1lLCBtZXRob2QgKSB7XG5cdFx0XHR2YXIgbSA9IHRoaXMuc2V0dGluZ3MubWVzc2FnZXNbIG5hbWUgXTtcblx0XHRcdHJldHVybiBtICYmICggbS5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nID8gbSA6IG1bIG1ldGhvZCBdICk7XG5cdFx0fSxcblxuXHRcdC8vIFJldHVybiB0aGUgZmlyc3QgZGVmaW5lZCBhcmd1bWVudCwgYWxsb3dpbmcgZW1wdHkgc3RyaW5nc1xuXHRcdGZpbmREZWZpbmVkOiBmdW5jdGlvbigpIHtcblx0XHRcdGZvciAoIHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKyApIHtcblx0XHRcdFx0aWYgKCBhcmd1bWVudHNbIGkgXSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdHJldHVybiBhcmd1bWVudHNbIGkgXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9LFxuXG5cdFx0Ly8gVGhlIHNlY29uZCBwYXJhbWV0ZXIgJ3J1bGUnIHVzZWQgdG8gYmUgYSBzdHJpbmcsIGFuZCBleHRlbmRlZCB0byBhbiBvYmplY3QgbGl0ZXJhbFxuXHRcdC8vIG9mIHRoZSBmb2xsb3dpbmcgZm9ybTpcblx0XHQvLyBydWxlID0ge1xuXHRcdC8vICAgICBtZXRob2Q6IFwibWV0aG9kIG5hbWVcIixcblx0XHQvLyAgICAgcGFyYW1ldGVyczogXCJ0aGUgZ2l2ZW4gbWV0aG9kIHBhcmFtZXRlcnNcIlxuXHRcdC8vIH1cblx0XHQvL1xuXHRcdC8vIFRoZSBvbGQgYmVoYXZpb3Igc3RpbGwgc3VwcG9ydGVkLCBrZXB0IHRvIG1haW50YWluIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgd2l0aFxuXHRcdC8vIG9sZCBjb2RlLCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZXh0IG1ham9yIHJlbGVhc2UuXG5cdFx0ZGVmYXVsdE1lc3NhZ2U6IGZ1bmN0aW9uKCBlbGVtZW50LCBydWxlICkge1xuXHRcdFx0aWYgKCB0eXBlb2YgcnVsZSA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdFx0cnVsZSA9IHsgbWV0aG9kOiBydWxlIH07XG5cdFx0XHR9XG5cblx0XHRcdHZhciBtZXNzYWdlID0gdGhpcy5maW5kRGVmaW5lZChcblx0XHRcdFx0XHR0aGlzLmN1c3RvbU1lc3NhZ2UoIGVsZW1lbnQubmFtZSwgcnVsZS5tZXRob2QgKSxcblx0XHRcdFx0XHR0aGlzLmN1c3RvbURhdGFNZXNzYWdlKCBlbGVtZW50LCBydWxlLm1ldGhvZCApLFxuXG5cdFx0XHRcdFx0Ly8gJ3RpdGxlJyBpcyBuZXZlciB1bmRlZmluZWQsIHNvIGhhbmRsZSBlbXB0eSBzdHJpbmcgYXMgdW5kZWZpbmVkXG5cdFx0XHRcdFx0IXRoaXMuc2V0dGluZ3MuaWdub3JlVGl0bGUgJiYgZWxlbWVudC50aXRsZSB8fCB1bmRlZmluZWQsXG5cdFx0XHRcdFx0JC52YWxpZGF0b3IubWVzc2FnZXNbIHJ1bGUubWV0aG9kIF0sXG5cdFx0XHRcdFx0XCI8c3Ryb25nPldhcm5pbmc6IE5vIG1lc3NhZ2UgZGVmaW5lZCBmb3IgXCIgKyBlbGVtZW50Lm5hbWUgKyBcIjwvc3Ryb25nPlwiXG5cdFx0XHRcdCksXG5cdFx0XHRcdHRoZXJlZ2V4ID0gL1xcJD9cXHsoXFxkKylcXH0vZztcblx0XHRcdGlmICggdHlwZW9mIG1lc3NhZ2UgPT09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdFx0bWVzc2FnZSA9IG1lc3NhZ2UuY2FsbCggdGhpcywgcnVsZS5wYXJhbWV0ZXJzLCBlbGVtZW50ICk7XG5cdFx0XHR9IGVsc2UgaWYgKCB0aGVyZWdleC50ZXN0KCBtZXNzYWdlICkgKSB7XG5cdFx0XHRcdG1lc3NhZ2UgPSAkLnZhbGlkYXRvci5mb3JtYXQoIG1lc3NhZ2UucmVwbGFjZSggdGhlcmVnZXgsIFwieyQxfVwiICksIHJ1bGUucGFyYW1ldGVycyApO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbWVzc2FnZTtcblx0XHR9LFxuXG5cdFx0Zm9ybWF0QW5kQWRkOiBmdW5jdGlvbiggZWxlbWVudCwgcnVsZSApIHtcblx0XHRcdHZhciBtZXNzYWdlID0gdGhpcy5kZWZhdWx0TWVzc2FnZSggZWxlbWVudCwgcnVsZSApO1xuXG5cdFx0XHR0aGlzLmVycm9yTGlzdC5wdXNoKCB7XG5cdFx0XHRcdG1lc3NhZ2U6IG1lc3NhZ2UsXG5cdFx0XHRcdGVsZW1lbnQ6IGVsZW1lbnQsXG5cdFx0XHRcdG1ldGhvZDogcnVsZS5tZXRob2Rcblx0XHRcdH0gKTtcblxuXHRcdFx0dGhpcy5lcnJvck1hcFsgZWxlbWVudC5uYW1lIF0gPSBtZXNzYWdlO1xuXHRcdFx0dGhpcy5zdWJtaXR0ZWRbIGVsZW1lbnQubmFtZSBdID0gbWVzc2FnZTtcblx0XHR9LFxuXG5cdFx0YWRkV3JhcHBlcjogZnVuY3Rpb24oIHRvVG9nZ2xlICkge1xuXHRcdFx0aWYgKCB0aGlzLnNldHRpbmdzLndyYXBwZXIgKSB7XG5cdFx0XHRcdHRvVG9nZ2xlID0gdG9Ub2dnbGUuYWRkKCB0b1RvZ2dsZS5wYXJlbnQoIHRoaXMuc2V0dGluZ3Mud3JhcHBlciApICk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdG9Ub2dnbGU7XG5cdFx0fSxcblxuXHRcdGRlZmF1bHRTaG93RXJyb3JzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBpLCBlbGVtZW50cywgZXJyb3I7XG5cdFx0XHRmb3IgKCBpID0gMDsgdGhpcy5lcnJvckxpc3RbIGkgXTsgaSsrICkge1xuXHRcdFx0XHRlcnJvciA9IHRoaXMuZXJyb3JMaXN0WyBpIF07XG5cdFx0XHRcdGlmICggdGhpcy5zZXR0aW5ncy5oaWdobGlnaHQgKSB7XG5cdFx0XHRcdFx0dGhpcy5zZXR0aW5ncy5oaWdobGlnaHQuY2FsbCggdGhpcywgZXJyb3IuZWxlbWVudCwgdGhpcy5zZXR0aW5ncy5lcnJvckNsYXNzLCB0aGlzLnNldHRpbmdzLnZhbGlkQ2xhc3MgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNob3dMYWJlbCggZXJyb3IuZWxlbWVudCwgZXJyb3IubWVzc2FnZSApO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCB0aGlzLmVycm9yTGlzdC5sZW5ndGggKSB7XG5cdFx0XHRcdHRoaXMudG9TaG93ID0gdGhpcy50b1Nob3cuYWRkKCB0aGlzLmNvbnRhaW5lcnMgKTtcblx0XHRcdH1cblx0XHRcdGlmICggdGhpcy5zZXR0aW5ncy5zdWNjZXNzICkge1xuXHRcdFx0XHRmb3IgKCBpID0gMDsgdGhpcy5zdWNjZXNzTGlzdFsgaSBdOyBpKysgKSB7XG5cdFx0XHRcdFx0dGhpcy5zaG93TGFiZWwoIHRoaXMuc3VjY2Vzc0xpc3RbIGkgXSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHRoaXMuc2V0dGluZ3MudW5oaWdobGlnaHQgKSB7XG5cdFx0XHRcdGZvciAoIGkgPSAwLCBlbGVtZW50cyA9IHRoaXMudmFsaWRFbGVtZW50cygpOyBlbGVtZW50c1sgaSBdOyBpKysgKSB7XG5cdFx0XHRcdFx0dGhpcy5zZXR0aW5ncy51bmhpZ2hsaWdodC5jYWxsKCB0aGlzLCBlbGVtZW50c1sgaSBdLCB0aGlzLnNldHRpbmdzLmVycm9yQ2xhc3MsIHRoaXMuc2V0dGluZ3MudmFsaWRDbGFzcyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnRvSGlkZSA9IHRoaXMudG9IaWRlLm5vdCggdGhpcy50b1Nob3cgKTtcblx0XHRcdHRoaXMuaGlkZUVycm9ycygpO1xuXHRcdFx0dGhpcy5hZGRXcmFwcGVyKCB0aGlzLnRvU2hvdyApLnNob3coKTtcblx0XHR9LFxuXG5cdFx0dmFsaWRFbGVtZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jdXJyZW50RWxlbWVudHMubm90KCB0aGlzLmludmFsaWRFbGVtZW50cygpICk7XG5cdFx0fSxcblxuXHRcdGludmFsaWRFbGVtZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gJCggdGhpcy5lcnJvckxpc3QgKS5tYXAoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5lbGVtZW50O1xuXHRcdFx0fSApO1xuXHRcdH0sXG5cblx0XHRzaG93TGFiZWw6IGZ1bmN0aW9uKCBlbGVtZW50LCBtZXNzYWdlICkge1xuXHRcdFx0dmFyIHBsYWNlLCBncm91cCwgZXJyb3JJRCwgdixcblx0XHRcdFx0ZXJyb3IgPSB0aGlzLmVycm9yc0ZvciggZWxlbWVudCApLFxuXHRcdFx0XHRlbGVtZW50SUQgPSB0aGlzLmlkT3JOYW1lKCBlbGVtZW50ICksXG5cdFx0XHRcdGRlc2NyaWJlZEJ5ID0gJCggZWxlbWVudCApLmF0dHIoIFwiYXJpYS1kZXNjcmliZWRieVwiICk7XG5cblx0XHRcdGlmICggZXJyb3IubGVuZ3RoICkge1xuXG5cdFx0XHRcdC8vIFJlZnJlc2ggZXJyb3Ivc3VjY2VzcyBjbGFzc1xuXHRcdFx0XHRlcnJvci5yZW1vdmVDbGFzcyggdGhpcy5zZXR0aW5ncy52YWxpZENsYXNzICkuYWRkQ2xhc3MoIHRoaXMuc2V0dGluZ3MuZXJyb3JDbGFzcyApO1xuXG5cdFx0XHRcdC8vIFJlcGxhY2UgbWVzc2FnZSBvbiBleGlzdGluZyBsYWJlbFxuXHRcdFx0XHRlcnJvci5odG1sKCBtZXNzYWdlICk7XG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIENyZWF0ZSBlcnJvciBlbGVtZW50XG5cdFx0XHRcdGVycm9yID0gJCggXCI8XCIgKyB0aGlzLnNldHRpbmdzLmVycm9yRWxlbWVudCArIFwiPlwiIClcblx0XHRcdFx0XHQuYXR0ciggXCJpZFwiLCBlbGVtZW50SUQgKyBcIi1lcnJvclwiIClcblx0XHRcdFx0XHQuYWRkQ2xhc3MoIHRoaXMuc2V0dGluZ3MuZXJyb3JDbGFzcyApXG5cdFx0XHRcdFx0Lmh0bWwoIG1lc3NhZ2UgfHwgXCJcIiApO1xuXG5cdFx0XHRcdC8vIE1haW50YWluIHJlZmVyZW5jZSB0byB0aGUgZWxlbWVudCB0byBiZSBwbGFjZWQgaW50byB0aGUgRE9NXG5cdFx0XHRcdHBsYWNlID0gZXJyb3I7XG5cdFx0XHRcdGlmICggdGhpcy5zZXR0aW5ncy53cmFwcGVyICkge1xuXG5cdFx0XHRcdFx0Ly8gTWFrZSBzdXJlIHRoZSBlbGVtZW50IGlzIHZpc2libGUsIGV2ZW4gaW4gSUVcblx0XHRcdFx0XHQvLyBhY3R1YWxseSBzaG93aW5nIHRoZSB3cmFwcGVkIGVsZW1lbnQgaXMgaGFuZGxlZCBlbHNld2hlcmVcblx0XHRcdFx0XHRwbGFjZSA9IGVycm9yLmhpZGUoKS5zaG93KCkud3JhcCggXCI8XCIgKyB0aGlzLnNldHRpbmdzLndyYXBwZXIgKyBcIi8+XCIgKS5wYXJlbnQoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIHRoaXMubGFiZWxDb250YWluZXIubGVuZ3RoICkge1xuXHRcdFx0XHRcdHRoaXMubGFiZWxDb250YWluZXIuYXBwZW5kKCBwbGFjZSApO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCB0aGlzLnNldHRpbmdzLmVycm9yUGxhY2VtZW50ICkge1xuXHRcdFx0XHRcdHRoaXMuc2V0dGluZ3MuZXJyb3JQbGFjZW1lbnQuY2FsbCggdGhpcywgcGxhY2UsICQoIGVsZW1lbnQgKSApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHBsYWNlLmluc2VydEFmdGVyKCBlbGVtZW50ICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBMaW5rIGVycm9yIGJhY2sgdG8gdGhlIGVsZW1lbnRcblx0XHRcdFx0aWYgKCBlcnJvci5pcyggXCJsYWJlbFwiICkgKSB7XG5cblx0XHRcdFx0XHQvLyBJZiB0aGUgZXJyb3IgaXMgYSBsYWJlbCwgdGhlbiBhc3NvY2lhdGUgdXNpbmcgJ2Zvcidcblx0XHRcdFx0XHRlcnJvci5hdHRyKCBcImZvclwiLCBlbGVtZW50SUQgKTtcblxuXHRcdFx0XHRcdC8vIElmIHRoZSBlbGVtZW50IGlzIG5vdCBhIGNoaWxkIG9mIGFuIGFzc29jaWF0ZWQgbGFiZWwsIHRoZW4gaXQncyBuZWNlc3Nhcnlcblx0XHRcdFx0XHQvLyB0byBleHBsaWNpdGx5IGFwcGx5IGFyaWEtZGVzY3JpYmVkYnlcblx0XHRcdFx0fSBlbHNlIGlmICggZXJyb3IucGFyZW50cyggXCJsYWJlbFtmb3I9J1wiICsgdGhpcy5lc2NhcGVDc3NNZXRhKCBlbGVtZW50SUQgKSArIFwiJ11cIiApLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdFx0XHRlcnJvcklEID0gZXJyb3IuYXR0ciggXCJpZFwiICk7XG5cblx0XHRcdFx0XHQvLyBSZXNwZWN0IGV4aXN0aW5nIG5vbi1lcnJvciBhcmlhLWRlc2NyaWJlZGJ5XG5cdFx0XHRcdFx0aWYgKCAhZGVzY3JpYmVkQnkgKSB7XG5cdFx0XHRcdFx0XHRkZXNjcmliZWRCeSA9IGVycm9ySUQ7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICggIWRlc2NyaWJlZEJ5Lm1hdGNoKCBuZXcgUmVnRXhwKCBcIlxcXFxiXCIgKyB0aGlzLmVzY2FwZUNzc01ldGEoIGVycm9ySUQgKSArIFwiXFxcXGJcIiApICkgKSB7XG5cblx0XHRcdFx0XHRcdC8vIEFkZCB0byBlbmQgb2YgbGlzdCBpZiBub3QgYWxyZWFkeSBwcmVzZW50XG5cdFx0XHRcdFx0XHRkZXNjcmliZWRCeSArPSBcIiBcIiArIGVycm9ySUQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdCQoIGVsZW1lbnQgKS5hdHRyKCBcImFyaWEtZGVzY3JpYmVkYnlcIiwgZGVzY3JpYmVkQnkgKTtcblxuXHRcdFx0XHRcdC8vIElmIHRoaXMgZWxlbWVudCBpcyBncm91cGVkLCB0aGVuIGFzc2lnbiB0byBhbGwgZWxlbWVudHMgaW4gdGhlIHNhbWUgZ3JvdXBcblx0XHRcdFx0XHRncm91cCA9IHRoaXMuZ3JvdXBzWyBlbGVtZW50Lm5hbWUgXTtcblx0XHRcdFx0XHRpZiAoIGdyb3VwICkge1xuXHRcdFx0XHRcdFx0diA9IHRoaXM7XG5cdFx0XHRcdFx0XHQkLmVhY2goIHYuZ3JvdXBzLCBmdW5jdGlvbiggbmFtZSwgdGVzdGdyb3VwICkge1xuXHRcdFx0XHRcdFx0XHRpZiAoIHRlc3Rncm91cCA9PT0gZ3JvdXAgKSB7XG5cdFx0XHRcdFx0XHRcdFx0JCggXCJbbmFtZT0nXCIgKyB2LmVzY2FwZUNzc01ldGEoIG5hbWUgKSArIFwiJ11cIiwgdi5jdXJyZW50Rm9ybSApXG5cdFx0XHRcdFx0XHRcdFx0XHQuYXR0ciggXCJhcmlhLWRlc2NyaWJlZGJ5XCIsIGVycm9yLmF0dHIoIFwiaWRcIiApICk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICggIW1lc3NhZ2UgJiYgdGhpcy5zZXR0aW5ncy5zdWNjZXNzICkge1xuXHRcdFx0XHRlcnJvci50ZXh0KCBcIlwiICk7XG5cdFx0XHRcdGlmICggdHlwZW9mIHRoaXMuc2V0dGluZ3Muc3VjY2VzcyA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdFx0XHRlcnJvci5hZGRDbGFzcyggdGhpcy5zZXR0aW5ncy5zdWNjZXNzICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5zZXR0aW5ncy5zdWNjZXNzKCBlcnJvciwgZWxlbWVudCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnRvU2hvdyA9IHRoaXMudG9TaG93LmFkZCggZXJyb3IgKTtcblx0XHR9LFxuXG5cdFx0ZXJyb3JzRm9yOiBmdW5jdGlvbiggZWxlbWVudCApIHtcblx0XHRcdHZhciBuYW1lID0gdGhpcy5lc2NhcGVDc3NNZXRhKCB0aGlzLmlkT3JOYW1lKCBlbGVtZW50ICkgKSxcblx0XHRcdFx0ZGVzY3JpYmVyID0gJCggZWxlbWVudCApLmF0dHIoIFwiYXJpYS1kZXNjcmliZWRieVwiICksXG5cdFx0XHRcdHNlbGVjdG9yID0gXCJsYWJlbFtmb3I9J1wiICsgbmFtZSArIFwiJ10sIGxhYmVsW2Zvcj0nXCIgKyBuYW1lICsgXCInXSAqXCI7XG5cblx0XHRcdC8vICdhcmlhLWRlc2NyaWJlZGJ5JyBzaG91bGQgZGlyZWN0bHkgcmVmZXJlbmNlIHRoZSBlcnJvciBlbGVtZW50XG5cdFx0XHRpZiAoIGRlc2NyaWJlciApIHtcblx0XHRcdFx0c2VsZWN0b3IgPSBzZWxlY3RvciArIFwiLCAjXCIgKyB0aGlzLmVzY2FwZUNzc01ldGEoIGRlc2NyaWJlciApXG5cdFx0XHRcdFx0LnJlcGxhY2UoIC9cXHMrL2csIFwiLCAjXCIgKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXNcblx0XHRcdFx0LmVycm9ycygpXG5cdFx0XHRcdC5maWx0ZXIoIHNlbGVjdG9yICk7XG5cdFx0fSxcblxuXHRcdC8vIFNlZSBodHRwczovL2FwaS5qcXVlcnkuY29tL2NhdGVnb3J5L3NlbGVjdG9ycy8sIGZvciBDU1Ncblx0XHQvLyBtZXRhLWNoYXJhY3RlcnMgdGhhdCBzaG91bGQgYmUgZXNjYXBlZCBpbiBvcmRlciB0byBiZSB1c2VkIHdpdGggSlF1ZXJ5XG5cdFx0Ly8gYXMgYSBsaXRlcmFsIHBhcnQgb2YgYSBuYW1lL2lkIG9yIGFueSBzZWxlY3Rvci5cblx0XHRlc2NhcGVDc3NNZXRhOiBmdW5jdGlvbiggc3RyaW5nICkge1xuXHRcdFx0cmV0dXJuIHN0cmluZy5yZXBsYWNlKCAvKFtcXFxcIVwiIyQlJicoKSorLC4vOjs8PT4/QFxcW1xcXV5ge3x9fl0pL2csIFwiXFxcXCQxXCIgKTtcblx0XHR9LFxuXG5cdFx0aWRPck5hbWU6IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ3JvdXBzWyBlbGVtZW50Lm5hbWUgXSB8fCAoIHRoaXMuY2hlY2thYmxlKCBlbGVtZW50ICkgPyBlbGVtZW50Lm5hbWUgOiBlbGVtZW50LmlkIHx8IGVsZW1lbnQubmFtZSApO1xuXHRcdH0sXG5cblx0XHR2YWxpZGF0aW9uVGFyZ2V0Rm9yOiBmdW5jdGlvbiggZWxlbWVudCApIHtcblxuXHRcdFx0Ly8gSWYgcmFkaW8vY2hlY2tib3gsIHZhbGlkYXRlIGZpcnN0IGVsZW1lbnQgaW4gZ3JvdXAgaW5zdGVhZFxuXHRcdFx0aWYgKCB0aGlzLmNoZWNrYWJsZSggZWxlbWVudCApICkge1xuXHRcdFx0XHRlbGVtZW50ID0gdGhpcy5maW5kQnlOYW1lKCBlbGVtZW50Lm5hbWUgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQWx3YXlzIGFwcGx5IGlnbm9yZSBmaWx0ZXJcblx0XHRcdHJldHVybiAkKCBlbGVtZW50ICkubm90KCB0aGlzLnNldHRpbmdzLmlnbm9yZSApWyAwIF07XG5cdFx0fSxcblxuXHRcdGNoZWNrYWJsZTogZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG5cdFx0XHRyZXR1cm4gKCAvcmFkaW98Y2hlY2tib3gvaSApLnRlc3QoIGVsZW1lbnQudHlwZSApO1xuXHRcdH0sXG5cblx0XHRmaW5kQnlOYW1lOiBmdW5jdGlvbiggbmFtZSApIHtcblx0XHRcdHJldHVybiAkKCB0aGlzLmN1cnJlbnRGb3JtICkuZmluZCggXCJbbmFtZT0nXCIgKyB0aGlzLmVzY2FwZUNzc01ldGEoIG5hbWUgKSArIFwiJ11cIiApO1xuXHRcdH0sXG5cblx0XHRnZXRMZW5ndGg6IGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCApIHtcblx0XHRcdHN3aXRjaCAoIGVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSApIHtcblx0XHRcdGNhc2UgXCJzZWxlY3RcIjpcblx0XHRcdFx0cmV0dXJuICQoIFwib3B0aW9uOnNlbGVjdGVkXCIsIGVsZW1lbnQgKS5sZW5ndGg7XG5cdFx0XHRjYXNlIFwiaW5wdXRcIjpcblx0XHRcdFx0aWYgKCB0aGlzLmNoZWNrYWJsZSggZWxlbWVudCApICkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmZpbmRCeU5hbWUoIGVsZW1lbnQubmFtZSApLmZpbHRlciggXCI6Y2hlY2tlZFwiICkubGVuZ3RoO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdmFsdWUubGVuZ3RoO1xuXHRcdH0sXG5cblx0XHRkZXBlbmQ6IGZ1bmN0aW9uKCBwYXJhbSwgZWxlbWVudCApIHtcblx0XHRcdHJldHVybiB0aGlzLmRlcGVuZFR5cGVzWyB0eXBlb2YgcGFyYW0gXSA/IHRoaXMuZGVwZW5kVHlwZXNbIHR5cGVvZiBwYXJhbSBdKCBwYXJhbSwgZWxlbWVudCApIDogdHJ1ZTtcblx0XHR9LFxuXG5cdFx0ZGVwZW5kVHlwZXM6IHtcblx0XHRcdFwiYm9vbGVhblwiOiBmdW5jdGlvbiggcGFyYW0gKSB7XG5cdFx0XHRcdHJldHVybiBwYXJhbTtcblx0XHRcdH0sXG5cdFx0XHRcInN0cmluZ1wiOiBmdW5jdGlvbiggcGFyYW0sIGVsZW1lbnQgKSB7XG5cdFx0XHRcdHJldHVybiAhISQoIHBhcmFtLCBlbGVtZW50LmZvcm0gKS5sZW5ndGg7XG5cdFx0XHR9LFxuXHRcdFx0XCJmdW5jdGlvblwiOiBmdW5jdGlvbiggcGFyYW0sIGVsZW1lbnQgKSB7XG5cdFx0XHRcdHJldHVybiBwYXJhbSggZWxlbWVudCApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRvcHRpb25hbDogZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG5cdFx0XHR2YXIgdmFsID0gdGhpcy5lbGVtZW50VmFsdWUoIGVsZW1lbnQgKTtcblx0XHRcdHJldHVybiAhJC52YWxpZGF0b3IubWV0aG9kcy5yZXF1aXJlZC5jYWxsKCB0aGlzLCB2YWwsIGVsZW1lbnQgKSAmJiBcImRlcGVuZGVuY3ktbWlzbWF0Y2hcIjtcblx0XHR9LFxuXG5cdFx0c3RhcnRSZXF1ZXN0OiBmdW5jdGlvbiggZWxlbWVudCApIHtcblx0XHRcdGlmICggIXRoaXMucGVuZGluZ1sgZWxlbWVudC5uYW1lIF0gKSB7XG5cdFx0XHRcdHRoaXMucGVuZGluZ1JlcXVlc3QrKztcblx0XHRcdFx0JCggZWxlbWVudCApLmFkZENsYXNzKCB0aGlzLnNldHRpbmdzLnBlbmRpbmdDbGFzcyApO1xuXHRcdFx0XHR0aGlzLnBlbmRpbmdbIGVsZW1lbnQubmFtZSBdID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0c3RvcFJlcXVlc3Q6IGZ1bmN0aW9uKCBlbGVtZW50LCB2YWxpZCApIHtcblx0XHRcdHRoaXMucGVuZGluZ1JlcXVlc3QtLTtcblxuXHRcdFx0Ly8gU29tZXRpbWVzIHN5bmNocm9uaXphdGlvbiBmYWlscywgbWFrZSBzdXJlIHBlbmRpbmdSZXF1ZXN0IGlzIG5ldmVyIDwgMFxuXHRcdFx0aWYgKCB0aGlzLnBlbmRpbmdSZXF1ZXN0IDwgMCApIHtcblx0XHRcdFx0dGhpcy5wZW5kaW5nUmVxdWVzdCA9IDA7XG5cdFx0XHR9XG5cdFx0XHRkZWxldGUgdGhpcy5wZW5kaW5nWyBlbGVtZW50Lm5hbWUgXTtcblx0XHRcdCQoIGVsZW1lbnQgKS5yZW1vdmVDbGFzcyggdGhpcy5zZXR0aW5ncy5wZW5kaW5nQ2xhc3MgKTtcblx0XHRcdGlmICggdmFsaWQgJiYgdGhpcy5wZW5kaW5nUmVxdWVzdCA9PT0gMCAmJiB0aGlzLmZvcm1TdWJtaXR0ZWQgJiYgdGhpcy5mb3JtKCkgKSB7XG5cdFx0XHRcdCQoIHRoaXMuY3VycmVudEZvcm0gKS5zdWJtaXQoKTtcblxuXHRcdFx0XHQvLyBSZW1vdmUgdGhlIGhpZGRlbiBpbnB1dCB0aGF0IHdhcyB1c2VkIGFzIGEgcmVwbGFjZW1lbnQgZm9yIHRoZVxuXHRcdFx0XHQvLyBtaXNzaW5nIHN1Ym1pdCBidXR0b24uIFRoZSBoaWRkZW4gaW5wdXQgaXMgYWRkZWQgYnkgYGhhbmRsZSgpYFxuXHRcdFx0XHQvLyB0byBlbnN1cmUgdGhhdCB0aGUgdmFsdWUgb2YgdGhlIHVzZWQgc3VibWl0IGJ1dHRvbiBpcyBwYXNzZWQgb25cblx0XHRcdFx0Ly8gZm9yIHNjcmlwdGVkIHN1Ym1pdHMgdHJpZ2dlcmVkIGJ5IHRoaXMgbWV0aG9kXG5cdFx0XHRcdGlmICggdGhpcy5zdWJtaXRCdXR0b24gKSB7XG5cdFx0XHRcdFx0JCggXCJpbnB1dDpoaWRkZW5bbmFtZT0nXCIgKyB0aGlzLnN1Ym1pdEJ1dHRvbi5uYW1lICsgXCInXVwiLCB0aGlzLmN1cnJlbnRGb3JtICkucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLmZvcm1TdWJtaXR0ZWQgPSBmYWxzZTtcblx0XHRcdH0gZWxzZSBpZiAoICF2YWxpZCAmJiB0aGlzLnBlbmRpbmdSZXF1ZXN0ID09PSAwICYmIHRoaXMuZm9ybVN1Ym1pdHRlZCApIHtcblx0XHRcdFx0JCggdGhpcy5jdXJyZW50Rm9ybSApLnRyaWdnZXJIYW5kbGVyKCBcImludmFsaWQtZm9ybVwiLCBbIHRoaXMgXSApO1xuXHRcdFx0XHR0aGlzLmZvcm1TdWJtaXR0ZWQgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0cHJldmlvdXNWYWx1ZTogZnVuY3Rpb24oIGVsZW1lbnQsIG1ldGhvZCApIHtcblx0XHRcdG1ldGhvZCA9IHR5cGVvZiBtZXRob2QgPT09IFwic3RyaW5nXCIgJiYgbWV0aG9kIHx8IFwicmVtb3RlXCI7XG5cblx0XHRcdHJldHVybiAkLmRhdGEoIGVsZW1lbnQsIFwicHJldmlvdXNWYWx1ZVwiICkgfHwgJC5kYXRhKCBlbGVtZW50LCBcInByZXZpb3VzVmFsdWVcIiwge1xuXHRcdFx0XHRvbGQ6IG51bGwsXG5cdFx0XHRcdHZhbGlkOiB0cnVlLFxuXHRcdFx0XHRtZXNzYWdlOiB0aGlzLmRlZmF1bHRNZXNzYWdlKCBlbGVtZW50LCB7IG1ldGhvZDogbWV0aG9kIH0gKVxuXHRcdFx0fSApO1xuXHRcdH0sXG5cblx0XHQvLyBDbGVhbnMgdXAgYWxsIGZvcm1zIGFuZCBlbGVtZW50cywgcmVtb3ZlcyB2YWxpZGF0b3Itc3BlY2lmaWMgZXZlbnRzXG5cdFx0ZGVzdHJveTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnJlc2V0Rm9ybSgpO1xuXG5cdFx0XHQkKCB0aGlzLmN1cnJlbnRGb3JtIClcblx0XHRcdFx0Lm9mZiggXCIudmFsaWRhdGVcIiApXG5cdFx0XHRcdC5yZW1vdmVEYXRhKCBcInZhbGlkYXRvclwiIClcblx0XHRcdFx0LmZpbmQoIFwiLnZhbGlkYXRlLWVxdWFsVG8tYmx1clwiIClcblx0XHRcdFx0XHQub2ZmKCBcIi52YWxpZGF0ZS1lcXVhbFRvXCIgKVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcyggXCJ2YWxpZGF0ZS1lcXVhbFRvLWJsdXJcIiApXG5cdFx0XHRcdC5maW5kKCBcIi52YWxpZGF0ZS1sZXNzVGhhbi1ibHVyXCIgKVxuXHRcdFx0XHRcdC5vZmYoIFwiLnZhbGlkYXRlLWxlc3NUaGFuXCIgKVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcyggXCJ2YWxpZGF0ZS1sZXNzVGhhbi1ibHVyXCIgKVxuXHRcdFx0XHQuZmluZCggXCIudmFsaWRhdGUtbGVzc1RoYW5FcXVhbC1ibHVyXCIgKVxuXHRcdFx0XHRcdC5vZmYoIFwiLnZhbGlkYXRlLWxlc3NUaGFuRXF1YWxcIiApXG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCBcInZhbGlkYXRlLWxlc3NUaGFuRXF1YWwtYmx1clwiIClcblx0XHRcdFx0LmZpbmQoIFwiLnZhbGlkYXRlLWdyZWF0ZXJUaGFuRXF1YWwtYmx1clwiIClcblx0XHRcdFx0XHQub2ZmKCBcIi52YWxpZGF0ZS1ncmVhdGVyVGhhbkVxdWFsXCIgKVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcyggXCJ2YWxpZGF0ZS1ncmVhdGVyVGhhbkVxdWFsLWJsdXJcIiApXG5cdFx0XHRcdC5maW5kKCBcIi52YWxpZGF0ZS1ncmVhdGVyVGhhbi1ibHVyXCIgKVxuXHRcdFx0XHRcdC5vZmYoIFwiLnZhbGlkYXRlLWdyZWF0ZXJUaGFuXCIgKVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcyggXCJ2YWxpZGF0ZS1ncmVhdGVyVGhhbi1ibHVyXCIgKTtcblx0XHR9XG5cblx0fSxcblxuXHRjbGFzc1J1bGVTZXR0aW5nczoge1xuXHRcdHJlcXVpcmVkOiB7IHJlcXVpcmVkOiB0cnVlIH0sXG5cdFx0ZW1haWw6IHsgZW1haWw6IHRydWUgfSxcblx0XHR1cmw6IHsgdXJsOiB0cnVlIH0sXG5cdFx0ZGF0ZTogeyBkYXRlOiB0cnVlIH0sXG5cdFx0ZGF0ZUlTTzogeyBkYXRlSVNPOiB0cnVlIH0sXG5cdFx0bnVtYmVyOiB7IG51bWJlcjogdHJ1ZSB9LFxuXHRcdGRpZ2l0czogeyBkaWdpdHM6IHRydWUgfSxcblx0XHRjcmVkaXRjYXJkOiB7IGNyZWRpdGNhcmQ6IHRydWUgfVxuXHR9LFxuXG5cdGFkZENsYXNzUnVsZXM6IGZ1bmN0aW9uKCBjbGFzc05hbWUsIHJ1bGVzICkge1xuXHRcdGlmICggY2xhc3NOYW1lLmNvbnN0cnVjdG9yID09PSBTdHJpbmcgKSB7XG5cdFx0XHR0aGlzLmNsYXNzUnVsZVNldHRpbmdzWyBjbGFzc05hbWUgXSA9IHJ1bGVzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkLmV4dGVuZCggdGhpcy5jbGFzc1J1bGVTZXR0aW5ncywgY2xhc3NOYW1lICk7XG5cdFx0fVxuXHR9LFxuXG5cdGNsYXNzUnVsZXM6IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuXHRcdHZhciBydWxlcyA9IHt9LFxuXHRcdFx0Y2xhc3NlcyA9ICQoIGVsZW1lbnQgKS5hdHRyKCBcImNsYXNzXCIgKTtcblxuXHRcdGlmICggY2xhc3NlcyApIHtcblx0XHRcdCQuZWFjaCggY2xhc3Nlcy5zcGxpdCggXCIgXCIgKSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggdGhpcyBpbiAkLnZhbGlkYXRvci5jbGFzc1J1bGVTZXR0aW5ncyApIHtcblx0XHRcdFx0XHQkLmV4dGVuZCggcnVsZXMsICQudmFsaWRhdG9yLmNsYXNzUnVsZVNldHRpbmdzWyB0aGlzIF0gKTtcblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXHRcdH1cblx0XHRyZXR1cm4gcnVsZXM7XG5cdH0sXG5cblx0bm9ybWFsaXplQXR0cmlidXRlUnVsZTogZnVuY3Rpb24oIHJ1bGVzLCB0eXBlLCBtZXRob2QsIHZhbHVlICkge1xuXG5cdFx0Ly8gQ29udmVydCB0aGUgdmFsdWUgdG8gYSBudW1iZXIgZm9yIG51bWJlciBpbnB1dHMsIGFuZCBmb3IgdGV4dCBmb3IgYmFja3dhcmRzIGNvbXBhYmlsaXR5XG5cdFx0Ly8gYWxsb3dzIHR5cGU9XCJkYXRlXCIgYW5kIG90aGVycyB0byBiZSBjb21wYXJlZCBhcyBzdHJpbmdzXG5cdFx0aWYgKCAvbWlufG1heHxzdGVwLy50ZXN0KCBtZXRob2QgKSAmJiAoIHR5cGUgPT09IG51bGwgfHwgL251bWJlcnxyYW5nZXx0ZXh0Ly50ZXN0KCB0eXBlICkgKSApIHtcblx0XHRcdHZhbHVlID0gTnVtYmVyKCB2YWx1ZSApO1xuXG5cdFx0XHQvLyBTdXBwb3J0IE9wZXJhIE1pbmksIHdoaWNoIHJldHVybnMgTmFOIGZvciB1bmRlZmluZWQgbWlubGVuZ3RoXG5cdFx0XHRpZiAoIGlzTmFOKCB2YWx1ZSApICkge1xuXHRcdFx0XHR2YWx1ZSA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIHZhbHVlIHx8IHZhbHVlID09PSAwICkge1xuXHRcdFx0cnVsZXNbIG1ldGhvZCBdID0gdmFsdWU7XG5cdFx0fSBlbHNlIGlmICggdHlwZSA9PT0gbWV0aG9kICYmIHR5cGUgIT09IFwicmFuZ2VcIiApIHtcblxuXHRcdFx0Ly8gRXhjZXB0aW9uOiB0aGUganF1ZXJ5IHZhbGlkYXRlICdyYW5nZScgbWV0aG9kXG5cdFx0XHQvLyBkb2VzIG5vdCB0ZXN0IGZvciB0aGUgaHRtbDUgJ3JhbmdlJyB0eXBlXG5cdFx0XHRydWxlc1sgbWV0aG9kIF0gPSB0cnVlO1xuXHRcdH1cblx0fSxcblxuXHRhdHRyaWJ1dGVSdWxlczogZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG5cdFx0dmFyIHJ1bGVzID0ge30sXG5cdFx0XHQkZWxlbWVudCA9ICQoIGVsZW1lbnQgKSxcblx0XHRcdHR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSggXCJ0eXBlXCIgKSxcblx0XHRcdG1ldGhvZCwgdmFsdWU7XG5cblx0XHRmb3IgKCBtZXRob2QgaW4gJC52YWxpZGF0b3IubWV0aG9kcyApIHtcblxuXHRcdFx0Ly8gU3VwcG9ydCBmb3IgPGlucHV0IHJlcXVpcmVkPiBpbiBib3RoIGh0bWw1IGFuZCBvbGRlciBicm93c2Vyc1xuXHRcdFx0aWYgKCBtZXRob2QgPT09IFwicmVxdWlyZWRcIiApIHtcblx0XHRcdFx0dmFsdWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSggbWV0aG9kICk7XG5cblx0XHRcdFx0Ly8gU29tZSBicm93c2VycyByZXR1cm4gYW4gZW1wdHkgc3RyaW5nIGZvciB0aGUgcmVxdWlyZWQgYXR0cmlidXRlXG5cdFx0XHRcdC8vIGFuZCBub24tSFRNTDUgYnJvd3NlcnMgbWlnaHQgaGF2ZSByZXF1aXJlZD1cIlwiIG1hcmt1cFxuXHRcdFx0XHRpZiAoIHZhbHVlID09PSBcIlwiICkge1xuXHRcdFx0XHRcdHZhbHVlID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIEZvcmNlIG5vbi1IVE1MNSBicm93c2VycyB0byByZXR1cm4gYm9vbFxuXHRcdFx0XHR2YWx1ZSA9ICEhdmFsdWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YWx1ZSA9ICRlbGVtZW50LmF0dHIoIG1ldGhvZCApO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLm5vcm1hbGl6ZUF0dHJpYnV0ZVJ1bGUoIHJ1bGVzLCB0eXBlLCBtZXRob2QsIHZhbHVlICk7XG5cdFx0fVxuXG5cdFx0Ly8gJ21heGxlbmd0aCcgbWF5IGJlIHJldHVybmVkIGFzIC0xLCAyMTQ3NDgzNjQ3ICggSUUgKSBhbmQgNTI0Mjg4ICggc2FmYXJpICkgZm9yIHRleHQgaW5wdXRzXG5cdFx0aWYgKCBydWxlcy5tYXhsZW5ndGggJiYgLy0xfDIxNDc0ODM2NDd8NTI0Mjg4Ly50ZXN0KCBydWxlcy5tYXhsZW5ndGggKSApIHtcblx0XHRcdGRlbGV0ZSBydWxlcy5tYXhsZW5ndGg7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJ1bGVzO1xuXHR9LFxuXG5cdGRhdGFSdWxlczogZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG5cdFx0dmFyIHJ1bGVzID0ge30sXG5cdFx0XHQkZWxlbWVudCA9ICQoIGVsZW1lbnQgKSxcblx0XHRcdHR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSggXCJ0eXBlXCIgKSxcblx0XHRcdG1ldGhvZCwgdmFsdWU7XG5cblx0XHRmb3IgKCBtZXRob2QgaW4gJC52YWxpZGF0b3IubWV0aG9kcyApIHtcblx0XHRcdHZhbHVlID0gJGVsZW1lbnQuZGF0YSggXCJydWxlXCIgKyBtZXRob2QuY2hhckF0KCAwICkudG9VcHBlckNhc2UoKSArIG1ldGhvZC5zdWJzdHJpbmcoIDEgKS50b0xvd2VyQ2FzZSgpICk7XG5cblx0XHRcdC8vIENhc3QgZW1wdHkgYXR0cmlidXRlcyBsaWtlIGBkYXRhLXJ1bGUtcmVxdWlyZWRgIHRvIGB0cnVlYFxuXHRcdFx0aWYgKCB2YWx1ZSA9PT0gXCJcIiApIHtcblx0XHRcdFx0dmFsdWUgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLm5vcm1hbGl6ZUF0dHJpYnV0ZVJ1bGUoIHJ1bGVzLCB0eXBlLCBtZXRob2QsIHZhbHVlICk7XG5cdFx0fVxuXHRcdHJldHVybiBydWxlcztcblx0fSxcblxuXHRzdGF0aWNSdWxlczogZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG5cdFx0dmFyIHJ1bGVzID0ge30sXG5cdFx0XHR2YWxpZGF0b3IgPSAkLmRhdGEoIGVsZW1lbnQuZm9ybSwgXCJ2YWxpZGF0b3JcIiApO1xuXG5cdFx0aWYgKCB2YWxpZGF0b3Iuc2V0dGluZ3MucnVsZXMgKSB7XG5cdFx0XHRydWxlcyA9ICQudmFsaWRhdG9yLm5vcm1hbGl6ZVJ1bGUoIHZhbGlkYXRvci5zZXR0aW5ncy5ydWxlc1sgZWxlbWVudC5uYW1lIF0gKSB8fCB7fTtcblx0XHR9XG5cdFx0cmV0dXJuIHJ1bGVzO1xuXHR9LFxuXG5cdG5vcm1hbGl6ZVJ1bGVzOiBmdW5jdGlvbiggcnVsZXMsIGVsZW1lbnQgKSB7XG5cblx0XHQvLyBIYW5kbGUgZGVwZW5kZW5jeSBjaGVja1xuXHRcdCQuZWFjaCggcnVsZXMsIGZ1bmN0aW9uKCBwcm9wLCB2YWwgKSB7XG5cblx0XHRcdC8vIElnbm9yZSBydWxlIHdoZW4gcGFyYW0gaXMgZXhwbGljaXRseSBmYWxzZSwgZWcuIHJlcXVpcmVkOmZhbHNlXG5cdFx0XHRpZiAoIHZhbCA9PT0gZmFsc2UgKSB7XG5cdFx0XHRcdGRlbGV0ZSBydWxlc1sgcHJvcCBdO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAoIHZhbC5wYXJhbSB8fCB2YWwuZGVwZW5kcyApIHtcblx0XHRcdFx0dmFyIGtlZXBSdWxlID0gdHJ1ZTtcblx0XHRcdFx0c3dpdGNoICggdHlwZW9mIHZhbC5kZXBlbmRzICkge1xuXHRcdFx0XHRjYXNlIFwic3RyaW5nXCI6XG5cdFx0XHRcdFx0a2VlcFJ1bGUgPSAhISQoIHZhbC5kZXBlbmRzLCBlbGVtZW50LmZvcm0gKS5sZW5ndGg7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJmdW5jdGlvblwiOlxuXHRcdFx0XHRcdGtlZXBSdWxlID0gdmFsLmRlcGVuZHMuY2FsbCggZWxlbWVudCwgZWxlbWVudCApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICgga2VlcFJ1bGUgKSB7XG5cdFx0XHRcdFx0cnVsZXNbIHByb3AgXSA9IHZhbC5wYXJhbSAhPT0gdW5kZWZpbmVkID8gdmFsLnBhcmFtIDogdHJ1ZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkLmRhdGEoIGVsZW1lbnQuZm9ybSwgXCJ2YWxpZGF0b3JcIiApLnJlc2V0RWxlbWVudHMoICQoIGVsZW1lbnQgKSApO1xuXHRcdFx0XHRcdGRlbGV0ZSBydWxlc1sgcHJvcCBdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSApO1xuXG5cdFx0Ly8gRXZhbHVhdGUgcGFyYW1ldGVyc1xuXHRcdCQuZWFjaCggcnVsZXMsIGZ1bmN0aW9uKCBydWxlLCBwYXJhbWV0ZXIgKSB7XG5cdFx0XHRydWxlc1sgcnVsZSBdID0gJC5pc0Z1bmN0aW9uKCBwYXJhbWV0ZXIgKSAmJiBydWxlICE9PSBcIm5vcm1hbGl6ZXJcIiA/IHBhcmFtZXRlciggZWxlbWVudCApIDogcGFyYW1ldGVyO1xuXHRcdH0gKTtcblxuXHRcdC8vIENsZWFuIG51bWJlciBwYXJhbWV0ZXJzXG5cdFx0JC5lYWNoKCBbIFwibWlubGVuZ3RoXCIsIFwibWF4bGVuZ3RoXCIgXSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHJ1bGVzWyB0aGlzIF0gKSB7XG5cdFx0XHRcdHJ1bGVzWyB0aGlzIF0gPSBOdW1iZXIoIHJ1bGVzWyB0aGlzIF0gKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdFx0JC5lYWNoKCBbIFwicmFuZ2VsZW5ndGhcIiwgXCJyYW5nZVwiIF0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHBhcnRzO1xuXHRcdFx0aWYgKCBydWxlc1sgdGhpcyBdICkge1xuXHRcdFx0XHRpZiAoICQuaXNBcnJheSggcnVsZXNbIHRoaXMgXSApICkge1xuXHRcdFx0XHRcdHJ1bGVzWyB0aGlzIF0gPSBbIE51bWJlciggcnVsZXNbIHRoaXMgXVsgMCBdICksIE51bWJlciggcnVsZXNbIHRoaXMgXVsgMSBdICkgXTtcblx0XHRcdFx0fSBlbHNlIGlmICggdHlwZW9mIHJ1bGVzWyB0aGlzIF0gPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRcdFx0cGFydHMgPSBydWxlc1sgdGhpcyBdLnJlcGxhY2UoIC9bXFxbXFxdXS9nLCBcIlwiICkuc3BsaXQoIC9bXFxzLF0rLyApO1xuXHRcdFx0XHRcdHJ1bGVzWyB0aGlzIF0gPSBbIE51bWJlciggcGFydHNbIDAgXSApLCBOdW1iZXIoIHBhcnRzWyAxIF0gKSBdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSApO1xuXG5cdFx0aWYgKCAkLnZhbGlkYXRvci5hdXRvQ3JlYXRlUmFuZ2VzICkge1xuXG5cdFx0XHQvLyBBdXRvLWNyZWF0ZSByYW5nZXNcblx0XHRcdGlmICggcnVsZXMubWluICE9IG51bGwgJiYgcnVsZXMubWF4ICE9IG51bGwgKSB7XG5cdFx0XHRcdHJ1bGVzLnJhbmdlID0gWyBydWxlcy5taW4sIHJ1bGVzLm1heCBdO1xuXHRcdFx0XHRkZWxldGUgcnVsZXMubWluO1xuXHRcdFx0XHRkZWxldGUgcnVsZXMubWF4O1xuXHRcdFx0fVxuXHRcdFx0aWYgKCBydWxlcy5taW5sZW5ndGggIT0gbnVsbCAmJiBydWxlcy5tYXhsZW5ndGggIT0gbnVsbCApIHtcblx0XHRcdFx0cnVsZXMucmFuZ2VsZW5ndGggPSBbIHJ1bGVzLm1pbmxlbmd0aCwgcnVsZXMubWF4bGVuZ3RoIF07XG5cdFx0XHRcdGRlbGV0ZSBydWxlcy5taW5sZW5ndGg7XG5cdFx0XHRcdGRlbGV0ZSBydWxlcy5tYXhsZW5ndGg7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJ1bGVzO1xuXHR9LFxuXG5cdC8vIENvbnZlcnRzIGEgc2ltcGxlIHN0cmluZyB0byBhIHtzdHJpbmc6IHRydWV9IHJ1bGUsIGUuZy4sIFwicmVxdWlyZWRcIiB0byB7cmVxdWlyZWQ6dHJ1ZX1cblx0bm9ybWFsaXplUnVsZTogZnVuY3Rpb24oIGRhdGEgKSB7XG5cdFx0aWYgKCB0eXBlb2YgZGF0YSA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdHZhciB0cmFuc2Zvcm1lZCA9IHt9O1xuXHRcdFx0JC5lYWNoKCBkYXRhLnNwbGl0KCAvXFxzLyApLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dHJhbnNmb3JtZWRbIHRoaXMgXSA9IHRydWU7XG5cdFx0XHR9ICk7XG5cdFx0XHRkYXRhID0gdHJhbnNmb3JtZWQ7XG5cdFx0fVxuXHRcdHJldHVybiBkYXRhO1xuXHR9LFxuXG5cdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvalF1ZXJ5LnZhbGlkYXRvci5hZGRNZXRob2QvXG5cdGFkZE1ldGhvZDogZnVuY3Rpb24oIG5hbWUsIG1ldGhvZCwgbWVzc2FnZSApIHtcblx0XHQkLnZhbGlkYXRvci5tZXRob2RzWyBuYW1lIF0gPSBtZXRob2Q7XG5cdFx0JC52YWxpZGF0b3IubWVzc2FnZXNbIG5hbWUgXSA9IG1lc3NhZ2UgIT09IHVuZGVmaW5lZCA/IG1lc3NhZ2UgOiAkLnZhbGlkYXRvci5tZXNzYWdlc1sgbmFtZSBdO1xuXHRcdGlmICggbWV0aG9kLmxlbmd0aCA8IDMgKSB7XG5cdFx0XHQkLnZhbGlkYXRvci5hZGRDbGFzc1J1bGVzKCBuYW1lLCAkLnZhbGlkYXRvci5ub3JtYWxpemVSdWxlKCBuYW1lICkgKTtcblx0XHR9XG5cdH0sXG5cblx0Ly8gaHR0cHM6Ly9qcXVlcnl2YWxpZGF0aW9uLm9yZy9qUXVlcnkudmFsaWRhdG9yLm1ldGhvZHMvXG5cdG1ldGhvZHM6IHtcblxuXHRcdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvcmVxdWlyZWQtbWV0aG9kL1xuXHRcdHJlcXVpcmVkOiBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQsIHBhcmFtICkge1xuXG5cdFx0XHQvLyBDaGVjayBpZiBkZXBlbmRlbmN5IGlzIG1ldFxuXHRcdFx0aWYgKCAhdGhpcy5kZXBlbmQoIHBhcmFtLCBlbGVtZW50ICkgKSB7XG5cdFx0XHRcdHJldHVybiBcImRlcGVuZGVuY3ktbWlzbWF0Y2hcIjtcblx0XHRcdH1cblx0XHRcdGlmICggZWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcInNlbGVjdFwiICkge1xuXG5cdFx0XHRcdC8vIENvdWxkIGJlIGFuIGFycmF5IGZvciBzZWxlY3QtbXVsdGlwbGUgb3IgYSBzdHJpbmcsIGJvdGggYXJlIGZpbmUgdGhpcyB3YXlcblx0XHRcdFx0dmFyIHZhbCA9ICQoIGVsZW1lbnQgKS52YWwoKTtcblx0XHRcdFx0cmV0dXJuIHZhbCAmJiB2YWwubGVuZ3RoID4gMDtcblx0XHRcdH1cblx0XHRcdGlmICggdGhpcy5jaGVja2FibGUoIGVsZW1lbnQgKSApIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0TGVuZ3RoKCB2YWx1ZSwgZWxlbWVudCApID4gMDtcblx0XHRcdH1cblx0XHRcdHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlLmxlbmd0aCA+IDA7XG5cdFx0fSxcblxuXHRcdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvZW1haWwtbWV0aG9kL1xuXHRcdGVtYWlsOiBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XG5cblx0XHRcdC8vIEZyb20gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvZm9ybXMuaHRtbCN2YWxpZC1lLW1haWwtYWRkcmVzc1xuXHRcdFx0Ly8gUmV0cmlldmVkIDIwMTQtMDEtMTRcblx0XHRcdC8vIElmIHlvdSBoYXZlIGEgcHJvYmxlbSB3aXRoIHRoaXMgaW1wbGVtZW50YXRpb24sIHJlcG9ydCBhIGJ1ZyBhZ2FpbnN0IHRoZSBhYm92ZSBzcGVjXG5cdFx0XHQvLyBPciB1c2UgY3VzdG9tIG1ldGhvZHMgdG8gaW1wbGVtZW50IHlvdXIgb3duIGVtYWlsIHZhbGlkYXRpb25cblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgL15bYS16QS1aMC05LiEjJCUmJyorXFwvPT9eX2B7fH1+LV0rQFthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykqJC8udGVzdCggdmFsdWUgKTtcblx0XHR9LFxuXG5cdFx0Ly8gaHR0cHM6Ly9qcXVlcnl2YWxpZGF0aW9uLm9yZy91cmwtbWV0aG9kL1xuXHRcdHVybDogZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xuXG5cdFx0XHQvLyBDb3B5cmlnaHQgKGMpIDIwMTAtMjAxMyBEaWVnbyBQZXJpbmksIE1JVCBsaWNlbnNlZFxuXHRcdFx0Ly8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZHBlcmluaS83MjkyOTRcblx0XHRcdC8vIHNlZSBhbHNvIGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9kZW1vL3VybC1yZWdleFxuXHRcdFx0Ly8gbW9kaWZpZWQgdG8gYWxsb3cgcHJvdG9jb2wtcmVsYXRpdmUgVVJMc1xuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCAvXig/Oig/Oig/Omh0dHBzP3xmdHApOik/XFwvXFwvKSg/OlxcUysoPzo6XFxTKik/QCk/KD86KD8hKD86MTB8MTI3KSg/OlxcLlxcZHsxLDN9KXszfSkoPyEoPzoxNjlcXC4yNTR8MTkyXFwuMTY4KSg/OlxcLlxcZHsxLDN9KXsyfSkoPyExNzJcXC4oPzoxWzYtOV18MlxcZHwzWzAtMV0pKD86XFwuXFxkezEsM30pezJ9KSg/OlsxLTldXFxkP3wxXFxkXFxkfDJbMDFdXFxkfDIyWzAtM10pKD86XFwuKD86MT9cXGR7MSwyfXwyWzAtNF1cXGR8MjVbMC01XSkpezJ9KD86XFwuKD86WzEtOV1cXGQ/fDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNF0pKXwoPzooPzpbYS16XFx1MDBhMS1cXHVmZmZmMC05XS0qKSpbYS16XFx1MDBhMS1cXHVmZmZmMC05XSspKD86XFwuKD86W2EtelxcdTAwYTEtXFx1ZmZmZjAtOV0tKikqW2EtelxcdTAwYTEtXFx1ZmZmZjAtOV0rKSooPzpcXC4oPzpbYS16XFx1MDBhMS1cXHVmZmZmXXsyLH0pKS4/KSg/OjpcXGR7Miw1fSk/KD86Wy8/I11cXFMqKT8kL2kudGVzdCggdmFsdWUgKTtcblx0XHR9LFxuXG5cdFx0Ly8gaHR0cHM6Ly9qcXVlcnl2YWxpZGF0aW9uLm9yZy9kYXRlLW1ldGhvZC9cblx0XHRkYXRlOiAoIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGNhbGxlZCA9IGZhbHNlO1xuXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xuXHRcdFx0XHRpZiAoICFjYWxsZWQgKSB7XG5cdFx0XHRcdFx0Y2FsbGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRpZiAoIHRoaXMuc2V0dGluZ3MuZGVidWcgJiYgd2luZG93LmNvbnNvbGUgKSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHRcdFx0XHRcdFwiVGhlIGBkYXRlYCBtZXRob2QgaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gJzIuMC4wJy5cXG5cIiArXG5cdFx0XHRcdFx0XHRcdFwiUGxlYXNlIGRvbid0IHVzZSBpdCwgc2luY2UgaXQgcmVsaWVzIG9uIHRoZSBEYXRlIGNvbnN0cnVjdG9yLCB3aGljaFxcblwiICtcblx0XHRcdFx0XHRcdFx0XCJiZWhhdmVzIHZlcnkgZGlmZmVyZW50bHkgYWNyb3NzIGJyb3dzZXJzIGFuZCBsb2NhbGVzLiBVc2UgYGRhdGVJU09gXFxuXCIgK1xuXHRcdFx0XHRcdFx0XHRcImluc3RlYWQgb3Igb25lIG9mIHRoZSBsb2NhbGUgc3BlY2lmaWMgbWV0aG9kcyBpbiBgbG9jYWxpemF0aW9ucy9gXFxuXCIgK1xuXHRcdFx0XHRcdFx0XHRcImFuZCBgYWRkaXRpb25hbC1tZXRob2RzLmpzYC5cIlxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8ICEvSW52YWxpZHxOYU4vLnRlc3QoIG5ldyBEYXRlKCB2YWx1ZSApLnRvU3RyaW5nKCkgKTtcblx0XHRcdH07XG5cdFx0fSgpICksXG5cblx0XHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL2RhdGVJU08tbWV0aG9kL1xuXHRcdGRhdGVJU086IGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCApIHtcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgL15cXGR7NH1bXFwvXFwtXSgwP1sxLTldfDFbMDEyXSlbXFwvXFwtXSgwP1sxLTldfFsxMl1bMC05XXwzWzAxXSkkLy50ZXN0KCB2YWx1ZSApO1xuXHRcdH0sXG5cblx0XHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL251bWJlci1tZXRob2QvXG5cdFx0bnVtYmVyOiBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IC9eKD86LT9cXGQrfC0/XFxkezEsM30oPzosXFxkezN9KSspPyg/OlxcLlxcZCspPyQvLnRlc3QoIHZhbHVlICk7XG5cdFx0fSxcblxuXHRcdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvZGlnaXRzLW1ldGhvZC9cblx0XHRkaWdpdHM6IGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCApIHtcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgL15cXGQrJC8udGVzdCggdmFsdWUgKTtcblx0XHR9LFxuXG5cdFx0Ly8gaHR0cHM6Ly9qcXVlcnl2YWxpZGF0aW9uLm9yZy9taW5sZW5ndGgtbWV0aG9kL1xuXHRcdG1pbmxlbmd0aDogZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50LCBwYXJhbSApIHtcblx0XHRcdHZhciBsZW5ndGggPSAkLmlzQXJyYXkoIHZhbHVlICkgPyB2YWx1ZS5sZW5ndGggOiB0aGlzLmdldExlbmd0aCggdmFsdWUsIGVsZW1lbnQgKTtcblx0XHRcdHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgbGVuZ3RoID49IHBhcmFtO1xuXHRcdH0sXG5cblx0XHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL21heGxlbmd0aC1tZXRob2QvXG5cdFx0bWF4bGVuZ3RoOiBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQsIHBhcmFtICkge1xuXHRcdFx0dmFyIGxlbmd0aCA9ICQuaXNBcnJheSggdmFsdWUgKSA/IHZhbHVlLmxlbmd0aCA6IHRoaXMuZ2V0TGVuZ3RoKCB2YWx1ZSwgZWxlbWVudCApO1xuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCBsZW5ndGggPD0gcGFyYW07XG5cdFx0fSxcblxuXHRcdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvcmFuZ2VsZW5ndGgtbWV0aG9kL1xuXHRcdHJhbmdlbGVuZ3RoOiBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQsIHBhcmFtICkge1xuXHRcdFx0dmFyIGxlbmd0aCA9ICQuaXNBcnJheSggdmFsdWUgKSA/IHZhbHVlLmxlbmd0aCA6IHRoaXMuZ2V0TGVuZ3RoKCB2YWx1ZSwgZWxlbWVudCApO1xuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCAoIGxlbmd0aCA+PSBwYXJhbVsgMCBdICYmIGxlbmd0aCA8PSBwYXJhbVsgMSBdICk7XG5cdFx0fSxcblxuXHRcdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvbWluLW1ldGhvZC9cblx0XHRtaW46IGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCwgcGFyYW0gKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IHZhbHVlID49IHBhcmFtO1xuXHRcdH0sXG5cblx0XHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL21heC1tZXRob2QvXG5cdFx0bWF4OiBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQsIHBhcmFtICkge1xuXHRcdFx0cmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCB2YWx1ZSA8PSBwYXJhbTtcblx0XHR9LFxuXG5cdFx0Ly8gaHR0cHM6Ly9qcXVlcnl2YWxpZGF0aW9uLm9yZy9yYW5nZS1tZXRob2QvXG5cdFx0cmFuZ2U6IGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCwgcGFyYW0gKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8ICggdmFsdWUgPj0gcGFyYW1bIDAgXSAmJiB2YWx1ZSA8PSBwYXJhbVsgMSBdICk7XG5cdFx0fSxcblxuXHRcdC8vIGh0dHBzOi8vanF1ZXJ5dmFsaWRhdGlvbi5vcmcvc3RlcC1tZXRob2QvXG5cdFx0c3RlcDogZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50LCBwYXJhbSApIHtcblx0XHRcdHZhciB0eXBlID0gJCggZWxlbWVudCApLmF0dHIoIFwidHlwZVwiICksXG5cdFx0XHRcdGVycm9yTWVzc2FnZSA9IFwiU3RlcCBhdHRyaWJ1dGUgb24gaW5wdXQgdHlwZSBcIiArIHR5cGUgKyBcIiBpcyBub3Qgc3VwcG9ydGVkLlwiLFxuXHRcdFx0XHRzdXBwb3J0ZWRUeXBlcyA9IFsgXCJ0ZXh0XCIsIFwibnVtYmVyXCIsIFwicmFuZ2VcIiBdLFxuXHRcdFx0XHRyZSA9IG5ldyBSZWdFeHAoIFwiXFxcXGJcIiArIHR5cGUgKyBcIlxcXFxiXCIgKSxcblx0XHRcdFx0bm90U3VwcG9ydGVkID0gdHlwZSAmJiAhcmUudGVzdCggc3VwcG9ydGVkVHlwZXMuam9pbigpICksXG5cdFx0XHRcdGRlY2ltYWxQbGFjZXMgPSBmdW5jdGlvbiggbnVtICkge1xuXHRcdFx0XHRcdHZhciBtYXRjaCA9ICggXCJcIiArIG51bSApLm1hdGNoKCAvKD86XFwuKFxcZCspKT8kLyApO1xuXHRcdFx0XHRcdGlmICggIW1hdGNoICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gTnVtYmVyIG9mIGRpZ2l0cyByaWdodCBvZiBkZWNpbWFsIHBvaW50LlxuXHRcdFx0XHRcdHJldHVybiBtYXRjaFsgMSBdID8gbWF0Y2hbIDEgXS5sZW5ndGggOiAwO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR0b0ludCA9IGZ1bmN0aW9uKCBudW0gKSB7XG5cdFx0XHRcdFx0cmV0dXJuIE1hdGgucm91bmQoIG51bSAqIE1hdGgucG93KCAxMCwgZGVjaW1hbHMgKSApO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR2YWxpZCA9IHRydWUsXG5cdFx0XHRcdGRlY2ltYWxzO1xuXG5cdFx0XHQvLyBXb3JrcyBvbmx5IGZvciB0ZXh0LCBudW1iZXIgYW5kIHJhbmdlIGlucHV0IHR5cGVzXG5cdFx0XHQvLyBUT0RPIGZpbmQgYSB3YXkgdG8gc3VwcG9ydCBpbnB1dCB0eXBlcyBkYXRlLCBkYXRldGltZSwgZGF0ZXRpbWUtbG9jYWwsIG1vbnRoLCB0aW1lIGFuZCB3ZWVrXG5cdFx0XHRpZiAoIG5vdFN1cHBvcnRlZCApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBlcnJvck1lc3NhZ2UgKTtcblx0XHRcdH1cblxuXHRcdFx0ZGVjaW1hbHMgPSBkZWNpbWFsUGxhY2VzKCBwYXJhbSApO1xuXG5cdFx0XHQvLyBWYWx1ZSBjYW4ndCBoYXZlIHRvbyBtYW55IGRlY2ltYWxzXG5cdFx0XHRpZiAoIGRlY2ltYWxQbGFjZXMoIHZhbHVlICkgPiBkZWNpbWFscyB8fCB0b0ludCggdmFsdWUgKSAlIHRvSW50KCBwYXJhbSApICE9PSAwICkge1xuXHRcdFx0XHR2YWxpZCA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IHZhbGlkO1xuXHRcdH0sXG5cblx0XHQvLyBodHRwczovL2pxdWVyeXZhbGlkYXRpb24ub3JnL2VxdWFsVG8tbWV0aG9kL1xuXHRcdGVxdWFsVG86IGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCwgcGFyYW0gKSB7XG5cblx0XHRcdC8vIEJpbmQgdG8gdGhlIGJsdXIgZXZlbnQgb2YgdGhlIHRhcmdldCBpbiBvcmRlciB0byByZXZhbGlkYXRlIHdoZW5ldmVyIHRoZSB0YXJnZXQgZmllbGQgaXMgdXBkYXRlZFxuXHRcdFx0dmFyIHRhcmdldCA9ICQoIHBhcmFtICk7XG5cdFx0XHRpZiAoIHRoaXMuc2V0dGluZ3Mub25mb2N1c291dCAmJiB0YXJnZXQubm90KCBcIi52YWxpZGF0ZS1lcXVhbFRvLWJsdXJcIiApLmxlbmd0aCApIHtcblx0XHRcdFx0dGFyZ2V0LmFkZENsYXNzKCBcInZhbGlkYXRlLWVxdWFsVG8tYmx1clwiICkub24oIFwiYmx1ci52YWxpZGF0ZS1lcXVhbFRvXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdCQoIGVsZW1lbnQgKS52YWxpZCgpO1xuXHRcdFx0XHR9ICk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdmFsdWUgPT09IHRhcmdldC52YWwoKTtcblx0XHR9LFxuXG5cdFx0Ly8gaHR0cHM6Ly9qcXVlcnl2YWxpZGF0aW9uLm9yZy9yZW1vdGUtbWV0aG9kL1xuXHRcdHJlbW90ZTogZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50LCBwYXJhbSwgbWV0aG9kICkge1xuXHRcdFx0aWYgKCB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgKSB7XG5cdFx0XHRcdHJldHVybiBcImRlcGVuZGVuY3ktbWlzbWF0Y2hcIjtcblx0XHRcdH1cblxuXHRcdFx0bWV0aG9kID0gdHlwZW9mIG1ldGhvZCA9PT0gXCJzdHJpbmdcIiAmJiBtZXRob2QgfHwgXCJyZW1vdGVcIjtcblxuXHRcdFx0dmFyIHByZXZpb3VzID0gdGhpcy5wcmV2aW91c1ZhbHVlKCBlbGVtZW50LCBtZXRob2QgKSxcblx0XHRcdFx0dmFsaWRhdG9yLCBkYXRhLCBvcHRpb25EYXRhU3RyaW5nO1xuXG5cdFx0XHRpZiAoICF0aGlzLnNldHRpbmdzLm1lc3NhZ2VzWyBlbGVtZW50Lm5hbWUgXSApIHtcblx0XHRcdFx0dGhpcy5zZXR0aW5ncy5tZXNzYWdlc1sgZWxlbWVudC5uYW1lIF0gPSB7fTtcblx0XHRcdH1cblx0XHRcdHByZXZpb3VzLm9yaWdpbmFsTWVzc2FnZSA9IHByZXZpb3VzLm9yaWdpbmFsTWVzc2FnZSB8fCB0aGlzLnNldHRpbmdzLm1lc3NhZ2VzWyBlbGVtZW50Lm5hbWUgXVsgbWV0aG9kIF07XG5cdFx0XHR0aGlzLnNldHRpbmdzLm1lc3NhZ2VzWyBlbGVtZW50Lm5hbWUgXVsgbWV0aG9kIF0gPSBwcmV2aW91cy5tZXNzYWdlO1xuXG5cdFx0XHRwYXJhbSA9IHR5cGVvZiBwYXJhbSA9PT0gXCJzdHJpbmdcIiAmJiB7IHVybDogcGFyYW0gfSB8fCBwYXJhbTtcblx0XHRcdG9wdGlvbkRhdGFTdHJpbmcgPSAkLnBhcmFtKCAkLmV4dGVuZCggeyBkYXRhOiB2YWx1ZSB9LCBwYXJhbS5kYXRhICkgKTtcblx0XHRcdGlmICggcHJldmlvdXMub2xkID09PSBvcHRpb25EYXRhU3RyaW5nICkge1xuXHRcdFx0XHRyZXR1cm4gcHJldmlvdXMudmFsaWQ7XG5cdFx0XHR9XG5cblx0XHRcdHByZXZpb3VzLm9sZCA9IG9wdGlvbkRhdGFTdHJpbmc7XG5cdFx0XHR2YWxpZGF0b3IgPSB0aGlzO1xuXHRcdFx0dGhpcy5zdGFydFJlcXVlc3QoIGVsZW1lbnQgKTtcblx0XHRcdGRhdGEgPSB7fTtcblx0XHRcdGRhdGFbIGVsZW1lbnQubmFtZSBdID0gdmFsdWU7XG5cdFx0XHQkLmFqYXgoICQuZXh0ZW5kKCB0cnVlLCB7XG5cdFx0XHRcdG1vZGU6IFwiYWJvcnRcIixcblx0XHRcdFx0cG9ydDogXCJ2YWxpZGF0ZVwiICsgZWxlbWVudC5uYW1lLFxuXHRcdFx0XHRkYXRhVHlwZTogXCJqc29uXCIsXG5cdFx0XHRcdGRhdGE6IGRhdGEsXG5cdFx0XHRcdGNvbnRleHQ6IHZhbGlkYXRvci5jdXJyZW50Rm9ybSxcblx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXHRcdFx0XHRcdHZhciB2YWxpZCA9IHJlc3BvbnNlID09PSB0cnVlIHx8IHJlc3BvbnNlID09PSBcInRydWVcIixcblx0XHRcdFx0XHRcdGVycm9ycywgbWVzc2FnZSwgc3VibWl0dGVkO1xuXG5cdFx0XHRcdFx0dmFsaWRhdG9yLnNldHRpbmdzLm1lc3NhZ2VzWyBlbGVtZW50Lm5hbWUgXVsgbWV0aG9kIF0gPSBwcmV2aW91cy5vcmlnaW5hbE1lc3NhZ2U7XG5cdFx0XHRcdFx0aWYgKCB2YWxpZCApIHtcblx0XHRcdFx0XHRcdHN1Ym1pdHRlZCA9IHZhbGlkYXRvci5mb3JtU3VibWl0dGVkO1xuXHRcdFx0XHRcdFx0dmFsaWRhdG9yLnJlc2V0SW50ZXJuYWxzKCk7XG5cdFx0XHRcdFx0XHR2YWxpZGF0b3IudG9IaWRlID0gdmFsaWRhdG9yLmVycm9yc0ZvciggZWxlbWVudCApO1xuXHRcdFx0XHRcdFx0dmFsaWRhdG9yLmZvcm1TdWJtaXR0ZWQgPSBzdWJtaXR0ZWQ7XG5cdFx0XHRcdFx0XHR2YWxpZGF0b3Iuc3VjY2Vzc0xpc3QucHVzaCggZWxlbWVudCApO1xuXHRcdFx0XHRcdFx0dmFsaWRhdG9yLmludmFsaWRbIGVsZW1lbnQubmFtZSBdID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR2YWxpZGF0b3Iuc2hvd0Vycm9ycygpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRlcnJvcnMgPSB7fTtcblx0XHRcdFx0XHRcdG1lc3NhZ2UgPSByZXNwb25zZSB8fCB2YWxpZGF0b3IuZGVmYXVsdE1lc3NhZ2UoIGVsZW1lbnQsIHsgbWV0aG9kOiBtZXRob2QsIHBhcmFtZXRlcnM6IHZhbHVlIH0gKTtcblx0XHRcdFx0XHRcdGVycm9yc1sgZWxlbWVudC5uYW1lIF0gPSBwcmV2aW91cy5tZXNzYWdlID0gbWVzc2FnZTtcblx0XHRcdFx0XHRcdHZhbGlkYXRvci5pbnZhbGlkWyBlbGVtZW50Lm5hbWUgXSA9IHRydWU7XG5cdFx0XHRcdFx0XHR2YWxpZGF0b3Iuc2hvd0Vycm9ycyggZXJyb3JzICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHByZXZpb3VzLnZhbGlkID0gdmFsaWQ7XG5cdFx0XHRcdFx0dmFsaWRhdG9yLnN0b3BSZXF1ZXN0KCBlbGVtZW50LCB2YWxpZCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCBwYXJhbSApICk7XG5cdFx0XHRyZXR1cm4gXCJwZW5kaW5nXCI7XG5cdFx0fVxuXHR9XG5cbn0gKTtcblxuLy8gQWpheCBtb2RlOiBhYm9ydFxuLy8gdXNhZ2U6ICQuYWpheCh7IG1vZGU6IFwiYWJvcnRcIlssIHBvcnQ6IFwidW5pcXVlcG9ydFwiXX0pO1xuLy8gaWYgbW9kZTpcImFib3J0XCIgaXMgdXNlZCwgdGhlIHByZXZpb3VzIHJlcXVlc3Qgb24gdGhhdCBwb3J0IChwb3J0IGNhbiBiZSB1bmRlZmluZWQpIGlzIGFib3J0ZWQgdmlhIFhNTEh0dHBSZXF1ZXN0LmFib3J0KClcblxudmFyIHBlbmRpbmdSZXF1ZXN0cyA9IHt9LFxuXHRhamF4O1xuXG4vLyBVc2UgYSBwcmVmaWx0ZXIgaWYgYXZhaWxhYmxlICgxLjUrKVxuaWYgKCAkLmFqYXhQcmVmaWx0ZXIgKSB7XG5cdCQuYWpheFByZWZpbHRlciggZnVuY3Rpb24oIHNldHRpbmdzLCBfLCB4aHIgKSB7XG5cdFx0dmFyIHBvcnQgPSBzZXR0aW5ncy5wb3J0O1xuXHRcdGlmICggc2V0dGluZ3MubW9kZSA9PT0gXCJhYm9ydFwiICkge1xuXHRcdFx0aWYgKCBwZW5kaW5nUmVxdWVzdHNbIHBvcnQgXSApIHtcblx0XHRcdFx0cGVuZGluZ1JlcXVlc3RzWyBwb3J0IF0uYWJvcnQoKTtcblx0XHRcdH1cblx0XHRcdHBlbmRpbmdSZXF1ZXN0c1sgcG9ydCBdID0geGhyO1xuXHRcdH1cblx0fSApO1xufSBlbHNlIHtcblxuXHQvLyBQcm94eSBhamF4XG5cdGFqYXggPSAkLmFqYXg7XG5cdCQuYWpheCA9IGZ1bmN0aW9uKCBzZXR0aW5ncyApIHtcblx0XHR2YXIgbW9kZSA9ICggXCJtb2RlXCIgaW4gc2V0dGluZ3MgPyBzZXR0aW5ncyA6ICQuYWpheFNldHRpbmdzICkubW9kZSxcblx0XHRcdHBvcnQgPSAoIFwicG9ydFwiIGluIHNldHRpbmdzID8gc2V0dGluZ3MgOiAkLmFqYXhTZXR0aW5ncyApLnBvcnQ7XG5cdFx0aWYgKCBtb2RlID09PSBcImFib3J0XCIgKSB7XG5cdFx0XHRpZiAoIHBlbmRpbmdSZXF1ZXN0c1sgcG9ydCBdICkge1xuXHRcdFx0XHRwZW5kaW5nUmVxdWVzdHNbIHBvcnQgXS5hYm9ydCgpO1xuXHRcdFx0fVxuXHRcdFx0cGVuZGluZ1JlcXVlc3RzWyBwb3J0IF0gPSBhamF4LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHRcdHJldHVybiBwZW5kaW5nUmVxdWVzdHNbIHBvcnQgXTtcblx0XHR9XG5cdFx0cmV0dXJuIGFqYXguYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9O1xufVxucmV0dXJuICQ7XG59KSk7IiwiKGZ1bmN0aW9uKCQpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgICAgICAkKCB3aW5kb3cgKS5vbiggJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZvcm10YXN0aWNJbml0KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIGZvcm10YXN0aWNJbml0KCkge1xuICAgICAgICAgICAgdmFyIGZvcm07XG5cbiAgICAgICAgICAgIHZhciBmdF91cmwgPSBmdW5jdGlvbiBmb3JtYXN0aWNfdXJsX3BhcmFtZXRlciggc1BhcmFtICkge1xuICAgICAgICAgICAgICAgIHZhciBzUGFnZVVSTCA9IGRlY29kZVVSSUNvbXBvbmVudCggd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSkgKSxcbiAgICAgICAgICAgICAgICAgICAgc1VSTFZhcmlhYmxlcyA9IHNQYWdlVVJMLnNwbGl0KCAnJicgKSxcbiAgICAgICAgICAgICAgICAgICAgc1BhcmFtZXRlck5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IHNVUkxWYXJpYWJsZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgICAgIHNQYXJhbWV0ZXJOYW1lID0gc1VSTFZhcmlhYmxlc1tpXS5zcGxpdCggJz0nICk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBzUGFyYW1ldGVyTmFtZVswXSA9PT0gc1BhcmFtICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNQYXJhbWV0ZXJOYW1lWzFdID09PSB1bmRlZmluZWQgPyB0cnVlIDogc1BhcmFtZXRlck5hbWVbMV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoIGZ0LmxhbmdfY29kZSA9PSAnZnInICkge1xuICAgICAgICAgICAgICAgIGZvcm0gPSBmdF91cmwoICdmb3JtdWxhaXJlJyApO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcm0gPSBmdF91cmwoICdmb3JtJyApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIHR5cGVvZiBmb3JtICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybXRhc3RpY19zY3JvbGwoICcjJyArIGZvcm0gKTtcbiAgICAgICAgICAgICAgICB9LCA1MDAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gZm9ybXRhc3RpY19zY3JvbGwoIHRhcmdldCApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3BlZWQgICA9IHBhcnNlSW50KCAkKCB0YXJnZXQgKS5hdHRyKCAnZGF0YS1zcGVlZCcgKSApLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgID0gcGFyc2VJbnQoICQoIHRhcmdldCApLmF0dHIoICdkYXRhLW9mZnNldCcgKSApLFxuICAgICAgICAgICAgICAgICAgICB0YWcgICAgID0gJCggdGFyZ2V0ICkuYXR0ciggJ2RhdGEtdGFnJyApLFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gJCggdGFyZ2V0ICkuY2xvc2VzdCggdGFnICk7XG5cbiAgICAgICAgICAgICAgICAkKCAnaHRtbCwgYm9keScgKS5hbmltYXRlKCB7XG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcDogZWxlbWVudC5vZmZzZXQoKS50b3AgLSBvZmZzZXRcbiAgICAgICAgICAgICAgICB9LCBzcGVlZCwgJ2xpbmVhcicsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICQoICcuZnQtdmFsaWRhdGUnICkub24oICdzdWJtaXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgZm9ybSA9ICQoIHRoaXMgKTtcblxuICAgICAgICAgICAgICAgIGlmICggISBmb3JtLnZhbGlkKCkgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIHR5cGVvZiBmdC51c2VfY2FwdGNoYSAhPT0gJ3VuZGVmaW5lZCcgJiYgZnQudXNlX2NhcHRjaGEgPT0gJ3llcycgJiYgdHlwZW9mIGZ0LnNpdGVfa2V5ICE9PSAndW5kZWZpbmVkJyAmJiBmdC5zaXRlX2tleSAhPT0gJycgKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZ3JlY2FwdGNoYS5yZWFkeSggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBncmVjYXB0Y2hhLmV4ZWN1dGUoIGZ0LnNpdGVfa2V5LCB7IGFjdGlvbjogJ2Zvcm10YXN0aWMnIH0gKS50aGVuKCBmdW5jdGlvbiggdG9rZW4gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybS5maW5kKCAnaW5wdXRbbmFtZT1cImctcmVjYXB0Y2hhLXJlc3BvbnNlXCJdJyApLnZhbCggdG9rZW4gKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm0udW5iaW5kKCAnc3VibWl0JyApLnN1Ym1pdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkKCAnLmZ0LXZhbGlkYXRlJyApLmVhY2goIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQoIHRoaXMgKS52YWxpZGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yRWxlbWVudDogJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICBlcnJvckxhYmVsQ29udGFpbmVyOiAnLmZ0LWNoZWNrJyxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JDbGFzczogJ2ludmFsaWQtZmVlZGJhY2snLFxuICAgICAgICAgICAgICAgICAgICB2YWxpZENsYXNzOiAnZnQtc3VjY2VzcyBpcy12YWxpZCcsXG4gICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogZnVuY3Rpb24oIGVsZW1lbnQsIGVycm9yQ2xhc3MsIHZhbGlkQ2xhc3MgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCBlbGVtZW50IClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAuY2xvc2VzdCggJy5mdC1maWVsZCcgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyggJ2Z0LWludmFsaWQgaXMtaW52YWxpZCcgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyggdmFsaWRDbGFzcyApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHR5cGVvZiBwYWdlU2Nyb2xsICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVNjcm9sbC5zZXRTaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdW5oaWdobGlnaHQ6IGZ1bmN0aW9uKCBlbGVtZW50LCBlcnJvckNsYXNzLCB2YWxpZENsYXNzICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCggZWxlbWVudCApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLmNsb3Nlc3QoICcuZnQtZmllbGQnIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoICdmdC1pbnZhbGlkIGlzLWludmFsaWQnIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoIHZhbGlkQ2xhc3MgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCB0eXBlb2YgcGFnZVNjcm9sbCAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VTY3JvbGwuc2V0U2l6ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yUGxhY2VtZW50OiBmdW5jdGlvbiggZXJyb3IsIGVsZW1lbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvci5hcHBlbmRUbyggZWxlbWVudC5jbG9zZXN0KCAnLmZ0LWZpZWxkJyApICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkLnZhbGlkYXRvci5hZGRNZXRob2QoICdmdC10ZWwnLCBmdW5jdGlvbiggdmFsdWUsIGVsZW1lbnQgKSB7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoaXMub3B0aW9uYWwoIGVsZW1lbnQgKSB8fCAvXihbMV1bLSBdPyk/W1xcKF0/WzItOV1bMC05XXsyfVtcXCldP1stIF0/WzAtOV17M31bLSBdP1swLTldezR9JC8udGVzdCggdmFsdWUgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IC9eKChcXFxcK1sxLTldezEsNH1bIFxcXFwtXSopfChcXFxcKFswLTldezIsM31cXFxcKVsgXFxcXC1dKil8KFswLTldezIsNH0pWyBcXFxcLV0qKSo/WzAtOV17Myw0fT9bIFxcXFwtXSpbMC05XXszLDR9PyQvLnRlc3QoIHZhbHVlICk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJC52YWxpZGF0b3IuYWRkTWV0aG9kKCAnZnQtbnVtYmVyJywgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgL14oLXsxfSk/WzAtOV0rKFxcLlswLTldezEsfSk/JC8udGVzdCggdmFsdWUgKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkLnZhbGlkYXRvci5hZGRNZXRob2QoICdmdC1lbWFpbCcsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IC9eW2EtekEtWjAtOS5fLV0rQFthLXowLTkuLV17Mix9Wy5dW2Etel17Miw1fSQvLnRlc3QoIHZhbHVlICk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJC52YWxpZGF0b3IuYWRkTWV0aG9kKCAnZnQtbmFtZScsIGZ1bmN0aW9uKCB2YWx1ZSwgZWxlbWVudCApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25hbCggZWxlbWVudCApIHx8IC9eW2EtekEtWsOAw4HDgsODw4TDhcOgw6HDosOjw6TDpcOSw5PDlMOVw5bDmMOyw7PDtMO1w7bDuMOIw4nDisOLw6jDqcOqw6vDh8Onw4zDjcOOw4/DrMOtw67Dr8OZw5rDm8Ocw7nDusO7w7zDv8ORw7EnIC1dezMsfSQvLnRlc3QoIHZhbHVlICk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJC52YWxpZGF0b3IuYWRkTWV0aG9kKCAnZnQtcG9zdGFsJywgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgL15bQWFCYkNjRWVHZ0hoSmpLa0xsTW1OblBwUnJTc1R0VnZYeFl5XXsxfVxcZHsxfVtBLVphLXpdezF9ICpcXGR7MX1bQS1aYS16XXsxfVxcZHsxfSQvLnRlc3QoIHZhbHVlICk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJC52YWxpZGF0b3IuYWRkTWV0aG9kKCAnZnQtdXJsJywgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgL14oaHR0cHM/OlxcL1xcLyk/KFtcXGRhLXpcXC4tXSspXFwuKFthLXpcXC5dezIsNn0pKFtcXC9cXHcgXFwuLV0qKSpcXC8/JC8udGVzdCggdmFsdWUgKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkLnZhbGlkYXRvci5hZGRNZXRob2QoICdmdC10aW1lJywgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgL14oWzAxXT9bMC05XXwyWzAtM10pOlswLTVdWzAtOV0kLy50ZXN0KCB2YWx1ZSApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICQudmFsaWRhdG9yLmFkZE1ldGhvZCggJ2Z0LWNvbG9yJywgZnVuY3Rpb24oIHZhbHVlLCBlbGVtZW50ICkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbmFsKCBlbGVtZW50ICkgfHwgL14oWyNdP1tBLUZhLWYwLTldezZ9fFtBLUZhLWYwLTldezN9KSQvLnRlc3QoIHZhbHVlICk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKCAkKCAnLmZ0LWlucHV0LS1kYXRlJyApLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICAkKCAnLmZ0LWlucHV0LS1kYXRlJyApLmVhY2goIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWUgICAgID0gJCggdGhpcyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluICAgID0gbWUuYXR0ciggJ2RhdGEtbWluJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4ICAgID0gbWUuYXR0ciggJ2RhdGEtbWF4JyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0ID0gbWUuYXR0ciggJ2RhdGEtZm9ybWF0JyApO1xuXG4gICAgICAgICAgICAgICAgICAgICQoICcuZnQtaW5wdXQtLWRhdGUnICkuZGF0ZXBpY2tlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiBmb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbGlkYXRvciA9ICQoIHRoaXMgKS5jbG9zZXN0KCAnZm9ybScgKS52YWxpZGF0ZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdG9yLmVsZW1lbnQoICQoIHRoaXMgKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkRhdGU6IG1pbixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heERhdGU6IG1heCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZU1vbnRoOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZVllYXI6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH0sICQuZGF0ZXBpY2tlci5yZWdpb25hbFsgZnQubGFuZ19jb2RlIF0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoICQoICcuZnQtcmFuZ2UnICkubGVuZ3RoICkge1xuICAgICAgICAgICAgICAgICQoICcuZnQtcmFuZ2UnICkuZWFjaCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtZSAgICA9ICQoIHRoaXMgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbiAgID0gbWUuYXR0ciggJ2RhdGEtbWluJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4ICAgPSBtZS5hdHRyKCAnZGF0YS1tYXgnICksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGVwICA9IG1lLmF0dHIoICdkYXRhLXN0ZXAnICksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IG1lLmF0dHIoICdkYXRhLXZhbHVlJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIG1lLnNsaWRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGVwOiBwYXJzZUludCggc3RlcCApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluOiBwYXJzZUludCggbWluICksXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXg6IHBhcnNlSW50KCBtYXggKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwYXJzZUludCggdmFsdWUgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlOiBmdW5jdGlvbiggZXZlbnQsIHVpICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoICcjJyArIG1lLmF0dHIoICdkYXRhLWlucHV0JyApICkudmFsKCB1aS52YWx1ZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCAkKCAnLmZ0LWlucHV0LS1maWxlJyApLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICAkKCAnLmZ0LWlucHV0LS1maWxlJyApLm9uKCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWxpZGF0b3IgPSAkKCB0aGlzICkuY2xvc2VzdCggJ2Zvcm0nICkudmFsaWRhdGUoKTtcblxuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0b3IuZWxlbWVudCggJCggdGhpcyApICk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggJCggJy5mdC1pbnB1dC0tYWRkcmVzcycgKS5sZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgJCggJy5mdC1pbnB1dC0tYWRkcmVzcycgKS5lYWNoKCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9wdGlvbnMgID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHR5cGU6IFsnKGNpdGllcyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbXBvbmVudFJlc3RyaWN0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBjb3VudHJ5OiAnY2EnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0ICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICQoIHRoaXMgKS5hdHRyKCAnaWQnICkgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZSA9IG5ldyBnb29nbGUubWFwcy5wbGFjZXMuQXV0b2NvbXBsZXRlKCBpbnB1dCwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlLmFkZExpc3RlbmVyKCAncGxhY2VfY2hhbmdlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBsYWNlID0gYXV0b2NvbXBsZXRlLmdldFBsYWNlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCBwbGFjZS5nZW9tZXRyeS5sb2NhdGlvbi5sYXQoKSApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCAkKCAnLmZ0LWlucHV0LS1jb2xvcicgKS5sZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgJCggJy5mdC1pbnB1dC0tY29sb3InICkuaXJpcyh7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZTogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoIHRoaXMgKS5wYXJlbnQoKS5maW5kKCAnLmZ0LWNvbG9yJyApLmNzcyggJ2JhY2tncm91bmQnLCB1aS5jb2xvci50b1N0cmluZygpICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICQoICcuZnQtaW5wdXQtLWNvbG9yJyApLmVhY2goIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29sb3IgPSAkKCB0aGlzICkudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCggdGhpcyApLmlyaXMoICdjb2xvcicsIGNvbG9yICk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAkKCAnLmZ0LWlucHV0LS1jb2xvciwgLmlyaXMtcGlja2VyLCAuaXJpcy1waWNrZXItaW5uZXInICkub24oICdjbGljaycsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAkKCBkb2N1bWVudCApLm9uKCAnY2xpY2snLCBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgICQoICcuZnQtaW5wdXQtLWNvbG9yJyApLmlyaXMoICdoaWRlJyApO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgJCggJy5mdC1pbnB1dC0tY29sb3InICkub24oICdjbGljaycsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgJCggJy5mdC1pbnB1dC0tY29sb3InICkuaXJpcyggJ2hpZGUnICk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCggdGhpcyApLmlyaXMoICdzaG93JyApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoICQoICcuZnQtaW5wdXQtLWNoZWNrYm94JyApLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICAkKCAnLmZ0LWlucHV0LS1jaGVja2JveCcgKS5lYWNoKCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1lICAgICA9ICQoIHRoaXMgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heCAgICA9IG1lLmF0dHIoICdkYXRhLW1heCcgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNob3NlbiA9IG1lLmZpbmQoICdpbnB1dDpjaGVja2VkJyApLmxlbmd0aDtcblxuICAgICAgICAgICAgICAgICAgICBtZS5hdHRyKCAnZGF0YS1jaG9zZW4nLCBjaG9zZW4gKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIGNob3NlbiA+PSBtYXggKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlX2NoZWNrYm94KCBtZSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAkKCAnLmZ0LWlucHV0LS1jaGVja2JveCBpbnB1dCcgKS5vbiggJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWUgPSAkKCB0aGlzICksXG4gICAgICAgICAgICAgICAgICAgICAgICBob2xkZXIgPSBtZS5jbG9zZXN0KCAnLmZ0LWlucHV0LS1jaGVja2JveCcgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heCAgICA9IGhvbGRlci5hdHRyKCAnZGF0YS1tYXgnICksXG4gICAgICAgICAgICAgICAgICAgICAgICBjaG9zZW4gPSBob2xkZXIuYXR0ciggJ2RhdGEtY2hvc2VuJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggbWUuaXMoICc6Y2hlY2tlZCcgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY2hvc2VuIDwgbWF4ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvbGRlci5hdHRyKCAnZGF0YS1jaG9zZW4nLCBwYXJzZUludCggY2hvc2VuICkgKyAxICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoICggcGFyc2VJbnQoIGNob3NlbiApICsgMSApID09IG1heCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZV9jaGVja2JveCggaG9sZGVyICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBob2xkZXIuYXR0ciggJ2RhdGEtY2hvc2VuJywgcGFyc2VJbnQoIGNob3NlbiApIC0gMSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoICggcGFyc2VJbnQoIGNob3NlbiApIC0gMSApIDwgbWF4ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZV9jaGVja2JveCggaG9sZGVyICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCAkKCAnLmZ0LXJlcGVhdGVyJyApLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICAkKCAnLmZ0LXJlcGVhdGVyJyApLmVhY2goIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWUgICAgID0gJCggdGhpcyApLmNsb3Nlc3QoICcuZnQtZmllbGQtLXJlZG8nICk7XG5cbiAgICAgICAgICAgICAgICAgICAgbWUuZmluZCggJ2lucHV0JyApLnZhbCggJzEnICk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAkKCAnLmZ0LXJlcGVhdGVyJyApLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1lICAgICA9ICQoIHRoaXMgKS5jbG9zZXN0KCAnLmZ0LWZpZWxkLS1yZWRvJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyID0gbWUuZmluZCggJ2lucHV0JyApLnZhbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQgICAgID0gbWUuYXR0ciggJ2lkJyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzICAgID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9uZSAgPSBtZS5jbG9zZXN0KCAnLmZ0LXJvdycgKS5maW5kKCAnLmZ0LWZpZWxkJyApLm5vdCggJy5mdC1maWVsZC0tcmVkbycgKS5ub3QoICcuZnQtY2xvbmUnICkuY2xvbmUoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIHBhcnNlSW50KCBudW1iZXIgKSA8IHBhcnNlSW50KCBtZS5maW5kKCAnaW5wdXQnICkuYXR0ciggJ2RhdGEtbWF4JyApICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBudW1iZXIrKztcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBwYXJzZUludCggbnVtYmVyICkgPT0gcGFyc2VJbnQoIG1lLmZpbmQoICdpbnB1dCcgKS5hdHRyKCAnZGF0YS1tYXgnICkgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCB0aGlzICkucHJvcCggJ2Rpc2FibGVkJywgdHJ1ZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBtZS5maW5kKCAnaW5wdXQnICkudmFsKCBudW1iZXIgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvbmUuZWFjaCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlkICAgPSAkKCB0aGlzICkuYXR0ciggJ2RhdGEtaWQnICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSAkKCB0aGlzICkuYXR0ciggJ2RhdGEtbmFtZScgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoIHRoaXMgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0ciggJ2lkJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCAnZGF0YS1jbG9uZScsIG51bWJlciApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcyggJ2Z0LWNsb25lJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCAnaW5wdXQnICkuYXR0ciggJ2lkJywgaWQgKyAnLWNsb25lLScgKyBudW1iZXIgKS5lbmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluZCggJ2lucHV0JyApLmF0dHIoICduYW1lJywgaWQgKyAnLWNsb25lLScgKyBudW1iZXIgKS5lbmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluZCggJ3NlbGVjdCcgKS5hdHRyKCAnaWQnLCBpZCArICctY2xvbmUtJyArIG51bWJlciApLmVuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCAnc2VsZWN0JyApLmF0dHIoICduYW1lJywgaWQgKyAnLWNsb25lLScgKyBudW1iZXIgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoIHRoaXMgKS5pbnNlcnRCZWZvcmUoIG1lICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbWUuY2xvc2VzdCggJy5mdC1yb3cnIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluZCggJ1tkYXRhLWNsb25lPScgKyBudW1iZXIgKyAnXScgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC53cmFwQWxsKCAnPGRpdiBjbGFzcz1cImZ0LWNsb25lLWxpbmUgY29sLTEyXCI+PGRpdiBjbGFzcz1cInJvdyBmdC1yb3dcIj48L2Rpdj48YSBocmVmPVwiI1wiIGNsYXNzPVwiZnQtZGVsZXRlXCI+JnRpbWVzOzwvYT48L2Rpdj4nICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJCggZG9jdW1lbnQgKS5vbiggJ2NsaWNrJywgJy5mdC1kZWxldGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWUgPSAkKCB0aGlzICksXG4gICAgICAgICAgICAgICAgICAgIG51bWJlciA9IG1lLmNsb3Nlc3QoICcuZnQtcm93JyApLmZpbmQoICcuZnQtZmllbGQtLXJlZG8gaW5wdXQnICkudmFsKCk7XG5cbiAgICAgICAgICAgICAgICBudW1iZXItLTtcblxuICAgICAgICAgICAgICAgIG1lLmNsb3Nlc3QoICcuZnQtcm93JyApLmZpbmQoICcuZnQtZmllbGQtLXJlZG8gaW5wdXQnICkudmFsKCBudW1iZXIgKTtcbiAgICAgICAgICAgICAgICBtZS5jbG9zZXN0KCAnLmZ0LXJvdycgKS5maW5kKCAnLmZ0LWZpZWxkLS1yZWRvIC5mdC1yZXBlYXRlcicgKS5wcm9wKCAnZGlzYWJsZWQnLCBmYWxzZSApO1xuXG4gICAgICAgICAgICAgICAgbWUuY2xvc2VzdCggJy5mdC1jbG9uZS1saW5lJyApLnJlbW92ZSgpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGRpc2FibGVfY2hlY2tib3goIGhvbGRlciApIHtcbiAgICAgICAgICAgICAgICBob2xkZXIuZmluZCggJ2lucHV0JyApLmVhY2goIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoICEgJCggdGhpcyApLmlzKCAnOmNoZWNrZWQnICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCB0aGlzICkucHJvcCggJ2Rpc2FibGVkJywgdHJ1ZSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGVuYWJsZV9jaGVja2JveCggaG9sZGVyICkge1xuICAgICAgICAgICAgICAgIGhvbGRlci5maW5kKCAnaW5wdXQnICkuZWFjaCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICQoIHRoaXMgKS5wcm9wKCAnZGlzYWJsZWQnLCBmYWxzZSApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhdXRvZmlsbCgpO1xuICAgICAgICAgICAgdGFyZ2V0cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXV0b2ZpbGwoKSB7XG4gICAgICAgICAgICBpZiAoICQoICcuZnQtYXV0b2ZpbGwnICkubGVuZ3RoICkge1xuICAgICAgICAgICAgICAgICQoICcuZnQtYXV0b2ZpbGwgYScgKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmb3JtICAgPSAkKCB0aGlzICkuY2xvc2VzdCggJ2Zvcm0nICksXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZHMgPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICBmb3JtLmZpbmQoICcuZnQtZmllbGQnICkuZWFjaCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoICEgJCggdGhpcyApLmlzKCAnLmZ0LWZpZWxkLS1zdWJtaXQnICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGUgPSAkKCB0aGlzICkuYXR0ciggJ2RhdGEtdHlwZScgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9ICQoIHRoaXMgKS5maW5kKCAnOmlucHV0Om5vdChidXR0b24pJyApLmF0dHIoICduYW1lJyApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRzW25hbWVdID0gdHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJC5lYWNoKCBmaWVsZHMsIGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoICggdmFsdWUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbmFtZScgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCAnIycgKyBrZXkgKS52YWwoIGdlbmVyYXRlTmFtZSgpICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZW1haWwnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCggJyMnICsga2V5ICkudmFsKCBnZW5lcmF0ZUVtYWlsKCkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICd0ZWwnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCggJyMnICsga2V5ICkudmFsKCBnZW5lcmF0ZVBob25lKCkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdwYXNzd29yZCcgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCAnIycgKyBrZXkgKS52YWwoIGdlbmVyYXRlUGFzc3dvcmQoKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3Bvc3RhbCcgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCAnIycgKyBrZXkgKS52YWwoIGdlbmVyYXRlUG9zdGFsKCkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdkYXRlJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlRGF0ZSgga2V5ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAndGltZScgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCAnIycgKyBrZXkgKS52YWwoIGdlbmVyYXRlVGltZSgpICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29sb3InIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCggJyMnICsga2V5ICkuaXJpcyggJ2NvbG9yJywgZ2VuZXJhdGVDb2xvcigpICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbnVtYmVyJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoICcjJyArIGtleSApLnZhbCggZ2VuZXJhdGVOdW1iZXIoIGtleSApICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmFuZ2UnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG51bWJlciA9IGdlbmVyYXRlTnVtYmVyKCBrZXkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCggJyMnICsga2V5ICkudmFsKCBudW1iZXIgKS5wYXJlbnQoKS5maW5kKCAnLmZ0LXJhbmdlJyApLnNsaWRlciggJ3ZhbHVlJywgbnVtYmVyICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAndGV4dCcgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2FkZHJlc3MnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdzZWFyY2gnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCggJyMnICsga2V5ICkudmFsKCBnZW5lcmF0ZVRleHQoKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3VybCcgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCAnIycgKyBrZXkgKS52YWwoIGdlbmVyYXRlVXJsKCkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdzZWxlY3QnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0Q2hvaWNlKCBrZXkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyYWRpbycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByYWRpb0Nob2ljZSggZm9ybSwga2V5ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnY2hlY2tib3gnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmFkaW9DaG9pY2UoIGZvcm0sIGtleSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RleHRhcmVhJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlVGV4dGFyZWEoIGtleSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9ybS52YWxpZCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHRhcmdldHMoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBoaWRlVGFyZ2V0cyggaWRzICkge1xuICAgICAgICAgICAgICAgIGlmICggdHlwZW9mIGlkcyAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlkcyA9IGlkcy5zcGxpdCggJywnICk7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgaWRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCAkKCAnIycgKyAkLnRyaW0oIGlkc1tpXSApICkuaXMoICdmaWVsZHNldCcgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCAnIycgKyAkLnRyaW0oIGlkc1tpXSApIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluZCggJzppbnB1dCcgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucHJvcCggJ2Rpc2FibGVkJywgdHJ1ZSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCAkKCAnIycgKyAkLnRyaW0oIGlkc1tpXSApICkuaXMoICdkaXYnICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCggJyMnICsgJC50cmltKCBpZHNbaV0gKSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jbG9zZXN0KCAnLmZ0LWZpZWxkJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmQoICc6aW5wdXQnIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnByb3AoICdkaXNhYmxlZCcsIHRydWUgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCAnIycgKyAkLnRyaW0oIGlkc1tpXSApIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnByb3AoICdkaXNhYmxlZCcsIHRydWUgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2xvc2VzdCggJy5mdC1maWVsZCcgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBzaG93VGFyZ2V0cyggaWRzICkge1xuICAgICAgICAgICAgICAgIGlmICggdHlwZW9mIGlkcyAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlkcyA9IGlkcy5zcGxpdCggJywnICk7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgaWRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCAkKCAnIycgKyAkLnRyaW0oIGlkc1tpXSApICkuaXMoICdmaWVsZHNldCcgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCAnIycgKyAkLnRyaW0oIGlkc1tpXSApIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluZCggJzppbnB1dCcgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucHJvcCggJ2Rpc2FibGVkJywgZmFsc2UgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggJCggJyMnICsgJC50cmltKCBpZHNbaV0gKSApLmlzKCAnZGl2JyApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoICcjJyArICQudHJpbSggaWRzW2ldICkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2xvc2VzdCggJy5mdC1maWVsZCcgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCAnOmlucHV0JyApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wKCAnZGlzYWJsZWQnLCBmYWxzZSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoICcjJyArICQudHJpbSggaWRzW2ldICkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucHJvcCggJ2Rpc2FibGVkJywgZmFsc2UgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2xvc2VzdCggJy5mdC1maWVsZCcgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoICQoICdbZGF0YS1mdC10YXJnZXRdJyApICkge1xuICAgICAgICAgICAgICAgICQoICdbZGF0YS1mdC10YXJnZXRdJyApLmVhY2goIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWUgID0gJCggdGhpcyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWRzID0gbWUuYXR0ciggJ2RhdGEtZnQtdGFyZ2V0JyApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggbWUuaXMoICdvcHRpb24nICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoICEgbWUucHJvcCggJ3NlbGVjdGVkJyApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZGVUYXJnZXRzKCBpZHMgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCAhIG1lLnByb3AoICdjaGVja2VkJyApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZGVUYXJnZXRzKCBpZHMgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG1lLmNsb3Nlc3QoICcuZnQtZmllbGQnICkuYWRkQ2xhc3MoICdmdC1jb25kaXRpb25zJyApO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgJCggJ1tkYXRhLWZ0LXRhcmdldF0nICkuZWFjaCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtZSAgPSAkKCB0aGlzICksXG4gICAgICAgICAgICAgICAgICAgICAgICBpZHMgPSBtZS5hdHRyKCAnZGF0YS1mdC10YXJnZXQnICk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBtZS5pcyggJ29wdGlvbicgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbWUucHJvcCggJ3NlbGVjdGVkJyApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dUYXJnZXRzKCBpZHMgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBtZS5wcm9wKCAnY2hlY2tlZCcgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93VGFyZ2V0cyggaWRzICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBtZS5jbG9zZXN0KCAnLmZ0LWZpZWxkJyApLmFkZENsYXNzKCAnZnQtY29uZGl0aW9ucycgKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICQoIGRvY3VtZW50ICkub24oICdjaGFuZ2UnLCAnLmZ0LWNvbmRpdGlvbnMgaW5wdXQsIC5mdC1jb25kaXRpb25zIHNlbGVjdCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWUgPSAkKCB0aGlzICksXG4gICAgICAgICAgICAgICAgICAgICAgICBpZHMgPSAnJztcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIG1lLmlzKCAnc2VsZWN0JyApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlbCA9IG1lLnZhbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoICQuaXNBcnJheSggc2VsICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgc2VsLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gbWUuZmluZCggJ1t2YWx1ZT1cIicgKyBzZWxbaV0gKyAnXCJdJyApLmF0dHIoICdkYXRhLWZ0LXRhcmdldCcgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHR5cGVvZiB0YXJnZXQgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzLnB1c2goIHRhcmdldCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRzID0gdmFsdWVzLmpvaW4oICcsJyApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkcyA9IG1lLmZpbmQoICc6c2VsZWN0ZWQnICkuYXR0ciggJ2RhdGEtZnQtdGFyZ2V0JyApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZHMgPSBtZS5hdHRyKCAnZGF0YS1mdC10YXJnZXQnICk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBtZS5jbG9zZXN0KCAnLmZ0LWZpZWxkJyApLmZpbmQoICdbZGF0YS1mdC10YXJnZXRdJyApLmVhY2goIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1lID0gJCggdGhpcyApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBoaWRlVGFyZ2V0cyggbWUuYXR0ciggJ2RhdGEtZnQtdGFyZ2V0JyApICk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggaWRzICE9PSAnJyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbWUuaXMoICdbdHlwZT1jaGVja2JveF0nICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBtZS5wcm9wKCAnY2hlY2tlZCcgKSA9PSBmYWxzZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlkZVRhcmdldHMoIGlkcyApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1RhcmdldHMoIGlkcyApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93VGFyZ2V0cyggaWRzICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJuZE4oIG1pbiwgbWF4ICkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoIE1hdGgucmFuZG9tKCkgKiAoIG1heCAtIG1pbiArIDEgKSArIG1pbiApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVOYW1lKCkge1xuICAgICAgICAgICAgdmFyIGZpcnN0QXJyICA9IFsnU8OpYmFzJywgJ0RhdicsICdKZWFuJywgJ0NhcmwnLCAnSm9uYScsICfDiW0nLCAnTWFyJywgJ1NhbScsICdJYW4nLCAnTWlrJywgJ0FsZXgnLCAnU2EnLCAnQW5kcsOpJywgJ0dhJywgJ1R1cicsICdEw6lzJywgJ1Nwb28nLCAnQmVhdScsICdMYWInLCAnTMOpdicsICdKYScsICdPcmZhJywgJ01pY2gnLCAnTW9yJywgJ1BhcmVudCcsICdSb2InLCAnQm9pcycsICdMYW4nLCAnTGVtaScsICdSb3VzJyBdLFxuICAgICAgICAgICAgICAgIG1pZGRsZUFyciA9IFsndGllbicsICdpZCcsICdjYXJsJywgJ3RoYW4nLCAnbGllJywgJ2llJywgJ3VlbCcsICdhbmRyZScsICdhbm5lJywgJ2duw6knLCAnY290dGUnLCAnbGV0cycsICduZXInLCAnbGlldScsICdvcmRlJywgJ2VzcXVlJywgJ3F1ZXMnLCAnY2hhdWQnLCAnZWF1JywgJ2VyZ2UnLCAndmVydCcsICdkcnknLCAncmUnLCAnc2VhdSddLFxuICAgICAgICAgICAgICAgIG5hbWUgICAgICA9IGZpcnN0QXJyW01hdGguZmxvb3IoIE1hdGgucmFuZG9tKCkgKiBmaXJzdEFyci5sZW5ndGggKV0gKyBtaWRkbGVBcnJbTWF0aC5mbG9vciggTWF0aC5yYW5kb20oKSAqIG1pZGRsZUFyci5sZW5ndGggKV07XG5cbiAgICAgICAgICAgIHJldHVybiBuYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVFbWFpbCgpIHtcbiAgICAgICAgICAgIHZhciBmaXJzdEFyciAgPSBbJ3NlYmFzJywgJ2NhdicsICdqZWFuJywgJ21heCcsICdjYXJsJywgJ2pvbmEnLCAnZW0nLCAnY2hyaXMnLCAnbWFyJywgJ2FuJywgJ3NhbScsICdpYW4nLCAnbWlrJywgJ2FsZXgnLCAnc2EnLCAnYW5kcmUnLCAnZ2EnLCAndHVyJywgJ2RlcycsICdyZXknLCAnc3BvbycsICdiZWF1JywgJ2xhYicsICdsZXYnLCAnamEnLCAnb3JmYScsICdtaWNoJywgJ21vcicsICdwYXJlbnQnLCAncm9iJywgJ2JvaXMnLCAnbGFuJywgJ2xlbWknLCAncm91cycgXSxcbiAgICAgICAgICAgICAgICBsYXN0QXJyICAgPSBbJ3RpZW4nLCAnaWQnLCAnY2FybCcsICdpbWUnLCAndGhhbicsICdsaWUnLCAndGlhbicsICdpZScsICd1ZWwnLCAnYW5kcmUnLCAnYW5uZScsICdnbmUnLCAnY290dGUnLCAnbGV0cycsICduZXInLCAnbGlldScsICdvcmRlJywgJ2VzcXVlJywgJ3F1ZXMnLCAnY2hhdWQnLCAnZWF1JywgJ2VyZ2UnLCAndmVydCcsICdkcnknLCAncmUnLCAnc2VhdSddLFxuICAgICAgICAgICAgICAgIG5hbWUgICAgICA9IGZpcnN0QXJyW01hdGguZmxvb3IoIE1hdGgucmFuZG9tKCkgKiBmaXJzdEFyci5sZW5ndGggKV0gKyBsYXN0QXJyW01hdGguZmxvb3IoIE1hdGgucmFuZG9tKCkgKiBsYXN0QXJyLmxlbmd0aCApXSxcbiAgICAgICAgICAgICAgICBkb21haW5BcnIgPSBbJ2dtYWlsLmNvbScsICdtc24uY29tJywgJ291dGxvb2suY29tJywgJ3pvaG8uY29tJywgJ3lhaG9vLmNvbScsICd5YW5kZXguY29tJywgJ2luYm94LmNvbScsICdtYWlsLmNvbSddLFxuICAgICAgICAgICAgICAgIGogICAgICAgICA9IE1hdGguZmxvb3IoIE1hdGgucmFuZG9tKCkgKiBkb21haW5BcnIubGVuZ3RoICk7XG5cbiAgICAgICAgICAgIHJldHVybiBuYW1lICsgJ0AnICsgZG9tYWluQXJyW2pdO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVQYXNzd29yZCgpIHtcbiAgICAgICAgICAgIHJldHVybiAncHdkJztcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlVXJsKCkge1xuICAgICAgICAgICAgdmFyIGZpcnN0QXJyICA9IFsnZmlyZScsICd3YXRlcicsICdmbGFtZScsICdtZXRhbCcsICdwdW5rJywgJ3BvcCcsICdzbm93JywgJ3NrYXRlJywgJ3Ntb290aCcsICdzb2Z0JywgJ3BhbG0nLCAnaGFyZCcsICdlbGVjdHJpYycsICdsaXF1aWQnLCAnZGVhdGgnLCAnYmx1ZScsICdyZWQnLCAncGluaycsICd3aGl0ZScsICdibGFjaycsICdzdXBlcicsICdleHRyYSddLFxuICAgICAgICAgICAgICAgIGxhc3RBcnIgICA9IFsnYmFuYW5hJywgJ2FwcGxlJywgJ2JvbmUnLCAnY2hhaXInLCAnaGVhZCcsICd0cmVlJywgJ2RlY2snLCAncGxhbnQnLCAnYm9hcmQnLCAnc2t5JywgJ3N0YXInLCAnY2xvdWQnLCAnaGVhcnQnLCAncG9ybicsICdyYWluYm93JywgJ2Nob2NvbGF0ZScsICdoZWxtZXQnLCAncGhvbmUnLCAnYmVhY2gnXSxcbiAgICAgICAgICAgICAgICBuYW1lICAgICAgPSBmaXJzdEFycltNYXRoLmZsb29yKCBNYXRoLnJhbmRvbSgpICogZmlyc3RBcnIubGVuZ3RoICldICsgbGFzdEFycltNYXRoLmZsb29yKCBNYXRoLnJhbmRvbSgpICogbGFzdEFyci5sZW5ndGggKV0sXG4gICAgICAgICAgICAgICAgZG9tYWluQXJyID0gWycuY29tJywgJy5uZXQnLCAnLm9yZycsICcuaW5mbycsICcuYml6JywgJy51cycsICcuY2EnLCAnLmV1JywgJy5jbycsICcuY28nLCAnLm1vYmknLCAnLmFzaWEnLCAnLnh4eCddLFxuICAgICAgICAgICAgICAgIGogICAgICAgICA9IE1hdGguZmxvb3IoIE1hdGgucmFuZG9tKCkgKiBkb21haW5BcnIubGVuZ3RoICk7XG5cbiAgICAgICAgICAgIHJldHVybiAnaHR0cDovLycgKyBuYW1lICsgZG9tYWluQXJyW2pdO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVQaG9uZSgpIHtcbiAgICAgICAgICAgIHZhciBpbmRBcnIgPSBbJzM2NycsICc0MTgnLCAnNDM4JywgJzQ1MCcsICc1MTQnLCAnNTc5JywgJzU4MScsICc4MTknLCAnODczJ10sXG4gICAgICAgICAgICAgICAgaSAgICAgID0gTWF0aC5mbG9vciggTWF0aC5yYW5kb20oKSAqIGluZEFyci5sZW5ndGggKTtcblxuICAgICAgICAgICAgcmV0dXJuIGluZEFycltpXSArICctJyArIHJuZE4oIDEwMCwgOTk5ICkgKyAnLScgKyBybmROKCAxMDAwLCA5OTk5ICk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZVBvc3RhbCgpIHtcbiAgICAgICAgICAgIHZhciBwb3N0YWxBcnIgPSBbJ0EnLCAnQicsICdDJywgJ0UnLCAnRycsICdIJywgJ0onLCAnSycsICdMJywgJ00nLCAnTicsICdQJywgJ1InLCAnUycsICdUJywgJ1YnLCAnWCcsICdZJ107XG5cbiAgICAgICAgICAgIHJldHVybiBwb3N0YWxBcnJbcm5kTiggMCwgMTcgKV0gKyBybmROKCAwLCA5ICkgKyBwb3N0YWxBcnJbcm5kTiggMCwgMTcgKV0gKyAnICcgKyBybmROKCAwLCA5ICkgKyBwb3N0YWxBcnJbcm5kTiggMCwgMTcgKV0gKyBybmROKCAwLCA5ICk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZUNvbG9yKCkge1xuICAgICAgICAgICAgdmFyIGxldHRlcnMgPSAnMDEyMzQ1Njc4OUFCQ0RFRicsXG4gICAgICAgICAgICAgICAgY29sb3IgICA9ICcjJztcblxuICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgNjsgaSsrICkge1xuICAgICAgICAgICAgICAgIGNvbG9yICs9IGxldHRlcnNbIE1hdGguZmxvb3IoIE1hdGgucmFuZG9tKCkgKiAxNiApIF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjb2xvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlTnVtYmVyKCBrZXkgKSB7XG4gICAgICAgICAgICB2YXIgZmllbGQgPSAkKCAnIycgKyBrZXkgKSxcbiAgICAgICAgICAgICAgICBtaW4gICA9IGZpZWxkLmF0dHIoICdtaW4nICksXG4gICAgICAgICAgICAgICAgbWF4ICAgPSBmaWVsZC5hdHRyKCAnbWF4JyApO1xuXG4gICAgICAgICAgICBpZiAoIHR5cGVvZiBtYXggPT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICAgICAgICAgIG1heCA9IDEwMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJuZE4oIG1pbiwgbWF4ICk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZURhdGUoIGtleSApIHtcbiAgICAgICAgICAgIHZhciBmaWVsZCAgPSAkKCAnIycgKyBrZXkgKSxcbiAgICAgICAgICAgICAgICBmb3JtYXQgPSBmaWVsZC5hdHRyKCAnZGF0YS1mb3JtYXQnICksXG4gICAgICAgICAgICAgICAgbWluICAgID0gZmllbGQuYXR0ciggJ2RhdGEtbWluJyApLFxuICAgICAgICAgICAgICAgIG1heCAgICA9IGZpZWxkLmF0dHIoICdkYXRhLW1heCcgKSxcbiAgICAgICAgICAgICAgICBkYXkgICAgPSBybmROKCAxLCAyOCApLFxuICAgICAgICAgICAgICAgIG1vbnRoICA9IHJuZE4oIDEsIDEyICksXG4gICAgICAgICAgICAgICAgeWVhciAgID0gcm5kTiggMTkwMCwgMjEwMCApO1xuXG4gICAgICAgICAgICAvLyB2YXIgZGF0ZSA9IG5ldyBEYXRlKCB5ZWFyLCBtb250aCwgZGF5ICk7XG4gICAgICAgICAgICB2YXIgZGF0ZSA9ICggJzAnICsgbW9udGggKS5zbGljZSggLTIgKSArICcvJyArICggJzAnICsgZGF5ICkuc2xpY2UoIC0yICkgKyAnLycgKyB5ZWFyO1xuXG4gICAgICAgICAgICBmaWVsZC5kYXRlcGlja2VyKCAnc2V0RGF0ZScsIGRhdGUgKS5kYXRlcGlja2VyKCAncmVmcmVzaCcgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlVGltZSgga2V5ICkge1xuICAgICAgICAgICAgdmFyIGhvdXIgPSBybmROKCAwLCAyMyApLFxuICAgICAgICAgICAgICAgIG1pbiAgPSBybmROKCAwLCA1OSApO1xuXG4gICAgICAgICAgICBpZiAoIGhvdXIgPCAxMCApIHtcbiAgICAgICAgICAgICAgICBob3VyID0gJzAnICsgaG91cjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCBtaW4gPCAxMCApIHtcbiAgICAgICAgICAgICAgICBtaW4gPSAnMCcgKyBtaW47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBob3VyICsgJzonICsgbWluO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVUZXh0KCkge1xuICAgICAgICAgICAgdmFyIHRleHRBcnIgPSBbJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0JywgJ0NvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdCcsICdBbGlxdWFtIHNpdCBhbWV0IGxpYmVybyBkb2xvcicsICdOdWxsYSB1cm5hIHF1YW0gZWZmaWNpdHVyIHZlbCcsICdDb25zZXF1YXQgZWdldCB0ZW1wb3IgaW4gcXVhbScsICdDcmFzIGNvbnZhbGxpcyBkaWFtIGEgY29uZ3VlIGVmZmljaXR1cicsICdDdXJhYml0dXIgZWxpdCBtYWduYSwgcG9ydHRpdG9yIGEgdmVsaXQgcGhhcmV0cmEnLCAnRGlnbmlzc2ltIGZyaW5naWxsYSB0ZWxsdXMnLCAnSW4gbG9ib3J0aXMgZWxpdCBhYyB2dWxwdXRhdGUgcGVsbGVudGVzcXVlJywgJ1ZpdmFtdXMgc29sbGljaXR1ZGluIHZvbHV0cGF0IGFyY3UnXSxcbiAgICAgICAgICAgICAgICBpICAgICAgID0gTWF0aC5mbG9vciggTWF0aC5yYW5kb20oKSAqIHRleHRBcnIubGVuZ3RoICk7XG5cbiAgICAgICAgICAgIHJldHVybiB0ZXh0QXJyW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVUZXh0YXJlYSgga2V5ICkge1xuICAgICAgICAgICAgdmFyIGZpZWxkICAgPSAkKCAnIycgKyBrZXkgKSxcbiAgICAgICAgICAgICAgICB0ZXh0QXJyID0gW1xuICAgICAgICAgICAgICAgICAgICAnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdC4gQWxpcXVhbSBzaXQgYW1ldCBsaWJlcm8gZG9sb3IuIE51bGxhIHVybmEgcXVhbSwgZWZmaWNpdHVyIHZlbCBjb25zZXF1YXQgZWdldCwgdGVtcG9yIGluIHF1YW0uIENyYXMgY29udmFsbGlzIGRpYW0gYSBjb25ndWUgZWZmaWNpdHVyLiBDdXJhYml0dXIgZWxpdCBtYWduYSwgcG9ydHRpdG9yIGEgdmVsaXQgcGhhcmV0cmEsIGRpZ25pc3NpbSBmcmluZ2lsbGEgdGVsbHVzLiBJbiBsb2JvcnRpcyBlbGl0IGFjIHZ1bHB1dGF0ZSBwZWxsZW50ZXNxdWUuIFZpdmFtdXMgc29sbGljaXR1ZGluIHZvbHV0cGF0IGFyY3UsIGF0IGx1Y3R1cyBsaWd1bGEgcGVsbGVudGVzcXVlIGF0LiBBbGlxdWFtIG51bGxhIHNhcGllbiwgZGFwaWJ1cyB2ZWwgaWFjdWxpcyBvcm5hcmUsIGNvbmd1ZSBub24gaXBzdW0uIE51bGxhbSBkYXBpYnVzIHRvcnRvciB2aXRhZSBtZXR1cyBlZ2VzdGFzIGludGVyZHVtLiBJbiBlZ2VzdGFzIGFudGUgc2VtLCBhIGZhdWNpYnVzIHNhcGllbiBsYWNpbmlhIG5vbi4gTWF1cmlzIHN1c2NpcGl0IGxvYm9ydGlzIG5pc2wsIGlkIHBvc3VlcmUgZG9sb3IgdmVzdGlidWx1bSB1dC4gTW9yYmkgdXQgbW9sbGlzIHRvcnRvci4gSW50ZXJkdW0gZXQgbWFsZXN1YWRhIGZhbWVzIGFjIGFudGUgaXBzdW0gcHJpbWlzIGluIGZhdWNpYnVzLiBDcmFzIHNlbXBlciBjb25zZXF1YXQgc2VtIG5lYyBjdXJzdXMuJyxcbiAgICAgICAgICAgICAgICAgICAgJ1NlZCB2b2x1dHBhdCBsb3JlbSBhYyBsaWd1bGEgZGFwaWJ1cyB1bGxhbWNvcnBlci4gU3VzcGVuZGlzc2UgaGVuZHJlcml0IGVsaXQgYXQgbmVxdWUgaGVuZHJlcml0IHVsbGFtY29ycGVyLiBEdWlzIGRpYW0gYXJjdSwgaGVuZHJlcml0IGV0IGxhY3VzIHZlbCwgdnVscHV0YXRlIGxvYm9ydGlzIGVyb3MuIE51bGxhIGEgZWxlbWVudHVtIG5pc2kuIE51bGxhbSBub24gaW1wZXJkaWV0IG51bmMuIE1vcmJpIHJ1dHJ1bSwgbWV0dXMgYSBpYWN1bGlzIHVsdHJpY2VzLCBvZGlvIGlwc3VtIHBoYXJldHJhIGp1c3RvLCBuZWMgdGluY2lkdW50IG1hdXJpcyBsb3JlbSBhIGRpYW0uIE5hbSB2aXRhZSByaG9uY3VzIG5pYmguIEFsaXF1YW0gbWF4aW11cyBlbGl0IHV0IGxhb3JlZXQgdGVtcHVzLiBNb3JiaSBtYXhpbXVzIHRyaXN0aXF1ZSBhbGlxdWV0LiBQcm9pbiBvcmNpIGVuaW0sIGxhY2luaWEgYXQgdmVzdGlidWx1bSBlZ2V0LCBmcmluZ2lsbGEgdmVsIGFudGUuIEludGVnZXIgZXQgY29uZGltZW50dW0gc2FwaWVuLicsXG4gICAgICAgICAgICAgICAgICAgICdOdWxsYW0gbWF4aW11cyBjb25kaW1lbnR1bSBudWxsYSB1dCBydXRydW0uIER1aXMgZGlnbmlzc2ltIHZlbGl0IGZyaW5naWxsYSwgZXVpc21vZCBtZXR1cyBxdWlzLCBlbGVpZmVuZCBsZWN0dXMuIFZlc3RpYnVsdW0gZmF1Y2lidXMsIG1hZ25hIGltcGVyZGlldCBtYXhpbXVzIHBoYXJldHJhLCB0b3J0b3IgdHVycGlzIHVsbGFtY29ycGVyIG1hZ25hLCBzZWQgdnVscHV0YXRlIGxvcmVtIG9kaW8gYSBudW5jLiBEdWlzIGxvYm9ydGlzIG5lYyBxdWFtIGVnZXQgaWFjdWxpcy4gVml2YW11cyB2ZWwgZW5pbSB1dCBuaXNpIHRpbmNpZHVudCBpYWN1bGlzIGV1IHNlZCB0ZWxsdXMuIFV0IGNvbmd1ZSBpYWN1bGlzIGdyYXZpZGEuIEN1cmFiaXR1ciBwb3N1ZXJlLCBzYXBpZW4gbm9uIHN1c2NpcGl0IGNvbmd1ZSwgdHVycGlzIGZlbGlzIHNhZ2l0dGlzIG1hZ25hLCBhYyBjb25zZWN0ZXR1ciBsaWd1bGEgZXN0IHNpdCBhbWV0IHNlbS4gVmVzdGlidWx1bSBxdWlzIHByZXRpdW0gbnVsbGEsIGVnZXQgcG9zdWVyZSBleC4gTWF1cmlzIHRpbmNpZHVudCBsZWN0dXMgbmVjIHNlbXBlciBjb25zZWN0ZXR1ci4nLFxuICAgICAgICAgICAgICAgICAgICAnUGVsbGVudGVzcXVlIG1heGltdXMgZGFwaWJ1cyBpYWN1bGlzLiBBbGlxdWFtIHRlbXB1cyB0dXJwaXMgdHVycGlzLCBpZCBwdWx2aW5hciBudWxsYSB1bHRyaWNlcyBhLiBQcm9pbiB1dCBwb3J0dGl0b3IgcmlzdXMsIHF1aXMgZmVybWVudHVtIHNlbS4gU2VkIGVnZXQgZW5pbSBibGFuZGl0LCB2YXJpdXMgZXJvcyBzZWQsIHRpbmNpZHVudCBlcm9zLiBNYWVjZW5hcyBpbiBjb25kaW1lbnR1bSBhdWd1ZS4gU3VzcGVuZGlzc2UgbWF1cmlzIGFyY3UsIHJ1dHJ1bSB2ZWwgc2NlbGVyaXNxdWUgc2VkLCBmYWNpbGlzaXMgcXVpcyBzZW0uIER1aXMgYXQgbmliaCBncmF2aWRhLCBiaWJlbmR1bSBleCBzZWQsIGNvbmd1ZSBsaWJlcm8uIERvbmVjIGx1Y3R1cyB0ZWxsdXMganVzdG8uIEN1cmFiaXR1ciBpbiBzb2xsaWNpdHVkaW4gcXVhbS4nLFxuICAgICAgICAgICAgICAgICAgICAnRG9uZWMgZWxlbWVudHVtIHJ1dHJ1bSBkb2xvciwgYXQgbWF4aW11cyBtaSBmaW5pYnVzIGF0LiBEdWlzIGN1cnN1cyB0aW5jaWR1bnQgc2FwaWVuIGlkIHZ1bHB1dGF0ZS4gTWFlY2VuYXMgcXVhbSBxdWFtLCB2YXJpdXMgdXQgZGlhbSBldCwgcG9ydGEgdmVoaWN1bGEgc2VtLiBBbGlxdWFtIGxvcmVtIHR1cnBpcywgZGlnbmlzc2ltIGVnZXQgdmVuZW5hdGlzIHNlZCwgaGVuZHJlcml0IGlkIGVyYXQuIE51bGxhIHB1cnVzIGlwc3VtLCBwZWxsZW50ZXNxdWUgZXUgY29uZGltZW50dW0gYSwgdm9sdXRwYXQgaW4gbGFjdXMuIFBlbGxlbnRlc3F1ZSB1bGxhbWNvcnBlciBub24gbmliaCB2ZWwgbW9sbGlzLiBNYXVyaXMgc2VkIHByZXRpdW0ganVzdG8uIFF1aXNxdWUgdm9sdXRwYXQgdWxsYW1jb3JwZXIgYmxhbmRpdC4gRXRpYW0gZ3JhdmlkYSBldWlzbW9kIHZlbGl0IHZpdGFlIHVsbGFtY29ycGVyLiBNYWVjZW5hcyB2ZWxpdCBsZW8sIGVnZXN0YXMgdmVsIGVyb3MgZXUsIGRpY3R1bSBkaWduaXNzaW0ganVzdG8uJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcGFyYXMgPSBybmROKCAxLCA1ICksXG4gICAgICAgICAgICAgICAgY3VzdG9tID0gJyc7XG5cbiAgICAgICAgICAgIGZvciggdmFyIGkgPSAxOyBpIDw9IHBhcmFzOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgayA9IE1hdGguZmxvb3IoIE1hdGgucmFuZG9tKCkgKiB0ZXh0QXJyLmxlbmd0aCApO1xuXG4gICAgICAgICAgICAgICAgY3VzdG9tICs9IHRleHRBcnJba107XG5cbiAgICAgICAgICAgICAgICBpZiAoIGkgIT09IHBhcmFzICkge1xuICAgICAgICAgICAgICAgICAgICBjdXN0b20gKz0gJ1xcblxcbic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmaWVsZC52YWwoIGN1c3RvbSApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2VsZWN0Q2hvaWNlKCBrZXkgKSB7XG4gICAgICAgICAgICB2YXIgZmllbGQgICAgICA9ICQoICcjJyArIGtleS5yZXBsYWNlKCAnW10nLCAnJyApICksXG4gICAgICAgICAgICAgICAgb3B0aW9uc0FyciA9IFtdO1xuXG4gICAgICAgICAgICBpZiAoIGZpZWxkLmlzKCAnc2VsZWN0JyApICkge1xuICAgICAgICAgICAgICAgIGZpZWxkLmZpbmQoICdvcHRpb24nICkuZWFjaCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggJCggdGhpcyApLnZhbCgpICE9PSAnJyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnNBcnIucHVzaCggJCggdGhpcyApLnZhbCgpICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGkgPSBNYXRoLmZsb29yKCBNYXRoLnJhbmRvbSgpICogb3B0aW9uc0Fyci5sZW5ndGggKTtcblxuICAgICAgICAgICAgZmllbGQudmFsKCBvcHRpb25zQXJyW2ldICkuY2hhbmdlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiByYWRpb0Nob2ljZSggZm9ybSwga2V5ICkge1xuICAgICAgICAgICAgdmFyIG9wdGlvbnNBcnIgPSBbXTtcblxuICAgICAgICAgICAgZm9ybS5maW5kKCAnaW5wdXRbbmFtZT1cIicgKyBrZXkgKyAnXCJdJyApLmVhY2goIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQoIHRoaXMgKS5wcm9wKCAnY2hlY2tlZCcsIGZhbHNlICkuY2hhbmdlKCk7XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zQXJyLnB1c2goICQoIHRoaXMgKSApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciBpID0gTWF0aC5mbG9vciggTWF0aC5yYW5kb20oKSAqIG9wdGlvbnNBcnIubGVuZ3RoICk7XG5cbiAgICAgICAgICAgIGZvcm0uZmluZCggb3B0aW9uc0FycltpXSApLnByb3AoICdjaGVja2VkJywgdHJ1ZSApLmNoYW5nZSgpO1xuICAgICAgICB9XG5cbn0oalF1ZXJ5KSk7XG4iXX0=
