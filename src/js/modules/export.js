(function($) {

    $( '.ft-export' ).on( 'click', function() {
        var me      = $( this ),
            form_id = $( '#export_form' ).val(),
            min     = $( '#export_from_date' ).val(),
            max     = $( '#export_to_date' ).val();

        if ( ! me.is( '.ft-loading' ) ) {
            me
                .addClass( 'ft-loading' )
                .prop( 'disabled', true );

            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: ft.ajax_url,
                data: { 
                    'action': 'ft_export_responses',
                    'form_id': form_id,
                    'min': min,
                    'max': max
                },
                success: function( data ) {
                    var url = data.data.url;

                    window.location.href = url;
                    
                    me
                        .removeClass( 'ft-loading' )
                        .prop( 'disabled', false );
                }
            });
        }

        return false;
    });

}(jQuery));
