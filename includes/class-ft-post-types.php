<?php
/**
 * Post types
 *
 * @author  Sébastien Gagné
 * @package Formtastic/Classes
 * @version 2.6.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * FT_Post_types class
 */
class FT_Post_types {

	public function __construct() {
		add_action( 'init', array( $this, 'register_post_types' ), 5 );
		add_action( 'init', array( $this, 'register_taxonomy' ), 0 );
		add_action( 'restrict_manage_posts', array( $this, 'taxonomy_filters' ) );

		add_action( 'manage_formtastic_posts_custom_column', array( $this, 'formtastic_columns_content' ), 10, 2 );
		add_action( 'manage_ft_response_posts_custom_column', array( $this, 'response_columns_content' ), 10, 2 );

		add_filter( 'manage_formtastic_posts_columns', array( $this, 'formtastic_columns_head' ) );
		add_filter( 'manage_ft_response_posts_columns', array( $this, 'response_columns_head' ) );

		add_filter( 'manage_edit-ft_response_sortable_columns', array( $this, 'response_sortable_columns' ) );
		add_action( 'pre_get_posts', array( $this, 'response_orderby' ) );

		add_action( 'init', array( $this, 'response_readed' ), 0 );
	}

	/**
	 * Register formtastic post type
	 */
	public function register_post_types() {
		if ( post_type_exists( 'formtastic' ) ) {
			return;
		}

		register_post_type( 'formtastic',
			array(
				'labels'              => array(
					'add_new'            => __( 'Add form', 'formtastic' ),
					'add_new_item'       => __( 'Add new form', 'formtastic' ),
					'all_items'          => __( 'All forms', 'formtastic' ),
					'edit_item'          => __( 'Edit form', 'formtastic' ),
					'menu_name'          => __( 'Formtastic', 'formtastic' ),
					'name'               => __( 'Formtastic', 'formtastic' ),
					'name_admin_bar'     => __( 'Formtastic', 'formtastic' ),
					'new_item'           => __( 'New form', 'formtastic' ),
					'not_found'          => __( 'No form found', 'formtastic' ),
					'not_found_in_trash' => __( 'No form found in trash', 'formtastic' ),
					'parent_item_colon'  => __( 'Parent form', 'formtastic' ),
					'search_items'       => __( 'Search forms', 'formtastic' ),
					'singular_name'      => __( 'Formtastic', 'formtastic' ),
					'view_item'          => __( 'View form', 'formtastic' ),
				),
				'capabilities' 		  => array(
					'edit_post'          => 'manage_options',
					'read_post'          => 'publish_pages',
					'delete_post'        => 'manage_options',
					'edit_posts'         => 'manage_options',
					'edit_others_posts'  => 'manage_options',
					'delete_posts'       => 'manage_options',
					'publish_posts'      => 'manage_options',
					'read_private_posts' => 'manage_options'
				),
				'exclude_from_search' => true,
				'has_archive'         => false,
				'hierarchical'        => false,
				'menu_icon'           => 'dashicons-email-alt',
				'menu_position'       => 100,
				'public'              => false,
				'publicly_queryable'  => false,
				'query_var'           => true,
				'rewrite'             => array( 'slug' => 'formtastic', 'with_front' => false ),
				'show_in_admin_bar'   => true,
				'show_in_menu'        => true,
				'show_in_nav_menus'   => false,
				'show_ui'             => true,
				'supports'            => array( 'title' ),
			)
		);

		if ( current_user_can( 'manage_options' ) ) {
			$label = __( 'Responses', 'formtastic' );
			$menu  = 'edit.php?post_type=formtastic';

		} else {
			$label = __( 'Formtastic', 'formtastic' );
			$menu  = true;
		}

		register_post_type( 'ft_response',
			array(
				'labels'              => array(
					'add_new'            => __( 'Add response', 'formtastic' ),
					'add_new_item'       => __( 'Add new response', 'formtastic' ),
					'all_items'          => __( 'Responses', 'formtastic' ),
					'edit_item'          => '',
					'menu_name'          => $label,
					'name'               => $label,
					'name_admin_bar'     => $label,
					'new_item'           => __( 'New response', 'formtastic' ),
					'not_found'          => __( 'No response found', 'formtastic' ),
					'not_found_in_trash' => __( 'No response found in trash', 'formtastic' ),
					'parent_item_colon'  => __( 'Parent response', 'formtastic' ),
					'search_items'       => __( 'Search responses', 'formtastic' ),
					'singular_name'      => __( 'Response', 'formtastic' ),
					'view_item'          => __( 'View response', 'formtastic' ),
				),
				'capabilities'        => array(
					'create_posts' => 'do_not_allow'
				),
				'exclude_from_search' => true,
				'has_archive'         => false,
				'hierarchical'        => false,
				'map_meta_cap'        => true,
				'menu_icon'           => 'dashicons-email-alt',
				'menu_position'       => 100,
				'public'              => false,
				'publicly_queryable'  => true,
				'query_var'           => true,
				'rewrite'             => array( 'slug' => 'ft_response', 'with_front' => false ),
				'show_in_admin_bar'   => true,
				'show_in_menu'        => $menu,
				'show_in_nav_menus'   => false,
				'show_ui'             => true,
				'supports'            => false,
			)
		);
	}

	/**
	 * Register formtastic taxonomy
	 */
	public function register_taxonomy() {
		register_taxonomy( 'ft_response_form', array( 'ft_response' ),
			array(
				'hierarchical'      => true,
				'labels'            => array(
					'add_new_item'      => __( 'Add new form', 'formtastic' ),
					'all_items'         => __( 'All forms', 'formtastic' ),
					'edit_item'         => __( 'Modify form', 'formtastic' ),
					'menu_name'         => __( 'Forms', 'formtastic' ),
					'name'              => __( 'Form', 'formtastic' ),
					'new_item_name'     => __( 'New form name', 'formtastic' ),
					'parent_item'       => __( 'Parent form', 'formtastic' ),
					'parent_item_colon' => __( 'Parent form :', 'formtastic' ),
					'search_items'      => __( 'Search forms', 'formtastic' ),
					'singular_name'     => __( 'Form', 'formtastic' ),
					'update_item'       => __( 'Update form', 'formtastic' ),
				),
				'public'            => true,
				'query_var'         => true,
				'show_admin_column' => false,
				'show_in_nav_menus' => false,
				'show_ui'           => false,
			)
		);
	}

	/**
	 * Formtastic taxonomy filters
	 */
	public function taxonomy_filters() {
		global $typenow;
	 
		$taxonomies = array( 'ft_response_form' );
	 
		if ( $typenow == 'ft_response' ) {
	 
			foreach ( $taxonomies as $tax_slug ) {
				$tax_obj  = get_taxonomy( $tax_slug );
				$tax_name = $tax_obj->labels->name;
				$terms    = get_terms( $tax_slug );

				if ( count( $terms ) > 0 ) {
					echo '<select name="' . $tax_slug . '" id="' . $tax_slug . '" class="postform">';
					echo '<option value="">' . __( 'Show all forms', 'formtastic' ) . '</option>';

					foreach ( $terms as $term ) { 
						echo sprintf( '<option value="%s"%s>%s (%s)</option>',
							$term->slug,
							isset( $_GET[ $tax_slug ] ) && $_GET[ $tax_slug ] == $term->slug ? ' selected="selected"' : '',
							get_the_title( (int)$term->slug ),
							$term->count
						);
					}

					echo '</select>';
				}
			}
		}
	}

	/** 
	 * Formtastic columns head
	 * @param  string $columns
	 * @return void
	 */
	public function formtastic_columns_head( $columns ) {
	    $new_columns = array();

	    foreach ( $columns as $key => $title ) {
	        if ( $key == 'date' ) {
				$new_columns['fields'] = __( 'Fields', 'formtastic' );
				$new_columns['recipient'] = __( 'Recipient', 'formtastic' );
				$new_columns['shortcode'] = __( 'Shortcode', 'formtastic' );
	        	$new_columns['actions']   = __( 'Actions', 'formtastic' );
	        }

	        $new_columns[ $key ] = $title;
	    }
	    
	    return $new_columns;
	}

	/** 
	 * Formtastic columns content
	 * @param  string $column_name
	 * @param  int $post_id
	 * @return void
	 */
	public function formtastic_columns_content( $column_name, $post_id ) {
		$formtastic = get_post_meta( $post_id, 'formtastic', true );
		$settings   = $formtastic['settings'];
		$options    = get_option( 'ft_general' );

		if ( $column_name == 'actions' ) {
			if ( isset( $settings['send_email'] ) ) {
				echo sprintf( '<span title="%s" class="ft-icon">%s</span>',
					__( 'Send by email', 'formtastic' ),
					ft_icon( 'mail-close' )
				);
			}

			if ( isset( $settings['save_copy'] ) ) {
				echo sprintf( '<span title="%s" class="ft-icon">%s</span>',
					__( 'Save a copy on Wordpress', 'formtastic' ),
					ft_icon( 'wordpress' )
				);
			}

			if ( isset( $settings['send_reply'] ) ) {
				echo sprintf( '<span title="%s" class="ft-icon">%s</span>',
					__( 'Send auto reply', 'formtastic' ),
					ft_icon( 'redo' )
				);
			}

			if ( isset( $settings['send_copy'] ) ) {
				echo sprintf( '<span title="%s" class="ft-icon">%s</span>',
					__( 'Send copy', 'formtastic' ),
					ft_icon( 'copy' )
				);
			}

			if ( isset( $settings['subscribe_mailchimp'] ) ) {
				echo sprintf( '<span title="%s" class="ft-icon">%s</span>',
					__( 'Subscribe to mailchimp', 'formtastic' ),
					ft_icon( 'heart' )
				);
			}
		}

		if ( $column_name == 'fields' ) {
			echo isset( $formtastic['fields'] ) ? count( $formtastic['fields'] ) : '0';
		}

		if ( $column_name == 'recipient' ) {
			if ( isset( $settings['send_email'] ) ) {
				if ( isset( $options['dev_use'] ) && $options['dev_use'] == 'yes' ) {
					echo '<del class="ft-del">';
					echo ! empty( $settings['to'] ) ? $settings['to'] : get_bloginfo( 'admin_email' );
					echo '</del><br />';
					echo ! empty( $options['dev_email'] ) ? $options['dev_email'] : get_bloginfo( 'admin_email' );

				} else {
					echo ! empty( $settings['to'] ) ? $settings['to'] : get_bloginfo( 'admin_email' );
				}
			}
		}

		if ( $column_name == 'shortcode' ) {
			echo sprintf( '[formtastic id="%s"]',
				$post_id
			);
	    }
	}

	/** 
	 * Response columns head
	 * @param  string $columns
	 * @return void
	 */
	public function response_columns_head( $columns ) {
	    $new_columns = array();

	    foreach ( $columns as $key => $title ) {
	        if ( $key == 'title' ) {
	            $new_columns['read']   = '';
	            $new_columns['resend'] = '';
	        }

	        if ( $key == 'date' ) {
				$new_columns['from_name']  = __( 'Name', 'formtastic' );
				$new_columns['from_email'] = __( 'Email', 'formtastic' );
				$new_columns['form']       = __( 'Form', 'formtastic' );
	        }

	        $new_columns[ $key ] = $title;
	    }
	    
	    return $new_columns;
	}

	/** 
	 * Response columns content
	 * @param  string $column_name
	 * @param  int $post_id
	 * @return void
	 */
	public function response_columns_content( $column_name, $post_id ) {
		switch ( $column_name ) {
			case 'form' :
				$terms = get_the_terms( $post_id, 'ft_response_form' );
				if ( isset( $terms[0] ) ) {
					$term_id = $terms[0]->name;
					echo get_the_title( $term_id );
				}
				break;

			case 'from_name' :
				$from_name = get_post_meta( $post_id, 'ft_name', true );
				echo $from_name;
				break;

			case 'from_email' :
				$from_email = get_post_meta( $post_id, 'ft_email', true );
				echo $from_email;
				break;

			case 'read' :
				$read = get_post_meta( $post_id, 'ft_read', true );
				if ( isset( $read ) && $read == 'read' ) {
				    echo sprintf( '<span class="ft-icon ft-read" title="%s">%s</span>',
				    	__( 'Mark as read', 'formtastic' ),
				    	ft_icon( 'mail-open' )
					);
				    
				} else {
				    echo sprintf( '<span class="ft-icon ft-unread" title="%s" data-id="%s">%s</span>', 
				    	__( 'Unread', 'formtastic' ),
				    	$post_id,
				    	ft_icon( 'mail-close' )
					);
				}
				break;

			case 'resend' :
				$terms = get_the_terms( $post_id, 'ft_response_form' );
				if ( isset( $terms[0] ) ) {
					$form_id = $terms[0]->name;
				}

				echo sprintf( '<a href="#" class="ft-icon ft-resend" title="%s" data-form="%s" data-id="%s">%s</a>', 
					__( 'Resend', 'formtastic' ),
					$form_id,
					$post_id,
					ft_icon( 'redo' )
				);
				break;
		}
	}

	/** 
	 * Response sortable columns
	 * @return void
	 */
	public function response_sortable_columns( $columns ) {
	    $columns['from_name'] = 'ft_name';
	    $columns['from_email'] = 'ft_email';
	 
	    return $columns;
	}

	/** 
	 * Response orderby
	 * @return void
	 */
	public function response_orderby( $query ) {
	    if ( ! is_admin() ) {
	        return;
	    }
	 
	    $orderby = $query->get( 'orderby' );
	 
	    if ( 'ft_name' == $orderby ) {
	        $query->set( 'meta_key', 'ft_name' );
	        $query->set( 'orderby', 'meta_value' );

	    }

	    if ( 'ft_email' == $orderby ) {
	        $query->set( 'meta_key', 'ft_email' );
	        $query->set( 'orderby', 'meta_value' );
	    }
	}

	/** 
	 * Response readed
	 * @return void
	 */
	public function response_readed() {
		if ( ! is_admin() ) {
			return;
		}

		if ( get_post_type() !== 'ft_response' ) {
			return;
		}

		if ( isset( $_GET['read'] ) ) {
			$post_id = $_GET['read'];
		}
	}
	
}

new FT_Post_types();
