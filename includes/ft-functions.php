<?php
/**
 * Custom functions
 *
 * @author  Sébastien Gagné
 * @package Formtastic/Classes
 * @version 2.5.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

if ( ! function_exists( 'ft_dump' ) ) {
	/**
	 * Custom var_dump
	 */
	function ft_dump( $var, $render = true ) {
		ob_start();

		var_dump( $var);          
		$result = ob_get_contents();

		ob_end_clean();

		if ( $render ) {
			echo '<pre>' . $result . '</pre>';

		} else {
			echo '<pre style="display: none;">' . $result . '</pre>';
		}
	}
}

if ( ! function_exists( 'ft_language_code' ) ) {
	/** 
	 * Get language code
	 * @return string Language code
	 */
	function ft_language_code() {
		if ( class_exists( 'SitePress' ) ) {
			$code = ICL_LANGUAGE_CODE;

		} else {
			$code = get_locale();
		}

		$code = substr( $code, 0, 2 );

		return $code;
	}
}

if ( ! function_exists( 'ft_icon' ) ) {
	/** 
	 * Display svg icon
	 * @param  string $icon Icon name
	 * @return string SVG Icon
	 */
	function ft_icon( $icon ) {
		$icons_path = Formtastic::plugin_url() . '/assets/img/icons.svg';

		$output =  sprintf( '<svg class="svg-icon" role="presentation" data-path="%s"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="%s"></use></svg>',
			$icons_path,
			esc_url( $icons_path . '#' . $icon )
		);

		return $output;
	}
}

if ( ! function_exists( 'ft_date' ) ) {
	/** 
	 * Display formatted date depend on language
	 * @param  string $date Date('j-n-Y')
	 * @return string Formatted date
	 */
	function ft_date( $date ) {
		$date  = explode( '-', $date );
		$day   = $date[0];
		$month = $date[1];
		$year  = $date[2];

		$months = array(
			'',
			__( 'January', 'formtastic' ),
			__( 'February', 'formtastic' ),
			__( 'March', 'formtastic' ),
			__( 'April', 'formtastic' ),
			__( 'May', 'formtastic' ),
			__( 'June', 'formtastic' ),
			__( 'July', 'formtastic' ),
			__( 'August', 'formtastic' ),
			__( 'September', 'formtastic' ),
			__( 'October', 'formtastic' ),
			__( 'November', 'formtastic' ),
			__( 'December', 'formtastic' )
		);

		if ( ft_language_code() == 'fr' ) {
			return $day . ' ' . $months[ $month ] . ' ' . $year;

		} else {
			return $months[ $month ] . ' ' . $day . ', ' . $year;
		}
	}
}

if ( ! function_exists( 'ft_sanitize_field' ) ) {
	/** 
	 * Sanitize field
	 * @param  array $array
	 * @return void
	 */
	function ft_sanitize_field( $array ) {
	    foreach ( $array as $key => &$value ) {
	        if ( is_array( $value ) ) {
	            $value = ft_sanitize_field( $value );

	        } else {
	            // $value = $value;
	            $value = wp_kses_post( $value );
	        }
	    }
 
	    return $array;
	}
}

if ( ! function_exists( 'ft_get_fields' ) ) {
	/** 
	 * Get fields
	 * @param  int $form_id Form ID
	 * @return array Field array
	 */
	function ft_get_fields( $form_id ) {
		$formtastic = get_post_meta( $form_id, 'formtastic', true );
		$array      = $formtastic['fields'];
		$fields     = array();

		foreach ( $array as $key => $value ) {
			$options = json_decode( $value );
			$field   = array();

			foreach ( $options as $option ) {
				$field[ $option->name ] = $option->value;
			}

			$fields[] = $field;
		}

		return $fields;
	}
}

if ( ! function_exists( 'ft_get_value' ) ) {
	/** 
	 * Get value
	 * @param  string $value Value $fallback
	 * @return string
	 */
	function ft_get_value( $value, $fallback, $field = 'text' ) {
		$output = array();
		
		if ( ! empty( $value ) ) {
			$values = explode( ',', $value );	

			foreach ( $values as $value ) {
				$value = trim( $value );
				if ( substr( $value, 0, 3 ) == 'ft_' ) {
					if ( ! empty( $_POST[ $value ] ) ) {
						if ( $field == 'email' ) {
							if ( is_array( $_POST[ $value ] ) ) {
								$output[] = ! empty( $_POST[ $value ][0] ) ? wp_unslash( sanitize_email( FT_Proceed::sep_value( $_POST[ $value ][0] ) ) ) : $fallback;

							} else {
								$output[] = ! empty( $_POST[ $value ] ) ? wp_unslash( sanitize_email( FT_Proceed::sep_value( $_POST[ $value ] ) ) ) : $fallback;
							}

						} else {
							if ( is_array( $_POST[ $value ] ) ) {
								$output[] = ! empty( $_POST[ $value ][0] ) ? wp_unslash( sanitize_text_field( FT_Proceed::sep_label( $_POST[ $value ][0] ) ) ) : $fallback;

							} else {
								$output[] = ! empty( $_POST[ $value ] ) ? wp_unslash( sanitize_text_field( FT_Proceed::sep_label( $_POST[ $value ] ) ) ) : $fallback;
							}
						}

					} else {
						$output[] = $fallback;
					}

				} else {
					$output[] = $value;
				}
			}

		} else {
			$output[] = $fallback;
		}

		return $output;
	}
}

if ( ! function_exists( 'ft_get_form_meta' ) ) {
	/** 
	 * Get form meta
	 * @param  string $type Field type
	 * @return string values
	 */
	function ft_get_form_meta( $form_id, $field_id ) {
		if ( ! isset( $form_id ) ) {
			return;
		}

		if ( ! isset( $field_id ) ) {
			return;
		}

		$values = array();
		$form   = get_post_meta( $form_id, 'formtastic', true );
		$field  = json_decode( $form['fields'][ $field_id ] );

		foreach ( $field as $value ) {
			if ( $value->name == 'values' ) {
				$values[] = $value->value;
			}
		}

		return $values;
	}
}

if ( ! function_exists( 'ft_is_dev' ) ) {
	/** 
	 * Check if on dev
	 * @return string boolean
	 */
	function ft_is_dev() {
		if ( ! is_admin() ) {
			return;
		}

		$dev     = false;
		$options = get_option( 'ft_general' );

		if ( isset( $options['dev_use'] ) && $options['dev_use'] == 'yes' ) {
			return true;

		} else {
			$args = array(
				'post_status'    => 'publish',
				'post_type'      => 'formtastic',
				'posts_per_page' => -1,
			);

			$loop = new WP_Query( $args );

			if ( $loop->have_posts() ) :
				while ( $loop->have_posts() ) : $loop->the_post();

					$formtastic = get_post_meta( get_the_ID(), 'formtastic', true );
					$settings   = $formtastic['settings'];

					if ( isset( $settings['send_email'] ) ) {
						$to    = ! empty( $settings['to'] ) ? $settings['to'] : get_bloginfo( 'admin_email' );
						$email = explode( '@', $to );

						if ( $email[0] == 'bastiegag' || ( isset( $email[1] ) && $email[1] == 'bravad.ca' ) ) {
							$dev = true;
						}
					}

				endwhile;
			endif;
			wp_reset_postdata();

			if ( $dev ) {
				return true;

			} else {
				return false;
			}
		}
	}
}

if ( ! function_exists( 'ft_field_name' ) ) {
	/** 
	 * Field name
	 * @param  string $type Field type
	 * @return string Field name
	 */
	function ft_field_name( $type ) {
		$field = array(
			'address'  => __( 'Address', 'formtastic' ),
			'button'   => __( 'Button', 'formtastic' ),
			'checkbox' => __( 'Checkbox', 'formtastic' ),
			'color'    => __( 'Couleur', 'formtastic' ),
			'date'     => __( 'Date', 'formtastic' ),
			'email'    => __( 'Email', 'formtastic' ),
			'file'     => __( 'File', 'formtastic' ),
			'hidden'   => __( 'Hidden', 'formtastic' ),
			'message'  => __( 'Message', 'formtastic' ),
			'name'     => __( 'Name', 'formtastic' ),
			'number'   => __( 'Number', 'formtastic' ),
			'password' => __( 'Password', 'formtastic' ),
			'postal'   => __( 'Postal code', 'formtastic' ),
			'radio'    => __( 'Radio', 'formtastic' ),
			'range'    => __( 'Range', 'formtastic' ),
			'repeater' => __( 'Repeater', 'formtastic' ),
			'row'      => __( 'Row', 'formtastic' ),
			'search'   => __( 'Search', 'formtastic' ),
			'select'   => __( 'Select', 'formtastic' ),
			'tel'      => __( 'Phone', 'formtastic' ),
			'text'     => __( 'Text', 'formtastic' ),
			'textarea' => __( 'Textarea', 'formtastic' ),
			'time'     => __( 'Time', 'formtastic' ),
			'url'      => __( 'Url', 'formtastic' ),
		);

		return $field[ $type ];
	}
}

if ( ! function_exists( 'ft_render_field' ) ) {
	/** 
	 * Render field
	 * @param  string $type Field type
	 * @param  array $data Field data
	 * @param  string $field_id Field ID
	 * @return string Field
	 */
	function ft_render_field( $type, $data, $field_id = '', $children = array() ) {
		$field_id = empty( $field_id ) ? uniqid( 'ft_' ) : $field_id;

		$label = $type !== 'button' && $type !== 'repeater' ? ft_field_name( $type ) : '';

		if ( empty( $data ) ) {
			$arr_data = array(
				array(
					'name'  => 'type',
					'value' => $type
				),
				array(
					'name'  => 'id',
					'value' => $field_id
				),
				array(
					'name'  => 'label',
					'value' => $label
				),
				array(
					'name'  => 'colsize',
					'value' => '12'
				)
			);

		} else {
			$arr_data = json_decode( $data );
			$label    = '';
			$required = '';
			$values   = array();

			foreach ( $arr_data as $key => $value ) {
				if ( $value->name == 'id' ) {
					$arr_data[ $key ]->value = $field_id;
				}

				if ( $value->name == 'label' ) {
					$label = $value->value;
				}

				if ( $value->name == 'btn-label' ) {
					$btn_label = $value->value;
				}

				if ( $value->name == 'placeholder' ) {
					$placeholder = $value->value;
				}

				if ( $value->name == 'value' ) {
					$default_val = $value->value;
				}

				if ( $value->name == 'values' ) {
					$values[] = $value->value;
				}

				if ( $value->name == 'message' ) {
					$message = $value->value;
				}

				if ( $value->name == 'required' ) {
					$required = $value->value;
				}

				if ( $value->name == 'fields' ) {
					$fields = $value->value;
				}

				if ( $value->name == 'repeat' ) {
					$repeat = $value->value;
				}

				if ( $value->name == 'colsize' ) {
					$size = $value->value;
				}
			}
		}

		// $input_data = sprintf( '<input type="text" id="%1$s" name="formtastic[fields][%1$s]" class="ft-data ft-input" value="%2$s">',
		// 	$field_id,
		// 	esc_attr( wp_json_encode( $arr_data, JSON_UNESCAPED_UNICODE ) )
		// );
		
		$encoded   = wp_json_encode( $arr_data );
		$unescaped = preg_replace_callback( '/(?<!\\\\)\\\\u(\w{4})/', function( $matches ) {
			return html_entity_decode( '&#x' . $matches[1] . ';', ENT_COMPAT, 'UTF-8' );
		}, $encoded );

		$input_data = sprintf( '<input type="hidden" id="%1$s" name="formtastic[fields][%1$s]" class="ft-data ft-input" value="%2$s">',
			$field_id,
			esc_attr( $unescaped )
		);

		$label       = isset( $label ) && ! empty( $label ) ? '<span class="ft-label">' . $label . '</span>&nbsp;' : '';
		$placeholder = isset( $placeholder ) ? $placeholder : '';
		$default_val = isset( $default_val ) ? $default_val : '';

		switch ( $type ) {
			case 'date' :
				$controls = 'id,label,format,min,max,placeholder,invalid,help,value,class,colsize,required';
				$field    = sprintf( '<input type="%s" placeholder="%s" value="%s" class="ft-input ft-display" readonly>',
					$type,
					$placeholder,
					$default_val
				);
				break;

			case 'name' :
			case 'postal' :
			case 'text' :
			case 'url' :
			case 'address' :
			case 'time' :
				$controls = 'id,label,placeholder,invalid,help,value,class,colsize,required';
				$field    = sprintf( '<input type="text" placeholder="%s" value="%s" class="ft-input ft-display" readonly>',
					$placeholder,
					$default_val
				);
				break;

			case 'color' :
				$controls = 'id,label,invalid,help,value,class,colsize,required';
				$field    = sprintf( '<input type="text" value="%s" class="ft-input ft-display" readonly>',
					$default_val
				);
				break;

			case 'hidden' :
				$controls = 'id,label,value,class';
				$field    = sprintf( '<input type="text" value="%s" class="ft-input ft-display" readonly>',
					$default_val
				);
				break;

			case 'email' :
			case 'password' :
			case 'search' :
			case 'tel' :
				$controls = 'id,label,placeholder,invalid,help,value,class,colsize,required';
				$field    = sprintf( '<input type="%s" placeholder="%s" value="%s" class="ft-input ft-display" readonly>',
					$type,
					$placeholder,
					$default_val
				);
				break;

			case 'number' :
				$controls = 'id,label,invalid,min,max,step,value,help,class,colsize,required';
				$field    = sprintf( '<input type="%s" value="%s" class="ft-input ft-display" readonly>',
					$type,
					$default_val
				);
				break;

			case 'range' :
				$controls = 'id,label,min,max,step,help,valuenum,class,colsize';
				$field    = sprintf( '<input type="%s" value="%s" class="ft-input ft-display" readonly>',
					$type,
					$default_val
				);
				break;

			case 'textarea' :
				$controls = 'id,label,placeholder,invalid,help,value,rows,class,colsize,required';
				$field    = sprintf( '<textarea rows="3" placeholder="%s" class="ft-textarea ft-display" readonly>%s</textarea>',
					$placeholder,
					$default_val
				);
				break;

			case 'checkbox' :
				$controls = 'id,label,invalid,help,values,max,class,colsize,required';
				$field    = '<div class="ft-choice">';

				foreach ( $values as $choice ) {
					$choice = explode( ':', $choice );
					$choice_label = isset( $choice[1] ) ? $choice[1] : $choice[0];
					$field .= '<label><input type="' . $type . '" class="ft-display" value="">' . $choice_label . '</label>';
				}

				$field .= '</div>';
				break;

			case 'radio' :
				$controls = 'id,label,invalid,help,values,class,colsize,required';
				$field    = '<div class="ft-choice">';

				foreach ( $values as $choice ) {
					$choice = explode( ':', $choice );
					$choice_label = isset( $choice[1] ) ? $choice[1] : $choice[0];
					$field .= '<label><input type="' . $type . '" class="ft-display" value="">' . $choice_label . '</label>';
				}

				$field .= '</div>';
				break;

			case 'select' :
				$controls = 'id,label,placeholder,invalid,help,values,multiple,class,colsize,required';
				$field    = sprintf( '<select class="ft-input ft-display"><option>%s</option></select>',
					$placeholder
				);
				break;

			case 'file' :
				$controls = 'id,label,btn-label,invalid,help,extension,size,multiple,class,colsize,required';
				$field    = sprintf( '<input type="file" readonly>' );
				break;

			case 'message' :
				$controls = 'id,label,message,colsize';
				$field    = sprintf( '<div class="ft-display">%s</div>',
					$message
				);
				break;

			case 'button' :
				$controls = 'id,btn-label,btn-class,colsize';
				$field    = sprintf( '<button class="ft-display button button-primary">%s</button>',
					isset( $btn_label ) ? $btn_label : ''
				);
				break;

			case 'repeater' :
				$controls = 'id,btn-label,btn-class,max,value,colsize';
				$field    = sprintf( '<button class="ft-display button button-primary">%s</button>',
					isset( $btn_label ) ? $btn_label : ''
				);
				break;

			case 'row' :
				$controls = '';
				$field    = '';
				break;
		}

		$opt = array( 
			'edit'  => __( 'Edit', 'formtastic' ),
			'copy'  => __( 'Duplicate', 'formtastic' ),
			'trash' => __( 'Remove', 'formtastic' )
		);
		
		$options = '';
		foreach ( $opt as $key => $value ) {
			$options .= '<a href="#" title="' . $value . '" class="ft-' . $key . '">' . ft_icon( $key ) . '</a>';
		}

		if ( $type == 'row' ) {
			$label   = '';
			$options = sprintf( '<a href="#" title="%s" class="ft-trash">%s</a>',
				__( 'Remove', 'formtastic' ),
				ft_icon( 'trash' )
			);

		} else {
			$label  = '<label for="' . $field_id . '">' . $label;
			$label .= ! empty( $required ) ? '<span class="ft-required">*</span>&nbsp;' : '';
			$label .= '<span class="ft-type">(' . ft_field_name( $type ) . ')</span></label>';
		}

		$output = sprintf( '<div class="ft-field ft-field-%s%s ft-col ft-col-%s" data-controls="%s" data-type="%1$s">%s<div class="ft-options">%s</div>%s%s</div>',
			$type,
			! empty( $required ) ? ' required' : '',
			isset( $size ) ? $size : '12',
			$controls,
			$input_data,
			$options,
			$label,
			$field
		);

		return $output;
	}
}
