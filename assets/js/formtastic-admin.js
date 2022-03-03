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
                    var tr    = me.closest( 'tr' ),
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

(function($) {
    "use strict";

        $( window ).on( 'load', function() {
            formtasticInit();
        });

        function formtasticInit() {
            var curr_field;

            function formtastic_is_json_str( str ) {
                try {
                    JSON.parse( str );
                } catch(e) {
                    return false;
                }

                return true;
            }

            function ft_icon( icon ) {
                var path = ft.plugin_dir + '/assets/img/icons.svg#' + icon;

                return '<svg class="svg-icon" role="presentation"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="' + path + '"></use></svg>';
            }

            var dateFormat = 'dd-mm-yy',
                from = $( '#export_from_date' ).datepicker({
                    dateFormat: 'd-m-yy',
                    maxDate: 0

                }).on( 'change', function() {
                    to.datepicker( 'option', 'minDate', getDate( this ) );
                }),
                to = $( '#export_to_date' ).datepicker({
                    dateFormat: 'd-m-yy',
                    maxDate: 0

                }).on( 'change', function() {
                    from.datepicker( 'option', 'maxDate', getDate( this ) );
                });

            function getDate( element ) {
                var date;

                try {
                    date = $.datepicker.parseDate( dateFormat, element.value );
                } catch( error ) {
                    date = null;
                }

                return date;
            }

            $( '.ft-tabs' ).formtasticTabs();

            $( '.ft-sortable' ).disableSelection();
            $( '.ft-sortable' ).sortable({
                placeholder: 'ft-placeholder',
                forcePlaceholderSize: true,
                connectWith: '.ft-sortable',
                tolerance: 'pointer',
                start: function( event, ui ) {
                    if ( ! ui.helper.is( '.ft-create-field' ) ) {
                        var w = ui.helper.width(),
                            h = ui.helper.height();

                        ui.placeholder.width( w );
                        ui.placeholder.height( h - 1 );
                    }
                }
            });

            $( '.ft-sortable-values' ).disableSelection();
            $( '.ft-sortable-values' ).sortable({
                placeholder: 'ft-placeholder',
                forcePlaceholderSize: true
            });

            $( '.ft-sortable' ).on( 'sortreceive', function( event, ui ) {
                if ( ui.helper !== null && ui.item.is( '.ft-create-field' ) ) {
                    var field = ui.helper.attr( 'data-field' );

                    ui.helper.css( 'opacity', '0' );

                    if ( $( event.target ).is( '.ft-sortable-fieldset' ) && $( ui.item ).attr( 'data-field' ) == 'fieldset' ) {
                        ui.helper.remove();

                    } else {
                        $.ajax({
                            type: 'POST',
                            dataType: 'json',
                            url: ft.ajax_url,
                            data: {
                                'action': 'ft_create_field',
                                'field_type': field
                            },
                            success: function( data ) {
                                $( data.data.html ).insertBefore( ui.helper );

                                $( '#' + data.data.id )
                                    .closest( '.ft-field' )
                                    .find( '.ft-edit' )
                                    .trigger( 'click' );

                                if ( field == 'fieldset' ) {
                                    $( '#' + data.data.id )
                                        .closest( '.ft-field' )
                                        .find( '.ft-sortable' )
                                        .sortable({
                                            placeholder: 'ft-placeholder',
                                            forcePlaceholderSize: true,
                                            connectWith: '.ft-sortable'
                                        });
                                }

                                ui.helper.remove();
                            }
                        });
                    }
                }
            });

            $( document ).on( 'sortreceive, sortupdate', '.ft-field-fieldset .ft-sortable', function( event, ui ) {
                var me = $( this ),
                    fieldset = me.closest( '.ft-field-fieldset' );

                if ( $( event.target ).is( '.ft-sortable-fieldset' ) && $( ui.item ).is( '.ft-field-fieldset' ) ) {
                    ui.sender.sortable( 'cancel' );

                } else {
                    formtastic_add_remove_fields( fieldset );
                }
            });

            function formtastic_add_remove_fields( fieldset ) {
                if ( formtastic_is_json_str( fieldset.find( '> .ft-data' ).val() ) ) {
                    var data = JSON.parse( fieldset.find( '> .ft-data' ).val() ),
                        fields = '';

                    for ( var i = 0; i < data.length; i++ ) {
                        if ( data[i].name == 'fields' ) {
                            data.splice( i, 1 );
                            break;
                        }
                    }

                    var j = 0;
                    fieldset.find( '.ft-sortable .ft-data' ).each( function() {
                        var me = $( this ),
                            field_id = me.attr( 'id' );

                        if ( j === 0 ) {
                            fields += field_id;

                        } else {
                            fields += ',' + field_id;
                        }

                        j++;
                    });

                    if ( fields !== '' ) {
                        data.push({
                            name: 'fields',
                            value: fields
                        });
                    }

                    fieldset.find( '> .ft-data' ).val( JSON.stringify( data ) );
                }
            }

            $( '.ft-create-field' ).draggable({
                connectToSortable: '.ft-sortable',
                helper: 'clone',
                appendTo: 'body'
            });

            $( document ).on( 'click', '.ft-values[name="selection"]', function() {
                var input = $( this ),
                    sel = input.prop( 'checked' );

                if ( input.attr( 'data-prev' ) == 'true' ) {
                    input.prop( 'checked', false );
                    $( '#ft-manual' ).find( 'input[type="radio"]' ).attr( 'data-prev', 'false' );

                } else {
                    $( '#ft-manual' ).find( 'input[type="radio"]' ).attr( 'data-prev', 'false' );
                    input.attr( 'data-prev', 'true' );
                }
            });

            $( document ).on( 'click', '.ft-trash', function() {
                var field = $( this ).closest( '.ft-field' ),
                    sort  = field.closest( '.ft-sortable' );

                field.fadeOut( 300, function() {
                    field.remove();

                    if ( sort.is( '.ft-sortable-fieldset' ) ) {
                        var fieldset = sort.closest( '.ft-field-fieldset' );

                        formtastic_add_remove_fields( fieldset );
                    }
                });

                return false;
            });

            $( document ).on( 'click', '.ft-edit', function() {
                formtastic_empty_form();

                var field    = $( this ).closest( '.ft-field' ),
                    controls = field.attr( 'data-controls' ),
                    form     = $( '#ft-edit-field-form' ),
                    title    = field.find( '.ft-label' ).text(),
                    edit,
                    data;

                $( '#ft-edit-field-form' )
                    .find( '.ft-field' )
                    .hide()
                    .removeClass( 'ft-active' );

                controls = controls.split( ',' );

                for ( var i = 0; i < controls.length; i++ ) {
                    $( '#ft-' + controls[i] + '-field' )
                        .show()
                        .addClass( 'ft-active' );
                }

                curr_field = field;

                if ( formtastic_is_json_str( curr_field.find( '.ft-data' ).val() ) ) {
                    var values     = [],
                        conditions = [],
                        selection  = '',
                        holder     = $( '#ft-manual' );

                    data = JSON.parse( curr_field.find( '.ft-data' ).val() );

                    var v = 0,
                        c = 0;

                    for ( var j = 0; j < data.length; j++ ) {
                        if ( data[j].name == 'values' ) {
                            values[v] = data[j].value;
                            v++;

                        } else if ( data[j].name == 'conditions' ) {
                            conditions[c] = data[j].value;
                            c++;

                        } else if ( data[j].name == 'selection' ) {
                            selection = data[j].value;

                        } else {
                            var input = form.find( ':input[name=' + data[j].name + ']' );

                            if ( input.is( 'select' ) ) {
                                input.val( data[j].value );

                            } else if ( input.is( 'textarea' ) ) {
                                input.val( data[j].value );

                            } else {
                                switch ( input.attr( 'type' ) ) {
                                    case 'checkbox' :
                                        input.prop( 'checked', true );
                                        break;

                                    case 'text' :
                                    case 'number' :
                                    case 'hidden' :
                                        input.val( data[j].value );
                                        break;
                                }
                            }
                        }
                    }

                    if ( values ) {
                        $.ajax({
                            type: 'POST',
                            dataType: 'json',
                            url: ft.ajax_url,
                            data: {
                                'action': 'ft_create_value',
                                'values': values,
                                'conditions': conditions,
                                'selection': selection
                            },
                            success: function( data ) {
                                var html = data.data.html;

                                holder.append( html );
                            }
                        });
                    }

                    $( '.ft-values-type' ).change();
                }

                if ( ft.lang_code == 'fr' ) {
                    edit = 'Modifier';

                } else {
                    edit = 'Edit';
                }

                tb_show( edit + ' &lt;' + title + '&gt;', '#TB_inline?width=600&height=550&inlineId=ft-edit-field', null );

                $( '#ft-label' ).focus().select();

                return false;
            });

            $( document ).on( 'change', '.ft-values-type', function() {
                var target = $( this ).val();

                $( '#ft-values-field' )
                    .find( '.ft-values-tab' )
                    .hide();

                $( '#' + target ).show();
            });

            $( document ).on( 'change', '.ft-values-field input[name="values"]', function() {
                var me = $( this ),
                    selection = me.closest( '.ft-values-field' ).find( 'input[name="selection"]' );

                selection.val( me.val() );
            });

            $( document ).on( 'click', '.ft-copy', function() {
                var field = $( this ).closest( '.ft-field' ),
                    data;

                curr_field = field;

                if ( formtastic_is_json_str( curr_field.find( '.ft-data' ).val() ) ) {
                    data = curr_field.find( '.ft-data' ).val();

                    var type = JSON.parse( data )[0].value;

                    $.ajax({
                        type: 'POST',
                        dataType: 'json',
                        url: ft.ajax_url,
                        data: {
                            'action': 'ft_create_field',
                            'field_data' : data,
                            'field_type': type
                        },
                        success: function( data ) {
                            $( data.data.html ).insertBefore( field );

                            if ( curr_field.closest( '.ft-sortable' ).is( '.ft-sortable-fieldset' ) ) {
                                var fieldset = curr_field.closest( '.ft-field-fieldset' );

                                formtastic_add_remove_fields( fieldset );
                            }
                        }
                    });
                }

                return false;
            });

            $( document ).on( 'click', '.ft-add-value', function() {
                $.ajax({
                    type: 'POST',
                    dataType: 'json',
                    url: ft.ajax_url,
                    data: {
                        'action': 'ft_create_value'
                    },
                    success: function( data ) {
                        var holder = $( '#ft-manual' );

                        holder.append( data.data.html );
                    }
                });
            });

            $( document ).on( 'click', '.ft-substract-value', function() {
                var parent = $( this ).closest( '.ft-values-field' );

                parent.fadeOut( 300, function() {
                    $( this ).remove();
                });
            });

            $( '#ft-save' ).on( 'click', function() {
                var form        = $( '#ft-edit-field-form' ),
                    label       = form.find( '#ft-label' ).val(),
                    btn_label   = form.find( '#ft-btn-label' ).val(),
                    text        = form.find( '#ft-text' ).val(),
                    placeholder = form.find( '#ft-placeholder' ).val(),
                    message     = form.find( '#ft-message' ).val().replace( /\n/g, '<br \\>' ),
                    value       = form.find( '#ft-value' ).val(),
                    valuenum    = form.find( '#ft-valuenum' ).val(),
                    size        = form.find( '#ft-colsize' ).val(),
                    required    = form.find( '#ft-required' ),
                    repeat      = form.find( '#ft-repeat' ),
                    data        = JSON.stringify( $( '#ft-edit-field-form .ft-active :input' ).filter( function() {
                        return this.value || $( this ).attr( 'name' ) == 'conditions' || ( $( this ).attr( 'name' ) == 'selection' && $( this ).prop( 'checked' ) );
                    }).serializeArray() ),
                    multiple    = $( '#ft-edit-field-form .ft-values' ).filter( function() {
                        return this.value;
                    }).serializeArray();

                curr_field.removeClass( function( index, className ) {
                    return ( className.match( /(^|\s)ft-col-\S+/g ) || [] ).join( ' ' );
                }).addClass( 'ft-col-' + size );

                var display = curr_field.find( '.ft-display' ),
                    type    = curr_field.attr( 'data-type' );

                curr_field
                    .find( '> label .ft-label' )
                    .text( label );

                if ( btn_label === '' ) {
                    curr_field
                        .find( 'button' )
                        .text( curr_field.find( 'button' ).attr( 'data-label' ) );

                } else {
                    curr_field
                        .find( 'button' )
                        .text( btn_label );
                }

                curr_field
                    .find( '.ft-text' )
                    .text( text );

                if ( required.prop( 'checked' ) ) {
                    curr_field
                        .addClass( 'required' )
                        .find( '> label .ft-required' )
                        .text( '*' );

                } else {
                    curr_field
                        .removeClass( 'required' )
                        .find( '> label .ft-required' )
                        .text( '' );
                }

                if ( repeat.prop( 'checked' ) ) {
                    curr_field
                        .find( '.ft-repeat' )
                        .show();

                } else {
                    curr_field
                        .find( '.ft-repeat' )
                        .hide();
                }

                if ( display.is( 'select' ) ) {
                    display
                        .find( 'option' )
                        .text( placeholder );

                } else if ( display.is( 'div' ) ) {
                    display.html( message );

                } else {
                    if ( valuenum !== '' ) {
                        display
                            .attr( 'placeholder', placeholder )
                            .val( valuenum );

                    } else {
                        display
                            .attr( 'placeholder', placeholder )
                            .val( value );
                    }
                }

                if ( type == 'checkbox' || type == 'radio' ) {
                    curr_field.find( '.ft-choice' ).empty();
                    for ( var i = 0; i < multiple.length; i++ ) {
                        if ( multiple[i].name == 'values' ) {
                            var choice       = multiple[i].value.split( ':' ),
                                choice_label = '';

                            if ( typeof choice[1] !== 'undefined' ) {
                                choice_label = choice[1];

                            } else {
                                choice_label = choice[0];
                            }

                            curr_field
                                .find( '.ft-choice' )
                                .append( '<label><input type="' + type + '" class="ft-display" value="">' + choice_label +'</label>' );
                        }
                    }
                }

                data = data.replace( /\\r\\n/g, "<br />" );
                curr_field
                    .find( '> .ft-data' )
                    .val( data );

                tb_remove();

                if ( curr_field.closest( '.ft-sortable' ).is( '.ft-sortable-fieldset' ) ) {
                    var fieldset = curr_field.closest( '.ft-field-fieldset' );

                    formtastic_add_remove_fields( fieldset );
                }

                formtastic_empty_form();

                return false;
            });

            $( '#ft-cancel' ).on( 'click', function() {
                tb_remove();

                return false;
            });

            function formtastic_empty_form() {
                var field  = $( '#ft-edit-field-form :input' ),
                    values = $( '#ft-edit-field-form .ft-values-field' );

                field.each( function() {
                    switch ( $( this ).attr( 'type' ) ) {
                        case 'text' :
                        case 'number' :
                        case undefined :
                            $( this ).val( '' );
                            break;

                        case 'checkbox' :
                            $( this ).prop( 'checked', false );
                            break;
                    }
                });

                values.each( function() {
                    if ( ! $( this ).is( '.ft-main' ) ) {
                        $( this ).remove();
                    }
                });
            }

            $( document ).on( 'click', '.ft-autoselect', function() {
                $( this ).select();
            });

            $( '#custom_color' ).wpColorPicker();

            $( '.ft-select-tab' ).on( 'change', function() {
                var choice = $( this ).val(),
                    panel  = $( this ).closest( '.ft-tab-content' );

                panel
                    .find( '[data-tab]' )
                    .addClass( 'ft-hidden' )
                    .end()
                    .find( '[data-tab=' + choice + ']' )
                    .removeClass( 'ft-hidden' );
            });

            $( '.ft-upload-media' ).on( 'click', function() {
                var send_attachment_bkp = wp.media.editor.send.attachment;
                var button = $( this );

                wp.media.editor.send.attachment = function( props, attachment ) {
                    $( button ).parent().prev().attr( 'src', attachment.url );
                    $( button ).prev().val( attachment.id );

                    wp.media.editor.send.attachment = send_attachment_bkp;
                };

                wp.media.editor.open( button );

                return false;
            });

            $( '.ft-remove-media' ).on( 'click', function() {
                var src = $( this ).parent().prev().attr( 'data-src' );
                $( this ).parent().prev().attr( 'src', src );
                $( this ).prev().prev().val( '' );

                return false;
            });

            $( '#ft_response_form' ).on( 'change', function() {
                var me = $( this );

                if ( me.val() == '' ) {
                    $( '#ft-export-response' )
                        .attr( 'href', '#' )
                        .attr( 'disabled', true );

                } else {
                    $( '#ft-export-response' )
                        .attr( 'href', 'admin.php?action=export_responses&form=' + me.val() )
                        .attr( 'disabled', false );
                }
            });
        }

        $( window ).on( 'load', function() {
            if ( $( '#ft_response_form' ).val() == '' ) {
                $( '#ft-export-response' )
                    .attr( 'href', '#' )
                    .attr( 'disabled', true );

            } else {
                $( '#ft-export-response' )
                    .attr( 'href', 'admin.php?action=export_responses&form=' + $( '#ft_response_form' ).val() )
                    .attr( 'disabled', false );
            }
        });

}(jQuery));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV4cG9ydC5qcyIsImltcG9ydC5qcyIsInJlc2VuZC5qcyIsInNwYW0uanMiLCJ0YWJzLmpzIiwidW5yZWFkLmpzIiwiZm9ybXRhc3RpYy1hZG1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJmb3JtdGFzdGljLWFkbWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCQpIHtcblxuICAgICQoICcuZnQtZXhwb3J0JyApLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1lICAgICAgPSAkKCB0aGlzICksXG4gICAgICAgICAgICBmb3JtX2lkID0gJCggJyNleHBvcnRfZm9ybScgKS52YWwoKSxcbiAgICAgICAgICAgIG1pbiAgICAgPSAkKCAnI2V4cG9ydF9mcm9tX2RhdGUnICkudmFsKCksXG4gICAgICAgICAgICBtYXggICAgID0gJCggJyNleHBvcnRfdG9fZGF0ZScgKS52YWwoKTtcblxuICAgICAgICBpZiAoICEgbWUuaXMoICcuZnQtbG9hZGluZycgKSApIHtcbiAgICAgICAgICAgIG1lXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCAnZnQtbG9hZGluZycgKVxuICAgICAgICAgICAgICAgIC5wcm9wKCAnZGlzYWJsZWQnLCB0cnVlICk7XG5cbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgdXJsOiBmdC5hamF4X3VybCxcbiAgICAgICAgICAgICAgICBkYXRhOiB7IFxuICAgICAgICAgICAgICAgICAgICAnYWN0aW9uJzogJ2Z0X2V4cG9ydF9yZXNwb25zZXMnLFxuICAgICAgICAgICAgICAgICAgICAnZm9ybV9pZCc6IGZvcm1faWQsXG4gICAgICAgICAgICAgICAgICAgICdtaW4nOiBtaW4sXG4gICAgICAgICAgICAgICAgICAgICdtYXgnOiBtYXhcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdXJsID0gZGF0YS5kYXRhLnVybDtcblxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIG1lXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoICdmdC1sb2FkaW5nJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAucHJvcCggJ2Rpc2FibGVkJywgZmFsc2UgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxufShqUXVlcnkpKTtcbiIsIihmdW5jdGlvbigkKSB7XG5cbiAgICAkKCAnLmZ0LWltcG9ydCcgKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtZSAgID0gJCggdGhpcyApLFxuICAgICAgICAgICAgZm9ybSA9ICQoICcjZnQtaW1wb3J0LWZvcm0nIClbMF0uZmlsZXNbMF07XG5cbiAgICAgICAgaWYgKCAhIG1lLmlzKCAnLmZ0LWxvYWRpbmcnICkgKSB7XG4gICAgICAgICAgICBtZVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyggJ2Z0LWxvYWRpbmcnIClcbiAgICAgICAgICAgICAgICAucHJvcCggJ2Rpc2FibGVkJywgdHJ1ZSApO1xuXG4gICAgICAgICAgICB2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCggJ2FjdGlvbicsICdmdF9pbXBvcnRfZm9ybScgKTtcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCggJ2Zvcm1faWQnLCBtZS5hdHRyKCAnZGF0YS1mb3JtJyApICk7XG4gICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoICdmaWxlJywgZm9ybSApO1xuXG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICB1cmw6IGZ0LmFqYXhfdXJsLFxuICAgICAgICAgICAgICAgIGRhdGE6IGZvcm1EYXRhLFxuICAgICAgICAgICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250ZW50VHlwZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCBkYXRhICk7XG5cbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCggdHJ1ZSApO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyggJ2Z0LWxvYWRpbmcnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wKCAnZGlzYWJsZWQnLCBmYWxzZSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG59KGpRdWVyeSkpO1xuIiwiKGZ1bmN0aW9uKCQpIHtcblxuICAgICQoICcuZnQtcmVzZW5kJyApLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1lICAgICAgICAgID0gJCggdGhpcyApLFxuICAgICAgICAgICAgZm9ybV9pZCAgICAgPSBtZS5hdHRyKCAnZGF0YS1mb3JtJyApLFxuICAgICAgICAgICAgcmVzcG9uc2VfaWQgPSBtZS5hdHRyKCAnZGF0YS1pZCcgKTtcblxuICAgICAgICBpZiAoICEgbWUuaXMoICcuaXMtcHJvY2VzcycgKSApIHtcbiAgICAgICAgICAgIG1lXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCAnaXMtcHJvY2VzcycgKVxuICAgICAgICAgICAgICAgIC5jbG9zZXN0KCAndHInICkuYWRkQ2xhc3MoICdmdC1zZW5kaW5nJyApO1xuXG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIHVybDogZnQuYWpheF91cmwsXG4gICAgICAgICAgICAgICAgZGF0YTogeyBcbiAgICAgICAgICAgICAgICAgICAgJ2FjdGlvbic6ICdmdF9yZXNlbmQnLFxuICAgICAgICAgICAgICAgICAgICAnZm9ybV9pZCc6IGZvcm1faWQsXG4gICAgICAgICAgICAgICAgICAgICdyZXNwb25zZV9pZCc6IHJlc3BvbnNlX2lkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyggJ2lzLXByb2Nlc3MnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jbG9zZXN0KCAndHInICkucmVtb3ZlQ2xhc3MoICdmdC1zZW5kaW5nJyApLmFkZENsYXNzKCAnZnQtc2VuZGVkJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWUuY2xvc2VzdCggJ3RyJyApLnJlbW92ZUNsYXNzKCAnZnQtc2VuZGVkJyApO1xuICAgICAgICAgICAgICAgICAgICB9LCAxNTAwICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbn0oalF1ZXJ5KSk7XG4iLCIoZnVuY3Rpb24oJCkge1xuXG4gICAgJCggd2luZG93ICkub24oICdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICggJCggJy5jb2x1bW4tc3BhbScgKS5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgJCggJy5jb2x1bW4tc3BhbScgKS5lYWNoKCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAoICQoIHRoaXMgKS5maW5kKCAnYScgKS5pcyggJy5mdC11bnNwYW0nICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICQoIHRoaXMgKS5jbG9zZXN0KCAndHInICkuYWRkQ2xhc3MoICdmdC1zcGFtbWVkJyApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAkKCBkb2N1bWVudCApLm9uKCAnY2xpY2snLCAnLmZ0LXNwYW0nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1lICAgICAgICAgID0gJCggdGhpcyApLFxuICAgICAgICAgICAgcmVzcG9uc2VfaWQgPSBtZS5hdHRyKCAnZGF0YS1yZXNwb25zZScgKTtcblxuICAgICAgICBpZiAoICEgbWUuaXMoICcuaXMtcHJvY2VzcycgKSApIHtcbiAgICAgICAgICAgIG1lXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCAnaXMtcHJvY2VzcycgKVxuICAgICAgICAgICAgICAgIC5jbG9zZXN0KCAndHInICkuYWRkQ2xhc3MoICdmdC1zcGFtbWluZycgKTtcblxuICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICB1cmw6IGZ0LmFqYXhfdXJsLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2FjdGlvbic6ICdmdF9zcGFtJyxcbiAgICAgICAgICAgICAgICAgICAgJ3Jlc3BvbnNlX2lkJzogcmVzcG9uc2VfaWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHIgICAgPSBtZS5jbG9zZXN0KCAndHInICksXG4gICAgICAgICAgICAgICAgICAgICAgICBzbWFsbCA9IG1lLmNsb3Nlc3QoICdzbWFsbCcgKTtcblxuICAgICAgICAgICAgICAgICAgICBtZS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoICQoICcjZnRfcmVzcG9uc2VfaW5mb19tZXRhX2JveCcgKS5sZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzbWFsbC5hcHBlbmQoICc8YSBocmVmPVwiI1wiIGNsYXNzPVwiZnQtdW5zcGFtXCIgZGF0YS1yZXNwb25zZT1cIicgKyByZXNwb25zZV9pZCArICdcIj5Ew6ltYXJxdWVyIGNvbW1lIHNwYW08L2E+JyApO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0clxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyggJ2Z0LXNwYW1taW5nJyApLmFkZENsYXNzKCAnZnQtc3BhbW1lZCcgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCAnLmNvbHVtbi1zcGFtJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCggJzxhIGhyZWY9XCIjXCIgY2xhc3M9XCJmdC1pY29uIGZ0LXVuc3BhbVwiIHRpdGxlPVwiRMOpbWFycXVlciBjb21tZSBzcGFtXCIgZGF0YS1yZXNwb25zZT1cIicgKyByZXNwb25zZV9pZCArICdcIj48c3ZnIGNsYXNzPVwic3ZnLWljb25cIiByb2xlPVwicHJlc2VudGF0aW9uXCI+PHVzZSB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4bGluazpocmVmPVwiJyArIGZ0LnBsdWdpbl9kaXIgKyAnL2Fzc2V0cy9pbWcvaWNvbnMuc3ZnI3JhZGlvXCI+PC91c2U+PC9zdmc+PC9hPicgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gICAgJCggZG9jdW1lbnQgKS5vbiggJ2NsaWNrJywgJy5mdC11bnNwYW0nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1lICAgICAgICAgID0gJCggdGhpcyApLFxuICAgICAgICAgICAgcmVzcG9uc2VfaWQgPSBtZS5hdHRyKCAnZGF0YS1yZXNwb25zZScgKTtcblxuICAgICAgICBpZiAoICEgbWUuaXMoICcuaXMtcHJvY2VzcycgKSApIHtcbiAgICAgICAgICAgIG1lXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCAnaXMtcHJvY2VzcycgKVxuICAgICAgICAgICAgICAgIC5jbG9zZXN0KCAndHInICkuYWRkQ2xhc3MoICdmdC1zcGFtbWluZycgKTtcblxuICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICB1cmw6IGZ0LmFqYXhfdXJsLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2FjdGlvbic6ICdmdF91bnNwYW0nLFxuICAgICAgICAgICAgICAgICAgICAncmVzcG9uc2VfaWQnOiByZXNwb25zZV9pZFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0ciAgICA9IG1lLmNsb3Nlc3QoICd0cicgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNtYWxsID0gbWUuY2xvc2VzdCggJ3NtYWxsJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIG1lLnJlbW92ZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggJCggJyNmdF9yZXNwb25zZV9pbmZvX21ldGFfYm94JyApLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNtYWxsLmFwcGVuZCggJzxhIGhyZWY9XCIjXCIgY2xhc3M9XCJmdC1zcGFtXCIgZGF0YS1yZXNwb25zZT1cIicgKyByZXNwb25zZV9pZCArICdcIj5NYXJxdWVyIGNvbW1lIHNwYW08L2E+JyApO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0clxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyggJ2Z0LXNwYW1tZWQgZnQtc3BhbW1pbmcnIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmluZCggJy5jb2x1bW4tc3BhbScgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoICc8YSBocmVmPVwiI1wiIGNsYXNzPVwiZnQtaWNvbiBmdC1zcGFtXCIgdGl0bGU9XCJNYXJxdWVyIGNvbW1lIHNwYW1cIiBkYXRhLXJlc3BvbnNlPVwiJyArIHJlc3BvbnNlX2lkICsgJ1wiPjxzdmcgY2xhc3M9XCJzdmctaWNvblwiIHJvbGU9XCJwcmVzZW50YXRpb25cIj48dXNlIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHhsaW5rOmhyZWY9XCInICsgZnQucGx1Z2luX2RpciArICcvYXNzZXRzL2ltZy9pY29ucy5zdmcjd2FybmluZ1wiPjwvdXNlPjwvc3ZnPjwvYT4nICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxufShqUXVlcnkpKTsiLCIoZnVuY3Rpb24oJCkge1xuXG4gICAgalF1ZXJ5LmZuLmZvcm10YXN0aWNUYWJzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKCB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICAgIHZhciBwcm9wZXJ0eSA9IGFyZ3VtZW50c1sxXSxcbiAgICAgICAgICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoIGFyZ3VtZW50cyApO1xuXG4gICAgICAgICAgICBhcmdzLnNwbGljZSggMCwgMSApO1xuXG4gICAgICAgICAgICBtZXRob2RzW2FyZ3VtZW50c1swXV0uYXBwbHkoIHRoaXMsIGFyZ3MgKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5pdC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaW5pdCggb3B0aW9ucyApIHtcbiAgICAgICAgdGhpcy5lYWNoKCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0YWJzID0gJCggdGhpcyApO1xuXG4gICAgICAgICAgICB0YWJzLmZpbmQoICcuZnQtdGFicy1uYXYgYScgKS5lYWNoKCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFiID0gJCggdGhpcyApO1xuXG4gICAgICAgICAgICAgICAgaWYgKCB0YWIuaXMoICcuYWN0aXZlJyApICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gdGFiLmF0dHIoICdocmVmJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIHRhYnNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCB0YXJnZXQgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCAnYWN0aXZlJyApO1xuICAgICAgICAgICAgICAgIH0gIFxuXG4gICAgICAgICAgICB9KS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRhYiA9ICQoIHRoaXMgKSxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFiLmF0dHIoICdocmVmJyApLFxuICAgICAgICAgICAgICAgICAgICBuYXYgPSB0YWJzLmZpbmQoICcuZnQtdGFicy1uYXYnICk7XG5cbiAgICAgICAgICAgICAgICBpZiAoICF0YWIuaXMoICcuYWN0aXZlJyApICkge1xuICAgICAgICAgICAgICAgICAgICBuYXYuZmluZCggJy5hY3RpdmUnICkucmVtb3ZlQ2xhc3MoICdhY3RpdmUnICk7XG4gICAgICAgICAgICAgICAgICAgIHRhYi5hZGRDbGFzcyggJ2FjdGl2ZScgKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRhYnNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCAnLmZ0LXRhYi1jb250ZW50LmFjdGl2ZScgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCAnYWN0aXZlJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAuZW5kKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCB0YXJnZXQgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCAnYWN0aXZlJyApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbn0oalF1ZXJ5KSk7XG4iLCIoZnVuY3Rpb24oJCkge1xuXG4gICAgJCggJy5mdC11bnJlYWQnICkub24oICdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbWUgICAgICAgICAgPSAkKCB0aGlzICksXG4gICAgICAgICAgICByZXNwb25zZV9pZCA9IG1lLmF0dHIoICdkYXRhLWlkJyApO1xuXG4gICAgICAgIGlmICggISBtZS5pcyggJy5pcy1wcm9jZXNzJyApICkge1xuICAgICAgICAgICAgbWUuYWRkQ2xhc3MoICdpcy1wcm9jZXNzJyApO1xuXG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIHVybDogZnQuYWpheF91cmwsXG4gICAgICAgICAgICAgICAgZGF0YTogeyBcbiAgICAgICAgICAgICAgICAgICAgJ2FjdGlvbic6ICdmdF9yZWFkJyxcbiAgICAgICAgICAgICAgICAgICAgJ3Jlc3BvbnNlX2lkJzogcmVzcG9uc2VfaWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGF0aCA9IG1lLmZpbmQoICdzdmcnICkuYXR0ciggJ2RhdGEtcGF0aCcgKTtcblxuICAgICAgICAgICAgICAgICAgICBtZS5yZW1vdmVDbGFzcyggJ2Z0LXVucmVhZCcgKS5hZGRDbGFzcyggJ2Z0LXJlYWQnICk7XG5cbiAgICAgICAgICAgICAgICAgICAgbWUuZmluZCggJ3N2ZyB1c2UnICkuYXR0ciggJ3hsaW5rOmhyZWYnLCBwYXRoICsgJyNtYWlsLW9wZW4nICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbn0oalF1ZXJ5KSk7XG4iLCIoZnVuY3Rpb24oJCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgICAgICQoIHdpbmRvdyApLm9uKCAnbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZm9ybXRhc3RpY0luaXQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gZm9ybXRhc3RpY0luaXQoKSB7XG4gICAgICAgICAgICB2YXIgY3Vycl9maWVsZDtcblxuICAgICAgICAgICAgZnVuY3Rpb24gZm9ybXRhc3RpY19pc19qc29uX3N0ciggc3RyICkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoIHN0ciApO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGZ0X2ljb24oIGljb24gKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhdGggPSBmdC5wbHVnaW5fZGlyICsgJy9hc3NldHMvaW1nL2ljb25zLnN2ZyMnICsgaWNvbjtcblxuICAgICAgICAgICAgICAgIHJldHVybiAnPHN2ZyBjbGFzcz1cInN2Zy1pY29uXCIgcm9sZT1cInByZXNlbnRhdGlvblwiPjx1c2UgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeGxpbms6aHJlZj1cIicgKyBwYXRoICsgJ1wiPjwvdXNlPjwvc3ZnPic7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBkYXRlRm9ybWF0ID0gJ2RkLW1tLXl5JyxcbiAgICAgICAgICAgICAgICBmcm9tID0gJCggJyNleHBvcnRfZnJvbV9kYXRlJyApLmRhdGVwaWNrZXIoe1xuICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiAnZC1tLXl5JyxcbiAgICAgICAgICAgICAgICAgICAgbWF4RGF0ZTogMFxuXG4gICAgICAgICAgICAgICAgfSkub24oICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdG8uZGF0ZXBpY2tlciggJ29wdGlvbicsICdtaW5EYXRlJywgZ2V0RGF0ZSggdGhpcyApICk7XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgdG8gPSAkKCAnI2V4cG9ydF90b19kYXRlJyApLmRhdGVwaWNrZXIoe1xuICAgICAgICAgICAgICAgICAgICBkYXRlRm9ybWF0OiAnZC1tLXl5JyxcbiAgICAgICAgICAgICAgICAgICAgbWF4RGF0ZTogMFxuXG4gICAgICAgICAgICAgICAgfSkub24oICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbS5kYXRlcGlja2VyKCAnb3B0aW9uJywgJ21heERhdGUnLCBnZXREYXRlKCB0aGlzICkgKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0RGF0ZSggZWxlbWVudCApIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZTtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGUgPSAkLmRhdGVwaWNrZXIucGFyc2VEYXRlKCBkYXRlRm9ybWF0LCBlbGVtZW50LnZhbHVlICk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCggZXJyb3IgKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGUgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkKCAnLmZ0LXRhYnMnICkuZm9ybXRhc3RpY1RhYnMoKTtcblxuICAgICAgICAgICAgJCggJy5mdC1zb3J0YWJsZScgKS5kaXNhYmxlU2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAkKCAnLmZ0LXNvcnRhYmxlJyApLnNvcnRhYmxlKHtcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ2Z0LXBsYWNlaG9sZGVyJyxcbiAgICAgICAgICAgICAgICBmb3JjZVBsYWNlaG9sZGVyU2l6ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb25uZWN0V2l0aDogJy5mdC1zb3J0YWJsZScsXG4gICAgICAgICAgICAgICAgdG9sZXJhbmNlOiAncG9pbnRlcicsXG4gICAgICAgICAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggISB1aS5oZWxwZXIuaXMoICcuZnQtY3JlYXRlLWZpZWxkJyApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHcgPSB1aS5oZWxwZXIud2lkdGgoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoID0gdWkuaGVscGVyLmhlaWdodCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB1aS5wbGFjZWhvbGRlci53aWR0aCggdyApO1xuICAgICAgICAgICAgICAgICAgICAgICAgdWkucGxhY2Vob2xkZXIuaGVpZ2h0KCBoIC0gMSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICQoICcuZnQtc29ydGFibGUtdmFsdWVzJyApLmRpc2FibGVTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICQoICcuZnQtc29ydGFibGUtdmFsdWVzJyApLnNvcnRhYmxlKHtcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ2Z0LXBsYWNlaG9sZGVyJyxcbiAgICAgICAgICAgICAgICBmb3JjZVBsYWNlaG9sZGVyU2l6ZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICQoICcuZnQtc29ydGFibGUnICkub24oICdzb3J0cmVjZWl2ZScsIGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCB1aS5oZWxwZXIgIT09IG51bGwgJiYgdWkuaXRlbS5pcyggJy5mdC1jcmVhdGUtZmllbGQnICkgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmaWVsZCA9IHVpLmhlbHBlci5hdHRyKCAnZGF0YS1maWVsZCcgKTtcblxuICAgICAgICAgICAgICAgICAgICB1aS5oZWxwZXIuY3NzKCAnb3BhY2l0eScsICcwJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggJCggZXZlbnQudGFyZ2V0ICkuaXMoICcuZnQtc29ydGFibGUtZmllbGRzZXQnICkgJiYgJCggdWkuaXRlbSApLmF0dHIoICdkYXRhLWZpZWxkJyApID09ICdmaWVsZHNldCcgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1aS5oZWxwZXIucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBmdC5hamF4X3VybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhY3Rpb24nOiAnZnRfY3JlYXRlX2ZpZWxkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2ZpZWxkX3R5cGUnOiBmaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoIGRhdGEuZGF0YS5odG1sICkuaW5zZXJ0QmVmb3JlKCB1aS5oZWxwZXIgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCAnIycgKyBkYXRhLmRhdGEuaWQgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNsb3Nlc3QoICcuZnQtZmllbGQnIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCAnLmZ0LWVkaXQnIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50cmlnZ2VyKCAnY2xpY2snICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBmaWVsZCA9PSAnZmllbGRzZXQnICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCggJyMnICsgZGF0YS5kYXRhLmlkIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2xvc2VzdCggJy5mdC1maWVsZCcgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCAnLmZ0LXNvcnRhYmxlJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNvcnRhYmxlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdmdC1wbGFjZWhvbGRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcmNlUGxhY2Vob2xkZXJTaXplOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25uZWN0V2l0aDogJy5mdC1zb3J0YWJsZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVpLmhlbHBlci5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkKCBkb2N1bWVudCApLm9uKCAnc29ydHJlY2VpdmUsIHNvcnR1cGRhdGUnLCAnLmZ0LWZpZWxkLWZpZWxkc2V0IC5mdC1zb3J0YWJsZScsIGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1lID0gJCggdGhpcyApLFxuICAgICAgICAgICAgICAgICAgICBmaWVsZHNldCA9IG1lLmNsb3Nlc3QoICcuZnQtZmllbGQtZmllbGRzZXQnICk7XG5cbiAgICAgICAgICAgICAgICBpZiAoICQoIGV2ZW50LnRhcmdldCApLmlzKCAnLmZ0LXNvcnRhYmxlLWZpZWxkc2V0JyApICYmICQoIHVpLml0ZW0gKS5pcyggJy5mdC1maWVsZC1maWVsZHNldCcgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgdWkuc2VuZGVyLnNvcnRhYmxlKCAnY2FuY2VsJyApO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybXRhc3RpY19hZGRfcmVtb3ZlX2ZpZWxkcyggZmllbGRzZXQgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gZm9ybXRhc3RpY19hZGRfcmVtb3ZlX2ZpZWxkcyggZmllbGRzZXQgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBmb3JtdGFzdGljX2lzX2pzb25fc3RyKCBmaWVsZHNldC5maW5kKCAnPiAuZnQtZGF0YScgKS52YWwoKSApICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UoIGZpZWxkc2V0LmZpbmQoICc+IC5mdC1kYXRhJyApLnZhbCgpICksXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZHMgPSAnJztcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBkYXRhW2ldLm5hbWUgPT0gJ2ZpZWxkcycgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5zcGxpY2UoIGksIDEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBqID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZmllbGRzZXQuZmluZCggJy5mdC1zb3J0YWJsZSAuZnQtZGF0YScgKS5lYWNoKCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZSA9ICQoIHRoaXMgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWVsZF9pZCA9IG1lLmF0dHIoICdpZCcgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBqID09PSAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkcyArPSBmaWVsZF9pZDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWVsZHMgKz0gJywnICsgZmllbGRfaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGorKztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBmaWVsZHMgIT09ICcnICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZmllbGRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZmllbGRzXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkc2V0LmZpbmQoICc+IC5mdC1kYXRhJyApLnZhbCggSlNPTi5zdHJpbmdpZnkoIGRhdGEgKSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJCggJy5mdC1jcmVhdGUtZmllbGQnICkuZHJhZ2dhYmxlKHtcbiAgICAgICAgICAgICAgICBjb25uZWN0VG9Tb3J0YWJsZTogJy5mdC1zb3J0YWJsZScsXG4gICAgICAgICAgICAgICAgaGVscGVyOiAnY2xvbmUnLFxuICAgICAgICAgICAgICAgIGFwcGVuZFRvOiAnYm9keSdcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkKCBkb2N1bWVudCApLm9uKCAnY2xpY2snLCAnLmZ0LXZhbHVlc1tuYW1lPVwic2VsZWN0aW9uXCJdJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlucHV0ID0gJCggdGhpcyApLFxuICAgICAgICAgICAgICAgICAgICBzZWwgPSBpbnB1dC5wcm9wKCAnY2hlY2tlZCcgKTtcblxuICAgICAgICAgICAgICAgIGlmICggaW5wdXQuYXR0ciggJ2RhdGEtcHJldicgKSA9PSAndHJ1ZScgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlucHV0LnByb3AoICdjaGVja2VkJywgZmFsc2UgKTtcbiAgICAgICAgICAgICAgICAgICAgJCggJyNmdC1tYW51YWwnICkuZmluZCggJ2lucHV0W3R5cGU9XCJyYWRpb1wiXScgKS5hdHRyKCAnZGF0YS1wcmV2JywgJ2ZhbHNlJyApO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJCggJyNmdC1tYW51YWwnICkuZmluZCggJ2lucHV0W3R5cGU9XCJyYWRpb1wiXScgKS5hdHRyKCAnZGF0YS1wcmV2JywgJ2ZhbHNlJyApO1xuICAgICAgICAgICAgICAgICAgICBpbnB1dC5hdHRyKCAnZGF0YS1wcmV2JywgJ3RydWUnICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICQoIGRvY3VtZW50ICkub24oICdjbGljaycsICcuZnQtdHJhc2gnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmllbGQgPSAkKCB0aGlzICkuY2xvc2VzdCggJy5mdC1maWVsZCcgKSxcbiAgICAgICAgICAgICAgICAgICAgc29ydCAgPSBmaWVsZC5jbG9zZXN0KCAnLmZ0LXNvcnRhYmxlJyApO1xuXG4gICAgICAgICAgICAgICAgZmllbGQuZmFkZU91dCggMzAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGQucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBzb3J0LmlzKCAnLmZ0LXNvcnRhYmxlLWZpZWxkc2V0JyApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZpZWxkc2V0ID0gc29ydC5jbG9zZXN0KCAnLmZ0LWZpZWxkLWZpZWxkc2V0JyApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtdGFzdGljX2FkZF9yZW1vdmVfZmllbGRzKCBmaWVsZHNldCApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJCggZG9jdW1lbnQgKS5vbiggJ2NsaWNrJywgJy5mdC1lZGl0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZm9ybXRhc3RpY19lbXB0eV9mb3JtKCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgZmllbGQgICAgPSAkKCB0aGlzICkuY2xvc2VzdCggJy5mdC1maWVsZCcgKSxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbHMgPSBmaWVsZC5hdHRyKCAnZGF0YS1jb250cm9scycgKSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybSAgICAgPSAkKCAnI2Z0LWVkaXQtZmllbGQtZm9ybScgKSxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgICAgPSBmaWVsZC5maW5kKCAnLmZ0LWxhYmVsJyApLnRleHQoKSxcbiAgICAgICAgICAgICAgICAgICAgZWRpdCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTtcblxuICAgICAgICAgICAgICAgICQoICcjZnQtZWRpdC1maWVsZC1mb3JtJyApXG4gICAgICAgICAgICAgICAgICAgIC5maW5kKCAnLmZ0LWZpZWxkJyApXG4gICAgICAgICAgICAgICAgICAgIC5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCAnZnQtYWN0aXZlJyApO1xuXG4gICAgICAgICAgICAgICAgY29udHJvbHMgPSBjb250cm9scy5zcGxpdCggJywnICk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBjb250cm9scy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICAgICAgJCggJyNmdC0nICsgY29udHJvbHNbaV0gKyAnLWZpZWxkJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoICdmdC1hY3RpdmUnICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY3Vycl9maWVsZCA9IGZpZWxkO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBmb3JtdGFzdGljX2lzX2pzb25fc3RyKCBjdXJyX2ZpZWxkLmZpbmQoICcuZnQtZGF0YScgKS52YWwoKSApICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWVzICAgICA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZGl0aW9ucyA9IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uICA9ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaG9sZGVyICAgICA9ICQoICcjZnQtbWFudWFsJyApO1xuXG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKCBjdXJyX2ZpZWxkLmZpbmQoICcuZnQtZGF0YScgKS52YWwoKSApO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB2ID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgPSAwO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAoIHZhciBqID0gMDsgaiA8IGRhdGEubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGRhdGFbal0ubmFtZSA9PSAndmFsdWVzJyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXNbdl0gPSBkYXRhW2pdLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHYrKztcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggZGF0YVtqXS5uYW1lID09ICdjb25kaXRpb25zJyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25kaXRpb25zW2NdID0gZGF0YVtqXS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjKys7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIGRhdGFbal0ubmFtZSA9PSAnc2VsZWN0aW9uJyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb24gPSBkYXRhW2pdLnZhbHVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbnB1dCA9IGZvcm0uZmluZCggJzppbnB1dFtuYW1lPScgKyBkYXRhW2pdLm5hbWUgKyAnXScgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggaW5wdXQuaXMoICdzZWxlY3QnICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LnZhbCggZGF0YVtqXS52YWx1ZSApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggaW5wdXQuaXMoICd0ZXh0YXJlYScgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQudmFsKCBkYXRhW2pdLnZhbHVlICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKCBpbnB1dC5hdHRyKCAndHlwZScgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NoZWNrYm94JyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQucHJvcCggJ2NoZWNrZWQnLCB0cnVlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RleHQnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ251bWJlcicgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnaGlkZGVuJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQudmFsKCBkYXRhW2pdLnZhbHVlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoIHZhbHVlcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBmdC5hamF4X3VybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhY3Rpb24nOiAnZnRfY3JlYXRlX3ZhbHVlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlcyc6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NvbmRpdGlvbnMnOiBjb25kaXRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc2VsZWN0aW9uJzogc2VsZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBkYXRhLmRhdGEuaHRtbDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob2xkZXIuYXBwZW5kKCBodG1sICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAkKCAnLmZ0LXZhbHVlcy10eXBlJyApLmNoYW5nZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICggZnQubGFuZ19jb2RlID09ICdmcicgKSB7XG4gICAgICAgICAgICAgICAgICAgIGVkaXQgPSAnTW9kaWZpZXInO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWRpdCA9ICdFZGl0JztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0Yl9zaG93KCBlZGl0ICsgJyAmbHQ7JyArIHRpdGxlICsgJyZndDsnLCAnI1RCX2lubGluZT93aWR0aD02MDAmaGVpZ2h0PTU1MCZpbmxpbmVJZD1mdC1lZGl0LWZpZWxkJywgbnVsbCApO1xuXG4gICAgICAgICAgICAgICAgJCggJyNmdC1sYWJlbCcgKS5mb2N1cygpLnNlbGVjdCgpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICQoIGRvY3VtZW50ICkub24oICdjaGFuZ2UnLCAnLmZ0LXZhbHVlcy10eXBlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRhcmdldCA9ICQoIHRoaXMgKS52YWwoKTtcblxuICAgICAgICAgICAgICAgICQoICcjZnQtdmFsdWVzLWZpZWxkJyApXG4gICAgICAgICAgICAgICAgICAgIC5maW5kKCAnLmZ0LXZhbHVlcy10YWInIClcbiAgICAgICAgICAgICAgICAgICAgLmhpZGUoKTtcblxuICAgICAgICAgICAgICAgICQoICcjJyArIHRhcmdldCApLnNob3coKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkKCBkb2N1bWVudCApLm9uKCAnY2hhbmdlJywgJy5mdC12YWx1ZXMtZmllbGQgaW5wdXRbbmFtZT1cInZhbHVlc1wiXScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBtZSA9ICQoIHRoaXMgKSxcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uID0gbWUuY2xvc2VzdCggJy5mdC12YWx1ZXMtZmllbGQnICkuZmluZCggJ2lucHV0W25hbWU9XCJzZWxlY3Rpb25cIl0nICk7XG5cbiAgICAgICAgICAgICAgICBzZWxlY3Rpb24udmFsKCBtZS52YWwoKSApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICQoIGRvY3VtZW50ICkub24oICdjbGljaycsICcuZnQtY29weScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBmaWVsZCA9ICQoIHRoaXMgKS5jbG9zZXN0KCAnLmZ0LWZpZWxkJyApLFxuICAgICAgICAgICAgICAgICAgICBkYXRhO1xuXG4gICAgICAgICAgICAgICAgY3Vycl9maWVsZCA9IGZpZWxkO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBmb3JtdGFzdGljX2lzX2pzb25fc3RyKCBjdXJyX2ZpZWxkLmZpbmQoICcuZnQtZGF0YScgKS52YWwoKSApICkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gY3Vycl9maWVsZC5maW5kKCAnLmZ0LWRhdGEnICkudmFsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBKU09OLnBhcnNlKCBkYXRhIClbMF0udmFsdWU7XG5cbiAgICAgICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGZ0LmFqYXhfdXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhY3Rpb24nOiAnZnRfY3JlYXRlX2ZpZWxkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZmllbGRfZGF0YScgOiBkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmaWVsZF90eXBlJzogdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoIGRhdGEuZGF0YS5odG1sICkuaW5zZXJ0QmVmb3JlKCBmaWVsZCApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBjdXJyX2ZpZWxkLmNsb3Nlc3QoICcuZnQtc29ydGFibGUnICkuaXMoICcuZnQtc29ydGFibGUtZmllbGRzZXQnICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaWVsZHNldCA9IGN1cnJfZmllbGQuY2xvc2VzdCggJy5mdC1maWVsZC1maWVsZHNldCcgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtdGFzdGljX2FkZF9yZW1vdmVfZmllbGRzKCBmaWVsZHNldCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICQoIGRvY3VtZW50ICkub24oICdjbGljaycsICcuZnQtYWRkLXZhbHVlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgICAgICB1cmw6IGZ0LmFqYXhfdXJsLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnYWN0aW9uJzogJ2Z0X2NyZWF0ZV92YWx1ZSdcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaG9sZGVyID0gJCggJyNmdC1tYW51YWwnICk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGhvbGRlci5hcHBlbmQoIGRhdGEuZGF0YS5odG1sICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAkKCBkb2N1bWVudCApLm9uKCAnY2xpY2snLCAnLmZ0LXN1YnN0cmFjdC12YWx1ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSAkKCB0aGlzICkuY2xvc2VzdCggJy5mdC12YWx1ZXMtZmllbGQnICk7XG5cbiAgICAgICAgICAgICAgICBwYXJlbnQuZmFkZU91dCggMzAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJCggdGhpcyApLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICQoICcjZnQtc2F2ZScgKS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZvcm0gICAgICAgID0gJCggJyNmdC1lZGl0LWZpZWxkLWZvcm0nICksXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsICAgICAgID0gZm9ybS5maW5kKCAnI2Z0LWxhYmVsJyApLnZhbCgpLFxuICAgICAgICAgICAgICAgICAgICBidG5fbGFiZWwgICA9IGZvcm0uZmluZCggJyNmdC1idG4tbGFiZWwnICkudmFsKCksXG4gICAgICAgICAgICAgICAgICAgIHRleHQgICAgICAgID0gZm9ybS5maW5kKCAnI2Z0LXRleHQnICkudmFsKCksXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gZm9ybS5maW5kKCAnI2Z0LXBsYWNlaG9sZGVyJyApLnZhbCgpLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlICAgICA9IGZvcm0uZmluZCggJyNmdC1tZXNzYWdlJyApLnZhbCgpLnJlcGxhY2UoIC9cXG4vZywgJzxiciBcXFxcPicgKSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgICAgICAgPSBmb3JtLmZpbmQoICcjZnQtdmFsdWUnICkudmFsKCksXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlbnVtICAgID0gZm9ybS5maW5kKCAnI2Z0LXZhbHVlbnVtJyApLnZhbCgpLFxuICAgICAgICAgICAgICAgICAgICBzaXplICAgICAgICA9IGZvcm0uZmluZCggJyNmdC1jb2xzaXplJyApLnZhbCgpLFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZCAgICA9IGZvcm0uZmluZCggJyNmdC1yZXF1aXJlZCcgKSxcbiAgICAgICAgICAgICAgICAgICAgcmVwZWF0ICAgICAgPSBmb3JtLmZpbmQoICcjZnQtcmVwZWF0JyApLFxuICAgICAgICAgICAgICAgICAgICBkYXRhICAgICAgICA9IEpTT04uc3RyaW5naWZ5KCAkKCAnI2Z0LWVkaXQtZmllbGQtZm9ybSAuZnQtYWN0aXZlIDppbnB1dCcgKS5maWx0ZXIoIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWUgfHwgJCggdGhpcyApLmF0dHIoICduYW1lJyApID09ICdjb25kaXRpb25zJyB8fCAoICQoIHRoaXMgKS5hdHRyKCAnbmFtZScgKSA9PSAnc2VsZWN0aW9uJyAmJiAkKCB0aGlzICkucHJvcCggJ2NoZWNrZWQnICkgKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuc2VyaWFsaXplQXJyYXkoKSApLFxuICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZSAgICA9ICQoICcjZnQtZWRpdC1maWVsZC1mb3JtIC5mdC12YWx1ZXMnICkuZmlsdGVyKCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9KS5zZXJpYWxpemVBcnJheSgpO1xuXG4gICAgICAgICAgICAgICAgY3Vycl9maWVsZC5yZW1vdmVDbGFzcyggZnVuY3Rpb24oIGluZGV4LCBjbGFzc05hbWUgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoIGNsYXNzTmFtZS5tYXRjaCggLyhefFxccylmdC1jb2wtXFxTKy9nICkgfHwgW10gKS5qb2luKCAnICcgKTtcbiAgICAgICAgICAgICAgICB9KS5hZGRDbGFzcyggJ2Z0LWNvbC0nICsgc2l6ZSApO1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpc3BsYXkgPSBjdXJyX2ZpZWxkLmZpbmQoICcuZnQtZGlzcGxheScgKSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZSAgICA9IGN1cnJfZmllbGQuYXR0ciggJ2RhdGEtdHlwZScgKTtcblxuICAgICAgICAgICAgICAgIGN1cnJfZmllbGRcbiAgICAgICAgICAgICAgICAgICAgLmZpbmQoICc+IGxhYmVsIC5mdC1sYWJlbCcgKVxuICAgICAgICAgICAgICAgICAgICAudGV4dCggbGFiZWwgKTtcblxuICAgICAgICAgICAgICAgIGlmICggYnRuX2xhYmVsID09PSAnJyApIHtcbiAgICAgICAgICAgICAgICAgICAgY3Vycl9maWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmQoICdidXR0b24nIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50ZXh0KCBjdXJyX2ZpZWxkLmZpbmQoICdidXR0b24nICkuYXR0ciggJ2RhdGEtbGFiZWwnICkgKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJfZmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCAnYnV0dG9uJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAudGV4dCggYnRuX2xhYmVsICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY3Vycl9maWVsZFxuICAgICAgICAgICAgICAgICAgICAuZmluZCggJy5mdC10ZXh0JyApXG4gICAgICAgICAgICAgICAgICAgIC50ZXh0KCB0ZXh0ICk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIHJlcXVpcmVkLnByb3AoICdjaGVja2VkJyApICkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyX2ZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoICdyZXF1aXJlZCcgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmQoICc+IGxhYmVsIC5mdC1yZXF1aXJlZCcgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoICcqJyApO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3Vycl9maWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCAncmVxdWlyZWQnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCAnPiBsYWJlbCAuZnQtcmVxdWlyZWQnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50ZXh0KCAnJyApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICggcmVwZWF0LnByb3AoICdjaGVja2VkJyApICkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyX2ZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmluZCggJy5mdC1yZXBlYXQnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zaG93KCk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdXJyX2ZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmluZCggJy5mdC1yZXBlYXQnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCBkaXNwbGF5LmlzKCAnc2VsZWN0JyApICkge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5XG4gICAgICAgICAgICAgICAgICAgICAgICAuZmluZCggJ29wdGlvbicgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoIHBsYWNlaG9sZGVyICk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBkaXNwbGF5LmlzKCAnZGl2JyApICkge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5Lmh0bWwoIG1lc3NhZ2UgKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggdmFsdWVudW0gIT09ICcnICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCAncGxhY2Vob2xkZXInLCBwbGFjZWhvbGRlciApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnZhbCggdmFsdWVudW0gKTtcblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCAncGxhY2Vob2xkZXInLCBwbGFjZWhvbGRlciApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnZhbCggdmFsdWUgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICggdHlwZSA9PSAnY2hlY2tib3gnIHx8IHR5cGUgPT0gJ3JhZGlvJyApIHtcbiAgICAgICAgICAgICAgICAgICAgY3Vycl9maWVsZC5maW5kKCAnLmZ0LWNob2ljZScgKS5lbXB0eSgpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBtdWx0aXBsZS5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbXVsdGlwbGVbaV0ubmFtZSA9PSAndmFsdWVzJyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2hvaWNlICAgICAgID0gbXVsdGlwbGVbaV0udmFsdWUuc3BsaXQoICc6JyApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2VfbGFiZWwgPSAnJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggdHlwZW9mIGNob2ljZVsxXSAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZV9sYWJlbCA9IGNob2ljZVsxXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZV9sYWJlbCA9IGNob2ljZVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyX2ZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKCAnLmZ0LWNob2ljZScgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKCAnPGxhYmVsPjxpbnB1dCB0eXBlPVwiJyArIHR5cGUgKyAnXCIgY2xhc3M9XCJmdC1kaXNwbGF5XCIgdmFsdWU9XCJcIj4nICsgY2hvaWNlX2xhYmVsICsnPC9sYWJlbD4nICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YS5yZXBsYWNlKCAvXFxcXHJcXFxcbi9nLCBcIjxiciAvPlwiICk7XG4gICAgICAgICAgICAgICAgY3Vycl9maWVsZFxuICAgICAgICAgICAgICAgICAgICAuZmluZCggJz4gLmZ0LWRhdGEnIClcbiAgICAgICAgICAgICAgICAgICAgLnZhbCggZGF0YSApO1xuXG4gICAgICAgICAgICAgICAgdGJfcmVtb3ZlKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIGN1cnJfZmllbGQuY2xvc2VzdCggJy5mdC1zb3J0YWJsZScgKS5pcyggJy5mdC1zb3J0YWJsZS1maWVsZHNldCcgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZpZWxkc2V0ID0gY3Vycl9maWVsZC5jbG9zZXN0KCAnLmZ0LWZpZWxkLWZpZWxkc2V0JyApO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvcm10YXN0aWNfYWRkX3JlbW92ZV9maWVsZHMoIGZpZWxkc2V0ICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9ybXRhc3RpY19lbXB0eV9mb3JtKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJCggJyNmdC1jYW5jZWwnICkub24oICdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRiX3JlbW92ZSgpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGZvcm10YXN0aWNfZW1wdHlfZm9ybSgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmllbGQgID0gJCggJyNmdC1lZGl0LWZpZWxkLWZvcm0gOmlucHV0JyApLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXMgPSAkKCAnI2Z0LWVkaXQtZmllbGQtZm9ybSAuZnQtdmFsdWVzLWZpZWxkJyApO1xuXG4gICAgICAgICAgICAgICAgZmllbGQuZWFjaCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoICQoIHRoaXMgKS5hdHRyKCAndHlwZScgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RleHQnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ251bWJlcicgOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSB1bmRlZmluZWQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoIHRoaXMgKS52YWwoICcnICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NoZWNrYm94JyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCggdGhpcyApLnByb3AoICdjaGVja2VkJywgZmFsc2UgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdmFsdWVzLmVhY2goIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoICEgJCggdGhpcyApLmlzKCAnLmZ0LW1haW4nICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCB0aGlzICkucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJCggZG9jdW1lbnQgKS5vbiggJ2NsaWNrJywgJy5mdC1hdXRvc2VsZWN0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJCggdGhpcyApLnNlbGVjdCgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICQoICcjY3VzdG9tX2NvbG9yJyApLndwQ29sb3JQaWNrZXIoKTtcblxuICAgICAgICAgICAgJCggJy5mdC1zZWxlY3QtdGFiJyApLm9uKCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNob2ljZSA9ICQoIHRoaXMgKS52YWwoKSxcbiAgICAgICAgICAgICAgICAgICAgcGFuZWwgID0gJCggdGhpcyApLmNsb3Nlc3QoICcuZnQtdGFiLWNvbnRlbnQnICk7XG5cbiAgICAgICAgICAgICAgICBwYW5lbFxuICAgICAgICAgICAgICAgICAgICAuZmluZCggJ1tkYXRhLXRhYl0nIClcbiAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCAnZnQtaGlkZGVuJyApXG4gICAgICAgICAgICAgICAgICAgIC5lbmQoKVxuICAgICAgICAgICAgICAgICAgICAuZmluZCggJ1tkYXRhLXRhYj0nICsgY2hvaWNlICsgJ10nIClcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCAnZnQtaGlkZGVuJyApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICQoICcuZnQtdXBsb2FkLW1lZGlhJyApLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VuZF9hdHRhY2htZW50X2JrcCA9IHdwLm1lZGlhLmVkaXRvci5zZW5kLmF0dGFjaG1lbnQ7XG4gICAgICAgICAgICAgICAgdmFyIGJ1dHRvbiA9ICQoIHRoaXMgKTtcblxuICAgICAgICAgICAgICAgIHdwLm1lZGlhLmVkaXRvci5zZW5kLmF0dGFjaG1lbnQgPSBmdW5jdGlvbiggcHJvcHMsIGF0dGFjaG1lbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgICQoIGJ1dHRvbiApLnBhcmVudCgpLnByZXYoKS5hdHRyKCAnc3JjJywgYXR0YWNobWVudC51cmwgKTtcbiAgICAgICAgICAgICAgICAgICAgJCggYnV0dG9uICkucHJldigpLnZhbCggYXR0YWNobWVudC5pZCApO1xuXG4gICAgICAgICAgICAgICAgICAgIHdwLm1lZGlhLmVkaXRvci5zZW5kLmF0dGFjaG1lbnQgPSBzZW5kX2F0dGFjaG1lbnRfYmtwO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB3cC5tZWRpYS5lZGl0b3Iub3BlbiggYnV0dG9uICk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJCggJy5mdC1yZW1vdmUtbWVkaWEnICkub24oICdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBzcmMgPSAkKCB0aGlzICkucGFyZW50KCkucHJldigpLmF0dHIoICdkYXRhLXNyYycgKTtcbiAgICAgICAgICAgICAgICAkKCB0aGlzICkucGFyZW50KCkucHJldigpLmF0dHIoICdzcmMnLCBzcmMgKTtcbiAgICAgICAgICAgICAgICAkKCB0aGlzICkucHJldigpLnByZXYoKS52YWwoICcnICk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJCggJyNmdF9yZXNwb25zZV9mb3JtJyApLm9uKCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1lID0gJCggdGhpcyApO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBtZS52YWwoKSA9PSAnJyApIHtcbiAgICAgICAgICAgICAgICAgICAgJCggJyNmdC1leHBvcnQtcmVzcG9uc2UnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCAnaHJlZicsICcjJyApXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0ciggJ2Rpc2FibGVkJywgdHJ1ZSApO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJCggJyNmdC1leHBvcnQtcmVzcG9uc2UnIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCAnaHJlZicsICdhZG1pbi5waHA/YWN0aW9uPWV4cG9ydF9yZXNwb25zZXMmZm9ybT0nICsgbWUudmFsKCkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoICdkaXNhYmxlZCcsIGZhbHNlICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAkKCB3aW5kb3cgKS5vbiggJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICggJCggJyNmdF9yZXNwb25zZV9mb3JtJyApLnZhbCgpID09ICcnICkge1xuICAgICAgICAgICAgICAgICQoICcjZnQtZXhwb3J0LXJlc3BvbnNlJyApXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCAnaHJlZicsICcjJyApXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCAnZGlzYWJsZWQnLCB0cnVlICk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJCggJyNmdC1leHBvcnQtcmVzcG9uc2UnIClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoICdocmVmJywgJ2FkbWluLnBocD9hY3Rpb249ZXhwb3J0X3Jlc3BvbnNlcyZmb3JtPScgKyAkKCAnI2Z0X3Jlc3BvbnNlX2Zvcm0nICkudmFsKCkgKVxuICAgICAgICAgICAgICAgICAgICAuYXR0ciggJ2Rpc2FibGVkJywgZmFsc2UgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbn0oalF1ZXJ5KSk7XG4iXX0=
