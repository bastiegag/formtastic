<?php
/**
 * Import
 *
 * @author  Sébastien Gagné
 * @package Formtastic/Classes
 * @version 2.6.5
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * FT_Import class
 */
class FT_Import {

	public function __construct() {
		add_action( 'wp_ajax_nopriv_ft_import_form', array( $this, 'import' ) );
		add_action( 'wp_ajax_ft_import_form', array( $this, 'import' ) );
	}

	/**
	 * Import
	 */
	public function import() {
		if ( empty( $_POST['form_id'] ) ) {
			return;
		}

		if ( empty( $_FILES['file'] ) ) {
			return;
		}

		$form_id = $_POST['form_id'];
		$file    = $_FILES['file'];
		
		$upload      = wp_upload_dir();
		$file_path  = $upload['basedir'];
		$file_path  = $file_path . '/formtastic_uploads/';
		$file_name  = basename( sanitize_file_name( $file['name'] ) );
		
		$file_path .= $file_name;
		$temp_path  = $file['tmp_name'];

		if ( is_uploaded_file( $temp_path ) ) {
			if ( copy( $temp_path, $file_path ) ) {
				$form = file_get_contents( $file_path );

				update_post_meta( $form_id, 'formtastic', JSON_decode( $form, true ) );

				wp_send_json_success();
				wp_die();

			} else {
				wp_send_json_error();
				wp_die();
			}

		} else {
			wp_send_json_error();
			wp_die();
		}
	}

}

new FT_Import();
