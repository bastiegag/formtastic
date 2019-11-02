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
                if ( ! $( this ).valid() ) {
                    return false;
                }
            });

            $( '.ft-validate' ).each( function() {
                $( this ).validate({
                    errorElement: 'span',
                    errorLabelContainer: '.ft-check',
                    errorClass: 'ft-invalid',
                    validClass: 'ft-success',
                    highlight: function( element, errorClass, validClass ) {
                        $( element )
                            .closest( '.ft-field' )
                            .addClass( errorClass )
                            .removeClass( validClass );
                    },
                    unhighlight: function( element, errorClass, validClass ) {
                        $( element )
                            .closest( '.ft-field' )
                            .removeClass( errorClass )
                            .addClass( validClass );
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
                $.datepicker.regional[ ft.lang_code ];

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
                    });
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
                            componentRestrictions: {
                                country: 'ca'
                            }
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
                $( '.ft-repeater' ).on( 'click', function() {
                    var me     = $( this ).closest( '.ft-field--repeater' ),
                        number = me.find( 'input' ).val(),
                        id     = me.attr( 'id' ),
                        clone  = me.closest( '.ft-row' ).find( '.ft-field' ).not( '.ft-field--repeater' ).not( '.ft-clone' ).clone();

                    number++;

                    me.find( 'input' ).val( number );

                    clone.each( function() {
                        var id   = $( this ).attr( 'data-id' ),
                            name = $( this ).attr( 'data-name' );

                        $( this )
                            .addClass( 'ft-clone' )
                            .find( 'input' ).attr( 'id', id + '-clone-' + number ).end()
                            .find( 'input' ).attr( 'name', id + '-clone-' + number ).end()
                            .find( 'select' ).attr( 'id', id + '-clone-' + number ).end()
                            .find( 'select' ).attr( 'name', id + '-clone-' + number );

                        $( this ).insertBefore( me );
                    });
                });
            }

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
