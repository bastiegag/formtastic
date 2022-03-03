<?php
/**
 * Form view: Builder
 *
 * @author  Sébastien Gagné
 * @package Formtastic/Views
 * @version 2.0.0
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<div class="ft-builder ft-sortable">
	<?php
		$formtastic = get_post_meta( $post->ID, 'formtastic', true );

		if ( isset( $formtastic['fields'] ) ) :
			$fields = $formtastic['fields'];
			$hidden = array();

			foreach ( $fields as $key => $field ) {
				$data = json_decode( $field );
				$children = array();

				foreach ( $data as $key => $value ) {
					if ( $value->name == 'type' ) {
						$type = esc_attr( $value->value );
					}

					if ( $value->name == 'id' ) {
						$field_id = esc_html( $value->value );
					}

					if ( $value->name == 'fields' ) {
						$arr = explode( ',', wp_kses_post( $value->value ) );

						foreach ( $arr as $value ) {
							$hidden[] = $value;
							$children[ $value ] = json_decode( $fields[ $value ] );
						}
					}
				}

				if ( ! in_array( $field_id, $hidden ) ) {
					echo ft_render_field( $type, $field, $field_id, $children );
				}
			}

		endif;
	?>
</div>
