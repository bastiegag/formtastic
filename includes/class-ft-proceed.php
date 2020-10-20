<?php
/**
 * Proceed
 *
 * @author  Sébastien Gagné
 * @package Formtastic/Classes
 * @version 2.6.2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * FT_Proceed class
 */
class FT_Proceed {

	public function __construct() {
		add_action( 'wp_loaded', array( $this, 'validate' ) );
		add_action( 'phpmailer_init', array( $this, 'phpmailer' ) );
	}

	/**
	 * PHPMailer SMTP
	 */
	public function phpmailer( $phpmailer ) {
		$options = get_option( 'ft_smtp' );

		if ( ! isset( $options['use'] ) || $options['use'] !== 'yes' ) {
			return false;
		}

		if ( ! isset( $options['encryption'] ) || $options['encryption'] !== 'none' ) {
			$options['encryption'] = false;
		}

	    $phpmailer->IsSMTP();
		$phpmailer->Host       = $options['host'];
		$phpmailer->SMTPAuth   = true;
		$phpmailer->Port       = $options['port'];
		$phpmailer->Username   = $options['username'];
		$phpmailer->Password   = $options['password'];
		$phpmailer->SMTPSecure = $options['encryption'];
	}

	/** 
	 * Validate
	 * @return void
	 */
	public static function validate() {
		global $error_label, $ft_confirm;

		if ( ! isset( $_POST['formtastic'] ) ) {
			return;
		}

		if ( is_admin() ) {
			return;
		}

		$form_id = $_POST['formtastic'];
		$nonce   = 'formtastic-' . $form_id;

		$formtastic = get_post_meta( $form_id, 'formtastic', true );
		$settings   = $formtastic['settings'];

		if ( ! wp_verify_nonce( $_REQUEST[ $nonce ], 'formtastic_proceed' ) ) :
			self::confirmation( false, __( 'Error, nonce is not valid', 'formtastic' ) );
		
		else :

			$required    = array();
			$rules       = array();
			$error_label = array();
			$error_msg   = array();
			$regex       = array(
				'text'     => "#^(.*)#i",
				'address'  => "#^(.*)#i",
				'name'     => "#^[a-zA-ZÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ' -]{3,}$#i",
				// 'tel'      => "#^([1][- ]*)?+[0-9]{3}+[- ]*+[0-9]{3}+[-]*+[0-9]{4}$#",
				'tel'      => "#^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$#",
				'email'    => "#[a-zA-Z0-9._-]+@[a-z0-9.-]{2,}[.][a-z]{2,5}#",
				'number'   => "#^(-{1})?[0-9]+(\.[0-9]{1,})?$#",
				'postal'   => "#^[AaBbCcEeGgHhJjKkLlMmNnPpRrSsTtVvXxYy]{1}\d{1}[A-Za-z]{1} *\d{1}[A-Za-z]{1}\d{1}$#i",
				'url'      => "#^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$#",
				'textarea' => "#^(.*)#i",
				'time'     => "#^([01]?[0-9]|2[0-3]):[0-5][0-9]#i",
				'color'    => "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})#",
				'date'     => "#^(.*)#i",
				'row'      => "#^(.*)#i",
				'range'    => "#^(.*)#i",
				'password' => "#^(.*)#i",
				'select'   => "#^(.*)#i",
				'radio'    => "#^(.*)#i",
				'checkbox' => "#^(.*)#i",
				'file'     => "#^(.*)#i",
				'hidden'   => "#^(.*)#i",
				'button'   => "#^(.*)#i",
			);

			$fields = ft_get_fields( $form_id );

			foreach ( $fields as $field ) {
				if ( isset( $field['required'] ) ) {
					$required[ $field['id'] ] = true;
				}

				if ( $field['type'] == 'file' ) {
					if ( isset( $_FILES[ $field['id'] ] ) ) {
						$files[]                     = $field;
						$error_label[ $field['id'] ] = '';
						$error_msg[ $field['id'] ]   = ! empty( $field['invalid'] ) ? $field['invalid'] : __( 'This field is required', 'formtastic' );
					}

				} else {
					$rules[ $field['id'] ]       = $regex[ $field['type'] ];
					$error_label[ $field['id'] ] = '';
					$error_msg[ $field['id'] ]   = ! empty( $field['invalid'] ) ? $field['invalid'] : __( 'This field is not valid', 'formtastic' );
				}
			}

			$is_valid = true;

			if ( isset( $_POST['submit-' . $form_id] ) ) {
				$msg = '';

				/**
				 * Validate files
				 */
				if ( isset( $files ) ) :
					foreach ( $files as $file ) {
						if ( empty( $_FILES[ $file['id'] ]['name'][0] ) ) {
							if ( ! empty( $required[ $file['id'] ] ) ) {
								$error_label[ $file['id'] ] = $error_msg[ $file['id'] ];
								$is_valid = false;
							}

						} else {
							$file_count  = count( $_FILES[ $file['id'] ]['name'] );
							$default_ext = array( 'pdf', 'jpg', 'jpeg', 'png' );
							$ext         = ( isset( $file['extension'] ) && ! empty( $file['extension'] ) ) ? explode( '|', $file['extension'] ) : $default_ext;

							for ( $i = 0; $i < $file_count; $i++ ) {
								$file_name = sanitize_file_name( basename( $_FILES[ $file['id'] ]['name'][ $i ] ) );
								$file_type = substr( $file_name, strrpos( $file_name, '.' ) + 1 );
								$file_size = $_FILES[ $file['id'] ]['size'][ $i ];

								if ( ! empty( $file['size'] ) ) {
									if ( $file_size < (int)$file['size'] * 1000 ) {
										$valid_size = true;

									} else {
										$valid_size = false;
									}

								} else {
									$valid_size = true;
								}

								$valid_ext = false;
								for ( $k = 0; $k < sizeof( $ext ); $k++ ) {
									if ( strcasecmp( trim( $ext[ $k ] ), $file_type ) == 0 ) {
										$valid_ext = true;
									}
								}

								if ( ! isset( $file_name ) || empty( $file_name ) ) { 
									$error_label[ $file['id'] ] = $error_msg[ $file['id'] ];
									$is_valid = false;

								} else if ( ! $valid_ext ) {
									$error_label[ $file['id'] ] = __( 'File type is not valid', 'formtastic' );
									$is_valid = false;

								} else if ( ! $valid_size ) {
									$error_label[ $file['id'] ] = __( 'File size is too large', 'formtastic' );
									$is_valid = false;
								}
							}
						}
					}
				endif;

				/**
				 * Validate other fields
				 */
				foreach ( $rules as $key => $value ) {
					if ( isset( $_POST[ $key ] ) ) {
						if ( empty( $_POST[ $key ] ) ) {
							if ( ! empty( $required[ $key ] ) ) {
								$error_label[ $key ] = __( 'This field is required', 'formtastic' );
								$is_valid = false;
							}

						} else {
							if ( is_array( $_POST[ $key ] ) ) {
								foreach ( $_POST[ $key ] as $ckey ) {
									if ( ! preg_match( $value, $ckey ) || empty( $ckey ) ) {
										$error_label[ $key ] = $error_msg[ $key ];
										$is_valid            = false;
									}
								}

							} else if ( ! preg_match( $value, $_POST[ $key ] ) || empty( $_POST[ $key ] ) ) {
								$error_label[ $key ] = $error_msg[ $key ];
								$is_valid            = false;
							}
						}
					}
				}

				if ( isset( $settings['use_captcha'] ) && $settings['use_captcha'] == 'yes' ) {
					if ( isset( $_POST['g-recaptcha-response'] ) ) {
						$captcha = $_POST['g-recaptcha-response'];

						if ( ! $captcha ) {
							$is_valid = false;
							$msg      = __( 'Please check the captcha form.', 'formtastic' );

						} else {
							$secret_key    = $settings['captcha_secret_key'];
							$ip            = $_SERVER['REMOTE_ADDR'];
							$response      = file_get_contents( 'https://www.google.com/recaptcha/api/siteverify?secret=' . $secret_key . '&response=' . $captcha . '&remoteip=' . $ip );
							$response_keys = json_decode( $response, true );

							if ( intval( $response_keys['success'] ) !== 1 ) {
								$is_valid = false;
								$msg      = __( 'You are a robot, access denied!', 'formtastic' );
							}
						}
					}
				}
			}

			if ( $is_valid ) {
				self::mailchimp( $form_id );

			} else {
				self::confirmation( false, $msg );
			}

		endif;
	}

	/** 
	 * Seperate value
	 * @param  str $value
	 * @return value
	 */
	public static function sep_value( $value ) {
		if ( empty( $value ) ) {
			return;
		}

		$value = explode( ':', $value );

		return $value[0];
	}

	/** 
	 * Seperate label
	 * @param  str $value
	 * @return value
	 */
	public static function sep_label( $value ) {
		if ( empty( $value ) ) {
			return;
		}

		$value = explode( ':', $value );
		$value = isset( $value[1] ) ? $value[1] : $value[0];

		return $value;
	}

	/** 
	 * Send the form
	 * @param  int $form_id Form ID
	 * @return void
	 */
	public static function send( $form_id ) {
		if ( ! isset( $form_id ) ) {
			return;
		}

		if ( ! isset( $_POST['formtastic'] ) ) {
			return;
		}

		$version = Formtastic::version();
		$nonce   = 'formtastic-' . $form_id;

		if ( ! wp_verify_nonce( $_REQUEST[ $nonce ], 'formtastic_proceed' ) ) :
			self::confirmation( false, __( 'Error, nonce is not valid', 'formtastic' ) );

		else :

			if ( isset( $_POST['submit-' . $form_id] ) ) {
				global $from_name, $from_email, $keys;

				$formtastic = get_post_meta( $form_id, 'formtastic', true );
				$settings   = $formtastic['settings'];
				$options    = get_option( 'ft_general' );

				$upload      = wp_upload_dir();
				$upload_dir  = $upload['baseurl'] . '/formtastic_uploads/';
				$attachments = array();

				$body    = '';
				$headers = array();

				/**
				 * To
				 */	
				if ( isset( $options['dev_use'] ) && $options['dev_use'] == 'yes' ) {
					$to = ft_get_value( $options['dev_email'], get_bloginfo( 'admin_email' ), 'email' );
					$to = apply_filters( 'ft_to', $to[0] );

				} else {
					$to = ft_get_value( $settings['to'], get_bloginfo( 'admin_email' ), 'email' );
					$to = apply_filters( 'ft_to', $to[0] );
				}

				/**
				 * Ccs
				 */
				$ccs = apply_filters( 'ft_ccs', $settings['cc'] );
				$ccs = ft_get_value( $ccs, '', 'email' );

				if ( ! empty( $ccs[0] ) ) {
					foreach ( $ccs as $cc ) {
						$cc        = sanitize_email( $cc );
						$headers[] = 'Cc: ' . $cc;
					}
				}
				
				/**
				 * Object
				 */
				$object = ft_get_value( $settings['object'], get_the_title( $form_id ) );
				$object = apply_filters( 'ft_object', $object[0] );

				/**
				 * From name
				 */
				$from_name = ft_get_value( $settings['from_name'], get_bloginfo( 'name' ) );
				$from_name = implode( ' ', $from_name );
				$from_name = apply_filters( 'ft_from_name', $from_name );

				add_filter( 'wp_mail_from_name', function( $name ) {
					global $from_name;

					return $from_name;
				});

				/**
				 * From email
				 */

				// $from_email = ft_get_value( $settings['from_email'], get_bloginfo( 'admin_email' ), 'email' );
				$from_email = array( 'noreply@bravad.ca' );
				
				$from_email = apply_filters( 'ft_from_email', $from_email[0] );
				$from_real  = ft_get_value( $settings['from_email'], get_bloginfo( 'admin_email' ), 'email' );

				add_filter( 'wp_mail_from', function( $email ) {
					global $from_email;

					return $from_email;
				});

				$fields = ft_get_fields( $form_id );
				$keys   = array();

				/** 
				 * Build the body
				 */
				foreach ( $fields as $field ) {
					if ( ! empty( $_FILES[ $field['id'] ] ) ) {
						$file_count = count( $_FILES[ $field['id'] ]['name'] );

						for ( $i = 0; $i < $file_count; $i++ ) {
							$file_path  = $upload['basedir'];
							$file_path  = $file_path . '/formtastic_uploads/';
							$file_name  = basename( sanitize_file_name( uniqid( 'ft_' ) . '-' . $_FILES[ $field['id'] ]['name'][ $i ] ) );
							
							$file_path .= $file_name;
							$temp_path  = $_FILES[ $field['id'] ]['tmp_name'][ $i ];

							$files[] = array(
								'field'    => isset( $field['label'] ) ? $field['label'] : '',
								'filename' => sanitize_file_name( $_FILES[ $field['id'] ]['name'][ $i ] ),
								'url'      => $upload_dir . $file_name
							);

							if ( is_uploaded_file( $temp_path ) ) {
								if ( copy( $temp_path, $file_path ) ) {
									$attachments[] = $file_path;
								}
							}
						}

						if ( ! empty( $field['label'] ) ) {
							$label = '<span style="text-decoration: underline;">' . $field['label'] . '</span> : ';

						} else {
							$label = '';
						}

						$body .=  '<p>' . $label;
						$f = 0;
						foreach ( $files as $file ) {
							$body .= $f > 0 ? ', ' : '';
							$body .= '<a href="' . $file['url'] . '" target="_blank">' . $file['filename'] . '</a>';
							$f++;
						}

						$body .= '</p>';

						$keys[ $field['id'] ] = strip_tags( $file['url'] );
					}

					if ( ! empty( $_POST[ $field['id'] ] ) ) {

						if ( $field['type'] == 'checkbox' || $field['type'] == 'select' ) {
							$value = wp_unslash( sanitize_text_field( implode( ', ', $_POST[ $field['id'] ] ) ) );

						} else if ( $field['type'] == 'textarea' ) {
							$value = wp_unslash( sanitize_textarea_field( $_POST[ $field['id'] ] ) );

						} else if ( $field['type'] == 'email' ) {
							$email = wp_unslash( sanitize_text_field( $_POST[ $field['id'] ] ) );
							$value = '<a href="mailto:' . $email . '">' . $email . '</a>';

						} else if ( $field['type'] == 'url' ) {
							$url   = wp_unslash( sanitize_text_field( $_POST[ $field['id'] ] ) );
							$value = '<a href="' . $url . '" target="_blank">' . $url . '</a>';

						} else {
							$value = wp_unslash( sanitize_text_field( $_POST[ $field['id'] ] ) );
						}

						if ( ! empty( $field['label'] ) ) {
							$label = '<span style="text-decoration: underline;">' . $field['label'] . '</span> : ';

						} else if ( ! empty( $field['placeholder'] ) ) {
							$label = '<span style="text-decoration: underline;">' . $field['placeholder'] . '</span> : ';

						} else {
							$label = '';
						}
						
						if ( $field['type'] == 'textarea' ) {
							$body .=  '<p>' . $label . '</p><p>' . $value . '</p>';

						} else if ( $field['type'] == 'select' ) {
							$body .=  '<p>' . $label . self::sep_label( $value ) . '</p>';

						} else {
							$body .=  '<p>' . $label . $value . '</p>';
						}

						if ( $field['type'] !== 'row' ) {
							$keys[ $field['id'] ] = strip_tags( $value );
						}
					}
				}

				$body .= sprintf( '<footer style="display: block; margin-top: 30px; overflow: hidden; border-top: 1px solid #e6e6e6; padding-top: 6px; color: #aaa;"><small style="">%s %s</small><small style="float: right;">%s</small></footer>',
					__( 'Send on', 'formtastic' ),
					ft_date( current_time( 'j-n-Y' ) ) . ' - ' . current_time( 'G\hi' ),
					get_the_title( $form_id )
				);

				/**
				 * Email type
				 */
				add_filter( 'wp_mail_content_type', function( $content_type ) {
					return 'text/html';
				});

				/**
				 * Formtastic success action
				 */
				do_action( 'ft_success', $form_id, $keys );
				$confirm = apply_filters( 'ft_confirmation', true );
				$body    = apply_filters( 'ft_body', $body );

				if ( $confirm ) {
					if ( is_email( $to ) && is_email( $from_email ) ) {
						/** 
						 * Send email
						 */
						if ( isset( $settings['send_email'] ) && $settings['send_email'] == 'yes' ) {
							$body = apply_filters( 'ft_message', $body );
							do_action( 'ft_send', $form_id );

							$mail = array(
								'to'          => $to, 
								'object'      => $object, 
								'message'     => nl2br( $body ), 
								'headers'     => $headers, 
								'attachments' => '',
								'id'          => $form_id,
							);

							self::email_template( $mail );
						}

						/** 
						 * Send copy
						 */
						if ( isset( $settings['send_copy'] ) && $settings['send_copy'] == 'yes' ) {
							$mail = array(
								'to'          => $from_email, 
								'object'      => $object, 
								'message'     => nl2br( $body ), 
								'headers'     => $headers, 
								'attachments' => '',
								'id'          => $form_id,
							);

							if ( isset( $settings['copy_cond'] ) && $settings['copy_cond'] == 'yes' ) {
								$cond = ft_get_value( $settings['copy_cond_field'], '' );
								$cond = $cond[0];

								switch ( $settings['copy_cond_operator'] ) {
									case '==' :
										if ( $cond == $settings['copy_cond_value'] ) {
											self::email_template( $mail );
										}
										break;

									case '!==' :
										if ( $cond !== $settings['copy_cond_value'] ) {
											self::email_template( $mail );
										}
										break;
								}

							} else {
								self::email_template( $mail );
							}
						}

						/** 
						 * Save email to admin
						 */
						if ( isset( $settings['save_copy'] ) && $settings['save_copy'] == 'yes' ) {
							foreach ( $keys as $key => $value ) {
								$array[ $key ] = htmlentities( $value, ENT_COMPAT, 'UTF-8' );
							}

							$form = array(
								'content'    => $body,
								'form'       => get_the_title( $form_id ),
								'from_email' => $from_real[0],
								'from_name'  => $from_name,
								'title'      => $object,
								'array'		 => json_encode( $array )
							);

							if ( ! empty( $files ) ) {
								$form['files'] = $files;
							}

							self::save( $form_id, $form );
						}

						/** 
						 * Send auto reply
						 */
						if ( isset( $settings['send_reply'] ) && $settings['send_reply'] == 'yes' ) {
							self::reply( $form_id );
						}

						self::confirmation( true );

						/** 
						 * Confirmation message/redirection
						 */
						if ( $settings['confirmation'] == 'page' && isset( $settings['page'] ) ) {
							if ( $confirm ) {
								wp_redirect( get_permalink( $settings['page'] ) );
								exit;
							}
						}

						/**
						 * Reset fields
						 */
						if ( $confirm ) {
							$fields = ft_get_fields( $form_id );

							foreach ( $fields as $field ) {
								$_POST[ $field['id'] ] = '';
							}
						}

					} else {
						$msg = __( 'Emails are not valid', 'formtastic' );

						self::confirmation( false, $msg );
					}
				}
			}
		
		endif;
	}

	/** 
	 * Resend the form
	 * @param  array $mail Fields
	 * @return void
	 */
	public static function resend( $form_id, $response_id ) {
		if ( ! is_admin() ) {
			return;
		}

		if ( ! isset( $form_id ) ) {
			return;
		}

		if ( ! isset( $response_id ) ) {
			return;
		}

		global $from_name, $from_email;

		$formtastic = get_post_meta( $form_id, 'formtastic', true );
		$settings   = $formtastic['settings'];
		$headers    = array();

		/**
		 * To
		 */	
		if ( isset( $options['dev_use'] ) && $options['dev_use'] == 'yes' ) {
			$to = ft_get_value( $options['dev_email'], get_bloginfo( 'admin_email' ), 'email' );
			$to = apply_filters( 'ft_to', $to[0] );

		} else {
			$to = ft_get_value( $settings['to'], get_bloginfo( 'admin_email' ), 'email' );
			$to = apply_filters( 'ft_to', $to[0] );
		}

		/**
		 * Ccs
		 */
		$ccs = apply_filters( 'ft_ccs', $settings['cc'] );
		$ccs = ft_get_value( $ccs, '', 'email' );

		if ( ! empty( $ccs[0] ) ) {
			foreach ( $ccs as $cc ) {
				$cc        = sanitize_email( $cc );
				$headers[] = 'Cc: ' . $cc;
			}
		}
		
		/**
		 * Object
		 */
		$object = html_entity_decode( get_the_title( $response_id ) );
		$object = apply_filters( 'ft_object', $object );

		/**
		 * From name
		 */
		$from_name  = get_post_meta( $response_id, 'ft_name', true );

		add_filter( 'wp_mail_from_name', function( $name ) {
			global $from_name;

			return $from_name;
		});

		/**
		 * From email
		 */
		$smtp = get_option( 'ft_smtp' );

		if ( isset( $smtp['use'] ) ) {
			$from_email = ft_get_value( $smtp['username'], $settings['from_email'], 'email' );

			if ( empty( $from_email ) ) {
				$from_email = array( get_bloginfo( 'admin_email' ) );
			}

		} else {
			$from_email = ft_get_value( $settings['from_email'], get_bloginfo( 'admin_email' ), 'email' );
		}
		
		$from_email = apply_filters( 'ft_from_email', $from_email[0] );
		// $from_email = get_post_meta( $response_id, 'ft_email', true );

		add_filter( 'wp_mail_from', function( $email ) {
			global $from_email;

			return $from_email;
		});

		/**
		 * Email type
		 */
		add_filter( 'wp_mail_content_type', function( $content_type ) {
			return 'text/html';
		});

		$response = get_post( $response_id );
		$body     = $response->post_content;
		
		$mail = array(
			'to'          => $to, 
			'object'      => $object, 
			'message'     => nl2br( $body ), 
			'headers'     => $headers, 
			'attachments' => '',
			'id'          => $form_id,
		);

		self::email_template( $mail );
	}

	/** 
	 * Email template
	 * @param  array $mail Fields
	 * @return void
	 */
	public static function email_template( $mail ) {
		ob_start();

		include( 'views/html-email-header.php' );

		echo $mail['message'];

		include( 'views/html-email-footer.php' );
			
		$message = ob_get_contents();
		ob_end_clean();

		wp_mail( $mail['to'], $mail['object'], $message, $mail['headers'], $mail['attachments'] );
	}

	/** 
	 * Send auto reply
	 * @param  int $form_id Form ID
	 * @return void
	 */
	public static function reply( $form_id ) {
		if ( ! isset( $_POST['formtastic'] ) ) {
			return;
		}

		if ( ! isset( $form_id ) ) {
			return;
		}

		if ( is_admin() ) {
			return;
		}

		global $reply_from_name, $reply_from_email;

		$version = Formtastic::version();
		$headers = array();

		$formtastic = get_post_meta( $form_id, 'formtastic', true );
		$settings   = $formtastic['settings'];

		/**
		 * To
		 **/
		$reply_to = ft_get_value( $settings['reply_to'], get_bloginfo( 'admin_email' ), 'email' );
		$reply_to = $reply_to[0];

		/**
		 * Object
		 **/
		$reply_object = ft_get_value( $settings['reply_object'], get_the_title( $form_id ) );
		$reply_object = $reply_object[0];

		/**
		 * From name
		 */
		$reply_from_name = ft_get_value( $settings['reply_from_name'], get_bloginfo( 'name' ) );
		$reply_from_name = implode( ' ', $reply_from_name );

		add_filter( 'wp_mail_from_name', function( $name ) {
			global $reply_from_name;

			return $reply_from_name;
		});

		/**
		 * From email
		 */
		$reply_from_email = ft_get_value( $settings['reply_from_email'], get_bloginfo( 'admin_email' ), 'email' );
		$reply_from_email = $reply_from_email[0];


		add_filter( 'wp_mail_from', function( $email ) {
			global $reply_from_email;

			return $reply_from_email;
		});

		/**
		 * Email type
		 */
		add_filter( 'wp_mail_content_type', function( $content_type ) {
			return 'text/html';
		});

		/**
		 * Message
		 */
		$body = ! empty( $settings['reply_msg'] ) ? $settings['reply_msg'] : '';

		if ( is_email( $reply_to ) && is_email( $reply_from_email ) ) {
			$mail = array(
				'to'          => $reply_to, 
				'object'      => $reply_object, 
				'message'     => nl2br( $body ), 
				'headers'     => $headers, 
				'attachments' => '',
				'id'          => $form_id,
			);

			self::email_template( $mail );
		}
	}

	/** 
	 * Subscribe to Mailchimp
	 * @param  int $form_id Form ID
	 * @return void
	 */
	public static function mailchimp( $form_id ) {
		global $error_label;

		if ( ! isset( $_POST['formtastic'] ) ) {
			return;
		}

		if ( ! isset( $form_id ) ) {
			return;
		}

		if ( is_admin() ) {
			return;
		}

		$formtastic = get_post_meta( $form_id, 'formtastic', true );
		$settings   = $formtastic['settings'];

		if ( isset( $settings['subscribe_mailchimp'] ) && $settings['subscribe_mailchimp'] == 'yes' ) {
			$api_key = ! empty( $settings['mc_api_key'] ) ? $settings['mc_api_key'] : '';
			$list_id = ! empty( $settings['mc_list_id'] ) ? $settings['mc_list_id'] : '';
			$opt_in  = ! empty( $settings['mc_opt_in'] ) ? 'pending' : 'subscribed';

			if ( isset( $settings['mc_cond'] ) && $settings['mc_cond'] == 'yes' ) {
				$cond = ft_get_value( $settings['mc_cond_field'], '' );
				$cond = $cond[0];

				switch ( $settings['mc_cond_operator'] ) {
					case '==' :
						if ( $cond !== $settings['mc_cond_value'] ) {
							self::send( $form_id );
							return;
						}
						break;

					case '!==' :
						if ( $cond == $settings['mc_cond_value'] ) {
							self::send( $form_id );
							return;
						}
						break;
				}
			}

			if ( ! empty( $api_key ) && ! empty( $list_id ) ) {
				$mc_email_key = ! empty( $settings['mc_email'] ) ? $settings['mc_email'] : '';
				$mc_fname_key = ! empty( $settings['mc_fname'] ) ? $settings['mc_fname'] : '';
				$mc_lname_key = ! empty( $settings['mc_lname'] ) ? $settings['mc_lname'] : '';

				if ( isset( $_POST[ $mc_email_key ] ) ) {
					$mc_email = wp_unslash( sanitize_email( $_POST[ $mc_email_key ] ) );
					$mc_fname = ! empty( $mc_fname_key ) ? wp_unslash( sanitize_text_field( $_POST[ $mc_fname_key ] ) ) : '';
					$mc_lname = ! empty( $mc_lname_key ) ? wp_unslash( sanitize_text_field( $_POST[ $mc_lname_key ] ) ) : '';
					$mc_lang  = ft_language_code();

					include_once( 'class-ft-mailchimp.php' );

					$mailchimp = new FT_Mailchimp( $api_key );

					$result = $mailchimp->post( "lists/$list_id/members", array( 'email_address' => $mc_email, 'status' => $opt_in, 'language' => $mc_lang, 'merge_fields' => array( 'FNAME' => $mc_fname, 'LNAME' => $mc_lname ) ) );

					if ( $mailchimp->success() ) {
						self::send( $form_id );

					} else {
						switch ( $result['title'] ) {
							case 'Member Exists' :
								$msg = __( 'Email address is already subscribed to the list.', 'formtastic' );
								break;

							case 'Invalid Resource' :
								$msg = __( 'An error has occurred, please check the field(s) again.', 'formtastic' );
								if ( isset( $result['errors'] ) ) {
									$errors = $result['errors'];
									foreach ( $errors as $error ) {
										if ( $error['field'] == 'FNAME' ) {
											$error_label[ $mc_fname_key ] = __( 'This field is required', 'formtastic' );
										}

										if ( $error['field'] == 'LNAME' ) {
											$error_label[ $mc_lname_key ] = __( 'This field is required', 'formtastic' );
										}
									}
								}

								if ( $result['detail'] == 'Blank email address' ) {
									$error_label[ $mc_email_key ] = __( 'This field is required', 'formtastic' );
								}
								break;
						}

						self::confirmation( false, $msg );
					}
				}
			}

		} else {
			self::send( $form_id );
		}
	}

	/** 
	 * Save the form
	 * @param  int $form_id Form ID
	 * @param  array $form Form settings
	 * @return void
	 */
	public static function save( $form_id, $form ) {
		if ( ! isset( $_POST['formtastic'] ) ) {
			return;
		}

		if ( ! isset( $form_id ) ) {
			return;
		}

		if ( ! isset( $form ) ) {
			return;
		}

		if ( is_admin() ) {
			return;
		}

		$nonce = 'formtastic-' . $form_id;

		if ( ! wp_verify_nonce( $_REQUEST[ $nonce ], 'formtastic_proceed' ) ) :
			self::confirmation( false, __( 'Error, nonce is not valid', 'formtastic' ) );
			
		else :

			if ( isset( $_POST['submit-' . $form_id] ) ) {
				$response = array(
					'post_type'    => 'ft_response',
					'post_title'   => $form['title'],
					'post_content' => $form['content'],
					'post_status'  => 'publish'
				);

				$post_id = wp_insert_post( $response );

				wp_set_object_terms( $post_id, $form_id, 'ft_response_form' );

				update_post_meta( $post_id, 'ft_name', $form['from_name'] );
				update_post_meta( $post_id, 'ft_email', $form['from_email'] );
				update_post_meta( $post_id, 'ft_form_id', $form_id );

				if ( isset( $form['files'] ) ) {
					update_post_meta( $post_id, 'ft_file', wp_json_encode( $form['files'], JSON_UNESCAPED_UNICODE ) );
				}

				update_post_meta( $post_id, 'ft_array', $form['array'] );
			}
		
		endif;
	}

	/** 
	 * Confirmation
	 * @param  boolean $is_valid
	 * @param  string $msg Message
	 * @return void
	 */
	public static function confirmation( $is_valid, $msg = '') {
		global $ft_confirm;

		if ( ! isset( $is_valid ) ) {
			return;
		}

		$form_id    = $_POST['formtastic'];
		$formtastic = get_post_meta( $form_id, 'formtastic', true );
		$settings   = $formtastic['settings'];

		if ( $is_valid ) {
			$ft_confirm['status']  = true;
			if ( empty( $msg ) ) {
				$ft_confirm['message'] = ( ! empty( $settings['success_msg'] ) ) ? $settings['success_msg'] : __( 'Your message has been sent.', 'formtastic' );

			} else {
				$ft_confirm['message'] = $msg;
			}

		} else {
			$ft_confirm['status'] = false;
			if ( empty( $msg ) ) {
				$ft_confirm['message'] = ( ! empty( $settings['error_msg'] ) ) ? $settings['error_msg'] : __( 'An error has occurred, please check the field(s) again.', 'formtastic' );
			
			} else {
				$ft_confirm['message'] = $msg;
			}
		}
	}
	
}

new FT_Proceed();
