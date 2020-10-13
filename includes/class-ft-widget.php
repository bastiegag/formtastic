<?php
/**
 * Dashboard Widget
 *
 * @author  Sébastien Gagné
 * @package Formtastic/Classes
 * @version 2.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

add_action( 'widgets_init', 'formtastic_load_widget' );

function formtastic_load_widget() {
	register_widget( 'ft_form_widget' );
}

/**
 * FT_Form_Widget class
 */
class FT_Form_Widget extends WP_Widget {

	/**
	 * Widget
	 */
	function __construct() {
		parent::__construct(
			'ft_form_widget', 
			__( 'Formtastic', 'formtastic' ), 
			array( 
				'description' => __( 'Display a form', 'formtastic' ), 
			) 
		);
	}

	public function widget( $args, $instance ) {
		$title = apply_filters( 'widget_title', $instance['title'] );
		$text  = apply_filters( 'widget_text', $instance['text'] );
		$form  = $instance['form'];

		echo $args['before_widget'];
		
		if ( ! empty( $title ) ) {
			echo $args['before_title'] . $title . $args['after_title'];
		}

		if ( ! empty( $text ) ) {
			echo '<p>' . $text . '</p>';
		}

		echo do_shortcode( '[formtastic id="' . $form . '"]' );

		echo $args['after_widget'];
	}
		
	public function form( $instance ) {
		$title = isset( $instance['title'] ) ? $instance['title'] : '';
		$text  = isset( $instance['text'] ) ? $instance['text'] : '';
		$form  = isset( $instance['form'] ) ? $instance['form'] : '';

		echo sprintf( '<p><label for="%s">%s</label><input class="widefat" id="%1$s" name="%s" type="text" value="%s" /></p>',
			$this->get_field_id( 'title' ),
			__( 'Title', 'formtastic' ) . ' :',
			$this->get_field_name( 'title' ),
			esc_attr( $title )
		);


		echo sprintf( '<p><label for="%s">%s</label><input class="widefat" id="%1$s" name="%s" type="text" value="%s" /></p>',
			$this->get_field_id( 'text' ),
			__( 'Text', 'formtastic' ) . ' :',
			$this->get_field_name( 'text' ),
			esc_attr( $text )
		);

		$args = array(
			'post_type'   => 'formtastic',
			'post_status' => 'publish',
			'order'       => 'asc',
			'orderby'     => 'name'
		);
		$loop = new WP_Query( $args );

		if ( $loop->have_posts() ) : 
			echo sprintf( '<p><label for="%s">%s</label><select id="%1$s" name="%s" class="widefat">',
				$this->get_field_id( 'form' ),
				__( 'Form', 'formtastic' ) . ' :',
				$this->get_field_name( 'form' )
			);

			while( $loop->have_posts() ) : $loop->the_post();

				echo sprintf( '<option value="%s" %s>%s</option>',
					get_the_ID(),
					selected( $form, get_the_ID(), false ),
					get_the_title( get_the_ID() )
				);

			endwhile;

			echo '</select></p>';
		else :

		endif;
		wp_reset_postdata();

	}
			
	public function update( $new_instance, $old_instance ) {
		$instance          = array();
		$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
		$instance['text']  = ( ! empty( $new_instance['text'] ) ) ? strip_tags( $new_instance['text'] ) : '';
		$instance['form']  = ( ! empty( $new_instance['form'] ) ) ? strip_tags( $new_instance['form'] ) : '';

		return $instance;
	}

}
