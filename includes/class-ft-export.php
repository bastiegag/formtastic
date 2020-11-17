<?php
/**
 * Export
 *
 * @author  Sébastien Gagné
 * @package Formtastic/Classes
 * @version 2.6.5
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * FT_Export class
 */
class FT_Export {

	private $export;

	public function __construct() {
		add_filter( 'post_row_actions', array( $this, 'link' ), 10, 2 );

		add_action( 'admin_action_export_form', array( $this, 'export_form' ) );
	}

	/**
	 * Export link
	 */
	public function link( $actions, $post ) {
		if ( current_user_can( 'manage_options' ) && get_post_type() == 'formtastic' ) {
			$actions['export'] = sprintf( '<a href="%s" title="%s" rel="permalink">%s</a>',
				'admin.php?action=export_form&amp;post=' . $post->ID,
				__( 'Export this form', 'formtastic' ),
				__( 'Export', 'formtastic' )
			);
		}

		return $actions;
	}

	/**
	 * Export
	 */
	public function export_form() {
		if ( ! ( isset( $_GET['post'] ) || isset( $_POST['post'] )  || ( isset( $_REQUEST['action'] ) && 'duplicate_post' == $_REQUEST['action'] ) ) ) {
			wp_die( __( 'No form to export', 'formtastic' ) );
		}

		$post_id = ( isset( $_GET['post'] ) ? absint( $_GET['post'] ) : absint( $_POST['post'] ) );
		$post    = get_post( $post_id );

		if ( ! is_admin() ) {
			return;
		}

		if ( ! isset( $post_id ) ) {
			return;
		}

		$form = get_post_meta( $post_id, 'formtastic', true );

		self::create_json( JSON_encode( $form ), $post_id );
	}

	/**
	 * Create json
	 */
	public function create_json( $json, $form_id ) {
		$upload     = wp_upload_dir();
		$upload_dir = $upload['basedir'] . '/formtastic_uploads/';

		$title    = sanitize_title( get_the_title( $form_id ) );
		$filename = $upload_dir . $title . '.json';

		$file = fopen( $filename, 'w+' );

		fwrite( $file, $json );

		fclose( $file );

		header( 'Content-Description: File Transfer' );
		header( 'Content-Disposition: attachment; filename=' . basename( $filename ) );
		header( 'Content-Length: ' . filesize( $filename ) );
		header( 'Content-Type: text/plain' );

		readfile( $filename );
	}

}

new FT_Export();
