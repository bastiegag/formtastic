(function($) {

    $( '.ft-unread' ).on( 'click', function() {
        var me          = $( this ),
            response_id = me.attr( 'data-id' );

        if ( ! me.is( '.is-process' ) ) {
            me.addClass( 'is-process' );

            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: ft.ajax_url,
                data: { 
                    'action': 'ft_read',
                    'response_id': response_id
                },
                success: function( data ) {
                    var path = me.find( 'svg' ).attr( 'data-path' );

                    me.removeClass( 'ft-unread' ).addClass( 'ft-read' );

                    me.find( 'svg use' ).attr( 'xlink:href', path + '#mail-open' );
                }
            });
        }

        return false;
    });

}(jQuery));
