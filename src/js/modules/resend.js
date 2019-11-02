(function($) {

    $( '.ft-resend' ).on( 'click', function() {
        var me          = $( this ),
            form_id     = me.attr( 'data-form' ),
            response_id = me.attr( 'data-id' );

        if ( ! me.is( '.is-process' ) ) {
            me
                .addClass( 'is-process' )
                .closest( 'tr' ).addClass( 'ft-sending' );

            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: ft.ajax_url,
                data: { 
                    'action': 'ft_resend',
                    'form_id': form_id,
                    'response_id': response_id
                },
                success: function( data ) {
                    me
                        .removeClass( 'is-process' )
                        .closest( 'tr' ).removeClass( 'ft-sending' ).addClass( 'ft-sended' );

                    setTimeout( function() {
                        me.closest( 'tr' ).removeClass( 'ft-sended' );
                    }, 1500 );
                }
            });
        }

        return false;
    });

}(jQuery));
