(function($) {

    jQuery.fn.formtasticTabs = function() {
        if( typeof arguments[0] === 'string' ) {
            var property = arguments[1],
                args = Array.prototype.slice.call( arguments );

            args.splice( 0, 1 );

            methods[arguments[0]].apply( this, args );

        } else {
            init.apply( this, arguments );
        }

        return this;
    };

    function init( options ) {
        this.each( function() {
            var tabs = $( this );

            tabs.find( '.ft-tabs-nav a' ).each( function() {
                var tab = $( this );

                if ( tab.is( '.active' ) ) {
                    var target = tab.attr( 'href' );

                    tabs
                        .find( target )
                        .addClass( 'active' );
                }  

            }).on( 'click', function() {
                var tab = $( this ),
                    target = tab.attr( 'href' ),
                    nav = tabs.find( '.ft-tabs-nav' );

                if ( !tab.is( '.active' ) ) {
                    nav.find( '.active' ).removeClass( 'active' );
                    tab.addClass( 'active' );
                    
                    tabs
                        .find( '.ft-tab-content.active' )
                        .removeClass( 'active' )
                        .end()
                        .find( target )
                        .addClass( 'active' );
                }

                return false;
            });
        });
    }

}(jQuery));
