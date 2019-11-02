<?php
/**
 * Ajax
 *
 * @author  Sébastien Gagné
 * @package Formtastic/Classes
 * @version 2.1.5
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * FT_Ajax class
 */
class FT_Ajax {

	public function __construct() {
		add_action( 'wp_ajax_nopriv_ft_read', array( $this, 'read' ) );
		add_action( 'wp_ajax_ft_read', array( $this, 'read' ) );

		add_action( 'wp_ajax_nopriv_ft_resend', array( $this, 'resend' ) );
		add_action( 'wp_ajax_ft_resend', array( $this, 'resend' ) );
	}

	/**
	 * Read
	 */
	public function read() {
		if ( ! is_admin() ) {
			return;
		}

		$response_id = $_REQUEST['response_id'];
		
		update_post_meta( $response_id, 'ft_read', 'read' );

		wp_send_json_success();

		wp_die();
	}

	/**
	 * Resend
	 */
	public function resend() {
		if ( ! is_admin() ) {
			return;
		}

		$form_id     = $_REQUEST['form_id'];
		$response_id = $_REQUEST['response_id'];

		FT_Proceed::resend( $form_id, $response_id );

		wp_send_json_success();

		wp_die();
	}

}

new FT_Ajax();
