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
        }

}(jQuery));
