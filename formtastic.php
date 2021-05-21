<?php
/**
 * Plugin Name: Formtastic
 * Plugin URI: http://formtastic.sebastiengagne.ca/
 * Description: Plugin to create forms easily, it's formtastic!
 * Version: 2.7.0
 * Author: Sébastien Gagné
 * Author URI: http://sebastiengagne.ca/
 *
 * Text Domain: formtastic
 * Domain Path: /languages/
 **/

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

$dummy_desc = __( 'Plugin to create forms easily, it\'s formtastic!', 'formtastic' );

/**
 * Formtastic Class
 */
class Formtastic {

	/**
	 * Include required core files used in admin and on the frontend
	 */
	public function __construct() {
		add_action( 'plugins_loaded', array( $this, 'load_plugin_textdomain' ) );
		add_action( 'wp_mail_failed', array( $this, 'wp_error' ), 10, 1 );

		self::create_directory();
		
		include_once( 'includes/class-ft-register.php' );
		include_once( 'includes/class-ft-post-types.php' );
		include_once( 'includes/class-ft-meta-boxes.php' );
		include_once( 'includes/class-ft-settings.php' );
		include_once( 'includes/class-ft-export-responses.php' );
		include_once( 'includes/class-ft-export.php' );
		include_once( 'includes/class-ft-import.php' );
		include_once( 'includes/class-ft-form.php' );
		include_once( 'includes/class-ft-proceed.php' );
		include_once( 'includes/class-ft-ajax.php' );
		include_once( 'includes/class-ft-dashboard-widget.php' );
		include_once( 'includes/class-ft-widget.php' );
		include_once( 'includes/class-ft-notification.php' );
		include_once( 'includes/class-ft-duplicate.php' );
		include_once( 'includes/ft-functions.php' );

		add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), array( $this, 'add_action_links' ), 10, 2 );
	}

	/** 
	 * Load text domain
	 */
	public static function load_plugin_textdomain() {
	    load_plugin_textdomain( 'formtastic', false, basename( dirname( __FILE__ ) ) . '/languages' );
	}

	/** 
	 * Plugin Url
	 */
	public static function plugin_url() {
	    return plugins_url( '/', __FILE__ );
	}

	/** 
	 * Plugin version
	 */
	public static function version() {
	    return '2.7.0';
	}

	/** 
	 * Default SMTP options
	 */
	public static function smtp( $key = 'host' ) {
		$arr = array(
			'host'     => 'smtp.sendgrid.net',
			'port'     => '587',
			'username' => 'apikey',
			'password' => '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'
		);

	    return $arr[ $key ];
	}

	/** 
	 * Error log wp_mail_failed
	 */
	public function wp_error( $wp_error ) {
	    return error_log( print_r( $wp_error, true ) );
	}

	/**
	 * Create uploads directory
	 */
	private static function create_directory() {
		$upload_dir = wp_upload_dir();

		$files = array(
			array(
				'base'    => $upload_dir['basedir'] . '/formtastic_uploads',
				'file'    => 'index.html',
				'content' => '',
			)
		);

		foreach ( $files as $file ) {
			if ( wp_mkdir_p( $file['base'] ) && ! file_exists( trailingslashit( $file['base'] ) . $file['file'] ) ) {
				if ( $file_handle = @fopen( trailingslashit( $file['base'] ) . $file['file'], 'w' ) ) {
					fwrite( $file_handle, $file['content'] );
					fclose( $file_handle );
				}
			}
		}
	}

	/** 
	 * Add action links to plugin
	 * @param  array $links Actions link
	 * @return array
	 */
	public function add_action_links( $links ) {
		$custom = array( 
			sprintf( '<a href="%s">%s</a>', 
				admin_url( 'edit.php?post_type=formtastic&page=ft-settings' ), 
				__( 'Settings', 'formtastic' ) 
			) 
		);
		
		return array_merge( $links, $custom );
	}
}

new Formtastic();
