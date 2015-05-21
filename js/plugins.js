/**
 * selectFx.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
;( function( window ) {
    
    'use strict';

    /**
     * based on from https://github.com/inuyaksa/jquery.nicescroll/blob/master/jquery.nicescroll.js
     */
    function hasParent( e, p ) {
        if (!e) return false;
        var el = e.target||e.srcElement||e||false;
        while (el && el != p) {
            el = el.parentNode||false;
        }
        return (el!==false);
    };
    
    /**
     * extend obj function
     */
    function extend( a, b ) {
        for( var key in b ) { 
            if( b.hasOwnProperty( key ) ) {
                a[key] = b[key];
            }
        }
        return a;
    }

    /**
     * SelectFx function
     */
    function SelectFx( el, options ) {  
        this.el = el;
        this.options = extend( {}, this.options );
        extend( this.options, options );
        this._init();
    }

    /**
     * SelectFx options
     */
    SelectFx.prototype.options = {
        // if true all the links will open in a new tab.
        // if we want to be redirected when we click an option, we need to define a data-link attr on the option of the native select element
        newTab : true,
        // when opening the select element, the default placeholder (if any) is shown
        stickyPlaceholder : true,
        // callback when changing the value
        onChange : function( val ) { return false; }
    }

    /**
     * init function
     * initialize and cache some vars
     */
    SelectFx.prototype._init = function() {
        // check if we are using a placeholder for the native select box
        // we assume the placeholder is disabled and selected by default
        var selectedOpt = this.el.querySelector( 'option[selected]' );
        this.hasDefaultPlaceholder = selectedOpt && selectedOpt.disabled;

        // get selected option (either the first option with attr selected or just the first option)
        this.selectedOpt = selectedOpt || this.el.querySelector( 'option' );

        // create structure
        this._createSelectEl();

        // all options
        this.selOpts = [].slice.call( this.selEl.querySelectorAll( 'li[data-option]' ) );
        
        // total options
        this.selOptsCount = this.selOpts.length;
        
        // current index
        this.current = this.selOpts.indexOf( this.selEl.querySelector( 'li.cs-selected' ) ) || -1;
        
        // placeholder elem
        this.selPlaceholder = this.selEl.querySelector( 'span.cs-placeholder' );

        // init events
        this._initEvents();
    }

    /**
     * creates the structure for the select element
     */
    SelectFx.prototype._createSelectEl = function() {
        var self = this, options = '', createOptionHTML = function(el) {
            var optclass = '', classes = '', link = '';

            if( el.selectedOpt && !this.foundSelected && !this.hasDefaultPlaceholder ) {
                classes += 'cs-selected ';
                this.foundSelected = true;
            }
            // extra classes
            if( el.getAttribute( 'data-class' ) ) {
                classes += el.getAttribute( 'data-class' );
            }
            // link options
            if( el.getAttribute( 'data-link' ) ) {
                link = 'data-link=' + el.getAttribute( 'data-link' );
            }

            if( classes !== '' ) {
                optclass = 'class="' + classes + '" ';
            }

            return '<li ' + optclass + link + ' data-option data-value="' + el.value + '"><span>' + el.textContent + '</span></li>';
        };

        [].slice.call( this.el.children ).forEach( function(el) {
            if( el.disabled ) { return; }

            var tag = el.tagName.toLowerCase();

            if( tag === 'option' ) {
                options += createOptionHTML(el);
            }
            else if( tag === 'optgroup' ) {
                options += '<li class="cs-optgroup"><span>' + el.label + '</span><ul>';
                [].slice.call( el.children ).forEach( function(opt) {
                    options += createOptionHTML(opt);
                } );
                options += '</ul></li>';
            }
        } );

        var opts_el = '<div class="cs-options"><ul>' + options + '</ul></div>';
        this.selEl = document.createElement( 'div' );
        this.selEl.className = this.el.className;
        this.selEl.tabIndex = this.el.tabIndex;
        this.selEl.innerHTML = '<span class="cs-placeholder">' + this.selectedOpt.textContent + '</span>' + opts_el;
        this.el.parentNode.appendChild( this.selEl );
        this.selEl.appendChild( this.el );
    }

    /**
     * initialize the events
     */
    SelectFx.prototype._initEvents = function() {
        var self = this;

        // open/close select
        this.selPlaceholder.addEventListener( 'click', function() {
            self._toggleSelect();
        } );

        // clicking the options
        this.selOpts.forEach( function(opt, idx) {
            opt.addEventListener( 'click', function() {
                self.current = idx;
                self._changeOption();
                // close select elem
                self._toggleSelect();
            } );
        } );

        // close the select element if the target it´s not the select element or one of its descendants..
        document.addEventListener( 'click', function(ev) {
            var target = ev.target;
            if( self._isOpen() && target !== self.selEl && !hasParent( target, self.selEl ) ) {
                self._toggleSelect();
            }
        } );

        // keyboard navigation events
        this.selEl.addEventListener( 'keydown', function( ev ) {
            var keyCode = ev.keyCode || ev.which;

            switch (keyCode) {
                // up key
                case 38:
                    ev.preventDefault();
                    self._navigateOpts('prev');
                    break;
                // down key
                case 40:
                    ev.preventDefault();
                    self._navigateOpts('next');
                    break;
                // space key
                case 32:
                    ev.preventDefault();
                    if( self._isOpen() && typeof self.preSelCurrent != 'undefined' && self.preSelCurrent !== -1 ) {
                        self._changeOption();
                    }
                    self._toggleSelect();
                    break;
                // enter key
                case 13:
                    ev.preventDefault();
                    if( self._isOpen() && typeof self.preSelCurrent != 'undefined' && self.preSelCurrent !== -1 ) {
                        self._changeOption();
                        self._toggleSelect();
                    }
                    break;
                // esc key
                case 27:
                    ev.preventDefault();
                    if( self._isOpen() ) {
                        self._toggleSelect();
                    }
                    break;
            }
        } );
    }

    /**
     * navigate with up/dpwn keys
     */
    SelectFx.prototype._navigateOpts = function(dir) {
        if( !this._isOpen() ) {
            this._toggleSelect();
        }

        var tmpcurrent = typeof this.preSelCurrent != 'undefined' && this.preSelCurrent !== -1 ? this.preSelCurrent : this.current;
        
        if( dir === 'prev' && tmpcurrent > 0 || dir === 'next' && tmpcurrent < this.selOptsCount - 1 ) {
            // save pre selected current - if we click on option, or press enter, or press space this is going to be the index of the current option
            this.preSelCurrent = dir === 'next' ? tmpcurrent + 1 : tmpcurrent - 1;
            // remove focus class if any..
            this._removeFocus();
            // add class focus - track which option we are navigating
            classie.add( this.selOpts[this.preSelCurrent], 'cs-focus' );
        }
    }

    /**
     * open/close select
     * when opened show the default placeholder if any
     */
    SelectFx.prototype._toggleSelect = function() {
        // remove focus class if any..
        this._removeFocus();
        
        if( this._isOpen() ) {
            if( this.current !== -1 ) {
                // update placeholder text
                this.selPlaceholder.textContent = this.selOpts[ this.current ].textContent;
            }
            classie.remove( this.selEl, 'cs-active' );
        }
        else {
            if( this.hasDefaultPlaceholder && this.options.stickyPlaceholder ) {
                // everytime we open we wanna see the default placeholder text
                this.selPlaceholder.textContent = this.selectedOpt.textContent;
            }
            classie.add( this.selEl, 'cs-active' );
        }
    }

    /**
     * change option - the new value is set
     */
    SelectFx.prototype._changeOption = function() {
        // if pre selected current (if we navigate with the keyboard)...
        if( typeof this.preSelCurrent != 'undefined' && this.preSelCurrent !== -1 ) {
            this.current = this.preSelCurrent;
            this.preSelCurrent = -1;
        }

        // current option
        var opt = this.selOpts[ this.current ];

        // update current selected value
        this.selPlaceholder.textContent = opt.textContent;
        
        // change native select element´s value
        this.el.value = opt.getAttribute( 'data-value' );

        // remove class cs-selected from old selected option and add it to current selected option
        var oldOpt = this.selEl.querySelector( 'li.cs-selected' );
        if( oldOpt ) {
            classie.remove( oldOpt, 'cs-selected' );
        }
        classie.add( opt, 'cs-selected' );

        // if there´s a link defined
        if( opt.getAttribute( 'data-link' ) ) {
            // open in new tab?
            if( this.options.newTab ) {
                window.open( opt.getAttribute( 'data-link' ), '_blank' );
            }
            else {
                window.location = opt.getAttribute( 'data-link' );
            }
        }

        // callback
        this.options.onChange( this.el.value );
    }

    /**
     * returns true if select element is opened
     */
    SelectFx.prototype._isOpen = function(opt) {
        return classie.has( this.selEl, 'cs-active' );
    }

    /**
     * removes the focus class from the option
     */
    SelectFx.prototype._removeFocus = function(opt) {
        var focusEl = this.selEl.querySelector( 'li.cs-focus' )
        if( focusEl ) {
            classie.remove( focusEl, 'cs-focus' );
        }
    }

    /**
     * add to global namespace
     */
    window.SelectFx = SelectFx;

} )( window );



// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

var colors = new Array(
  [227,213,168],
  [220,173,212],
  [67,192,203],
  [55,162,216],
  [255,0,255],
  [255,128,0]);

var step = 0;
//color table indices for: 
// current color left
// next color left
// current color right
// next color right
var colorIndices = [0,1,2,3];

//transition speed
var gradientSpeed = 0.002;

/*function updateGradient()
{
  
  if ( $===undefined ) return;
  
var c0_0 = colors[colorIndices[0]];
var c0_1 = colors[colorIndices[1]];
var c1_0 = colors[colorIndices[2]];
var c1_1 = colors[colorIndices[3]];

var istep = 1 - step;
var r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
var g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
var b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
var color1 = "rgb("+r1+","+g1+","+b1+")";

var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
var color2 = "rgb("+r2+","+g2+","+b2+")";

 $('.gradient').css({
   background: "-webkit-gradient(linear, left top, right top, from("+color1+"), to("+color2+"))"}).css({
    background: "-moz-linear-gradient(left, "+color1+" 0%, "+color2+" 100%)"});
  
  step += gradientSpeed;
  if ( step >= 1 )
  {
    step %= 1;
    colorIndices[0] = colorIndices[1];
    colorIndices[2] = colorIndices[3];
    
    //pick two new target color indices
    //do not pick the same as the current one
    colorIndices[1] = ( colorIndices[1] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
    colorIndices[3] = ( colorIndices[3] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
    
  }
}

setInterval(updateGradient,10);



/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
(function() {

    var bodyEl = document.body,
        content = document.querySelector( '.content-wrap' ),
        openbtn = document.getElementById( 'open-button' ),
        closebtn = document.getElementById( 'close-button' ),
        isOpen = false;

    function init() {
        initEvents();
    }

    function initEvents() {
        openbtn.addEventListener( 'click', toggleMenu );
        if( closebtn ) {
            closebtn.addEventListener( 'click', toggleMenu );
        }

        // close the menu element if the target it´s not the menu element or one of its descendants..
        content.addEventListener( 'click', function(ev) {
            var target = ev.target;
            if( isOpen && target !== openbtn ) {
                toggleMenu();
            }
        } );
    }

    function toggleMenu() {
        if( isOpen ) {
            classie.remove( bodyEl, 'show-menu' );
        }
        else {
            classie.add( bodyEl, 'show-menu' );
        }
        isOpen = !isOpen;
    }

    init();

})();




