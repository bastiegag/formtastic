<?php
/**
 * Dashboard Widget
 *
 * @author  Sébastien Gagné
 * @package Formtastic/Classes
 * @version 2.2.2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * FT_Dashboard_Widget class
 */
class FT_Dashboard_Widget {

	public function __construct() {
		add_action( 'wp_dashboard_setup', array( $this, 'add_dashboard_widget' ) );
	}

	/**
	 * Add dashboard widget
	 */
	public function add_dashboard_widget() {
		$version = Formtastic::version();

		if ( current_user_can( 'publish_pages' ) ) {
			wp_add_dashboard_widget(
				'formtastic_dashboard_widget',
				sprintf( 'Formtastic %s', $version ),
				array( $this, 'build_dashboard_widget' )
			);
		}
	}

	/**
	 * Build dashboard widget
	 */
	public function build_dashboard_widget() {
	    $args = array(
	    	'meta_query'     => array(
		        array(
					'compare' => 'NOT EXISTS',
					'key'     => 'ft_read',
					'value'   => '"read"',
		        )
		    ),
			'post_status'    => 'publish',
			'post_type'      => 'ft_response',
			'posts_per_page' => -1,
	    );

	    $loop = new WP_Query( $args );

	    $unread = $loop->post_count;

	    if ( ft_is_dev() ) {
			echo sprintf( '<div class="ft-dev"></div><div class="ft-notification">%s %s</div>',
				ft_icon( 'warning' ),
				__( 'Some of your forms recipients are not set or are still in dev.', 'formtastic' )
			);
	    }
       
	    echo '<div class="ft_stats"><span class="stats-icon">' . ft_icon( 'stats' ) . '</span>';

	    $forms = self::stats( 'formtastic' );
	    echo $forms > 0 ? sprintf( _n( 'Form : <strong>%s</strong>', 'Forms : <strong>%s</strong>', $forms, 'formtastic' ), $forms ) : __( 'Form :', 'formtastic' ) . ' <strong>' . $forms . '</strong>';
	    echo '<br />';

	    $response = self::stats( 'ft_response' );
	    echo $response > 0 ? sprintf( _n( 'Response : <strong>%s</strong>', 'Responses : <strong>%s</strong>', $response, 'formtastic' ), $response ) : __( 'Response :', 'formtastic' ) . ' <strong>' . $response . '</strong>';
	    echo '</div>';

	    $title = sprintf( '<span class="inbox-icon%s">%s</span>%s',
	    	$unread == 0 ? '' : ' new',
	    	$unread == 0 ? ft_icon( 'inbox-empty' ) : ft_icon( 'inbox-full' ),
	    	$unread == 0 ? __( 'You have no unread response.', 'formtastic' ) : sprintf( _n( 'You have <strong>%s</strong> unread response.', 'You have <strong>%s</strong> unread responses.', $unread, 'formtastic' ), $unread )
	    );

	    echo sprintf( '<div class="ft_header">%s</div>',
	    	$title
	    );

	    $args = array(
    		'meta_query'     => array(
    	        array(
    				'compare' => 'NOT EXISTS',
    				'key'     => 'ft_read',
    				'value'   => '"read"',
    	        )
    	    ),
			'order'          => 'desc',
			'orderby'        => 'date',
			'post_status'    => 'publish',
			'post_type'      => 'ft_response',
			'posts_per_page' => 3,
	    );

	    $loop = new WP_Query( $args );

	    if ( $loop->have_posts() ) :
	    	while ( $loop->have_posts() ) : $loop->the_post();

	    		echo sprintf( '<a href="%s" title="%s - %s" class="ft_response"><span class="email-icon">%s</span>%2$s<br /><span class="date">%s</span></a>',
	    			get_edit_post_link(),
	    			get_the_title(),
	    			get_the_time( 'd M Y' ),
	    			ft_icon( 'email' ),
	    			get_the_time( 'j F Y' )
	    		);

	    	endwhile;
	    endif;

	    echo $response > 0 ? sprintf( '<div class="ft_footer"><a href="%s" class="button button-primary">%s</a></div>',
	    	admin_url( 'edit.php?post_type=ft_response' ),
	    	__( 'View all responses', 'formtastic' )
	    ) : '';
	}

	/** 
	 * Stats
	 * @param  string $post_type Post type name
	 * @return int Number of post
	 */
	public function stats( $post_type ) {
	    $args = array(
			'post_status'    => 'publish',
			'post_type'      => $post_type,
			'posts_per_page' => -1,
	    );

	    $loop = new WP_Query( $args );
	    
	    $total = $loop->post_count;

	    return $total;
	}

}

new FT_Dashboard_Widget();
