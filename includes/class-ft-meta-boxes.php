<?php
/**
 * Meta boxes
 *
 * @author  Sébastien Gagné
 * @package Formtastic/Classes
 * @version 2.6.5
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * FT_Meta_boxes class
 */
class FT_Meta_boxes {

	public function __construct() {
		add_action( 'add_meta_boxes_formtastic', array( $this, 'register_meta_boxes' ) );
		add_action( 'save_post_formtastic', array( $this, 'save_meta_boxes_data' ), 10, 2 );

		add_action( 'add_meta_boxes_ft_response', array( $this, 'register_meta_boxes' ) );
		add_action( 'save_post_ft_response', array( $this, 'save_meta_boxes_data' ), 10, 2 );

		add_action( 'wp_ajax_nopriv_ft_create_field', array( $this, 'create_field' ) );
		add_action( 'wp_ajax_ft_create_field', array( $this, 'create_field' ) );

		add_action( 'wp_ajax_nopriv_ft_create_value', array( $this, 'create_value' ) );
		add_action( 'wp_ajax_ft_create_value', array( $this, 'create_value' ) );

		add_action( 'admin_menu', array( $this, 'remove_meta_boxes' ) );
	}

	/**
	 * Add formtastic meta boxes
	 */
	public function register_meta_boxes() {
		if ( post_type_exists( 'formtastic' ) ) {
			add_meta_box(
				'formtastic_settings_meta_box',
				__( 'Settings', 'formtastic' ),
				array( $this, 'build_formtastic_settings_meta_box' ),
				'formtastic',
				'normal',
				'default'
			);

			add_meta_box(
				'formtastic_fields_meta_box',
				__( 'Fields', 'formtastic' ),
				array( $this, 'build_formtastic_fields_meta_box' ),
				'formtastic',
				'side',
				'default'
			);

			add_meta_box(
				'formtastic_shortcode_meta_box',
				__( 'Shortcode', 'formtastic' ),
				array( $this, 'build_formtastic_shortcode_meta_box' ),
				'formtastic',
				'side',
				'default'
			);

			if ( get_post_status( get_the_ID() ) == 'publish' ) {
				add_meta_box(
					'formtastic_import_meta_box',
					__( 'Import', 'formtastic' ),
					array( $this, 'build_formtastic_import_meta_box' ),
					'formtastic',
					'side',
					'default'
				);
			}

			add_meta_box(
				'formtastic_builder_meta_box',
				__( 'Form builder', 'formtastic' ),
				array( $this, 'build_formtastic_builder_meta_box' ),
				'formtastic',
				'normal',
				'default'
			);
		}

		if ( post_type_exists( 'ft_response' ) ) {
			add_meta_box(
				'ft_response_meta_box',
				__( 'Response', 'formtastic' ),
				array( $this, 'build_ft_response_meta_box' ),
				'ft_response',
				'normal',
				'default'
			);

			add_meta_box(
				'ft_response_info_meta_box',
				__( 'Information', 'formtastic' ),
				array( $this, 'build_ft_response_info_meta_box' ),
				'ft_response',
				'side',
				'default'
			);
		}
	}

	/**
	 * Build formtastic settings meta box
	 */
	public function build_formtastic_settings_meta_box( $post ) {
		wp_nonce_field( basename( __FILE__ ), 'formtastic_meta_box_nonce' );

		include_once( 'views/html-form-settings.php' );
	}

	/**
	 * Build formtastic fields meta box
	 */
	public function build_formtastic_fields_meta_box( $post ) {
		include_once( 'views/html-form-fields.php' );
	}

	/**
	 * Build shortcode meta box
	 */
	public function build_formtastic_shortcode_meta_box( $post ) {
		echo sprintf( '<input type="text" value="[formtastic id=&quot;%s&quot;]" id="ft-shortcode" class="ft-input ft-autoselect" readonly>',
			$post->ID
		);
	}

	/**
	 * Build import meta box
	 */
	public function build_formtastic_import_meta_box( $post ) {
		echo sprintf( '<p><input type="file" value="" id="ft-import-form" class="ft-input" /></p><a href="#" class="button button-primary ft-import" data-form="%s">%s</a>',
			$post->ID,
			__( 'Import form', 'bravad' )
		);
	}

	/**
	 * Build formtastic builder meta box
	 */
	public function build_formtastic_builder_meta_box( $post ) {
		include_once( 'views/html-form-builder.php' );
		include_once( 'views/html-form-edit-field.php' );
	}

	/**
	 * Build response fields meta box
	 */
	public function build_ft_response_meta_box( $post ) {
		if ( 'ft_response' == get_post_type() ) {
			update_post_meta( $post->ID, 'ft_read', 'read' );
		}

		include_once( 'views/html-response.php' );
	}

	/**
	 * Build response fields meta box
	 */
	public function build_ft_response_info_meta_box( $post ) {
		include_once( 'views/html-response-info.php' );
	}

	/**
	 * Save formtastic meta box data
	 */
	public function save_meta_boxes_data( $post_id  ) {
		$options = get_option( 'ft_general' );

		if ( ! isset( $_POST['formtastic_meta_box_nonce'] ) || ! wp_verify_nonce( $_POST['formtastic_meta_box_nonce'], basename( __FILE__ ) ) ) {
			return;
		}

		if ( defined( 'DOING_AUTOSAVE' ) || is_int( wp_is_post_revision( $post_id ) ) || is_int( wp_is_post_autosave( $post_id	 ) ) ) {
			return;
		}

		if ( empty( $_POST['post_ID'] ) || $_POST['post_ID'] != $post_id ) {
			return;
		}

		if ( ! current_user_can( 'publish_pages', $post_id ) ) {
			return;
		}

		if ( isset( $_POST['formtastic'] ) ) {
			update_post_meta( $post_id, 'formtastic', ft_sanitize_field( $_POST['formtastic'] ) );
		}
	}

	/**
	 * Ajax create field
	 */
	public function create_field() {
		$field_type = $_POST['field_type'];
		$data       = isset( $_POST['field_data'] ) ? $_POST['field_data'] : '';
		$field_id   = uniqid( 'ft_' );

	    $field = ft_render_field( $field_type, $data, $field_id );

        wp_send_json_success(
        	array(
				'html' => $field,
				'id'   => $field_id
        	)
        );
	}

	/**
	 * Ajax create value
	 */
	public function create_value() {
		$values     = isset( $_POST['values'] ) ? $_POST['values'] : '';
		$conditions = isset( $_POST['conditions'] ) ? $_POST['conditions'] : '';
		$selection  = isset( $_POST['selection'] ) ? $_POST['selection'] : '';
		$html       = '';

		if ( is_array( $values ) ) {
			for ( $i = 0; $i < count( $values ); $i++ ) {
				$html .= self::render_value( $values[ $i ], $conditions[ $i ], $selection );
			}

		} else {
			if ( is_array( $conditions ) ) {
				$html .= self::render_value( $values, $conditions[0], $selection );

			} else {
				$html .= self::render_value( $values, $conditions, $selection );
			}
		}

        wp_send_json_success(
        	array(
				'html' => $html
        	)
        );
	}

	public function render_value( $values, $conditions, $selection ) {
		$html = '<div class="ft-values-field">';
		$html .= sprintf( '<div class="ft-handle">%s</div>', ft_icon( 'sort' ) );
		$html .= sprintf( '<div class="ft-cell"><input type="radio" value="%s" name="selection" class="ft-values ft-input"%s %s></div>',
			wp_unslash( $values ),
			$selection == $values ? ' data-prev="true"' : '',
			! empty( $values ) ? checked( $selection, $values, false ) : ''
		);
		$html .= sprintf( '<div class="ft-cell"><input type="text" value="%s" name="values" class="ft-values ft-input"></div>', wp_unslash( $values ) );
		$html .= sprintf( '<div class="ft-link">%s</div>', ft_icon( 'link' ) );
		$html .= sprintf( '<div class="ft-cell ft-conditions"><input type="text" value="%s" name="conditions" class="ft-values ft-input"></div>', $conditions );
		$html .= sprintf( '<div class="ft-substract-value">%s</div>', ft_icon( 'minus' ) );
		$html .= '</div>';

		return $html;
	}

	/**
	 * Remove meta boxes
	 * @return void
	 */
	public function remove_meta_boxes() {
		remove_meta_box( 'submitdiv', 'ft_response', 'side' );
		remove_meta_box( 'slugdiv', 'ft_response', 'normal' );
	}

}

new FT_Meta_boxes();
