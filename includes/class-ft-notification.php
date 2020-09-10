<?php
/**
 * Notification
 *
 * @author  Sébastien Gagné
 * @package Formtastic/Classes
 * @version 2.6.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * FT_Notification class
 */
class FT_Notification {

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'menu' ) );
		add_action( 'admin_bar_menu', array( $this, 'toolbar' ), 999 );
	}

	/**
	 * Add menu notification
	 */
	public function menu() {
	    global $submenu;

	    $args = array(
    		'meta_query'     => array(
    	        array(
    				'compare' => 'NOT EXISTS',
    				'key'     => 'ft_read',
    				'value'   => '"read"',
    	        )
    	    ),
			'posts_per_page' => -1,
			'post_status'    => 'publish',
			'post_type'      => 'ft_response',
	    );

	    $loop = new WP_Query( $args );

	    $total = $loop->post_count;

	    $m = false;
	    if ( current_user_can( 'update_core' ) ) {
	    	$m = 12;

	    } else if ( current_user_can( 'publish_pages' ) ) {
	    	$m = 0;
	    }

	    if ( $m ) {
	    	$submenu['edit.php?post_type=formtastic'][ $m ][0] .= $total ? ' <span class="update-plugins count-1"><span class="update-count">' . $total . '</span></span>' : '';
	    }
	}

	/**
	* Add toolbar notification
	*/
	public function toolbar( $wp_admin_bar ) {
		$args = array(
			'meta_query'     => array(
		        array(
					'compare' => 'NOT EXISTS',
					'key'     => 'ft_read',
					'value'   => '"read"',
		        )
		    ),
			'posts_per_page' => -1,
			'post_status'    => 'publish',
			'post_type'      => 'ft_response',
		);

		$loop = new WP_Query( $args );

		$total = $loop->post_count;

		if ( $total > 0 ) {
			$wp_admin_bar->remove_node( 'ft-responses' );

			$links = array(
				array(
					'id'     => 'ft-responses',
					'title'  => __( 'Responses', 'formtastic' ) . ' <span class="update-count">' . $total . '</span>',
					'href'   => 'edit.php?post_type=ft_response',
					'parent' => 'formtastic'
				)
			);

			foreach ( $links as $link ) {
				$wp_admin_bar->add_node( $link );
			}
		}
	}

}

new FT_Notification();
