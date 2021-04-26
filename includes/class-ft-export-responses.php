<?php
/**
 * Export responses
 *
 * @author  Sébastien Gagné
 * @package Formtastic/Classes
 * @version 2.6.9
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * FT_Export_Responses class
 */
class FT_Export_Responses {

	private $export;

	public function __construct() {
		add_action( 'manage_posts_extra_tablenav', array( $this, 'button' ) );

		add_action( 'admin_action_export_responses', array( $this, 'export_responses' ) );
	}

	/**
	 * Export responses button
	 */
	public function button() { 
		if ( get_post_type() == 'ft_response' ) {
			echo sprintf( '<a href="%s" id="ft-export-response" class="button action">%s</a>',
				'#',
				__( 'Export', 'formtastic' )
			);
		}
	}

	/**
	 * Export
	 */
	public function export_responses() {
		if ( ! is_admin() ) {
			return;
		}

		if ( ! is_user_logged_in() ) {
			return;
		}

		$rows = array();
		$form_id = $_GET['form'];

		$args = array(
			'posts_per_page' => -1,
			'post_status'    => 'publish',
			'post_type'      => 'ft_response',
			'meta_query'	 => array(
				array(
					'key'     => 'ft_form_id',
					'value'   => $form_id,
					'compare' => '='
				)
			)
		);

		$loop = new WP_Query( $args );

		if ( $loop->have_posts() ) : 
			while( $loop->have_posts() ) : $loop->the_post();

				$post_id = get_the_ID();
				$fields  = get_post_meta( $post_id, 'ft_json', true );
				$date    = ft_language_code() == 'fr' ? get_the_time( 'j F Y - G\hi' ) : get_the_time( 'F j, Y - g:i a' );

				$rows[] = array(
					get_the_title( $form_id ),
					$date,
					$fields
				);

			endwhile;
		endif;
		wp_reset_postdata();

		if ( isset( $rows ) && ! empty( $rows ) ) {
			$output   = array();
			$output[] = array( 'sep=;' );

			$fields = ft_get_fields( $form_id );
			$fields_name = array();

			foreach ( $fields as $key => $value ) {
				$fields_name[] = $value['label'];
			}

			$head = array_merge( array( __( 'Form', 'formtastic' ), __( 'Date', 'formtastic' ) ), $fields_name );
			
			$output[] = $head;

			foreach ( $rows as $row ) {
				$fields = json_decode( $row[2] );

				foreach ( $fields as $key => $value ) {
					$fields_value[] = html_entity_decode( $value );
				}

				$output[] = array_merge( array( $row[0], $row[1] ), $fields_value );
			}

			$file_name = __( 'Responses', 'formtastic' );

			self::create_csv( $output, $file_name );
		}
	}

	/**
	 * Create csv
	 */
	public function create_csv( $array, $title ) {
		$upload     = wp_upload_dir();
		$upload_dir = $upload['basedir'] . '/formtastic_uploads/';

		$filename = $upload_dir . sanitize_title( $title ) . '.csv';

		$file = fopen( $filename, 'w' );

		foreach ( $array as $line ) {
		    fputcsv( $file, mb_convert_encoding( $line, 'iso-8859-1', 'UTF-8' ), ';' );
		}

		fclose( $file );

		header( 'Content-Description: File Transfer' );
		header( 'Content-Disposition: attachment; filename=' . basename( $filename ) );
		header( 'Content-Length: ' . filesize( $filename ) );
		header( 'Content-Type: text/csv;' );

		readfile( $filename );
	}

}

new FT_Export_Responses();
