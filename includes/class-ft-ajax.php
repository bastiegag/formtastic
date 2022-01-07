<?php
/**
 * Ajax
 *
 * @author  Sébastien Gagné
 * @package Formtastic/Classes
 * @version 2.7.5
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

		add_action( 'wp_ajax_nopriv_ft_spam', array( $this, 'spam' ) );
		add_action( 'wp_ajax_ft_spam', array( $this, 'spam' ) );

		add_action( 'wp_ajax_nopriv_ft_unspam', array( $this, 'unspam' ) );
		add_action( 'wp_ajax_ft_unspam', array( $this, 'unspam' ) );
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

	/**
	 * Spam
	 */
	public function spam() {
		if ( ! is_admin() ) {
			return;
		}

		$output = array();

		$response_id = $_REQUEST['response_id'];

		$ip = get_post_meta( $response_id, 'ft_from_ip', true );

		$list = get_option( 'ft_blacklist' );

		if ( ! empty( $list['ip_addresses'] ) ) {
			$new = array_map( 'trim', explode( ',', $list['ip_addresses'] ) );

		} else {
			$new = array();
		}

		if ( ! in_array( $ip, $new ) ) {
			$new[] = $ip;

			$output['ip_addresses'] = implode( ',', $new );

			update_option( 'ft_blacklist', $output, true );
		}

		update_post_meta( $response_id, 'ft_spam', true );

		wp_send_json_success( $bl['ip_addresses'] );

		wp_die();
	}

	/**
	 * Unspam
	 */
	public function unspam() {
		if ( ! is_admin() ) {
			return;
		}

		$output = array();

		$response_id = $_REQUEST['response_id'];

		$ip = get_post_meta( $response_id, 'ft_from_ip', true );

		$list = get_option( 'ft_blacklist' );

		if ( ! empty( $list['ip_addresses'] ) ) {
			$new = array_map( 'trim', explode( ',', $list['ip_addresses'] ) );

		} else {
			$new = array();
		}

		if ( in_array( $ip, $new ) ) {
			$i = 0;
			foreach ( $new as $item ) {
			    if ( $item == $ip ) {
			        unset( $new[$i] );
			    }

			    $i++;
			}

			$output['ip_addresses'] = implode( ',', array_values( $new ) );

			update_option( 'ft_blacklist', $output, true );
		}

		update_post_meta( $response_id, 'ft_spam', false );

		wp_send_json_success();

		wp_die();
	}

}

new FT_Ajax();
