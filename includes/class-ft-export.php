<?php
/**
 * Export
 *
 * @author  Sébastien Gagné
 * @package Formtastic/Classes
 * @version 2.4.1
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
		add_action( 'admin_menu', array( $this, 'settings' ), 5 );
		add_action( 'admin_init', array( $this, 'settings_init' ) );

		add_action( 'wp_ajax_nopriv_ft_export_responses', array( $this, 'export' ) );
		add_action( 'wp_ajax_ft_export_responses', array( $this, 'export' ) );
	}

	/**
	 * Settings page
	 */
	public function settings() {
		add_submenu_page(
			'edit.php?post_type=formtastic',
			__( 'Formtastic export', 'formtastic' ),
			__( 'Export', 'formtastic' ),
			'manage_options',
			'ft-export',
			array( $this, 'output_settings' )
		);
	}

	/**
	 * Output settings page
	 */
	public function output_settings() {
		$this->export = get_option( 'ft_export_responses' );
		?>

		<div class="wrap">
			<?php $active_tab = isset( $_GET[ 'tab' ] ) ? $_GET[ 'tab' ] : 'responses'; ?>  
			
			<nav class="nav-tab-wrapper ft-nav-tab-wrapper">  
				<a href="?post_type=formtastic&page=ft-export&tab=responses" class="nav-tab <?php echo $active_tab == 'responses' ? 'nav-tab-active' : ''; ?>"><?php _e( 'Responses', 'formtastic' ); ?></a>  
				<a href="?post_type=formtastic&page=ft-export&tab=forms" class="nav-tab <?php echo $active_tab == 'forms' ? 'nav-tab-active' : ''; ?>"><?php _e( 'Forms', 'formtastic' ); ?></a>  
			</nav>

			<h1 class="screen-reader-text"><?php _e( 'Responses', 'formtastic' ); ?></h1>
			<?php settings_errors(); ?> 

		    <form method="post" action="options.php">
				<?php 
					if ( $active_tab == 'responses' ) {  
						settings_fields( 'ft_export_responses' );
						do_settings_sections( 'ft_export_responses_settings' );

					} else if ( $active_tab == 'forms' ) {
						settings_fields( 'ft_export_forms' );
						do_settings_sections( 'ft_export_forms_settings' );
					}

					echo '<hr>';

					echo '<div class="ft-download"></div>';

					echo sprintf( '<p class="submit"><button class="button button-primary ft-export">%s</button></p>',
						__( 'Export', 'formtastic' )
					);
				?>
		    </form>
		</div>
		
		<?php
	}

	/**
	 * Register and add settings
	 */
	public function settings_init() {
		/**
		 * Responses
		 */
		register_setting(
		    'ft_export_responses',
		    'ft_export_responses',
		    array( $this, 'sanitize' )
		);

		add_settings_section(
		    'ft_export_responses',
		    '',
		    function() {
				print __( 'Select options to export formtastic responses.', 'formtastic' );
		    },
		    'ft_export_responses_settings'
		);

		add_settings_field(
		    'ft_export_responses_form',
		    __( 'Form', 'formtastic' ),
		    array( $this, 'responses_form' ),
		    'ft_export_responses_settings',
		    'ft_export_responses'          
		);

		add_settings_field(
		    'ft_export_responses_from_date',
		    __( 'Start from', 'formtastic' ),
		    array( $this, 'export_from_date' ),
		    'ft_export_responses_settings',
		    'ft_export_responses'          
		);

		add_settings_field(
		    'ft_export_responses_to_date',
		    __( 'Until', 'formtastic' ),
		    array( $this, 'export_to_date' ),
		    'ft_export_responses_settings',
		    'ft_export_responses'          
		);

		/**
		 * Responses
		 */
		register_setting(
		    'ft_export_forms',
		    'ft_export_forms',
		    array( $this, 'sanitize' )
		);

		add_settings_section(
		    'ft_export_forms',
		    '',
		    function() {
				print __( 'Select options to export formtastic forms.', 'formtastic' );
		    },
		    'ft_export_forms_settings'
		);

		add_settings_field(
		    'ft_export_forms_form',
		    __( 'Form', 'formtastic' ),
		    array( $this, 'forms' ),
		    'ft_export_forms_settings',
		    'ft_export_forms'          
		);
	}

	/**
	 * Responses form select
	 */
	public function responses_form() {
		$args = array(
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'asc',
			'post_type'      => 'formtastic',
			'post_status'    => 'publish'
		);

		$forms = get_posts( $args );

	    echo '<select id="export_form" name="ft_export_responses[form]">';
	    
	    foreach ( $forms as $form ) {
	    	echo sprintf( '<option value="%s" %s>%s</option>',
	    		$form->ID,
	    		selected( $form->ID, $this->export['form'], false ),
	    		$form->post_title
	    	);

	    }
	    wp_reset_postdata();

		echo '</select>';
	}

	/**
	 * Forms select
	 */
	public function forms() {
		$args = array(
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'asc',
			'post_type'      => 'formtastic',
			'post_status'    => 'publish'
		);

		$forms = get_posts( $args );
	    
	    foreach ( $forms as $form ) {
	    	echo sprintf( '<label><input value="%s" type="checkbox" name="ft_export_forms[forms][]" %s />%s</label>',
	    		$form->ID,
	    		checked( $form->ID, $this->export['form'], false ),
	    		$form->post_title
	    	);
	    }
	    wp_reset_postdata();
	}

	/**
	 * Form date
	 */
	public function export_from_date() {
		echo sprintf( '<input type="text" id="export_from_date" name="ft_export_responses[from_date]" value="%s" />',
		    ! empty( $this->export['from_date'] ) ? $this->export['from_date'] : ''
		);
	}

	/**
	 * To date
	 */
	public function export_to_date() {
		echo sprintf( '<input type="text" id="export_to_date" name="ft_export_responses[to_date]" value="%s" />',
		    ! empty( $this->export['to_date'] ) ? $this->export['to_date'] : ''
		);
	}

	/**
	 * Export
	 */
	public function export() {
		$form_id = ! empty( $_REQUEST['form_id'] ) ? (int)$_REQUEST['form_id'] : null;
		$min     = ! empty( $_REQUEST['min'] ) ? $_REQUEST['min'] : null;
		$max     = ! empty( $_REQUEST['max'] ) ? $_REQUEST['max'] : null;

		if ( ! is_admin() ) {
			return;
		}

		if ( ! isset( $form_id ) ) {
			return;
		}

		$formtastic = get_post_meta( $form_id, 'formtastic', true );

		$output = array();
		$infos  = array();
		$header = array();
		$body   = array();

		foreach ( $formtastic['fields'] as $key => $value ) {
			$label       = '';
			$placeholder = '';
			$type        = '';

			foreach ( json_decode( $value ) as $field ) {
				if ( $field->name == 'label' ) {
					$label = $field->value;
				}

				if ( $field->name == 'placeholder' ) {
					$placeholder = $field->value;
				}

				if ( $field->name == 'type' ) {
					$type = $field->value;
				}
			}

			$label = empty( $label ) ? $placeholder : $label;

			$infos[]  = $key;

			if ( $type !== 'row' ) {
				$header[] = htmlentities( $label, ENT_COMPAT, 'UTF-8' );
			}
		}

		$args = array(
			'posts_per_page' => -1,
			'post_status'    => 'publish',
			'post_type'      => 'ft_response',
			'tax_query'      => array(
		        array(
					'taxonomy' => 'ft_response_form',
					'field'    => 'slug',
					'terms'    => array( $form_id ),
		        )
		    ),
		);

		if ( isset( $min ) ) {
			$date = explode( '-', $min );

			$args['date_query'][] = array(
				'after' => array(
					'year'  => $date[2],
					'month' => $date[1],
					'day'   => $date[0],
				)
			);
		}

		if ( isset( $max ) ) {
			$date = explode( '-', $max );

			$args['date_query'][] = array(
				'before' => array(
					'year'  => $date[2],
					'month' => $date[1],
					'day'   => $date[0],
				)
			);
		}

		$loop = new WP_Query( $args );

		if ( $loop->have_posts() ) : 
			while( $loop->have_posts() ) : $loop->the_post();

				$fields = (array)json_decode( get_post_meta( get_the_ID(), 'ft_array', true ) );

				$response = array();
				foreach ( $infos as $key ) {
					if ( ! empty( $fields[ $key ] ) ) {
						$response[] = $fields[ $key ];
						// $response[] = html_entity_decode( $fields[ $key ] );
						// $response[] = htmlentities( $fields[ $key ], ENT_COMPAT, 'UTF-8' );
					}
				}

				if ( ! empty( $response ) ) {
					$body[] = $response;
				}

			endwhile;
		endif;
		wp_reset_postdata();

		$output[] = $header;
		foreach ( $body as $row ) {
			$output[] = $row;
		}

		self::create_csv( $output, $form_id );
	}

	/**
	 * Create csv
	 */
	public function create_csv( $array, $form_id, $delimiter = ';' ) {
		$upload     = wp_upload_dir();
		$upload_dir = $upload['basedir'] . '/formtastic_uploads/';

		$title = sanitize_title( get_the_title( $form_id ) );
		$file  = fopen( $upload_dir . $title . '.csv', 'w' );

	    foreach ( $array as $line ) {
	        fputcsv( $file, array_map( 'html_entity_decode', array_values( $line ) ), $delimiter );
	    }

	    fclose( $file );

	    wp_send_json_success( 
	    	array(
	    		'url' => $upload['baseurl'] . '/formtastic_uploads/' . $title . '.csv'
	    	)
	    );

	    wp_die();
	}

}

new FT_Export();
