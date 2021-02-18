(function($) {

    $( '.ft-import' ).on( 'click', function() {
        var me   = $( this ),
            form = $( '#ft-import-form' )[0].files[0];

        if ( ! me.is( '.ft-loading' ) ) {
            me
                .addClass( 'ft-loading' )
                .prop( 'disabled', true );

            var formData = new FormData();
            formData.append( 'action', 'ft_import_form' );
            formData.append( 'form_id', me.attr( 'data-form' ) );
            formData.append( 'file', form );

            $.ajax({
                type: 'POST',
                url: ft.ajax_url,
                data: formData,
                processData: false,
                contentType: false,
                success: function( data ) {
                    console.log( data );

                    window.location.reload( true );
                    
                    me
                        .removeClass( 'ft-loading' )
                        .prop( 'disabled', false );
                }
            });
        }

        return false;
    });

}(jQuery));
