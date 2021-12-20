<?php
/**
 * Register
 *
 * @author  Sébastien Gagné
 * @package Formtastic/Classes
 * @version 2.7.2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * FT_Register class
 */
class FT_Register {

	public function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'styles_scripts' ), 10 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_styles_scripts' ) );
		add_action( 'admin_bar_menu', array( $this, 'toolbar' ), 999 );

		add_filter( 'post_row_actions', array( $this, 'disable_quick_links' ), 10, 2 );

		add_shortcode( 'formtastic', array( $this, 'shortcode' ) );
	}

	/**
	 * Enqueue styles and scripts
	 */
	public function styles_scripts() {
		global $google_key;

		$plugin_url = Formtastic::plugin_url();
		$version    = Formtastic::version();
		$options    = get_option( 'ft_general' );
		
		wp_enqueue_style( 'wp-color-picker' );

		$vars = array(
			'site_url'   => home_url(),
			'site_title' => get_bloginfo( 'name' ),
			'ajax_url'   => admin_url( 'admin-ajax.php' ),
			'post_id'    => get_the_ID(),
			'lang_code'  => ft_language_code()
		);

		/**
		 * Captcha
		 */
		if ( isset( $options['use_captcha'] ) && $options['use_captcha'] == 'yes' ) {
			$vars['site_key']    = $options['site_key'];
			$vars['use_captcha'] = $options['use_captcha'];

			wp_enqueue_script( 'formtastic-captcha', '//www.google.com/recaptcha/api.js?render=' . $options['site_key'], array( 'jquery' ), '3.0.0', false );
		}

		/**
		 * Scripts
		 */
		wp_enqueue_script( 'formtastic', $plugin_url . 'assets/js/formtastic.js', array( 'jquery', 'jquery-ui-datepicker', 'jquery-ui-draggable', 'jquery-ui-slider', 'jquery-touch-punch' ), $version, true );

		wp_localize_script( 'formtastic', 'ft', $vars );
	}

	/**
	 * Enqueue admin styles and scripts
	 */
	public function admin_styles_scripts() {
		$plugin_url = Formtastic::plugin_url();
		$version    = Formtastic::version();

		wp_enqueue_style( 'formtastic', $plugin_url . 'assets/css/formtastic' . ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min' ) . '.css', array(), $version );

		wp_enqueue_media();
		
		wp_enqueue_style( 'thickbox' );
		wp_enqueue_script( 'thickbox' );

		/**
		 * jQuery UI
		 */
		wp_enqueue_script( 'jquery-ui-datepicker' );
		wp_register_style( 'jquery-ui', '//ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.min.css' );
		wp_enqueue_style( 'jquery-ui' );
		
		$screen = get_current_screen();
		
		if ( $screen->post_type == 'formtastic' || $screen->post_type == 'ft_response' ) {
			wp_deregister_script( 'media-upload' );

			wp_enqueue_style( 'wp-color-picker' ); 
			
			wp_enqueue_script( 'jquery-ui-draggable' );
			wp_enqueue_script( 'formtastic-admin-scripts', $plugin_url . 'assets/js/formtastic-admin.js', array( 'jquery', 'wp-color-picker' ), $version, true );
			
			$vars = array(
				'ajax_url'   => admin_url( 'admin-ajax.php' ),
				'lang_code'  => ft_language_code(),
				'plugin_dir' => plugins_url( '../', __FILE__ )
			);

			wp_localize_script( 'formtastic-admin-scripts', 'ft', $vars );
		}
	}

	/** 
	 * Register formtastic shortcode
	 * @param  array $atts Shortcode attributes
	 * @return void
	 */
	public function shortcode( $atts ) {
		$atts = shortcode_atts( array(
				'id' => null
			), $atts, 'formtastic' );

		if ( ! $atts['id'] ) {
			return;
		}

		if ( ! get_post_status( $atts['id'] ) ) {
			return;
		}

		$id = ( function_exists( 'wpml_object_id' ) ) ? wpml_object_id( $atts['id'], 'post', true ) : $atts['id'];

		$formtastic = get_post_meta( $id, 'formtastic', true );
		$settings   = $formtastic['settings'];

		if ( get_post_type( $id ) == 'formtastic' ) {
			return FT_Form::build( $id );
		}
	}
	
	/**
	 * Toolbar links
	 */
	public function toolbar( $wp_admin_bar ) {
		if ( current_user_can( 'update_core' ) ) {
			$links = array(
				array(
					'id'     => 'formtastic',
					'title'  => __( 'Formtastic', 'formtastic' ),
					'href'   => 'edit.php?post_type=formtastic',
					'parent' => false,
					'meta'   => array( 
						'class' => 'formtastic' 
					)
				),
				array(
					'id'     => 'ft-new',
					'title'  => __( 'Add form', 'formtastic' ),
					'href'   => 'post-new.php?post_type=formtastic',
					'parent' => 'formtastic'
				),
				array(
					'id'     => 'ft-responses',
					'title'  => __( 'Responses', 'formtastic' ),
					'href'   => 'edit.php?post_type=ft_response',
					'parent' => 'formtastic'
				)
			);

		} else if ( current_user_can( 'publish_pages' ) ) {
			$links = array(
				array(
					'id'     => 'formtastic',
					'title'  => __( 'Formtastic', 'formtastic' ),
					'href'   => 'edit.php?post_type=ft_response',
					'parent' => false,
					'meta'   => array( 
						'class' => 'formtastic' 
					)
				)
			);
		}

		if ( isset( $links ) ) {
			foreach ( $links as $link ) {
				$wp_admin_bar->add_node( $link );
			}	
		}
	}

	/** 
	 * Disable quick links
	 * @param  array $actions Actions link
	 * @return void
	 */
	public function disable_quick_links( $actions = array(), $post = null ) {
	    if ( get_post_type() !== 'ft_response' ) {
	        return $actions;
	    }

	    if ( isset( $actions['edit'] ) ) {
	        unset( $actions['edit'] );
	    }

	    if ( isset( $actions['view'] ) ) {
	        unset( $actions['view'] );
	    }

	    if ( isset( $actions['inline hide-if-no-js'] ) ) {
	        unset( $actions['inline hide-if-no-js'] );
	    }

	    return $actions;
	}
	
}

new FT_Register();
