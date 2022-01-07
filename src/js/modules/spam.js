(function($) {

    $( window ).on( 'load', function() {
        if ( $( '.column-spam' ).length > 0 ) {
            $( '.column-spam' ).each( function() {
                if ( $( this ).find( 'a' ).is( '.ft-unspam' ) ) {
                    $( this ).closest( 'tr' ).addClass( 'ft-spammed' );
                }
            });
        }
    });

    $( document ).on( 'click', '.ft-spam', function() {
        var me          = $( this ),
            response_id = me.attr( 'data-response' );

        if ( ! me.is( '.is-process' ) ) {
            me
                .addClass( 'is-process' )
                .closest( 'tr' ).addClass( 'ft-spamming' );

            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: ft.ajax_url,
                data: { 
                    'action': 'ft_spam',
                    'response_id': response_id
                },
                success: function( data ) {
                    var tr    = me.closest( 'tr' ),
                        small = me.closest( 'small' );

                    me.remove();

                    if ( $( '#ft_response_info_meta_box' ).length ) {
                        small.append( '<a href="#" class="ft-unspam" data-response="' + response_id + '">Démarquer comme spam</a>' );

                    } else {
                        tr
                            .removeClass( 'ft-spamming' ).addClass( 'ft-spammed' )
                            .find( '.column-spam' )
                            .append( '<a href="#" class="ft-icon ft-unspam" title="Démarquer comme spam" data-response="' + response_id + '"><svg class="svg-icon" role="presentation"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="' + ft.plugin_dir + '/assets/img/icons.svg#radio"></use></svg></a>' );
                    }
                }
            });
        }

        return false;
    });

    $( document ).on( 'click', '.ft-unspam', function() {
        var me          = $( this ),
            response_id = me.attr( 'data-response' );

        if ( ! me.is( '.is-process' ) ) {
            me
                .addClass( 'is-process' )
                .closest( 'tr' ).addClass( 'ft-spamming' );

            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: ft.ajax_url,
                data: { 
                    'action': 'ft_unspam',
                    'response_id': response_id
                },
                success: function( data ) {
                    var tr    = me.closest( 'tr' )
                        small = me.closest( 'small' );
                    
                    me.remove();

                    if ( $( '#ft_response_info_meta_box' ).length ) {
                        small.append( '<a href="#" class="ft-spam" data-response="' + response_id + '">Marquer comme spam</a>' );
                        
                    } else {
                        tr
                            .removeClass( 'ft-spammed ft-spamming' )
                            .find( '.column-spam' )
                            .append( '<a href="#" class="ft-icon ft-spam" title="Marquer comme spam" data-response="' + response_id + '"><svg class="svg-icon" role="presentation"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="' + ft.plugin_dir + '/assets/img/icons.svg#warning"></use></svg></a>' );
                    }
                }
            });
        }

        return false;
    });

}(jQuery));